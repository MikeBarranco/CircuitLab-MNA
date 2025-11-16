# CircuitLab MNA

> Simulador interactivo de circuitos eléctricos basado en el Método de Análisis Nodal Modificado (MNA)

[![License: CC BY-NC](https://img.shields.io/badge/License-CC%20BY--NC-blue.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![BUAP](https://img.shields.io/badge/Universidad-BUAP-green.svg)](https://www.buap.mx/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![Deployment Ready](https://img.shields.io/badge/Deployment-Ready-brightgreen.svg)](https://github.com/MikeBarranco/CircuitLab-MNA)

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Demostración en Vivo](#demostración-en-vivo)
- [Instalación](#instalación)
- [Guía de Uso](#guía-de-uso)
- [Fundamentos del MNA](#fundamentos-del-mna)
- [Ejemplos](#ejemplos)
- [Tecnologías](#tecnologías)
- [Seguridad](#seguridad)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Equipo de Desarrollo](#equipo-de-desarrollo)
- [Licencia](#licencia)
- [Referencias](#referencias)

---

## Descripción

**CircuitLab MNA** es un simulador de circuitos eléctricos web desarrollado como proyecto final para la materia de **Circuitos Eléctricos (ICCS-007)** en la Benemérita Universidad Autónoma de Puebla (BUAP).

El simulador implementa el **Método de Análisis Nodal Modificado** (Modified Nodal Analysis - MNA) para resolver circuitos lineales en corriente directa (DC) y corriente alterna (AC), proporcionando una herramienta educativa completa para el estudio de circuitos eléctricos.

### Objetivo Educativo

Este proyecto tiene como objetivo facilitar el aprendizaje del análisis de circuitos mediante:
- Visualización clara de matrices del sistema MNA
- Explicaciones paso a paso del método
- Interfaz intuitiva para configurar circuitos
- Resultados con notación matemática profesional
- Ejemplos prácticos integrados

---

## Características

### Análisis de Circuitos
- **Análisis DC completo**: Circuitos resistivos con fuentes de voltaje y corriente
- **Análisis AC con fasores**: Soporte para elementos reactivos (capacitores e inductores)
- **Múltiples tipos de elementos**: Resistores, capacitores, inductores, fuentes de voltaje y corriente
- **Validación automática**: Verificación de valores y topología del circuito

### Visualización
- **Matrices del sistema MNA**: Visualización de matrices A, x, z con notación matemática
- **Resultados detallados**: Voltajes nodales y corrientes en fuentes
- **Notación profesional**: Uso de cursivas, subíndices y superíndices Unicode
- **Explicaciones educativas**: Descripción del significado de cada matriz

### Interfaz de Usuario
- **Diseño responsivo**: Funciona perfectamente en desktop, tablets y móviles
- **Modo oscuro persistente**: Cambia entre tema claro y oscuro según preferencia
- **Validación en tiempo real**: Retroalimentación visual inmediata
- **Exportación de resultados**: Guarda los resultados en formato de texto

### Usabilidad
- **Sin instalación**: Funciona directamente desde el navegador
- **Sin dependencias de servidor**: Aplicación 100% estática
- **Navegación hamburguesa**: Menú optimizado para dispositivos móviles
- **Prefijos métricos**: Soporte para k, M, G, m, µ, n, p

---

## Demostración en Vivo

**Prueba el simulador aquí**: [https://mikebarranco.github.io/CircuitLab-MNA/](https://mikebarranco.github.io/CircuitLab-MNA/)

---

## Instalación

### Opción 1: Uso Directo (Recomendado)

No requiere instalación. Simplemente:

1. Descarga o clona el repositorio
2. Abre el archivo `index.html` en tu navegador
3. Comienza a usar el simulador

### Opción 2: Servidor Local

Para desarrollo o deployment local:

```bash
# Clonar el repositorio
git clone https://github.com/MikeBarranco/CircuitLab-MNA.git
cd CircuitLab-MNA

# Opción A: Python 3
python -m http.server 8000

# Opción B: Node.js
npx http-server -p 8000

# Opción C: PHP
php -S localhost:8000

# Abrir en navegador: http://localhost:8000
```

### Opción 3: Deployment en Plataformas

Compatible con:
- **GitHub Pages**: Push a rama `gh-pages`
- **Netlify**: Drag & drop la carpeta
- **Vercel**: Importar repositorio de GitHub
- **Surge**: `surge ./` desde la carpeta del proyecto

---

## Guía de Uso

### 1. Configurar el Circuito

Ingresa los parámetros básicos:

| Parámetro | Descripción | Rango | Ejemplo |
|-----------|-------------|-------|---------|
| **Número de nodos** | Total de nodos en el circuito | 2 - 10 | 3 |
| **Nodo de referencia** | Nodo que será tierra (0V) | 0 - 9 | 0 |
| **Número de elementos** | Total de componentes | 1 - 20 | 5 |
| **Frecuencia** | Hz para AC, 0 para DC | 0 - 10000 | 0 (DC) |

### 2. Generar Formulario

Haz clic en **"Generar Formulario de Elementos"** para crear los campos de entrada dinámicos.

### 3. Ingresar Elementos

Para cada componente especifica:

- **Tipo**: R (Resistor), C (Capacitor), L (Inductor), V (Fuente V), I (Fuente I)
- **Nombre**: Identificador único (ej: R1, V1, C2)
- **Nodo positivo (+)**: Número de nodo
- **Nodo negativo (-)**: Número de nodo
- **Valor**: Magnitud con prefijo métrico

**Ejemplos de valores válidos**:
- `1k` = 1000 (1 kiloohm)
- `10u` o `10µ` = 0.00001 (10 microfarads)
- `2.5m` = 0.0025 (2.5 miliamperios)

### 4. Analizar Circuito

Haz clic en **"Analizar Circuito"** para obtener:

- Voltajes en todos los nodos (respecto a tierra)
- Corrientes a través de fuentes de voltaje
- Matrices del sistema (A, x, z)
- Explicaciones educativas de cada componente

### 5. Exportar Resultados (Opcional)

Guarda los resultados en un archivo `.txt` para referencia futura.

---

## Fundamentos del MNA

### Ecuación del Sistema

El Análisis Nodal Modificado resuelve el sistema lineal:

**A × x = z**

Donde:
- **A**: Matriz de coeficientes del sistema (dimensión n+m × n+m)
- **x**: Vector de incógnitas (voltajes nodales + corrientes en fuentes V)
- **z**: Vector de fuentes conocidas (corrientes inyectadas + voltajes de fuentes)

### Composición de la Matriz A

```
         ┌           ┐
    A =  │  G    B   │
         │  C    D   │
         └           ┘
```

Donde:
- **G** (n×n): Matriz de conductancias de elementos pasivos
- **B** (n×m): Matriz de incidencia de fuentes de voltaje
- **C** (m×n): Transpuesta de B (contribución de fuentes V a ecuaciones de nodos)
- **D** (m×m): Matriz de fuentes dependientes (ceros para circuitos simples)

### Vectores del Sistema

**Vector x (incógnitas)**:
```
    ┌      ┐
x = │  v   │  ← voltajes nodales (n valores)
    │  j   │  ← corrientes en fuentes V (m valores)
    └      ┘
```

**Vector z (fuentes conocidas)**:
```
    ┌      ┐
z = │  i   │  ← corrientes inyectadas por fuentes I (n valores)
    │  e   │  ← voltajes de fuentes V (m valores)
    └      ┘
```

### Proceso de Solución

1. **Ensamblar matriz A** a partir de elementos del circuito
2. **Construir vector z** con valores de fuentes
3. **Resolver sistema lineal**: x = A⁻¹ × z
4. **Extraer resultados**: voltajes nodales y corrientes en fuentes

---

## Ejemplos

### Ejemplo 1: Divisor de Voltaje (DC)

**Descripción**: Circuito clásico con dos resistores en serie

```
Configuración:
- Nodos: 3 (nodo 0, 1, 2)
- Nodo GND: 0
- Elementos: 3
- Frecuencia: 0 Hz (DC)

Elementos:
1. V1: Fuente de voltaje
   - Tipo: V
   - Nodo+: 1, Nodo-: 0
   - Valor: 10V

2. R1: Resistor
   - Tipo: R
   - Nodo+: 1, Nodo-: 2
   - Valor: 2k (2000 Ω)

3. R2: Resistor
   - Tipo: R
   - Nodo+: 2, Nodo-: 0
   - Valor: 3k (3000 Ω)

Resultados esperados:
- v₁ = 10 V (aplicado por la fuente)
- v₂ = 6 V (divisor: 10 × 3k/(2k+3k))
- i_V1 = -2 mA (corriente entregada por la fuente)
```

### Ejemplo 2: Circuito RC en AC

**Descripción**: Filtro pasa-bajos simple

```
Configuración:
- Nodos: 2 (nodo 0, 1)
- Nodo GND: 0
- Elementos: 3
- Frecuencia: 60 Hz

Elementos:
1. V1: Fuente AC
   - Tipo: V
   - Nodo+: 1, Nodo-: 0
   - Valor: 120V

2. R1: Resistor
   - Tipo: R
   - Nodo+: 1, Nodo-: 0
   - Valor: 1k

3. C1: Capacitor (en paralelo)
   - Tipo: C
   - Nodo+: 1, Nodo-: 0
   - Valor: 10u (10 µF)

Resultados:
- Voltajes mostrados con magnitud y fase
- Corriente con componentes real e imaginaria
```

### Ejemplo 3: Puente de Resistencias

**Descripción**: Circuito con múltiples nodos

```
Configuración:
- Nodos: 4
- Nodo GND: 0
- Elementos: 5 resistores + 1 fuente
- Frecuencia: 0 Hz (DC)

(Ver página de inicio del simulador para ejemplo completo paso a paso)
```

---

## Tecnologías

### Frontend
- **HTML5**: Estructura semántica con elementos accesibles
- **CSS3**: Diseño responsivo con variables CSS y Grid/Flexbox
- **JavaScript ES6+**: Módulos, arrow functions, destructuring

### Bibliotecas
- **[math.js](https://mathjs.org/)** v11.11.0: Álgebra lineal y números complejos
  - Operaciones matriciales (inversión, multiplicación)
  - Manejo de números complejos para análisis AC
  - Cargado desde CDN (jsDelivr)

### Herramientas de Desarrollo
- **Git**: Control de versiones
- **GitHub Pages**: Hosting estático
- **VSCode**: Editor de código recomendado

### Compatibilidad de Navegadores
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+
- Navegadores móviles modernos

---

## Seguridad

### Estado: SEGURO PARA DEPLOYMENT

Este proyecto es **completamente seguro** para uso en producción. Análisis:

#### Arquitectura Segura
- **100% Cliente**: No hay backend, base de datos ni servidor
- **Sin datos sensibles**: No se recopila información personal
- **Sin autenticación**: No hay usuarios ni contraseñas
- **Solo localStorage**: Usado únicamente para preferencias (modo oscuro)

#### Protecciones Implementadas

**1. Validación de Entradas**
```javascript
// Validación numérica estricta (validator.js)
validarNumero(valor, min, max)
validarNodo(nodo, totalNodos)
validarNombreElemento(nombre)
```

**2. Sanitización de Datos**
```javascript
// Protección XSS (validator.js:76-95)
sanitizarEntrada(cadena) {
    return cadena
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        // ... más sanitización
}
```

**3. Sin Ejecución Dinámica**
- No hay `eval()`
- No hay `Function()` constructor
- No hay `setTimeout()`/`setInterval()` con strings
- innerHTML usado solo con datos sanitizados

#### Vectores de Ataque - TODOS MITIGADOS

| Amenaza | Estado | Mitigación |
|---------|--------|------------|
| XSS (Cross-Site Scripting) | BLOQUEADO | Sanitización de entradas |
| SQL Injection | N/A | No hay base de datos |
| CSRF | N/A | No hay sesiones ni backend |
| Code Injection | BLOQUEADO | No hay eval() ni ejecución dinámica |
| Man-in-the-Middle | MITIGADO | Usar HTTPS en producción |
| DoS | MITIGADO | Límites en número de elementos |

#### Recomendaciones de Deployment

1. **Usar HTTPS**: GitHub Pages, Netlify y Vercel lo incluyen automáticamente
2. **Content Security Policy**: Opcional, configurar headers CSP
3. **Subresource Integrity**: math.js cargado con hash SRI (ya implementado)

**CONCLUSIÓN**: El simulador es tan seguro como cualquier sitio estático educativo. No hay vulnerabilidades conocidas.

---

## Estructura del Proyecto

```
CircuitLab-MNA/
│
├── index.html                  # Página de inicio (contenido educativo)
├── simulador.html              # Aplicación del simulador
├── nosotros.html              # Información del equipo
│
├── css/
│   ├── styles.css             # Estilos principales del simulador
│   ├── layout.css             # Layout global y responsividad
│   ├── nav.css                # Navegación y menú hamburguesa
│   ├── inicio.css             # Estilos específicos de inicio
│   ├── nosotros.css           # Estilos de página de equipo
│   └── index.css              # Estilos legacy (deprecado)
│
├── js/
│   ├── main.js                # Orquestador principal de la aplicación
│   ├── mnaCore.js             # Algoritmo MNA (núcleo matemático)
│   ├── matrixBuilder.js       # Construcción de matrices G, B, C, D
│   ├── resultDisplay.js       # Visualización y formateo de resultados
│   ├── validator.js           # Validación y sanitización de entradas
│   ├── darkMode.js            # Gestión del modo oscuro persistente
│   └── nav.js                 # Funcionalidad de navegación responsiva
│
├── images/
│   └── team/                  # Fotos del equipo (placeholders)
│
├── README.md                  # Este archivo
├── REVISION_COMPLETA.md       # Reporte de auditoría de código
└── LICENSE                    # Licencia CC BY-NC
```

### Descripción de Módulos JavaScript

| Módulo | Responsabilidad | Líneas | Complejidad |
|--------|----------------|--------|-------------|
| `main.js` | Gestión de eventos UI, coordinación | ~500 | Media |
| `mnaCore.js` | Algoritmo MNA, resolución sistema | ~400 | Alta |
| `matrixBuilder.js` | Ensamblaje de matrices A, z | ~350 | Alta |
| `resultDisplay.js` | Renderizado de resultados | ~830 | Media |
| `validator.js` | Validación de datos | ~250 | Baja |
| `darkMode.js` | Persistencia tema oscuro | ~120 | Baja |
| `nav.js` | Menú hamburguesa | ~25 | Baja |

---

## Equipo de Desarrollo

**Proyecto desarrollado por estudiantes de Ingeniería en Ciencias de la Computación**

### Integrantes

- **Barranco Ortega Miguel Angel** - Matrícula: 202130176
- **Linares Cortes Alexis** - Matrícula: 202130124
- **Matamoros Perez Demian** - Matrícula: 202130123
- **Escamilla Blanca Wendy Alejandra** - Matrícula: 202130212

### Institución

**Benemérita Universidad Autónoma de Puebla (BUAP)**
Facultad de Ciencias de la Computación
Licenciatura en Ingeniería en Ciencias de la Computación

**Materia**: Circuitos Eléctricos (ICCS-007)
**Año Académico**: 2025
**Semestre**: Primavera 2025

---

## Licencia

Este proyecto está licenciado bajo **Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0)**.

### Permisos

- **Compartir**: Copiar y redistribuir el material en cualquier medio o formato
- **Adaptar**: Remezclar, transformar y construir sobre el material

### Condiciones

- **Atribución**: Debes dar crédito apropiado, proporcionar un enlace a la licencia e indicar si se realizaron cambios
- **No Comercial**: No puedes usar el material con fines comerciales

### Atribución Sugerida

```
CircuitLab MNA por Barranco, Linares, Matamoros, Escamilla (BUAP)
Disponible en: https://github.com/MikeBarranco/CircuitLab-MNA
Licencia: CC BY-NC 4.0
```

Más información: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

## Contribuciones

Este es un proyecto educativo abierto a mejoras. Si deseas contribuir:

### Reportar Bugs

1. Verifica que el bug no esté reportado en [Issues](https://github.com/MikeBarranco/CircuitLab-MNA/issues)
2. Abre un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Capturas de pantalla (si aplica)
   - Navegador y versión

### Proponer Mejoras

1. Abre un issue con etiqueta `enhancement`
2. Describe la funcionalidad propuesta
3. Explica el caso de uso y beneficios

### Enviar Pull Requests

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: descripción del cambio'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de Estilo

- JavaScript: ES6+, camelCase, comentarios en español
- CSS: BEM naming, variables CSS, mobile-first
- HTML: Semántico, accesible, sin emojis en producción
- Commits: Conventional Commits en español

---

## Contacto

### Preguntas sobre el Proyecto

- **Issues en GitHub**: [github.com/MikeBarranco/CircuitLab-MNA/issues](https://github.com/MikeBarranco/CircuitLab-MNA/issues)
- **Discusiones**: [github.com/MikeBarranco/CircuitLab-MNA/discussions](https://github.com/MikeBarranco/CircuitLab-MNA/discussions)

### Universidad

**Benemérita Universidad Autónoma de Puebla**
Facultad de Ciencias de la Computación
4 Sur 104, Centro Histórico, Puebla, México
Website: [www.cs.buap.mx](https://www.cs.buap.mx)

---

## Agradecimientos

- **BUAP**: Por la formación académica y recursos educativos
- **Facultad de Ciencias de la Computación**: Por el apoyo en el desarrollo
- **Profesores de Circuitos Eléctricos**: Por la guía en el método MNA
- **Comunidad math.js**: Por la excelente biblioteca de álgebra lineal
- **GitHub Pages**: Por el hosting gratuito
- **MDN Web Docs**: Por la documentación de web APIs

---

## Referencias

### Libros de Texto

1. **Hayt, W. H., & Kemmerly, J. E.** (2012). *Análisis de Circuitos en Ingeniería*. 8ª Edición. McGraw-Hill.

2. **Alexander, C. K., & Sadiku, M. N.** (2013). *Fundamentos de Circuitos Eléctricos*. 5ª Edición. McGraw-Hill.

3. **Nilsson, J. W., & Riedel, S. A.** (2015). *Circuitos Eléctricos*. 10ª Edición. Pearson.

### Artículos Académicos

4. **Ho, C. W., Ruehli, A. E., & Brennan, P. A.** (1975). *The Modified Nodal Approach to Network Analysis*. IEEE Transactions on Circuits and Systems, 22(6), 504-509.

5. **Chua, L. O., & Lin, P. M.** (1975). *Computer-Aided Analysis of Electronic Circuits: Algorithms and Computational Techniques*. Prentice-Hall.

### Recursos en Línea

6. **math.js Documentation**: [https://mathjs.org/docs/](https://mathjs.org/docs/)
7. **MDN Web Docs - JavaScript**: [https://developer.mozilla.org/](https://developer.mozilla.org/)
8. **All About Circuits**: [https://www.allaboutcircuits.com/](https://www.allaboutcircuits.com/)

---

## Changelog

### v1.0.0 - 2025-01-16
- Release inicial del simulador
- Implementación completa del método MNA
- Soporte para análisis DC y AC
- Interfaz responsiva con modo oscuro
- Validación y sanitización de entradas
- Exportación de resultados
- Documentación completa

---

<div align="center">

### Hecho por estudiantes de la BUAP

**CircuitLab MNA** - Simulador de Circuitos Eléctricos

[Inicio](https://mikebarranco.github.io/CircuitLab-MNA/) • [Simulador](https://mikebarranco.github.io/CircuitLab-MNA/simulador.html) • [Documentación](#tabla-de-contenidos) • [Licencia](#licencia)

© 2025 - Proyecto Educativo BUAP

</div>
