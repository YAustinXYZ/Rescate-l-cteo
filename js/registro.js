/**
 * registro.js
 * ¿Qué hace?: Gestiona el formulario de registro y la lista de registros locales.
 * ¿Por qué?: Permitir crear, editar, validar y persistir registros de productores.
 * Parámetros: ninguno (usa el DOM y localStorage).
 * Retorna: nada.
 */

var registros = [];
var modoEdicion = false;
var idEnEdicion = null;

// Elementos DOM
var form = document.getElementById('form-productor');
var nombre = document.getElementById('nombre');
var comunidad = document.getElementById('comunidad');
var produccion = document.getElementById('produccion');
var producto = document.getElementById('producto');
var telefono = document.getElementById('telefono');
var estado = document.getElementById('estado');
var btnLimpiar = document.getElementById('btn-limpiar');
var listaRegistros = document.getElementById('lista-registros');
var formMensaje = document.getElementById('form-mensaje');

/**
 * validarCampo
 * ¿Qué hace?: Valida un campo individual y aplica clases de error/valido.
 * ¿Por qué?: Dar feedback en tiempo real al usuario.
 * Parámetros: campo (elemento input/select).
 * Retorna: boolean (true si válido).
 */
function validarCampo(campo){
  var id = campo.id;
  var val = campo.value.trim();
  var valido = true;
  if(id === 'nombre'){
    valido = val.length >= 3;
  } else if(id === 'produccion'){
    var n = Number(val);
    valido = n > 0 && n <= 9999;
  } else if(id === 'telefono'){
    valido = /^\d{4}-\d{4}$/.test(val);
  } else if(id === 'comunidad' || id === 'producto' || id === 'estado'){
    valido = val !== '';
  }

  var errorDiv = document.getElementById('error-' + id);
  if(!valido){
    campo.classList.add('error');
    campo.classList.remove('valido');
    if(errorDiv){ errorDiv.style.display = 'block'; errorDiv.textContent = 'Campo inválido.'; }
  } else {
    campo.classList.remove('error');
    campo.classList.add('valido');
    if(errorDiv){ errorDiv.style.display = 'none'; errorDiv.textContent = ''; }
  }
  return valido;
}

/**
 * autoFormatearTelefono
 * ¿Qué hace?: Inserta el guión automáticamente en el teléfono.
 * ¿Por qué?: Mejorar la UX y ayudar al usuario a respetar el formato.
 * Parámetros: campo (elemento input).
 * Retorna: nada.
 */
function autoFormatearTelefono(campo){
  var v = campo.value.replace(/[^0-9]/g, '');
  if(v.length > 4) v = v.slice(0,4) + '-' + v.slice(4,8);
  campo.value = v.slice(0,9);
}

/**
 * crearRegistro
 * ¿Qué hace?: Construye un objeto registro desde los campos del formulario.
 * ¿Por qué?: Generar la estructura que se guardará en localStorage.
 * Parámetros: ninguno.
 * Retorna: objeto registro.
 */
function crearRegistro(){
  var id = modoEdicion ? idEnEdicion : Date.now(); // Date.now() retorna ms desde 1970
  return {
    id: id,
    nombre: nombre.value.trim(),
    comunidad: comunidad.value,
    produccionDiariaLitros: Number(produccion.value),
    productosPrincipales: [producto.value],
    estado: estado.value,
    descripcion: '',
    contacto: telefono.value
  };
}

/**
 * guardarEnStorage
 * ¿Qué hace?: Persiste el array de registros en localStorage.
 * ¿Por qué?: Mantener datos entre recargas.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function guardarEnStorage(){
  localStorage.setItem('registros-lacteo', JSON.stringify(registros));
}

/**
 * cargarDeStorage
 * ¿Qué hace?: Recupera registros desde localStorage al cargar la página.
 * ¿Por qué?: Inicializar la vista con datos previos.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarDeStorage(){
  var data = localStorage.getItem('registros-lacteo');
  if(data) registros = JSON.parse(data);
  renderizarLista();
}

/**
 * renderizarLista
 * ¿Qué hace?: Muestra los registros en la columna derecha.
 * ¿Por qué?: Permitir editar/eliminar registros.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function renderizarLista(){
  // limpiar
  var header = '<h2>Registros guardados (' + registros.length + ')</h2>';
  listaRegistros.innerHTML = header;
  if(registros.length === 0){
    listaRegistros.innerHTML += '<p class="estado-vacio">No hay registros aún.</p>';
    return;
  }
  registros.forEach(function(r){
    var item = document.createElement('div');
    item.className = 'item-registro';
    item.innerHTML = '<div><strong>' + r.nombre + '</strong><div style="font-size:0.85rem;color:#555">' + r.comunidad + '</div></div>';
    var acciones = document.createElement('div');
    var btnEditar = document.createElement('button'); btnEditar.textContent = '✏️ Editar'; btnEditar.className = 'btn-secundario';
    btnEditar.addEventListener('click', function(){ editarRegistro(r.id); });
    var btnEliminar = document.createElement('button'); btnEliminar.textContent = '🗑 Eliminar'; btnEliminar.className = 'btn-peligro';
    btnEliminar.addEventListener('click', function(){ eliminarRegistro(r.id); });
    acciones.appendChild(btnEditar); acciones.appendChild(document.createTextNode(' ')); acciones.appendChild(btnEliminar);
    item.appendChild(acciones);
    listaRegistros.appendChild(item);
  });
}

/**
 * eliminarRegistro
 * ¿Qué hace?: Elimina un registro después de confirmar.
 * ¿Por qué?: Permitir al usuario gestionar sus registros.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function eliminarRegistro(id){
  if(!confirm('¿Eliminar este registro?')) return; // confirm() muestra un diálogo nativo
  registros = registros.filter(function(r){ return r.id !== id; });
  guardarEnStorage();
  renderizarLista();
  mostrarMensaje('Registro eliminado.', 'exito');
}

/**
 * editarRegistro
 * ¿Qué hace?: Rellena el formulario con los datos del registro para editar.
 * ¿Por qué?: Reutilizar el mismo formulario en modo edición.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function editarRegistro(id){
  var r = registros.find(function(x){ return x.id === id; });
  if(!r) return;
  nombre.value = r.nombre;
  comunidad.value = r.comunidad;
  produccion.value = r.produccionDiariaLitros;
  producto.value = r.productosPrincipales[0] || '';
  telefono.value = r.contacto;
  estado.value = r.estado;
  modoEdicion = true;
  idEnEdicion = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * limpiarFormulario
 * ¿Qué hace?: Resetea el formulario y estados de validación.
 * ¿Por qué?: Permitir empezar con campos limpios.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function limpiarFormulario(){
  form.reset();
  [nombre, comunidad, produccion, producto, telefono, estado].forEach(function(c){ c.classList.remove('error','valido'); });
  modoEdicion = false; idEnEdicion = null;
  formMensaje.style.display = 'none'; formMensaje.textContent = '';
  mostrarMensaje('Formulario limpiado.', 'advertencia');
}

/**
 * mostrarMensaje
 * ¿Qué hace?: Muestra mensajes transitorios de exito/error/advertencia.
 * ¿Por qué?: Retroalimentar al usuario.
 * Parámetros: texto (string), tipo (string).
 * Retorna: nada.
 */
function mostrarMensaje(texto, tipo){
  formMensaje.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  formMensaje.textContent = texto;
  formMensaje.style.display = 'block';
  setTimeout(function(){ formMensaje.style.display = 'none'; }, 3000);
}

/**
 * manejarSubmit
 * ¿Qué hace?: Valida el formulario y guarda o actualiza el registro.
 * ¿Por qué?: Evitar guardar datos inválidos y persistir la información.
 * Parámetros: e (evento submit).
 * Retorna: nada.
 */
function manejarSubmit(e){
  e.preventDefault(); // preventDefault() evita el comportamiento por defecto del formulario
  // Validar todos los campos
  var campos = [nombre, comunidad, produccion, producto, telefono, estado];
  var todoValido = true;
  for(var i=0;i<campos.length;i++){
    if(!validarCampo(campos[i])){ if(todoValido) campos[i].focus(); todoValido = false; }
  }
  if(!todoValido){ mostrarMensaje('Corrige los campos marcados.','error'); return; }

  var reg = crearRegistro();
  if(modoEdicion){
    registros = registros.map(function(r){ return r.id === idEnEdicion ? reg : r; });
    mostrarMensaje('Registro actualizado.', 'exito');
  } else {
    registros.push(reg);
    mostrarMensaje('Registro guardado.', 'exito');
  }
  guardarEnStorage();
  renderizarLista();
  limpiarFormulario();
}

// Eventos
document.addEventListener('DOMContentLoaded', function(){
  cargarDeStorage();
  form.addEventListener('submit', manejarSubmit);
  btnLimpiar.addEventListener('click', limpiarFormulario);
  nombre.addEventListener('input', function(e){ validarCampo(e.target); });
  produccion.addEventListener('input', function(e){ validarCampo(e.target); });
  telefono.addEventListener('input', function(e){ autoFormatearTelefono(e.target); validarCampo(e.target); });
  ['comunidad','producto','estado'].forEach(function(id){ document.getElementById(id).addEventListener('change', function(e){ validarCampo(e.target); }); });
});
