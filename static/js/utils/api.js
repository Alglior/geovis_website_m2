// API and data fetching utilities
async function fetchMapData() {
    try {
        const [mapsResponse, categoriesResponse, statsResponse] = await Promise.all([
            fetch('/api/maps'),
            fetch('/api/categories'),
            fetch('/api/stats')
        ]);

        const mapsData = await mapsResponse.json();
        const categoriesData = await categoriesResponse.json();
        const statsData = await statsResponse.json();

        return { maps: mapsData.maps, categories: categoriesData, stats: statsData };
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err;
    }
}

async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
    }
}

async function submitContact(formData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        throw error;
    }
}
