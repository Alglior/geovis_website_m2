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
