/**
 * main.js
 * ¿Qué hace?: Carga una vista previa de productores y estadísticas combinando
 *             el JSON base con los registros guardados en localStorage.
 * ¿Por qué?: Mostrar datos dinámicos sin hardcodear en HTML, incluyendo
 *             los productores registrados por el usuario.
 * Parámetros: ninguno.
 * Retorna: nada (modifica el DOM).
 */

// Elementos del DOM que usaremos
var previewCont = document.getElementById('preview-productores');
var statsCont = document.getElementById('estadisticas');
var btnMasInfo = document.getElementById('btn-mas-info');
var infoAdicional = document.getElementById('info-adicional');
var historiasCont = document.getElementById('historias-productores');

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
  // Los IDs del JSON son números pequeños (1–12); los locales usan Date.now() (13 dígitos)
  // No habrá colisiones, pero filtramos por si acaso
  var idsJson = jsonData.map(function(p) { return p.id; });
  var soloNuevos = locales.filter(function(p) { return idsJson.indexOf(p.id) === -1; });
  return jsonData.concat(soloNuevos);
}

// Cargar los primeros 3 productores y las estadísticas
document.addEventListener('DOMContentLoaded', function() {
  if (historiasCont) {
    renderHistorias();
  }

  if (!previewCont || !statsCont) {
    if (btnMasInfo && infoAdicional) {
      btnMasInfo.addEventListener('click', function(e) {
        e.preventDefault();
        infoAdicional.classList.toggle('visible');
        if (infoAdicional.classList.contains('visible')) {
          btnMasInfo.textContent = '📖 Ver menos información';
        } else {
          btnMasInfo.textContent = '📖 Ver más información';
        }
      });
    }
    return;
  }

  fetch('./data/productores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var todos = combinarProductores(data);
      var paraPreview = todos.slice().sort(function(a, b) {
        if (esProductorLocal(a) && !esProductorLocal(b)) return -1;
        if (!esProductorLocal(a) && esProductorLocal(b)) return 1;
        return 0;
      });
      renderPreview(paraPreview.slice(0, 3));
      renderStats(todos);
    })
    .catch(function(err) {
      // Si el fetch falla, al menos mostramos los locales
      var locales = obtenerRegistrosLocales();
      if (locales.length > 0) {
        renderPreview(locales.slice(0, 3));
        renderStats(locales);
      } else {
        previewCont.innerHTML = '<p class="estado-vacio">No fue posible cargar los datos.</p>';
      }
      console.error('Error cargando productores:', err);
    });
});

function esProductorLocal(p) {
  return p.esLocal === true || p.id > 100;
}

/**
 * renderPreview
 * ¿Qué hace?: Crea la vista previa con los primeros 3 productores.
 * ¿Por qué?: Dar un vistazo rápido en la página de inicio.
 * Parámetros: lista (array) de productores.
 * Retorna: nada.
 */
function renderPreview(lista) {
  if (!previewCont) return;
  previewCont.innerHTML = '';
  lista.forEach(function(p) {
    var item = document.createElement('div');
    item.className = 'preview-item';
    var condicion = p.condicion || p.estado;
    var badgeClass = condicion === 'estable' ? 'badge-activo' : (condicion === 'en crisis' ? 'badge-dificultad' : 'badge-inactivo');
    var badgeNuevo = esProductorLocal(p) ? ' <span class="badge badge-nuevo">Nuevo</span>' : '';
    item.innerHTML = '<h3>' + p.nombre + badgeNuevo + '</h3>' +
      '<p>' + p.comunidad + '</p>' +
      '<p><span class="badge ' + badgeClass + '">' + condicion + '</span></p>';
    previewCont.appendChild(item);
  });
}

/**
 * renderStats
 * ¿Qué hace?: Calcula y muestra estadísticas básicas de la comunidad.
 * ¿Por qué?: Informar al usuario sobre el alcance de la plataforma.
 * Parámetros: data (array) de productores (JSON + locales combinados).
 * Retorna: nada.
 */
function renderStats(data) {
  if (!statsCont) return;
  statsCont.innerHTML = '';
  var total = data.length;
  var activos = data.filter(function(p) { return p.condicion === 'estable'; }).length;
  var litros = data.reduce(function(acc, cur) { return acc + (Number(cur.produccionDiariaLitros) || 0); }, 0);
  var comunidades = data.reduce(function(acc, cur) {
    if (acc.indexOf(cur.comunidad) === -1) acc.push(cur.comunidad);
    return acc;
  }, []);

  var stats = [
    { num: total,             label: 'Total productores' },
    { num: activos,           label: 'Productores activos' },
    { num: litros,            label: 'Total litros diarios' },
    { num: comunidades.length, label: 'Comunidades representadas' }
  ];

  stats.forEach(function(s) {
    var card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = '<div class="stat-numero">' + s.num + '</div><div class="stat-label">' + s.label + '</div>';
    statsCont.appendChild(card);
  });
}

function renderHistorias() {
  if (!historiasCont) return;
  var historias = [];
  var historiaBase = {
    id: 'destacada-1',
    nombre: 'Don Manuel',
    comunidad: 'Cabeceras de Tilarán',
    historia: 'Durante años trabajó con la empresa SIGMA, entregando su esfuerzo diario a la lechería para sostener a su familia. Cuando la empresa decidió dejarlo a “pata” por decisiones que no consideraron su necesidad, él siguió adelante con dignidad, porque nunca estudió una carrera y su trabajo era su única forma de sostener a los suyos.'
  };
  historias.push(historiaBase);

  var locales = obtenerRegistrosLocales();
  locales.forEach(function(p) {
    if (p.historia && p.historia.trim()) {
      historias.push({
        id: 'local-' + p.id,
        nombre: p.nombre,
        comunidad: p.comunidad,
        historia: p.historia
      });
    }
  });

  historiasCont.innerHTML = '';

  var tarjetaPrincipal = document.createElement('div');
  tarjetaPrincipal.className = 'noticia-item';
  tarjetaPrincipal.innerHTML = '<img src="assets/images/logo.png" alt="Logo de Rescate Lácteo">' +
    '<div class="noticia-contenido">' +
    '<h3>Rescate Lácteo</h3>' +
    '<p class="noticia-meta">Conectamos productores y compradores</p>' +
    '<p>Nosotros trabajamos para visibilizar la realidad de los productores lecheros, apoyar su comercialización y fortalecer su voz en la cadena. Aquí acompañamos historias de esfuerzo, dignidad y esperanza para que no queden solas.</p>' +
    '</div>';
  historiasCont.appendChild(tarjetaPrincipal);

  historias.forEach(function(h, index) {
    var item = document.createElement('div');
    item.className = 'noticia-item';
    var imagen = 'assets/images/campesino-' + ((index % 5) + 1) + '.jpg';
    item.innerHTML = '<img src="' + imagen + '" alt="Foto de ' + h.nombre + '">' +
      '<div class="noticia-contenido">' +
      '<h3>' + h.nombre + '</h3>' +
      '<p class="noticia-meta">' + h.comunidad + '</p>' +
      '<p>' + h.historia + '</p>' +
      '</div>';
    historiasCont.appendChild(item);
  });
}

// Evento del botón interactivo
if (btnMasInfo && infoAdicional) {
  btnMasInfo.addEventListener('click', function(e) {
    e.preventDefault();
    infoAdicional.classList.toggle('visible');
    if (infoAdicional.classList.contains('visible')) {
      btnMasInfo.textContent = '📖 Ver menos información';
    } else {
      btnMasInfo.textContent = '📖 Ver más información';
    }
  });
}