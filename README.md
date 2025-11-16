# ⚡ CircuitLab MNA

> Simulador interactivo de circuitos eléctricos basado en el Método de Análisis Nodal Modificado (MNA)

[![License: CC BY-NC](https://img.shields.io/badge/License-CC%20BY--NC-blue.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![BUAP](https://img.shields.io/badge/Universidad-BUAP-green.svg)](https://www.buap.mx/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.ecma-international.org/ecma-262/)

## 📋 Descripción

CircuitLab MNA es un simulador de circuitos eléctricos desarrollado como proyecto final para la materia de **Circuitos Eléctricos (ICCS-007)** en la Benemérita Universidad Autónoma de Puebla (BUAP). Implementa el método de Análisis Nodal Modificado (Modified Nodal Analysis) para resolver circuitos lineales en DC y AC.

### ✨ Características Principales

- 🔢 **Análisis completo DC y AC** con soporte para elementos reactivos
- 📊 **Visualización de matrices** del sistema MNA con notación matemática profesional
- 🎨 **Interfaz responsiva** que funciona en desktop, tablet y móvil
- 🌙 **Modo oscuro** persistente para mejor experiencia de usuario
- 📝 **Validación en tiempo real** de entradas con retroalimentación visual
- 🧮 **Notación matemática profesional** con cursivas y subíndices
- 📤 **Exportación de resultados** en formato legible
- 🎓 **Contenido educativo** integrado sobre el método MNA

## 🚀 Demostración

Visita la aplicación en vivo: [CircuitLab MNA](https://mikebarranco.github.io/CircuitLab-MNA/)

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsivo con variables CSS
- **JavaScript (ES6+)** - Lógica de la aplicación
- **math.js** - Biblioteca para cálculos matriciales complejos

## 📦 Instalación

### Opción 1: Uso directo (recomendado)

Simplemente abre `index.html` en tu navegador favorito. No requiere instalación ni servidor.

### Opción 2: Servidor local

```bash
# Clonar el repositorio
git clone https://github.com/MikeBarranco/CircuitLab-MNA.git

# Entrar al directorio
cd CircuitLab-MNA

# Opción A: Usar Python 3
python -m http.server 8000

# Opción B: Usar Node.js
npx http-server -p 8000

# Abrir en el navegador
# http://localhost:8000
```

## 📚 Uso del Simulador

### 1. Configurar el Circuito

1. **Número de nodos**: Especifica cuántos nodos tiene tu circuito (2-10)
2. **Nodo de referencia**: Indica cuál nodo será tierra (usualmente 0)
3. **Número de elementos**: Cuántos componentes tiene el circuito (1-20)
4. **Frecuencia**: Para análisis AC, especifica la frecuencia en Hz (0 para DC)

### 2. Generar Formulario

Click en **"Generar Formulario de Elementos"** para crear los campos de entrada.

### 3. Ingresar Elementos

Para cada elemento, especifica:
- **Tipo**: Resistor (R), Capacitor (C), Inductor (L), Fuente de Voltaje (V), Fuente de Corriente (I)
- **Nombre**: Identificador único (ej: R1, V1, C2)
- **Nodos**: Conexiones positiva y negativa
- **Valor**: Magnitud con prefijo métrico (k, m, µ, n, etc.)

### 4. Analizar

Click en **"Analizar Circuito"** para obtener:
- ✅ Voltajes en todos los nodos
- ✅ Corrientes a través de fuentes de voltaje
- ✅ Matrices del sistema (A, x, z)

## 🧮 Fundamentos del MNA

El Análisis Nodal Modificado resuelve el sistema de ecuaciones:

**A × x = z**

Donde:
- **A**: Matriz de coeficientes (n+m × n+m)
- **x**: Vector de incógnitas (voltajes y corrientes)
- **z**: Vector de fuentes conocidas

### Composición de la Matriz A

```
     ┌         ┐
A = │  G   B  │
     │  C   D  │
     └         ┘
```

- **G** (n×n): Matriz de conductancias
- **B** (n×m): Matriz de incidencia de fuentes de voltaje
- **C** (m×n): Transpuesta de B
- **D** (m×m): Matriz de fuentes dependientes (ceros para circuitos simples)

## 📖 Ejemplos

### Ejemplo 1: Circuito Resistivo Simple

**Circuito**: Dos resistores en serie con una fuente de voltaje

```
Configuración:
- Nodos: 3
- Nodo GND: 0
- Elementos: 3
- Frecuencia: 0 Hz (DC)

Elementos:
1. V1: Fuente de voltaje, Nodo+ = 1, Nodo- = 0, Valor = 10 V
2. R1: Resistor, Nodo+ = 1, Nodo- = 2, Valor = 1 kΩ
3. R2: Resistor, Nodo+ = 2, Nodo- = 0, Valor = 1 kΩ

Resultados esperados:
- v₁ = 10 V
- v₂ = 5 V
- i_V1 = -5 mA
```

### Ejemplo 2: Circuito RC (AC)

**Circuito**: Resistor y capacitor en serie

```
Configuración:
- Nodos: 2
- Nodo GND: 0
- Elementos: 2
- Frecuencia: 60 Hz

Elementos:
1. V1: Fuente de voltaje, Valor = 120 V
2. R1: Resistor, Valor = 1 kΩ
3. C1: Capacitor, Valor = 10 µF

Resultados: Voltajes con magnitud y fase
```

## 🔧 Elementos Soportados

| Elemento | Símbolo | Unidad | Prefijos Soportados |
|----------|---------|--------|---------------------|
| Resistor | R | Ω (ohm) | G, M, k, m, µ, n, p |
| Capacitor | C | F (farad) | G, M, k, m, µ, n, p |
| Inductor | L | H (henry) | G, M, k, m, µ, n, p |
| Fuente de Voltaje | V | V (volt) | G, M, k, m, µ, n, p |
| Fuente de Corriente | I | A (ampere) | G, M, k, m, µ, n, p |

## 🌐 Estructura del Proyecto

```
CircuitLab-MNA/
├── index.html              # Página de inicio con información educativa
├── simulador.html          # Aplicación del simulador
├── nosotros.html          # Información del equipo
├── css/
│   ├── styles.css         # Estilos principales
│   ├── layout.css         # Layout y responsive
│   └── nav.css            # Navegación
├── js/
│   ├── main.js            # Orquestador principal
│   ├── mnaCore.js         # Algoritmo MNA
│   ├── matrixBuilder.js   # Construcción de matrices
│   ├── resultDisplay.js   # Visualización de resultados
│   ├── validator.js       # Validación de entradas
│   └── nav.js             # Funcionalidad de navegación
└── README.md              # Este archivo
```

## 👥 Equipo de Desarrollo

Proyecto desarrollado por estudiantes de Ingeniería en Ciencias de la Computación:

- **Barranco Ortega Miguel Angel**
- **Linares Cortes Alexis**
- **Matamoros Perez Demian**
- **Escamilla Blanca Wendy Alejandra**

**Institución**: Benemérita Universidad Autónoma de Puebla (BUAP)
**Materia**: Circuitos Eléctricos (ICCS-007)
**Año**: 2025

## 📄 Licencia

Este proyecto está bajo la licencia **Creative Commons Atribución-NoComercial (CC BY-NC)**.

Puedes:
- ✅ Compartir - copiar y redistribuir el material en cualquier medio
- ✅ Adaptar - remezclar, transformar y construir sobre el material

Bajo las siguientes condiciones:
- 📝 **Atribución** - Debes dar crédito apropiado
- 🚫 **No Comercial** - No puedes usar el material con fines comerciales

## 🤝 Contribuciones

Este es un proyecto educativo. Si encuentras errores o tienes sugerencias:

1. Abre un **Issue** describiendo el problema o mejora
2. Si deseas contribuir código, crea un **Pull Request**

## 📮 Contacto

Para preguntas o comentarios sobre el proyecto:

- **GitHub Issues**: [Crear issue](https://github.com/MikeBarranco/CircuitLab-MNA/issues)
- **Universidad**: Benemérita Universidad Autónoma de Puebla

## 🙏 Agradecimientos

- A la **BUAP** y la Facultad de Ciencias de la Computación
- A los profesores de la materia de Circuitos Eléctricos
- A la comunidad de **math.js** por su excelente biblioteca

## 📚 Referencias

- Hayt, W. H., & Kemmerly, J. E. (2012). *Análisis de Circuitos en Ingeniería*
- Ho, C. W., Ruehli, A. E., & Brennan, P. A. (1975). *The Modified Nodal Approach to Network Analysis*
- Alexander, C. K., & Sadiku, M. N. (2013). *Fundamentos de Circuitos Eléctricos*

---

<div align="center">

**Hecho con ❤️ por estudiantes de la BUAP**

⚡ CircuitLab MNA © 2025

</div>
