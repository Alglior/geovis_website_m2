// Modal Component
const MapModal = ({ map, isOpen, onClose }) => {
    const [viewerOpen, setViewerOpen] = React.useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [showFirstTimeMessage2D, setShowFirstTimeMessage2D] = React.useState(false);
    const [showFirstTimeMessageInteractive, setShowFirstTimeMessageInteractive] = React.useState(false);
    
    React.useEffect(() => {
        if (isOpen) {
            if (map.mode === '2d') {
                const hasSeenMessage2D = localStorage.getItem('hasSeenImageViewer2DMessage');
                if (!hasSeenMessage2D) {
                    setShowFirstTimeMessage2D(true);
                }
            } else {
                const hasSeenMessageInteractive = localStorage.getItem('hasSeenImageViewerInteractiveMessage');
                if (!hasSeenMessageInteractive && map.images && map.images.length > 0) {
                    setShowFirstTimeMessageInteractive(true);
                }
            }
        }
    }, [isOpen, map.images, map.mode]);

    const handleDontRemindAgain2D = () => {
        localStorage.setItem('hasSeenImageViewer2DMessage', 'true');
        setShowFirstTimeMessage2D(false);
    };

    const handleDontRemindAgainInteractive = () => {
        localStorage.setItem('hasSeenImageViewerInteractiveMessage', 'true');
        setShowFirstTimeMessageInteractive(false);
    };
    
    if (!isOpen) return null;

    const handleImageClick = (index = 0) => {
        if (map.images && map.images.length > 0) {
            setSelectedImageIndex(index);
            setViewerOpen(true);
        }
    };

    return React.createElement('div', {
        className: 'modal-backdrop',
        onClick: onClose,
        key: 'backdrop'
    }, [
        showFirstTimeMessage2D ? React.createElement('div', {
            className: 'first-time-message',
            onClick: () => setShowFirstTimeMessage2D(false),
            key: 'first-time-message-2d'
        }, [
            React.createElement('div', {
                className: 'first-time-message-content',
                onClick: (e) => e.stopPropagation(),
                key: 'message-content'
            }, [
                React.createElement('button', {
                    className: 'message-close',
                    onClick: () => setShowFirstTimeMessage2D(false),
                    key: 'close-message'
                }, '×'),
                React.createElement('div', {
                    className: 'message-icon',
                    key: 'icon'
                }, '🖼️'),
                React.createElement('h3', {
                    key: 'title'
                }, 'Visualiseur d\'images'),
                React.createElement('p', {
                    key: 'text'
                }, 'Utilisez le bouton "🔍 Agrandir" ci-dessous pour voir la carte en très grand écran !'),
                React.createElement('div', {
                    className: 'message-buttons',
                    key: 'buttons'
                }, [
                    React.createElement('button', {
                        className: 'message-btn message-btn-primary',
                        onClick: () => setShowFirstTimeMessage2D(false),
                        key: 'ok-btn'
                    }, 'D\'accord'),
                    React.createElement('button', {
                        className: 'message-btn message-btn-secondary',
                        onClick: handleDontRemindAgain2D,
                        key: 'dont-remind-btn'
                    }, 'Ne plus me le rappeler')
                ])
            ])
        ]) : null,
        showFirstTimeMessageInteractive ? React.createElement('div', {
            className: 'first-time-message',
            onClick: () => setShowFirstTimeMessageInteractive(false),
            key: 'first-time-message-interactive'
        }, [
            React.createElement('div', {
                className: 'first-time-message-content',
                onClick: (e) => e.stopPropagation(),
                key: 'message-content'
            }, [
                React.createElement('button', {
                    className: 'message-close',
                    onClick: () => setShowFirstTimeMessageInteractive(false),
                    key: 'close-message'
                }, '×'),
                React.createElement('div', {
                    className: 'message-icon',
                    key: 'icon'
                }, '🖼️'),
                React.createElement('h3', {
                    key: 'title'
                }, 'Visualiseur d\'images'),
                React.createElement('p', {
                    key: 'text'
                }, 'Cliquez sur les images dans la galerie pour les agrandir et les parcourir en plein écran !'),
                React.createElement('div', {
                    className: 'message-buttons',
                    key: 'buttons'
                }, [
                    React.createElement('button', {
                        className: 'message-btn message-btn-primary',
                        onClick: () => setShowFirstTimeMessageInteractive(false),
                        key: 'ok-btn'
                    }, 'D\'accord'),
                    React.createElement('button', {
                        className: 'message-btn message-btn-secondary',
                        onClick: handleDontRemindAgainInteractive,
                        key: 'dont-remind-btn'
                    }, 'Ne plus me le rappeler')
                ])
            ])
        ]) : null,
        viewerOpen ? React.createElement(ImageViewer, {
            images: map.mode === '2d' ? [{ url: map.thumbnail, title: map.title }] : map.images,
            map: map,
            onClose: () => setViewerOpen(false),
            initialIndex: selectedImageIndex,
            key: 'image-viewer'
        }) : null,
        React.createElement('div', {
            className: 'modal-content glass-effect',
            onClick: (e) => e.stopPropagation(),
            key: 'content'
        }, [
            React.createElement('button', {
                className: 'modal-close',
                onClick: onClose,
                key: 'close-btn'
            }, '×'),
            React.createElement('div', {
                className: 'modal-header',
                key: 'header'
            }, [
                React.createElement('h2', { key: 'title' }, map.title),
                React.createElement('span', {
                    className: 'difficulty-badge',
                    key: 'difficulty'
                }, map.difficulty)
            ]),
            React.createElement('div', {
                className: 'modal-body',
                key: 'body'
            }, [
                React.createElement('img', {
                    src: map.preview || '/static/images/default-map.svg',
                    alt: map.title,
                    className: 'modal-image',
                    key: 'image'
                }),
                map.mode === '2d' && map.thumbnail ? React.createElement('button', {
                    className: 'btn-enlarge-2d',
                    onClick: () => setViewerOpen(true),
                    key: 'enlarge-btn',
                    title: 'Voir la carte en plus grand'
                }, '🔍 Agrandir') : null,
                map.images && map.images.length > 0 ? React.createElement('div', {
                    key: 'gallery-section'
                }, [
                    React.createElement('h3', { 
                        key: 'gallery-title',
                        className: 'gallery-title'
                    }, 'Galerie'),
                    React.createElement('div', {
                        className: 'modal-gallery',
                        key: 'gallery'
                    }, map.images.map((img, index) => {
                        const mediaUrl = typeof img === 'string' ? img : img.url;
                        const mediaType = typeof img === 'object' && img.type ? img.type : 
                            (mediaUrl.split('.').pop().toLowerCase().match(/mp4|webm|ogg|mov|avi/) ? 'video' : 'image');
                        
                        if (mediaType === 'video') {
                            return React.createElement('div', {
                                className: 'gallery-video-container',
                                onClick: () => handleImageClick(index),
                                key: `gallery-video-${index}`,
                                title: 'Cliquer pour voir la vidéo'
                            }, [
                                React.createElement('video', {
                                    src: mediaUrl,
                                    className: 'gallery-image',
                                    key: 'video-element',
                                    preload: 'metadata'
                                }),
                                React.createElement('div', {
                                    className: 'video-play-overlay',
                                    key: 'play-overlay'
                                }, React.createElement('span', {
                                    className: 'play-icon',
                                    key: 'play-icon'
                                }, '▶'))
                            ]);
                        } else {
                            return React.createElement('img', {
                                src: mediaUrl,
                                alt: `${map.title} - Image ${index + 1}`,
                                className: 'gallery-image',
                                onClick: () => handleImageClick(index),
                                key: `gallery-img-${index}`,
                                title: 'Cliquer pour agrandir'
                            });
                        }
                    }))
                ]) : null,
                React.createElement('div', {
                    className: 'modal-info',
                    key: 'info'
                }, [
                    React.createElement('h3', { key: 'desc-title' }, 'Description'),
                    Array.isArray(map.description)
                        ? map.description.map((paragraph, index) => 
                            React.createElement('p', { 
                                key: `desc-p-${index}`,
                                className: 'description-paragraph'
                            }, paragraph)
                          )
                        : React.createElement('p', { key: 'description' }, map.description),
                    React.createElement('h3', { key: 'cat-title' }, 'Catégorie'),
                    React.createElement('p', { key: 'category' }, map.category),
                    map.auteur ? React.createElement('div', { key: 'auteur-section' }, [
                        React.createElement('h3', { key: 'auteur-title' }, 'Auteur'),
                        React.createElement('p', { key: 'auteur-text', className: 'auteur-text' }, map.auteur)
                    ]) : null,
                    map.sources && map.sources.length > 0 ? React.createElement('div', { key: 'sources-section' }, [
                        React.createElement('h3', { key: 'sources-title' }, 'Sources'),
                        React.createElement('div', { key: 'sources-list', className: 'sources-list' }, 
                            Array.isArray(map.sources)
                                ? map.sources.map((source, index) => 
                                    React.createElement('span', {
                                        key: `source-${index}`,
                                        className: 'source-badge'
                                    }, source)
                                  )
                                : React.createElement('span', { className: 'source-badge' }, map.sources)
                        )
                    ]) : null,
                    map.fonctionalites ? React.createElement('div', { key: 'features-section' }, [
                        React.createElement('h3', { key: 'features-title' }, 'Fonctionnalités'),
                        React.createElement('ul', { key: 'features-list', className: 'features-list' }, 
                            map.fonctionalites.map((feature, index) => 
                                React.createElement('li', {
                                    key: `feature-${index}`,
                                    className: 'feature-item'
                                }, feature)
                            )
                        )
                    ]) : null,
                    map.analyse ? React.createElement('div', { key: 'analysis-section' }, [
                        React.createElement('h3', { key: 'analysis-title' }, 'Analyse'),
                        React.createElement('p', { 
                            key: 'analysis-text',
                            className: 'analysis-paragraph'
                        }, map.analyse)
                    ]) : null,
                    map.avis ? React.createElement('div', { key: 'avis-section' }, [
                        React.createElement('h3', { key: 'avis-title' }, 'Avis'),
                        Array.isArray(map.avis) 
                            ? map.avis.map((paragraph, index) => 
                                React.createElement('p', { 
                                    key: `avis-p-${index}`,
                                    className: 'avis-paragraph'
                                }, paragraph)
                              )
                            : React.createElement('p', { key: 'avis-text' }, map.avis)
                    ]) : null,
                    React.createElement('h3', { key: 'tags-title' }, 'Tags'),
                    React.createElement('div', {
                        className: 'map-tags',
                        key: 'tags'
                    }, map.tags.map((tag, index) => 
                        React.createElement('span', {
                            className: 'tag',
                            key: index
                        }, tag)
                    )),
                    React.createElement(MapCube, { config: map.maceachren, key: 'mapcube' })
                ])
            ]),
            React.createElement('div', {
                className: 'modal-footer',
                key: 'footer'
            }, [
                React.createElement('button', {
                    className: 'btn-primary',
                    onClick: () => window.open(map.url, '_blank'),
                    key: 'view-btn'
                }, 'Voir la Carte'),
                React.createElement('button', {
                    className: 'btn-secondary',
                    onClick: onClose,
                    key: 'close-footer-btn'
                }, 'Fermer')
            ])
        ])
    ]);
};
