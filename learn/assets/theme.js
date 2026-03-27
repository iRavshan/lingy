// ===== UzSL Learn Theme Toggle =====
(function() {
    const STORAGE_KEY = 'uzsl-learn-theme';

    function getPreferred() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update toggle button icon if exists
        const btn = document.getElementById('themeToggleBtn');
        if (btn) {
            btn.innerHTML = theme === 'dark'
                ? '<i class="fa-solid fa-sun"></i>'
                : '<i class="fa-solid fa-moon"></i>';
            btn.title = theme === 'dark' ? 'Yorug\' rejim' : 'Qorong\'i rejim';
        }
    }

    // Apply on load (before paint)
    applyTheme(getPreferred());

    // Expose toggle function globally
    window.toggleLearnTheme = function() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    };
})();
