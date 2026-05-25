// ============================================================
// SIGECQROO — navigation.js
// Navegación entre páginas (SPA), menú móvil, scroll navbar
// ============================================================

function navigateTo(pageId) {
    const current = document.querySelector('.page-section.active');
    if (current) {
        current.style.opacity = '0';
        current.style.transform = 'translateY(10px)';
    }

    setTimeout(() => {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
            section.style.opacity = '';
            section.style.transform = '';
        });

        const section = document.getElementById(pageId);
        if (section) section.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active', 'text-cyan-600');
            if (link.dataset.page === pageId) {
                link.classList.add('active', 'text-cyan-600');
            }
        });

        // Sincronizar bottom nav móvil
        if (typeof syncBottomNav === 'function') syncBottomNav(pageId);

        // Invalidar tamaño de mapas al cambiar de vista
        if (pageId === 'mapa' && typeof mapFull !== 'undefined' && mapFull) {
            setTimeout(() => mapFull.invalidateSize(), 200);
        }
        if (pageId === 'inicio' && typeof map !== 'undefined' && map) {
            setTimeout(() => map.invalidateSize(), 200);
        }
    }, 120);

    document.getElementById('mobile-menu').classList.add('hidden');
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

// Navbar scroll effect
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-xl');
            navbar.classList.remove('glass');
            navbar.classList.add('bg-white/95');
        } else {
            navbar.classList.remove('shadow-xl');
            navbar.classList.add('glass');
        }
    });
}

// Escape key para cerrar modales
function initEscapeKey() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeTutorial();
        }
    });
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { navigateTo, toggleMobileMenu, initNavbarScroll, initEscapeKey };
}
