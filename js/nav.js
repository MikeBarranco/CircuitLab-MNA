/**
 * nav.js - Manejo de navegación responsiva
 *
 * Este módulo gestiona el comportamiento del menú de navegación
 * en dispositivos móviles y tablets, permitiendo expandir y contraer
 * el menú mediante el botón hamburguesa.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Verificar que los elementos existen antes de agregar eventos
    if (navToggle && navMenu) {
        // Agregar evento de click al botón hamburguesa
        navToggle.addEventListener('click', () => {
            // Alternar la clase 'active' para mostrar/ocultar el menú
            navMenu.classList.toggle('active');
        });
    }
});
