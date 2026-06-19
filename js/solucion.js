/**
 * solucion.js
 * ¿Qué hace?: Controla la página de listado interactivo de productores.
 * ¿Por qué?: Permitir búsqueda, filtrado, guardar en localStorage y ver detalles.
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
 * cargarProductores
 * ¿Qué hace?: Lee productores desde el archivo JSON y inicializa el estado.
 * ¿Por qué?: Necesitamos datos dinámicos para renderizar la interfaz.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarProductores() {
  // fetch() hace una petición para leer el archivo JSON
  fetch('./data/productores.json')
    .then(function(res){ return res.json(); })
    .then(function(data){
      // data ya es un array de objetos JavaScript
      todosLosProductores = data;
      productoresFiltrados = data.slice();
      poblarFiltroComunidad();
      renderizarProductores(productoresFiltrados);
      actualizarContador(productoresFiltrados.length);
    })
    .catch(function(err){
      console.error('Error cargando JSON:', err);
      mostrarMensaje('No se pudo cargar la lista de productores.', 'error');
    });
}

/**
 * poblarFiltroComunidad
 * ¿Qué hace?: Llena el select de comunidades con valores únicos.
 * ¿Por qué?: Permitir filtrar por comunidad basada en datos reales.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function poblarFiltroComunidad(){
  var comunidades = todosLosProductores.reduce(function(acc, cur){
    if(acc.indexOf(cur.comunidad) === -1) acc.push(cur.comunidad);
    return acc;
  }, []);
  comunidades.forEach(function(c){
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
function renderizarProductores(lista){
  contenedor.innerHTML = ''; // limpiar el contenedor
  if(!lista || lista.length === 0){
    estadoVacio.style.display = 'block';
    actualizarContador(0);
    return;
  }
  estadoVacio.style.display = 'none';
  lista.forEach(function(p){
    // Crear estructura de tarjeta
    var card = document.createElement('div');
    card.className = 'tarjeta estado-' + (p.estado === 'en dificultad' ? 'dificultad' : (p.estado === 'activo' ? 'activo' : 'inactivo'));
    card.dataset.id = p.id;

    var h3 = document.createElement('h3');
    h3.textContent = p.nombre;

    var info = document.createElement('p');
    info.textContent = p.comunidad + ' · ' + p.produccionDiariaLitros + ' L/día';

    var contacto = document.createElement('p');
    contacto.textContent = 'Contacto: ' + p.contacto;

    // Badge de estado
    var span = document.createElement('span');
    span.className = 'badge ' + (p.estado === 'activo' ? 'badge-activo' : (p.estado === 'en dificultad' ? 'badge-dificultad' : 'badge-inactivo'));
    span.textContent = p.estado;

    // Botones
    var btnGuardar = document.createElement('button');
    btnGuardar.textContent = '💾 Guardar';
    btnGuardar.className = 'btn-secundario';
    btnGuardar.addEventListener('click', function(){ guardarProductor(p.id, card); });

    var btnDetalles = document.createElement('button');
    btnDetalles.textContent = '📋 Ver detalles';
    btnDetalles.className = 'btn-primario';
    btnDetalles.addEventListener('click', function(){ mostrarDetalles(p.id); });

    card.appendChild(h3);
    card.appendChild(span);
    card.appendChild(info);
    card.appendChild(contacto);
    card.appendChild(btnGuardar);
    card.appendChild(document.createTextNode(' '));
    card.appendChild(btnDetalles);

    contenedor.appendChild(card); // appendChild agrega la tarjeta al grid
  });
}

/**
 * filtrarYBuscar
 * ¿Qué hace?: Filtra la lista global según búsqueda y selects.
 * ¿Por qué?: Permitir búsquedas combinadas y filtros.
 * Parámetros: ninguno (lee valores desde inputs).
 * Retorna: nada.
 */
function filtrarYBuscar(){
  var texto = buscador.value.trim().toLowerCase();
  var comunidad = filtroComunidad.value;
  var estado = filtroEstado.value;

  // filter() recorre el array y devuelve solo los elementos que cumplen la condición
  productoresFiltrados = todosLosProductores.filter(function(p){
    var cumpleTexto = p.nombre.toLowerCase().includes(texto) || p.comunidad.toLowerCase().includes(texto);
    var cumpleComunidad = comunidad === '' ? true : p.comunidad === comunidad;
    var cumpleEstado = estado === '' ? true : p.estado === estado;
    return cumpleTexto && cumpleComunidad && cumpleEstado;
  });

  renderizarProductores(productoresFiltrados);
  actualizarContador(productoresFiltrados.length);
}

/**
 * guardarProductor
 * ¿Qué hace?: Guarda un productor en la lista de guardados y en localStorage.
 * ¿Por qué?: Permitir al usuario marcar productores de interés.
 * Parámetros: id (number), tarjeta (elemento DOM opcional).
 * Retorna: nada.
 */
function guardarProductor(id, tarjeta){
  // .find() retorna el primer elemento que cumple la condición
  var p = todosLosProductores.find(function(x){ return x.id === id; });
  if(!p) return;
  // .some() verifica si algún elemento cumple la condición
  var existe = productoresGuardados.some(function(x){ return x.id === id; });
  if(existe){
    mostrarMensaje('Productor ya guardado.', 'advertencia');
    return;
  }
  productoresGuardados.push(p);
  // JSON.stringify() convierte el array a texto para guardarlo en localStorage
  localStorage.setItem('guardados', JSON.stringify(productoresGuardados));
  if(tarjeta) tarjeta.classList.add('guardada');
  mostrarMensaje('Productor guardado correctamente.', 'exito');
  renderizarGuardados();
}

/**
 * cargarGuardadosDeStorage
 * ¿Qué hace?: Recupera la lista de guardados desde localStorage.
 * ¿Por qué?: Mantener persistencia entre recargas.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarGuardadosDeStorage(){
  var data = localStorage.getItem('guardados');
  if(data){
    // JSON.parse() convierte el texto de vuelta a array de objetos JavaScript
    productoresGuardados = JSON.parse(data);
  }
  renderizarGuardados();
}

/**
 * renderizarGuardados
 * ¿Qué hace?: Muestra la sección de guardados en el DOM.
 * ¿Por qué?: Permitir gestionar la lista guardada por el usuario.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function renderizarGuardados(){
  guardadosLista.innerHTML = '';
  if(!productoresGuardados || productoresGuardados.length === 0){
    guardadosLista.innerHTML = '<p class="estado-vacio">No has guardado productores aún.</p>';
    return;
  }
  productoresGuardados.forEach(function(p){
    var item = document.createElement('div');
    item.className = 'item-registro';
    item.innerHTML = '<div><strong>' + p.nombre + '</strong><div style="font-size:0.85rem;color:#555">' + p.comunidad + '</div></div>';
    var btn = document.createElement('button');
    btn.className = 'btn-peligro';
    btn.textContent = 'Eliminar';
    btn.addEventListener('click', function(){ eliminarGuardado(p.id); });
    item.appendChild(btn);
    guardadosLista.appendChild(item);
  });
}

/**
 * eliminarGuardado
 * ¿Qué hace?: Elimina un productor guardado por id.
 * ¿Por qué?: Permitir al usuario limpiar su lista.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function eliminarGuardado(id){
  // .filter() con id diferente elimina el elemento del array
  productoresGuardados = productoresGuardados.filter(function(x){ return x.id !== id; });
  localStorage.setItem('guardados', JSON.stringify(productoresGuardados));
  renderizarGuardados();
  mostrarMensaje('Guardado eliminado.', 'exito');
}

/**
 * mostrarDetalles
 * ¿Qué hace?: Muestra u oculta un panel con todos los datos del productor.
 * ¿Por qué?: Ver información completa sin salir de la página.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function mostrarDetalles(id){
  var p = todosLosProductores.find(function(x){ return x.id === id; });
  if(!p) return;
  // Crear modal simple
  var modal = document.createElement('div');
  modal.style.position = 'fixed'; modal.style.left = 0; modal.style.top = 0; modal.style.right = 0; modal.style.bottom = 0;
  modal.style.background = 'rgba(0,0,0,0.4)'; modal.style.display = 'flex'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center';
  var box = document.createElement('div');
  box.style.background = 'white'; box.style.padding = '20px'; box.style.borderRadius = '8px'; box.style.maxWidth = '600px'; box.style.width = '90%';
  box.innerHTML = '<h3>' + p.nombre + '</h3>' +
    '<p><strong>Comunidad:</strong> ' + p.comunidad + '</p>' +
    '<p><strong>Producción diaria:</strong> ' + p.produccionDiariaLitros + ' L</p>' +
    '<p><strong>Productos:</strong> ' + p.productosPrincipales.join(', ') + '</p>' +
    '<p><strong>Estado:</strong> ' + p.estado + '</p>' +
    '<p><strong>Descripción:</strong> ' + p.descripcion + '</p>' +
    '<p><strong>Contacto:</strong> ' + p.contacto + '</p>';
  var cerrar = document.createElement('button'); cerrar.textContent = 'Cerrar'; cerrar.className = 'btn-secundario';
  cerrar.addEventListener('click', function(){ document.body.removeChild(modal); });
  box.appendChild(cerrar);
  modal.appendChild(box);
  modal.addEventListener('click', function(e){ if(e.target === modal) document.body.removeChild(modal); });
  document.body.appendChild(modal);
}

/**
 * actualizarContador
 * ¿Qué hace?: Actualiza el párrafo contador con la cantidad mostrada.
 * ¿Por qué?: Informar al usuario cuántos resultados hay.
 * Parámetros: cantidad (number).
 * Retorna: nada.
 */
function actualizarContador(cantidad){
  contadorP.textContent = 'Mostrando ' + cantidad + ' de ' + todosLosProductores.length + ' productores';
}

/**
 * limpiarFiltros
 * ¿Qué hace?: Restablece los inputs de búsqueda y filtros.
 * ¿Por qué?: Proveer una forma rápida de volver al estado inicial.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function limpiarFiltros(){
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
function mostrarMensaje(texto, tipo){
  var div = document.createElement('div');
  div.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  div.textContent = texto;
  document.body.appendChild(div);
  setTimeout(function(){ document.body.removeChild(div); }, 3000); // setTimeout ejecuta una función después de X ms
}

// Cargar guardados y productores al inicio
document.addEventListener('DOMContentLoaded', function(){
  cargarGuardadosDeStorage();
  cargarProductores();

  // Eventos
  buscador.addEventListener('input', filtrarYBuscar);
  filtroComunidad.addEventListener('change', filtrarYBuscar);
  filtroEstado.addEventListener('change', filtrarYBuscar);
  btnLimpiar.addEventListener('click', limpiarFiltros);
});
