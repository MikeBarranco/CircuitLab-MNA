/**
 * ============================================
 * RESULT DISPLAY - Visualización de Resultados MNA
 * ============================================
 *
 * Este módulo gestiona la visualización clara y profesional
 * de los resultados del análisis MNA en la interfaz web.
 *
 * Funcionalidades:
 * - Display de voltajes de nodos (DC y AC)
 * - Display de corrientes en fuentes
 * - Visualización de matrices del sistema
 * - Exportación de resultados
 * - Mensajes de estado (éxito, error, advertencia)
 */

const ResultDisplay = {
    /**
     * Método principal que orquesta el display completo de resultados
     * @param {Object} resultado - Objeto resultado de MNACore.analizarCircuito()
     * @param {number} frequency - Frecuencia para determinar DC (0) o AC (>0)
     */
    mostrarResultados(resultado, frequency) {
        // Limpiar resultados anteriores
        this.limpiarResultados();

        try {
            // Validar que tenemos los datos necesarios
            if (!resultado || !resultado.exito) {
                this.mostrarError('No hay resultados para mostrar');
                return;
            }

            // Mostrar voltajes de nodos
            if (resultado.voltajes) {
                this.mostrarVoltajes(resultado.voltajes, frequency);
            }

            // Mostrar corrientes en fuentes de voltaje
            if (resultado.corrientes) {
                this.mostrarCorrientes(resultado.corrientes, frequency);
            }

            // Mostrar matrices del sistema
            if (resultado.matrices) {
                this.mostrarMatrices(resultado.matrices);
            }

            // Mostrar advertencias específicas para DC
            if (frequency === 0) {
                const tieneCapacitores = resultado.tieneCapacitores || false;
                const tieneInductores = resultado.tieneInductores || false;

                if (tieneCapacitores) {
                    this.mostrarAdvertencia('Análisis DC: Los capacitores actúan como circuito abierto (impedancia infinita)');
                }
                if (tieneInductores) {
                    this.mostrarAdvertencia('Análisis DC: Los inductores actúan como cortocircuito (impedancia cero)');
                }
            }

            // Mostrar la sección de resultados
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection) {
                resultsSection.style.display = 'block';
                resultsSection.classList.remove('hidden');
                resultsSection.classList.add('fade-in');
            }

            // Mensaje de éxito
            const tipoAnalisis = frequency === 0 ? 'DC' : `AC (${frequency} Hz)`;
            this.mostrarExito(`Análisis ${tipoAnalisis} completado exitosamente`);

        } catch (error) {
            this.mostrarError(`Error al mostrar resultados: ${error.message}`);
        }
    },

    /**
     * Mostrar voltajes de todos los nodos
     * @param {Object} voltajes - Objeto con voltajes de nodos {nodo: valor}
     * @param {number} frequency - Frecuencia (0=DC, >0=AC)
     */
    mostrarVoltajes(voltajes, frequency) {
        const container = document.getElementById('voltagesResult');
        if (!container) return;

        const isDC = frequency === 0;

        // Crear encabezados de tabla
        const headers = isDC
            ? ['Nodo', 'Voltaje (V)']
            : ['Nodo', 'Magnitud (V)', 'Fase (°)'];

        // Crear filas de datos
        const filas = [];
        const clases = [];

        // Ordenar nodos numéricamente
        const nodos = Object.keys(voltajes).sort((a, b) => {
            const numA = parseInt(a.replace('n', ''));
            const numB = parseInt(b.replace('n', ''));
            return numA - numB;
        });

        for (const nodo of nodos) {
            const voltaje = voltajes[nodo];
            const esNodoTierra = nodo === 'n0';

            let fila, claseFila;

            if (isDC) {
                // DC: solo parte real
                const valor = typeof voltaje === 'object' && voltaje.re !== undefined
                    ? voltaje.re
                    : (typeof voltaje === 'number' ? voltaje : 0);

                const valorFormateado = this.formatearNumero(valor, 4);

                // Formatear nodo con notación matemática: n1 → v₁
                let nodoFormateado;
                if (esNodoTierra) {
                    const numeroNodo = nodo.replace('n', '');
                    nodoFormateado = `<em>v</em><sub>${this.convertirASubindice(numeroNodo)}</sub> (Tierra)`;
                } else {
                    const numeroNodo = nodo.replace('n', '');
                    nodoFormateado = `<em>v</em><sub>${this.convertirASubindice(numeroNodo)}</sub>`;
                }

                fila = [nodoFormateado, valorFormateado];
                claseFila = esNodoTierra ? ['text-accent', 'valor-numerico'] : ['', 'valor-numerico'];
            } else {
                // AC: magnitud y fase
                const {magnitud, fase} = this.calcularMagnitudFase(voltaje);
                fila = [
                    esNodoTierra ? `${nodo} (Tierra)` : nodo,
                    this.formatearNumero(magnitud, 4),
                    this.formatearNumero(fase, 2) + '°'
                ];
                claseFila = esNodoTierra
                    ? ['text-accent', 'valor-numerico', 'valor-numerico']
                    : ['', 'valor-numerico', 'valor-numerico'];
            }

            filas.push(fila);
            clases.push(claseFila);
        }

        // Crear tabla HTML
        const tablaHTML = this.crearTablaHTML(headers, filas, clases);

        // Insertar en el contenedor (SIN caja adicional - el resultado-grupo ya proporciona estructura)
        container.innerHTML = `
            <p class="text-muted text-sm" style="margin-bottom: 1rem;">
                Voltajes medidos respecto al nodo de tierra (0V).
                En análisis AC (f > 0), se muestra la Magnitud (el "cuánto") y la Fase (el "desfase" en grados).
            </p>
            ${tablaHTML}
        `;
    },

    /**
     * Mostrar corrientes en fuentes de voltaje
     * @param {Object} corrientes - Objeto con corrientes {fuente: valor}
     * @param {number} frequency - Frecuencia (0=DC, >0=AC)
     */
    mostrarCorrientes(corrientes, frequency) {
        const container = document.getElementById('currentsResult');
        if (!container) return;

        const isDC = frequency === 0;

        // Verificar si hay corrientes para mostrar
        if (Object.keys(corrientes).length === 0) {
            container.innerHTML = `
                <p class="text-muted text-sm">
                    No hay fuentes de voltaje independientes en el circuito
                </p>
            `;
            return;
        }

        // Crear encabezados de tabla
        const headers = isDC
            ? ['Fuente', 'Corriente (A)', 'Dirección']
            : ['Fuente', 'Magnitud (A)', 'Fase (°)', 'Dirección'];

        // Crear filas de datos
        const filas = [];
        const clases = [];

        for (const fuente in corrientes) {
            const corriente = corrientes[fuente];
            let fila, claseFila;

            if (isDC) {
                // DC: solo parte real
                const valor = typeof corriente === 'object' && corriente.re !== undefined
                    ? corriente.re
                    : (typeof corriente === 'number' ? corriente : 0);

                const valorFormateado = this.formatearNumero(valor, 6);
                const direccion = valor >= 0
                    ? 'Entra por terminal +'
                    : 'Sale por terminal +';

                // Formatear nombre con notación matemática: V1 → i<sub>V₁</sub>
                const nombreFormateado = this.formatearNombreCorriente(fuente);

                fila = [nombreFormateado, valorFormateado, direccion];
                claseFila = ['', 'valor-numerico', 'text-sm'];
            } else {
                // AC: magnitud y fase
                const {magnitud, fase} = this.calcularMagnitudFase(corriente);
                const direccion = 'Convención pasiva';

                fila = [
                    fuente,
                    this.formatearNumero(magnitud, 6),
                    this.formatearNumero(fase, 2) + '°',
                    direccion
                ];
                claseFila = ['', 'valor-numerico', 'valor-numerico', 'text-sm'];
            }

            filas.push(fila);
            clases.push(claseFila);
        }

        // Crear tabla HTML
        const tablaHTML = this.crearTablaHTML(headers, filas, clases);

        // Insertar en el contenedor (SIN caja adicional)
        container.innerHTML = `
            <p class="text-muted text-sm" style="margin-bottom: 1rem;">
                Corrientes que fluyen a través de las fuentes de voltaje independientes (incógnitas 'j' del vector x).
            </p>
            ${tablaHTML}
        `;
    },

    /**
     * Mostrar matrices del sistema (A, x, z)
     * @param {Object} matrices - Objeto con matrices {A, x, z}
     */
    mostrarMatrices(matrices) {
        if (!matrices || !matrices.A) return;

        // Crear etiquetas para las columnas de A y x
        const sizeG = math.size(matrices.G);
        const n = sizeG._data ? sizeG._data[0] : sizeG[0];

        const sizeB = math.size(matrices.B);
        const m = sizeB._data ? sizeB._data[1] : (sizeB[1] || 0);

        let etiquetasColumnasA = [];
        let etiquetasFilasX = [];

        // Etiquetas para Nodos
        for (let i = 0; i < n; i++) {
            // Asumiendo que groundNode es 0, los nodos son 1...n
            // (Esto debe mejorarse si groundNode no es 0)
            const nodoReal = i + 1;
            etiquetasColumnasA.push(`v_${nodoReal}`);
            etiquetasFilasX.push(`v_${nodoReal}`);
        }

        // Etiquetas para Corrientes
        // Necesitamos los nombres de las fuentes de V, que no están aquí.
        // Usaremos etiquetas genéricas por ahora.
        for (let j = 0; j < m; j++) {
            etiquetasColumnasA.push(`i_V${j+1}`);
            etiquetasFilasX.push(`i_V${j+1}`);
        }

        // Etiquetas para filas de A y z
        let etiquetasFilasA_Z = [...etiquetasFilasX]; // Coinciden

        // Mostrar Matriz A
        this.mostrarMatrizConNombre(
            matrices.A, 'matrixA', 'Matriz A (Sistema)',
            'Matriz de coeficientes del sistema [A]x = z.',
            etiquetasFilasA_Z, etiquetasColumnasA
        );
        // Mostrar Vector x
        this.mostrarMatrizConNombre(
            matrices.x, 'vectorX', 'Vector x (Incógnitas)',
            'Vector de incógnitas (Voltajes nodales y Corrientes de fuentes V).',
            etiquetasFilasX, ['Valor']
        );
        // Mostrar Vector z
        this.mostrarMatrizConNombre(
            matrices.z, 'vectorZ', 'Vector z (Fuentes)',
            'Vector de fuentes conocidas (Fuentes de Corriente y Voltaje).',
            etiquetasFilasA_Z, ['Valor']
        );
    },

    /**
     * Método auxiliar para renderizar una matriz específica
     * @param {Array} matriz - Matriz a renderizar
     * @param {string} contenedorId - ID del contenedor HTML
     * @param {string} nombre - Nombre de la matriz
     * @param {string} descripcion - Descripción de la matriz
     * @param {Array} etiquetasFilas - Etiquetas para las filas
     * @param {Array} etiquetasColumnas - Etiquetas para las columnas
     */
    mostrarMatrizConNombre(matriz, contenedorId, nombre, descripcion, etiquetasFilas = [], etiquetasColumnas = []) {
        const container = document.getElementById(contenedorId);
        if (!container || !matriz) return;

        try {
            // Convertir matriz a array si es necesario
            let matrizArray = matriz;
            if (matriz._data) {
                matrizArray = matriz._data;
            }

            // Determinar si es vector o matriz
            const esVector = Array.isArray(matrizArray) &&
                           (matrizArray.length === 0 || !Array.isArray(matrizArray[0]));

            // Generar tabla HTML con notación matemática profesional
            let tablaHTML = '';
            if (esVector) {
                tablaHTML = '<table class="resultado-table">';
                tablaHTML += '<tr><th>Variable</th>';
                const cabeceraCol = etiquetasColumnas[0] || 'Valor';
                tablaHTML += `<th>${cabeceraCol}</th></tr>`;

                for (let i = 0; i < matrizArray.length; i++) {
                    const valor = matrizArray[i];
                    const valorFormateado = this.formatearComplejo(valor, 6);
                    // Usar notación matemática en etiquetas
                    let etiquetaFila = etiquetasFilas[i] || `x[${i}]`;

                    // Convertir etiquetas a notación matemática
                    if (etiquetaFila.startsWith('v_')) {
                        const num = etiquetaFila.replace('v_', '');
                        etiquetaFila = `<em>v</em><sub>${num}</sub>`;
                    } else if (etiquetaFila.startsWith('i_')) {
                        const fuente = etiquetaFila.replace('i_', '');
                        etiquetaFila = `<em>i</em><sub>${fuente}</sub>`;
                    }

                    tablaHTML += `<tr>
                        <td>${etiquetaFila}</td>
                        <td class="valor-numerico">${valorFormateado}</td>
                    </tr>`;
                }
                tablaHTML += '</table>';
            } else {
                // Matriz
                const filas = matrizArray.length;
                const cols = matrizArray[0] ? matrizArray[0].length : 0;
                tablaHTML = '<table class="resultado-table">';

                // Encabezados con notación matemática
                tablaHTML += '<tr><th></th>';
                for (let j = 0; j < cols; j++) {
                    let etiquetaCol = etiquetasColumnas[j] || `x[${j}]`;

                    // Convertir a notación matemática
                    if (etiquetaCol.startsWith('v_')) {
                        const num = etiquetaCol.replace('v_', '');
                        etiquetaCol = `<em>v</em><sub>${num}</sub>`;
                    } else if (etiquetaCol.startsWith('i_')) {
                        const fuente = etiquetaCol.replace('i_', '');
                        etiquetaCol = `<em>i</em><sub>${fuente}</sub>`;
                    }

                    tablaHTML += `<th>${etiquetaCol}</th>`;
                }
                tablaHTML += '</tr>';

                // Filas con notación matemática
                for (let i = 0; i < filas; i++) {
                    let etiquetaFila = etiquetasFilas[i] || `x[${i}]`;

                    // Convertir a notación matemática
                    if (etiquetaFila.startsWith('v_')) {
                        const num = etiquetaFila.replace('v_', '');
                        etiquetaFila = `<em>v</em><sub>${num}</sub>`;
                    } else if (etiquetaFila.startsWith('i_')) {
                        const fuente = etiquetaFila.replace('i_', '');
                        etiquetaFila = `<em>i</em><sub>${fuente}</sub>`;
                    }

                    tablaHTML += `<tr><td>${etiquetaFila}</td>`;
                    for (let j = 0; j < cols; j++) {
                        const valor = matrizArray[i][j];
                        const valorFormateado = this.formatearComplejo(valor, 6);
                        const esDiagonal = i === j;
                        const clase = esDiagonal ? 'valor-numerico font-bold' : 'valor-numerico';
                        tablaHTML += `<td class="${clase}">${valorFormateado}</td>`;
                    }
                    tablaHTML += '</tr>';
                }
                tablaHTML += '</table>';
            }

            // Agregar explicación educativa simple según el tipo de matriz
            let explicacion = '';
            if (contenedorId === 'matrixA') {
                explicacion = `<p class="matriz-descripcion">La matriz <em>A</em> del sistema contiene los coeficientes que relacionan voltajes y corrientes. Está formada por cuatro submatrices: <em>G</em> (conductancias de elementos pasivos), <em>B</em> (conexiones de fuentes de voltaje), <em>C</em> (transpuesta de <em>B</em>), y <em>D</em> (fuentes dependientes, ceros en circuitos simples).</p>`;
            } else if (contenedorId === 'vectorX') {
                explicacion = `<p class="matriz-descripcion">El vector <em>x</em> contiene las incógnitas del sistema: voltajes nodales (<em>v</em><sub>i</sub>) y corrientes a través de fuentes de voltaje (<em>i</em><sub>Vj</sub>). Estos son los valores que buscamos resolver.</p>`;
            } else if (contenedorId === 'vectorZ') {
                explicacion = `<p class="matriz-descripcion">El vector <em>z</em> representa las fuentes conocidas del circuito: corrientes inyectadas por fuentes de corriente en cada nodo, y valores de voltaje de las fuentes independientes. Son los datos de entrada del problema.</p>`;
            }

            // Insertar explicación + tabla
            container.innerHTML = explicacion + tablaHTML;

        } catch (error) {
            container.innerHTML = `
                <p class="text-muted text-sm" style="color: var(--color-danger);">
                    <strong>Error al renderizar matriz:</strong> ${error.message}
                </p>
            `;
        }
    },

    /**
     * Limpiar todos los contenedores de resultados
     */
    limpiarResultados() {
        const contenedores = [
            'voltagesResult',
            'currentsResult',
            'matrixA',
            'vectorX',
            'vectorZ'
        ];

        contenedores.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.innerHTML = '';
            }
        });

        // Ocultar sección de resultados
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
            resultsSection.classList.add('hidden');
        }

        // Limpiar mensajes anteriores
        this.limpiarMensajes();
    },

    /**
     * Limpiar mensajes de estado (error, advertencia, éxito)
     */
    limpiarMensajes() {
        const contenedorMensajes = document.getElementById('messages');
        if (contenedorMensajes) {
            contenedorMensajes.innerHTML = '';
        }
    },

    /**
     * Crear tabla HTML genérica
     * @param {Array<string>} headers - Array de strings para encabezados
     * @param {Array<Array>} filas - Array de arrays con datos
     * @param {Array<Array<string>>} clases - Array de arrays con clases CSS opcionales
     * @returns {string} String HTML de la tabla
     */
    crearTablaHTML(headers, filas, clases = []) {
        let html = '<table class="resultado-table">';

        // Encabezados
        html += '<tr>';
        for (const header of headers) {
            html += `<th>${header}</th>`;
        }
        html += '</tr>';

        // Filas de datos
        for (let i = 0; i < filas.length; i++) {
            html += '<tr>';
            const fila = filas[i];
            const claseFila = clases[i] || [];

            for (let j = 0; j < fila.length; j++) {
                const clase = claseFila[j] || '';
                html += `<td class="${clase}">${fila[j]}</td>`;
            }
            html += '</tr>';
        }

        html += '</table>';
        return html;
    },

    /**
     * Formatear número complejo para display
     * @param {number|Object} numero - Número a formatear (real o complejo)
     * @param {number} decimales - Número de decimales (default: 4)
     * @returns {string} String formateado
     */
    formatearComplejo(numero, decimales = 4) {
        if (numero === undefined || numero === null) { return '0'; }
        if (typeof numero === 'number') {
            return this.formatearNumero(numero, decimales);
        }
        if (typeof numero === 'object' && (numero.re !== undefined || numero.im !== undefined)) {
            const re = numero.re || 0;
            const im = numero.im || 0;

            // Si es real (imaginaria despreciable)
            if (Math.abs(im) < 1e-10) {
                return this.formatearNumero(re, decimales);
            }
            // Si es imaginario puro (real despreciable)
            if (Math.abs(re) < 1e-10) {
                return `${this.formatearNumero(im, decimales)}j`;
            }
            // Complejo
            const reStr = this.formatearNumero(re, decimales);
            const imStr = this.formatearNumero(Math.abs(im), decimales);
            const signo = im >= 0 ? '+' : '-';
            return `${reStr} ${signo} ${imStr}j`;
        }
        return String(numero);
    },

    /**
     * Formatear número simple
     * @param {number} numero - Número a formatear
     * @param {number} decimales - Número de decimales
     * @returns {string} Número formateado
     */
    formatearNumero(numero, decimales = 4) {
        if (Math.abs(numero) < 1e-10) {
            return '0';
        }

        const factor = Math.pow(10, decimales);
        const redondeado = Math.round(numero * factor) / factor;

        // Usar notación científica con superíndice
        if (Math.abs(redondeado) >= 1e6 || (Math.abs(redondeado) < 1e-3 && redondeado !== 0)) {
            const exponente = Math.floor(Math.log10(Math.abs(redondeado)));
            const mantisa = redondeado / Math.pow(10, exponente);

            // Mapeo de superíndices
            const superindices = {
                '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
                '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
            };

            const exponenteStr = String(exponente).split('').map(char => superindices[char] || char).join('');

            return `${mantisa.toFixed(2)} × 10${exponenteStr}`;
        }

        // .toFixed() y eliminar ceros innecesarios al final
        let numStr = redondeado.toFixed(decimales);
        if (numStr.includes('.')) {
            numStr = numStr.replace(/\.?0+$/, '');
        }
        return numStr;
    },

    /**
     * Calcular magnitud y fase de un número complejo
     * @param {Object|number} numeroComplejo - Número complejo
     * @returns {Object} {magnitud, fase}
     */
    calcularMagnitudFase(numeroComplejo) {
        // Si es número real
        if (typeof numeroComplejo === 'number') {
            return {
                magnitud: Math.abs(numeroComplejo),
                fase: numeroComplejo >= 0 ? 0 : 180
            };
        }

        // Si es objeto complejo
        if (typeof numeroComplejo === 'object') {
            const re = numeroComplejo.re !== undefined ? numeroComplejo.re : 0;
            const im = numeroComplejo.im !== undefined ? numeroComplejo.im : 0;

            // Magnitud: |z| = sqrt(re² + im²)
            const magnitud = Math.sqrt(re * re + im * im);

            // Fase: θ = atan2(im, re) en grados
            const faseRad = Math.atan2(im, re);
            const fase = faseRad * (180 / Math.PI);

            return { magnitud, fase };
        }

        // Fallback
        return { magnitud: 0, fase: 0 };
    },

    /**
     * Mostrar mensaje de error
     * @param {string} mensaje - Mensaje de error
     */
    mostrarError(mensaje) {
        this.mostrarMensaje(mensaje, 'danger', '⚠');
    },

    /**
     * Mostrar advertencia
     * @param {string} mensaje - Mensaje de advertencia
     */
    mostrarAdvertencia(mensaje) {
        this.mostrarMensaje(mensaje, 'warning', '⚠');
    },

    /**
     * Mostrar mensaje de éxito
     * @param {string} mensaje - Mensaje de éxito
     */
    mostrarExito(mensaje) {
        this.mostrarMensaje(mensaje, 'success', '✓');
    },

    /**
     * Método auxiliar para mostrar mensajes
     * @param {string} mensaje - Texto del mensaje
     * @param {string} tipo - Tipo: 'success', 'warning', 'danger', 'info'
     * @param {string} icono - Icono a mostrar
     */
    mostrarMensaje(mensaje, tipo, icono) {
        // Obtener o crear contenedor de mensajes
        let contenedor = document.getElementById('messages');

        if (!contenedor) {
            // Crear contenedor si no existe
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection) {
                contenedor = document.createElement('div');
                contenedor.id = 'messages';
                resultsSection.insertBefore(contenedor, resultsSection.firstChild);
            } else {
                return; // No se puede mostrar el mensaje
            }
        }

        // Crear elemento de mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `alert alert-${tipo} fade-in`;
        mensajeDiv.innerHTML = `
            <span style="font-weight: bold; margin-right: 0.5rem;">${icono}</span>
            ${mensaje}
        `;

        // Agregar al contenedor
        contenedor.appendChild(mensajeDiv);

        // Auto-ocultar después de 5 segundos (solo para éxito)
        if (tipo === 'success') {
            setTimeout(() => {
                mensajeDiv.style.transition = 'opacity 0.5s ease-out';
                mensajeDiv.style.opacity = '0';
                setTimeout(() => {
                    if (mensajeDiv.parentNode) {
                        mensajeDiv.parentNode.removeChild(mensajeDiv);
                    }
                }, 500);
            }, 5000);
        }
    },

    /**
     * Exportar resultados a archivo de texto
     * @param {Object} resultado - Objeto resultado del análisis
     * @param {string} nombreArchivo - Nombre del archivo a exportar
     */
    exportarResultados(resultado, nombreArchivo = 'resultados_mna.txt') {
        try {
            let contenido = '';
            const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });

            contenido += 'RESULTADOS DEL ANÁLISIS NODAL MODIFICADO (MNA)\n';
            contenido += `Fecha de Análisis: ${fecha}\n\n`;

            // Voltajes de nodos
            if (resultado.voltajes) {
                contenido += 'VOLTAJES DE NODOS\n';
                const nodos = Object.keys(resultado.voltajes).sort((a, b) => a - b);
                nodos.forEach(nodo => {
                    const voltaje = resultado.voltajes[nodo];
                    const valorStr = this.formatearComplejo(voltaje, 6);
                    const etiquetaNodo = (nodo == (resultado.info.groundNode || 0)) ? `Nodo ${nodo} (Tierra)` : `Nodo ${nodo}`;
                    contenido += `  ${etiquetaNodo.padEnd(18)}: ${valorStr} V\n`;
                });
                contenido += '\n';
            }

            // Corrientes en fuentes
            if (resultado.corrientes && Object.keys(resultado.corrientes).length > 0) {
                contenido += 'CORRIENTES EN FUENTES DE VOLTAJE\n';
                for (const fuente in resultado.corrientes) {
                    const corriente = resultado.corrientes[fuente];
                    const valorStr = this.formatearComplejo(corriente, 6);
                    contenido += `  ${fuente.padEnd(18)}: ${valorStr} A\n`;
                }
                contenido += '\n';
            }

            // Matrices del sistema
            if (resultado.matrices) {
                contenido += 'MATRICES DEL SISTEMA\n\n';

                if (resultado.matrices.A) {
                    contenido += 'Matriz A (Sistema):\n';
                    contenido += this.matrizATexto(resultado.matrices.A) + '\n';
                }
                if (resultado.matrices.x) {
                    contenido += 'Vector x (Incógnitas):\n';
                    contenido += this.matrizATexto(resultado.matrices.x) + '\n';
                }
                if (resultado.matrices.z) {
                    contenido += 'Vector z (Fuentes):\n';
                    contenido += this.matrizATexto(resultado.matrices.z) + '\n';
                }
            }

            // Crear blob y descargar
            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.mostrarExito(`Resultados exportados a ${nombreArchivo}`);

        } catch (error) {
            this.mostrarError(`Error al exportar resultados: ${error.message}`);
        }
    },

    /**
     * Convertir matriz a texto plano
     * @param {Array} matriz - Matriz a convertir
     * @returns {string} Representación en texto
     */
    matrizATexto(matriz) {
        let texto = '';

        try {
            // Convertir matriz a array si es necesario
            let matrizArray = matriz;
            if (matriz._data) {
                matrizArray = matriz._data;
            }

            // Determinar si es vector o matriz
            const esVector = Array.isArray(matrizArray) &&
                           (matrizArray.length === 0 || !Array.isArray(matrizArray[0]));

            if (esVector) {
                // Vector
                for (let i = 0; i < matrizArray.length; i++) {
                    const valor = this.formatearComplejo(matrizArray[i], 6);
                    texto += `  [${i}] ${valor}\n`;
                }
            } else {
                // Matriz
                for (let i = 0; i < matrizArray.length; i++) {
                    texto += '  [';
                    for (let j = 0; j < matrizArray[i].length; j++) {
                        const valor = this.formatearComplejo(matrizArray[i][j], 6);
                        texto += valor.padStart(15);
                        if (j < matrizArray[i].length - 1) {
                            texto += '  ';
                        }
                    }
                    texto += ' ]\n';
                }
            }
        } catch (error) {
            texto = `  Error al convertir matriz: ${error.message}\n`;
        }

        return texto;
    },

    /**
     * Convertir número a subíndice Unicode
     * @param {string} numero - Número como string
     * @returns {string} Número con subíndices Unicode
     */
    convertirASubindice(numero) {
        const subindices = {
            '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
            '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return numero.split('').map(char => subindices[char] || char).join('');
    },

    /**
     * Formatear nombre de corriente con notación matemática profesional
     * Convierte "V1" en "i<sub>V₁</sub>" (iᵥ₁ con subíndice)
     * @param {string} nombreFuente - Nombre de la fuente (ej: "V1", "V2")
     * @returns {string} HTML con notación matemática
     */
    formatearNombreCorriente(nombreFuente) {
        // Extraer el tipo y número (ej: V1 → tipo="V", numero="1")
        const match = nombreFuente.match(/^([A-Z]+)(\d+)$/);

        if (!match) {
            return `<em>i</em><sub>${nombreFuente}</sub>`;
        }

        const tipo = match[1];
        const numero = match[2];

        // Convertir número a subíndice Unicode
        const numeroSubindice = this.convertirASubindice(numero);

        // Retornar con formato HTML: i<sub>V₁</sub>
        return `<em>i</em><sub>${tipo}${numeroSubindice}</sub>`;
    }
};

// Exportar para uso en otros módulos (si se usa como módulo ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultDisplay;
}
