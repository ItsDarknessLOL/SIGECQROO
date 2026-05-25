// ============================================================
// SIGECQROO — privacy.js
// Modal de políticas de privacidad
// ============================================================

function initPrivacyModal() {
    const overlay = document.getElementById('privacy-modal-overlay');
    if (!overlay) return;

    let accepted = false;
    try {
        accepted = localStorage.getItem(CONFIG.storageKeys.privacy) === '1';
    } catch (e) {}

    if (!accepted) {
        setTimeout(() => {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }, 600);
    }
}

function acceptPrivacy() {
    try {
        localStorage.setItem(CONFIG.storageKeys.privacy, '1');
    } catch (e) {}
    const overlay = document.getElementById('privacy-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initPrivacyModal, acceptPrivacy };
}
