from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Sample maps data (in production, this would come from a database)
MAPS_DATA = [
    {
        "id": "leaflet-choropleth",
        "title": "Interactive Choropleth Visualization",
        "description": "A stunning choropleth map showcasing population density with interactive hover effects, custom styling, and real-time data updates.",
        "url": "https://leafletjs.com/examples/choropleth/",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
        "category": "Statistical Analysis",
        "technologies": ["Leaflet", "JavaScript", "GeoJSON", "D3.js"],
        "featured": True,
        "dateAdded": "2024-01-15",
        "views": 2847,
        "rating": 4.8,
        "complexity": "Intermediate"
    },
    {
        "id": "mapbox-3d-buildings",
        "title": "3D Urban Architecture Explorer",
        "description": "Immersive 3D building visualizations with realistic shadow casting, dynamic lighting effects, and smooth camera transitions through urban landscapes.",
        "url": "https://docs.mapbox.com/mapbox-gl-js/example/3d-buildings/",
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&crop=center",
        "category": "3D Visualization",
        "technologies": ["Mapbox GL JS", "WebGL", "Vector Tiles", "3D Rendering"],
        "featured": True,
        "dateAdded": "2024-01-20",
        "views": 3921,
        "rating": 4.9,
        "complexity": "Advanced"
    },
    {
        "id": "openlayers-heatmap",
        "title": "Dynamic Earthquake Heatmap",
        "description": "Real-time seismic activity visualization with temporal animation controls, customizable intensity gradients, and interactive data filtering.",
        "url": "https://openlayers.org/en/latest/examples/heatmap-earthquakes.html",
        "image": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop&crop=center",
        "category": "Real-time Analysis",
        "technologies": ["OpenLayers", "Canvas Rendering", "WebGL", "Time Series"],
        "featured": False,
        "dateAdded": "2024-01-25",
        "views": 1573,
        "rating": 4.5,
        "complexity": "Intermediate"
    },
    {
        "id": "cesium-terrain",
        "title": "Global Terrain & Satellite Explorer",
        "description": "Photorealistic 3D globe with high-resolution terrain data, real-time satellite imagery, and immersive navigation through Earth's landscapes.",
        "url": "https://sandcastle.cesium.com/index.html?src=Terrain.html",
        "image": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&h=400&fit=crop&crop=center",
        "category": "3D Globe",
        "technologies": ["Cesium", "WebGL", "Terrain Data", "Satellite Imagery"],
        "featured": True,
        "dateAdded": "2024-02-01",
        "views": 4205,
        "rating": 4.9,
        "complexity": "Advanced"
    },
    {
        "id": "deck-gl-trips",
        "title": "Animated Transportation Networks",
        "description": "Mesmerizing visualization of global transportation flows with arc animations, particle systems, and time-based data storytelling.",
        "url": "https://deck.gl/examples/trips-layer/",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=center",
        "category": "Transportation",
        "technologies": ["Deck.gl", "WebGL", "React", "Data Animation"],
        "featured": True,
        "dateAdded": "2024-02-05",
        "views": 2934,
        "rating": 4.7,
        "complexity": "Advanced"
    },
    {
        "id": "webgl-wind-map",
        "title": "Global Wind Flow Simulation",
        "description": "Breathtaking real-time wind flow patterns with particle physics, dynamic weather visualization, and interactive atmospheric data.",
        "url": "https://earth.nullschool.net/",
        "image": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop&crop=center",
        "category": "Weather Systems",
        "technologies": ["WebGL", "Particle Physics", "Real-time Data", "Atmospheric Modeling"],
        "featured": True,
        "dateAdded": "2024-02-15",
        "views": 5847,
        "rating": 4.8,
        "complexity": "Expert"
    },
    {
        "id": "arcgis-dashboard",
        "title": "Smart City Analytics Dashboard",
        "description": "Comprehensive urban analytics platform with real-time data streams, predictive modeling, and interactive visualization components.",
        "url": "https://developers.arcgis.com/javascript/latest/sample-code/widgets-layerlist/",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
        "category": "Urban Analytics",
        "technologies": ["ArcGIS API", "Machine Learning", "IoT Integration", "Dashboard"],
        "featured": False,
        "dateAdded": "2024-02-20",
        "views": 1892,
        "rating": 4.4,
        "complexity": "Advanced"
    },
    {
        "id": "threejs-globe",
        "title": "Interactive Planetary Explorer",
        "description": "Custom 3D planetary visualization with atmospheric effects, orbital mechanics, and detailed surface mapping using advanced shaders.",
        "url": "https://threejs.org/examples/#webgl_earth",
        "image": "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&h=400&fit=crop&crop=center",
        "category": "3D Globe",
        "technologies": ["Three.js", "Custom Shaders", "3D Physics", "Atmospheric Rendering"],
        "featured": True,
        "dateAdded": "2024-02-25",
        "views": 3764,
        "rating": 4.9,
        "complexity": "Expert"
    },
    {
        "id": "kepler-gl-demo",
        "title": "Big Data Geospatial Analytics",
        "description": "Large-scale geospatial data processing with machine learning integration, temporal analysis, and interactive visual exploration.",
        "url": "https://kepler.gl/demo",
        "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
        "category": "Big Data Analytics",
        "technologies": ["Kepler.gl", "WebGL", "Machine Learning", "GPU Computing"],
        "featured": True,
        "dateAdded": "2024-03-05",
        "views": 4521,
        "rating": 4.6,
        "complexity": "Expert"
    },
    {
        "id": "mapbox-clustering",
        "title": "Smart Point Clustering Engine",
        "description": "Advanced clustering algorithms with dynamic aggregation, hierarchical visualization, and performance-optimized rendering for millions of points.",
        "url": "https://docs.mapbox.com/mapbox-gl-js/example/cluster/",
        "image": "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&h=400&fit=crop&crop=center",
        "category": "Data Visualization",
        "technologies": ["Mapbox GL JS", "Clustering Algorithms", "Performance Optimization", "WebWorkers"],
        "featured": False,
        "dateAdded": "2024-04-01",
        "views": 2156,
        "rating": 4.3,
        "complexity": "Intermediate"
    }
]

CATEGORIES = [
    "All Categories",
    "Statistical Analysis",
    "3D Visualization", 
    "Real-time Analysis",
    "3D Globe",
    "Transportation",
    "Weather Systems",
    "Urban Analytics",
    "Big Data Analytics",
    "Data Visualization"
]

@app.route('/')
def index():
    """Main application route"""
    try:
        import json
        import os
        
        json_path = os.path.join(app.static_folder, 'data', 'maps.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        maps_data = data['maps']
        categories_data = data['categories']
        
        total_maps = len(maps_data)
        total_categories = len(categories_data)
        total_views = sum(m['views'] for m in maps_data)
        avg_rating = sum(m['rating'] for m in maps_data) / total_maps if total_maps > 0 else 0
        
        stats = {
            'total_maps': total_maps,
            'total_categories': total_categories,
            'total_views': total_views,
            'average_rating': round(avg_rating, 1)
        }
        
        return render_template('home.html', stats=stats)
    except Exception as e:
        print(f"Error loading stats: {e}")
        # Fallback to default values
        stats = {
            'total_maps': 0,
            'total_categories': 0,
            'total_views': 0,
            'average_rating': 0.0
        }
        return render_template('home.html', stats=stats)

@app.route('/api/maps')
def get_maps():
    """API endpoint to get all maps with filtering and pagination"""
    try:
        # Charger les données depuis le fichier JSON
        import json
        import os
        
        json_path = os.path.join(app.static_folder, 'data', 'maps.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        maps_data = data['maps']
        
        # Map thumbnail to preview for frontend compatibility
        for map_item in maps_data:
            map_item['preview'] = map_item.get('thumbnail', '/static/images/default-map.svg')
        
        # Get query parameters
        category = request.args.get('category', 'Toutes')
        search = request.args.get('search', '')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))  # Increased default to show all maps
        
        # Filter maps based on mode and search
        filtered_maps = maps_data
        
        if category != 'Toutes':
            filtered_maps = [m for m in filtered_maps if m['mode'] == category]
        
        if search:
            search_lower = search.lower()
            filtered_maps = [m for m in filtered_maps if 
                            search_lower in m['title'].lower() or 
                            search_lower in m['description'].lower() or
                            any(search_lower in tag.lower() for tag in m['tags'])]
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated_maps = filtered_maps[start:end]
        
        return jsonify({
            'maps': paginated_maps,
            'total': len(filtered_maps),
            'page': page,
            'per_page': per_page,
            'pages': (len(filtered_maps) + per_page - 1) // per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories')
def get_categories():
    """API endpoint to get all modes (2D and Interactive)"""
    try:
        # Return modes instead of thematic categories
        modes = ['Toutes', '2d', 'interactive']
        return jsonify(modes)
    except Exception as e:
        return jsonify(['Toutes'])

@app.route('/api/maps/<map_id>')
def get_map(map_id):
    """API endpoint to get a specific map by ID"""
    map_data = next((m for m in MAPS_DATA if m['id'] == map_id), None)
    if map_data:
        return jsonify(map_data)
    return jsonify({'error': 'Map not found'}), 404

@app.route('/api/maps/<map_id>/view', methods=['POST'])
def increment_view(map_id):
    """API endpoint to increment view count for a map"""
    try:
        import json
        import os
        
        json_path = os.path.join(app.static_folder, 'data', 'maps.json')
        
        # Load current data
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Find and update the map
        map_found = False
        for map_item in data['maps']:
            if str(map_item['id']) == str(map_id):
                map_item['views'] += 1
                map_found = True
                new_views = map_item['views']
                break
        
        if not map_found:
            return jsonify({'error': 'Map not found'}), 404
        
        # Save updated data back to file
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return jsonify({'views': new_views})
        
    except Exception as e:
        print(f"Error incrementing view for map {map_id}: {e}")
        return jsonify({'error': 'Failed to update view count'}), 500

@app.route('/api/stats')
def get_stats():
    """API endpoint to get gallery statistics"""
    try:
        # Load data from JSON file like the maps API
        import json
        import os
        
        json_path = os.path.join(app.static_folder, 'data', 'maps.json')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        maps_data = data['maps']
        categories_data = data['categories']
        
        total_maps = len(maps_data)
        total_categories = len(categories_data)
        total_views = sum(m['views'] for m in maps_data)
        avg_rating = sum(m['rating'] for m in maps_data) / total_maps if total_maps > 0 else 0
        
        # Technology distribution (if available)
        tech_count = {}
        for map_data in maps_data:
            technologies = map_data.get('technologies', [])
            for tech in technologies:
                tech_count[tech] = tech_count.get(tech, 0) + 1
        
        # Category distribution
        category_count = {}
        for map_data in maps_data:
            category = map_data['category']
            category_count[category] = category_count.get(category, 0) + 1
        
        return jsonify({
            'total_maps': total_maps,
            'total_categories': total_categories,
            'total_views': total_views,
            'average_rating': round(avg_rating, 1),
            'technology_distribution': tech_count,
            'category_distribution': category_count
        })
    except Exception as e:
        # Fallback to hardcoded data if JSON loading fails
        total_maps = len(MAPS_DATA)
        total_views = sum(m['views'] for m in MAPS_DATA)
        avg_rating = sum(m['rating'] for m in MAPS_DATA) / total_maps if total_maps > 0 else 0
        
        return jsonify({
            'total_maps': total_maps,
            'total_views': total_views,
            'average_rating': round(avg_rating, 1),
            'error': str(e)
        })

@app.route('/api/contact', methods=['POST'])
def submit_contact_form():
    """API endpoint to handle contact form submissions"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Le champ {field} est requis'}), 400
        
        # Save contact message to file (in production, you'd send an email)
        import json
        import os
        from datetime import datetime
        
        contact_data = {
            'timestamp': datetime.now().isoformat(),
            'name': data['name'],
            'email': data['email'],
            'subject': data['subject'],
            'message': data['message']
        }
        
        # Create contact messages directory if it doesn't exist
        contact_dir = os.path.join(app.static_folder, 'data', 'contacts')
        os.makedirs(contact_dir, exist_ok=True)
        
        # Save to JSON file
        contact_file = os.path.join(contact_dir, f"contact_{int(datetime.now().timestamp())}.json")
        with open(contact_file, 'w', encoding='utf-8') as f:
            json.dump(contact_data, f, ensure_ascii=False, indent=2)
        
        # In a real application, you would send an email here
        # For now, we'll just log it
        print(f"Nouveau message de contact reçu de {data['name']} ({data['email']})")
        
        return jsonify({
            'success': True,
            'message': 'Votre message a été envoyé avec succès !'
        })
        
    except Exception as e:
        print(f"Erreur lors du traitement du formulaire de contact: {e}")
        return jsonify({'error': 'Une erreur est survenue lors de l\'envoi du message'}), 500

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8083)