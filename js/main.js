// ============================================================
// SIGECQROO — main.js
// Punto de entrada: carga datos, inicializa todos los módulos
// ============================================================

let schoolsData = [];

async function loadSchoolsData() {
    const loadingScreen = document.getElementById('loading-screen');

    try {
        const response = await fetch(CONFIG.dataUrl);
        const data = await response.json();
        schoolsData = data.escuelas || data;

        initializeApp();

        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }, 800);

    } catch (error) {
        console.error('Error cargando datos:', error);
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="text-center p-8">
                    <i class="fas fa-exclamation-triangle text-yellow-400 text-4xl mb-4"></i>
                    <h2 class="text-white font-bold text-xl mb-2">Error al cargar datos</h2>
                    <p class="text-slate-400 mb-4">No se pudieron cargar las escuelas</p>
                    <button onclick="location.reload()" class="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

function initializeApp() {
    loadAccessibilityPrefs();

    AOS.init({
        duration: accessibilityPrefs.reduceMotion ? 0 : 800,
        once: true,
        offset: 100
    });

    initMaps();
    loadFeaturedSchools();
    loadCatalog();
    updateStats();
    fillStatsBreakdown();
    initHomeTabs();
    initNavbarScroll();
    initEscapeKey();
    initPrivacyModal();
    initChatbotBadge();

    // Sync initial page nav state
    const initialPage = 'inicio';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === initialPage);
        link.classList.toggle('text-cyan-600', link.dataset.page === initialPage);
    });
    if (typeof syncBottomNav === 'function') syncBottomNav(initialPage);

    // Event listeners para catálogo
    const searchInput = document.getElementById('search-input');
    const catalogFilter = document.getElementById('catalog-filter');
    const catalogSector = document.getElementById('catalog-sector');
    const catalogRating = document.getElementById('catalog-rating');

    if (searchInput) searchInput.addEventListener('input', debounce(loadCatalog, 300));
    if (catalogFilter) catalogFilter.addEventListener('change', loadCatalog);
    if (catalogSector) catalogSector.addEventListener('change', loadCatalog);
    if (catalogRating) catalogRating.addEventListener('change', loadCatalog);
}

// ── Tabs del inicio ──────────────────────────────────────────
function initHomeTabs() {
    ['estadisticas', 'mapa', 'catalogo'].forEach(function(tab) {
        var btn = document.getElementById('tab-btn-' + tab);
        if (btn) btn.addEventListener('click', function() { setHomeTab(tab); });
    });
}

function setHomeTab(tab) {
    var tabs = ['estadisticas', 'mapa', 'catalogo'];
    tabs.forEach(function(t) {
        var btn   = document.getElementById('tab-btn-' + t);
        var panel = document.getElementById('home-panel-' + t);
        if (!btn || !panel) return;
        var isActive = (t === tab);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        panel.style.display = isActive ? '' : 'none';
        if (isActive) {
            // Re-trigger animación CSS
            panel.style.animation = 'none';
            panel.offsetWidth; // reflow
            panel.style.animation = '';
        }
    });

    // Leaflet necesita invalidateSize cuando el contenedor estaba oculto
    if (tab === 'mapa') {
        setTimeout(function() {
            if (typeof map !== 'undefined' && map && map.invalidateSize) {
                map.invalidateSize();
            }
        }, 150);
    }
}

// ── Estadísticas de inicio ───────────────────────────────────
function fillStatsBreakdown() {
    var data  = schoolsData || [];
    var total = data.length;
    if (!total) return;

    var publica  = data.filter(function(s) { return (s.sector || '').toLowerCase() === 'publico'; }).length;
    var privada  = total - publica;
    var conCal   = data.filter(function(s) { return parseFloat(s.calificacion) > 0; }).length;

    // Tarjetas superiores (stat-publicas, stat-privadas, stat-calificadas ya existen en el HTML)
    var elPub = document.getElementById('stat-publicas');
    var elPri = document.getElementById('stat-privadas');
    var elCal = document.getElementById('stat-calificadas');
    if (elPub) animateCount(elPub, publica);
    if (elPri) animateCount(elPri, privada);
    if (elCal) animateCount(elCal, conCal);

    // Barras de distribución
    function pct(n) { return total > 0 ? Math.round(n / total * 100) : 0; }

    function applyBar(countId, barId, pctId, n) {
        var cEl = document.getElementById(countId);
        var bEl = document.getElementById(barId);
        var pEl = document.getElementById(pctId);
        if (cEl) cEl.textContent = n;
        if (pEl) pEl.textContent = pct(n) + '% del total';
        if (bEl) setTimeout(function() { bEl.style.width = pct(n) + '%'; }, 200);
    }

    applyBar('count-publica',  'bar-publica',  'pct-publica',  publica);
    applyBar('count-privada',  'bar-privada',  'pct-privada',  privada);

    // Servicios / modalidades disponibles
    var serviciosMap = {};
    data.forEach(function(s) {
        (s.servicios || []).forEach(function(sv) {
            serviciosMap[sv] = (serviciosMap[sv] || 0) + 1;
        });
    });
    var container = document.getElementById('servicios-tags');
    if (container) {
        var sorted = Object.keys(serviciosMap).sort(function(a,b){ return serviciosMap[b]-serviciosMap[a]; });
        container.innerHTML = sorted.map(function(sv) {
            return '<span class="inline-flex items-center gap-1 px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-full text-xs font-medium">'
                + '<i class="fas fa-check-circle text-cyan-500"></i>' + sv
                + ' <span class="text-cyan-400">(' + serviciosMap[sv] + ')</span></span>';
        }).join('');
    }
}

function animateCount(el, target) {
    var start = 0;
    var duration = 800;
    var step = target / (duration / 16);
    var interval = setInterval(function() {
        start += step;
        if (start >= target) { start = target; clearInterval(interval); }
        el.textContent = Math.floor(start);
    }, 16);
}

// loadSchoolsData() es llamado desde index.html una vez que
// todas las páginas HTML han sido inyectadas en el DOM.
