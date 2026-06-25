/**
 * solucion.js
 * ¿Qué hace?: Controla la página de listado interactivo de productores,
 *             combinando el JSON base con los registros del localStorage.
 * ¿Por qué?: Permitir búsqueda, filtrado, guardar favoritos en localStorage y ver detalles,
 *             incluyendo los productores registrados desde el formulario.
 * Parámetros: ninguno (usa selectores DOM y fetch).
 * Retorna: nada.
 */

// Variables globales de estado
var todosLosProductores = [];
var productoresFiltrados = [];
var productoresGuardados = [];

// Elementos del DOM
var contenedor = document.getElementById('contenedor-productores');
var buscador = document.getElementById('buscador');
var filtroComunidad = document.getElementById('filtro-comunidad');
var filtroEstado = document.getElementById('filtro-estado');
var btnLimpiar = document.getElementById('btn-limpiar-filtros');
var estadoVacio = document.getElementById('estado-vacio');
var contadorP = document.getElementById('contador');
var guardadosLista = document.getElementById('guardados-lista');

/**
 * esProductorLocal
 * ¿Qué hace?: Indica si un productor fue registrado por el usuario (no viene del JSON base).
 * ¿Por qué?: Mostrar badge "Nuevo" en tarjetas locales.
 * Parámetros: p (objeto productor).
 * Retorna: boolean.
 */
function esProductorLocal(p) {
  return p.esLocal === true || p.id > 100;
}

/**
 * obtenerRegistrosLocales
 * ¿Qué hace?: Lee los productores registrados por el usuario desde localStorage.
 * ¿Por qué?: Combinarlos con el JSON para tener una lista unificada.
 * Parámetros: ninguno.
 * Retorna: array de productores locales (puede estar vacío).
 */
function obtenerRegistrosLocales() {
  var data = localStorage.getItem('registros-lacteo');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * combinarProductores
 * ¿Qué hace?: Une productores del JSON con los del localStorage, evitando duplicados.
 * ¿Por qué?: Mostrar una lista completa que incluya registros nuevos del usuario.
 * Parámetros: jsonData (array) productores base del archivo JSON.
 * Retorna: array combinado.
 */
function combinarProductores(jsonData) {
  var locales = obtenerRegistrosLocales();
  var idsJson = jsonData.map(function(p) { return p.id; });
  var soloNuevos = locales.filter(function(p) { return idsJson.indexOf(p.id) === -1; });
  return jsonData.concat(soloNuevos);
}

/**
 * cargarProductores
 * ¿Qué hace?: Lee productores desde el archivo JSON, los combina con localStorage
 *             e inicializa el estado.
 * ¿Por qué?: Necesitamos datos dinámicos para renderizar la interfaz.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarProductores() {
  fetch('./data/productores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      todosLosProductores = combinarProductores(data);
      productoresFiltrados = todosLosProductores.slice();
      poblarFiltroComunidad();
      renderizarProductores(productoresFiltrados);
      actualizarContador(productoresFiltrados.length);
    })
    .catch(function(err) {
      console.error('Error cargando JSON:', err);
      var locales = obtenerRegistrosLocales();
      if (locales.length > 0) {
        todosLosProductores = locales;
        productoresFiltrados = locales.slice();
        poblarFiltroComunidad();
        renderizarProductores(productoresFiltrados);
        actualizarContador(productoresFiltrados.length);
      } else {
        mostrarMensaje('No se pudo cargar la lista de productores.', 'error');
      }
    });
}

/**
 * poblarFiltroComunidad
 * ¿Qué hace?: Llena el select de comunidades con valores únicos.
 * ¿Por qué?: Permitir filtrar por comunidad basada en datos reales (incluyendo locales).
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function poblarFiltroComunidad() {
  while (filtroComunidad.options.length > 1) {
    filtroComunidad.remove(1);
  }
  var comunidades = todosLosProductores.reduce(function(acc, cur) {
    if (acc.indexOf(cur.comunidad) === -1) acc.push(cur.comunidad);
    return acc;
  }, []);
  comunidades.forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    filtroComunidad.appendChild(opt);
  });
}

/**
 * renderizarProductores
 * ¿Qué hace?: Dibuja en el DOM las tarjetas para cada productor en la lista.
 * ¿Por qué?: Mostrar resultados al usuario.
 * Parámetros: lista (array) de productores.
 * Retorna: nada.
 */
function renderizarProductores(lista) {
  contenedor.innerHTML = '';
  if (!lista || lista.length === 0) {
    estadoVacio.style.display = 'block';
    actualizarContador(0);
    return;
  }
  estadoVacio.style.display = 'none';
  lista.forEach(function(p) {
    var card = document.createElement('div');
    card.className = 'tarjeta estado-' + (p.estado === 'en dificultad' ? 'dificultad' : (p.estado === 'activo' ? 'activo' : 'inactivo'));
    card.dataset.id = p.id;

    var header = document.createElement('div');
    header.className = 'tarjeta-header';

    var h3 = document.createElement('h3');
    h3.textContent = p.nombre;
    header.appendChild(h3);

    if (esProductorLocal(p)) {
      var badgeNuevo = document.createElement('span');
      badgeNuevo.className = 'badge badge-nuevo';
      badgeNuevo.textContent = 'Nuevo';
      header.appendChild(badgeNuevo);
    }

    var info = document.createElement('p');
    info.textContent = p.comunidad + ' · ' + p.produccionDiariaLitros + ' L/día';

    var contacto = document.createElement('p');
    contacto.textContent = 'Contacto: ' + p.contacto;

    var span = document.createElement('span');
    span.className = 'badge ' + (p.estado === 'activo' ? 'badge-activo' : (p.estado === 'en dificultad' ? 'badge-dificultad' : 'badge-inactivo'));
    span.textContent = p.estado;

    var btnFavorito = document.createElement('button');
    btnFavorito.textContent = '⭐ Agregar a favoritos';
    btnFavorito.className = 'btn-secundario';
    btnFavorito.setAttribute('aria-label', 'Agregar ' + p.nombre + ' a favoritos');
    btnFavorito.addEventListener('click', function() { guardarFavorito(p.id, card); });

    var btnDetalles = document.createElement('button');
    btnDetalles.textContent = '📋 Ver detalles';
    btnDetalles.className = 'btn-primario';
    btnDetalles.setAttribute('aria-label', 'Ver detalles de ' + p.nombre);
    btnDetalles.addEventListener('click', function() { mostrarDetalles(p.id); });

    var estaGuardado = productoresGuardados.some(function(x) { return x.id === p.id; });
    if (estaGuardado) {
      card.classList.add('guardada');
      btnFavorito.textContent = '⭐ En favoritos';
      btnFavorito.disabled = true;
    }

    card.appendChild(header);
    card.appendChild(span);
    card.appendChild(info);
    card.appendChild(contacto);
    card.appendChild(btnFavorito);
    card.appendChild(document.createTextNode(' '));
    card.appendChild(btnDetalles);

    contenedor.appendChild(card);
  });
}

/**
 * filtrarYBuscar
 * ¿Qué hace?: Filtra la lista global según búsqueda y selects.
 * ¿Por qué?: Permitir búsquedas combinadas y filtros sobre todos los productores.
 * Parámetros: ninguno (lee valores desde inputs).
 * Retorna: nada.
 */
function filtrarYBuscar() {
  var texto = buscador.value.trim().toLowerCase();
  var comunidad = filtroComunidad.value;
  var estado = filtroEstado.value;

  productoresFiltrados = todosLosProductores.filter(function(p) {
    var cumpleTexto = p.nombre.toLowerCase().includes(texto) || p.comunidad.toLowerCase().includes(texto);
    var cumpleComunidad = comunidad === '' ? true : p.comunidad === comunidad;
    var cumpleEstado = estado === '' ? true : p.estado === estado;
    return cumpleTexto && cumpleComunidad && cumpleEstado;
  });

  renderizarProductores(productoresFiltrados);
  actualizarContador(productoresFiltrados.length);
}

/**
 * guardarFavorito
 * ¿Qué hace?: Guarda un productor en la lista de favoritos y en localStorage.
 * ¿Por qué?: Permitir al usuario marcar productores de interés sin registrar uno nuevo.
 * Parámetros: id (number), tarjeta (elemento DOM opcional).
 * Retorna: nada.
 */
function guardarFavorito(id, tarjeta) {
  var p = todosLosProductores.find(function(x) { return x.id === id; });
  if (!p) return;
  var existe = productoresGuardados.some(function(x) { return x.id === id; });
  if (existe) {
    mostrarMensaje('Este productor ya está en tus favoritos.', 'advertencia');
    return;
  }
  productoresGuardados.push(p);
  localStorage.setItem('guardados', JSON.stringify(productoresGuardados));
  if (tarjeta) {
    tarjeta.classList.add('guardada');
    var btn = tarjeta.querySelector('.btn-secundario');
    if (btn) {
      btn.textContent = '⭐ En favoritos';
      btn.disabled = true;
    }
  }
  mostrarMensaje('Productor agregado a favoritos (localStorage).', 'exito');
  renderizarGuardados();
}

/**
 * cargarGuardadosDeStorage
 * ¿Qué hace?: Recupera la lista de favoritos desde localStorage.
 * ¿Por qué?: Mantener persistencia entre recargas.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarGuardadosDeStorage() {
  var data = localStorage.getItem('guardados');
  if (data) {
    try {
      productoresGuardados = JSON.parse(data);
    } catch(e) {
      productoresGuardados = [];
    }
  }
  renderizarGuardados();
}

/**
 * renderizarGuardados
 * ¿Qué hace?: Muestra la sección de favoritos en el DOM.
 * ¿Por qué?: Permitir gestionar la lista guardada por el usuario.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function renderizarGuardados() {
  guardadosLista.innerHTML = '';
  if (!productoresGuardados || productoresGuardados.length === 0) {
    guardadosLista.innerHTML = '<p class="estado-vacio">No has agregado favoritos aún.</p>';
    return;
  }
  productoresGuardados.forEach(function(p) {
    var item = document.createElement('div');
    item.className = 'item-registro';
    item.innerHTML = '<div><strong>' + p.nombre + '</strong><div style="font-size:0.85rem;color:#555">' + p.comunidad + '</div></div>';
    var btn = document.createElement('button');
    btn.className = 'btn-peligro';
    btn.textContent = 'Quitar de favoritos';
    btn.setAttribute('aria-label', 'Quitar ' + p.nombre + ' de favoritos');
    btn.addEventListener('click', function() { eliminarFavorito(p.id); });
    item.appendChild(btn);
    guardadosLista.appendChild(item);
  });
}

/**
 * eliminarFavorito
 * ¿Qué hace?: Elimina un productor favorito por id.
 * ¿Por qué?: Permitir al usuario limpiar su lista.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function eliminarFavorito(id) {
  productoresGuardados = productoresGuardados.filter(function(x) { return x.id !== id; });
  localStorage.setItem('guardados', JSON.stringify(productoresGuardados));
  renderizarGuardados();
  renderizarProductores(productoresFiltrados);
  mostrarMensaje('Productor quitado de favoritos.', 'exito');
}

/**
 * mostrarDetalles
 * ¿Qué hace?: Muestra un modal con todos los datos del productor.
 * ¿Por qué?: Ver información completa sin salir de la página.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function mostrarDetalles(id) {
  var p = todosLosProductores.find(function(x) { return x.id === id; });
  if (!p) return;

  var productos = Array.isArray(p.productosPrincipales)
    ? p.productosPrincipales.join(', ')
    : (p.productosPrincipales || '—');

  var modal = document.createElement('div');
  modal.className = 'modal-overlay';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.innerHTML =
    '<h3>' + p.nombre + '</h3>' +
    '<p><strong>Comunidad:</strong> ' + p.comunidad + '</p>' +
    '<p><strong>Producción diaria:</strong> ' + p.produccionDiariaLitros + ' L</p>' +
    '<p><strong>Productos:</strong> ' + productos + '</p>' +
    '<p><strong>Estado:</strong> ' + p.estado + '</p>' +
    '<p><strong>Descripción:</strong> ' + (p.descripcion || '—') + '</p>' +
    '<p><strong>Contacto:</strong> ' + p.contacto + '</p>';
  var cerrar = document.createElement('button');
  cerrar.textContent = 'Cerrar';
  cerrar.className = 'btn-secundario';
  cerrar.setAttribute('aria-label', 'Cerrar detalles');
  cerrar.addEventListener('click', function() { document.body.removeChild(modal); });
  box.appendChild(cerrar);
  modal.appendChild(box);
  modal.addEventListener('click', function(e) { if (e.target === modal) document.body.removeChild(modal); });
  document.body.appendChild(modal);
}

/**
 * actualizarContador
 * ¿Qué hace?: Actualiza el párrafo contador con la cantidad mostrada.
 * ¿Por qué?: Informar al usuario cuántos resultados hay (incluye registros nuevos).
 * Parámetros: cantidad (number).
 * Retorna: nada.
 */
function actualizarContador(cantidad) {
  contadorP.textContent = 'Mostrando ' + cantidad + ' de ' + todosLosProductores.length + ' productores';
}

/**
 * limpiarFiltros
 * ¿Qué hace?: Restablece los inputs de búsqueda y filtros.
 * ¿Por qué?: Proveer una forma rápida de volver al estado inicial.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function limpiarFiltros() {
  buscador.value = '';
  filtroComunidad.value = '';
  filtroEstado.value = '';
  filtrarYBuscar();
}

/**
 * mostrarMensaje
 * ¿Qué hace?: Muestra mensajes transitorios de éxito/error/advertencia.
 * ¿Por qué?: Retroalimentación al usuario.
 * Parámetros: texto (string), tipo (string).
 * Retorna: nada.
 */
function mostrarMensaje(texto, tipo) {
  var div = document.createElement('div');
  div.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  div.textContent = texto;
  div.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;min-width:240px;box-shadow:0 4px 16px rgba(0,0,0,0.15)';
  document.body.appendChild(div);
  setTimeout(function() {
    if (div.parentNode) document.body.removeChild(div);
  }, 3000);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  cargarGuardadosDeStorage();
  cargarProductores();

  buscador.addEventListener('input', filtrarYBuscar);
  filtroComunidad.addEventListener('change', filtrarYBuscar);
  filtroEstado.addEventListener('change', filtrarYBuscar);
  btnLimpiar.addEventListener('click', limpiarFiltros);
});
