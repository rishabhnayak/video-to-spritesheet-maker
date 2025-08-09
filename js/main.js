import SpritesheetGenerator from './SpritesheetGenerator.js';

async function loadSections() {
    const includeElements = document.querySelectorAll('[data-include]');
    await Promise.all(Array.from(includeElements).map(async (el) => {
        const file = el.getAttribute('data-include');
        const response = await fetch(file);
        el.innerHTML = await response.text();
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadSections();
    new SpritesheetGenerator();
});
