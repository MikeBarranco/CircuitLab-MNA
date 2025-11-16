/**
 * Sistema de Validación Exhaustivo para Simulador MNA
 * Previene TODOS los errores posibles antes de calcular
 *
 * @author CircuitLab MNA
 * @version 1.0.0
 */

const Validator = {
    // ============================================
    // CONSTANTES DE VALIDACIÓN
    // ============================================

    // Límites del circuito
    MIN_NODOS: 2,
    MAX_NODOS: 10,
    MIN_ELEMENTOS: 1,
    MAX_ELEMENTOS: 20,
    MIN_FRECUENCIA: 0,

    // Tipos de elementos válidos
    TIPOS_VALIDOS: ['R', 'V', 'I', 'C', 'L'],

    // Tipos de elementos que son fuentes
    TIPOS_FUENTES: ['V', 'I'],

    // Tolerancia para comparaciones numéricas
    EPSILON: 1e-12,


    // ============================================
    // MÉTODO 1: VALIDAR CONFIGURACIÓN DEL CIRCUITO
    // ============================================

    /**
     * Valida la configuración general del circuito
     * @param {number} numNodes - Número de nodos del circuito
     * @param {number} groundNode - Nodo de referencia (tierra)
     * @param {number} numElements - Número de elementos del circuito
     * @param {number} frequency - Frecuencia de análisis AC (Hz)
     * @returns {Object} {valido: boolean, errores: string[]}
     */
    validarConfiguracionCircuito(numNodes, groundNode, numElements, frequency) {
        const errores = [];

        // Validar número de nodos
        if (!Number.isInteger(numNodes)) {
            errores.push(`El número de nodos debe ser un número entero. Valor recibido: ${numNodes}`);
        } else if (numNodes < this.MIN_NODOS) {
            errores.push(`El circuito debe tener al menos ${this.MIN_NODOS} nodos. Actualmente tiene ${numNodes}.`);
        } else if (numNodes > this.MAX_NODOS) {
            errores.push(`El circuito no puede tener más de ${this.MAX_NODOS} nodos. Actualmente tiene ${numNodes}.`);
        }

        // Validar nodo de tierra
        if (!Number.isInteger(groundNode)) {
            errores.push(`El nodo de tierra debe ser un número entero. Valor recibido: ${groundNode}`);
        } else if (Number.isInteger(numNodes)) {
            // Solo validar rango si numNodes es válido
            if (groundNode < 0) {
                errores.push(`El nodo de tierra no puede ser negativo. Valor recibido: ${groundNode}`);
            } else if (groundNode >= numNodes) {
                errores.push(`El nodo de tierra debe estar entre 0 y ${numNodes - 1}. Valor recibido: ${groundNode}`);
            }
        }

        // Validar número de elementos
        if (!Number.isInteger(numElements)) {
            errores.push(`El número de elementos debe ser un número entero. Valor recibido: ${numElements}`);
        } else if (numElements < this.MIN_ELEMENTOS) {
            errores.push(`El circuito debe tener al menos ${this.MIN_ELEMENTOS} elemento. Actualmente tiene ${numElements}.`);
        } else if (numElements > this.MAX_ELEMENTOS) {
            errores.push(`El circuito no puede tener más de ${this.MAX_ELEMENTOS} elementos. Actualmente tiene ${numElements}.`);
        }

        // Validar frecuencia
        if (typeof frequency !== 'number' || isNaN(frequency)) {
            errores.push(`La frecuencia debe ser un número válido. Valor recibido: ${frequency}`);
        } else if (!isFinite(frequency)) {
            errores.push(`La frecuencia debe ser un valor finito. Valor recibido: ${frequency}`);
        } else if (frequency < this.MIN_FRECUENCIA) {
            errores.push(`La frecuencia no puede ser negativa. Use 0 para análisis DC. Valor recibido: ${frequency} Hz`);
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    },


    // ============================================
    // MÉTODO 2: VALIDAR ELEMENTO INDIVIDUAL
    // ============================================

    /**
     * Valida un elemento del circuito completo
     * @param {Object} elemento - {tipo, nodoPositivo, nodoNegativo, valor, nombre}
     * @returns {Object} {valido: boolean, errores: string[]}
     */
    validarElemento(elemento) {
        const errores = [];

        // Verificar que el elemento existe
        if (!elemento || typeof elemento !== 'object') {
            errores.push('El elemento no es un objeto válido.');
            return { valido: false, errores: errores };
        }

        // Validar tipo
        if (!elemento.tipo) {
            errores.push('El elemento no tiene tipo especificado.');
        } else if (typeof elemento.tipo !== 'string') {
            errores.push(`El tipo del elemento debe ser una cadena de texto. Valor recibido: ${elemento.tipo}`);
        } else {
            const tipoUpper = elemento.tipo.toUpperCase();
            if (!this.TIPOS_VALIDOS.includes(tipoUpper)) {
                errores.push(`Tipo de elemento "${elemento.tipo}" no válido. Tipos permitidos: ${this.TIPOS_VALIDOS.join(', ')}`);
            }
        }

        // Validar nombre
        if (!elemento.nombre) {
            errores.push('El elemento debe tener un nombre.');
        } else if (typeof elemento.nombre !== 'string') {
            errores.push(`El nombre del elemento debe ser texto. Valor recibido: ${elemento.nombre}`);
        } else {
            // Verificar que no tenga espacios
            if (/\s/.test(elemento.nombre)) {
                errores.push(`El nombre "${elemento.nombre}" no puede contener espacios. Use guiones bajos o sin separadores.`);
            }
            // Verificar que no esté vacío después de limpiar
            if (elemento.nombre.trim() === '') {
                errores.push('El nombre del elemento no puede estar vacío.');
            }
            // Verificar formato correcto (letra + número opcional)
            if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(elemento.nombre)) {
                errores.push(`El nombre "${elemento.nombre}" tiene formato incorrecto. Debe comenzar con una letra y contener solo letras, números y guiones bajos.`);
            }
        }

        // Validar nodo positivo
        if (typeof elemento.nodoPositivo !== 'number') {
            errores.push(`El nodo positivo debe ser un número. Valor recibido: ${elemento.nodoPositivo}`);
        } else if (!Number.isInteger(elemento.nodoPositivo)) {
            errores.push(`El nodo positivo debe ser un número entero. Valor recibido: ${elemento.nodoPositivo}`);
        } else if (elemento.nodoPositivo < 0) {
            errores.push(`El nodo positivo no puede ser negativo. Valor recibido: ${elemento.nodoPositivo}`);
        }

        // Validar nodo negativo
        if (typeof elemento.nodoNegativo !== 'number') {
            errores.push(`El nodo negativo debe ser un número. Valor recibido: ${elemento.nodoNegativo}`);
        } else if (!Number.isInteger(elemento.nodoNegativo)) {
            errores.push(`El nodo negativo debe ser un número entero. Valor recibido: ${elemento.nodoNegativo}`);
        } else if (elemento.nodoNegativo < 0) {
            errores.push(`El nodo negativo no puede ser negativo. Valor recibido: ${elemento.nodoNegativo}`);
        }

        // Validar que los nodos son diferentes
        if (Number.isInteger(elemento.nodoPositivo) && Number.isInteger(elemento.nodoNegativo)) {
            if (elemento.nodoPositivo === elemento.nodoNegativo) {
                errores.push(`El elemento "${elemento.nombre}" tiene ambos terminales conectados al mismo nodo (${elemento.nodoPositivo}). Los nodos deben ser diferentes.`);
            }
        }

        // Validar valor según el tipo
        if (typeof elemento.valor !== 'number') {
            errores.push(`El valor del elemento "${elemento.nombre}" debe ser un número. Valor recibido: ${elemento.valor}`);
        } else if (isNaN(elemento.valor)) {
            errores.push(`El valor del elemento "${elemento.nombre}" no es un número válido (NaN).`);
        } else if (!isFinite(elemento.valor)) {
            errores.push(`El valor del elemento "${elemento.nombre}" debe ser finito. Valor recibido: ${elemento.valor}`);
        } else if (elemento.tipo) {
            const tipo = elemento.tipo.toUpperCase();

            switch (tipo) {
                case 'R': // Resistencia
                    if (elemento.valor <= 0) {
                        errores.push(`El resistor "${elemento.nombre}" tiene valor ${elemento.valor}Ω. Las resistencias deben ser mayores a 0Ω.`);
                    }
                    break;

                case 'V': // Fuente de voltaje
                    // Puede ser cualquier número (positivo, negativo o cero)
                    // No hay restricciones adicionales
                    break;

                case 'I': // Fuente de corriente
                    // Puede ser cualquier número (positivo, negativo o cero)
                    // No hay restricciones adicionales
                    break;

                case 'C': // Capacitor
                    if (elemento.valor <= 0) {
                        errores.push(`El capacitor "${elemento.nombre}" tiene valor ${elemento.valor}F. Las capacitancias deben ser mayores a 0F.`);
                    }
                    break;

                case 'L': // Inductor
                    if (elemento.valor <= 0) {
                        errores.push(`El inductor "${elemento.nombre}" tiene valor ${elemento.valor}H. Las inductancias deben ser mayores a 0H.`);
                    }
                    break;
            }
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    },


    // ============================================
    // MÉTODO 3: VALIDAR CONECTIVIDAD
    // ============================================

    /**
     * Verifica que todos los nodos estén conectados correctamente
     * @param {Array} elementos - Array de elementos del circuito
     * @param {number} numNodes - Número total de nodos
     * @param {number} groundNode - Nodo de referencia
     * @returns {Object} {valido: boolean, errores: string[], nodosHuerfanos: number[]}
     */
    validarConectividad(elementos, numNodes, groundNode) {
        const errores = [];
        const nodosHuerfanos = [];

        // Verificar que elementos es un array válido
        if (!Array.isArray(elementos)) {
            errores.push('Los elementos deben ser un array.');
            return { valido: false, errores: errores, nodosHuerfanos: [] };
        }

        if (elementos.length === 0) {
            errores.push('No hay elementos en el circuito.');
            return { valido: false, errores: errores, nodosHuerfanos: [] };
        }

        // Crear un conjunto de nodos conectados
        const nodosConectados = new Set();

        // Agregar todos los nodos que aparecen en los elementos
        elementos.forEach(elemento => {
            if (elemento && typeof elemento === 'object') {
                if (Number.isInteger(elemento.nodoPositivo) && elemento.nodoPositivo >= 0) {
                    nodosConectados.add(elemento.nodoPositivo);
                }
                if (Number.isInteger(elemento.nodoNegativo) && elemento.nodoNegativo >= 0) {
                    nodosConectados.add(elemento.nodoNegativo);
                }
            }
        });

        // Verificar que todos los nodos (excepto posiblemente algunos) están conectados
        // Revisar cada nodo del circuito
        for (let nodo = 0; nodo < numNodes; nodo++) {
            if (!nodosConectados.has(nodo)) {
                nodosHuerfanos.push(nodo);
            }
        }

        // Reportar nodos huérfanos
        if (nodosHuerfanos.length > 0) {
            const listaNodos = nodosHuerfanos.join(', ');
            if (nodosHuerfanos.length === 1) {
                errores.push(`El nodo ${listaNodos} no tiene ningún elemento conectado. Todos los nodos deben tener al menos una conexión.`);
            } else {
                errores.push(`Los nodos ${listaNodos} no tienen elementos conectados. Todos los nodos deben tener al menos una conexión.`);
            }
        }

        // Verificar que el nodo de tierra está conectado
        if (Number.isInteger(groundNode) && groundNode >= 0) {
            if (!nodosConectados.has(groundNode)) {
                errores.push(`El nodo de tierra (nodo ${groundNode}) no está conectado a ningún elemento. Debe haber al menos un elemento conectado a tierra.`);
            }
        }

        // Contar conexiones por nodo para advertir sobre nodos con pocas conexiones
        const conteoConexiones = new Array(numNodes).fill(0);
        elementos.forEach(elemento => {
            if (elemento && typeof elemento === 'object') {
                if (Number.isInteger(elemento.nodoPositivo) && elemento.nodoPositivo >= 0 && elemento.nodoPositivo < numNodes) {
                    conteoConexiones[elemento.nodoPositivo]++;
                }
                if (Number.isInteger(elemento.nodoNegativo) && elemento.nodoNegativo >= 0 && elemento.nodoNegativo < numNodes) {
                    conteoConexiones[elemento.nodoNegativo]++;
                }
            }
        });

        return {
            valido: errores.length === 0,
            errores: errores,
            nodosHuerfanos: nodosHuerfanos
        };
    },


    // ============================================
    // MÉTODO 4: VALIDAR CIRCUITO COMPLETO
    // ============================================

    /**
     * Valida la topología completa del circuito
     * @param {Array} elementos - Array de elementos
     * @param {number} numNodes - Número de nodos
     * @param {number} groundNode - Nodo de tierra
     * @param {number} frequency - Frecuencia de análisis
     * @returns {Object} {valido: boolean, errores: string[], advertencias: string[]}
     */
    validarCircuitoCompleto(elementos, numNodes, groundNode, frequency) {
        const errores = [];
        const advertencias = [];

        // Verificar que elementos es un array válido
        if (!Array.isArray(elementos)) {
            errores.push('Los elementos deben ser un array.');
            return { valido: false, errores: errores, advertencias: [] };
        }

        if (elementos.length === 0) {
            errores.push('El circuito debe tener al menos un elemento.');
            return { valido: false, errores: errores, advertencias: [] };
        }

        // 1. Verificar que existe al menos una fuente
        const tieneFuente = elementos.some(elem => {
            if (!elem || !elem.tipo) return false;
            const tipo = elem.tipo.toUpperCase();
            return this.TIPOS_FUENTES.includes(tipo);
        });

        if (!tieneFuente) {
            errores.push('El circuito debe tener al menos una fuente de voltaje (V) o corriente (I) para poder realizar el análisis.');
        }

        // 2. Detectar fuentes de voltaje en paralelo directo (mismo par de nodos)
        const fuentesVoltaje = elementos.filter(elem => {
            if (!elem || !elem.tipo) return false;
            return elem.tipo.toUpperCase() === 'V';
        });

        // Crear mapa de conexiones de fuentes de voltaje
        // La clave es una representación del par de nodos (ordenado para detectar paralelos)
        const mapaFuentesV = new Map();

        fuentesVoltaje.forEach(fuente => {
            if (!fuente || typeof fuente !== 'object') return;
            if (!Number.isInteger(fuente.nodoPositivo) || !Number.isInteger(fuente.nodoNegativo)) return;

            // Crear clave ordenada para detectar mismo par de nodos en cualquier orden
            const nodos = [fuente.nodoPositivo, fuente.nodoNegativo].sort((a, b) => a - b);
            const clave = `${nodos[0]}-${nodos[1]}`;

            if (!mapaFuentesV.has(clave)) {
                mapaFuentesV.set(clave, []);
            }
            mapaFuentesV.get(clave).push(fuente.nombre || 'Sin nombre');
        });

        // Verificar si hay múltiples fuentes en el mismo par de nodos
        mapaFuentesV.forEach((fuentes, clave) => {
            if (fuentes.length > 1) {
                const nodos = clave.split('-');
                errores.push(`Se detectaron ${fuentes.length} fuentes de voltaje en paralelo directo entre los nodos ${nodos[0]} y ${nodos[1]} (${fuentes.join(', ')}). Esto causa un conflicto de voltajes. Las fuentes de voltaje no pueden estar en paralelo directo.`);
            }
        });

        // 3. Detectar posibles cortos circuitos
        // Un corto circuito ocurre cuando hay solo fuentes de voltaje entre dos nodos sin resistencia
        const elementosPorParNodos = new Map();

        elementos.forEach(elem => {
            if (!elem || typeof elem !== 'object') return;
            if (!Number.isInteger(elem.nodoPositivo) || !Number.isInteger(elem.nodoNegativo)) return;

            const nodos = [elem.nodoPositivo, elem.nodoNegativo].sort((a, b) => a - b);
            const clave = `${nodos[0]}-${nodos[1]}`;

            if (!elementosPorParNodos.has(clave)) {
                elementosPorParNodos.set(clave, []);
            }
            elementosPorParNodos.get(clave).push(elem);
        });

        elementosPorParNodos.forEach((elems, clave) => {
            // Verificar si solo hay fuentes de voltaje
            const soloFuentesV = elems.every(elem => {
                if (!elem.tipo) return false;
                return elem.tipo.toUpperCase() === 'V';
            });

            if (soloFuentesV && elems.length === 1) {
                // Una sola fuente de voltaje sin resistencia puede causar problemas
                // Esto es solo una advertencia, no necesariamente un error
                const nodos = clave.split('-');
                advertencias.push(`La fuente de voltaje "${elems[0].nombre}" está conectada directamente entre los nodos ${nodos[0]} y ${nodos[1]} sin ninguna resistencia. Esto puede causar corrientes muy altas. Considere agregar una resistencia en serie.`);
            }
        });

        // 4. Validaciones específicas para frecuencia = 0 (DC)
        if (frequency === 0) {
            // Advertir sobre capacitores en DC
            const capacitores = elementos.filter(elem => {
                if (!elem || !elem.tipo) return false;
                return elem.tipo.toUpperCase() === 'C';
            });

            if (capacitores.length > 0) {
                const nombres = capacitores.map(c => c.nombre).join(', ');
                if (capacitores.length === 1) {
                    advertencias.push(`Análisis DC detectado (frecuencia = 0 Hz): El capacitor ${nombres} actuará como circuito abierto (impedancia infinita).`);
                } else {
                    advertencias.push(`Análisis DC detectado (frecuencia = 0 Hz): Los capacitores ${nombres} actuarán como circuito abierto (impedancia infinita).`);
                }
            }

            // Advertir sobre inductores en DC
            const inductores = elementos.filter(elem => {
                if (!elem || !elem.tipo) return false;
                return elem.tipo.toUpperCase() === 'L';
            });

            if (inductores.length > 0) {
                const nombres = inductores.map(l => l.nombre).join(', ');
                if (inductores.length === 1) {
                    advertencias.push(`Análisis DC detectado (frecuencia = 0 Hz): El inductor ${nombres} actuará como cortocircuito (impedancia cero).`);
                } else {
                    advertencias.push(`Análisis DC detectado (frecuencia = 0 Hz): Los inductores ${nombres} actuarán como cortocircuito (impedancia cero).`);
                }
            }
        }

        // 5. Advertir si hay solo fuentes de corriente y no hay camino a tierra
        const soloFuentesI = elementos.every(elem => {
            if (!elem || !elem.tipo) return false;
            const tipo = elem.tipo.toUpperCase();
            return tipo === 'I';
        });

        if (soloFuentesI && elementos.length > 0) {
            advertencias.push('El circuito solo contiene fuentes de corriente sin resistencias. Esto puede causar que el sistema no tenga solución única. Considere agregar al menos una resistencia a tierra.');
        }

        return {
            valido: errores.length === 0,
            errores: errores,
            advertencias: advertencias
        };
    },


    // ============================================
    // MÉTODO 5: VALIDAR NOMBRES ÚNICOS
    // ============================================

    /**
     * Verifica que no hay nombres duplicados en los elementos
     * @param {Array} elementos - Array de elementos
     * @returns {Object} {valido: boolean, errores: string[]}
     */
    validarNombresUnicos(elementos) {
        const errores = [];
        if (!Array.isArray(elementos)) {
            errores.push('Los elementos deben ser un array.');
            return { valido: false, errores: errores };
        }
        const nombresVistos = new Set();

        for (const elem of elementos) {
            if (!elem || typeof elem.nombre !== 'string' || elem.nombre.trim() === '') {
                // Este error ya se reporta en validarElemento, pero lo chequeamos por si acaso.
                continue;
            }
            const nombreNormalizado = elem.nombre.trim().toUpperCase();

            if (nombresVistos.has(nombreNormalizado)) {
                errores.push(`El nombre "${elem.nombre}" está duplicado. Todos los nombres de elementos deben ser únicos.`);
            } else {
                nombresVistos.add(nombreNormalizado);
            }
        }
        return {
            valido: errores.length === 0,
            errores: errores
        };
    },


    // ============================================
    // MÉTODO 6: VALIDAR ENTRADA NUMÉRICA
    // ============================================

    /**
     * Valida que un valor numérico esté en el rango especificado
     * @param {any} valor - Valor a validar
     * @param {number} min - Valor mínimo permitido (inclusive)
     * @param {number} max - Valor máximo permitido (inclusive)
     * @param {string} nombreCampo - Nombre del campo para el mensaje de error
     * @returns {Object} {valido: boolean, error: string}
     */
    validarEntradaNumerica(valor, min, max, nombreCampo) {
        // Verificar que el valor es un número
        if (typeof valor !== 'number') {
            return {
                valido: false,
                error: `${nombreCampo} debe ser un número. Valor recibido: ${valor}`
            };
        }

        // Verificar que no es NaN
        if (isNaN(valor)) {
            return {
                valido: false,
                error: `${nombreCampo} no es un número válido (NaN).`
            };
        }

        // Verificar que es finito
        if (!isFinite(valor)) {
            return {
                valido: false,
                error: `${nombreCampo} debe ser un valor finito. Valor recibido: ${valor}`
            };
        }

        // Verificar rango mínimo
        if (min !== null && min !== undefined && valor < min) {
            return {
                valido: false,
                error: `${nombreCampo} debe ser mayor o igual a ${min}. Valor recibido: ${valor}`
            };
        }

        // Verificar rango máximo
        if (max !== null && max !== undefined && valor > max) {
            return {
                valido: false,
                error: `${nombreCampo} debe ser menor o igual a ${max}. Valor recibido: ${valor}`
            };
        }

        return {
            valido: true,
            error: ''
        };
    },


    // ============================================
    // MÉTODO 7: SANITIZAR ENTRADA
    // ============================================

    /**
     * Limpia y sanitiza entradas de texto para prevenir inyección
     * @param {string} texto - Texto a sanitizar
     * @returns {string} Texto limpio y seguro
     */
    sanitizarEntrada(texto) {
        // Verificar que el texto es una cadena
        if (typeof texto !== 'string') {
            return '';
        }

        // Eliminar espacios al inicio y final
        let textoLimpio = texto.trim();

        // Eliminar espacios múltiples internos (convertir a uno solo)
        textoLimpio = textoLimpio.replace(/\s+/g, ' ');

        // Prevenir inyección de código: eliminar caracteres potencialmente peligrosos
        // Eliminar < > para prevenir HTML/XML injection
        textoLimpio = textoLimpio.replace(/[<>]/g, '');

        // Eliminar comillas dobles y simples para prevenir SQL injection y similares
        textoLimpio = textoLimpio.replace(/["'`]/g, '');

        // Eliminar backslash para prevenir escape sequences
        textoLimpio = textoLimpio.replace(/\\/g, '');

        // Eliminar punto y coma para prevenir command injection
        textoLimpio = textoLimpio.replace(/;/g, '');

        // Eliminar paréntesis y llaves para prevenir function calls
        textoLimpio = textoLimpio.replace(/[(){}[\]]/g, '');

        // Eliminar signos de dólar para prevenir template injection
        textoLimpio = textoLimpio.replace(/\$/g, '');

        // Eliminar ampersand para prevenir entity injection
        textoLimpio = textoLimpio.replace(/&/g, '');

        // Eliminar pipe y redireccionamiento
        textoLimpio = textoLimpio.replace(/[|]/g, '');

        // Eliminar caracteres de nueva línea y retorno de carro
        textoLimpio = textoLimpio.replace(/[\n\r]/g, '');

        return textoLimpio;
    },


    // ============================================
    // MÉTODOS AUXILIARES ADICIONALES
    // ============================================

    /**
     * Valida y sanitiza el tipo de elemento
     * @param {string} tipo - Tipo de elemento (R, V, I, C, L)
     * @returns {string} Tipo en mayúsculas o cadena vacía si es inválido
     */
    sanitizarTipo(tipo) {
        if (typeof tipo !== 'string') {
            return '';
        }

        const tipoLimpio = this.sanitizarEntrada(tipo).toUpperCase();

        if (this.TIPOS_VALIDOS.includes(tipoLimpio)) {
            return tipoLimpio;
        }

        return '';
    },

    /**
     * Convierte una cadena a número de forma segura
     * @param {any} valor - Valor a convertir
     * @returns {number|null} Número convertido o null si falla
     */
    convertirANumeroSeguro(valor) {
        // Si ya es un número, validar que sea válido
        if (typeof valor === 'number') {
            if (isNaN(valor) || !isFinite(valor)) {
                return null;
            }
            return valor;
        }

        // Si es cadena, intentar convertir
        if (typeof valor === 'string') {
            const textoLimpio = valor.trim();
            const numero = parseFloat(textoLimpio);

            if (isNaN(numero) || !isFinite(numero)) {
                return null;
            }

            return numero;
        }

        // Otros tipos no son válidos
        return null;
    },

    /**
     * Valida todos los aspectos del circuito en una sola llamada
     * Método conveniente que ejecuta todas las validaciones
     * @param {Object} configuracion - {numNodes, groundNode, frequency, elementos}
     * @returns {Object} {valido: boolean, errores: string[], advertencias: string[]}
     */
    validarTodo(configuracion) {
        const todosErrores = [];
        const todasAdvertencias = [];

        // Extraer configuración
        const { numNodes, groundNode, frequency, elementos } = configuracion;

        // 1. Validar configuración general
        const resConfig = this.validarConfiguracionCircuito(
            numNodes,
            groundNode,
            elementos ? elementos.length : 0,
            frequency
        );
        todosErrores.push(...resConfig.errores);

        // 2. Validar cada elemento
        if (Array.isArray(elementos)) {
            elementos.forEach((elem, index) => {
                const resElem = this.validarElemento(elem);
                if (!resElem.valido) {
                    resElem.errores.forEach(error => {
                        todosErrores.push(`Elemento ${index + 1}: ${error}`);
                    });
                }
            });

            // 3. Validar nombres únicos
            const resNombres = this.validarNombresUnicos(elementos);
            todosErrores.push(...resNombres.errores);

            // 4. Validar conectividad
            const resConectividad = this.validarConectividad(elementos, numNodes, groundNode);
            todosErrores.push(...resConectividad.errores);

            // 5. Validar circuito completo
            const resCircuito = this.validarCircuitoCompleto(elementos, numNodes, groundNode, frequency);
            todosErrores.push(...resCircuito.errores);
            todasAdvertencias.push(...resCircuito.advertencias);
        } else {
            todosErrores.push('Los elementos deben ser un array.');
        }

        return {
            valido: todosErrores.length === 0,
            errores: todosErrores,
            advertencias: todasAdvertencias
        };
    }
};

// Exportar el objeto Validator para uso en otros archivos
// Compatible con diferentes sistemas de módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
}
