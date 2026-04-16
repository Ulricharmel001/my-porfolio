/**
 * Material 3 & Sonar-Inspired Portfolio JavaScript
 * Main interaction script for Geyek Ulrich Armel Portfolio
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portfolio initializing...');

    // Core Components
    initializeLoader();
    initializeScrollProgress();
    initializeNavigation();
    initializeSmoothScrolling();
    initializeScrollEffects();
    initializeAnimations();
    initializeInteractions();
    
    // Performance Optimizations
    setTimeout(optimizeImages, 1000);
    preloadCriticalResources();
});

// ===== LOADER FUNCTIONALITY =====
function initializeLoader() {
    const loader = document.querySelector('.sonar-loader-wrapper');
    const progressBar = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const stages = document.querySelectorAll('.stage');

    if (!loader || !progressBar || !progressPercentage) {
        if (loader) loader.style.display = 'none';
        return;
    }

    document.body.style.overflow = 'hidden';

    let progress = 0;
    let currentStage = 0;
    const duration = 2500; // 2.5 seconds for snappy feel
    const interval = 30;
    const increment = 100 / (duration / interval);

    const progressInterval = setInterval(() => {
        progress += increment;
        const roundedProgress = Math.min(Math.round(progress), 100);

        progressBar.style.width = `${roundedProgress}%`;
        progressPercentage.textContent = `${roundedProgress}%`;

        // Update stages
        const newStageIndex = Math.floor((progress / 100) * stages.length);
        if (newStageIndex !== currentStage && newStageIndex < stages.length) {
            if (stages[currentStage]) {
                stages[currentStage].classList.remove('active');
                stages[currentStage].classList.add('complete');
            }
            if (stages[newStageIndex]) {
                stages[newStageIndex].classList.add('active');
            }
            currentStage = newStageIndex;
        }

        if (progress >= 100) {
            clearInterval(progressInterval);
            stages.forEach(s => {
                s.classList.add('complete');
                s.classList.remove('active');
            });

            setTimeout(() => {
                hideLoader(loader);
            }, 500);
        }
    }, interval);

    // Fallback
    setTimeout(() => {
        if (loader.style.display !== 'none') hideLoader(loader);
    }, 5000);
}

function hideLoader(loader) {
    loader.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    loader.style.opacity = '0';
    loader.style.transform = 'scale(1.02)';
    loader.style.filter = 'blur(10px)';

    setTimeout(() => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        triggerEntranceAnimations();
    }, 600);
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navbar = document.querySelector('.sonar-nav');
    if (!navbar) return;

    const mobileQuery = window.matchMedia('(max-width: 1024px)');

    function isMobileView() {
        return mobileQuery.matches;
    }

    let lastScrollY = window.scrollY;
    navbar.style.transform = 'translateY(0)';

    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;

        // Sticky effect
        if (currentScrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Auto-hide on scroll down, show on scroll up.
        // Keep the nav visible on smaller screens and when the mobile menu is open.
        const mobileMenuOpen = document.getElementById('navMenu')?.classList.contains('active');
        if (!isMobileView() && !mobileMenuOpen) {
            if (currentScrollY > lastScrollY && currentScrollY > 300) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    }, 100));
}

// ===== SCROLL EFFECTS & ANIMATIONS =====
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.hero-card, .skill-card, .experience-card, .award-card, .certification-card, .education-card, .contact-card');
    animateElements.forEach(el => {
        el.classList.add('animate-hidden');
        scrollObserver.observe(el);
    });
}

function triggerEntranceAnimations() {
    const heroElements = document.querySelectorAll('.hero-header > *, .hero-card');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('animate-visible');
        }, index * 100);
    });
}

function initializeAnimations() {
    // Stat counters if any
    const stats = document.querySelectorAll('.stat-value');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const value = parseInt(target.getAttribute('data-value') || target.innerText);
                if (!isNaN(value)) animateValue(target, 0, value, 2000);
                statObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(s => statObserver.observe(s));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ===== INTERACTIONS =====
function initializeInteractions() {
    // Ripple effect for buttons
    const buttons = document.querySelectorAll('.btn-sonar-primary, .social-link, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.sonar-nav')?.offsetHeight || 0;
                window.scrollTo({
                    top: target.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress-bar';
    document.body.appendChild(progress);

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressWidth = (window.scrollY / totalHeight) * 100;
        progress.style.width = `${progressWidth}%`;
    });
}

// ===== UTILITIES =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

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

function optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger load if needed
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }
}

function preloadCriticalResources() {
    const fonts = [
        'req/fonts/FKGroteskNeue-Regular.woff2',
        'req/fonts/BerkeleyMono-Regular.woff2'
    ];
    fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = font;
        document.head.appendChild(link);
    });
}

// Handle global errors
window.addEventListener('error', (e) => {
    console.error('Portfolio Runtime Error:', e.message);
});

console.log('✅ Portfolio Core loaded successfully!');
