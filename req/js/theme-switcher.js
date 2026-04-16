(function () {
    'use strict';

    const THEME_KEY = 'portfolio-theme-v2';
    const DEFAULT_THEME = 'modern-dark';

    const THEMES = {
        'modern-dark': { name: 'Dark', icon: '🌙' },
        'light': { name: 'Light', icon: '☀️' },
        'white': { name: 'White', icon: '⚪' },
        'terminal': { name: 'Terminal', icon: '💻' }
    };

    const THEME_ORDER = ['modern-dark', 'light', 'white', 'terminal'];

    /* ---------------- INIT THEME ---------------- */
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
        applyTheme(saved, false);
    }

    function applyTheme(theme, save = true) {
        if (!THEMES[theme]) theme = DEFAULT_THEME;

        document.documentElement.setAttribute('data-theme', theme);

        if (save) localStorage.setItem(THEME_KEY, theme);

        updateUI(theme);

        window.dispatchEvent(
            new CustomEvent('themechange', { detail: { theme } })
        );
    }

    function getCurrentTheme() {
        return (
            document.documentElement.getAttribute('data-theme') ||
            DEFAULT_THEME
        );
    }

    function cycleTheme() {
        const current = getCurrentTheme();
        const index = THEME_ORDER.indexOf(current);
        const next = THEME_ORDER[(index + 1) % THEME_ORDER.length];
        applyTheme(next);
    }

    /* ---------------- UI ---------------- */
    function updateUI(theme) {
        const btn = document.getElementById('themeSwitcherBtn');
        if (!btn) return;

        const icon = btn.querySelector('.current-theme-icon');
        if (icon) icon.textContent = THEMES[theme].icon;

        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle(
                'active',
                opt.dataset.theme === theme
            );
        });
    }

    function createThemeSwitcher() {
        return `
            <div class="theme-switcher-container">
                <button id="themeSwitcherBtn" class="theme-switcher-btn" aria-expanded="false">
                    <span class="current-theme-icon">🌙</span>
                </button>

                <div id="themeDropdown" class="theme-dropdown">
                    ${Object.entries(THEMES)
                        .map(
                            ([key, t]) => `
                        <button class="theme-option" data-theme="${key}">
                            ${t.icon} ${t.name}
                        </button>
                    `
                        )
                        .join('')}
                </div>
            </div>
        `;
    }

    function mountSwitcher() {
        const nav = document.getElementById('navMenu');
        if (!nav) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = createThemeSwitcher();
        nav.appendChild(wrapper.firstElementChild);
    }

    /* ---------------- DROPDOWN ---------------- */
    function setupDropdown() {
        const btn = document.getElementById('themeSwitcherBtn');
        const dropdown = document.getElementById('themeDropdown');

        if (!btn || !dropdown) return;

        let open = false;

        function show() {
            dropdown.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            open = true;
        }

        function hide() {
            dropdown.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
            open = false;
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            open ? hide() : show();
        });

        // ✅ FIX: use event delegation (handles dynamic elements safely)
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.theme-option');
            if (!option) return;

            applyTheme(option.dataset.theme);
            hide();
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hide();
        });
    }

    /* ---------------- HAMBURGER MENU ---------------- */
    function setupHamburgerMenu() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');

        if (!toggle || !menu) return;

        let isOpen = false;

        function showMenu() {
            menu.classList.add('active');
            toggle.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
            isOpen = true;
        }

        function hideMenu() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
            isOpen = false;
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            isOpen ? hideMenu() : showMenu();
        });

        // Close menu when clicking on a link
        menu.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                hideMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                hideMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                hideMenu();
            }
        });
    }

    /* ---------------- INIT ---------------- */
    function init() {
        mountSwitcher();      // must come first
        initTheme();          // apply saved theme
        setupDropdown();      // attach listeners AFTER DOM exists
        setupHamburgerMenu(); // setup hamburger menu toggle
        setupShortcuts();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ---------------- GLOBAL API ---------------- */
    window.setPortfolioTheme = applyTheme;
    window.getPortfolioTheme = getCurrentTheme;
    window.cyclePortfolioTheme = cycleTheme;
})();