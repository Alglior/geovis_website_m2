// Global MacEachren Cube Component - 3D Three.js version
// Displays the global average statistics across all filtered maps
const GlobalCube = ({ config }) => {
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

        const width = containerRef.current.clientWidth || 500;
        const height = containerRef.current.clientHeight || 400;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0f1e);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(4.5, 3.5, 4.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        containerRef.current.appendChild(renderer.domElement);

        sceneRef.current = scene;
        rendererRef.current = renderer;

        // Cube edges and faces
        const cubeSize = 2.4;
        const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize));
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x7dd3fc, linewidth: 2 });
        const cubeEdges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        scene.add(cubeEdges);

        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1e3a5f,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const cube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), cubeMaterial);
        scene.add(cube);

        // Axes - with thicker lines for global view
        const addAxis = (from, to, color) => {
            const geom = new THREE.BufferGeometry().setFromPoints([from, to]);
            const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color, linewidth: 4 }));
            scene.add(line);
        };

        addAxis(new THREE.Vector3(-1.8, -1.2, -1.2), new THREE.Vector3(1.8, -1.2, -1.2), 0xff4444); // X - interaction
        addAxis(new THREE.Vector3(-1.2, -1.8, -1.2), new THREE.Vector3(-1.2, 1.8, -1.2), 0x22c55e); // Y - communication/public
        addAxis(new THREE.Vector3(-1.2, -1.2, -1.8), new THREE.Vector3(-1.2, -1.2, 1.8), 0xa855f7); // Z - task

        const markerGeom = new THREE.SphereGeometry(0.15, 20, 20);
        const addMarker = (pos, color) => {
            const sphere = new THREE.Mesh(markerGeom, new THREE.MeshBasicMaterial({ color }));
            sphere.position.set(pos[0], pos[1], pos[2]);
            scene.add(sphere);
        };

        // Axis endpoints
        addMarker([-1.8, -1.2, -1.2], 0xff4444);
        addMarker([1.8, -1.2, -1.2], 0xff8888);
        addMarker([-1.2, -1.8, -1.2], 0x22c55e);
        addMarker([-1.2, 1.8, -1.2], 0x86efac);
        addMarker([-1.2, -1.2, -1.8], 0xa855f7);
        addMarker([-1.2, -1.2, 1.8], 0xd8b4fe);

        // Point for global average - bigger and more prominent
        const pointGeom = new THREE.SphereGeometry(0.18, 24, 24);
        const pointMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        const point = new THREE.Mesh(pointGeom, pointMat);
        point.position.set(
            toUnit(data.interaction) * 1.2, 
            toUnit(data.communication) * 1.2, 
            toUnit(data.task) * 1.2
        );
        scene.add(point);

        // Glow color derived from normalized axes
        const normR = clamp(data.interaction) / 100;
        const normG = clamp(data.communication) / 100;
        const normB = clamp(data.task) / 100;
        const glowColor = new THREE.Color(normR || 0, normG || 0, normB || 0).lerp(new THREE.Color(1, 1, 1), 0.3);

        // Enhanced glow for global view
        const createGlowTexture = () => {
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
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
            opacity: 1
        }));
        glowSprite.scale.set(2.8, 2.8, 2.8);
        glowSprite.position.copy(point.position);
        glowSprite.renderOrder = 2;
        scene.add(glowSprite);

        // Stronger light for global view
        const glowLight = new THREE.PointLight(glowColor, 3, 6);
        glowLight.position.copy(point.position);
        scene.add(glowLight);

        // Beam from origin - thicker for global
        const targetDir = point.position.clone();
        const beamLength = targetDir.length();
        if (beamLength > 0.001) {
            const beamGeom = new THREE.CylinderGeometry(0.05, 0.09, beamLength, 24, 1, true);
            const beamMat = new THREE.MeshBasicMaterial({ 
                color: glowColor, 
                transparent: true, 
                opacity: 0.5, 
                side: THREE.DoubleSide, 
                depthWrite: false 
            });
            const beam = new THREE.Mesh(beamGeom, beamMat);
            beam.position.copy(targetDir.clone().multiplyScalar(0.5));
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), targetDir.clone().normalize());
            beam.renderOrder = 1;
            scene.add(beam);
        }

        // Enhanced ambient lighting for global view
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        scene.add(new THREE.DirectionalLight(0xffffff, 0.4));

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
            rotation.y += dx * 0.008;
            rotation.x += dy * 0.008;
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

    return React.createElement('div', { className: 'global-cube-card' }, [
        React.createElement('div', { className: 'global-cube-header', key: 'header' }, [
            React.createElement('div', { className: 'global-cube-title', key: 'title' }, [
                React.createElement('span', { className: 'cube-label', key: 'label' }, 'PROFIL GLOBAL'),
                React.createElement('sup', { key: 'sup' }, '3')
            ]),
            React.createElement('p', { className: 'global-cube-subtitle', key: 'subtitle' }, 
                'Vue d\'ensemble des caractéristiques moyennes'
            )
        ]),
        React.createElement('div', { className: 'global-cube-content', key: 'content' }, [
            React.createElement('div', { className: 'global-cube-canvas', ref: containerRef, key: 'canvas' }),
            React.createElement('div', { className: 'global-cube-legend', key: 'legend' }, [
                React.createElement('div', { className: 'global-cube-stats', key: 'stats' }, [
                    React.createElement('div', { className: 'global-stat-item', key: 'comm' }, [
                        React.createElement('div', { className: 'stat-header', key: 'header' }, [
                            React.createElement('span', { className: 'legend-dot green-bright', key: 'dot' }),
                            React.createElement('span', { className: 'stat-label', key: 'label' }, 'Communication')
                        ]),
                        React.createElement('span', { className: 'stat-value', key: 'value' }, `${clamp(data.communication)}%`)
                    ]),
                    React.createElement('div', { className: 'global-stat-item', key: 'task' }, [
                        React.createElement('div', { className: 'stat-header', key: 'header' }, [
                            React.createElement('span', { className: 'legend-dot purple-bright', key: 'dot' }),
                            React.createElement('span', { className: 'stat-label', key: 'label' }, 'Tâche')
                        ]),
                        React.createElement('span', { className: 'stat-value', key: 'value' }, `${clamp(data.task)}%`)
                    ]),
                    React.createElement('div', { className: 'global-stat-item', key: 'inter' }, [
                        React.createElement('div', { className: 'stat-header', key: 'header' }, [
                            React.createElement('span', { className: 'legend-dot red-bright', key: 'dot' }),
                            React.createElement('span', { className: 'stat-label', key: 'label' }, 'Interaction')
                        ]),
                        React.createElement('span', { className: 'stat-value', key: 'value' }, `${clamp(data.interaction)}%`)
                    ])
                ]),
                React.createElement('div', { className: 'global-cube-info', key: 'info' }, [
                    React.createElement('h4', { key: 'info-title' }, 'Informations'),
                    React.createElement('p', { key: 'info-text' }, 
                        'Ces valeurs représentent la moyenne des dimensions pour toutes les cartes affichées.'
                    )
                ]),
                React.createElement('p', { className: 'global-cube-hint', key: 'hint' }, 
                    'Faites glisser pour explorer le cube en 3D'
                )
            ])
        ])
    ]);
};
