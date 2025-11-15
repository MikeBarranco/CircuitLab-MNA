/**
 * CircuitLab MNA - Núcleo del Análisis Nodal Modificado
 *
 * Implementación académica exacta del algoritmo MNA (Modified Nodal Analysis)
 * para análisis de circuitos eléctricos lineales.
 *
 * Ecuación fundamental: Ax = z
 * Donde:
 *   A = [G  B] - Matriz de coeficientes (n+m)x(n+m)
 *       [C  D]
 *   x = [v] - Vector de incógnitas (voltajes + corrientes)
 *       [j]
 *   z = [i] - Vector de términos conocidos
 *       [e]
 *
 * Referencias:
 * - Ho, Ruehli, Brennan. "The Modified Nodal Approach to Network Analysis" (1975)
 * - Nilsson & Riedel. "Electric Circuits" (2015)
 */

const MNACore = {

    /**
     * 1. CONSTRUCCIÓN DE MATRIZ G (Conductancias)
     *
     * Construye la matriz de conductancias G de dimensión nxn
     * donde n = número de nodos (excluyendo el nodo de tierra)
     *
     * REGLAS DEL ALGORITMO MNA:
     * - Elemento diagonal G[i][i]: suma de todas las conductancias conectadas al nodo i
     * - Elemento off-diagonal G[i][j]: negativo de la conductancia entre nodos i y j
     * - Si no hay conexión directa entre i y j: G[i][j] = 0
     *
     * CONDUCTANCIAS POR TIPO DE ELEMENTO:
     * - Resistor: g = 1/R (siempre real)
     * - Capacitor AC: g = jωC = j·2πf·C (imaginario puro)
     * - Inductor AC: g = 1/(jωL) = -j/(2πf·L) (imaginario puro)
     * - Capacitor DC (f=0): g = 0 (circuito abierto)
     * - Inductor DC (f=0): g → ∞ (cortocircuito, requiere tratamiento especial)
     *
     * @param {Array} elementos - Lista de elementos del circuito
     * @param {number} numNodes - Número total de nodos (incluyendo tierra)
     * @param {number} groundNode - Índice del nodo de tierra
     * @param {number} frequency - Frecuencia de análisis en Hz (0 para DC)
     * @returns {Array} Matriz G (nxn) usando math.js
     */
    construirMatrizG(elementos, numNodes, groundNode, frequency) {
        const n = numNodes - 1; // Número de nodos sin contar tierra
        let G = math.zeros(n, n); // Matriz inicializada en ceros
        const omega = 2 * Math.PI * frequency; // Frecuencia angular (rad/s)

        // Filtrar elementos pasivos (R, C, L)
        const elementosPasivos = elementos.filter(e =>
            e.tipo === 'R' || e.tipo === 'C' || e.tipo === 'L'
        );

        // Procesar cada elemento pasivo
        for (const elemento of elementosPasivos) {
            const nodo1 = elemento.nodoPositivo;
            const nodo2 = elemento.nodoNegativo;

            // Calcular conductancia según el tipo de elemento
            let conductancia;

            switch (elemento.tipo) {
                case 'R':
                    // Resistor: g = 1/R (real)
                    if (elemento.valor === 0) {
                        throw new Error(`Resistor ${elemento.nombre} tiene valor cero (cortocircuito)`);
                    }
                    conductancia = 1 / elemento.valor;
                    break;

                case 'C':
                    // Capacitor
                    if (frequency === 0) {
                        // DC: capacitor es circuito abierto (g = 0)
                        conductancia = 0;
                    } else {
                        // AC: g = jωC (imaginario puro)
                        conductancia = math.complex(0, omega * elemento.valor);
                    }
                    break;

                case 'L':
                    // Inductor
                    if (frequency === 0) {
                        // DC: inductor es cortocircuito
                        // En MNA, esto requiere tratamiento especial (similar a fuente de voltaje)
                        // Por ahora, usar conductancia muy alta
                        conductancia = 1e12; // Conductancia muy alta para simular cortocircuito
                    } else {
                        // AC: g = 1/(jωL) = -j/(ωL)
                        conductancia = math.complex(0, -1 / (omega * elemento.valor));
                    }
                    break;

                default:
                    conductancia = 0;
            }

            // Convertir nodos a índices en la matriz (excluyendo tierra)
            // IMPORTANTE: retorna -1 si el nodo es groundNode
            const i = this.nodoAIndice(nodo1, groundNode);
            const j = this.nodoAIndice(nodo2, groundNode);

            // Aplicar estampilla (stamp) de conductancia en la matriz G
            // REGLA: La conductancia se suma en la diagonal y se resta off-diagonal
            // CRÍTICO: Solo agregar a matriz si el índice >= 0 (NO es nodo de tierra)

            // Diagonal: G[i][i] += conductancia (solo si nodo1 NO es tierra)
            if (i >= 0) {
                G = MatrixBuilder.sumarElemento(G, i, i, conductancia);
            }

            // Diagonal: G[j][j] += conductancia (solo si nodo2 NO es tierra)
            if (j >= 0) {
                G = MatrixBuilder.sumarElemento(G, j, j, conductancia);
            }

            // Off-diagonal: G[i][j] -= conductancia y G[j][i] -= conductancia
            // Solo si AMBOS nodos NO son tierra
            if (i >= 0 && j >= 0) {
                G = MatrixBuilder.sumarElemento(G, i, j, math.multiply(-1, conductancia));
                G = MatrixBuilder.sumarElemento(G, j, i, math.multiply(-1, conductancia));
            }
        }

        return G;
    },

    /**
     * 2. CONSTRUCCIÓN DE MATRIZ B
     *
     * Construye la matriz B de dimensión nxm
     * donde n = número de nodos (sin tierra), m = número de fuentes de voltaje
     *
     * REGLAS DEL ALGORITMO MNA:
     * - B[i][j] = +1 si el terminal positivo de la fuente de voltaje j está en el nodo i
     * - B[i][j] = -1 si el terminal negativo de la fuente de voltaje j está en el nodo i
     * - B[i][j] = 0 en cualquier otro caso
     * - No se incluyen filas para el nodo de tierra
     *
     * La matriz B relaciona los voltajes de nodo con las corrientes en las fuentes de voltaje.
     *
     * @param {Array} elementos - Lista de elementos del circuito
     * @param {number} numNodes - Número total de nodos (incluyendo tierra)
     * @param {number} groundNode - Índice del nodo de tierra
     * @returns {Array} Matriz B (nxm) usando math.js
     */
    construirMatrizB(elementos, numNodes, groundNode) {
        const n = numNodes - 1; // Número de nodos sin tierra

        // Filtrar solo fuentes de voltaje
        const fuentesVoltaje = elementos.filter(e => e.tipo === 'V');
        const m = fuentesVoltaje.length; // Número de fuentes de voltaje

        // Si no hay fuentes de voltaje, retornar matriz vacía (nx0)
        if (m === 0) {
            return math.zeros(n, 0);
        }

        let B = math.zeros(n, m); // Matriz inicializada en ceros

        // Procesar cada fuente de voltaje
        for (let j = 0; j < m; j++) {
            const fuente = fuentesVoltaje[j];
            const nodoPositivo = fuente.nodoPositivo; // Terminal positivo
            const nodoNegativo = fuente.nodoNegativo; // Terminal negativo

            // Convertir nodos a índices en la matriz
            // IMPORTANTE: retorna -1 si el nodo es groundNode
            const iPosIndice = this.nodoAIndice(nodoPositivo, groundNode);
            const iNegIndice = this.nodoAIndice(nodoNegativo, groundNode);

            // Aplicar estampilla de fuente de voltaje
            // CRÍTICO: Solo establecer valor si el índice >= 0 (NO es nodo de tierra)

            // Terminal positivo: B[i][j] = +1 (solo si NO es tierra)
            if (iPosIndice >= 0) {
                B = MatrixBuilder.establecerElemento(B, iPosIndice, j, 1);
            }

            // Terminal negativo: B[i][j] = -1 (solo si NO es tierra)
            if (iNegIndice >= 0) {
                B = MatrixBuilder.establecerElemento(B, iNegIndice, j, -1);
            }
        }

        return B;
    },

    /**
     * 3. CONSTRUCCIÓN DE MATRIZ C
     *
     * Construye la matriz C como la transpuesta de B.
     *
     * REGLA DEL ALGORITMO MNA:
     * - C = B^T (transpuesta de B)
     * - Dimensión: mxn (donde m = fuentes de voltaje, n = nodos sin tierra)
     *
     * La matriz C relaciona las corrientes en fuentes de voltaje con los voltajes de nodo.
     * Esta relación asegura la conservación de corriente (Ley de Kirchhoff de corrientes).
     *
     * @param {Array} B - Matriz B (nxm)
     * @returns {Array} Matriz C (mxn) usando math.js
     */
    construirMatrizC(B) {
        // La transpuesta se calcula directamente con math.js
        return math.transpose(B);
    },

    /**
     * 4. CONSTRUCCIÓN DE MATRIZ D
     *
     * Construye la matriz D de dimensión mxm (matriz cuadrada).
     *
     * REGLA DEL ALGORITMO MNA:
     * - Para fuentes de voltaje independientes: D = matriz de ceros (mxm)
     * - Para fuentes dependientes o elementos especiales: D puede tener valores no-cero
     *
     * En este simulador básico, solo consideramos fuentes independientes,
     * por lo tanto D siempre es una matriz de ceros.
     *
     * @param {number} numFuentesVoltaje - Número de fuentes de voltaje (m)
     * @returns {Array} Matriz D (mxm) de ceros usando math.js
     */
    construirMatrizD(numFuentesVoltaje) {
        const m = numFuentesVoltaje;
        return math.zeros(m, m); // Matriz mxm de ceros
    },

    /**
     * 5. ENSAMBLAR MATRIZ A
     *
     * Ensambla la matriz A del sistema MNA combinando G, B, C y D.
     *
     * ESTRUCTURA DE LA MATRIZ A:
     *     A = [ G  B ]
     *         [ C  D ]
     *
     * Donde:
     * - G es nxn (conductancias)
     * - B es nxm (relación nodos-fuentes V)
     * - C es mxn (transpuesta de B)
     * - D es mxm (matriz de ceros para fuentes independientes)
     *
     * Dimensión final de A: (n+m)x(n+m)
     *
     * @param {Array} G - Matriz de conductancias (nxn)
     * @param {Array} B - Matriz de incidencia (nxm)
     * @param {Array} C - Transpuesta de B (mxn)
     * @param {Array} D - Matriz de fuentes dependientes (mxm)
     * @returns {Array} Matriz A completa ((n+m)x(n+m))
     */
    ensamblarMatrizA(G, B, C, D) {
        // Concatenar horizontalmente: [G B] y [C D]
        // Luego concatenar verticalmente ambas filas

        // Fila superior: [G | B]
        const filaSuperior = math.concat(G, B, 1); // Concatenar en dimensión 1 (columnas)

        // Fila inferior: [C | D]
        const filaInferior = math.concat(C, D, 1);

        // Matriz completa: concatenar verticalmente
        const A = math.concat(filaSuperior, filaInferior, 0); // Concatenar en dimensión 0 (filas)

        return A;
    },

    /**
     * 6. CONSTRUIR VECTOR i (corrientes conocidas)
     *
     * Construye el vector i de corrientes conocidas de dimensión nx1.
     *
     * REGLAS DEL ALGORITMO MNA:
     * - i[k] = suma algebraica de corrientes de fuentes de corriente en el nodo k
     * - Corriente POSITIVA si la fuente INYECTA corriente en el nodo (terminal positivo)
     * - Corriente NEGATIVA si la fuente EXTRAE corriente del nodo (terminal negativo)
     * - Convención: corriente positiva entra por el terminal positivo (nodo1)
     *
     * @param {Array} elementos - Lista de elementos del circuito
     * @param {number} numNodes - Número total de nodos (incluyendo tierra)
     * @param {number} groundNode - Índice del nodo de tierra
     * @returns {Array} Vector i (nx1) usando math.js
     */
    construirVectorI(elementos, numNodes, groundNode) {
        const n = numNodes - 1; // Número de nodos sin tierra
        let i = math.zeros(n, 1); // Vector columna inicializado en ceros

        // Filtrar solo fuentes de corriente
        const fuentesCorriente = elementos.filter(e => e.tipo === 'I');

        // Procesar cada fuente de corriente
        for (const fuente of fuentesCorriente) {
            const nodoPositivo = fuente.nodoPositivo; // Terminal por donde entra la corriente
            const nodoNegativo = fuente.nodoNegativo; // Terminal por donde sale la corriente
            const corriente = fuente.valor;

            // Convertir nodos a índices
            // IMPORTANTE: retorna -1 si el nodo es groundNode
            const iPos = this.nodoAIndice(nodoPositivo, groundNode);
            const iNeg = this.nodoAIndice(nodoNegativo, groundNode);

            // Aplicar estampilla de fuente de corriente
            // CRÍTICO: Solo sumar corriente si el índice >= 0 (NO es nodo de tierra)

            // La corriente ENTRA por el terminal positivo: i[iPos] += corriente
            if (iPos >= 0) {
                i = MatrixBuilder.sumarElemento(i, iPos, 0, corriente);
            }

            // La corriente SALE por el terminal negativo: i[iNeg] -= corriente
            if (iNeg >= 0) {
                i = MatrixBuilder.sumarElemento(i, iNeg, 0, math.multiply(-1, corriente));
            }
        }

        return i;
    },

    /**
     * 7. CONSTRUIR VECTOR e (voltajes conocidos)
     *
     * Construye el vector e de voltajes conocidos de dimensión mx1.
     *
     * REGLAS DEL ALGORITMO MNA:
     * - e[j] = voltaje de la fuente de voltaje j
     * - El orden de las fuentes debe coincidir con el orden en la matriz B
     * - Voltaje positivo significa que el terminal positivo tiene mayor potencial
     *
     * @param {Array} elementos - Lista de elementos del circuito
     * @returns {Array} Vector e (mx1) usando math.js
     */
    construirVectorE(elementos) {
        // Filtrar solo fuentes de voltaje
        const fuentesVoltaje = elementos.filter(e => e.tipo === 'V');
        const m = fuentesVoltaje.length;

        // Si no hay fuentes de voltaje, retornar vector vacío
        if (m === 0) {
            return math.zeros(0, 1);
        }

        let e = math.zeros(m, 1); // Vector columna

        // Llenar el vector con los valores de las fuentes
        for (let j = 0; j < m; j++) {
            e = e.subset(math.index(j, 0), fuentesVoltaje[j].valor);
        }

        return e;
    },

    /**
     * 8. ENSAMBLAR VECTOR z
     *
     * Ensambla el vector z del sistema MNA combinando i y e.
     *
     * ESTRUCTURA DEL VECTOR z:
     *     z = [ i ]
     *         [ e ]
     *
     * Donde:
     * - i es nx1 (corrientes conocidas en nodos)
     * - e es mx1 (voltajes conocidos de fuentes)
     *
     * Dimensión final de z: (n+m)x1
     *
     * @param {Array} i - Vector de corrientes conocidas (nx1)
     * @param {Array} e - Vector de voltajes conocidos (mx1)
     * @returns {Array} Vector z completo ((n+m)x1)
     */
    ensamblarVectorZ(i, e) {
        // Concatenar verticalmente i y e
        const z = math.concat(i, e, 0); // Concatenar en dimensión 0 (filas)
        return z;
    },

    /**
     * 9. RESOLVER SISTEMA Ax = z
     *
     * Resuelve el sistema de ecuaciones lineales Ax = z usando descomposición LU.
     *
     * MÉTODO DE SOLUCIÓN:
     * - Se utiliza math.lusolve() que implementa descomposición LU con pivoteo parcial
     * - Este método es numéricamente estable y eficiente para matrices densas
     * - Complejidad: O(n³) para la descomposición, O(n²) para la sustitución
     *
     * MANEJO DE ERRORES:
     * - Matriz singular (det(A) = 0): indica que el circuito está mal definido
     *   Causas comunes:
     *   * Nodos flotantes (sin conexión a tierra)
     *   * Lazos de fuentes de voltaje
     *   * Cortocircuitos que violan LKV
     * - Sistema inconsistente: no tiene solución física
     *
     * @param {Array} A - Matriz de coeficientes ((n+m)x(n+m))
     * @param {Array} z - Vector de términos conocidos ((n+m)x1)
     * @returns {Array} Vector x de soluciones ((n+m)x1)
     * @throws {Error} Si la matriz es singular o el sistema no tiene solución
     */
    resolverSistema(A, z) {
        try {
            // Verificar que la matriz A es cuadrada
            const sizeA = math.size(A);
            if (sizeA[0] !== sizeA[1]) {
                throw new Error(`Matriz A no es cuadrada: ${sizeA[0]}x${sizeA[1]}`);
            }

            // Verificar que las dimensiones coinciden
            const sizeZ = math.size(z);
            if (sizeA[0] !== sizeZ[0]) {
                throw new Error(`Dimensiones incompatibles: A es ${sizeA[0]}x${sizeA[1]}, z es ${sizeZ[0]}x${sizeZ[1]}`);
            }

            // Verificar que la matriz no es singular calculando su determinante
            // Nota: Para matrices grandes, esto puede ser costoso, pero es necesario para validación
            const det = math.det(A);

            if (math.abs(det) < 1e-10) {
                // Determinante muy pequeño o cero: matriz singular
                throw new Error(
                    'Matriz singular detectada (det ≈ 0). ' +
                    'Posibles causas:\n' +
                    '  - Nodo sin conexión a tierra\n' +
                    '  - Lazo de fuentes de voltaje\n' +
                    '  - Cortocircuito que viola LKV\n' +
                    '  - Circuito mal definido'
                );
            }

            // Resolver el sistema usando descomposición LU
            // lusolve retorna un array de soluciones
            const x = math.lusolve(A, z);

            // Verificar que se obtuvo una solución válida
            if (!x || x.length === 0) {
                throw new Error('No se pudo obtener solución del sistema');
            }

            return x;

        } catch (error) {
            // Capturar errores de math.js y proporcionar mensajes más descriptivos
            if (error.message.includes('Singular matrix')) {
                throw new Error(
                    'Error: Matriz singular en MNA. ' +
                    'El circuito no puede ser resuelto. ' +
                    'Verifique conexiones y nodo de tierra.'
                );
            } else if (error.message.includes('Dimensions')) {
                throw new Error(
                    'Error dimensional en el sistema MNA: ' + error.message
                );
            } else {
                // Re-lanzar el error con contexto adicional
                throw new Error('Error al resolver sistema MNA: ' + error.message);
            }
        }
    },

    /**
     * 10. MÉTODO PRINCIPAL: analizarCircuito
     *
     * Orquesta todo el proceso de análisis MNA del circuito.
     * Este es el método público principal que debe ser llamado para analizar un circuito.
     *
     * FLUJO DEL ALGORITMO:
     * 1. Validar entrada y contar elementos
     * 2. Construir todas las matrices (G, B, C, D)
     * 3. Ensamblar matriz A del sistema
     * 4. Construir vectores (i, e)
     * 5. Ensamblar vector z del sistema
     * 6. Resolver sistema Ax = z
     * 7. Extraer e interpretar resultados
     * 8. Retornar voltajes de nodos y corrientes de fuentes
     *
     * @param {Array} elementos - Lista de elementos del circuito
     *        Cada elemento debe tener: {tipo, nombre, nodo1, nodo2, valor}
     * @param {number} numNodes - Número total de nodos (incluyendo tierra)
     * @param {number} groundNode - Índice del nodo de tierra
     * @param {number} frequency - Frecuencia de análisis en Hz (0 para DC)
     * @returns {Object} Resultados del análisis:
     *          {
     *            exito: boolean,
     *            voltajes: {nodo: voltaje},
     *            corrientes: {nombreFuente: corriente},
     *            matrices: {A, x, z, G, B, C, D} (para depuración)
     *          }
     * @throws {Error} Si el circuito no puede ser resuelto
     */
    analizarCircuito(elementos, numNodes, groundNode, frequency = 0) {
        try {
            // ==================== PASO 1: VALIDACIÓN Y PREPARACIÓN ====================

            // Validar entrada
            if (!elementos || elementos.length === 0) {
                throw new Error('No hay elementos en el circuito');
            }

            if (numNodes < 2) {
                throw new Error('El circuito debe tener al menos 2 nodos (incluyendo tierra)');
            }

            if (groundNode < 0 || groundNode >= numNodes) {
                throw new Error(`Nodo de tierra inválido: ${groundNode}`);
            }

            if (frequency < 0) {
                throw new Error('La frecuencia no puede ser negativa');
            }

            // Contar elementos por tipo
            const fuentesVoltaje = elementos.filter(e => e.tipo === 'V');
            const fuentesCorriente = elementos.filter(e => e.tipo === 'I');
            const resistores = elementos.filter(e => e.tipo === 'R');
            const capacitores = elementos.filter(e => e.tipo === 'C');
            const inductores = elementos.filter(e => e.tipo === 'L');

            const n = numNodes - 1; // Número de nodos sin tierra
            const m = fuentesVoltaje.length; // Número de fuentes de voltaje

            // Validar que hay al menos un camino a tierra
            const nodosConectados = new Set([groundNode]);
            let cambio = true;
            while (cambio) {
                cambio = false;
                for (const elem of elementos) {
                    if (nodosConectados.has(elem.nodoPositivo) && !nodosConectados.has(elem.nodoNegativo)) {
                        nodosConectados.add(elem.nodoNegativo);
                        cambio = true;
                    } else if (nodosConectados.has(elem.nodoNegativo) && !nodosConectados.has(elem.nodoPositivo)) {
                        nodosConectados.add(elem.nodoPositivo);
                        cambio = true;
                    }
                }
            }

            if (nodosConectados.size < numNodes) {
                console.warn('Advertencia: Algunos nodos no están conectados a tierra');
            }

            // ==================== PASO 2: CONSTRUCCIÓN DE MATRICES ====================

            // Construir matriz G (conductancias)
            const G = this.construirMatrizG(elementos, numNodes, groundNode, frequency);

            // Construir matriz B (incidencia de fuentes de voltaje)
            const B = this.construirMatrizB(elementos, numNodes, groundNode);

            // Construir matriz C (transpuesta de B)
            const C = this.construirMatrizC(B);

            // Construir matriz D (ceros para fuentes independientes)
            const D = this.construirMatrizD(m);

            // Ensamblar matriz A completa
            const A = this.ensamblarMatrizA(G, B, C, D);

            // ==================== PASO 3: CONSTRUCCIÓN DE VECTORES ====================

            // Construir vector i (corrientes conocidas)
            const i = this.construirVectorI(elementos, numNodes, groundNode);

            // Construir vector e (voltajes conocidos)
            const e = this.construirVectorE(elementos);

            // Ensamblar vector z completo
            const z = this.ensamblarVectorZ(i, e);

            // ==================== PASO 4: RESOLUCIÓN DEL SISTEMA ====================

            // Resolver Ax = z
            const x = this.resolverSistema(A, z);

            // ==================== PASO 5: EXTRACCIÓN DE RESULTADOS ====================

            // Los primeros n elementos de x son voltajes de nodos
            // Los siguientes m elementos son corrientes en fuentes de voltaje

            const voltajes = {};
            const corrientes = {};

            // Extraer voltajes de nodos
            for (let i = 0; i < n; i++) {
                // Convertir índice de matriz a número de nodo real
                const nodoReal = (i < groundNode) ? i : i + 1;

                // Extraer valor (puede ser complejo en AC)
                const voltaje = x.get([i, 0]); // Usar .get() para extraer de matriz math.js
                voltajes[nodoReal] = voltaje;
            }

            // El nodo de tierra siempre tiene voltaje 0
            voltajes[groundNode] = 0;

            // Extraer corrientes en fuentes de voltaje
            for (let j = 0; j < m; j++) {
                const fuente = fuentesVoltaje[j];
                const corriente = x.get([n + j, 0]); // Usar .get() para extraer de matriz math.js
                corrientes[fuente.nombre] = corriente;
            }

            // ==================== PASO 6: RETORNAR RESULTADOS ====================

            return {
                exito: true,
                voltajes: voltajes,
                corrientes: corrientes,
                matrices: {
                    A: A,
                    x: x,
                    z: z,
                    G: G,
                    B: B,
                    C: C,
                    D: D
                },
                info: {
                    numNodos: numNodes,
                    numNodosSinTierra: n,
                    numFuentesVoltaje: m,
                    numFuentesCorriente: fuentesCorriente.length,
                    numResistores: resistores.length,
                    numCapacitores: capacitores.length,
                    numInductores: inductores.length,
                    frequency: frequency,
                    tipoAnalisis: frequency === 0 ? 'DC' : 'AC',
                    determinante: math.det(A)
                }
            };

        } catch (error) {
            // Manejar errores y retornar resultado con información del error
            return {
                exito: false,
                error: error.message,
                voltajes: {},
                corrientes: {},
                matrices: null
            };
        }
    },

    /**
     * 11. MÉTODO AUXILIAR: nodoAIndice
     *
     * Convierte el número de nodo real a su índice correspondiente en las matrices MNA.
     *
     * REGLA DE CONVERSIÓN:
     * - El nodo de tierra NO aparece en las matrices (retorna -1)
     * - Los nodos con número menor que tierra mantienen su índice
     * - Los nodos con número mayor que tierra tienen índice = número - 1
     *
     * Ejemplo: Si tierra = 0 y hay 4 nodos (0,1,2,3)
     *   nodo 0 (tierra) -> índice -1 (no aparece)
     *   nodo 1 -> índice 0
     *   nodo 2 -> índice 1
     *   nodo 3 -> índice 2
     *
     * Ejemplo: Si tierra = 2 y hay 4 nodos (0,1,2,3)
     *   nodo 0 -> índice 0
     *   nodo 1 -> índice 1
     *   nodo 2 (tierra) -> índice -1 (no aparece)
     *   nodo 3 -> índice 2
     *
     * @param {number} nodo - Número del nodo real
     * @param {number} groundNode - Número del nodo de tierra
     * @returns {number} Índice en la matriz (-1 si es tierra)
     */
    nodoAIndice(nodo, groundNode) {
        if (nodo === groundNode) {
            return -1; // El nodo de tierra no tiene índice en las matrices
        }

        if (nodo < groundNode) {
            return nodo; // Los nodos antes de tierra mantienen su índice
        } else {
            return nodo - 1; // Los nodos después de tierra se desplazan uno
        }
    },

    /**
     * 12. MÉTODO AUXILIAR: calcularImpedancia
     *
     * Calcula la impedancia compleja de un elemento según su tipo y la frecuencia.
     *
     * FÓRMULAS DE IMPEDANCIA:
     * - Resistor: Z = R (resistencia pura, real)
     * - Capacitor: Z = 1/(jωC) = -j/(ωC) (reactancia capacitiva, imaginaria negativa)
     * - Inductor: Z = jωL (reactancia inductiva, imaginaria positiva)
     *
     * Donde: ω = 2πf (frecuencia angular en rad/s)
     *
     * CASOS ESPECIALES (DC, f=0):
     * - Capacitor: Z → ∞ (circuito abierto)
     * - Inductor: Z → 0 (cortocircuito)
     *
     * @param {Object} elemento - Elemento del circuito {tipo, valor}
     * @param {number} frequency - Frecuencia en Hz
     * @returns {number|Complex} Impedancia (puede ser real o compleja)
     */
    calcularImpedancia(elemento, frequency) {
        const omega = 2 * Math.PI * frequency; // Frecuencia angular (rad/s)

        switch (elemento.tipo) {
            case 'R':
                // Resistor: impedancia real
                return elemento.valor;

            case 'C':
                // Capacitor
                if (frequency === 0) {
                    // DC: circuito abierto
                    return Infinity;
                } else {
                    // AC: Z = 1/(jωC) = -j/(ωC)
                    // Calculado como: Z = 1 / (j * ω * C)
                    return math.divide(1, math.multiply(math.complex(0, 1), omega * elemento.valor));
                }

            case 'L':
                // Inductor
                if (frequency === 0) {
                    // DC: cortocircuito
                    return 0;
                } else {
                    // AC: Z = jωL
                    return math.complex(0, omega * elemento.valor);
                }

            default:
                // Tipo desconocido
                return 0;
        }
    },

    /**
     * MÉTODO AUXILIAR: calcularConductancia
     *
     * Calcula la conductancia (admitancia) compleja de un elemento.
     *
     * RELACIÓN: Y = 1/Z (conductancia es el recíproco de la impedancia)
     *
     * @param {Object} elemento - Elemento del circuito
     * @param {number} frequency - Frecuencia en Hz
     * @returns {number|Complex} Conductancia
     */
    calcularConductancia(elemento, frequency) {
        const impedancia = this.calcularImpedancia(elemento, frequency);

        // Manejar casos especiales
        if (impedancia === 0) {
            // Impedancia cero (cortocircuito) -> conductancia infinita
            return 1e12; // Usar valor muy alto
        } else if (impedancia === Infinity) {
            // Impedancia infinita (circuito abierto) -> conductancia cero
            return 0;
        } else {
            // Caso general: Y = 1/Z
            return math.divide(1, impedancia);
        }
    },

    /**
     * MÉTODO DE DEPURACIÓN: imprimirMatrices
     *
     * Imprime las matrices del sistema MNA en formato legible.
     * Útil para depuración y validación del algoritmo.
     *
     * @param {Object} matrices - Objeto con matrices {A, x, z, G, B, C, D}
     */
    imprimirMatrices(matrices) {
        console.log('\n========== MATRICES DEL SISTEMA MNA ==========\n');

        console.log('Matriz G (Conductancias):');
        console.log(math.format(matrices.G, {precision: 6}));

        console.log('\nMatriz B (Incidencia fuentes V):');
        console.log(math.format(matrices.B, {precision: 6}));

        console.log('\nMatriz C (Transpuesta de B):');
        console.log(math.format(matrices.C, {precision: 6}));

        console.log('\nMatriz D (Fuentes dependientes):');
        console.log(math.format(matrices.D, {precision: 6}));

        console.log('\nMatriz A (Sistema completo):');
        console.log(math.format(matrices.A, {precision: 6}));

        console.log('\nVector z (Términos conocidos):');
        console.log(math.format(matrices.z, {precision: 6}));

        console.log('\nVector x (Solución):');
        console.log(math.format(matrices.x, {precision: 6}));

        console.log('\n===============================================\n');
    }
};

// Exportar para uso en otros módulos (si se usa en Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MNACore;
}
