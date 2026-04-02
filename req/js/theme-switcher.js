/**
 * Compact Theme Switcher - 3 Themes
 * ==================================
 * Themes: Modern Dark (default), Light, Terminal
 */

(function() {
    'use strict';

    const THEME_KEY = 'portfolio-theme-v2';
    const DEFAULT_THEME = 'modern-dark';

    // Theme configuration - 3 themes only
    const THEMES = {
        'modern-dark': {
            name: 'Dark',
            icon: '🌙',
            shortcut: 'Alt+1'
        },
        'light': {
            name: 'Light',
            icon: '☀️',
            shortcut: 'Alt+2'
        },
        'terminal': {
            name: 'Terminal',
            icon: '💻',
            shortcut: 'Alt+3'
        }
    };

    const THEME_ORDER = ['modern-dark', 'light', 'terminal'];

    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
        applyTheme(savedTheme);
    }

    // Apply theme to document
    function applyTheme(themeName) {
        if (!THEMES[themeName]) {
            themeName = DEFAULT_THEME;
        }
        
        document.body.setAttribute('data-theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem(THEME_KEY, themeName);
        updateThemeSwitcherUI(themeName);
        updateActiveThemeInDropdown(themeName);
        
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName } }));
    }

    // Get current theme
    function getCurrentTheme() {
        return document.body.getAttribute('data-theme') || DEFAULT_THEME;
    }

    // Cycle to next theme
    function cycleTheme() {
        const current = getCurrentTheme();
        const currentIndex = THEME_ORDER.indexOf(current);
        const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
        applyTheme(THEME_ORDER[nextIndex]);
    }

    // Update theme switcher button
    function updateThemeSwitcherUI(themeName) {
        const btn = document.querySelector('.theme-switcher-btn');
        if (!btn) return;

        const theme = THEMES[themeName];
        const iconSpan = btn.querySelector('.current-theme-icon');
        
        if (iconSpan) iconSpan.textContent = theme.icon;
    }

    // Update active state in dropdown
    function updateActiveThemeInDropdown(activeTheme) {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(option => {
            const themeId = option.getAttribute('data-theme');
            option.classList.toggle('active', themeId === activeTheme);
        });
    }

    // Create compact theme switcher HTML
    function createThemeSwitcher() {
        return `
            <div class="theme-switcher-container">
                <button class="theme-switcher-btn" id="themeSwitcherBtn" aria-label="Switch theme" aria-haspopup="true" aria-expanded="false">
                    <span class="current-theme-icon">🌙</span>
                </button>
                <div class="theme-dropdown" id="themeDropdown" role="menu">
                    ${Object.entries(THEMES).map(([key, theme]) => `
                        <button class="theme-option" data-theme="${key}" role="menuitem">
                            <span class="theme-option-icon">${theme.icon}</span>
                            <span class="theme-option-label">${theme.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Insert theme switcher into navigation
    function setupThemeSwitcherInNav() {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createThemeSwitcher();
        navMenu.appendChild(tempDiv.firstElementChild);
    }

    // Setup dropdown functionality
    function setupDropdown() {
        const switcherBtn = document.getElementById('themeSwitcherBtn');
        const dropdown = document.getElementById('themeDropdown');
        
        if (!switcherBtn || !dropdown) return;

        let isOpen = false;

        function open() {
            dropdown.classList.add('active');
            switcherBtn.setAttribute('aria-expanded', 'true');
            isOpen = true;
        }

        function close() {
            dropdown.classList.remove('active');
            switcherBtn.setAttribute('aria-expanded', 'false');
            isOpen = false;
        }

        switcherBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isOpen ? close() : open();
        });

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                applyTheme(option.getAttribute('data-theme'));
                close();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (isOpen && !dropdown.contains(e.target) && !switcherBtn.contains(e.target)) {
                close();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                close();
                switcherBtn.focus();
            }
        });

        // Keyboard navigation
        dropdown.addEventListener('keydown', (e) => {
            const options = Array.from(document.querySelectorAll('.theme-option'));
            const idx = options.indexOf(document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                options[(idx + 1) % options.length].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                options[(idx - 1 + options.length) % options.length].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (document.activeElement.classList.contains('theme-option')) {
                    applyTheme(document.activeElement.getAttribute('data-theme'));
                    close();
                }
            }
        });
    }

    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key >= '1' && e.key <= '3') {
                e.preventDefault();
                applyTheme(THEME_ORDER[parseInt(e.key) - 1]);
            }
            if (e.altKey && (e.key === 't' || e.key === 'T')) {
                e.preventDefault();
                cycleTheme();
            }
        });
    }

    // Mobile navigation toggle
    function setupNavToggle() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            // Toggle menu on hamburger click
            navToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                // Update aria-expanded
                const isExpanded = navMenu.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isExpanded);
            });

            // Close menu when clicking nav links (but not theme switcher)
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // Smooth scrolling
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // Active nav highlighting
    function setupActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!sections.length || !navLinks.length) return;

        function highlight() {
            const scrollY = window.scrollY;

            sections.forEach(section => {
                const height = section.offsetHeight;
                const top = section.offsetTop - 150;
                const id = section.getAttribute('id');

                if (scrollY > top && scrollY <= top + height) {
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }

        window.addEventListener('scroll', highlight, { passive: true });
        highlight();
    }

    // Scroll animations
    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

        document.querySelectorAll('.hero-card, .skill-card, .education-card, .contact-card, .expertise-item').forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transitionDelay = `${Math.min(i * 0.1, 0.5)}s`;
            observer.observe(el);
        });
    }

    // Initialize
    function init() {
        setupThemeSwitcherInNav();
        initTheme();
        setupDropdown();
        setupKeyboardShortcuts();
        setupNavToggle();
        setupSmoothScroll();
        setupActiveNav();
        setupScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.setPortfolioTheme = applyTheme;
    window.getPortfolioTheme = getCurrentTheme;
    window.cyclePortfolioTheme = cycleTheme;
})();
