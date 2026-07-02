# Significados de parámetros cortos en el proyecto

En JavaScript, estos nombres son variables locales usadas dentro de funciones. No tienen un significado fijo fuera del contexto donde se usan. Aquí se explica qué representa cada una en tus archivos.

---

## Significados generales

- `p`
  - Generalmente significa `productor`, `persona`, `producto` o `comprador`.
  - Se usa en iteraciones de arrays (`forEach`, `filter`, `map`, `find`).
  - Ejemplo: `lista.forEach(function(p) { ... })` → `p` es cada elemento del arreglo.

- `r`
  - Generalmente significa `registro`, `reseña` o `resultado`.
  - Se usa en listas de registros guardados y en reseñas.

- `x`
  - Nombre genérico para “cada elemento”.
  - Se usa cuando solo se necesita verificar algo como `x.id === id`.

- `acc`
  - Significa “acumulador”.
  - Se usa dentro de `reduce` para acumular valores.

- `cur`
  - Significa “current” (actual).
  - Se usa dentro de `reduce` como el elemento actual del array.

- `s`
  - Significa `stat` o elemento de estadística.
  - Se usa en `stats.forEach(function(s) { ... })`.

- `h`
  - Significa `historia`.
  - Se usa en `historias.forEach(function(h, index) { ... })`.

- `num`
  - Significa número, normalmente el valor actual en un loop de estrellas.

- `idx`
  - Significa índice.
  - Se usa en iteraciones para saber la posición.

- `e`
  - Significa evento.
  - Se usa en los manejadores de eventos (`click`, `input`, etc.).

- `res`
  - Significa `response`.
  - Es el resultado inicial del `fetch`.

- `data`
  - Significa datos.
  - Representa JSON parseado o datos recuperados de `localStorage`.

- `err`
  - Significa error.
  - Se usa en `.catch(function(err){ ... })`.

- `id`
  - Significa identificador.
  - Es el número único de un productor/comprador/registro.

- `campo`
  - Significa campo de formulario.
  - Es un elemento `input` o `select`.

- `reg`
  - Significa registro.
  - Usado en funciones que validan o guardan registros.

- `comprador`
  - En funciones de compradores, puede representar un id o el comprador en sí.

- `producerId`
  - Es el identificador del productor dentro de reseñas.

---

## `main.js`

- `p`
  - Cada objeto de productor dentro de listas como `jsonData`, `lista` o `locales`.

- `a`, `b`
  - Dos productores usados para comparar orden en `sort`.

- `s`
  - Cada elemento de la lista de estadísticas.

- `h`
  - Cada historia en `historias`.

- `cur`
  - Productor actual dentro de `reduce`.

- `acc`
  - Acumulador dentro de `reduce`.

- `stats`
  - Array de objetos de estadísticas para renderizar.

---

## `compradores.js`

- `p`
  - Cada comprador de la lista.
  - En `renderizarCompradores`, `p` es el comprador que se dibuja.

- `r`
  - Cada reseña individual.
  - En `obtenerResenasComprador`, `r` es cada reseña encontrada.

- `x`
  - Elemento genérico cuando se recorre arrays como `compradoresGuardados` o `todosLosCompradores`.

- `acc`
  - Acumulador dentro de `reduce` al calcular promedio de estrellas.

- `num`
  - Valor de la estrella actual dentro del selector visual de estrellas.

- `idx`
  - Índice de botón dentro de `forEach` para actualizar color de estrellas.

- `e`
  - Evento de click o de cierre de modal.

- `res`
  - Respuesta del `fetch`.

- `data`
  - JSON obtenido del archivo `data/compradores.json`.

- `err`
  - Error capturado cuando falla el `fetch`.

- `lista`
  - Array de compradores filtrados o completos.

- `tarjeta`
  - Elemento DOM de la tarjeta del comprador.

---

## `solucion.js`

- `p`
  - Cada productor en las listas de visualización y filtros.

- `r`
  - Cada reseña al calcular el rating.

- `x`
  - Elemento genérico en `find`, `filter`, `some`.

- `acc`
  - Acumulador en `reduce`.

- `cur`
  - Producto actual en `reduce`.

- `num`
  - Valor de estrella actual en el modal de reseñas.

- `idx`
  - Índice de botón en el conjunto de estrellas.

- `e`
  - Evento de click o cambio.

- `res`
  - Respuesta del `fetch`.

- `data`
  - Datos parseados del JSON.

- `err`
  - Error en `.catch`.

- `lista`
  - Productores filtrados o para renderizar.

- `id`
  - Identificador de productor usado en modales y favoritos.

- `tarjeta`
  - Elemento DOM de la tarjeta del productor.

- `s`
  - Elemento de estadística o resultado de una iteración genérica.

---

## `registro.js`

- `reg`
  - Objeto registro construido con los campos del formulario.

- `p`
  - Objeto productor del JSON base o del registro local.

- `r`
  - Registro local dentro del arreglo `registros`.

- `x`
  - Elemento genérico en funciones como `find`, `filter`, `map`.

- `campo`
  - Input o select que se está validando.

- `c`
  - Campo del formulario cuando se itera con `forEach`.

- `id`
  - Id del campo (`nombre`, `comunidad`, etc.) o el identificador en el formulario.

- `val`
  - Valor trimmeado del campo actual.

- `nombreNorm`, `telNorm`, `correoNorm`
  - Versiones normalizadas de nombre, teléfono y correo para comparar duplicados.

- `excluirId`
  - Id que se ignora durante la verificación de duplicados en edición.

---

## `registro-comprador.js`

- `reg`
  - Objeto registro de comprador.

- `p`
  - Comprador del JSON base o comprador local.

- `r`
  - Registro local de comprador dentro de `registrosCompradores`.

- `x`
  - Elemento genérico en `find`, `filter`, `map`.

- `campo`
  - Input o select del formulario.

- `c`
  - Campo cuando se recorre la lista de inputs.

- `id`
  - Id del campo de formulario o identificador de registro.

- `val`
  - Valor trimmeado del campo actual.

- `nombreNorm`, `telNorm`, `correoNorm`
  - Versiones normalizadas para comparar duplicados.

- `excluirId`
  - Id que no se compara cuando se edita un registro existente.

---

## Recomendación

Si quieres que el código sea más claro, reemplaza estos nombres cortos por nombres descriptivos como:

- `p` → `productor`, `comprador`, `persona`
- `r` → `registro`, `reseña`
- `x` → `item`, `elemento`
- `acc` → `acumulador`
- `cur` → `actual`
- `e` → `evento`
- `res` → `respuesta`
- `data` → `datos`
- `err` → `error`

Esto hace el código más fácil de leer y mantener.

---

## Nota

Este documento es solo una guía explicativa; no modifica el código.