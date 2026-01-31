// Category Filter Component
const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
    return React.createElement('div', {
        className: 'category-filter'
    }, [
        React.createElement('h3', { key: 'title' }, 'Catégories'),
        React.createElement('div', {
            className: 'filter-buttons',
            key: 'buttons'
        }, categories.map(category => 
            React.createElement('button', {
                className: `filter-btn ${selectedCategory === category ? 'active' : ''}`,
                onClick: () => onCategoryChange(category),
                key: category
            }, category)
        ))
    ]);
};
