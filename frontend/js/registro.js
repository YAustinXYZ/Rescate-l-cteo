/**
 * registro.js
 * ¿Qué hace?: Gestiona el formulario de registro y la lista de registros locales.
 * ¿Por qué?: Permitir crear, editar, validar y persistir registros de productores.
 * Parámetros: ninguno (usa el DOM y localStorage).
 * Retorna: nada.
 */

var registros = [];
var productoresBase = [];
var modoEdicion = false;
var idEnEdicion = null;

var MENSAJES_ERROR = {
  nombre: 'El nombre debe tener al menos 3 caracteres.',
  produccion: 'Ingrese un valor entre 1 y 9999 litros.',
  telefono: 'El teléfono debe tener el formato ####-####.',
  correo: 'Ingrese un correo electrónico válido.',
  pin: 'El PIN debe tener exactamente 4 dígitos.',
  comunidad: 'Seleccione una comunidad.',
  producto: 'Seleccione un producto principal.',
  condicion: 'Seleccione una condición.'
};

// Elementos DOM
var form = document.getElementById('form-productor');
var nombre = document.getElementById('nombre');
var comunidad = document.getElementById('comunidad');
var produccion = document.getElementById('produccion');
var producto = document.getElementById('producto');
var telefono = document.getElementById('telefono');
var correo = document.getElementById('correo');
var pin = document.getElementById('pin');
var condicion = document.getElementById('condicion');
var historia = document.getElementById('historia');
var btnLimpiar = document.getElementById('btn-limpiar');
var listaRegistros = document.getElementById('lista-registros');
var formMensaje = document.getElementById('form-mensaje');
var formEnlace = document.getElementById('form-enlace-productores');

/**
 * normalizarNombre
 * ¿Qué hace?: Normaliza un nombre para comparación de duplicados.
 * ¿Por qué?: Evitar registros repetidos ignorando mayúsculas y espacios.
 * Parámetros: texto (string).
 * Retorna: string normalizado.
 */
function normalizarNombre(texto) {
  return texto.trim().toLowerCase();
}

/**
 * cargarProductoresBase
 * ¿Qué hace?: Carga el JSON base para validar duplicados contra productores existentes.
 * ¿Por qué?: No permitir registrar nombres o teléfonos ya usados en la plataforma.
 * Parámetros: ninguno.
 * Retorna: Promise.
 */
function cargarProductoresBase() {
  return fetch('./data/productores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) { productoresBase = data; })
    .catch(function() { productoresBase = []; });
}

/**
 * existeDuplicado
 * ¿Qué hace?: Verifica si ya existe un productor con el mismo nombre o teléfono.
 * ¿Por qué?: Prevenir datos repetidos en JSON y localStorage.
 * Parámetros: reg (objeto registro).
 * Retorna: boolean.
 */
function existeDuplicado(reg) {
  var nombreNorm = normalizarNombre(reg.nombre);
  var telNorm = reg.contacto.trim();
  var correoNorm = reg.correo.trim().toLowerCase();

  function conflicto(p, excluirId) {
    if (excluirId !== null && p.id === excluirId) return false;
    return normalizarNombre(p.nombre) === nombreNorm ||
      String(p.contacto).trim() === telNorm ||
      String((p.correo || '')).trim().toLowerCase() === correoNorm;
  }

  var excluir = modoEdicion ? idEnEdicion : null;
  var dupJson = productoresBase.some(function(p) { return conflicto(p, excluir); });
  var dupLocal = registros.some(function(r) { return conflicto(r, excluir); });

  return dupJson || dupLocal;
}

/**
 * validarCampo
 * ¿Qué hace?: Valida un campo individual y aplica clases de error/valido.
 * ¿Por qué?: Dar feedback en tiempo real al usuario.
 * Parámetros: campo (elemento input/select).
 * Retorna: boolean (true si válido).
 */
function validarCampo(campo) {
  var id = campo.id;
  var val = campo.value.trim();
  var valido = true;
  if (id === 'nombre') {
    valido = val.length >= 3;
  } else if (id === 'produccion') {
    var n = Number(val);
    valido = n > 0 && n <= 9999;
  } else if (id === 'telefono') {
    valido = /^\d{4}-\d{4}$/.test(val);
  } else if (id === 'correo') {
    valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  } else if (id === 'pin') {
    valido = /^\d{4}$/.test(val);
  } else if (id === 'comunidad' || id === 'producto' || id === 'condicion') {
    valido = val !== '';
  }

  var errorDiv = document.getElementById('error-' + id);
  if (!valido) {
    campo.classList.add('error');
    campo.classList.remove('valido');
    if (errorDiv) {
      errorDiv.classList.add('visible');
      errorDiv.textContent = MENSAJES_ERROR[id] || 'Campo inválido.';
    }
  } else {
    campo.classList.remove('error');
    campo.classList.add('valido');
    if (errorDiv) {
      errorDiv.classList.remove('visible');
      errorDiv.textContent = '';
    }
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
function autoFormatearTelefono(campo) {
  var v = campo.value.replace(/[^0-9]/g, '');
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4, 8);
  campo.value = v.slice(0, 9);
}

/**
 * crearRegistro
 * ¿Qué hace?: Construye un objeto registro desde los campos del formulario.
 * ¿Por qué?: Generar la estructura que se guardará en localStorage.
 * Parámetros: ninguno.
 * Retorna: objeto registro.
 */
function crearRegistro() {
  var id = modoEdicion ? idEnEdicion : Date.now();
  return {
    id: id,
    nombre: nombre.value.trim(),
    comunidad: comunidad.value,
    produccionDiariaLitros: Number(produccion.value),
    productosPrincipales: [producto.value],
    condicion: condicion.value,
    descripcion: 'Productor registrado desde la plataforma.',
    contacto: telefono.value,
    correo: correo.value.trim(),
    pin: pin.value.trim(),
    historia: historia.value.trim(),
    esLocal: true
  };
}

/**
 * guardarEnStorage
 * ¿Qué hace?: Persiste el array de registros en localStorage.
 * ¿Por qué?: Mantener datos entre recargas y reflejarlos en otras páginas.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function guardarEnStorage() {
  localStorage.setItem('registros-lacteo', JSON.stringify(registros));
}

/**
 * cargarDeStorage
 * ¿Qué hace?: Recupera registros desde localStorage al cargar la página.
 * ¿Por qué?: Inicializar la vista con datos previos.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function cargarDeStorage() {
  var data = localStorage.getItem('registros-lacteo');
  if (data) {
    try {
      registros = JSON.parse(data);
    } catch (e) {
      registros = [];
    }
  }
  renderizarLista();
}

/**
 * renderizarLista
 * ¿Qué hace?: Muestra los registros en la columna derecha.
 * ¿Por qué?: Permitir editar/eliminar registros.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function renderizarLista() {
  var header = '<h2>Registros guardados (' + registros.length + ')</h2>';
  listaRegistros.innerHTML = header;
  if (registros.length === 0) {
    listaRegistros.innerHTML += '<p class="estado-vacio">No hay registros aún.</p>';
    return;
  }
  registros.forEach(function(r) {
    var item = document.createElement('div');
    item.className = 'item-registro';
    item.innerHTML = '<div><img class="avatar" src="assets/images/avatar-productor.svg" alt="Avatar productor"><div><strong>' + r.nombre + '</strong><div style="font-size:0.85rem;color:#555">' + r.comunidad + ' · ' + r.contacto + '</div></div></div>';
    var acciones = document.createElement('div');
    var btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️ Editar';
    btnEditar.className = 'btn-secundario';
    btnEditar.setAttribute('aria-label', 'Editar registro de ' + r.nombre);
    btnEditar.addEventListener('click', function() { verificarAccionRegistro(r.id, 'editar', function() { editarRegistro(r.id); }); });
    var btnEliminar = document.createElement('button');
    btnEliminar.textContent = '🗑 Eliminar';
    btnEliminar.className = 'btn-peligro';
    btnEliminar.setAttribute('aria-label', 'Eliminar registro de ' + r.nombre);
    btnEliminar.addEventListener('click', function() { verificarAccionRegistro(r.id, 'eliminar', function() { eliminarRegistro(r.id); }); });
    acciones.appendChild(btnEditar);
    acciones.appendChild(document.createTextNode(' '));
    acciones.appendChild(btnEliminar);
    item.appendChild(acciones);
    listaRegistros.appendChild(item);
  });
}

/**
 * mostrarConfirmacion
 * ¿Qué hace?: Muestra una confirmación modal con estilo de la aplicación.
 * ¿Por qué?: Reemplazar el cuadro nativo confirm() por una experiencia más consistente.
 * Parámetros: opciones (objeto), callback (function).
 * Retorna: nada.
 */
function mostrarConfirmacion(opciones, callback) {
  var modal = document.createElement('div');
  modal.className = 'modal-overlay';

  var box = document.createElement('div');
  box.className = 'modal-box';

  var titulo = document.createElement('h3');
  titulo.textContent = opciones.titulo || 'Confirmación';

  var mensaje = document.createElement('p');
  mensaje.textContent = opciones.mensaje || '';

  var acciones = document.createElement('div');
  acciones.className = 'modal-actions';

  var btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.className = 'btn-secundario';
  btnCancelar.textContent = opciones.cancelarTexto || 'Cancelar';
  btnCancelar.addEventListener('click', function() {
    cerrar(false);
  });

  var btnConfirmar = document.createElement('button');
  btnConfirmar.type = 'button';
  btnConfirmar.className = 'btn-peligro';
  btnConfirmar.textContent = opciones.confirmarTexto || 'Confirmar';
  btnConfirmar.addEventListener('click', function() {
    cerrar(true);
  });

  acciones.appendChild(btnCancelar);
  acciones.appendChild(btnConfirmar);
  box.appendChild(titulo);
  box.appendChild(mensaje);
  box.appendChild(acciones);
  modal.appendChild(box);

  var cerrado = false;
  function cerrar(confirmado) {
    if (cerrado) return;
    cerrado = true;
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    callback(confirmado);
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      cerrar(false);
    }
  });

  document.body.appendChild(modal);
}

function verificarAccionRegistro(id, accion, callback) {
  var registro = registros.find(function(r) { return r.id === id; });
  if (!registro) return;
  var modal = document.createElement('div');
  modal.className = 'modal-overlay';

  var box = document.createElement('div');
  box.className = 'modal-box';

  var titulo = document.createElement('h3');
  titulo.textContent = accion === 'editar' ? 'Verificación para editar' : 'Verificación para eliminar';

  var mensaje = document.createElement('p');
  mensaje.textContent = 'Ingresa tu PIN de 4 dígitos. Si lo olvidaste, ingresa la cantidad de litros de leche registrada.';

  var input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 4;
  input.placeholder = 'PIN o litros';
  input.className = 'modal-input';

  var ayuda = document.createElement('p');
  ayuda.className = 'modal-subtext';
  ayuda.textContent = 'PIN de seguridad o litros de leche producidos para validar tu registro.';

  var error = document.createElement('p');
  error.className = 'modal-error';

  var acciones = document.createElement('div');
  acciones.className = 'modal-actions';

  var btnCancelar = document.createElement('button');
  btnCancelar.type = 'button';
  btnCancelar.className = 'btn-secundario';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.addEventListener('click', function() {
    cerrar(false);
  });

  var btnConfirmar = document.createElement('button');
  btnConfirmar.type = 'button';
  btnConfirmar.className = 'btn-primario';
  btnConfirmar.textContent = 'Verificar';
  btnConfirmar.addEventListener('click', function() {
    var valor = input.value.trim();
    var validoPin = valor === registro.pin;
    var validoLitros = Number(valor) === Number(registro.produccionDiariaLitros);
    if (valor !== '' && (validoPin || validoLitros)) {
      cerrar(true);
    } else {
      error.textContent = 'PIN o litros incorrectos. Intenta nuevamente.';
    }
  });

  acciones.appendChild(btnCancelar);
  acciones.appendChild(btnConfirmar);
  box.appendChild(titulo);
  box.appendChild(mensaje);
  box.appendChild(input);
  box.appendChild(ayuda);
  box.appendChild(error);
  box.appendChild(acciones);
  modal.appendChild(box);

  var cerrado = false;
  function cerrar(confirmado) {
    if (cerrado) return;
    cerrado = true;
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    if (confirmado) {
      callback();
    }
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrar(false);
  });

  document.body.appendChild(modal);
}

/**
 * eliminarRegistro
 * ¿Qué hace?: Elimina un registro después de confirmar.
 * ¿Por qué?: Permitir al usuario gestionar sus registros.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function eliminarRegistro(id) {
  mostrarConfirmacion({
    titulo: 'Eliminar registro',
    mensaje: '¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.',
    confirmarTexto: 'Sí, eliminar',
    cancelarTexto: 'Cancelar'
  }, function(confirmado) {
    if (!confirmado) return;
    registros = registros.filter(function(r) { return r.id !== id; });
    guardarEnStorage();
    renderizarLista();
    ocultarEnlaceProductores();
    mostrarMensaje('Registro eliminado.', 'exito');
  });
}

/**
 * editarRegistro
 * ¿Qué hace?: Rellena el formulario con los datos del registro para editar.
 * ¿Por qué?: Reutilizar el mismo formulario en modo edición.
 * Parámetros: id (number).
 * Retorna: nada.
 */
function editarRegistro(id) {
  var r = registros.find(function(x) { return x.id === id; });
  if (!r) return;
  nombre.value = r.nombre;
  comunidad.value = r.comunidad;
  produccion.value = r.produccionDiariaLitros;
  producto.value = r.productosPrincipales[0] || '';
  telefono.value = r.contacto;
  correo.value = r.correo || '';
  pin.value = r.pin || '';
  condicion.value = r.condicion || (r.estado === 'activo' ? 'estable' : (r.estado === 'en dificultad' ? 'en crisis' : (r.estado === 'inactivo' ? 'vulnerabilidad' : '')));
  historia.value = r.historia || '';
  modoEdicion = true;
  idEnEdicion = id;
  ocultarEnlaceProductores();
  formMensaje.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * resetFormulario
 * ¿Qué hace?: Resetea campos y estados sin mostrar mensajes.
 * ¿Por qué?: Limpiar el formulario tras guardar sin confundir al usuario.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function resetFormulario() {
  form.reset();
  [nombre, comunidad, produccion, producto, telefono, correo, pin, condicion].forEach(function(c) {
    c.classList.remove('error', 'valido');
  });
  ['nombre', 'comunidad', 'produccion', 'producto', 'telefono', 'correo', 'pin', 'condicion'].forEach(function(id) {
    var errorDiv = document.getElementById('error-' + id);
    if (errorDiv) {
      errorDiv.classList.remove('visible');
      errorDiv.textContent = '';
    }
  });
  modoEdicion = false;
  idEnEdicion = null;
}

/**
 * limpiarFormulario
 * ¿Qué hace?: Resetea el formulario y avisa al usuario.
 * ¿Por qué?: Permitir empezar con campos limpios manualmente.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function limpiarFormulario() {
  resetFormulario();
  formMensaje.style.display = 'none';
  formMensaje.textContent = '';
  ocultarEnlaceProductores();
  mostrarMensaje('Formulario limpiado.', 'advertencia');
}

/**
 * mostrarEnlaceProductores
 * ¿Qué hace?: Muestra el enlace para ver el registro en la página de productores.
 * ¿Por qué?: Guiar al usuario hacia el listado actualizado con contador.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function mostrarEnlaceProductores() {
  if (formEnlace) formEnlace.hidden = false;
}

/**
 * ocultarEnlaceProductores
 * ¿Qué hace?: Oculta el enlace post-registro.
 * Parámetros: ninguno.
 * Retorna: nada.
 */
function ocultarEnlaceProductores() {
  if (formEnlace) formEnlace.hidden = true;
}

/**
 * mostrarMensaje
 * ¿Qué hace?: Muestra mensajes transitorios de exito/error/advertencia.
 * ¿Por qué?: Retroalimentar al usuario.
 * Parámetros: texto (string), tipo (string).
 * Retorna: nada.
 */
function mostrarMensaje(texto, tipo) {
  formMensaje.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  formMensaje.textContent = texto;
  formMensaje.style.display = 'block';
  setTimeout(function() { formMensaje.style.display = 'none'; }, 4000);
}

/**
 * manejarSubmit
 * ¿Qué hace?: Valida el formulario y guarda o actualiza el registro.
 * ¿Por qué?: Evitar guardar datos inválidos o duplicados y persistir la información.
 * Parámetros: e (evento submit).
 * Retorna: nada.
 */
function manejarSubmit(e) {
  e.preventDefault();
  ocultarEnlaceProductores();

  var campos = [nombre, comunidad, produccion, producto, telefono, correo, pin, condicion];
  var todoValido = true;
  for (var i = 0; i < campos.length; i++) {
    if (!validarCampo(campos[i])) {
      if (todoValido) campos[i].focus();
      todoValido = false;
    }
  }
  if (!todoValido) {
    mostrarMensaje('Corrige los campos marcados.', 'error');
    return;
  }

  var reg = crearRegistro();

  if (existeDuplicado(reg)) {
    mostrarMensaje('Ya existe un productor con ese nombre, teléfono o correo.', 'error');
    return;
  }

  if (modoEdicion) {
    registros = registros.map(function(r) { return r.id === idEnEdicion ? reg : r; });
    mostrarMensaje('Registro actualizado correctamente.', 'exito');
  } else {
    registros.push(reg);
    mostrarMensaje('Registro guardado. Ya aparece en el listado y contador de productores.', 'exito');
    mostrarEnlaceProductores();
  }

  guardarEnStorage();
  renderizarLista();
  resetFormulario();
}

// Eventos
document.addEventListener('DOMContentLoaded', function() {
  cargarProductoresBase().then(function() {
    cargarDeStorage();
  });
  form.addEventListener('submit', manejarSubmit);
  btnLimpiar.addEventListener('click', limpiarFormulario);
  nombre.addEventListener('input', function(e) { validarCampo(e.target); });
  produccion.addEventListener('input', function(e) { validarCampo(e.target); });
  telefono.addEventListener('input', function(e) { autoFormatearTelefono(e.target); validarCampo(e.target); });
  correo.addEventListener('input', function(e) { validarCampo(e.target); });
  pin.addEventListener('input', function(e) { validarCampo(e.target); });
  ['comunidad', 'producto', 'condicion'].forEach(function(id) {
    document.getElementById(id).addEventListener('change', function(e) { validarCampo(e.target); });
  });
});
