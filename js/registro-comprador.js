/**
 * registro-comprador.js
 * ¿Qué hace?: Gestiona el formulario de registro y la lista de compradores locales.
 */

var registrosCompradores = [];
var compradoresBase = [];
var modoEdicionComprador = false;
var idEnEdicionComprador = null;

var MENSAJES_ERROR_COMPRADOR = {
  nombre: 'El nombre debe tener al menos 3 caracteres.',
  produccion: 'Ingrese un valor entre 1 y 9999 litros.',
  telefono: 'El teléfono debe tener el formato ####-####.',
  correo: 'Ingrese un correo electrónico válido.',
  pin: 'El PIN debe tener exactamente 4 dígitos.',
  comunidad: 'Seleccione una región.',
  producto: 'Seleccione un producto buscado.',
  'lugar-especifico': 'Seleccione un lugar específico.'
};

var formComprador = document.getElementById('form-comprador');
var nombreComprador = document.getElementById('nombre');
var comunidadComprador = document.getElementById('comunidad');
var lugarEspecificoComprador = document.getElementById('lugar-especifico');
var campoLugarEspecificoComprador = document.getElementById('campo-lugar-especifico');
var produccionComprador = document.getElementById('produccion');
var productoComprador = document.getElementById('producto');
var campoProduccionComprador = document.getElementById('campo-produccion');
var telefonoComprador = document.getElementById('telefono');
var correoComprador = document.getElementById('correo');
var pinComprador = document.getElementById('pin');
var btnLimpiarComprador = document.getElementById('btn-limpiar');
var listaRegistrosCompradores = document.getElementById('lista-registros');
var formMensajeComprador = document.getElementById('form-mensaje');
var formEnlaceCompradores = document.getElementById('form-enlace-compradores');

function normalizarNombreComprador(texto) {
  return texto.trim().toLowerCase();
}

function cargarCompradoresBase() {
  return fetch('./data/compradores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) { compradoresBase = data; })
    .catch(function() { compradoresBase = []; });
}

function existeDuplicadoComprador(reg) {
  var nombreNorm = normalizarNombreComprador(reg.nombre);
  var telNorm = reg.contacto.trim();
  var correoNorm = reg.correo.trim().toLowerCase();

  function conflicto(p, excluirId) {
    if (excluirId !== null && p.id === excluirId) return false;
    return normalizarNombreComprador(p.nombre) === nombreNorm ||
      String(p.contacto).trim() === telNorm ||
      String((p.correo || '')).trim().toLowerCase() === correoNorm;
  }

  var excluir = modoEdicionComprador ? idEnEdicionComprador : null;
  var dupJson = compradoresBase.some(function(p) { return conflicto(p, excluir); });
  var dupLocal = registrosCompradores.some(function(r) { return conflicto(r, excluir); });

  return dupJson || dupLocal;
}

function validarCampoComprador(campo) {
  var id = campo.id;
  var val = campo.value.trim();
  var valido = true;
  if (id === 'nombre') {
    valido = val.length >= 3;
  } else if (id === 'produccion') {
    if (campoProduccionComprador && campoProduccionComprador.hidden) {
      valido = true;
    } else {
      var n = Number(val);
      valido = n > 0 && n <= 9999;
    }
  } else if (id === 'telefono') {
    valido = /^\d{4}-\d{4}$/.test(val);
  } else if (id === 'correo') {
    valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  } else if (id === 'comunidad' || id === 'producto') {
    valido = val !== '';
  } else if (id === 'lugar-especifico') {
    valido = !campoLugarEspecificoComprador || campoLugarEspecificoComprador.hidden || val !== '';
  } else if (id === 'pin') {
    valido = /^\d{4}$/.test(val);
  }

  var errorDiv = document.getElementById('error-' + id);
  if (!valido) {
    campo.classList.add('error');
    campo.classList.remove('valido');
    if (errorDiv) {
      errorDiv.classList.add('visible');
      errorDiv.textContent = MENSAJES_ERROR_COMPRADOR[id] || 'Campo inválido.';
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

function autoFormatearTelefonoComprador(campo) {
  var v = campo.value.replace(/[^0-9]/g, '');
  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4, 8);
  campo.value = v.slice(0, 9);
}

function crearRegistroComprador() {
  var id = modoEdicionComprador ? idEnEdicionComprador : Date.now();
  return {
    id: id,
    nombre: nombreComprador.value.trim(),
    comunidad: comunidadComprador.value,
    lugarEspecifico: lugarEspecificoComprador ? lugarEspecificoComprador.value : '',
    produccionDiariaLitros: productoComprador.value === 'Leche fresca' ? Number(produccionComprador.value) : 0,
    productosPrincipales: [productoComprador.value],
    descripcion: 'Comprador registrado desde la plataforma.',
    contacto: telefonoComprador.value,
    correo: correoComprador.value.trim(),
    pin: pinComprador.value.trim(),
    esLocal: true
  };
}

function guardarEnStorageCompradores() {
  localStorage.setItem('registros-compradores', JSON.stringify(registrosCompradores));
}

function cargarDeStorageCompradores() {
  var data = localStorage.getItem('registros-compradores');
  if (data) {
    try {
      registrosCompradores = JSON.parse(data);
    } catch (e) {
      registrosCompradores = [];
    }
  }
  renderizarListaCompradores();
}

function renderizarListaCompradores() {
  var header = '<h2>Registros guardados (' + registrosCompradores.length + ')</h2>';
  listaRegistrosCompradores.innerHTML = header;
  if (registrosCompradores.length === 0) {
    listaRegistrosCompradores.innerHTML += '<p class="estado-vacio">No hay registros aún.</p>';
    return;
  }
  registrosCompradores.forEach(function(r) {
    var item = document.createElement('div');
    item.className = 'item-registro';
    item.innerHTML = '<div><img class="avatar" src="assets/images/avatar-comprador.svg" alt="Avatar comprador"><div><strong>' + r.nombre + '</strong><div style="font-size:0.85rem;color:#555">' + r.comunidad + ' · ' + r.contacto + '</div></div></div>';
    var acciones = document.createElement('div');
    var btnEditar = document.createElement('button');
    btnEditar.textContent = '✏️ Editar';
    btnEditar.className = 'btn-secundario';
    btnEditar.setAttribute('aria-label', 'Editar registro de ' + r.nombre);
    btnEditar.addEventListener('click', function() { verificarAccionRegistroComprador(r.id, 'editar', function() { editarRegistroComprador(r.id); }); });
    var btnEliminar = document.createElement('button');
    btnEliminar.textContent = '🗑 Eliminar';
    btnEliminar.className = 'btn-peligro';
    btnEliminar.setAttribute('aria-label', 'Eliminar registro de ' + r.nombre);
    btnEliminar.addEventListener('click', function() { verificarAccionRegistroComprador(r.id, 'eliminar', function() { eliminarRegistroComprador(r.id); }); });
    acciones.appendChild(btnEditar);
    acciones.appendChild(document.createTextNode(' '));
    acciones.appendChild(btnEliminar);
    item.appendChild(acciones);
    listaRegistrosCompradores.appendChild(item);
  });
}

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

function eliminarRegistroComprador(id) {
  mostrarConfirmacion({
    titulo: 'Eliminar registro',
    mensaje: '¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.',
    confirmarTexto: 'Sí, eliminar',
    cancelarTexto: 'Cancelar'
  }, function(confirmado) {
    if (!confirmado) return;
    registrosCompradores = registrosCompradores.filter(function(r) { return r.id !== id; });
    guardarEnStorageCompradores();
    renderizarListaCompradores();
    ocultarEnlaceCompradores();
    mostrarMensajeComprador('Registro eliminado.', 'exito');
  });
}

function editarRegistroComprador(id) {
  var r = registrosCompradores.find(function(x) { return x.id === id; });
  if (!r) return;
  nombreComprador.value = r.nombre;
  comunidadComprador.value = r.comunidad;
  actualizarVisibilidadLugarComprador();
  if (lugarEspecificoComprador) {
    lugarEspecificoComprador.value = r.lugarEspecifico || '';
  }
  produccionComprador.value = r.produccionDiariaLitros;
  productoComprador.value = r.productosPrincipales[0] || '';
  telefonoComprador.value = r.contacto;
  correoComprador.value = r.correo || '';
  pinComprador.value = r.pin || '';
  modoEdicionComprador = true;
  idEnEdicionComprador = id;
  ocultarEnlaceCompradores();
  formMensajeComprador.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFormularioComprador() {
  formComprador.reset();
  [nombreComprador, comunidadComprador, produccionComprador, productoComprador, telefonoComprador, correoComprador, pinComprador, lugarEspecificoComprador].forEach(function(c) {
    if (c) c.classList.remove('error', 'valido');
  });
  actualizarVisibilidadProduccionComprador();
  actualizarVisibilidadLugarComprador();
  ['nombre', 'comunidad', 'produccion', 'producto', 'telefono', 'correo', 'pin', 'lugar-especifico'].forEach(function(id) {
    var errorDiv = document.getElementById('error-' + id);
    if (errorDiv) {
      errorDiv.classList.remove('visible');
      errorDiv.textContent = '';
    }
  });
  modoEdicionComprador = false;
  idEnEdicionComprador = null;
}

function limpiarFormularioComprador() {
  resetFormularioComprador();
  formMensajeComprador.style.display = 'none';
  formMensajeComprador.textContent = '';
  ocultarEnlaceCompradores();
  mostrarMensajeComprador('Formulario limpiado.', 'advertencia');
}

function actualizarVisibilidadProduccionComprador() {
  var mostrar = productoComprador.value === 'Leche fresca';
  if (campoProduccionComprador) {
    campoProduccionComprador.hidden = !mostrar;
  }
  if (!mostrar) {
    produccionComprador.value = '';
    produccionComprador.classList.remove('error', 'valido');
    var errorDiv = document.getElementById('error-produccion');
    if (errorDiv) {
      errorDiv.classList.remove('visible');
      errorDiv.textContent = '';
    }
  }
}

function obtenerOpcionesLugarEspecifico(region) {
  var opciones = {
    'Guanacaste Norte': ['Liberia', 'Santa Cruz', 'Nicoya', 'Carrillo', 'Bagaces', 'Cañas', 'Nandayure', 'Abangares', 'Hojancha', 'Tilarán', 'La Cruz'],
    'Guanacaste Sur': ['Tamarindo', 'Santa Rosa', 'Cañas Dulces', 'Sámara', 'Matapalo', 'Bebedero', 'Las Juntas', 'Canas', 'Playas del Coco', 'Palo Verde'],
    Puntarenas: ['Puntarenas', 'Esparza', 'Montes de Oro', 'Parrita', 'Corredores', 'Coto Brus', 'Garabito', 'Buenos Aires', 'Osa'],
    Alajuela: ['Alajuela', 'San Ramón', 'Grecia', 'Naranjo', 'Zarcero', 'Sarchí', 'Atenas', 'Palmares', 'Poás'],
    Heredia: ['Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro', 'Belén', 'Flores', 'San Pablo'],
    'San José': ['San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tibás', 'Moravia', 'Montes de Oca', 'Goicoechea', 'Santa Ana', 'Alajuelita']
  };
  return opciones[region] || [];
}

function actualizarVisibilidadLugarComprador() {
  if (!campoLugarEspecificoComprador || !lugarEspecificoComprador) return;
  var region = comunidadComprador.value;
  var mostrar = Boolean(region);
  campoLugarEspecificoComprador.hidden = !mostrar;
  if (!mostrar) {
    lugarEspecificoComprador.innerHTML = '<option value="">Seleccione...</option>';
    lugarEspecificoComprador.value = '';
    return;
  }

  var opciones = obtenerOpcionesLugarEspecifico(region);
  var html = '<option value="">Seleccione...</option>';
  opciones.forEach(function(opcion) {
    html += '<option value="' + opcion + '">' + opcion + '</option>';
  });
  lugarEspecificoComprador.innerHTML = html;

  var valorActual = lugarEspecificoComprador.value;
  if (valorActual && opciones.indexOf(valorActual) !== -1) {
    lugarEspecificoComprador.value = valorActual;
  } else {
    lugarEspecificoComprador.value = '';
  }
}

function mostrarEnlaceCompradores() {
  if (formEnlaceCompradores) formEnlaceCompradores.hidden = false;
}

function ocultarEnlaceCompradores() {
  if (formEnlaceCompradores) formEnlaceCompradores.hidden = true;
}

function mostrarMensajeComprador(texto, tipo) {
  formMensajeComprador.className = 'mensaje visible ' + (tipo === 'exito' ? 'mensaje-exito' : (tipo === 'error' ? 'mensaje-error' : 'mensaje-advertencia'));
  formMensajeComprador.textContent = texto;
  formMensajeComprador.style.display = 'block';
  setTimeout(function() { formMensajeComprador.style.display = 'none'; }, 4000);
}

function manejarSubmitComprador(e) {
  e.preventDefault();
  ocultarEnlaceCompradores();

  var campos = [nombreComprador, comunidadComprador, productoComprador, telefonoComprador, correoComprador, pinComprador];
  if (!campoProduccionComprador || !campoProduccionComprador.hidden) {
    campos.splice(2, 0, produccionComprador);
  }
  if (lugarEspecificoComprador && !campoLugarEspecificoComprador.hidden) {
    campos.splice(2, 0, lugarEspecificoComprador);
  }
  var todoValido = true;
  for (var i = 0; i < campos.length; i++) {
    if (!validarCampoComprador(campos[i])) {
      if (todoValido) campos[i].focus();
      todoValido = false;
    }
  }
  if (!todoValido) {
    mostrarMensajeComprador('Corrige los campos marcados.', 'error');
    return;
  }

  var reg = crearRegistroComprador();
  if (existeDuplicadoComprador(reg)) {
    mostrarMensajeComprador('Ya existe un comprador con ese nombre, teléfono o correo.', 'error');
    return;
  }

  if (modoEdicionComprador) {
    registrosCompradores = registrosCompradores.map(function(r) { return r.id === idEnEdicionComprador ? reg : r; });
    mostrarMensajeComprador('Registro actualizado correctamente.', 'exito');
  } else {
    registrosCompradores.push(reg);
    mostrarMensajeComprador('Registro guardado. Ya aparece en el listado y contador de compradores.', 'exito');
    mostrarEnlaceCompradores();
  }

  guardarEnStorageCompradores();
  renderizarListaCompradores();
  resetFormularioComprador();
}

function cargarDatosInicialesComprador() {
  cargarCompradoresBase().then(function() {
    cargarDeStorageCompradores();
  });
  formComprador.addEventListener('submit', manejarSubmitComprador);
  btnLimpiarComprador.addEventListener('click', limpiarFormularioComprador);
  nombreComprador.addEventListener('input', function(e) { validarCampoComprador(e.target); });
  produccionComprador.addEventListener('input', function(e) { validarCampoComprador(e.target); });
  telefonoComprador.addEventListener('input', function(e) { autoFormatearTelefonoComprador(e.target); validarCampoComprador(e.target); });
  correoComprador.addEventListener('input', function(e) { validarCampoComprador(e.target); });
  pinComprador.addEventListener('input', function(e) { validarCampoComprador(e.target); });
  productoComprador.addEventListener('change', function(e) {
    actualizarVisibilidadProduccionComprador();
    validarCampoComprador(e.target);
  });
  comunidadComprador.addEventListener('change', function(e) {
    actualizarVisibilidadLugarComprador();
    validarCampoComprador(e.target);
  });
  if (lugarEspecificoComprador) {
    lugarEspecificoComprador.addEventListener('change', function(e) { validarCampoComprador(e.target); });
  }
  actualizarVisibilidadProduccionComprador();
  actualizarVisibilidadLugarComprador();
}

function verificarAccionRegistroComprador(id, accion, callback) {
  var registro = registrosCompradores.find(function(r) { return r.id === id; });
  if (!registro) return;

  var modal = document.createElement('div');
  modal.className = 'modal-overlay';
  var box = document.createElement('div');
  box.className = 'modal-box';

  var titulo = document.createElement('h3');
  titulo.textContent = accion === 'editar' ? 'Verificación para editar' : 'Verificación para eliminar';

  var mensaje = document.createElement('p');
  var permiteLitros = Number(registro.produccionDiariaLitros) > 0;
  mensaje.textContent = 'Ingresa tu PIN de 4 dígitos.' + (permiteLitros ? ' Si lo olvidaste, ingresa la cantidad de litros de leche registrada.' : '');

  var input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 4;
  input.inputMode = 'numeric';
  input.placeholder = 'PIN o litros';
  input.className = 'modal-input';

  var ayuda = document.createElement('p');
  ayuda.className = 'modal-subtext';
  ayuda.textContent = permiteLitros ? 'PIN de seguridad o litros de leche producidos para validar tu registro.' : 'PIN de seguridad para validar tu registro.';

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
    var validoLitros = permiteLitros && Number(valor) === Number(registro.produccionDiariaLitros);
    if (valor !== '' && (validoPin || validoLitros)) {
      cerrar(true);
    } else {
      error.textContent = permiteLitros ? 'PIN o litros incorrectos. Intenta nuevamente.' : 'PIN incorrecto. Intenta nuevamente.';
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
    if (confirmado) callback();
  }

  modal.addEventListener('click', function(e) {
    if (e.target === modal) cerrar(false);
  });

  document.body.appendChild(modal);
}

document.addEventListener('DOMContentLoaded', cargarDatosInicialesComprador);
