// Event handlers and utility functions

// Update about section stats with real data
function updateAboutStats() {
    fetchStats()
        .then(stats => {
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
    submitContact(formData)
        .then(data => {
            if (data.success) {
                alert('✅ ' + data.message);
                form.reset();
            } else {
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
            showCopyFeedback(feedbackElement);
        }).catch(err => {
            console.error('Erreur lors de la copie:', err);
            fallbackCopyEmail(email, feedbackElement);
        });
    }
}

function showCopyFeedback(feedbackElement) {
    if (feedbackElement) {
        feedbackElement.textContent = 'Email copié dans le presse-papiers !';
        feedbackElement.classList.add('show');
        
        setTimeout(() => {
            feedbackElement.classList.remove('show');
        }, 3000);
    }
}

function fallbackCopyEmail(email, feedbackElement) {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    showCopyFeedback(feedbackElement);
}

// Vertical Navigation Bar
function setupVerticalNavigation() {
    const verticalNav = document.getElementById('vertical-nav');
    const header = document.querySelector('.main-header');
    
    if (!verticalNav || !header) return;
    
    const toggleVerticalNav = () => {
        const headerRect = header.getBoundingClientRect();
        const isHeaderVisible = headerRect.bottom > 0;
        
        if (!isHeaderVisible) {
            verticalNav.classList.add('visible');
        } else {
            verticalNav.classList.remove('visible');
        }
    };
    
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
    
    window.addEventListener('scroll', () => {
        toggleVerticalNav();
        updateActiveSection();
    });
    
    toggleVerticalNav();
    updateActiveSection();
}

// Initialize GSAP animations
function initializeGsapAnimations() {
    if (!window.gsap) return;
    
    gsap.from('.hero-content', {
        duration: 1.5,
        y: 50,
        opacity: 0,
        ease: 'power3.out'
    });
    
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
