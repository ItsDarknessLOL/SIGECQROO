// ============================================================
// SIGECQROO — chatbot.js
// Chatbot con base de conocimiento local
// ============================================================

let chatOpen = false;
let chatWaiting = false;

const KB = [
    {
        keys: ['qué es','que es','sigecqroo','sistema','portal','plataforma','para qué','para que','trata'],
        answer: '📚 **SIGECQROO** es el Sistema de Información Geográfica Escolar de Cancún, Quintana Roo. Es un portal educativo que te permite explorar y localizar todas las escuelas de Cancún con información detallada: ubicación en mapa, datos de contacto, servicios disponibles y calificaciones.'
    },
    {
        keys: ['buscar escuela','encontrar','como busco','cómo busco','busco','buscar','encontrar escuela'],
        answer: '🔍 Hay dos formas de buscar escuelas:\n\n**Por Catálogo:** Ve a la sección "Catálogo" en el menú. Escribe el nombre en el buscador o usa el filtro de nivel educativo.\n\n**Por Mapa:** Ve a la sección "Mapa". Verás todos los marcadores. Filtra por nivel o sector y haz clic en cualquier marcador para ver los detalles.'
    },
    {
        keys: ['mapa','marcador','marcadores','ubicación','ubicacion','localizar','donde','dónde'],
        answer: '🗺️ El **Mapa Interactivo** muestra todas las escuelas con marcadores de colores:\n• 🔵 Cyan = Preescolar\n• 🔵 Azul = Primaria\n• 🟢 Teal = Secundaria\n• 🟣 Índigo = Preparatoria\n\nPuedes filtrar por nivel y sector, agrupar marcadores cercanos, y hacer clic en cualquiera para ver los detalles de la escuela.'
    },
    {
        keys: ['niveles','nivel','preescolar','primaria','secundaria','preparatoria','media superior','educativo'],
        answer: '🎓 El portal incluye **4 niveles educativos**:\n\n• **Preescolar** — Educación inicial (3-5 años)\n• **Primaria** — 6 grados (6-12 años)\n• **Secundaria** — 3 grados (12-15 años)\n• **Preparatoria / Media Superior** — Bachillerato (15-18 años)\n\nPuedes filtrar por nivel tanto en el Mapa como en el Catálogo.'
    },
    {
        keys: ['público','publico','privado','sector','gratuita','gratuito','costo','pago'],
        answer: '🏫 Las escuelas están clasificadas en dos sectores:\n\n• **Público:** Sostenidas por el gobierno, sin costo para los estudiantes\n• **Privado:** Instituciones particulares con cuotas\n\nPuedes filtrar por sector en el Mapa usando las casillas "Público" y "Privado" en el panel de filtros.'
    },
    {
        keys: ['beca','becas','apoyo económico','apoyo economico','benito juárez','benito juarez','dinero','ayuda económica'],
        answer: '💰 En la sección **"Información"** del menú encontrarás el enlace a las **Becas Benito Juárez** (www.gob.mx/becasbenitojuarez), que son apoyos económicos del gobierno federal para estudiantes de educación básica y media superior en situación de vulnerabilidad.'
    },
    {
        keys: ['trámite','tramite','inscripción','inscripcion','documentos','seq','secretaría','secretaria','educación quintana roo'],
        answer: '📋 En la sección **"Información"** encontrarás el enlace a los **Trámites SEQ** (seq.gob.mx/tramites), donde puedes realizar gestiones con la Secretaría de Educación de Quintana Roo: inscripciones, certificados, revalidaciones y más.'
    },
    {
        keys: ['calendario','fechas','vacaciones','inicio','fin','ciclo escolar'],
        answer: '📅 El **Calendario Escolar** de Quintana Roo está disponible en la sección **"Información"** del menú. El enlace directo es: seq.qroo.gob.mx/calendarioescolarqr/. Ahí encontrarás todas las fechas del ciclo escolar vigente, períodos vacacionales y días festivos.'
    },
    {
        keys: ['contacto','teléfono','telefono','dirección','direccion','correo','email','llamar','comunicar'],
        answer: '📞 Cada escuela tiene su propia información de contacto. Al hacer clic en una tarjeta del Catálogo o en un marcador del Mapa, verás:\n• Dirección completa\n• Teléfono\n• Correo electrónico\n• Botón para abrir en Google Maps\n\nTambién hay un directorio de autoridades educativas en la sección "Información".'
    },
    {
        keys: ['accesibilidad','oscuro','claro','tema','modo oscuro','fuente','texto','dislexia','contraste','animación','animacion'],
        answer: '⚙️ El botón de **Accesibilidad** (ícono ♿ a la derecha de la pantalla) te permite:\n• Cambiar entre modo **claro/oscuro**\n• Ajustar el **tamaño del texto** (4 opciones)\n• Activar **alto contraste**\n• Activar **modo dislexia amigable**\n• **Reducir animaciones**\n• Ampliar el espaciado del texto\n\nTus preferencias se guardan automáticamente.'
    },
    {
        keys: ['quién hizo','quien hizo','equipo','desarrolladores','autores','creadores','acerca','nosotros'],
        answer: '👥 SIGECQROO fue desarrollado por un equipo de la **Secretaría de Educación de Quintana Roo**. El director del proyecto es **Rubén Alexander Maldonado Calvo**, junto con un equipo de desarrollo web y gestión de datos. Más detalles en la sección "Acerca de" del menú.'
    },
    {
        keys: ['servicios','comedor','transporte','biblioteca','internet','computadoras','laboratorio','deportes'],
        answer: '🏫 En el perfil de cada escuela (clic en tarjeta o marcador del mapa) encontrarás la lista de **servicios disponibles**, como: biblioteca, transporte escolar, comedor, laboratorios, instalaciones deportivas, acceso a internet y más. Cada institución tiene sus propios servicios.'
    },
    {
        keys: ['cuántas','cuantas','total','estadísticas','estadisticas','cuántos','cuantos','datos generales'],
        answer: '📊 El portal concentra información de las escuelas registradas en Cancún, con datos de miles de estudiantes y cientos de docentes. En la sección **Inicio** puedes ver las estadísticas generales actualizadas del sistema educativo local.'
    },
    {
        keys: ['tutorial','ayuda','cómo usar','como usar','instrucciones','guía','guia','aprender'],
        answer: '❓ Puedes iniciar el **Tutorial Interactivo** en cualquier momento haciendo clic en el botón morado **(?)** en la esquina inferior de la pantalla. Te guiará por todas las funciones del portal con flechas que señalan cada elemento. ¡Dura solo 2 minutos!'
    },
    {
        keys: ['hola','buenos días','buenos dias','buenas tardes','buenas noches','saludos','hi','hello'],
        answer: '¡Hola! 👋 Bienvenido al asistente de SIGECQROO. Estoy aquí para ayudarte con cualquier pregunta sobre el portal educativo de Cancún. ¿En qué puedo ayudarte?'
    },
    {
        keys: ['gracias','muchas gracias','thank','perfecto','excelente','genial'],
        answer: '¡De nada! 😊 Si tienes alguna otra pregunta sobre las escuelas de Cancún o sobre cómo usar el portal, con gusto te ayudo.'
    }
];

function getBotResponse(userText) {
    const text = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of KB) {
        let score = 0;
        for (const kw of entry.keys) {
            const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (text.includes(kwNorm)) score += kw.length;
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (bestMatch && bestScore > 0) return bestMatch.answer;

    return '🤔 No tengo información específica sobre eso, pero puedo ayudarte con:\n\n• Buscar escuelas por nivel o sector\n• Usar el mapa interactivo\n• Información sobre becas y trámites\n• Cómo usar las funciones del portal\n\n¿Sobre cuál de estos temas quieres saber más?';
}

function toggleChatbot() {
    chatOpen = !chatOpen;
    const win = document.getElementById('chatbot-window');
    const icon = document.getElementById('chatbot-btn-icon');
    const badge = document.getElementById('chatbot-badge');

    if (chatOpen) {
        win.classList.add('open');
        icon.className = 'fas fa-times';
        if (badge) badge.style.display = 'none';
        const msgs = document.getElementById('chatbot-messages');
        if (msgs && msgs.children.length === 0) {
            setTimeout(() => addBotMsg('¡Hola! 👋 Soy el asistente de **SIGECQROO**. Puedo ayudarte a encontrar escuelas, explicarte cómo usar el portal y responder tus dudas educativas. ¿En qué te puedo ayudar?'), 300);
        }
        setTimeout(() => document.getElementById('chatbot-input').focus(), 350);
    } else {
        win.classList.remove('open');
        icon.className = 'fas fa-robot';
    }
}

function addBotMsg(text) {
    const msgs = document.getElementById('chatbot-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = renderMarkdown(text);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {
    const msgs = document.getElementById('chatbot-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
    const msgs = document.getElementById('chatbot-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chat-typing';
    div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function hideTypingIndicator() {
    const el = document.getElementById('chat-typing');
    if (el) el.remove();
}

function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if (!text || chatWaiting) return;

    input.value = '';
    input.style.height = 'auto';
    const quickBtns = document.getElementById('chat-quick-btns');
    if (quickBtns) quickBtns.style.display = 'none';
    chatWaiting = true;
    const sendBtn = document.getElementById('chatbot-send');
    if (sendBtn) sendBtn.disabled = true;

    addUserMsg(text);
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        addBotMsg(getBotResponse(text));
        chatWaiting = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }, 600 + Math.random() * 500);
}

function sendQuickMsg(text) {
    const input = document.getElementById('chatbot-input');
    if (input) input.value = text;
    sendChatMessage();
}

function chatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

function autoResizeChat(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

function initChatbotBadge() {
    setTimeout(() => {
        if (!chatOpen) {
            const b = document.getElementById('chatbot-badge');
            if (b) b.style.display = 'flex';
        }
    }, 2000);
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { toggleChatbot, sendChatMessage, sendQuickMsg, chatKeydown, autoResizeChat, initChatbotBadge };
}
