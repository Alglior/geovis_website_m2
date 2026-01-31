// Main application initialization
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
    initializeGsapAnimations();
    
    // Setup Vertical Navigation
    setupVerticalNavigation();
    
    // Initialize stats
    updateAboutStats();
    
    // Update stats every 30 seconds
    setInterval(() => {
        updateAboutStats();
    }, 30000);
});

// Make functions globally available
window.copyEmail = copyEmail;
window.submitContactForm = submitContactForm;
window.updateAboutStats = updateAboutStats;
