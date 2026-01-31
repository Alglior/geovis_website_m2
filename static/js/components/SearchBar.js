// Search Component
const SearchBar = ({ searchTerm, onSearchChange }) => {
    return React.createElement('div', {
        className: 'search-container'
    }, [
        React.createElement('input', {
            type: 'text',
            placeholder: 'Rechercher des cartes...',
            value: searchTerm,
            onChange: (e) => onSearchChange(e.target.value),
            className: 'search-input',
            key: 'input'
        }),
        React.createElement('div', {
            className: 'search-icon',
            key: 'icon'
        }, '🔍')
    ]);
};
