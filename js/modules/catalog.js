// ============================================================
// SIGECQROO — catalog.js
// Catálogo de escuelas: búsqueda, filtros, paginación inteligente
// ============================================================

let currentPage = 1;

function loadCatalog() {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const filterLevel = document.getElementById('catalog-filter')?.value || 'all';
    const filterSector = document.getElementById('catalog-sector')?.value || 'all';
    const filterRating = parseFloat(document.getElementById('catalog-rating')?.value || 0);

    let filtered = schoolsData.filter(school => {
        const matchesSearch = school.nombre.toLowerCase().includes(searchTerm) ||
                              school.direccion.toLowerCase().includes(searchTerm);
        const matchesLevel = filterLevel === 'all' || school.nivel === filterLevel;
        const matchesSector = filterSector === 'all' || school.sector === filterSector;
        const matchesRating = parseFloat(school.calificacion) >= filterRating;
        return matchesSearch && matchesLevel && matchesSector && matchesRating;
    });

    const totalPages = Math.ceil(filtered.length / CONFIG.itemsPerPage);
    const start = (currentPage - 1) * CONFIG.itemsPerPage;
    const paginated = filtered.slice(start, start + CONFIG.itemsPerPage);

    const container = document.getElementById('schools-grid');
    if (!container) return;

    container.innerHTML = paginated.map((school, index) => `
        <div class="school-card glass rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300" data-aos="fade-up" data-aos-delay="${index * 50}">
            <div class="relative h-56 overflow-hidden group">
                <img src="${school.imagen}" alt="${school.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                    <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-cyan-700 uppercase shadow-md">
                        ${school.nivel}
                    </span>
                    <span class="px-3 py-1 ${school.sector === 'publico' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} rounded-full text-xs font-bold uppercase shadow-md">
                        ${school.sector}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-display font-bold text-lg text-dark line-clamp-2 flex-1 mr-2">${school.nombre}</h3>
                    <div class="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <i class="fas fa-star text-yellow-400 text-xs mr-1"></i>
                        <span class="text-sm font-bold text-yellow-700">${school.calificacion}</span>
                    </div>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="flex items-start text-sm text-slate-600">
                        <i class="fas fa-map-marker-alt text-cyan-500 mt-1 mr-2 w-4"></i>
                        <span class="line-clamp-2">${school.direccion}</span>
                    </div>
                    <div class="flex items-center text-sm text-slate-600">
                        <i class="fas fa-phone text-cyan-500 mr-2 w-4"></i>
                        <span>${school.telefono}</span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-2 mb-4">
                    ${school.servicios.slice(0, 3).map(s => `
                        <span class="text-xs px-2 py-1 bg-cyan-50 text-cyan-600 rounded-md border border-cyan-100">
                            ${s}
                        </span>
                    `).join('')}
                </div>

                <button onclick="openSchoolModal(${school.id})"
                        class="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    <i class="fas fa-info-circle"></i> Ver Información Completa
                </button>
            </div>
        </div>
    `).join('');

    generateSmartPagination(totalPages, filtered.length);
}

function generateSmartPagination(totalPages, totalItems) {
    const paginationContainer = document.getElementById('pagination');
    const infoContainer = document.getElementById('pagination-info');

    if (!paginationContainer || !infoContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        infoContainer.innerHTML = `Mostrando ${totalItems} escuela${totalItems !== 1 ? 's' : ''}`;
        return;
    }

    let paginationHTML = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Botón "Anterior"
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})"
                class="w-10 h-10 rounded-lg font-semibold transition-all flex items-center justify-center ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-cyan-50 border border-slate-200'}"
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Primera página + ellipsis
    if (startPage > 1) {
        paginationHTML += `
            <button onclick="changePage(1)" class="w-10 h-10 rounded-lg font-semibold transition-all bg-white text-slate-600 hover:bg-cyan-50 border border-slate-200">
                1
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis"><i class="fas fa-ellipsis-h"></i></span>`;
        }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})"
                    class="w-10 h-10 rounded-lg font-semibold transition-all ${i === currentPage ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-cyan-50 border border-slate-200'}">
                ${i}
            </button>
        `;
    }

    // Última página + ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis"><i class="fas fa-ellipsis-h"></i></span>`;
        }
        paginationHTML += `
            <button onclick="changePage(${totalPages})" class="w-10 h-10 rounded-lg font-semibold transition-all bg-white text-slate-600 hover:bg-cyan-50 border border-slate-200">
                ${totalPages}
            </button>
        `;
    }

    // Botón "Siguiente"
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})"
                class="w-10 h-10 rounded-lg font-semibold transition-all flex items-center justify-center ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-600 hover:bg-cyan-50 border border-slate-200'}"
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;

    const start = (currentPage - 1) * CONFIG.itemsPerPage + 1;
    const end = Math.min(currentPage * CONFIG.itemsPerPage, totalItems);
    infoContainer.innerHTML = `Mostrando ${start} - ${end} de ${totalItems} escuelas`;
}

function changePage(page) {
    const searchTerm = (document.getElementById('search-input')?.value || '').toLowerCase();
    const filterLevel = document.getElementById('catalog-filter')?.value || 'all';
    const filterSector = document.getElementById('catalog-sector')?.value || 'all';
    const filterRating = parseFloat(document.getElementById('catalog-rating')?.value || 0);

    let filtered = schoolsData.filter(school => {
        const matchesSearch = school.nombre.toLowerCase().includes(searchTerm) ||
                              school.direccion.toLowerCase().includes(searchTerm);
        const matchesLevel = filterLevel === 'all' || school.nivel === filterLevel;
        const matchesSector = filterSector === 'all' || school.sector === filterSector;
        const matchesRating = parseFloat(school.calificacion) >= filterRating;
        return matchesSearch && matchesLevel && matchesSector && matchesRating;
    });

    const totalPages = Math.ceil(filtered.length / CONFIG.itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    loadCatalog();
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function loadFeaturedSchools() {
    const container = document.getElementById('featured-schools');
    if (!container) return;

    const featured = schoolsData.slice(0, 3);

    container.innerHTML = featured.map((school, index) => `
        <div class="school-card glass rounded-2xl overflow-hidden shadow-lg" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="relative h-48 overflow-hidden">
                <img src="${school.imagen}" alt="${school.nombre}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-cyan-600 shadow-md">
                    <i class="fas fa-star text-yellow-400 mr-1"></i> ${school.calificacion}
                </div>
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span class="text-white text-xs font-semibold px-2 py-1 bg-cyan-600 rounded-full uppercase">${school.nivel}</span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="font-display font-bold text-xl text-dark mb-2 line-clamp-1">${school.nombre}</h3>
                <p class="text-slate-600 text-sm mb-4 line-clamp-2">${school.descripcion}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500 capitalize">
                        <i class="fas fa-building mr-1"></i> ${school.sector}
                    </span>
                    <button onclick="openSchoolModal(${school.id})" class="text-cyan-600 font-semibold text-sm hover:text-cyan-700 flex items-center gap-1 transition-colors">
                        Ver más <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    animateValue('stat-schools', 0, schoolsData.length, 1500);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadCatalog, changePage, loadFeaturedSchools, updateStats };
}
