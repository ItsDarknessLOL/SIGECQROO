// ============================================================
// SIGECQROO — accessibility.js
// Módulo de accesibilidad: tema, fuente, contraste, dislexia, etc.
// ============================================================

let accessibilityPrefs = { ...CONFIG.defaultAccessibility };

function loadAccessibilityPrefs() {
    const saved = localStorage.getItem(CONFIG.storageKeys.accessibility);
    if (saved) {
        accessibilityPrefs = { ...accessibilityPrefs, ...JSON.parse(saved) };
    }
    applyAccessibilityPrefs();
}

function saveAccessibilityPrefs() {
    localStorage.setItem(CONFIG.storageKeys.accessibility, JSON.stringify(accessibilityPrefs));
}

function applyAccessibilityPrefs() {
    // Tema
    if (accessibilityPrefs.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeButtons();

    // Tamaño de fuente
    document.documentElement.classList.remove('font-small', 'font-large', 'font-xlarge');
    if (accessibilityPrefs.fontSize !== 'normal') {
        document.documentElement.classList.add(`font-${accessibilityPrefs.fontSize}`);
    }
    updateFontSizeButtons();

    // Alto contraste
    if (accessibilityPrefs.highContrast) {
        document.body.classList.add('high-contrast');
        const cb = document.getElementById('high-contrast-toggle');
        if (cb) cb.checked = true;
    }

    // Dislexia
    if (accessibilityPrefs.dyslexia) {
        document.body.classList.add('dyslexia-friendly');
        const cb = document.getElementById('dyslexia-toggle');
        if (cb) cb.checked = true;
    }

    // Reducir animaciones
    if (accessibilityPrefs.reduceMotion) {
        document.body.classList.add('reduce-motion');
        const cb = document.getElementById('reduce-motion-toggle');
        if (cb) cb.checked = true;
    }

    // Espaciado
    if (accessibilityPrefs.spacing === 'wide') {
        document.body.style.lineHeight = '1.8';
        document.querySelectorAll('p, li').forEach(el => el.style.marginBottom = '1em');
    }

    // Actualizar botones de espaciado
    updateSpacingButtons();
}

// ---------- Panel toggle ----------
function toggleAccessibilityPanel() {
    const panel = document.getElementById('accessibility-panel');
    const toggle = document.querySelector('.accessibility-toggle');

    panel.classList.toggle('open');
    toggle.classList.toggle('active');

    if (panel.classList.contains('open')) {
        toggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
        toggle.innerHTML = '<i class="fas fa-universal-access"></i>';
    }
}

// ---------- Theme ----------
function setTheme(theme) {
    accessibilityPrefs.theme = theme;
    saveAccessibilityPrefs();
    applyAccessibilityPrefs();
}

function updateThemeButtons() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const isActive = btn.dataset.theme === accessibilityPrefs.theme;
        btn.classList.toggle('border-cyan-500', isActive);
        btn.classList.toggle('bg-cyan-50', isActive);
        btn.classList.toggle('dark:bg-slate-700', isActive);
        btn.classList.toggle('border-2', isActive);
        btn.classList.toggle('border-slate-200', !isActive);
        btn.classList.toggle('dark:border-slate-600', !isActive);
    });
}

// ---------- Font size ----------
function setFontSize(size) {
    accessibilityPrefs.fontSize = size;
    saveAccessibilityPrefs();
    applyAccessibilityPrefs();
}

function updateFontSizeButtons() {
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    sizes.forEach(size => {
        const btn = document.querySelector(`button[data-size="${size}"]`);
        if (!btn) return;
        const isActive = size === accessibilityPrefs.fontSize;
        btn.classList.toggle('border-cyan-500', isActive);
        btn.classList.toggle('bg-cyan-50', isActive);
        btn.classList.toggle('dark:bg-slate-700', isActive);
        btn.classList.toggle('border-2', isActive);
        btn.classList.toggle('font-semibold', isActive);
        btn.classList.toggle('border', !isActive);
        btn.classList.toggle('border-slate-200', !isActive);
    });
}

// ---------- High contrast ----------
function toggleHighContrast() {
    accessibilityPrefs.highContrast = document.getElementById('high-contrast-toggle').checked;
    document.body.classList.toggle('high-contrast', accessibilityPrefs.highContrast);
    saveAccessibilityPrefs();
}

// ---------- Dyslexia ----------
function toggleDyslexiaMode() {
    accessibilityPrefs.dyslexia = document.getElementById('dyslexia-toggle').checked;
    document.body.classList.toggle('dyslexia-friendly', accessibilityPrefs.dyslexia);
    saveAccessibilityPrefs();
}

// ---------- Reduce motion ----------
function toggleReduceMotion() {
    accessibilityPrefs.reduceMotion = document.getElementById('reduce-motion-toggle').checked;
    document.body.classList.toggle('reduce-motion', accessibilityPrefs.reduceMotion);
    saveAccessibilityPrefs();
}

// ---------- Spacing ----------
function setSpacing(spacing) {
    accessibilityPrefs.spacing = spacing;
    document.body.style.lineHeight = spacing === 'wide' ? '1.8' : '1.5';
    document.querySelectorAll('p, li').forEach(el => {
        el.style.marginBottom = spacing === 'wide' ? '1em' : '';
    });
    updateSpacingButtons();
    saveAccessibilityPrefs();
}

function updateSpacingButtons() {
    document.querySelectorAll('button[data-spacing]').forEach(btn => {
        const isActive = btn.dataset.spacing === accessibilityPrefs.spacing;
        btn.classList.toggle('border-cyan-500', isActive);
        btn.classList.toggle('bg-cyan-50', isActive);
        btn.classList.toggle('border-2', isActive);
        btn.classList.toggle('font-semibold', isActive);
        btn.classList.toggle('border', !isActive);
        btn.classList.toggle('border-slate-200', !isActive);
    });
}

// ---------- Reset ----------
function resetAccessibility() {
    accessibilityPrefs = { ...CONFIG.defaultAccessibility };

    const hc = document.getElementById('high-contrast-toggle');
    const dys = document.getElementById('dyslexia-toggle');
    const rm = document.getElementById('reduce-motion-toggle');
    if (hc) hc.checked = false;
    if (dys) dys.checked = false;
    if (rm) rm.checked = false;

    saveAccessibilityPrefs();
    applyAccessibilityPrefs();

    // Resetear espaciado visualmente
    document.querySelectorAll('button[data-spacing]').forEach(btn => {
        const isNormal = btn.dataset.spacing === 'normal';
        btn.classList.toggle('border-cyan-500', isNormal);
        btn.classList.toggle('bg-cyan-50', isNormal);
        btn.classList.toggle('border-2', isNormal);
        btn.classList.toggle('font-semibold', isNormal);
        btn.classList.toggle('border', !isNormal);
    });
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAccessibilityPrefs, saveAccessibilityPrefs, applyAccessibilityPrefs,
        toggleAccessibilityPanel, setTheme, setFontSize, toggleHighContrast,
        toggleDyslexiaMode, toggleReduceMotion, setSpacing, resetAccessibility
    };
}
