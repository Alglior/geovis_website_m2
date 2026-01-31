// React Components and Main App

// MacEachren Cube Component - 3D Three.js version
const MaceachrenCube = ({ config }) => {
    const containerRef = React.useRef(null);
    const requestRef = React.useRef(null);
    const rendererRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    const defaults = { communication: 50, task: 50, interaction: 50 };
    const data = { ...defaults, ...(config || {}) };

    const clamp = (v) => Math.max(0, Math.min(100, Number(v) || 0));
    const toUnit = (v) => (clamp(v) - 50) / 50; // map 0-100 to -1..1

    React.useEffect(() => {
        const THREE = window.THREE;
        if (!THREE || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 320;
        const height = containerRef.current.clientHeight || 260;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(4, 3, 4);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Cube edges and faces
        const cubeSize = 2;
        const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize));
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 });
        const cubeEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        scene.add(cubeEdges);

        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1e293b,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide
        });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), cubeMaterial);
        scene.add(cube);

        // Axes
        const addAxis = (from, to, color) => {
            const geom = new THREE.BufferGeometry().setFromPoints([from, to]);
            const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, linewidth: 3 }));
            scene.add(line);
        };

        addAxis(new THREE.Vector3(-1.5, -1, -1), new THREE.Vector3(1.5, -1, -1), 0xef4444); // X - interaction
        addAxis(new THREE.Vector3(-1, -1.5, -1), new THREE.Vector3(-1, 1.5, -1), 0x10b981); // Y - communication/public
        addAxis(new THREE.Vector3(-1, -1, -1.5), new THREE.Vector3(-1, -1, 1.5), 0x8b5cf6); // Z - task

        const markerGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const addMarker = (pos, color) => {
            const sphere = new THREE.Mesh(markerGeom, new THREE.MeshBasicMaterial({ color }));
            sphere.position.set(pos[0], pos[1], pos[2]);
            scene.add(sphere);
        };

        // Axis endpoints
        addMarker([-1.5, -1, -1], 0xef4444);
        addMarker([1.5, -1, -1], 0xff8888);
        addMarker([-1, -1.5, -1], 0x10b981);
        addMarker([-1, 1.5, -1], 0x6ee7b7);
        addMarker([-1, -1, -1.5], 0x8b5cf6);
        addMarker([-1, -1, 1.5], 0xc4b5fd);

        // Corner markers (map use cases)
        const cornerGeom = new THREE.SphereGeometry(0.08, 16, 16);
        const cornerMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const corners = [
            [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]
        ];
        corners.forEach((pos) => {
            const sphere = new THREE.Mesh(cornerGeom, cornerMat);
            sphere.position.set(pos[0], pos[1], pos[2]);
            scene.add(sphere);
        });

        // Point for current map and directional glow
        const pointGeom = new THREE.SphereGeometry(0.12, 20, 20);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const point = new THREE.Mesh(pointGeom, pointMat);
        point.position.set(toUnit(data.interaction), toUnit(data.communication), toUnit(data.task));
        scene.add(point);

        // Glow color derived from normalized axes (R=interaction, G=communication, B=task)
        const normR = clamp(data.interaction) / 100;
        const normG = clamp(data.communication) / 100;
        const normB = clamp(data.task) / 100;
        // Keep some brightness even when values are low
        const glowColor = new THREE.Color(normR || 0, normG || 0, normB || 0).lerp(new THREE.Color(1, 1, 1), 0.35);

        // Canvas-based radial gradient texture for the glow sprite
        const createGlowTexture = () => {
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.35)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        };

        const glowTexture = createGlowTexture();
        const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTexture,
            color: glowColor,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            opacity: 0.95
        }));
        glowSprite.scale.set(2.2, 2.2, 2.2);
        glowSprite.position.copy(point.position);
        glowSprite.renderOrder = 2;
        scene.add(glowSprite);

        // Light that brightens toward the chosen direction
        const glowLight = new THREE.PointLight(glowColor, 2.2, 4.5);
        glowLight.position.copy(point.position);
        scene.add(glowLight);

        // Beam from origin toward the point to reinforce direction
        const targetDir = point.position.clone();
        const beamLength = targetDir.length();
        if (beamLength > 0.001) {
            const beamGeom = new THREE.CylinderGeometry(0.035, 0.07, beamLength, 20, 1, true);
            const beamMat = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
            const beam = new THREE.Mesh(beamGeom, beamMat);
            beam.position.copy(targetDir.clone().multiplyScalar(0.5));
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetDir.clone().normalize());
            beam.renderOrder = 1;
            scene.add(beam);
        }

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        // Mouse drag rotation
        let isDragging = false;
        let previous = { x: 0, y: 0 };
        const rotation = { x: 0.35, y: 0.45 };

        const onMouseDown = (e) => {
            isDragging = true;
            previous = { x: e.clientX, y: e.clientY };
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - previous.x;
            const dy = e.clientY - previous.y;
            rotation.y += dx * 0.01;
            rotation.x += dy * 0.01;
            previous = { x: e.clientX, y: e.clientY };
        };

        const onMouseUp = () => { isDragging = false; };

        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('mouseup', onMouseUp);

        const animate = () => {
            requestRef.current = requestAnimationFrame(animate);
            scene.rotation.x = rotation.x;
            scene.rotation.y = rotation.y;
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth || width;
            const h = containerRef.current.clientHeight || height;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', onMouseDown);
            renderer.domElement.removeEventListener('mousemove', onMouseMove);
            renderer.domElement.removeEventListener('mouseup', onMouseUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [data.communication, data.task, data.interaction]);

    return React.createElement('div', { className: 'maceachren-card' }, [
        React.createElement('div', { className: 'maceachren-title', key: 'title' }, [
            React.createElement('span', { className: 'cube-label', key: 'label' }, 'CARTOGRAPHY'),
            React.createElement('sup', { key: 'sup' }, '3')
        ]),
        React.createElement('div', { className: 'maceachren-three', key: 'three' }, [
            React.createElement('div', { className: 'cube-canvas', ref: containerRef, key: 'canvas' }),
            React.createElement('div', { className: 'cube-legend', key: 'legend' }, [
                React.createElement('h4', { key: 'axes-title' }, 'Dimensions'),
                React.createElement('ul', { key: 'axes-list' }, [
                    React.createElement('li', { key: 'x' }, [
                        React.createElement('span', { className: 'legend-dot red-dark', key: 'dotx' }),
                        React.createElement('span', { key: 'textx' }, 'Interaction (faible -> forte)')
                    ]),
                    React.createElement('li', { key: 'y' }, [
                        React.createElement('span', { className: 'legend-dot green-dark', key: 'doty' }),
                        React.createElement('span', { key: 'texty' }, 'Communication / Audience (prive -> public)')
                    ]),
                    React.createElement('li', { key: 'z' }, [
                        React.createElement('span', { className: 'legend-dot purple-dark', key: 'dotz' }),
                        React.createElement('span', { key: 'textz' }, 'Tache (reveler l\'inconnu -> presenter le connu)')
                    ])
                ]),
                React.createElement('h4', { key: 'values-title' }, 'Valeurs'),
                React.createElement('div', { className: 'cube-values', key: 'values' }, [
                    React.createElement('div', { className: 'cube-value', key: 'val-comm' }, [
                        React.createElement('span', { className: 'value-label', key: 'l1' }, 'Communication'),
                        React.createElement('span', { className: 'value-num', key: 'n1' }, `${clamp(data.communication)}%`)
                    ]),
                    React.createElement('div', { className: 'cube-value', key: 'val-task' }, [
                        React.createElement('span', { className: 'value-label', key: 'l2' }, 'Tache'),
                        React.createElement('span', { className: 'value-num', key: 'n2' }, `${clamp(data.task)}%`)
                    ]),
                    React.createElement('div', { className: 'cube-value', key: 'val-inter' }, [
                        React.createElement('span', { className: 'value-label', key: 'l3' }, 'Interaction'),
                        React.createElement('span', { className: 'value-num', key: 'n3' }, `${clamp(data.interaction)}%`)
                    ])
                ]),
                React.createElement('p', { className: 'cube-hint', key: 'hint' }, 'Astuce : cliquez-glissez pour tourner le cube')
            ])
        ])
    ]);
};

// Modal Component
const MapModal = ({ map, isOpen, onClose }) => {
    if (!isOpen) return null;

    return React.createElement('div', {
        className: 'modal-backdrop',
        onClick: onClose,
        key: 'backdrop'
    }, [
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
                React.createElement('div', {
                    className: 'modal-info',
                    key: 'info'
                }, [
                    React.createElement('h3', { key: 'desc-title' }, 'Description'),
                    React.createElement('p', { key: 'description' }, map.description),
                    React.createElement('h3', { key: 'cat-title' }, 'Catégorie'),
                    React.createElement('p', { key: 'category' }, map.category),
                    map.avis ? React.createElement('div', { key: 'avis-section' }, [
                        React.createElement('h3', { key: 'avis-title' }, 'Avis'),
                        React.createElement('p', { key: 'avis-text' }, map.avis)
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
                    React.createElement(MaceachrenCube, { config: map.maceachren, key: 'maceachren' })
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

// Map Card Component
const MapCard = ({ map, onOpenModal }) => {
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
            React.createElement('p', { key: 'description' }, map.description),
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
        selectedMap ? React.createElement(MapModal, {
            map: selectedMap,
            isOpen: isModalOpen,
            onClose: closeModal,
            key: 'modal'
        }) : null
    ]);
};

// Particles Animation
class ParticlesAnimation {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    init() {
        this.canvas = document.getElementById('particles-canvas');
        if (!this.canvas) {
            console.log('Particles canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Create fewer particles for better performance
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.3 + 0.2
            });
        }
        
        this.animate();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(79, 172, 254, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        // Connect nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(79, 172, 254, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing GeoVis Galaxy...');
    
    // Initialize Particles first (background)
    setTimeout(() => {
        if (document.getElementById('particles-canvas')) {
            console.log('Initializing particles...');
            window.particlesAnimation = new ParticlesAnimation();
        }
    }, 100);
    
    // Initialize 3D Earth Animation
    setTimeout(() => {
        if (window.THREE && document.getElementById('heroCanvas')) {
            console.log('Initializing 3D Earth...');
            window.earthAnimation = new EarthAnimation();
        }
    }, 200);
    
    // Initialize React App
    setTimeout(() => {
        const appRoot = document.getElementById('react-root');
        if (appRoot && window.React && window.ReactDOM) {
            console.log('Initializing React app...');
            const root = ReactDOM.createRoot(appRoot);
            root.render(React.createElement(MapGalleryApp));
        }
    }, 300);
    
    // Initialize GSAP animations
    if (window.gsap) {
        gsap.from('.hero-content', {
            duration: 1.5,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
        
        // Removed GSAP animation for stat items - using CSS animations instead
        
        // Scroll animations
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.utils.toArray('.map-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.6,
                y: 60,
                opacity: 0,
                delay: i * 0.1,
                ease: 'power2.out'
            });
        });
    }
    
    // Vertical Navigation Bar
    const verticalNav = document.getElementById('vertical-nav');
    const header = document.querySelector('.main-header');
    
    if (verticalNav && header) {
        // Show/hide vertical nav based on header visibility
        const toggleVerticalNav = () => {
            const headerRect = header.getBoundingClientRect();
            const isHeaderVisible = headerRect.bottom > 0;
            
            if (!isHeaderVisible) {
                verticalNav.classList.add('visible');
            } else {
                verticalNav.classList.remove('visible');
            }
        };
        
        // Update active section in vertical nav
        const updateActiveSection = () => {
            const sections = ['hero-section', 'maps-section', 'features-section', 'about-section', 'contact-section'];
            const navLinks = document.querySelectorAll('.vertical-nav-link');
            
            let currentSection = '';
            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        currentSection = sectionId;
                    }
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === currentSection) {
                    link.classList.add('active');
                }
            });
        };
        
        // Smooth scroll to section
        const verticalNavLinks = document.querySelectorAll('.vertical-nav-link');
        verticalNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                const section = document.getElementById(sectionId);
                
                if (section) {
                    section.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Listen for scroll events
        window.addEventListener('scroll', () => {
            toggleVerticalNav();
            updateActiveSection();
        });
        
        // Initial check
        toggleVerticalNav();
        updateActiveSection();
    }
});

// Update about section stats with real data
function updateAboutStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(stats => {
            // Update about section stats
            const aboutStats = document.querySelectorAll('.about-stats .about-stat');
            aboutStats.forEach((stat, index) => {
                const numberSpan = stat.querySelector('.stat-number');
                const labelSpan = stat.querySelector('.stat-label');
                
                if (numberSpan && labelSpan) {
                    if (labelSpan.textContent.includes('Cartes')) {
                        numberSpan.textContent = stats.total_maps;
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des statistiques:', error);
        });
}

// Contact form submission handler
function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    
    // Get form data
    const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim()
    };
    
    // Send to API
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Success
            alert('✅ ' + data.message);
            form.reset();
        } else {
            // Error
            alert('❌ Erreur: ' + (data.error || 'Une erreur inconnue est survenue'));
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'envoi:', error);
        alert('❌ Erreur de connexion. Veuillez réessayer plus tard.');
    })
    .finally(() => {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// Email copy function
function copyEmail() {
    const email = 'contact@geovisgalaxy.fr';
    const feedbackElement = document.getElementById('copy-feedback');
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
            if (feedbackElement) {
                feedbackElement.textContent = 'Email copié dans le presse-papiers !';
                feedbackElement.classList.add('show');
                
                setTimeout(() => {
                    feedbackElement.classList.remove('show');
                }, 3000);
            }
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (feedbackElement) {
                feedbackElement.textContent = 'Email copié dans le presse-papiers !';
                feedbackElement.classList.add('show');
                
                setTimeout(() => {
                    feedbackElement.classList.remove('show');
                }, 3000);
            }
        });
    }
}

// Make functions globally available
window.copyEmail = copyEmail;
window.submitContactForm = submitContactForm;
window.updateAboutStats = updateAboutStats;

// Initialize stats on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAboutStats();
    
    // Update stats every 30 seconds to show real-time changes
    setInterval(() => {
        updateAboutStats();
    }, 30000);
});
