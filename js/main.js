document.addEventListener('DOMContentLoaded', () => {
    new SpritesheetGenerator();
    initThemeToggle();
});

function initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const setTheme = (theme) => {
        root.setAttribute('data-color-scheme', theme);
        root.setAttribute('data-bs-theme', theme);
        toggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        localStorage.setItem('color-scheme', theme);
    };

    // Initialize button text based on current theme
    setTheme(root.getAttribute('data-color-scheme') || 'light');

    toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
        setTheme(current);
    });
}
