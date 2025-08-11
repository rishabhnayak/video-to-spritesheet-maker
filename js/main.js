document.addEventListener('DOMContentLoaded', () => {
    new SpritesheetGenerator();
    initThemeToggle();
});

function initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle || !icon) return;

    const setTheme = (theme) => {
        root.setAttribute('data-color-scheme', theme);
        root.setAttribute('data-bs-theme', theme);
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        toggle.setAttribute(
            'aria-label',
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        );
        localStorage.setItem('color-scheme', theme);
    };

    // Initialize button icon based on current theme
    setTheme(root.getAttribute('data-color-scheme') || 'light');

    toggle.addEventListener('click', () => {
        const current =
            root.getAttribute('data-color-scheme') === 'dark' ? 'light' : 'dark';
        setTheme(current);
    });
}
