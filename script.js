// Global variables
let scene, camera, renderer, particles;
let particleSystem;
let mouseX = 0, mouseY = 0;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initParticleBackground();
    initNavigation();
    initScrollAnimations();
    initCardAnimations();
    initTypingEffect();
    initParallaxEffect();
    initTerminalTyping();
    initDataVisualizationEffects();
});

// Initialize 3D Particle Background
function initParticleBackground() {
    const container = document.getElementById('particles-container');
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particle geometry
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;

        // Cyberpunk colors
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            colors[i] = 0; colors[i + 1] = 1; colors[i + 2] = 1; // Cyan
        } else if (colorChoice < 0.66) {
            colors[i] = 1; colors[i + 1] = 0; colors[i + 2] = 1; // Magenta
        } else {
            colors[i] = 0; colors[i + 1] = 1; colors[i + 2] = 0; // Green
        }

        sizes[i / 3] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time * 2.0 + position.x * 0.01) * 0.3);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - dist * 2.0;
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true,
        vertexColors: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 1000;

    // Animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;
    
    if (particleSystem) {
        particleSystem.rotation.x = time * 0.05;
        particleSystem.rotation.y = time * 0.075;
        particleSystem.material.uniforms.time.value = time;
    }

    // Mouse interaction
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
            navbar.style.backdropFilter = 'blur(20px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)';
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special animations for different elements
                if (entry.target.classList.contains('strategy-phase')) {
                    animateStrategyPhase(entry.target);
                }
                if (entry.target.classList.contains('security-card')) {
                    animateSecurityCard(entry.target);
                }
                if (entry.target.classList.contains('timeline-item')) {
                    animateTimelineItem(entry.target);
                }
                if (entry.target.classList.contains('result-card')) {
                    animateResultCard(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.strategy-phase, .security-card, .timeline-item, .result-card, .tech-category, .future-column').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Card animations
function initCardAnimations() {
    // Security cards tilt effect
    const securityCards = document.querySelectorAll('.security-card');
    securityCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Strategy phase hover effects
    const strategyPhases = document.querySelectorAll('.strategy-phase');
    strategyPhases.forEach(phase => {
        phase.addEventListener('mouseenter', () => {
            phase.style.transform = 'translateY(-10px) scale(1.02)';
            phase.style.boxShadow = '0 25px 50px rgba(0, 255, 255, 0.3)';
        });
        
        phase.addEventListener('mouseleave', () => {
            phase.style.transform = 'translateY(0) scale(1)';
            phase.style.boxShadow = 'none';
        });
    });
}

// Typing effect for hero title
function initTypingEffect() {
    const titleMain = document.querySelector('.title-main');
    const originalText = titleMain.textContent;
    titleMain.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            titleMain.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            titleMain.style.animation = 'glow 2s ease-in-out infinite alternate';
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Parallax effect
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (particleSystem) {
            particleSystem.rotation.z = scrolled * 0.0001;
        }
    });
}

// Terminal typing effect
function initTerminalTyping() {
    const terminals = document.querySelectorAll('.terminal-display');
    terminals.forEach(terminal => {
        const lines = terminal.querySelectorAll('.terminal-line');
        lines.forEach((line, index) => {
            if (line.querySelector('.command')) {
                const command = line.querySelector('.command');
                const originalText = command.textContent;
                command.textContent = '';
                
                setTimeout(() => {
                    typeText(command, originalText, 50);
                }, index * 1000);
            }
        });
    });
}

function typeText(element, text, speed) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Data visualization effects
function initDataVisualizationEffects() {
    // Animate metric bars
    const metricBars = document.querySelectorAll('.metric-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0%';
                bar.style.transition = 'width 2s ease-in-out';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            }
        });
    });
    
    metricBars.forEach(bar => observer.observe(bar));
    
    // Animate stat numbers
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        observer.observe(stat);
        stat.addEventListener('animationstart', () => {
            animateNumber(stat);
        });
    });
}

function animateNumber(element) {
    const target = element.textContent;
    const isPercentage = target.includes('%');
    const targetNumber = parseInt(target.replace(/[^0-9]/g, ''));
    let current = 0;
    const increment = targetNumber / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (isPercentage ? '%' : '');
    }, 40);
}

// Enhanced particle interactions
function createFloatingParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const colors = ['#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff0080'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        box-shadow: 0 0 10px ${color};
        animation: floatUp 3s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (document.body.contains(particle)) {
            document.body.removeChild(particle);
        }
    }, 3000);
}

// Add floating particle animation
const floatingParticleStyle = document.createElement('style');
floatingParticleStyle.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(floatingParticleStyle);

// Enhanced mouse movement tracking with particle trail
let lastParticleTime = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.5;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.5;
    
    // Create particle trail
    const now = Date.now();
    if (now - lastParticleTime > 100) {
        createFloatingParticle(event.clientX, event.clientY);
        lastParticleTime = now;
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Animation functions for specific elements
function animateStrategyPhase(element) {
    const phaseNumber = element.querySelector('.phase-number');
    const icons = element.querySelectorAll('.phase-tech i');
    
    setTimeout(() => {
        phaseNumber.style.transform = 'scale(1.1)';
        phaseNumber.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            phaseNumber.style.transform = 'scale(1)';
        }, 300);
    }, 200);
    
    icons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.transform = 'scale(1.2) rotate(360deg)';
            icon.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }, 500);
        }, 300 + (index * 100));
    });
}

function animateSecurityCard(element) {
    const icon = element.querySelector('.card-icon');
    const glow = element.querySelector('.card-glow');
    
    setTimeout(() => {
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.5s ease';
        glow.style.opacity = '0.2';
        glow.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
            glow.style.opacity = '0';
        }, 1000);
    }, 300);
}

function animateTimelineItem(element) {
    const marker = element.querySelector('.timeline-marker');
    
    setTimeout(() => {
        marker.style.transform = 'scale(1.5)';
        marker.style.transition = 'transform 0.3s ease';
        marker.style.boxShadow = '0 0 30px var(--primary-neon)';
        
        setTimeout(() => {
            marker.style.transform = 'scale(1)';
            marker.style.boxShadow = '0 0 20px var(--primary-neon)';
        }, 500);
    }, 200);
}

function animateResultCard(element) {
    const statNumbers = element.querySelectorAll('.stat-number');
    
    statNumbers.forEach((statNumber, index) => {
        setTimeout(() => {
            statNumber.style.transform = 'scale(1.2)';
            statNumber.style.color = '#00ff00';
            statNumber.style.textShadow = '0 0 20px #00ff00';
            statNumber.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                statNumber.style.transform = 'scale(1)';
                statNumber.style.color = 'var(--accent-neon)';
                statNumber.style.textShadow = '0 0 10px var(--accent-neon)';
            }, 800);
        }, index * 200);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        activateMatrix();
        konamiCode = [];
    }
});

function activateMatrix() {
    const matrixEffect = document.createElement('div');
    matrixEffect.style.position = 'fixed';
    matrixEffect.style.top = '0';
    matrixEffect.style.left = '0';
    matrixEffect.style.width = '100%';
    matrixEffect.style.height = '100%';
    matrixEffect.style.background = 'rgba(0, 0, 0, 0.9)';
    matrixEffect.style.color = '#00ff00';
    matrixEffect.style.fontFamily = 'monospace';
    matrixEffect.style.fontSize = '14px';
    matrixEffect.style.zIndex = '9999';
    matrixEffect.style.pointerEvents = 'none';
    
    const matrixText = 'THE MATRIX HAS YOU... FOLLOW THE WHITE RABBIT... KNOCK KNOCK, NEO...';
    matrixEffect.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; font-size: 24px;">
            ${matrixText}
        </div>
    `;
    
    document.body.appendChild(matrixEffect);
    
    setTimeout(() => {
        matrixEffect.style.opacity = '0';
        matrixEffect.style.transition = 'opacity 1s ease';
        setTimeout(() => {
            document.body.removeChild(matrixEffect);
        }, 1000);
    }, 3000);
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced resize handler
const debouncedResize = debounce(() => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}, 250);

window.addEventListener('resize', debouncedResize);

// Add some interactive elements
document.addEventListener('click', (e) => {
    // Create click ripple effect
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.background = 'rgba(0, 255, 255, 0.6)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999';
    ripple.style.animation = 'rippleEffect 0.6s ease-out forwards';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        if (document.body.contains(ripple)) {
            document.body.removeChild(ripple);
        }
    }, 600);
});

// Add ripple effect keyframes via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(10);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);