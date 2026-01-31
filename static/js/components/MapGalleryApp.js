// Main App Component
const MapGalleryApp = () => {
    const [maps, setMaps] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [stats, setStats] = React.useState({});
    const [selectedCategory, setSelectedCategory] = React.useState('Toutes');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedMap, setSelectedMap] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const openModal = (map) => {
        setSelectedMap(map);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMap(null);
        document.body.style.overflow = 'auto';
    };

    // Fetch data on component mount
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [mapsResponse, categoriesResponse, statsResponse] = await Promise.all([
                    fetch('/api/maps'),
                    fetch('/api/categories'),
                    fetch('/api/stats')
                ]);

                const mapsData = await mapsResponse.json();
                const categoriesData = await categoriesResponse.json();
                const statsData = await statsResponse.json();

                setMaps(mapsData.maps);
                setCategories(categoriesData);
                setStats(statsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter maps based on category and search
    const filteredMaps = React.useMemo(() => {
        return maps.filter(map => {
            const matchesCategory = selectedCategory === 'Toutes' || map.category === selectedCategory;
            const matchesSearch = map.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                map.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                map.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [maps, selectedCategory, searchTerm]);

    // Calculate global averages for Maceachren cube
    const globalMaceachren = React.useMemo(() => {
        if (filteredMaps.length === 0) {
            return { communication: 50, task: 50, interaction: 50 };
        }
        
        const mapsWithData = filteredMaps.filter(map => map.maceachren);
        if (mapsWithData.length === 0) {
            return { communication: 50, task: 50, interaction: 50 };
        }

        const sum = mapsWithData.reduce(
            (acc, map) => ({
                communication: acc.communication + (map.maceachren.communication || 50),
                task: acc.task + (map.maceachren.task || 50),
                interaction: acc.interaction + (map.maceachren.interaction || 50)
            }),
            { communication: 0, task: 0, interaction: 0 }
        );

        return {
            communication: Math.round(sum.communication / mapsWithData.length),
            task: Math.round(sum.task / mapsWithData.length),
            interaction: Math.round(sum.interaction / mapsWithData.length)
        };
    }, [filteredMaps]);

    if (loading) {
        return React.createElement('div', {
            className: 'loading-container'
        }, [
            React.createElement('div', { className: 'loading-spinner', key: 'spinner' }),
            React.createElement('p', { key: 'text' }, 'Chargement des cartes...')
        ]);
    }

    if (error) {
        return React.createElement('div', {
            className: 'error-container'
        }, React.createElement('p', null, 'Erreur lors du chargement des données'));
    }

    return React.createElement('div', {
        className: 'map-gallery-app'
    }, [
        React.createElement('section', {
            className: 'gallery-controls',
            key: 'controls'
        }, [
            React.createElement(SearchBar, {
                searchTerm: searchTerm,
                onSearchChange: setSearchTerm,
                key: 'search'
            }),
            React.createElement('div', {
                className: 'controls-grid',
                key: 'grid'
            }, [
                React.createElement(CategoryFilter, {
                    categories: categories,
                    selectedCategory: selectedCategory,
                    onCategoryChange: setSelectedCategory,
                    key: 'filter'
                })
            ])
        ]),
        React.createElement('section', {
            className: 'maps-grid',
            key: 'maps'
        }, [
            React.createElement('h2', { key: 'title' }, 
                `${filteredMaps.length} Carte${filteredMaps.length !== 1 ? 's' : ''} Trouvée${filteredMaps.length !== 1 ? 's' : ''}`
            ),
            React.createElement('div', {
                className: 'grid-container',
                key: 'container'
            }, filteredMaps.map(map => React.createElement(MapCard, { 
                map: map, 
                onOpenModal: openModal,
                key: map.id 
            })))
        ]),
        React.createElement('section', {
            id: 'global-cube-section',
            className: 'global-cube-section',
            key: 'global-cube'
        }, React.createElement(GlobalCube, { 
            config: globalMaceachren,
            key: 'global-cube-component'
        })),
        selectedMap ? React.createElement(MapModal, {
            map: selectedMap,
            isOpen: isModalOpen,
            onClose: closeModal,
            key: 'modal'
        }) : null
    ]);
};
