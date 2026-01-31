// Modal Component
const MapModal = ({ map, isOpen, onClose }) => {
    const [viewerOpen, setViewerOpen] = React.useState(false);
    const [showFirstTimeMessage, setShowFirstTimeMessage] = React.useState(false);
    
    React.useEffect(() => {
        if (isOpen) {
            const hasSeenMessage = localStorage.getItem('hasSeenImageViewerMessage');
            if (!hasSeenMessage && map.images && map.images.length > 0) {
                setShowFirstTimeMessage(true);
            }
        }
    }, [isOpen, map.images]);

    const handleDontRemindAgain = () => {
        localStorage.setItem('hasSeenImageViewerMessage', 'true');
        setShowFirstTimeMessage(false);
    };
    
    if (!isOpen) return null;

    const handleImageClick = () => {
        if (map.images && map.images.length > 0) {
            setViewerOpen(true);
        }
    };

    return React.createElement('div', {
        className: 'modal-backdrop',
        onClick: onClose,
        key: 'backdrop'
    }, [
        showFirstTimeMessage ? React.createElement('div', {
            className: 'first-time-message',
            onClick: () => setShowFirstTimeMessage(false),
            key: 'first-time-message'
        }, [
            React.createElement('div', {
                className: 'first-time-message-content',
                onClick: (e) => e.stopPropagation(),
                key: 'message-content'
            }, [
                React.createElement('button', {
                    className: 'message-close',
                    onClick: () => setShowFirstTimeMessage(false),
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
                        onClick: () => setShowFirstTimeMessage(false),
                        key: 'ok-btn'
                    }, 'D\'accord'),
                    React.createElement('button', {
                        className: 'message-btn message-btn-secondary',
                        onClick: handleDontRemindAgain,
                        key: 'dont-remind-btn'
                    }, 'Ne plus me le rappeler')
                ])
            ])
        ]) : null,
        viewerOpen ? React.createElement(ImageViewer, {
            images: map.images,
            onClose: () => setViewerOpen(false),
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
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return React.createElement('img', {
                            src: imgUrl,
                            alt: `${map.title} - Image ${index + 1}`,
                            className: 'gallery-image',
                            onClick: handleImageClick,
                            key: `gallery-img-${index}`,
                            title: 'Cliquer pour agrandir'
                        });
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
