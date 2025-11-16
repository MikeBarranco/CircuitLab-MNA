/**
 * darkMode.js - Modo oscuro persistente con localStorage
 */

(function() {
    'use strict';

    // Constantes
    const DARK_MODE_CLASS = 'dark-mode';
    const STORAGE_KEY = 'circuitlab-dark-mode';
    const MOON_ICON = '🌙';
    const SUN_ICON = '☀️';

    /**
     * Obtener preferencia guardada del usuario
     * @returns {boolean} true si el modo oscuro está activado
     */
    function getSavedPreference() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            return saved === 'true';
        }
        // Si no hay preferencia guardada, usar la preferencia del sistema
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Guardar preferencia del usuario
     * @param {boolean} isDark - true para modo oscuro
     */
    function savePreference(isDark) {
        localStorage.setItem(STORAGE_KEY, isDark.toString());
    }

    /**
     * Aplicar modo oscuro
     * @param {boolean} isDark - true para activar modo oscuro
     */
    function applyDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add(DARK_MODE_CLASS);
        } else {
            document.body.classList.remove(DARK_MODE_CLASS);
        }
    }

    /**
     * Actualizar icono del botón
     * @param {HTMLElement} button - Botón de toggle
     * @param {boolean} isDark - true si está en modo oscuro
     */
    function updateButtonIcon(button, isDark) {
        if (button) {
            button.textContent = isDark ? SUN_ICON : MOON_ICON;
            button.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        }
    }

    /**
     * Toggle del modo oscuro
     */
    function toggleDarkMode() {
        const isDark = !document.body.classList.contains(DARK_MODE_CLASS);
        applyDarkMode(isDark);
        savePreference(isDark);

        // Actualizar todos los botones en la página
        const buttons = document.querySelectorAll('.dark-mode-toggle');
        buttons.forEach(button => updateButtonIcon(button, isDark));
    }

    /**
     * Inicializar modo oscuro
     */
    function initDarkMode() {
        // Aplicar preferencia guardada ANTES de que la página sea visible
        // Esto evita el flash de contenido claro
        const isDark = getSavedPreference();
        applyDarkMode(isDark);

        // Cuando el DOM esté listo, configurar el botón
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupButton);
        } else {
            setupButton();
        }

        function setupButton() {
            const buttons = document.querySelectorAll('.dark-mode-toggle');

            buttons.forEach(button => {
                // Actualizar icono inicial
                updateButtonIcon(button, isDark);

                // Agregar event listener
                button.addEventListener('click', toggleDarkMode);
            });
        }
    }

    // Iniciar inmediatamente
    initDarkMode();

    // Escuchar cambios en la preferencia del sistema (opcional)
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Solo aplicar si no hay preferencia guardada explícita
            const savedPref = localStorage.getItem(STORAGE_KEY);
            if (savedPref === null) {
                const isDark = e.matches;
                applyDarkMode(isDark);
                const buttons = document.querySelectorAll('.dark-mode-toggle');
                buttons.forEach(button => updateButtonIcon(button, isDark));
            }
        });
    }
})();
