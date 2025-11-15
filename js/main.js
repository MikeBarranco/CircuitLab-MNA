/**
 * CircuitLab MNA - Orquestador Principal
 *
 * Este archivo es el NÚCLEO del simulador MNA que coordina todos los módulos:
 * - Validator: Validación exhaustiva de entradas
 * - MNACore: Algoritmo de análisis nodal modificado
 * - MatrixBuilder: Construcción y manipulación de matrices
 * - ResultDisplay: Visualización de resultados
 *
 * Autor: CircuitLab Team
 * Versión: 1.0.0
 */

// Estado global de la aplicación
const App = {
    // Datos del circuito
    elementos: [],              // Array de elementos del circuito
    numNodes: 0,                // Número de nodos
    groundNode: 0,              // Nodo de referencia (tierra)
    numElements: 0,             // Número de elementos
    frequency: 0,               // Frecuencia de operación (Hz)

    // Último resultado calculado (para exportación)
    ultimoResultado: null,

    /**
     * 1. INICIALIZAR APLICACIÓN
     * Configura event listeners y prepara la interfaz
     */
    init() {
        console.log('Inicializando CircuitLab MNA...');

        try {
            // Vincular botones principales
            this.vincularEventListeners();

            // Configurar validación en tiempo real para configuración inicial
            this.configurarValidacionTiempoReal();

            // Ocultar secciones que aparecen después
            document.getElementById('elementsSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';

            console.log('✓ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('Error al inicializar aplicación:', error);
            alert('Error al inicializar la aplicación. Por favor, recargue la página.');
        }
    },

    /**
     * Vincular todos los event listeners de la aplicación
     */
    vincularEventListeners() {
        // Botón: Generar formulario de elementos
        const btnGenerar = document.getElementById('btnGenerateForm');
        if (btnGenerar) {
            btnGenerar.addEventListener('click', this.generarFormularioElementos.bind(this));
        }

        // Botón: Resolver circuito
        const btnResolver = document.getElementById('btnSolve');
        if (btnResolver) {
            btnResolver.addEventListener('click', this.resolverCircuito.bind(this));
        }

        // Botón: Resetear aplicación
        const btnReset = document.getElementById('btnReset');
        if (btnReset) {
            btnReset.addEventListener('click', this.resetear.bind(this));
        }

        // Botón: Exportar resultados
        const btnExportar = document.getElementById('btnExport');
        if (btnExportar) {
            btnExportar.addEventListener('click', this.exportar.bind(this));
        }
    },

    /**
     * Configurar validación en tiempo real para campos de configuración
     */
    configurarValidacionTiempoReal() {
        const campos = [
            { id: 'numNodes', min: 2, max: 100 },
            { id: 'groundNode', min: 0, max: 99 },
            { id: 'numElements', min: 1, max: 200 },
            { id: 'frequency', min: 0, max: 1e12 }
        ];

        campos.forEach(campo => {
            const input = document.getElementById(campo.id);
            if (input) {
                input.addEventListener('input', () => {
                    this.validarEntradaNumerica(input, campo.min, campo.max);
                });
            }
        });
    },

    /**
     * 2. GENERAR FORMULARIO DE ELEMENTOS
     * Lee la configuración, valida y genera el formulario dinámico
     */
    generarFormularioElementos() {
        try {
            // PASO 1: Leer configuración del formulario
            this.numNodes = parseInt(document.getElementById('numNodes').value);
            this.groundNode = parseInt(document.getElementById('groundNode').value);
            this.numElements = parseInt(document.getElementById('numElements').value);
            this.frequency = parseFloat(document.getElementById('frequency').value);

            console.log('Configuración leída:', {
                numNodes: this.numNodes,
                groundNode: this.groundNode,
                numElements: this.numElements,
                frequency: this.frequency
            });

            // PASO 2: Validar configuración usando Validator
            const validacion = Validator.validarConfiguracionCircuito(
                this.numNodes,
                this.groundNode,
                this.numElements,
                this.frequency
            );

            if (!validacion.valido) {
                // Mostrar todos los errores
                const mensajeError = validacion.errores.join('\n');
                ResultDisplay.mostrarError(mensajeError);
                console.error('Errores de validación:', validacion.errores);
                return;
            }

            // PASO 3: Limpiar array de elementos y resultados previos
            this.elementos = [];
            this.ultimoResultado = null;
            ResultDisplay.limpiarResultados();

            // PASO 4: Generar formulario dinámico para cada elemento
            const container = document.getElementById('elementsContainer');
            container.innerHTML = ''; // Limpiar contenedor

            for (let i = 0; i < this.numElements; i++) {
                const elementForm = this.crearFormularioElemento(i);
                container.appendChild(elementForm);
            }

            // PASO 5: Mostrar sección de elementos
            document.getElementById('elementsSection').style.display = 'block';
            document.getElementById('resultsSection').style.display = 'none';

            // PASO 6: Scroll suave a la sección de elementos
            setTimeout(() => {
                document.getElementById('elementsSection').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);

            // Mensaje de éxito
            ResultDisplay.mostrarExito(
                `Formulario generado para ${this.numElements} elemento(s). ` +
                `Complete los datos de cada elemento.`
            );

        } catch (error) {
            console.error('Error al generar formulario:', error);
            ResultDisplay.mostrarError(`Error al generar formulario: ${error.message}`);
        }
    },

    /**
     * 3. CREAR FORMULARIO PARA UN ELEMENTO
     * Genera el HTML para ingresar datos de un elemento individual
     *
     * @param {number} indice - Índice del elemento (0-based)
     * @returns {HTMLElement} Div con el formulario del elemento
     */
    crearFormularioElemento(indice) {
        const div = document.createElement('div');
        div.className = 'element-form';
        div.id = `element_${indice}`;

        div.innerHTML = `
            <h4>Elemento ${indice + 1}</h4>
            <div class="form-row">
                <div class="form-group">
                    <label for="tipo_${indice}">Tipo:</label>
                    <select id="tipo_${indice}" required>
                        <option value="">Seleccionar...</option>
                        <option value="R">Resistor (R)</option>
                        <option value="V">Fuente de Voltaje (V)</option>
                        <option value="I">Fuente de Corriente (I)</option>
                        <option value="C">Capacitor (C)</option>
                        <option value="L">Inductor (L)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="nombre_${indice}">Nombre:</label>
                    <input type="text" id="nombre_${indice}" placeholder="Ej: R1, V1" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="nodoPos_${indice}">Nodo Positivo:</label>
                    <input type="number" id="nodoPos_${indice}" min="0" max="${this.numNodes - 1}" required>
                </div>
                <div class="form-group">
                    <label for="nodoNeg_${indice}">Nodo Negativo:</label>
                    <input type="number" id="nodoNeg_${indice}" min="0" max="${this.numNodes - 1}" required>
                </div>
            </div>
            <div class="form-group">
                <label id="label_valor_${indice}" for="valor_${indice}">Valor:</label>
                <input type="number" id="valor_${indice}" step="any" required>
                <small id="unidad_${indice}" class="unidad-text"></small>
            </div>
        `;

        // Event listener para actualizar labels según tipo seleccionado
        const selectTipo = div.querySelector(`#tipo_${indice}`);
        selectTipo.addEventListener('change', () => {
            this.actualizarLabelsElemento(indice);
        });

        // Validación en tiempo real para nodos
        const inputNodoPos = div.querySelector(`#nodoPos_${indice}`);
        const inputNodoNeg = div.querySelector(`#nodoNeg_${indice}`);

        inputNodoPos.addEventListener('input', () => {
            this.validarEntradaNumerica(inputNodoPos, 0, this.numNodes - 1);
        });

        inputNodoNeg.addEventListener('input', () => {
            this.validarEntradaNumerica(inputNodoNeg, 0, this.numNodes - 1);
        });

        return div;
    },

    /**
     * 4. ACTUALIZAR LABELS DE ELEMENTO
     * Cambia las etiquetas y unidades según el tipo de elemento seleccionado
     *
     * @param {number} indice - Índice del elemento
     */
    actualizarLabelsElemento(indice) {
        const tipo = document.getElementById(`tipo_${indice}`).value;
        const labelValor = document.getElementById(`label_valor_${indice}`);
        const unidad = document.getElementById(`unidad_${indice}`);

        switch(tipo) {
            case 'R':
                labelValor.textContent = 'Resistencia:';
                unidad.textContent = 'Ohmios (Ω)';
                break;
            case 'V':
                labelValor.textContent = 'Voltaje:';
                unidad.textContent = 'Voltios (V)';
                break;
            case 'I':
                labelValor.textContent = 'Corriente:';
                unidad.textContent = 'Amperios (A)';
                break;
            case 'C':
                labelValor.textContent = 'Capacitancia:';
                unidad.textContent = 'Faradios (F)';
                break;
            case 'L':
                labelValor.textContent = 'Inductancia:';
                unidad.textContent = 'Henrios (H)';
                break;
            default:
                labelValor.textContent = 'Valor:';
                unidad.textContent = '';
        }
    },

    /**
     * 5. LEER ELEMENTOS DEL FORMULARIO
     * Extrae todos los datos ingresados por el usuario
     *
     * @returns {Array} Array de objetos con los elementos del circuito
     */
    leerElementos() {
        this.elementos = [];

        for (let i = 0; i < this.numElements; i++) {
            const elemento = {
                tipo: document.getElementById(`tipo_${i}`).value,
                nombre: Validator.sanitizarEntrada(
                    document.getElementById(`nombre_${i}`).value
                ),
                nodoPositivo: parseInt(document.getElementById(`nodoPos_${i}`).value),
                nodoNegativo: parseInt(document.getElementById(`nodoNeg_${i}`).value),
                valor: parseFloat(document.getElementById(`valor_${i}`).value)
            };

            this.elementos.push(elemento);
        }

        console.log('Elementos leídos:', this.elementos);
        return this.elementos;
    },

    /**
     * 6. RESOLVER CIRCUITO
     * MÉTODO MÁS IMPORTANTE - Ejecuta el flujo completo de análisis MNA
     *
     * Flujo:
     * 1. Leer elementos del formulario
     * 2. Validar TODOS los elementos
     * 3. Mostrar advertencias si las hay
     * 4. Ejecutar algoritmo MNA
     * 5. Mostrar resultados
     */
    resolverCircuito() {
        console.log('=== INICIANDO ANÁLISIS MNA ===');

        try {
            // PASO 1: Leer elementos del formulario
            const elementos = this.leerElementos();

            if (elementos.length === 0) {
                ResultDisplay.mostrarAdvertencia(
                    'No hay elementos para resolver. Genere el formulario primero.'
                );
                return;
            }

            // PASO 2: Validar TODOS los elementos
            console.log('Validando configuración completa...');
            const validacionCompleta = Validator.validarTodo({
                elementos: elementos,
                numNodes: this.numNodes,
                groundNode: this.groundNode,
                frequency: this.frequency
            });

            if (!validacionCompleta.valido) {
                // Mostrar TODOS los errores encontrados
                const mensajeError = validacionCompleta.errores.join('\n');
                ResultDisplay.mostrarError(mensajeError);
                console.error('Errores de validación:', validacionCompleta.errores);
                return;
            }

            console.log('✓ Validación exitosa');

            // PASO 3: Mostrar advertencias si las hay
            if (validacionCompleta.advertencias &&
                validacionCompleta.advertencias.length > 0) {
                console.log('Advertencias:', validacionCompleta.advertencias);
                validacionCompleta.advertencias.forEach(advertencia => {
                    ResultDisplay.mostrarAdvertencia(advertencia);
                });
            }

            // PASO 4: Llamar al algoritmo MNA
            ResultDisplay.mostrarExito('Resolviendo circuito mediante análisis nodal modificado...');
            console.log('Ejecutando MNACore.analizarCircuito...');

            const resultado = MNACore.analizarCircuito(
                elementos,
                this.numNodes,
                this.groundNode,
                this.frequency
            );

            console.log('Resultado del análisis:', resultado);

            // PASO 5: Verificar éxito del análisis
            if (!resultado.exito) {
                throw new Error(resultado.error || 'Error desconocido al resolver el circuito');
            }

            // Guardar resultado para exportación
            this.ultimoResultado = resultado;

            // PASO 6: Mostrar resultados en la interfaz
            console.log('Mostrando resultados...');
            ResultDisplay.mostrarResultados(resultado, this.frequency);

            // Mensaje de éxito
            const numVoltajes = Object.keys(resultado.voltajes).length;
            const numCorrientes = Object.keys(resultado.corrientes).length;
            ResultDisplay.mostrarExito(`¡Circuito resuelto exitosamente! ${numVoltajes} voltajes y ${numCorrientes} corrientes calculadas.`);

            // PASO 7: Scroll suave a la sección de resultados
            setTimeout(() => {
                document.getElementById('resultsSection').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 200);

            console.log('=== ANÁLISIS MNA COMPLETADO ===');

        } catch (error) {
            console.error('ERROR AL RESOLVER CIRCUITO:', error);
            ResultDisplay.mostrarError(
                `Error al resolver el circuito:\n${error.message}\n\n` +
                `Verifique que todos los datos sean correctos y que el circuito tenga solución única.`
            );
        }
    },

    /**
     * 7. RESETEAR APLICACIÓN
     * Limpia todo y vuelve al estado inicial
     */
    resetear() {
        console.log('Reseteando aplicación...');

        try {
            // Limpiar datos
            this.elementos = [];
            this.ultimoResultado = null;
            this.numNodes = 0;
            this.groundNode = 0;
            this.numElements = 0;
            this.frequency = 0;

            // Ocultar secciones
            document.getElementById('elementsSection').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'none';

            // Limpiar contenedores
            document.getElementById('elementsContainer').innerHTML = '';
            ResultDisplay.limpiarResultados();

            // Limpiar formulario de configuración
            document.getElementById('numNodes').value = '';
            document.getElementById('groundNode').value = '';
            document.getElementById('numElements').value = '';
            document.getElementById('frequency').value = '';

            // Remover clases de error
            document.querySelectorAll('.input-error').forEach(input => {
                input.classList.remove('input-error');
            });

            // Scroll al inicio
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            console.log('✓ Aplicación reseteada');

        } catch (error) {
            console.error('Error al resetear:', error);
            alert('Error al resetear la aplicación. Recargue la página si el problema persiste.');
        }
    },

    /**
     * 8. EXPORTAR RESULTADOS
     * Genera un archivo de texto con los resultados del análisis
     */
    exportar() {
        console.log('Exportando resultados...');

        try {
            // Verificar que hay resultados para exportar
            if (!this.ultimoResultado || this.elementos.length === 0) {
                ResultDisplay.mostrarAdvertencia(
                    'No hay resultados para exportar. Resuelva un circuito primero.'
                );
                return;
            }

            // Generar nombre de archivo con timestamp
            const ahora = new Date();
            const fecha = ahora.toISOString().slice(0, 10);
            const hora = ahora.toTimeString().slice(0, 8).replace(/:/g, '-');
            const nombreArchivo = `CircuitLab_MNA_${fecha}_${hora}.txt`;

            // Llamar a ResultDisplay para exportar
            console.log('Generando archivo:', nombreArchivo);
            ResultDisplay.exportarResultados(this.ultimoResultado, nombreArchivo);

            ResultDisplay.mostrarExito(`Resultados exportados a: ${nombreArchivo}`);

        } catch (error) {
            console.error('Error al exportar:', error);
            ResultDisplay.mostrarError(`Error al exportar resultados: ${error.message}`);
        }
    },

    /**
     * 9. VALIDAR ENTRADA NUMÉRICA
     * Valida en tiempo real si un valor numérico está en el rango permitido
     *
     * @param {HTMLInputElement} input - Campo de entrada a validar
     * @param {number} min - Valor mínimo permitido
     * @param {number} max - Valor máximo permitido
     * @returns {boolean} True si es válido, false si no
     */
    validarEntradaNumerica(input, min, max) {
        const valor = parseFloat(input.value);

        // Verificar si es un número válido
        if (input.value === '' || input.value === null) {
            input.classList.remove('input-error');
            return true; // Campo vacío no es error (puede estar llenándose)
        }

        if (isNaN(valor)) {
            input.classList.add('input-error');
            input.title = 'Debe ingresar un número válido';
            return false;
        }

        // Verificar rango
        if (valor < min || valor > max) {
            input.classList.add('input-error');
            input.title = `Valor debe estar entre ${min} y ${max}`;
            return false;
        }

        // Válido
        input.classList.remove('input-error');
        input.title = '';
        return true;
    }
};

// ============================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

/**
 * Inicializar la aplicación cuando el DOM esté completamente cargado
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando CircuitLab MNA...');

    try {
        App.init();
        console.log('✓✓✓ CircuitLab MNA inicializado correctamente ✓✓✓');
        console.log('Versión: 1.0.0');
        console.log('Módulos cargados: Validator, MNACore, MatrixBuilder, ResultDisplay');
    } catch (error) {
        console.error('✗✗✗ ERROR FATAL AL INICIALIZAR ✗✗✗');
        console.error(error);
        alert(
            'Error crítico al inicializar CircuitLab MNA.\n' +
            'Verifique la consola del navegador para más detalles.\n' +
            'Recargue la página e intente nuevamente.'
        );
    }
});

// ============================================================================
// MANEJO DE ERRORES GLOBALES
// ============================================================================

/**
 * Capturar errores no manejados
 */
window.addEventListener('error', function(event) {
    console.error('Error global capturado:', event.error);
    ResultDisplay.mostrarError(
        `Error inesperado: ${event.error?.message || 'Error desconocido'}`
    );
});

/**
 * Capturar promesas rechazadas no manejadas
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise rechazada no manejada:', event.reason);
    ResultDisplay.mostrarError(
        `Error asíncrono: ${event.reason?.message || 'Error desconocido'}`
    );
});

// ============================================================================
// EXPORTAR PARA USO EN CONSOLA (debugging)
// ============================================================================

// Hacer App disponible globalmente para debugging
window.CircuitLabApp = App;

console.log('main.js cargado correctamente');
