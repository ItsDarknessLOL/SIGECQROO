// ============================================================
// SIGECQROO — tutorial.js
// Tutorial interactivo con spotlight y flechas
// ============================================================

const tutorialSteps = [
    {
        title: '¡Bienvenido a SIGECQROO!',
        desc: 'Este tutorial te muestra cómo usar el portal educativo de Cancún. Te guiaremos por cada sección con flechas que señalan cada función. Puedes avanzar, retroceder o saltar pasos.',
        target: null,
        hint: null
    },
    {
        title: 'Barra de Navegación',
        desc: 'Desde aquí accedes a todas las secciones: Inicio, Mapa interactivo, Catálogo de escuelas, Información y Acerca de. En móvil aparece como menú hamburguesa (☰).',
        target: '#navbar',
        hint: '↑ La barra de navegación está en la parte superior'
    },
    {
        title: 'Mapa Interactivo',
        desc: 'El mapa muestra todas las escuelas de Cancún con marcadores de colores según nivel educativo. Puedes hacer zoom, filtrar por nivel o sector, y agrupar marcadores cercanos.',
        target: '#map',
        hint: '↓ El mapa interactivo está aquí abajo'
    },
    {
        title: 'Catálogo de Escuelas',
        desc: 'Explora la lista completa de instituciones. Usa el buscador por nombre o filtra por nivel educativo. Haz clic en cualquier tarjeta para ver dirección, teléfono, servicios y más.',
        target: '[data-page="catalogo"]',
        hint: '↑ El botón "Catálogo" está en la barra de navegación'
    },
    {
        title: 'Panel de Accesibilidad',
        desc: 'Personaliza tu experiencia visual: activa modo oscuro o claro, cambia el tamaño del texto, activa alto contraste, modo amigable para dislexia o reduce las animaciones.',
        target: '.accessibility-toggle',
        hint: '→ El botón de accesibilidad está a la derecha'
    },
    {
        title: 'Sección Información',
        desc: 'Encuentra recursos educativos: calendario escolar SEQ, trámites de la Secretaría de Educación de Quintana Roo, becas Benito Juárez y directorio de contactos útiles.',
        target: '[data-page="informacion"]',
        hint: '↑ El botón "Información" está en la barra de navegación'
    },
    {
        title: 'Asistente Virtual',
        desc: '¡Este chatbot responde tus preguntas sobre el portal! Pregúntale cómo buscar escuelas, qué niveles hay, cómo usar el mapa o cualquier duda sobre SIGECQROO.',
        target: '#chatbot-btn',
        hint: '↓ El asistente virtual está en la esquina inferior derecha'
    },
    {
        title: '¡Listo para explorar!',
        desc: 'Ya conoces todas las funciones de SIGECQROO. Puedes volver a este tutorial en cualquier momento con el botón morado (?) en la esquina inferior. ¡Encuentra la mejor escuela!',
        target: null,
        hint: null
    }
];

let tutCurrentStep = 0;

const ARROWS = {
    up: `<svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 55 L20 10" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M8 22 L20 8 L32 22" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    down: `<svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5 L20 50" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M8 38 L20 52 L32 38" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    left: `<svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M55 20 L10 20" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M22 8 L8 20 L22 32" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    right: `<svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20 L50 20" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M38 8 L52 20 L38 32" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

function startTutorial() {
    tutCurrentStep = 0;
    document.getElementById('tutorial-overlay').classList.add('active');
    renderTutStep();
}

function closeTutorial() {
    document.getElementById('tutorial-overlay').classList.remove('active');
    document.getElementById('tut-highlight-box').classList.remove('visible');
    document.getElementById('tut-arrow').classList.remove('visible','arrow-up','arrow-down','arrow-left','arrow-right');
    document.getElementById('tut-card').style.display = 'none';
}

function tutNext() {
    if (tutCurrentStep < tutorialSteps.length - 1) {
        tutCurrentStep++;
        renderTutStep();
    } else {
        closeTutorial();
    }
}

function tutPrev() {
    if (tutCurrentStep > 0) {
        tutCurrentStep--;
        renderTutStep();
    }
}

function renderTutStep() {
    const step = tutorialSteps[tutCurrentStep];
    const total = tutorialSteps.length;
    const card = document.getElementById('tut-card');
    const hbox = document.getElementById('tut-highlight-box');
    const arrow = document.getElementById('tut-arrow');

    document.getElementById('tut-title').textContent = step.title;
    document.getElementById('tut-desc').textContent = step.desc;
    document.getElementById('tut-step-label').textContent = `Paso ${tutCurrentStep + 1} de ${total}`;

    const lbl = document.getElementById('tut-target-label');
    const txt = document.getElementById('tut-target-text');
    if (step.hint) {
        lbl.style.display = 'flex';
        txt.textContent = step.hint;
    } else {
        lbl.style.display = 'none';
    }

    const dotsEl = document.getElementById('tut-dots');
    dotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
        const d = document.createElement('button');
        d.className = 'tut-step-dot' + (i === tutCurrentStep ? ' active' : (i < tutCurrentStep ? ' done' : ''));
        d.setAttribute('aria-label', `Ir al paso ${i+1}`);
        d.onclick = () => { tutCurrentStep = i; renderTutStep(); };
        dotsEl.appendChild(d);
    }

    document.getElementById('tut-prev-btn').style.visibility = tutCurrentStep === 0 ? 'hidden' : 'visible';
    document.getElementById('tut-next-btn').textContent = tutCurrentStep === total - 1 ? '✓ Finalizar' : 'Siguiente →';

    card.style.display = 'block';
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';

    arrow.className = 'visible';
    hbox.classList.remove('visible');

    if (step.target) {
        const el = document.querySelector(step.target);
        if (el) {
            const rect = el.getBoundingClientRect();
            const pad = 6;

            hbox.style.top    = (rect.top - pad) + 'px';
            hbox.style.left   = (rect.left - pad) + 'px';
            hbox.style.width  = (rect.width + pad * 2) + 'px';
            hbox.style.height = (rect.height + pad * 2) + 'px';
            hbox.classList.add('visible');

            placeArrow(arrow, rect);
            return;
        }
    }

    arrow.classList.remove('visible');
}

function placeArrow(arrow, targetRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = targetRect.left + targetRect.width / 2;
    const cy = targetRect.top + targetRect.height / 2;
    const screenCX = vw / 2;
    const screenCY = vh / 2;

    const dx = cx - screenCX;
    const dy = cy - screenCY;

    let dir;
    if (Math.abs(dy) >= Math.abs(dx)) {
        dir = dy < 0 ? 'up' : 'down';
    } else {
        dir = dx < 0 ? 'left' : 'right';
    }

    arrow.innerHTML = ARROWS[dir];
    arrow.classList.remove('arrow-up','arrow-down','arrow-left','arrow-right');
    arrow.classList.add('arrow-' + dir);

    const arrowGap = 12;
    if (dir === 'up') {
        const ax = Math.max(16, Math.min(cx - 20, vw - 56));
        const ay = Math.max(arrowGap, targetRect.bottom + arrowGap);
        arrow.style.left = ax + 'px';
        arrow.style.top  = Math.min(ay, screenCY - 160) + 'px';
    } else if (dir === 'down') {
        const ax = Math.max(16, Math.min(cx - 20, vw - 56));
        const ay = Math.max(screenCY + 140, targetRect.top - 72);
        arrow.style.left = ax + 'px';
        arrow.style.top  = Math.min(ay, vh - 80) + 'px';
    } else if (dir === 'left') {
        const ay = Math.max(16, Math.min(cy - 20, vh - 56));
        const ax = Math.max(arrowGap, targetRect.right + arrowGap);
        arrow.style.top  = ay + 'px';
        arrow.style.left = Math.min(ax, screenCX - 200) + 'px';
    } else {
        const ay = Math.max(16, Math.min(cy - 20, vh - 56));
        const ax = Math.max(screenCX + 170, targetRect.left - 72);
        arrow.style.top  = ay + 'px';
        arrow.style.left = Math.min(ax, vw - 76) + 'px';
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { startTutorial, closeTutorial, tutNext, tutPrev };
}
