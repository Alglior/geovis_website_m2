// Map Card Component
const MapCard = ({ map, onOpenModal }) => {
    // Fonction pour tronquer la description
    const truncateDescription = (desc, maxLength = 80) => {
        // Si c'est un array, prendre le premier élément
        const text = Array.isArray(desc) ? desc[0] : desc;
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    return React.createElement('div', {
        className: 'map-card glass-effect',
        key: map.id
    }, [
        React.createElement('div', {
            className: 'map-image',
            key: 'image'
        }, [
            React.createElement('img', {
                src: map.preview || '/static/images/default-map.svg',
                alt: map.title,
                loading: 'lazy',
                key: 'img'
            }),
            React.createElement('div', {
                className: 'map-overlay',
                key: 'overlay'
            }, [
                React.createElement('span', {
                    className: 'difficulty-badge',
                    key: 'difficulty'
                }, map.difficulty)
            ])
        ]),
        React.createElement('div', {
            className: 'map-content',
            key: 'content'
        }, [
            React.createElement('h3', { key: 'title' }, map.title),
            React.createElement('p', { 
                key: 'description',
                className: 'map-card-description'
            }, truncateDescription(map.description)),
            React.createElement('div', {
                className: 'map-tags',
                key: 'tags'
            }, map.tags.map((tag, index) => 
                React.createElement('span', {
                    className: 'tag',
                    key: index
                }, tag)
            )),
            React.createElement('div', {
                className: 'map-actions',
                key: 'actions'
            }, [
                React.createElement('button', {
                    className: 'btn-primary',
                    onClick: () => window.open(map.url, '_blank'),
                    key: 'view'
                }, 'Voir la Carte'),
                React.createElement('button', {
                    className: 'btn-secondary',
                    onClick: () => onOpenModal(map),
                    key: 'info'
                }, 'Plus d\'Infos')
            ])
        ])
    ]);
};
