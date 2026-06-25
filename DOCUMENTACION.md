# 🥛 Rescate Lácteo - Documentación Técnica

## Problema Real Identificado
Los **productores de leche en zonas rurales de Tilarán, Costa Rica** enfrentan:
- ❌ Dificultad para encontrar compradores
- ❌ Falta de logística para distribuir productos
- ❌ Aislamiento de centros comerciales principales
- ❌ Problemas para vender en volúmenes suficientes

## Solución Propuesta
**Rescate Lácteo** es una plataforma web que conecta productores de leche con compradores, permitiendo:
1. **Consultar productores activos** con búsqueda y filtros
2. **Registrar nuevos productores** con validación completa
3. **Guardar favoritos** en localStorage
4. **Acceder a información completa** sin salir del sitio

---

## Estructura del Proyecto

### 📄 **Páginas (3 páginas obligatorias)**

#### 1️⃣ **index.html** - Página de Inicio
- **Propósito**: Presentar la plataforma y explicar el problema
- **Contenido**:
  - Hero banner con call-to-action
  - Sección: ¿Cuál es el problema?
  - Sección: ¿Cómo funciona?
  - Vista previa de 3 productores cargados desde JSON
  - Estadísticas calculadas dinámicamente
  - Botón interactivo que muestra/oculta información adicional
- **Funcionalidad JavaScript**: Carga JSON, renderiza estadísticas, evento interactivo

#### 2️⃣ **solucion.html** - Página de Productores (Solución Interactiva Principal)
- **Propósito**: Buscar, filtrar y guardar productores
- **Contenido**:
  - Campo de búsqueda por nombre o comunidad (búsqueda instantánea)
  - Filtro por comunidad (dinámico, cargado desde datos)
  - Filtro por estado (activo, en dificultad, inactivo)
  - Grid de tarjetas con información de productores
  - Botones para guardar productores
  - Modal que muestra detalles completos
  - Sección "Mis Productores Guardados" (con localStorage)
  - Contador de resultados
  - Mensaje cuando no hay resultados
- **Funcionalidad JavaScript**: 
  - Carga datos desde JSON
  - Búsqueda en tiempo real sin recargar
  - Filtros combinados
  - localStorage para guardar favoritos
  - Modal interactivo

#### 3️⃣ **registro.html** - Página de Registro/Gestión
- **Propósito**: Permitir registrar nuevos productores
- **Contenido**:
  - Formulario con campos: nombre, comunidad, producción, producto, teléfono, estado
  - Validación en tiempo real (color rojo si falla, verde si es válido)
  - Mensajes de error específicos
  - Autoformato automático de teléfono (XXXX-XXXX)
  - Lista de registros guardados al lado
  - Botones para editar y eliminar registros
  - Confirmación antes de eliminar
  - Mensajes de éxito/error/advertencia
- **Funcionalidad JavaScript**:
  - Validación de cada campo
  - Guardado en localStorage
  - Recuperación automática al recargar
  - Modo edición (rellena formulario con datos previos)
  - Eliminación de registros

---

## Tecnologías Utilizadas

### 🔹 **HTML5 Semántico**
```html
- <header>: Encabezado con logo y navegación
- <nav>: Navegación principal
- <main>: Contenido principal
- <section>: Secciones lógicas
- <footer>: Pie de página
- <h1>, <h2>, <h3>: Títulos jerárquicos
- <label>: Etiquetas de formulario
- <form>: Formulario con validación
```

### 🔹 **CSS3**
- **Flexbox**: Para alinear header, botones, secciones
- **CSS Grid**: Para grillas de productos y estadísticas
- **Variables CSS**: `--color-verde-principal`, etc.
- **Media queries**: Adaptación responsiva en 768px y 480px
- **Transiciones**: Efectos suaves en botones y tarjetas
- **Box-shadow y gradientes**: Efectos visuales

### 🔹 **JavaScript Vanilla** (Sin frameworks)
- **fetch()**: Carga datos desde JSON
- **DOM manipulation**: Crea/modifica/elimina elementos
- **Event listeners**: click, input, change, submit
- **Array methods**: filter(), map(), find(), some(), reduce()
- **localStorage API**: Persiste datos del usuario
- **JSON.parse() y JSON.stringify()**: Serialización

### 📋 **JSON** (`data/productores.json`)
- 12 registros de productores
- 8 propiedades por registro:
  - `id`: Identificador único
  - `nombre`: Nombre del productor
  - `comunidad`: Comunidad donde produce (categoría para filtrar)
  - `produccionDiariaLitros`: Volumen de producción
  - `productosPrincipales`: Array de productos
  - `estado`: activo, en dificultad, inactivo (estado para tomar decisiones)
  - `descripcion`: Información descriptiva
  - `contacto`: Teléfono de contacto

---

## Funcionalidades Clave Implementadas

### ✅ 1. **Carga de Datos desde JSON**
```javascript
fetch('./data/productores.json')
  .then(res => res.json())
  .then(data => { ... })
```

### ✅ 2. **Renderizado Dinámico**
Los elementos NO están escritos en HTML. Se generan con JavaScript:
```javascript
// Crear tarjeta
var card = document.createElement('div');
card.className = 'tarjeta';
card.innerHTML = '<h3>' + p.nombre + '</h3>' + ...;
contenedor.appendChild(card);
```

### ✅ 3. **Búsqueda Instantánea**
Se ejecuta mientras el usuario escribe (sin presionar botón):
```javascript
buscador.addEventListener('input', filtrarYBuscar);
```

### ✅ 4. **Filtros Combinados**
La búsqueda y filtros trabajan juntos:
```javascript
var cumpleTexto = p.nombre.toLowerCase().includes(texto);
var cumpleComunidad = comunidad === '' ? true : p.comunidad === comunidad;
var cumpleEstado = estado === '' ? true : p.estado === estado;
return cumpleTexto && cumpleComunidad && cumpleEstado;
```

### ✅ 5. **localStorage - Persistencia**
Guarda información importante del usuario:
```javascript
// Guardar
localStorage.setItem('guardados', JSON.stringify(productoresGuardados));

// Recuperar
var data = localStorage.getItem('guardados');
if(data) productoresGuardados = JSON.parse(data);
```

### ✅ 6. **Validación de Datos**
En tiempo real Y al enviar:
```javascript
function validarCampo(campo) {
  var valido = (id === 'nombre') ? val.length >= 3 : ...;
  campo.classList.add(valido ? 'valido' : 'error');
}
```

### ✅ 7. **Mensajes Visuales**
Retroalimentación inmediata al usuario:
- ✅ Verde: Guardado exitosamente
- ❌ Rojo: Error en validación
- ⚠️ Amarillo: Advertencia (ya guardado)
- ℹ️ Gris: Información

### ✅ 8. **Respuesta Inmediata**
Todos los cambios se ven SIN recargar:
- Búsqueda mientras escribes
- Filtros al cambiar select
- Guardar registro sin recargar
- Editar/eliminar con efecto inmediato

### ✅ 9. **Diseño 100% Responsivo**
- ✅ Funciona en celular (480px)
- ✅ Funciona en tablet (768px)
- ✅ Funciona en escritorio (1200px+)
- ✅ Menú adapta en móvil
- ✅ Grillas se ajustan
- ✅ Botones son del 100% en móvil

---

## Navegación del Proyecto

### 🔗 **Menú Principal** (En todas las páginas)
- **Inicio**: Vuelve a index.html
- **Productores**: Va a solucion.html
- **Registrar**: Va a registro.html
- **Indicador visual**: El link activo cambia de color

### 📍 **Flujo de Usuario Típico**

1. **Usuario entra a Inicio**
   - Ve el problema explicado
   - Ve estadísticas calculadas desde JSON
   - Presiona "Ver Productores"

2. **Usuario va a Productores**
   - Ve lista de todos los productores
   - Busca por nombre ("Carlos")
   - Filtra por comunidad ("Cabeceras")
   - Filtra por estado ("activo")
   - Guarda productores de interés
   - Ve detalles en modal

3. **Usuario va a Registrar**
   - Completa formulario
   - Validación en tiempo real
   - Guarda nuevo productor
   - Lo ve en la lista al lado
   - Al recargar, sus datos persisten

---

## Decisiones Técnicas Justificadas

| Decisión | Por Qué |
|----------|--------|
| **Fetch en lugar de AJAX** | fetch() es más moderno, prometido (async/await) y nativo |
| **localStorage en lugar de servidor** | Es educativo, funciona sin backend, datos persisten |
| **Vanilla JS sin frameworks** | Demuestra comprensión de fundamentos, no solo copiar templates |
| **CSS Grid + Flexbox** | Son estándares modernos, responsive, sin dependencias |
| **Variables CSS** | Facilita cambiar colores, mantenible y educativo |
| **Modal con divs en lugar de dialog** | Mayor control, compatible con navegadores antiguos |
| **Validación doble** | En tiempo real (feedback) + al enviar (seguridad) |

---

## Requisitos Cumplidos

### ✅ **Mínimos obligatorios**
- [x] 3 páginas conectadas
- [x] HTML5 + CSS3 + JavaScript vanilla
- [x] 100% responsivo
- [x] Problema real identificado
- [x] Datos desde JSON
- [x] Manipulación del DOM
- [x] Respuesta inmediata a interacciones
- [x] Formularios validados
- [x] localStorage funcional
- [x] Publicado y funcional

### ✅ **Rúbrica página de inicio**
- [x] Header con logo y menú
- [x] Descripción clara del problema
- [x] Público objetivo definido
- [x] Propuesta de solución clara
- [x] Banner hero visual
- [x] Botón de acción principal
- [x] Contenido dinámico desde JSON (preview + stats)
- [x] Interacción inmediata (botón toggle)
- [x] Diseño responsivo
- [x] HTML semántico
- [x] Accesibilidad básica (alt, labels, contraste)

### ✅ **Rúbrica página interactiva**
- [x] Carga JSON
- [x] Renderizado dinámico (0 tarjetas hardcodeadas)
- [x] Listado dinámico de elementos
- [x] Campo de búsqueda instantánea
- [x] Sistema de filtros (comunidad + estado)
- [x] Integración búsqueda + filtros
- [x] Selección/guardado de elementos
- [x] Respuesta inmediata
- [x] Retroalimentación visual (badges, colores, mensajes)
- [x] Estados vacíos (mensaje cuando no hay resultados)
- [x] Procesamiento de datos (contador, filtrado)
- [x] localStorage (guardar productores)
- [x] Recuperación automática
- [x] Organización con Flexbox/Grid
- [x] Diseño usable
- [x] Responsivo

### ✅ **Rúbrica página de registro**
- [x] Formulario funcional
- [x] Todas las etiquetas (label)
- [x] Validación en tiempo real
- [x] Validación al enviar
- [x] Mensajes dinámicos de error
- [x] Mensajes de confirmación
- [x] Registro dinámico de información
- [x] localStorage
- [x] Recuperación automática
- [x] Eliminación de registros
- [x] Limpieza controlada
- [x] Prevención de errores
- [x] Actualización inmediata
- [x] Diseño organizado (Grid)
- [x] Responsivo

### ✅ **Requisitos técnicos**
- [x] **HTML**: Semántico, títulos jerárquicos, labels, alt, navegación
- [x] **CSS**: Externo, responsivo, media queries, Flexbox/Grid, coherencia
- [x] **JavaScript**: Externo, eventos, funciones organizadas, DOM, arrays/objetos
- [x] **JSON**: 12 registros, 8 propiedades, id, categoría, estado, descripción
- [x] **localStorage**: Guardar, recuperar, actualizar, eliminar, integrado

---

## Cómo Funciona Cada Bloque de Código

### 🔹 **main.js** - Página de Inicio
1. Carga productores del JSON
2. Renderiza preview de primeros 3
3. Calcula estadísticas (total, activos, litros, comunidades)
4. Evento del botón para expandir información

### 🔹 **solucion.js** - Búsqueda y Filtros
1. Carga todos los productores
2. Llena el select de comunidades dinámicamente
3. Usuario escribe → búsqueda instantánea
4. Usuario cambia filtro → actualiza resultados
5. Usuario presiona "Guardar" → guarda en localStorage
6. Usuario presiona "Ver detalles" → abre modal

### 🔹 **registro.js** - Formulario
1. Al cargar la página, recupera registros del localStorage
2. Usuario escribe en campo → validación en tiempo real (color)
3. Usuario presiona "Guardar" → valida todos los campos
4. Si todo correcto → guarda en localStorage y actualiza lista
5. Usuario presiona "Editar" → rellena formulario con datos
6. Usuario presiona "Eliminar" → pide confirmación y borra

---

## Pruebas Manuales Realizadas

✅ **Búsqueda**
- Escribe "carlos" → encuentra productor
- Escribe "tilarán" → encuentra productores de esa comunidad

✅ **Filtros**
- Filtra por "Activos" → solo muestra activos
- Filtra por "En dificultad" → solo muestra en dificultad
- Combina búsqueda + filtros → funciona correctamente

✅ **localStorage**
- Guarda productor → recarga página → sigue guardado
- Edita registro → cambios persisten
- Elimina registro → no vuelve a aparecer

✅ **Validación**
- Nombre vacío → error rojo
- Teléfono incorrecto → error rojo
- Todos correctos → verde y permite guardar

✅ **Responsivo**
- En celular (480px) → se ve bien
- En tablet (768px) → se acomoda
- En desktop (1200px) → usa todo el espacio

---

## Archivos Incluidos

```
Rescate_lacteo/
├── index.html                    (Página de inicio)
├── solucion.html                 (Página interactiva)
├── registro.html                 (Página de registro)
├── DOCUMENTACION.md              (Este archivo)
├── data/
│   └── productores.json         (12 registros de productores)
├── css/
│   └── styles.css               (Estilos responsivos)
└── js/
    ├── main.js                  (Lógica de inicio)
    ├── solucion.js              (Lógica de búsqueda)
    └── registro.js              (Lógica de formulario)
```

---

## Para la Defensa Técnica

Cuando expliques este proyecto:

1. **Muestra el problema real** (productores rurales sin acceso a compradores)
2. **Explica cómo se resuelve** (plataforma centralizada con búsqueda)
3. **Recorre cada página**:
   - Inicio: Atrae al usuario, muestra datos dinámicos
   - Productores: Núcleo funcional con búsqueda+filtros
   - Registro: Gestión de datos con validación
4. **Demuestra funcionalidad**:
   - Busca un productor
   - Guarda uno (muestra localStorage en dev tools)
   - Recarga página → sigue guardado
   - Completa formulario con datos inválidos → errores
   - Corrige errores → se pone verde
5. **Explica decisiones técnicas** (por qué localStorage, por qué fetch, etc.)

---

**Proyecto creado con amor para Rescate Lácteo 🥛**
ISW-521 | Programación en Ambiente Web I | UTN | 2026
