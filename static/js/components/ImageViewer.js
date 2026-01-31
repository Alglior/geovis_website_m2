// Image Viewer Component with Navigation (supports images and videos)
const ImageViewer = ({ images, map, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
    const [videoThumbnails, setVideoThumbnails] = React.useState({});
    const [zoomLevel, setZoomLevel] = React.useState(1);
    const [isDragging, setIsDragging] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

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
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const newZoom = Math.max(prev - 0.25, 1);
            if (newZoom === 1) {
                setPosition({ x: 0, y: 0 });
            }
            return newZoom;
        });
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') onClose();
        if (e.key === '+' || e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
        if (e.key === '0') handleResetZoom();
    };

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, zoomLevel, position, dragStart]);

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
            const mediaStyle = {
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
            };
            
            return React.createElement('img', {
                src: currentUrl,
                alt: currentTitle || `Média ${currentIndex + 1}`,
                className: `viewer-image ${isInteractiveMode ? 'mode-interactive' : 'mode-2d'}`,
                key: 'current-image',
                style: mediaStyle,
                onMouseDown: handleMouseDown,
                draggable: false
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

            !isVideo ? React.createElement('div', {
                className: 'viewer-zoom-controls',
                key: 'zoom-controls'
            }, [
                React.createElement('button', {
                    className: 'zoom-btn',
                    onClick: handleZoomIn,
                    key: 'zoom-in',
                    title: 'Zoomer (+)',
                    disabled: zoomLevel >= 3
                }, '+'),
                React.createElement('span', {
                    className: 'zoom-level',
                    key: 'zoom-level'
                }, `${Math.round(zoomLevel * 100)}%`),
                React.createElement('button', {
                    className: 'zoom-btn',
                    onClick: handleZoomOut,
                    key: 'zoom-out',
                    title: 'Dézoomer (-)',
                    disabled: zoomLevel <= 1
                }, '−'),
                zoomLevel > 1 ? React.createElement('button', {
                    className: 'zoom-btn zoom-reset',
                    onClick: handleResetZoom,
                    key: 'zoom-reset',
                    title: 'Réinitialiser (0)'
                }, '⟲') : null
            ]) : null,

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
