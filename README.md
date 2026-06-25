# 🥛 Rescate Lácteo

**Plataforma web para conectar productores de leche rural con compradores locales.**

---

## 🎯 Problema que Resuelve

Los productores de leche de comunidades rurales de Tilarán, Costa Rica (Cabeceras, Tronadora, El Dos, La Florida, entre otras), enfrentan diversos desafíos para comercializar sus productos:

* ❌ Dificultad para encontrar compradores.
* ❌ Problemas de logística y distribución.
* ❌ Limitado acceso a mercados más amplios.
* ❌ Escasa visibilidad de su producción.

**Solución:** una plataforma web centralizada que permite consultar productores, registrar nuevos productores, almacenar favoritos y facilitar la conexión entre productores y posibles compradores.

---

## 💻 Cómo Usar la Aplicación

### 1️⃣ Página de Inicio (`index.html`)

La página principal presenta el problema y la propuesta de solución.

Funciones disponibles:

* Consultar información general sobre la iniciativa.
* Visualizar estadísticas generadas dinámicamente.
* Conocer la cantidad total de productores registrados.
* Consultar la producción diaria total de leche.
* Ver la cantidad de comunidades representadas.
* Acceder rápidamente a las demás secciones mediante el menú de navegación.

---

### 2️⃣ Página de Productores (`solucion.html`) - PRINCIPAL

Esta es la sección principal de consulta de productores.

Funciones disponibles:

* **Buscar productores** por nombre o comunidad.
* **Filtrar productores** por comunidad o estado.
* **Ver detalles** completos de cada productor mediante un modal informativo.
* **Agregar a favoritos** utilizando el botón **⭐ Agregar a favoritos**.
* Consultar la sección **Mis productores favoritos**, donde se muestran los productores almacenados en localStorage.
* Identificar productores registrados por usuarios mediante la etiqueta **Nuevo**.
* Mantener los favoritos almacenados incluso después de cerrar o recargar la página.

---

### 3️⃣ Página de Registro (`registro.html`)

Permite registrar nuevos productores dentro de la plataforma.

Funciones disponibles:

* Completar un formulario de registro.
* Validación visual en tiempo real:

  * Campos válidos → verde ✅
  * Campos con errores → rojo ❌
* Validación de formato de teléfono.
* Validación de producción diaria.
* Verificación de campos obligatorios.
* Prevención de registros duplicados mediante validación de nombre y teléfono.
* Almacenamiento de nuevos registros en localStorage.
* Integración automática con los listados y estadísticas del sistema.
* Edición de registros locales.
* Eliminación de registros locales.

---

## 🔄 Flujo de Navegación de la Aplicación

La aplicación está compuesta por tres páginas conectadas entre sí:

1. El usuario inicia en la página principal (`index.html`).
2. Consulta información general y estadísticas generadas dinámicamente.
3. Accede a la página de productores (`solucion.html`) para buscar y filtrar información.
4. Puede agregar productores a favoritos para acceder a ellos posteriormente.
5. Si desea registrar un nuevo productor, accede a `registro.html`.
6. El nuevo productor se almacena en localStorage.
7. Automáticamente aparece en:

   * Los listados de productores.
   * Las estadísticas de la página principal.
   * Las búsquedas y filtros.
   * La vista previa de productores recientes.

---

## 📋 Requisitos Cumplidos

### ✅ 3 Páginas Conectadas

* Inicio.
* Productores (Solución Interactiva).
* Registro.
* Navegación disponible desde cualquier página.
* Indicador visual de página activa.

---

### ✅ HTML5 Semántico

Uso de etiquetas semánticas:

* `<header>`
* `<nav>`
* `<main>`
* `<section>`
* `<footer>`

Además:

* Encabezados jerárquicos.
* Etiquetas `<label>` asociadas a formularios.
* Texto alternativo en imágenes.
* Código organizado y estructurado.

---

### ✅ CSS3 Responsivo

La aplicación se adapta a diferentes tamaños de pantalla:

* Desktop: 1200px o superior.
* Tablet: 768px - 1199px.
* Móvil: 480px - 767px.
* Dispositivos pequeños: menos de 480px.

Características:

* Flexbox.
* CSS Grid.
* Diseño adaptable.
* Componentes reutilizables.
* Modal responsivo.
* Badges para identificación de registros nuevos.

---

### ✅ JavaScript Funcional

La aplicación implementa:

* Carga dinámica de datos desde JSON.
* Búsqueda en tiempo real.
* Filtros combinados.
* Manipulación dinámica del DOM.
* Validación de formularios.
* Uso de localStorage.
* Modal dinámico.
* Actualización automática de estadísticas.
* Integración de registros locales con datos JSON.

---

### ✅ JSON con Datos Reales

El archivo `productores.json` contiene información de productores de comunidades rurales de Tilarán.

Cada productor incluye:

* id
* nombre
* comunidad
* produccionDiariaLitros
* productosPrincipales
* estado
* descripcion
* contacto

Estos datos son utilizados para:

* Búsquedas.
* Filtros.
* Estadísticas.
* Visualización de información detallada.

---

### ✅ localStorage Funcional

Se utiliza para:

* Guardar productores favoritos.
* Guardar productores registrados por usuarios.
* Recuperar información automáticamente al recargar.
* Editar registros locales.
* Eliminar registros locales.
* Mantener información sin utilizar una base de datos externa.

---

## 🚀 Para la Defensa

### Demostración Recomendada

### Paso 1: Explicar el Problema

* Los productores rurales tienen dificultades para comercializar su producción.
* Existe poca visibilidad de los productores y sus productos.
* La plataforma facilita el contacto entre productores y compradores.

### Paso 2: Mostrar la Página de Inicio

* Presentar el problema.
* Explicar la solución.
* Mostrar estadísticas generadas dinámicamente.

### Paso 3: Mostrar Productores

* Buscar un productor por nombre.
* Filtrar por comunidad.
* Filtrar por estado.
* Abrir el modal de detalles.
* Agregar un productor a favoritos.
* Mostrar la sección de favoritos.

Abrir DevTools:

* F12.
* Application.
* Local Storage.

Mostrar:

* `guardados`

Recargar la página y comprobar que los favoritos permanecen almacenados.

### Paso 4: Mostrar Registro

* Intentar ingresar datos incorrectos.
* Mostrar validaciones.
* Intentar registrar un productor duplicado.
* Mostrar el mensaje de validación.
* Registrar un productor nuevo correctamente.
* Verificar que aparece identificado con la etiqueta **Nuevo**.

### Paso 5: Mostrar Código

Explicar:

* Uso de `fetch()` para cargar JSON.
* Manipulación del DOM.
* Validaciones.
* Uso de localStorage.
* Integración de registros locales.

---

## 📁 Estructura del Proyecto

```text
Rescate_lacteo/
├── index.html
├── solucion.html
├── registro.html
├── README.md
├── DOCUMENTACION.md
├── data/
│   └── productores.json
├── css/
│   └── interface.css
└── js/
    ├── main.js
    ├── solucion.js
    └── registro.js
```

---

## 🎨 Identidad Visual

| Elemento    | Significado                        |
| ----------- | ---------------------------------- |
| 🟢 Verde    | Productores activos                |
| 🟡 Amarillo | Productores en dificultad          |
| ⚪ Gris      | Productores inactivos              |
| 🔵 Azul     | Información general                |
| ⭐ Favoritos | Productores guardados              |
| 🏷️ Nuevo   | Productores registrados localmente |
| 🔴 Rojo     | Errores de validación              |

---

## 🛠️ Tecnologías Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript Vanilla

### Almacenamiento

* JSON Local
* localStorage

### Funcionalidades

* Fetch API
* Manipulación del DOM
* Eventos del navegador
* Validaciones dinámicas

---

## 📝 Datos Técnicos Importantes

### Archivo JSON

Contiene:

* 12 productores iniciales.
* Información de comunidades rurales de Tilarán.
* Datos estructurados para búsquedas y filtros.

### Propiedades por Productor

* id
* nombre
* comunidad
* produccionDiariaLitros
* productosPrincipales
* estado
* descripcion
* contacto

### localStorage

Se utilizan dos claves principales:

#### `guardados`

Almacena:

* Productores favoritos seleccionados por el usuario.

#### `registros-lacteo`

Almacena:

* Productores registrados desde el formulario.

### Validaciones Implementadas

* Nombre mínimo de 3 caracteres.
* Formato telefónico válido.
* Producción diaria válida.
* Campos obligatorios.
* Detección de registros duplicados por nombre.
* Detección de registros duplicados por teléfono.

---

## 🎓 Aprendizajes Demostrados

✅ Comprensión de una problemática real.

✅ Diseño responsivo.

✅ Estructura HTML semántica.

✅ CSS sin frameworks.

✅ JavaScript Vanilla.

✅ Manipulación del DOM.

✅ Manejo de eventos.

✅ Validación de formularios.

✅ Consumo de datos JSON..

✅ Uso de Fetch API.

✅ Uso de localStorage.

✅ Búsqueda y filtrado dinámico.

✅ Persistencia de datos en el navegador.

✅ Integración de múltiples páginas.

---

## 📌 Conclusión

Rescate Lácteo es una solución web que busca brindar visibilidad a productores rurales de leche de la región de Tilarán mediante una plataforma sencilla, accesible y funcional.

La aplicación permite consultar productores, registrar nuevos participantes, almacenar favoritos y mantener información persistente utilizando tecnologías fundamentales de desarrollo web, cumpliendo con los requisitos del curso y aplicando buenas prácticas de HTML, CSS y JavaScript.

---

**Creado para el curso ISW-521: Programación en Ambiente Web I**

Universidad Técnica Nacional · 2026

Para información técnica más detallada consultar el archivo `DOCUMENTACION.md`.
