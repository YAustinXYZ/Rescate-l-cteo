/**
 * main.js
 * ¿Qué hace?: Carga una vista previa de productores y estadísticas desde el JSON.
 * ¿Por qué?: Mostrar datos dinámicos sin hardcodear en HTML.
 * Parámetros: ninguno (usa fetch para leer el JSON).
 * Retorna: nada (modifica el DOM).
 */

// Elementos del DOM que usaremos
var previewCont = document.getElementById('preview-productores');
var statsCont = document.getElementById('estadisticas');
var btnMasInfo = document.getElementById('btn-mas-info');
var infoAdicional = document.getElementById('info-adicional');

// Cargar los primeros 3 productores y las estadísticas
document.addEventListener('DOMContentLoaded', function() {
  fetch('./data/productores.json')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      renderPreview(data.slice(0,3));
      renderStats(data);
    })
    .catch(function(err) {
      // Mostrar mensaje simple en caso de error
      previewCont.innerHTML = '<p class="estado-vacio">No fue posible cargar los datos.</p>';
      console.error('Error cargando productores:', err);
    });
});

/**
 * renderPreview
 * ¿Qué hace?: Crea la vista previa con los primeros 3 productores.
 * ¿Por qué?: Dar un vistazo rápido en la página de inicio.
 * Parámetros: lista (array) de productores.
 * Retorna: nada.
 */
function renderPreview(lista) {
  previewCont.innerHTML = ''; // limpiar
  // createElement crea un elemento HTML desde JavaScript
  lista.forEach(function(p) {
    var item = document.createElement('div');
    item.className = 'preview-item';
    var badgeClass = p.estado === 'activo' ? 'badge-activo' : (p.estado === 'en dificultad' ? 'badge-dificultad' : 'badge-inactivo');
    item.innerHTML = '<h3>' + p.nombre + '</h3>' +
      '<p>' + p.comunidad + '</p>' +
      '<p><span class="badge ' + badgeClass + '">' + p.estado + '</span></p>';
    previewCont.appendChild(item); // appendChild agrega el elemento al contenedor
  });
}

/**
 * renderStats
 * ¿Qué hace?: Calcula y muestra estadísticas básicas de la comunidad.
 * ¿Por qué?: Informar al usuario sobre el alcance de la plataforma.
 * Parámetros: data (array) de productores.
 * Retorna: nada.
 */
function renderStats(data) {
  statsCont.innerHTML = '';
  var total = data.length;
  // filter() recorre el array y devuelve solo los que cumplen la condición
  var activos = data.filter(function(p){ return p.estado === 'activo'; }).length;
  // sumamos la producción diaria con un bucle simple
  var litros = data.reduce(function(acc, cur){ return acc + (Number(cur.produccionDiariaLitros) || 0); }, 0);
  // comunidades únicas
  var comunidades = data.reduce(function(acc, cur){ if(acc.indexOf(cur.comunidad) === -1) acc.push(cur.comunidad); return acc; }, []);

  var stats = [
    {num: total, label: 'Total productores'},
    {num: activos, label: 'Productores activos'},
    {num: litros, label: 'Total litros diarios'},
    {num: comunidades.length, label: 'Comunidades representadas'}
  ];

  stats.forEach(function(s){
    var card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = '<div class="stat-numero">' + s.num + '</div><div class="stat-label">' + s.label + '</div>';
    statsCont.appendChild(card);
  });
}

// Toggle para "más información"
btnMasInfo.addEventListener('click', function(){
  // classList.toggle cambia la visibilidad en el DOM
  infoAdicional.classList.toggle('visible');
  if(infoAdicional.style.display === 'none' || infoAdicional.style.display === '') {
    infoAdicional.style.display = 'block';
  } else {
    infoAdicional.style.display = 'none';
  }
});
