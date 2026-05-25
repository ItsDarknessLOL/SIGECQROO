// ============================================================
// SIGECQROO — config.js
// Configuración global, constantes y utilidades compartidas
// ============================================================

const CONFIG = {
    // Datos
    dataUrl: './data/escuelas.json',
    itemsPerPage: 6,

    // Mapas
    defaultCenter: [21.1619, -86.8515],
    defaultZoom: 12,

    // Tile layers
    tileLayers: {
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap contributors'
        },
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri, Maxar, Earthstar Geographics'
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '© OpenStreetMap contributors © CARTO'
        }
    },

    // Colores por nivel educativo
    levelColors: {
        preescolar: '#f59e0b',
        primaria: '#3b82f6',
        secundaria: '#14b8a6',
        preparatoria: '#6366f1'
    },

    // Clases CSS por nivel (para badges)
    levelClasses: {
        preescolar: 'bg-yellow-100 text-yellow-800',
        primaria: 'bg-blue-100 text-blue-800',
        secundaria: 'bg-teal-100 text-teal-800',
        preparatoria: 'bg-indigo-100 text-indigo-800'
    },

    // Preferencias por defecto
    defaultAccessibility: {
        theme: 'light',
        fontSize: 'normal',
        highContrast: false,
        dyslexia: false,
        reduceMotion: false,
        spacing: 'normal'
    },

    // Claves localStorage
    storageKeys: {
        accessibility: 'sigecqroo-accessibility',
        privacy: 'sigecqroo-privacy-accepted'
    }
};

// ============================================================
// Utilidades globales
// ============================================================

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

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(duration / range));
    stepTime = Math.max(stepTime, minTimer);
    let startTime = new Date().getTime();
    let endTime = startTime + duration;
    let timer;

    function run() {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        obj.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}

function renderMarkdown(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, debounce, animateValue, renderMarkdown };
}
