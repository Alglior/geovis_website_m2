// Image Viewer Component with Navigation
const ImageViewer = ({ images, map, onClose }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!images || images.length === 0) return null;

    // Mode interactive: multiples images avec navigation
    const isInteractiveMode = map && map.mode === 'interactive' && images.length > 1;

    // Fonction helper pour extraire l'URL et le titre
    const getImageUrl = (img) => typeof img === 'string' ? img : img.url;
    const getImageTitle = (img, index) => typeof img === 'string' ? null : img.title;

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

    const currentImage = images[currentIndex];
    const currentUrl = getImageUrl(currentImage);
    const currentTitle = getImageTitle(currentImage, currentIndex);

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
                key: 'main-image'
            }, [
                isInteractiveMode && currentTitle ? React.createElement('div', {
                    className: 'image-figure-title',
                    key: 'figure-title'
                }, `Figure ${currentIndex + 1} : ${currentTitle}`) : null,
                React.createElement('img', {
                    src: currentUrl,
                    alt: currentTitle || `Image ${currentIndex + 1}`,
                    className: `viewer-image ${isInteractiveMode ? 'mode-interactive' : 'mode-2d'}`,
                    key: 'current-image'
                }),

                isInteractiveMode && images.length > 1 ? React.createElement('button', {
                    className: 'viewer-nav viewer-prev',
                    onClick: handlePrev,
                    key: 'prev-btn',
                    title: 'Image précédente (←)'
                }, '❮') : null,

                isInteractiveMode && images.length > 1 ? React.createElement('button', {
                    className: 'viewer-nav viewer-next',
                    onClick: handleNext,
                    key: 'next-btn',
                    title: 'Image suivante (→)'
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
                }, images.map((img, index) =>
                    React.createElement('img', {
                        src: getImageUrl(img),
                        alt: getImageTitle(img, index) || `Thumbnail ${index + 1}`,
                        className: `viewer-thumbnail ${index === currentIndex ? 'viewer-thumbnail-active' : ''}`,
                        onClick: () => setCurrentIndex(index),
                        key: `thumb-${index}`,
                        title: getImageTitle(img, index) || `Image ${index + 1}`
                    })
                )) : null
            ]) : null
        ])
    ]);
};
