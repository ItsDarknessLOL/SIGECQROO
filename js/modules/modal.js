// ============================================================
// SIGECQROO — modal.js
// Modal de detalles de escuela (popup)
// ============================================================

function openSchoolModal(id) {
    const school = schoolsData.find(s => s.id === id);
    if (!school) return;

    const modal = document.getElementById('school-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    const isDark = document.documentElement.classList.contains('dark');
    const levelClass = CONFIG.levelClasses[school.nivel] || 'bg-cyan-100 text-cyan-800';

    content.innerHTML = `
        <div class="relative">
            <div class="h-64 overflow-hidden relative">
                <img src="${school.imagen}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button onclick="closeModal()" class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
                <div class="absolute bottom-4 left-6 right-6">
                    <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${levelClass}">
                        ${school.nivel}
                    </span>
                    <h2 class="text-2xl md:text-3xl font-display font-bold text-white shadow-sm">${school.nombre}</h2>
                </div>
            </div>

            <div class="p-6 md:p-8 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}">
                <div class="flex items-center gap-4 mb-6">
                    <div class="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                        <i class="fas fa-star text-yellow-400 mr-2"></i>
                        <span class="font-bold text-yellow-700 text-lg">${school.calificacion}</span>
                        <span class="text-yellow-600 text-sm ml-1">/ 5</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full text-sm font-semibold ${school.sector === 'publico' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} capitalize">
                            ${school.sector}
                        </span>
                    </div>
                </div>

                <p class="${isDark ? 'text-slate-300' : 'text-slate-600'} mb-6 leading-relaxed">${school.descripcion}</p>

                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="space-y-4">
                        <h4 class="font-bold ${isDark ? 'text-white' : 'text-dark'} flex items-center gap-2">
                            <i class="fas fa-address-card text-cyan-600"></i> Contacto
                        </h4>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-map-marker-alt text-cyan-500 mt-1 w-4"></i>
                                <span class="${isDark ? 'text-slate-300' : 'text-slate-600'}">${school.direccion}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-phone text-cyan-500 w-4"></i>
                                <span class="${isDark ? 'text-slate-300' : 'text-slate-600'}">${school.telefono}</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="fas fa-envelope text-cyan-500 w-4"></i>
                                <span class="${isDark ? 'text-slate-300' : 'text-slate-600'}">${school.email}</span>
                            </div>
                            <!-- NUEVO: Email, teléfono, redes sociales, sitio web -->
                            ${school.website ? `
                            <div class="flex items-center gap-3">
                                <i class="fas fa-globe text-cyan-500 w-4"></i>
                                <a href="${school.website}" target="_blank" class="text-cyan-600 hover:underline">${school.website}</a>
                            </div>` : ''}
                            ${school.facebook ? `
                            <div class="flex items-center gap-3">
                                <i class="fab fa-facebook text-cyan-500 w-4"></i>
                                <a href="${school.facebook}" target="_blank" class="text-cyan-600 hover:underline">Facebook</a>
                            </div>` : ''}
                            ${school.instagram ? `
                            <div class="flex items-center gap-3">
                                <i class="fab fa-instagram text-cyan-500 w-4"></i>
                                <a href="${school.instagram}" target="_blank" class="text-cyan-600 hover:underline">Instagram</a>
                            </div>` : ''}
                        </div>
                    </div>

                    <div>
                        <h4 class="font-bold ${isDark ? 'text-white' : 'text-dark'} flex items-center gap-2 mb-4">
                            <i class="fas fa-concierge-bell text-cyan-600"></i> Servicios
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${school.servicios.map(s => `
                                <span class="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm border border-cyan-100 flex items-center gap-1">
                                    <i class="fas fa-check text-xs"></i> ${s}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}">
                    <button onclick="window.open('https://www.google.com/maps?q=${school.lat},${school.lng}', '_blank')"
                            class="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-map-marked-alt"></i> Ver en Google Maps
                    </button>
                    <button onclick="closeModal()"
                            class="px-6 py-3 border-2 ${isDark ? 'border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-cyan-400' : 'border-slate-200 text-slate-600 hover:border-cyan-600 hover:text-cyan-600'} rounded-xl font-semibold transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('school-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { openSchoolModal, closeModal };
}
