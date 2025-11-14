/**
 * MatrixBuilder - Utilidades auxiliares para construcción y manipulación de matrices
 *
 * Este módulo provee funciones helper que facilitan el trabajo con matrices
 * en el simulador MNA usando la librería math.js
 *
 * @module MatrixBuilder
 * @requires math.js
 */

const MatrixBuilder = {
    /**
     * Crear una matriz vacía (de ceros) con dimensiones especificadas
     * @param {number} filas - Número de filas
     * @param {number} columnas - Número de columnas
     * @returns {Matrix} Matriz de ceros
     */
    crearMatrizVacia(filas, columnas) {
        if (filas <= 0 || columnas <= 0) {
            throw new Error('Las dimensiones de la matriz deben ser positivas');
        }
        return math.zeros(filas, columnas);
    },

    /**
     * Crear un vector vacío (de ceros) con tamaño especificado
     * @param {number} tamanio - Tamaño del vector
     * @returns {Matrix} Vector de ceros
     */
    crearVectorVacio(tamanio) {
        if (tamanio <= 0) {
            throw new Error('El tamaño del vector debe ser positivo');
        }
        return math.zeros(tamanio);
    },

    /**
     * Crear una copia profunda de una matriz
     * @param {Matrix} matriz - Matriz a copiar
     * @returns {Matrix} Copia de la matriz
     */
    copiarMatriz(matriz) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }
        return math.clone(matriz);
    },

    /**
     * Establecer un valor en una posición específica de la matriz
     * @param {Matrix} matriz - Matriz a modificar
     * @param {number} fila - Índice de fila (base 0)
     * @param {number} columna - Índice de columna (base 0)
     * @param {number} valor - Valor a establecer
     * @returns {Matrix} Matriz modificada
     */
    establecerElemento(matriz, fila, columna, valor) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }

        const dims = math.size(matriz);
        const numFilas = dims._data ? dims._data[0] : dims[0];
        const numColumnas = dims._data ? dims._data[1] : dims[1];

        if (fila < 0 || fila >= numFilas) {
            throw new Error(`Índice de fila ${fila} fuera de rango [0, ${numFilas - 1}]`);
        }
        if (columna < 0 || columna >= numColumnas) {
            throw new Error(`Índice de columna ${columna} fuera de rango [0, ${numColumnas - 1}]`);
        }

        return math.subset(matriz, math.index(fila, columna), valor);
    },

    /**
     * Obtener el valor de una posición específica de la matriz
     * @param {Matrix} matriz - Matriz de la cual obtener el valor
     * @param {number} fila - Índice de fila (base 0)
     * @param {number} columna - Índice de columna (base 0)
     * @returns {number} Valor en la posición especificada
     */
    obtenerElemento(matriz, fila, columna) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }

        const dims = math.size(matriz);
        const numFilas = dims._data ? dims._data[0] : dims[0];
        const numColumnas = dims._data ? dims._data[1] : dims[1];

        if (fila < 0 || fila >= numFilas) {
            throw new Error(`Índice de fila ${fila} fuera de rango [0, ${numFilas - 1}]`);
        }
        if (columna < 0 || columna >= numColumnas) {
            throw new Error(`Índice de columna ${columna} fuera de rango [0, ${numColumnas - 1}]`);
        }

        return math.subset(matriz, math.index(fila, columna));
    },

    /**
     * Sumar un valor al elemento existente en una posición específica
     * Útil para estampillas (stamps) en la matriz G del MNA
     * @param {Matrix} matriz - Matriz a modificar
     * @param {number} fila - Índice de fila (base 0)
     * @param {number} columna - Índice de columna (base 0)
     * @param {number} valor - Valor a sumar
     * @returns {Matrix} Matriz modificada
     */
    sumarElemento(matriz, fila, columna, valor) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }

        const dims = math.size(matriz);
        const numFilas = dims._data ? dims._data[0] : dims[0];
        const numColumnas = dims._data ? dims._data[1] : dims[1];

        if (fila < 0 || fila >= numFilas) {
            throw new Error(`Índice de fila ${fila} fuera de rango [0, ${numFilas - 1}]`);
        }
        if (columna < 0 || columna >= numColumnas) {
            throw new Error(`Índice de columna ${columna} fuera de rango [0, ${numColumnas - 1}]`);
        }

        // Obtener valor actual y sumar el nuevo valor
        const valorActual = math.subset(matriz, math.index(fila, columna));
        const nuevoValor = math.add(valorActual, valor);

        return math.subset(matriz, math.index(fila, columna), nuevoValor);
    },

    /**
     * Concatenar dos matrices horizontalmente [matriz1 | matriz2]
     * @param {Matrix} matriz1 - Primera matriz
     * @param {Matrix} matriz2 - Segunda matriz
     * @returns {Matrix} Matriz resultante de la concatenación horizontal
     */
    concatenarHorizontal(matriz1, matriz2) {
        if (!matriz1 || !matriz2) {
            throw new Error('Ambas matrices deben ser válidas');
        }

        const dims1 = math.size(matriz1);
        const dims2 = math.size(matriz2);
        const filas1 = dims1._data ? dims1._data[0] : dims1[0];
        const filas2 = dims2._data ? dims2._data[0] : dims2[0];

        if (filas1 !== filas2) {
            throw new Error(`Las matrices deben tener el mismo número de filas para concatenación horizontal (${filas1} vs ${filas2})`);
        }

        // Concatenación horizontal: segundo parámetro = 1
        return math.concat(matriz1, matriz2, 1);
    },

    /**
     * Concatenar dos matrices verticalmente (arriba-abajo)
     * @param {Matrix} matriz1 - Primera matriz (arriba)
     * @param {Matrix} matriz2 - Segunda matriz (abajo)
     * @returns {Matrix} Matriz resultante de la concatenación vertical
     */
    concatenarVertical(matriz1, matriz2) {
        if (!matriz1 || !matriz2) {
            throw new Error('Ambas matrices deben ser válidas');
        }

        const dims1 = math.size(matriz1);
        const dims2 = math.size(matriz2);
        const cols1 = dims1._data ? dims1._data[1] : dims1[1];
        const cols2 = dims2._data ? dims2._data[1] : dims2[1];

        if (cols1 !== cols2) {
            throw new Error(`Las matrices deben tener el mismo número de columnas para concatenación vertical (${cols1} vs ${cols2})`);
        }

        // Concatenación vertical: segundo parámetro = 0
        return math.concat(matriz1, matriz2, 0);
    },

    /**
     * Obtener las dimensiones de una matriz
     * @param {Matrix} matriz - Matriz a analizar
     * @returns {Object} Objeto con propiedades {filas, columnas}
     */
    obtenerDimensiones(matriz) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }

        const dims = math.size(matriz);
        const filas = dims._data ? dims._data[0] : dims[0];
        const columnas = dims._data ? (dims._data[1] || 1) : (dims[1] || 1);

        return {
            filas: filas,
            columnas: columnas
        };
    },

    /**
     * Convertir matriz de math.js a array JavaScript nativo
     * @param {Matrix} matriz - Matriz de math.js
     * @returns {Array} Array 2D nativo de JavaScript
     */
    matrizAArray(matriz) {
        if (!matriz) {
            throw new Error('La matriz no puede ser nula o indefinida');
        }

        // Si ya es un array, devolverlo
        if (Array.isArray(matriz)) {
            return matriz;
        }

        // Convertir matriz de math.js a array
        if (typeof matriz.toArray === 'function') {
            return matriz.toArray();
        }

        // Intentar conversión alternativa
        return math.matrix(matriz).toArray();
    },

    /**
     * Convertir array JavaScript a matriz de math.js
     * @param {Array} array - Array JavaScript (1D o 2D)
     * @returns {Matrix} Matriz de math.js
     */
    arrayAMatriz(array) {
        if (!array || !Array.isArray(array)) {
            throw new Error('El parámetro debe ser un array válido');
        }

        return math.matrix(array);
    },

    /**
     * Formatear un número para visualización
     * Maneja números reales, complejos y muy pequeños
     * @param {number|Complex} numero - Número a formatear
     * @param {number} decimales - Número de decimales (por defecto 4)
     * @returns {string} Número formateado como string
     */
    formatearNumero(numero, decimales = 4) {
        // Manejar null o undefined
        if (numero === null || numero === undefined) {
            return '0';
        }

        // Verificar si es un número complejo
        if (typeof numero === 'object' && (numero.re !== undefined || numero.im !== undefined)) {
            const real = numero.re || 0;
            const imag = numero.im || 0;

            // Si la parte imaginaria es despreciable, mostrar solo real
            if (Math.abs(imag) < 1e-10) {
                return this.formatearNumero(real, decimales);
            }

            // Si la parte real es despreciable, mostrar solo imaginaria
            if (Math.abs(real) < 1e-10) {
                return `${imag.toFixed(decimales)}j`;
            }

            // Formatear como "a + bj" o "a - bj"
            const signo = imag >= 0 ? '+' : '-';
            return `${real.toFixed(decimales)} ${signo} ${Math.abs(imag).toFixed(decimales)}j`;
        }

        // Número real
        const num = parseFloat(numero);

        // Manejar NaN
        if (isNaN(num)) {
            return '0';
        }

        // Números muy pequeños se consideran cero
        if (Math.abs(num) < 1e-10) {
            return '0';
        }

        // Formatear con decimales especificados
        return num.toFixed(decimales);
    },

    /**
     * Imprimir matriz en consola para debugging
     * NOTA: Esta función es solo para desarrollo/debugging
     * @param {Matrix} matriz - Matriz a imprimir
     * @param {string} nombre - Nombre descriptivo de la matriz
     * @param {boolean} habilitado - Si está habilitado (por defecto false en producción)
     */
    imprimirMatriz(matriz, nombre = 'Matriz', habilitado = false) {
        // Solo imprimir si está habilitado (para debugging)
        if (!habilitado) {
            return;
        }

        if (!matriz) {
            console.log(`${nombre}: matriz nula o indefinida`);
            return;
        }

        try {
            console.log(`\n=== ${nombre} ===`);

            const dims = this.obtenerDimensiones(matriz);
            console.log(`Dimensiones: ${dims.filas} x ${dims.columnas}`);

            // Convertir a array para facilitar visualización
            const array = this.matrizAArray(matriz);

            // Si es un vector (1D), mostrarlo como tal
            if (!Array.isArray(array[0])) {
                const vectorFormateado = array.map(val => this.formatearNumero(val));
                console.log('Vector:', vectorFormateado);
                return;
            }

            // Matriz 2D - formatear cada elemento
            const matrizFormateada = array.map(fila =>
                fila.map(val => this.formatearNumero(val))
            );

            // Intentar usar console.table si está disponible
            if (typeof console.table === 'function') {
                console.table(matrizFormateada);
            } else {
                // Fallback: imprimir cada fila
                matrizFormateada.forEach((fila, i) => {
                    console.log(`Fila ${i}:`, fila);
                });
            }

            console.log('=================\n');
        } catch (error) {
            console.error(`Error al imprimir matriz ${nombre}:`, error.message);
        }
    }
};

// Exportar el objeto MatrixBuilder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatrixBuilder;
}
