/**
 * compradores.js
 * ¿Qué hace?: Controla la página de listado de compradores,
 *             combinando el JSON base con registros guardados en localStorage.
 * ¿Por qué?: Permitir búsqueda, filtrado, favoritos y detalles de compradores.
 */

var todosLosCompradores = [];
var compradoresFiltrados = [];
var compradoresGuardados = [];

var contenedor = document.getElementById('contenedor-compradores');
var buscador = document.getElementById('buscador');
var filtroComunidad = document.getElementById('filtro-comunidad');
var btnLimpiar = document.getElementById('btn-limpiar-filtros');
var estadoVacio = document.getElementById('estado-vacio');
var contadorP = document.getElementById('contador');
var guardadosLista = document.getElementById('guardados-lista');

function esCompradorLocal(p) {
  return p.esLocal === true || p.id > 100;
}

function obtenerImagenPerfil(p) {
  if (p.imagen) return p.imagen;
  var clave = encodeURIComponent((p.nombre || 'persona').trim());
  return 'https://i.pravatar.cc/200?u=' + clave;
}

function obtenerResenasComprador(comprador) {
  var data = localStorage.getItem('resenas-compradores');
  if (!data) return [];
  try {
    var todas = JSON.parse(data);
    return todas.filter(function(r) { return r.producerId === comprador; });
  } catch(e) {
    return [];
  }
}

function calcularPromedioEstrellas(resenas) {
  if (!resenas || resenas.length === 0) return 0;
  var suma = resenas.reduce(function(acc, r) { return acc + (r.estrellas || 0); }, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

function crearElementoEstrellas(promedio) {
  var div = document.createElement('div');
  div.className = 'tarjeta-estrellas';
  for (var i = 1; i <= 5; i++) {
    var star = document.createElement('span');
    star.className = 'estrella' + (i <= Math.round(promedio) ? '' : ' vacia');
    star.textContent = '★';
    div.appendChild(star);
  }
  return div;
}

function obtenerRegistrosLocales() {
  var data = localStorage.getItem('registros-compradores');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function combinarCompradores(jsonData) {
  var locales = obtenerRegistrosLocales();
  var idsJson = jsonData.map(function(p) { return p.id; });
  var soloNuevos = locales.filter(function(p) { return idsJson.indexOf(p.id) === -1; });
  return jsonData.concat(soloNuevos);
}

function cargarCompradores() {
  fetch('./data/compradores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      todosLosCompradores = combinarCompradores(data);
      compradoresFiltrados = todosLosCompradores.slice();
      poblarFiltroComunidad();
      renderizarCompradores(compradoresFiltrados);
      actualizarContador(compradoresFiltrados.length);
    })
    .catch(function(err) {
      console.error('Error cargando JSON de compradores:', err);
      var locales = obtenerRegistrosLocales();
      if (locales.length > 0) {
        todosLosCompradores = locales;
        compradoresFiltrados = locales.slice();
        poblarFiltroComunidad();
        renderizarCompradores(compradoresFiltrados);
        actualizarContador(compradoresFiltrados.length);
      } else {
        mostrarMensaje('No se pudo cargar la lista de compradores.', 'error');
      }
    });
}

function poblarFiltroComunidad() {
  while (filtroComunidad.options.length > 1) {
    filtroComunidad.remove(1);
  }
  var regiones = todosLosCompradores.reduce(function(acc, cur) {
    if (acc.indexOf(cur.comunidad) === -1) acc.push(cur.comunidad);
    return acc;
  }, []);
  regiones.forEach(function(r) {
    var opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    filtroComunidad.appendChild(opt);
  });
}

function renderizarCompradores(lista) {
  contenedor.innerHTML = '';
  if (!lista || lista.length === 0) {
    estadoVacio.style.display = 'block';
    actualizarContador(0);
    return;
  }
  estadoVacio.style.display = 'none';
  lista.forEach(function(p) {
    var card = document.createElement('div');
    card.className = 'tarjeta';
    card.dataset.id = p.id;

    var foto = document.createElement('img');
    foto.className = 'tarjeta-foto';
    foto.src = obtenerImagenPerfil(p);
    foto.alt = 'Foto de ' + p.nombre;

    var header = document.createElement('div');
    header.className = 'tarjeta-header';
    var h3 = document.createElement('h3');
    h3.textContent = p.nombre;
    header.appendChild(h3);
    if (esCompradorLocal(p)) {
      var badgeNuevo = document.createElement('span');
      badgeNuevo.className = 'badge badge-nuevo';
      badgeNuevo.textContent = 'Nuevo';
      header.appendChild(badgeNuevo);
    }

    var resenas = obtenerResenasComprador(p.id);
    var promedio = calcularPromedioEstrellas(resenas);
    var estrellas = crearElementoEstrellas(promedio);

    var calificacion = document.createElement('div');
    calificacion.className = 'tarjeta-calificacion';
    calificacion.appendChild(estrellas);
    if (resenas.length > 0) {
      var texto = document.createElement('p');
      texto.style.fontSize = '0.75rem';
      texto.style.margin = '4px 0 0 0';
      texto.style.color = 'var(--t-suave)';
      texto.textContent = promedio + '/5 · ' + resenas.length + ' reseña' + (resenas.length !== 1 ? 's' : '');
      calificacion.appendChild(texto);
    }

    var info = document.createElement('p');
    var ubicacion = p.lugarEspecifico ? (p.comunidad + ' · ' + p.lugarEspecifico) : p.comunidad;
    info.textContent = ubicacion + ' · ' + p.produccionDiariaLitros + ' L/día';

    var contacto = document.createElement('p');
    contacto.textContent = 'Contacto: ' + p.contacto;

    var correo = document.createElement('p');
    correo.textContent = 'Correo: ' + (p.correo || '—');

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

    var estaGuardado = compradoresGuardados.some(function(x) { return x.id === p.id; });
    if (estaGuardado) {
      card.classList.add('guardada');
      btnFavorito.textContent = '⭐ En favoritos';
      btnFavorito.disabled = true;
    }

    card.appendChild(foto);
    card.appendChild(header);
    card.appendChild(calificacion);
    card.appendChild(info);
    card.appendChild(contacto);
    card.appendChild(correo);
    var btnResena = document.createElement('button');
    btnResena.textContent = '✏️ Agregar reseña';
    btnResena.className = 'btn-secundario';
    btnResena.setAttribute('aria-label', 'Agregar reseña para ' + p.nombre);
    btnResena.addEventListener('click', function() { abrirModalResena(p.id, p.nombre, 'comprador'); });
    card.appendChild(btnResena);
    card.appendChild(btnFavorito);
    card.appendChild(document.createTextNode(' '));
    card.appendChild(btnDetalles);
    contenedor.appendChild(card);
  });
}

function abrirModalResena(id, nombre, tipo) {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay';
  var box = document.createElement('div');
  box.className = 'modal-box';

  var titulo = document.createElement('h3');
  titulo.textContent = 'Escribir reseña para ' + nombre;

  var labelEstrellas = document.createElement('label');
  labelEstrellas.textContent = 'Calificación (estrellas)';
  labelEstrellas.style.display = 'block';
  labelEstrellas.style.marginTop = '16px';
  labelEstrellas.style.marginBottom = '8px';
  labelEstrellas.style.fontWeight = '600';

  var estrellas = document.createElement('div');
  estrellas.style.display = 'flex';
  estrellas.style.gap = '8px';
  estrellas.style.marginBottom = '16px';
  var estrellasSeleccionadas = 0;

  for (var i = 1; i <= 5; i++) {
    (function(num) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '★';
      btn.style.fontSize = '28px';
      btn.style.border = 'none';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
      btn.style.color = '#DDD';
      btn.style.padding = '0';
      btn.style.transition = 'color .2s';
      btn.addEventListener('click', function() {
        estrellasSeleccionadas = num;
        var botones = estrellas.querySelectorAll('button');
        botones.forEach(function(b, idx) {
          b.style.color = idx < num ? '#FFB800' : '#DDD';
        });
      });
      estrellas.appendChild(btn);
    })(i);
  }

  var labelComentario = document.createElement('label');
  labelComentario.textContent = 'Comentario (opcional)';
  labelComentario.style.display = 'block';
  labelComentario.style.marginTop = '12px';
  labelComentario.style.marginBottom = '8px';
  labelComentario.style.fontWeight = '600';

  var textarea = document.createElement('textarea');
  textarea.style.width = '100%';
  textarea.style.minHeight = '80px';
  textarea.style.padding = '10px';
  textarea.style.border = '1px solid rgba(76, 175, 80, 0.3)';
  textarea.style.borderRadius = 'var(--r-sm)';
  textarea.style.fontFamily = 'inherit';
  textarea.style.fontSize = '0.9rem';
  textarea.placeholder = 'Comparte tu experiencia...';

  var acciones = document.createElement('div');
  acciones.className = 'modal-actions';

  var btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.className = 'btn-secundario';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.addEventListener('click', function() { cerrar(false); });

  var btnEnviar = document.createElement('button');
  btnEnviar.type = 'button';
  btnEnviar.className = 'btn-primario';
  btnEnviar.textContent = 'Enviar reseña';
  btnEnviar.addEventListener('click', function() {
    if (estrellasSeleccionadas === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    guardarResena(id, tipo, estrellasSeleccionadas, textarea.value.trim());
    cerrar(true);
  });

  acciones.appendChild(btnCancelar);
  acciones.appendChild(btnEnviar);
  box.appendChild(titulo);
  box.appendChild(labelEstrellas);
  box.appendChild(estrellas);
  box.appendChild(labelComentario);
  box.appendChild(textarea);
  box.appendChild(acciones);
  modal.appendChild(box);

  var cerrado = false;
  function cerrar(confirmado) {
    if (cerrado) return;
    cerrado = true;
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrar(false);
  });

  document.body.appendChild(modal);
}

function guardarResena(id, tipo, estrellas, comentario) {
  var clave = tipo === 'productor' ? 'resenas-productores' : 'resenas-compradores';
  var data = localStorage.getItem(clave);
  var resenas = data ? JSON.parse(data) : [];
  resenas.push({
    id: id,
    producerId: id,
    estrellas: estrellas,
    comentario: comentario,
    fecha: new Date().toISOString()
  });
  localStorage.setItem(clave, JSON.stringify(resenas));
  mostrarMensaje('Reseña guardada correctamente.', 'exito');
  renderizarCompradores(compradoresFiltrados);
}

function mostrarMensaje(texto, tipo) {
  var msg = document.getElementById('form-mensaje') || document.createElement('div');
  msg.id = 'form-mensaje';
  msg.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  msg.textContent = texto;
  msg.style.display = 'block';
  if (!document.body.contains(msg)) document.body.appendChild(msg);
  setTimeout(function() { msg.style.display = 'none'; }, 3000);
}

function filtrarYBuscar() {
  var texto = buscador.value.trim().toLowerCase();
  var comunidad = filtroComunidad.value;
  compradoresFiltrados = todosLosCompradores.filter(function(p) {
    var cumpleTexto = p.nombre.toLowerCase().includes(texto) || p.comunidad.toLowerCase().includes(texto);
    var cumpleComunidad = comunidad === '' ? true : p.comunidad === comunidad;
    return cumpleTexto && cumpleComunidad;
  });

  renderizarCompradores(compradoresFiltrados);
  actualizarContador(compradoresFiltrados.length);
}

function guardarFavorito(id, tarjeta) {
  var p = todosLosCompradores.find(function(x) { return x.id === id; });
  if (!p) return;
  var existe = compradoresGuardados.some(function(x) { return x.id === id; });
  if (existe) {
    mostrarMensaje('Este comprador ya está en tus favoritos.', 'advertencia');
    return;
  }
  compradoresGuardados.push(p);
  localStorage.setItem('guardados-compradores', JSON.stringify(compradoresGuardados));
  if (tarjeta) {
    tarjeta.classList.add('guardada');
    var btn = tarjeta.querySelector('.btn-secundario');
    if (btn) {
      btn.textContent = '⭐ En favoritos';
      btn.disabled = true;
    }
  }
  mostrarMensaje('Comprador agregado a favoritos (localStorage).', 'exito');
  renderizarGuardados();
}

function cargarGuardadosDeStorage() {
  var data = localStorage.getItem('guardados-compradores');
  if (data) {
    try {
      compradoresGuardados = JSON.parse(data);
    } catch(e) {
      compradoresGuardados = [];
    }
  }
  renderizarGuardados();
}

function renderizarGuardados() {
  guardadosLista.innerHTML = '';
  if (!compradoresGuardados || compradoresGuardados.length === 0) {
    guardadosLista.innerHTML = '<p class="estado-vacio">No has agregado favoritos aún.</p>';
    return;
  }
  compradoresGuardados.forEach(function(p) {
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

function eliminarFavorito(id) {
  compradoresGuardados = compradoresGuardados.filter(function(x) { return x.id !== id; });
  localStorage.setItem('guardados-compradores', JSON.stringify(compradoresGuardados));
  renderizarGuardados();
  renderizarCompradores(compradoresFiltrados);
  mostrarMensaje('Comprador quitado de favoritos.', 'exito');
}

function mostrarDetalles(id) {
  var p = todosLosCompradores.find(function(x) { return x.id === id; });
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
    '<p><strong>Región:</strong> ' + p.comunidad + '</p>' +
    '<p><strong>Demanda diaria:</strong> ' + p.produccionDiariaLitros + ' L</p>' +
    '<p><strong>Productos buscados:</strong> ' + productos + '</p>' +
    '<p><strong>Descripción:</strong> ' + (p.descripcion || '—') + '</p>' +
    '<p><strong>Contacto:</strong> ' + p.contacto + '</p>' +
    '<p><strong>Correo:</strong> ' + (p.correo || '—') + '</p>';
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

function actualizarContador(cantidad) {
  contadorP.textContent = 'Mostrando ' + cantidad + ' de ' + todosLosCompradores.length + ' compradores';
}

function limpiarFiltros() {
  buscador.value = '';
  filtroComunidad.value = '';
  filtrarYBuscar();
}

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
  cargarCompradores();
  buscador.addEventListener('input', filtrarYBuscar);
  filtroComunidad.addEventListener('change', filtrarYBuscar);
  btnLimpiar.addEventListener('click', limpiarFiltros);
});
