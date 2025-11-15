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
                fila = [
                    esNodoTierra ? `${nodo} (Tierra)` : nodo,
                    valorFormateado
                ];
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

        // Insertar en el contenedor
        container.innerHTML = `
            <div class="resultado-card">
                <h3>Voltajes de Nodos</h3>
                <p class="text-muted text-sm mb-2">
                    Voltajes medidos respecto al nodo de tierra (referencia 0V)
                </p>
                ${tablaHTML}
            </div>
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
                <div class="resultado-card">
                    <h3>Corrientes en Fuentes de Voltaje</h3>
                    <p class="text-muted text-sm">
                        No hay fuentes de voltaje independientes en el circuito
                    </p>
                </div>
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

                fila = [fuente, valorFormateado, direccion];
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

        // Insertar en el contenedor
        container.innerHTML = `
            <div class="resultado-card">
                <h3>Corrientes en Fuentes de Voltaje</h3>
                <p class="text-muted text-sm mb-2">
                    Corrientes que circulan por las fuentes de voltaje independientes
                </p>
                ${tablaHTML}
            </div>
        `;
    },

    /**
     * Mostrar matrices del sistema (A, x, z)
     * @param {Object} matrices - Objeto con matrices {A, x, z}
     */
    mostrarMatrices(matrices) {
        if (!matrices) return;

        // Mostrar matriz A (conductancias)
        if (matrices.A) {
            this.mostrarMatrizConNombre(
                matrices.A,
                'matrixA',
                'Matriz A (Conductancias)',
                'Matriz de coeficientes del sistema que incluye conductancias, estampas de fuentes de voltaje y componentes reactivos'
            );
        }

        // Mostrar vector x (incógnitas)
        if (matrices.x) {
            this.mostrarMatrizConNombre(
                matrices.x,
                'vectorX',
                'Vector x (Incógnitas)',
                'Vector de incógnitas que contiene voltajes de nodos y corrientes en fuentes de voltaje'
            );
        }

        // Mostrar vector z (fuentes)
        if (matrices.z) {
            this.mostrarMatrizConNombre(
                matrices.z,
                'vectorZ',
                'Vector z (Fuentes)',
                'Vector de términos independientes que contiene corrientes inyectadas y voltajes de fuentes'
            );
        }
    },

    /**
     * Método auxiliar para renderizar una matriz específica
     * @param {Array} matriz - Matriz a renderizar
     * @param {string} contenedorId - ID del contenedor HTML
     * @param {string} nombre - Nombre de la matriz
     * @param {string} descripcion - Descripción de la matriz
     */
    mostrarMatrizConNombre(matriz, contenedorId, nombre, descripcion) {
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

            let tablaHTML = '';

            if (esVector) {
                // Renderizar como vector vertical
                tablaHTML = '<table class="resultado-table">';
                for (let i = 0; i < matrizArray.length; i++) {
                    const valor = matrizArray[i];
                    const valorFormateado = this.formatearComplejo(valor, 6);
                    tablaHTML += `
                        <tr>
                            <td class="text-muted text-sm">Índice ${i}</td>
                            <td class="valor-numerico">${valorFormateado}</td>
                        </tr>
                    `;
                }
                tablaHTML += '</table>';
            } else {
                // Renderizar como matriz
                const filas = matrizArray.length;
                const cols = matrizArray[0] ? matrizArray[0].length : 0;

                tablaHTML = '<table class="resultado-table">';

                // Encabezados de columnas
                tablaHTML += '<tr><th></th>';
                for (let j = 0; j < cols; j++) {
                    tablaHTML += `<th>Columna ${j}</th>`;
                }
                tablaHTML += '</tr>';

                // Filas de datos
                for (let i = 0; i < filas; i++) {
                    tablaHTML += `<tr><td class="text-muted text-sm font-semibold">Fila ${i}</td>`;
                    for (let j = 0; j < cols; j++) {
                        const valor = matrizArray[i][j];
                        const valorFormateado = this.formatearComplejo(valor, 6);

                        // Resaltar diagonal principal
                        const esDiagonal = i === j;
                        const clase = esDiagonal ? 'valor-numerico font-bold' : 'valor-numerico';

                        tablaHTML += `<td class="${clase}">${valorFormateado}</td>`;
                    }
                    tablaHTML += '</tr>';
                }
                tablaHTML += '</table>';
            }

            // Insertar en el contenedor
            container.innerHTML = `
                <div class="resultado-card">
                    <h3>${nombre}</h3>
                    <p class="text-muted text-sm mb-3">${descripcion}</p>
                    <div class="matriz-container">
                        ${tablaHTML}
                    </div>
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="resultado-card">
                    <h3>${nombre}</h3>
                    <p class="text-danger">Error al renderizar matriz: ${error.message}</p>
                </div>
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
    }
};

// Exportar para uso en otros módulos (si se usa como módulo ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultDisplay;
}
