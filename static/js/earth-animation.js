class EarthAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Renderer setup
        const canvas = document.getElementById('heroCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create Earth
        this.createEarth();
        this.createLights();
        
        // Animation loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse interaction
        this.setupMouseInteraction();
    }
    
    createEarth() {
        const geometry = new THREE.SphereGeometry(2, 128, 64);
        
        // Simplified Earth material to avoid weird boxes
        const material = new THREE.MeshPhongMaterial({
            map: this.createEarthTexture(),
            transparent: false,
            opacity: 1.0
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.scene.add(this.earth);
    }
    
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Point light for atmospheric glow
        const pointLight = new THREE.PointLight(0x4a90e2, 0.5, 10);
        pointLight.position.set(-5, -3, -5);
        this.scene.add(pointLight);
    }
    
    createEarthTexture() {
        // Use a high-quality Earth texture from NASA or similar
        const textureLoader = new THREE.TextureLoader();
        
        // Try to load a real Earth texture, fallback to procedural if failed
        try {
            // You can replace this with actual NASA Earth texture URLs
            const earthTexture = textureLoader.load(
                'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
                // Success callback
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                },
                // Progress callback
                undefined,
                // Error callback - fallback to procedural texture
                () => {
                    console.log('Using fallback procedural Earth texture');
                    return this.createProceduralEarthTexture();
                }
            );
            return earthTexture;
        } catch (error) {
            console.log('Error loading Earth texture, using procedural texture');
            return this.createProceduralEarthTexture();
        }
    }
    
    createProceduralEarthTexture() {
        // Simplified clean earth texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Ocean base - simple blue
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simple landmasses - clean shapes
        ctx.fillStyle = '#22c55e';
        
        // Africa
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.52, canvas.height * 0.5, 80, 160, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Europe
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.51, canvas.height * 0.35, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Asia
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.7, canvas.height * 0.4, 150, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // North America
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.2, canvas.height * 0.35, 100, 120, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // South America
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.25, canvas.height * 0.65, 60, 140, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Australia
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.8, canvas.height * 0.75, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ice caps
        ctx.fillStyle = '#ffffff';
        // North
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.1);
        // South
        ctx.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createBumpTexture() {
        // Create bump map for surface detail
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 255;
            data[i] = noise;     // Red
            data[i + 1] = noise; // Green  
            data[i + 2] = noise; // Blue
            data[i + 3] = 255;   // Alpha
        }
        
        ctx.putImageData(imageData, 0, 0);
        return new THREE.CanvasTexture(canvas);
    }
    
    createSpecularTexture() {
        // Create specular map for water reflection
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add bright areas for water
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const width = Math.random() * 100 + 50;
            const height = Math.random() * 30 + 10;
            ctx.fillRect(x, y, width, height);
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    setupMouseInteraction() {
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        
        // Smoothly follow mouse
        const targetRotation = { x: 0, y: 0 };
        
        const updateMouseInfluence = () => {
            targetRotation.x = mouseY * 0.2;
            targetRotation.y = mouseX * 0.2;
            
            this.earth.rotation.x += (targetRotation.x - this.earth.rotation.x) * 0.05;
            this.earth.rotation.y += (targetRotation.y - this.earth.rotation.y) * 0.05;
        };
        
        this.updateMouseInfluence = updateMouseInfluence;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate earth
        if (this.earth) {
            this.earth.rotation.y += 0.002;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Export for use in other files
window.EarthAnimation = EarthAnimation;