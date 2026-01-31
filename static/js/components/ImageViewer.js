// Image Viewer Component with Navigation (supports images and videos)
const ImageViewer = ({ images, map, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [videoThumbnails, setVideoThumbnails] = React.useState({});

    if (!images || images.length === 0) return null;

    // Mode interactive: multiples images avec navigation
    const isInteractiveMode = map && map.mode === 'interactive' && images.length > 1;

    // Fonction helper pour extraire l'URL et le titre
    const getMediaUrl = (img) => typeof img === 'string' ? img : img.url;
    const getMediaTitle = (img, index) => typeof img === 'string' ? null : img.title;
    const getMediaType = (img) => {
        const url = getMediaUrl(img);
        if (typeof img === 'object' && img.type) return img.type;
        const ext = url.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext) ? 'video' : 'image';
    };

    // Extract first frame from video
    const extractVideoThumbnail = React.useCallback((videoUrl) => {
        if (videoThumbnails[videoUrl]) {
            return;
        }

        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        video.src = videoUrl;

        let frameExtracted = false;

        const extractFrame = () => {
            if (!frameExtracted && video.videoWidth && video.videoHeight) {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                const thumbnail = canvas.toDataURL('image/png');
                setVideoThumbnails(prev => ({ ...prev, [videoUrl]: thumbnail }));
                frameExtracted = true;
            }
        };

        const handleLoadedMetadata = () => {
            video.currentTime = 0;
        };

        const handleSeeked = () => {
            extractFrame();
            cleanup();
        };

        const handleCanPlay = () => {
            extractFrame();
        };

        const cleanup = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('seeked', handleSeeked);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', cleanup);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('seeked', handleSeeked);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', cleanup);

        // Timeout fallback
        setTimeout(() => {
            if (!frameExtracted) {
                video.currentTime = 0;
                setTimeout(() => {
                    extractFrame();
                    cleanup();
                }, 100);
            }
        }, 500);
    }, [videoThumbnails]);

    // Extract all video thumbnails on mount
    React.useEffect(() => {
        images.forEach((img) => {
            const type = getMediaType(img);
            if (type === 'video') {
                const url = getMediaUrl(img);
                extractVideoThumbnail(url);
            }
        });
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') onClose();
    };

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const currentMedia = images[currentIndex];
    const currentUrl = getMediaUrl(currentMedia);
    const currentTitle = getMediaTitle(currentMedia, currentIndex);
    const currentType = getMediaType(currentMedia);
    const isVideo = currentType === 'video';

    // Render media element (image or video)
    const renderMedia = () => {
        if (isVideo) {
            return React.createElement('video', {
                src: currentUrl,
                controls: true,
                className: `viewer-video ${isInteractiveMode ? 'mode-interactive' : 'mode-2d'}`,
                key: 'current-video',
                autoPlay: true
            });
        } else {
            return React.createElement('img', {
                src: currentUrl,
                alt: currentTitle || `Média ${currentIndex + 1}`,
                className: `viewer-image ${isInteractiveMode ? 'mode-interactive' : 'mode-2d'}`,
                key: 'current-image'
            });
        }
    };

    // Render thumbnail
    const renderThumbnail = (img, index) => {
        const url = getMediaUrl(img);
        const type = getMediaType(img);
        const title = getMediaTitle(img, index);
        
        if (type === 'video') {
            const thumbnailUrl = videoThumbnails[url];

            return React.createElement('div', {
                className: `viewer-thumbnail-video ${index === currentIndex ? 'viewer-thumbnail-active' : ''}`,
                onClick: () => setCurrentIndex(index),
                key: `thumb-${index}`,
                title: title || `Vidéo ${index + 1}`
            }, [
                React.createElement('img', {
                    src: thumbnailUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    alt: title || `Vidéo ${index + 1}`,
                    className: 'viewer-thumbnail',
                    key: 'video-thumb-img'
                }),
                React.createElement('span', {
                    className: 'video-indicator',
                    key: 'video-indicator'
                }, '▶')
            ]);
        } else {
            return React.createElement('img', {
                src: url,
                alt: title || `Thumbnail ${index + 1}`,
                className: `viewer-thumbnail ${index === currentIndex ? 'viewer-thumbnail-active' : ''}`,
                onClick: () => setCurrentIndex(index),
                key: `thumb-${index}`,
                title: title || `Image ${index + 1}`
            });
        }
    };

    return React.createElement('div', {
        className: 'image-viewer-backdrop',
        onClick: onClose
    }, [
        React.createElement('div', {
            className: 'image-viewer-container',
            onClick: (e) => e.stopPropagation(),
            key: 'viewer-container'
        }, [
            React.createElement('button', {
                className: 'viewer-close',
                onClick: onClose,
                key: 'close-btn',
                title: 'Fermer (Esc)'
            }, '×'),

            React.createElement('div', {
                className: 'image-viewer-main',
                key: 'main-media'
            }, [
                isInteractiveMode && currentTitle ? React.createElement('div', {
                    className: 'image-figure-title',
                    key: 'figure-title'
                }, `${isVideo ? 'Vidéo' : 'Figure'} ${currentIndex + 1} : ${currentTitle}`) : null,
                renderMedia(),

                isInteractiveMode && images.length > 1 ? React.createElement('button', {
                    className: 'viewer-nav viewer-prev',
                    onClick: handlePrev,
                    key: 'prev-btn',
                    title: 'Précédent (←)'
                }, '❮') : null,

                isInteractiveMode && images.length > 1 ? React.createElement('button', {
                    className: 'viewer-nav viewer-next',
                    onClick: handleNext,
                    key: 'next-btn',
                    title: 'Suivant (→)'
                }, '❯') : null
            ]),

            isInteractiveMode ? React.createElement('div', {
                className: 'image-viewer-info',
                key: 'info'
            }, [
                React.createElement('span', {
                    className: 'image-counter',
                    key: 'counter'
                }, `${currentIndex + 1} / ${images.length}`),
                images.length > 1 ? React.createElement('div', {
                    className: 'image-thumbnails',
                    key: 'thumbnails'
                }, images.map((img, index) => renderThumbnail(img, index))) : null
            ]) : null
        ])
    ]);
};
