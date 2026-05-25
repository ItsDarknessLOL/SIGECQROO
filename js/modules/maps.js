// ============================================================
// SIGECQROO — maps.js  (Media Superior Edition)
// Mapa completo con zonas, rutas, distancias y herramientas
// ============================================================

// ── Estado global del mapa ───────────────────────────────────
let map;
let mapFull;
let markers = [];
let currentMapType = 'osm';
let currentTileLayer = null;
let currentTileLayerFull = null;
let currentRating = 0;

// Zonas geográficas de Cancún (por latitud)
// Norte:  lat > 21.175
// Centro: 21.135 <= lat <= 21.175
// Sur:    21.08 <= lat < 21.135
// Puerto Morelos: lat < 21.08

const ZONES = {
    norte:        { label: 'Zona Norte',      color: '#3b82f6', minLat: 21.175,  maxLat: 99 },
    centro:       { label: 'Zona Centro',     color: '#6366f1', minLat: 21.135,  maxLat: 21.175 },
    sur:          { label: 'Zona Sur',        color: '#f97316', minLat: 21.08,   maxLat: 21.135 },
    puertoMorelos:{ label: 'Puerto Morelos',  color: '#22c55e', minLat: -99,     maxLat: 21.08  }
};

function getZone(lat) {
    if (lat >= ZONES.norte.minLat)        return 'norte';
    if (lat >= ZONES.centro.minLat)       return 'centro';
    if (lat >= ZONES.sur.minLat)          return 'sur';
    return 'puertoMorelos';
}

// ── Modo de herramientas ─────────────────────────────────────
let activeMode = null; // 'route' | 'measure'
let userLatLng = null;
let userMarker = null;
let routeLine = null;
let measurePoints = [];
let measureLine = null;
let measureLabel = null;
let zonePolygons = [];
let zoneLabels = [];
let nearestMarker = null;

// ── Inicialización ───────────────────────────────────────────
function initMaps() {
    // Mapa pequeño del inicio (si existe)
    const mapEl = document.getElementById('map');
    if (mapEl) {
        map = L.map('map').setView(CONFIG.defaultCenter, CONFIG.defaultZoom);
        currentTileLayer = L.tileLayer(CONFIG.tileLayers.osm.url, {
            attribution: CONFIG.tileLayers.osm.attribution
        }).addTo(map);
        addMarkersToMap(map, false, 'all', ['publico','privado'], 0);
    }

    // Mapa grande de la sección
    const mapFullEl = document.getElementById('map-full');
    if (!mapFullEl) return;

    mapFull = L.map('map-full', { zoomControl: true }).setView(CONFIG.defaultCenter, 12);
    currentTileLayerFull = L.tileLayer(CONFIG.tileLayers.osm.url, {
        attribution: CONFIG.tileLayers.osm.attribution
    }).addTo(mapFull);

    // Dibujar polígonos de zonas
    drawZoneOverlays();

    // Marcadores iniciales (solo Media Superior)
    addMarkersToMap(mapFull, false, 'preparatoria', ['publico','privado'], 0);
    updateZoneStats();

    // Clic en mapa para herramientas
    mapFull.on('click', handleMapClick);
}

// ── Overlays de zonas ────────────────────────────────────────
function drawZoneOverlays() {
    if (!mapFull) return;
    // Limpiar anteriores
    zonePolygons.forEach(p => mapFull.removeLayer(p));
    zoneLabels.forEach(l => mapFull.removeLayer(l));
    zonePolygons = [];
    zoneLabels = [];

    const bounds = {
        norte:         [[21.175, -86.99], [21.22, -86.78]],
        centro:        [[21.135, -86.99], [21.175, -86.78]],
        sur:           [[21.08,  -86.99], [21.135, -86.78]],
        puertoMorelos: [[21.02,  -86.99], [21.08,  -86.78]]
    };
    const centerLat = {
        norte: 21.197, centro: 21.155, sur: 21.11, puertoMorelos: 21.055
    };

    Object.entries(ZONES).forEach(([key, zone]) => {
        const b = bounds[key];
        const polygon = L.rectangle(b, {
            color: zone.color,
            weight: 2,
            fillColor: zone.color,
            fillOpacity: 0.04,
            dashArray: '6,6',
            interactive: false
        }).addTo(mapFull);
        zonePolygons.push(polygon);

        // Etiqueta de zona
        const labelIcon = L.divIcon({
            className: '',
            html: `<div style="background:rgba(255,255,255,0.88);border-radius:8px;padding:3px 9px;font-size:11px;font-weight:700;color:${zone.color};border:1.5px solid ${zone.color}30;white-space:nowrap;pointer-events:none;">${zone.label}</div>`,
            iconAnchor: [50, 10]
        });
        const label = L.marker([centerLat[key], -86.89], { icon: labelIcon, interactive: false, zIndexOffset: -100 }).addTo(mapFull);
        zoneLabels.push(label);
    });
}

// ── Marcadores ───────────────────────────────────────────────
function addMarkersToMap(mapInstance, useCluster = false, filterLevel = 'preparatoria', filterSector = ['publico','privado'], filterRating = 0, filterZone = 'all') {
    if (mapInstance === mapFull) {
        markers.forEach(m => { if (mapFull.hasLayer(m)) mapFull.removeLayer(m); });
        markers = [];
    }

    // Siempre filtrar por preparatoria en el mapa completo
    const level = (mapInstance === mapFull) ? 'preparatoria' : filterLevel;

    const filtered = schoolsData.filter(school => {
        if (school.nivel !== level) return false;
        if (!filterSector.includes(school.sector)) return false;
        if (parseFloat(school.calificacion) < parseFloat(filterRating)) return false;
        if (filterZone !== 'all' && getZone(school.lat) !== filterZone) return false;
        return true;
    });

    filtered.forEach(school => {
        const zone = getZone(school.lat);
        const zoneColor = ZONES[zone]?.color || '#6366f1';
        const sectorAccent = school.sector === 'publico' ? '#06b6d4' : '#f43f5e';
        const stars = parseFloat(school.calificacion) > 0
            ? `<span style="color:#f59e0b;">${'★'.repeat(Math.round(school.calificacion))}</span> <span style="font-size:11px;color:#94a3b8;">${school.calificacion}</span>`
            : `<span style="color:#cbd5e1;font-size:11px;">Sin calificación</span>`;

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="position:relative;">
                <div style="background:${sectorAccent};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-school" style="color:white;font-size:11px;transform:rotate(45deg);"></i>
                </div>
                <div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:${zoneColor};border:2px solid white;"></div>
            </div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 28]
        });

        const marker = L.marker([school.lat, school.lng], { icon, school })
            .bindPopup(`
                <div style="min-width:200px;padding:4px;">
                    <div style="font-weight:700;color:#1e293b;margin-bottom:2px;font-size:13px;">${school.nombre}</div>
                    <div style="font-size:11px;color:#64748b;margin-bottom:6px;">
                        <span style="text-transform:capitalize;">${school.sector}</span> &bull;
                        <span style="background:${zoneColor}22;color:${zoneColor};padding:1px 6px;border-radius:4px;">${ZONES[zone]?.label}</span>
                    </div>
                    <div style="margin-bottom:6px;">${stars}</div>
                    ${school.direccion ? `<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${school.direccion}</div>` : ''}
                    <div style="display:flex;gap:6px;">
                        <button onclick="openSchoolModal(${school.id})" style="flex:1;font-size:11px;background:#0891b2;color:white;border:none;padding:5px 8px;border-radius:7px;cursor:pointer;font-weight:600;">
                            Ver detalles
                        </button>
                        <button onclick="routeToSchool(${school.lat},${school.lng},'${school.nombre.replace(/'/g,"\\'")}');"
                            style="font-size:11px;background:#7c3aed;color:white;border:none;padding:5px 8px;border-radius:7px;cursor:pointer;font-weight:600;">
                            <i class="fas fa-route"></i> Ruta
                        </button>
                    </div>
                </div>
            `);

        // En modo ruta: clic en marcador activa ruta directamente
        marker.on('click', function(e) {
            if (activeMode === 'route') {
                e.originalEvent && e.originalEvent.stopPropagation();
                routeToSchool(school.lat, school.lng, school.nombre);
                return;
            }
        });

        marker.addTo(mapInstance);
        if (mapInstance === mapFull) markers.push(marker);
    });

    // Actualizar contador
    const countEl = document.getElementById('map-school-count');
    if (countEl && mapInstance === mapFull) countEl.textContent = filtered.length;

    return filtered.length;
}

// ── Filtros ──────────────────────────────────────────────────
function applyMapFilters() {
    const sectors = [];
    if (document.getElementById('chk-publico')?.checked) sectors.push('publico');
    if (document.getElementById('chk-privado')?.checked) sectors.push('privado');
    if (sectors.length === 0) sectors.push('publico', 'privado');

    const zone = document.getElementById('filter-zone')?.value || 'all';

    addMarkersToMap(mapFull, false, 'preparatoria', sectors, currentRating, zone);
    updateZoneStats(sectors);
}

function setRatingFilter(btn, val) {
    currentRating = val;
    document.querySelectorAll('.rating-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyMapFilters();
}

function toggleSector(sector) {
    const chk = document.getElementById('chk-' + sector);
    const lbl = document.getElementById('lbl-' + sector);
    const dot = document.getElementById('dot-' + sector);
    if (!chk) return;
    chk.checked = !chk.checked;
    const color = sector === 'publico' ? '#06b6d4' : '#f43f5e';
    if (chk.checked) {
        dot.style.background = color;
        lbl.style.opacity = '1';
    } else {
        dot.style.background = '#cbd5e1';
        lbl.style.opacity = '0.5';
    }
    applyMapFilters();
}

function filterByZone(zone) {
    const sel = document.getElementById('filter-zone');
    if (sel) sel.value = zone;
    applyMapFilters();
    // Flyto zona
    const centerMap = {
        norte: [21.190, -86.858],
        centro: [21.158, -86.862],
        sur: [21.112, -86.870],
        puertoMorelos: [21.065, -86.874]
    };
    const zoomMap = { norte: 13, centro: 13, sur: 13, puertoMorelos: 12 };
    if (centerMap[zone] && mapFull) {
        mapFull.flyTo(centerMap[zone], zoomMap[zone] || 13, { duration: 0.8 });
    }
}

function updateZoneStats(sectors = ['publico','privado']) {
    const prep = schoolsData.filter(s => s.nivel === 'preparatoria' && sectors.includes(s.sector));
    const counts = { norte: 0, centro: 0, sur: 0, puertoMorelos: 0 };
    prep.forEach(s => { const z = getZone(s.lat); if (counts[z] !== undefined) counts[z]++; });

    ['norte','centro','sur','puertoMorelos'].forEach(z => {
        const sidebar = document.getElementById('zone-count-' + z);
        const stat    = document.getElementById('zs-' + (z === 'puertoMorelos' ? 'pm' : z));
        if (sidebar) sidebar.textContent = counts[z] + ' escuelas';
        if (stat)    stat.textContent    = counts[z];
    });
}

// ── Tipo de mapa ─────────────────────────────────────────────
function setMapType(type) {
    currentMapType = type;
    const cfg = CONFIG.tileLayers[type];
    ['osm','satellite','dark'].forEach(t => {
        const btn = document.getElementById('btn-' + t);
        if (btn) btn.classList.toggle('active', t === type);
    });

    if (mapFull) {
        if (currentTileLayerFull) mapFull.removeLayer(currentTileLayerFull);
        currentTileLayerFull = L.tileLayer(cfg.url, { attribution: cfg.attribution });
        currentTileLayerFull.addTo(mapFull);
    }
    if (map) {
        if (currentTileLayer) map.removeLayer(currentTileLayer);
        currentTileLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution });
        currentTileLayer.addTo(map);
    }
}

// ── Herramienta: Mi Ubicación ────────────────────────────────
function locateUser(callback) {
    if (!navigator.geolocation) {
        showToolResult('error', 'Geolocalización no disponible en este navegador.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
            if (userMarker) mapFull.removeLayer(userMarker);
            const icon = L.divIcon({
                className: '',
                html: `<div style="width:18px;height:18px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(34,197,94,.3);"></div>`,
                iconSize: [18,18], iconAnchor: [9,9]
            });
            userMarker = L.marker(userLatLng, { icon }).addTo(mapFull)
                .bindPopup('<b>Tu ubicación</b>');
            mapFull.flyTo(userLatLng, 14, { duration: 0.8 });
            showToolResult('success', `<i class="fas fa-crosshairs text-green-500 mr-1"></i><b>Ubicación encontrada</b><br><span class="text-xs text-slate-500">${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}</span>`);
            if (callback) callback(userLatLng);
        },
        () => showToolResult('error', 'No se pudo obtener tu ubicación. Verifica los permisos.')
    );
}

// ── Herramienta: Escuela más cercana ─────────────────────────
function findNearest() {
    const doFind = (latLng) => {
        const preps = schoolsData.filter(s => s.nivel === 'preparatoria');
        let nearest = null, minDist = Infinity;
        preps.forEach(s => {
            const d = latLng.distanceTo(L.latLng(s.lat, s.lng));
            if (d < minDist) { minDist = d; nearest = s; }
        });
        if (!nearest) return;

        if (nearestMarker) mapFull.removeLayer(nearestMarker);
        const icon = L.divIcon({
            className: 'marker-nearest',
            html: `<div style="background:#f59e0b;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:4px solid white;box-shadow:0 0 0 3px #f59e0b,0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-star" style="color:white;font-size:13px;transform:rotate(45deg);"></i>
                   </div>`,
            iconSize: [36,36], iconAnchor: [18,36]
        });
        nearestMarker = L.marker([nearest.lat, nearest.lng], { icon }).addTo(mapFull);
        mapFull.flyTo([nearest.lat, nearest.lng], 15, { duration: 1 });

        const dist = minDist < 1000
            ? `${Math.round(minDist)} m`
            : `${(minDist/1000).toFixed(2)} km`;
        const walk = Math.round(minDist / 80); // ~80m/min caminando
        const drive = Math.round(minDist / 500); // ~500m/min manejando

        showToolResult('info', `
            <div class="text-sm font-bold text-slate-800 mb-1"><i class="fas fa-graduation-cap text-indigo-500 mr-1"></i>${nearest.nombre}</div>
            <div class="text-xs text-slate-500 mb-2">${ZONES[getZone(nearest.lat)]?.label} &bull; ${nearest.sector}</div>
            <div class="flex gap-3 text-xs">
                <span><i class="fas fa-ruler text-cyan-500 mr-1"></i><b>${dist}</b></span>
                <span><i class="fas fa-walking text-green-500 mr-1"></i>~${walk} min</span>
                <span><i class="fas fa-car text-blue-500 mr-1"></i>~${drive} min</span>
            </div>
            <button onclick="routeToSchool(${nearest.lat},${nearest.lng},'${nearest.nombre.replace(/'/g,"\\'")}')" class="mt-2 w-full text-xs bg-purple-600 text-white py-1.5 rounded-lg font-semibold">
                <i class="fas fa-route mr-1"></i>Trazar ruta
            </button>
        `);
    };

    if (userLatLng) {
        doFind(userLatLng);
    } else {
        locateUser(doFind);
    }
}

// ── Herramienta: Ruta a una escuela ─────────────────────────
function routeToSchool(lat, lng, nombre) {
    if (!userLatLng) {
        locateUser(ulatlng => drawRoute(ulatlng, lat, lng, nombre));
    } else {
        drawRoute(userLatLng, lat, lng, nombre);
    }
    cancelActiveMode();
}

function drawRoute(from, toLat, toLng, nombre) {
    if (routeLine) mapFull.removeLayer(routeLine);

    const to = L.latLng(toLat, toLng);
    const dist = from.distanceTo(to);
    const distStr = dist < 1000 ? `${Math.round(dist)} m` : `${(dist/1000).toFixed(2)} km`;
    const walk = Math.round(dist / 80);
    const drive = Math.round(dist / 500);

    routeLine = L.polyline([from, to], {
        color: '#7c3aed', weight: 4, opacity: 0.85, dashArray: '10,6',
        lineCap: 'round', lineJoin: 'round'
    }).addTo(mapFull);

    // Decoración de flecha
    const mid = L.latLng((from.lat + toLat)/2, (from.lng + toLng)/2);
    mapFull.fitBounds(L.latLngBounds([from, to]).pad(0.15));

    showToolResult('info', `
        <div class="text-sm font-bold text-purple-700 mb-1"><i class="fas fa-route text-purple-500 mr-1"></i>Ruta a ${nombre}</div>
        <div class="flex gap-4 text-xs mt-2">
            <div class="text-center">
                <div class="font-bold text-slate-800">${distStr}</div>
                <div class="text-slate-400">Distancia</div>
            </div>
            <div class="text-center">
                <div class="font-bold text-slate-800">~${walk} min</div>
                <div class="text-slate-400"><i class="fas fa-walking text-green-500"></i> Caminando</div>
            </div>
            <div class="text-center">
                <div class="font-bold text-slate-800">~${drive} min</div>
                <div class="text-slate-400"><i class="fas fa-car text-blue-500"></i> En auto</div>
            </div>
        </div>
        <a href="https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${toLat},${toLng}&travelmode=driving"
           target="_blank" class="mt-2 block text-center text-xs bg-green-600 text-white py-1.5 rounded-lg font-semibold hover:bg-green-700 transition">
            <i class="fab fa-google mr-1"></i>Abrir en Google Maps
        </a>
    `);
}

// ── Herramienta: Modo ruta (clic en escuela) ─────────────────
function toggleRouteMode() {
    if (activeMode === 'route') {
        cancelActiveMode();
        return;
    }
    activeMode = 'route';
    document.getElementById('route-badge')?.classList.remove('hidden');
    document.getElementById('btn-route')?.classList.add('active-tool');
    showBanner('Modo Ruta activo — haz clic en cualquier marcador de escuela para trazar una ruta desde tu ubicación.');
}

// ── Herramienta: Medir distancia ─────────────────────────────
function toggleMeasureMode() {
    if (activeMode === 'measure') {
        cancelActiveMode();
        return;
    }
    activeMode = 'measure';
    measurePoints = [];
    document.getElementById('measure-badge')?.classList.remove('hidden');
    document.getElementById('btn-measure')?.classList.add('active-tool');
    showBanner('Modo Medición — haz clic en 2 puntos del mapa para medir la distancia entre ellos.');
}

function handleMapClick(e) {
    if (activeMode !== 'measure') return;
    measurePoints.push(e.latlng);

    // Marcador temporal
    const dot = L.circleMarker(e.latlng, {
        radius: 6, color: '#f97316', fillColor: '#f97316', fillOpacity: 1, weight: 2
    }).addTo(mapFull);

    if (measurePoints.length === 2) {
        const [p1, p2] = measurePoints;
        const dist = p1.distanceTo(p2);
        const distStr = dist < 1000 ? `${Math.round(dist)} m` : `${(dist/1000).toFixed(2)} km`;

        if (measureLine) mapFull.removeLayer(measureLine);
        measureLine = L.polyline([p1, p2], {
            color: '#f97316', weight: 3, dashArray: '8,5', opacity: 0.9
        }).addTo(mapFull);

        const mid = L.latLng((p1.lat+p2.lat)/2, (p1.lng+p2.lng)/2);
        if (measureLabel) mapFull.removeLayer(measureLabel);
        measureLabel = L.marker(mid, {
            icon: L.divIcon({
                className: '',
                html: `<div style="background:white;border:2px solid #f97316;padding:3px 9px;border-radius:8px;font-size:12px;font-weight:700;color:#c2410c;white-space:nowrap;">${distStr}</div>`,
                iconAnchor: [35, 12]
            })
        }).addTo(mapFull);

        showToolResult('info', `
            <div class="text-sm font-bold text-orange-700"><i class="fas fa-ruler text-orange-500 mr-1"></i>Distancia medida</div>
            <div class="text-2xl font-bold text-slate-800 my-1">${distStr}</div>
            <div class="text-xs text-slate-500">~${Math.round(dist/80)} min caminando &bull; ~${Math.round(dist/500)} min en auto</div>
        `);
        cancelActiveMode();
    }
}

function cancelActiveMode() {
    activeMode = null;
    document.getElementById('route-badge')?.classList.add('hidden');
    document.getElementById('measure-badge')?.classList.add('hidden');
    document.getElementById('btn-route')?.classList.remove('active-tool');
    document.getElementById('btn-measure')?.classList.remove('active-tool');
    hideBanner();
    measurePoints = [];
}

// ── Herramienta: Limpiar ─────────────────────────────────────
function clearMapExtras() {
    if (routeLine) { mapFull.removeLayer(routeLine); routeLine = null; }
    if (measureLine) { mapFull.removeLayer(measureLine); measureLine = null; }
    if (measureLabel) { mapFull.removeLayer(measureLabel); measureLabel = null; }
    if (nearestMarker) { mapFull.removeLayer(nearestMarker); nearestMarker = null; }
    cancelActiveMode();
    hideToolResult();
    measurePoints = [];
}

// ── UI helpers ───────────────────────────────────────────────
function showBanner(text) {
    const banner = document.getElementById('active-mode-banner');
    const textEl = document.getElementById('active-mode-text');
    if (banner && textEl) {
        textEl.textContent = text;
        banner.classList.remove('hidden');
        banner.style.display = 'flex';
    }
}
function hideBanner() {
    const banner = document.getElementById('active-mode-banner');
    if (banner) { banner.classList.add('hidden'); banner.style.display = ''; }
}
function showToolResult(type, html) {
    const card = document.getElementById('tool-result-card');
    const content = document.getElementById('tool-result-content');
    if (!card || !content) return;
    const colors = { success: '#22c55e', error: '#ef4444', info: '#0891b2' };
    card.style.borderLeftColor = colors[type] || colors.info;
    content.innerHTML = html;
    card.classList.remove('hidden');
}
function hideToolResult() {
    document.getElementById('tool-result-card')?.classList.add('hidden');
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMaps, setMapType, addMarkersToMap, applyMapFilters, filterByZone,
                       locateUser, findNearest, routeToSchool, toggleRouteMode, toggleMeasureMode,
                       clearMapExtras, cancelActiveMode, setRatingFilter, toggleSector };
}
