let userLocationLayer = null;
function toggleSidepanel() {
  const panel = document.getElementById('sidepanel');
  const button = document.getElementById('sidepanel-toggle');
  panel.classList.toggle('closed');
  button.innerHTML = panel.classList.contains('closed') ? '➤' : '❮';
}

const baseLayers = {
  osm: new ol.layer.Tile({ source: new ol.source.OSM() }),
  darkLayer: new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}' }) }),
  satLayer: new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' }) }),
  stamenWatercolor: new ol.layer.Tile({ source: new ol.source.XYZ({ url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg' }) })
};

let currentBase = baseLayers.osm;

const map = new ol.Map({
  target: 'map',
  layers: [currentBase],
  view: new ol.View({ center: ol.proj.fromLonLat([-72.5569, 46.3458]), zoom: 12 })
});

function addVectorLayer(url, style) {
  return new ol.layer.Vector({ source: new ol.source.Vector({ url, format: new ol.format.GeoJSON() }), style });
}

const parcs = addVectorLayer('data/parc.geojson', new ol.style.Style({
  image: new ol.style.Icon({ anchor: [0.5, 1], src: 'icons/parc_icon.png', scale: 0.05 })
}));

const poiSource = new ol.source.Vector({
  url: 'data/poi.geojson',
  format: new ol.format.GeoJSON()
});

const poiLayer = new ol.layer.Vector({
  source: poiSource,
  style: feature => {
    const type = feature.get('amenity');
    const rentalChecked = document.getElementById('chkRental').checked;
    const repairChecked = document.getElementById('chkRepair').checked;
    const parkingChecked = document.getElementById('chkParking').checked;

    if ((type === 'bicycle_rental' && rentalChecked) ||
        (type === 'bicycle_repair_station' && repairChecked) ||
        (type === 'bicycle_parking' && parkingChecked)) {
      let icon = 'poi.png';
      if (type === 'bicycle_rental') icon = 'icons/rental.png';
      else if (type === 'bicycle_repair_station') icon = 'icons/repair.png';
      else if (type === 'bicycle_parking') icon = 'icons/parking.png';

      return new ol.style.Style({
        image: new ol.style.Icon({ src: icon, scale: 0.05, anchor: [0.5, 1] })
      });
    }
    return null;
  }
});

const pistes = addVectorLayer('data/piste_cyclable.geojson', new ol.style.Style({
  stroke: new ol.style.Stroke({ color: 'blue', width: 2 })
}));

const routes = addVectorLayer('data/reseau_routier.geojson', new ol.style.Style({  // <-- corrigé ici
  stroke: new ol.style.Stroke({ color: 'gray', width: 1 })
}));

const limites = addVectorLayer('data/limite.geojson', new ol.style.Style({
  stroke: new ol.style.Stroke({ color: 'red', width: 2 })
}));

const densite = new ol.layer.Vector({
  source: new ol.source.Vector({ url: 'data/dmti.geojson', format: new ol.format.GeoJSON() }),
  style: feature => {
    const d = feature.get('POP_DENS');
    let color = d > 4000 ? 'rgba(128,0,38,0.3)' :
                d > 2000 ? 'rgba(189,0,38,0.3)' :
                d > 1000 ? 'rgba(227,26,28,0.3)' :
                d > 500  ? 'rgba(252,78,42,0.3)' :
                           'rgba(254,178,76,0.3)';
    return new ol.style.Style({
      fill: new ol.style.Fill({ color }),
      stroke: new ol.style.Stroke({ color: '#999', width: 0.5 })
    });
  }
});

map.addLayer(parcs);
map.addLayer(poiLayer);
map.addLayer(pistes);
map.addLayer(routes);
map.addLayer(limites);
map.addLayer(densite);

const wmsPistes = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://igeomedia.com/geoserver/Projet_session_DIA/wms',
    params: {
      'LAYERS': 'Projet_session_DIA:piste_cyclable',
      'TILED': true,
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver',
    transition: 0
  }),
  visible: false
});

const wmsRoutes = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://igeomedia.com/geoserver/Projet_session_DIA/wms',
    params: {
      'LAYERS': 'Projet_session_DIA:reseau_routier',
      'TILED': true,
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver',
    transition: 0
  }),
  visible: false
});

map.addLayer(wmsPistes);
map.addLayer(wmsRoutes);

['chkParcs','chkPistes','chkRoutes','chkLimites','chkDensite'].forEach(id => {
  document.getElementById(id).addEventListener('change', e => {
    const layerMap = {
      chkParcs: parcs,
      chkPistes: pistes,
      chkRoutes: routes,
      chkLimites: limites,
      chkDensite: densite
    };
    layerMap[id].setVisible(e.target.checked);
  });
});

document.getElementById('chkWMSPistes').addEventListener('change', e => wmsPistes.setVisible(e.target.checked));
document.getElementById('chkWMSRoutes').addEventListener('change', e => wmsRoutes.setVisible(e.target.checked));

['chkRental', 'chkRepair', 'chkParking'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    poiLayer.setStyle(poiLayer.getStyle());
  });
});

document.getElementById('baseMapSelector').addEventListener('change', e => {
  map.removeLayer(currentBase);
  currentBase = baseLayers[e.target.value];
  map.getLayers().insertAt(0, currentBase);
});

document.getElementById('zoomParcs').addEventListener('click', () => {
  const extent = parcs.getSource().getExtent();
  map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
});

document.getElementById('measureDistance').addEventListener('click', () => addMeasureInteraction('LineString'));
document.getElementById('measureArea').addEventListener('click', () => addMeasureInteraction('Polygon'));
document.getElementById('showStats').addEventListener('click', calculateStats);


document.getElementById('geolocateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    const lon = position.coords.longitude;
    const lat = position.coords.latitude;
    const coords = ol.proj.fromLonLat([lon, lat]);

    const userPoint = new ol.Feature({
      geometry: new ol.geom.Point(coords),
      name: "Votre position"
    });

    userPoint.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        src: 'icons/localisation.png',
        scale: 0.05,
        anchor: [0.5, 1]
      })
    }));

    if (userLocationLayer) map.removeLayer(userLocationLayer);

    userLocationLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [userPoint]
      })
    });

    map.addLayer(userLocationLayer);
    map.getView().animate({ center: coords, zoom: 15 });

    // === Trouver le parc le plus proche ===
    let minDistance = Infinity;
    let closestParc = null;

    parcs.getSource().getFeatures().forEach(feature => {
      const parcCoord = feature.getGeometry().getCoordinates();
      const distance = ol.sphere.getDistance(
        [lon, lat],
        ol.proj.toLonLat(parcCoord)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestParc = feature;
      }
    });

    if (closestParc) {
      const nomParc = closestParc.get('g_name');
      const imageParc = closestParc.get('image');
      const municip = closestParc.get('g_municipa') || 'Non disponible';
      const type = closestParc.get('g_class') || 'Non disponible';
      const dateChar = closestParc.get('g_dat_char') || 'Non disponible';
      const techno = closestParc.get('g_acq_tech') || 'Non disponible';
      const latParc = closestParc.get('g_latitude') || '--';
      const lonParc = closestParc.get('g_longitud') || '--';

      document.getElementById('parcName').innerText = nomParc || 'Nom non disponible';
      document.getElementById('parcImg').src = imageParc ? 'image_parc/' + imageParc : '';
      document.getElementById('parcImg').onerror = () => {
        document.getElementById('parcImg').src = 'image_parc/default.png';
      };

      document.getElementById('parcMeta').innerHTML = `
        <li><strong>Municipalité :</strong> ${municip}</li>
        <li><strong>Type :</strong> ${type}</li>
        <li><strong>Date de caractérisation :</strong> ${dateChar}</li>
        <li><strong>Technologie :</strong> ${techno}</li>
        <li><strong>Coordonnées :</strong> ${latParc}, ${lonParc}</li>
        <li><strong>📏 Distance :</strong> ${(minDistance / 1000).toFixed(2)} km</li>
      `;

      document.getElementById('parcInfo').style.display = 'block';
      map.getView().animate({ center: closestParc.getGeometry().getCoordinates(), zoom: 15 });
    }
  }, function (error) {
    alert("Erreur de localisation : " + error.message);
  });
});

// Bouton pour supprimer la position
document.getElementById('removeLocationBtn').addEventListener('click', () => {
  if (userLocationLayer) {
    map.removeLayer(userLocationLayer);
    userLocationLayer = null;
    alert("Votre position a été supprimée de la carte.");
  }
});

document.getElementById('removeLocationBtn').addEventListener('click', () => {
  if (userLocationLayer) {
    map.removeLayer(userLocationLayer);
    userLocationLayer = null;
  }
});



let myChart = null;
function calculateStats() {
  const nbParcs = parcs.getSource().getFeatures().length;
  let totalLength = 0;
  pistes.getSource().getFeatures().forEach(f => {
    const geom = f.getGeometry();
    if (geom) totalLength += ol.sphere.getLength(geom);
  });
  const km = (totalLength / 1000).toFixed(2);

  const featuresPOI = poiSource.getFeatures();
  let countRental = 0, countRepair = 0, countParking = 0;
  featuresPOI.forEach(f => {
    const type = f.get('amenity');
    if (type === 'bicycle_rental') countRental++;
    else if (type === 'bicycle_repair_station') countRepair++;
    else if (type === 'bicycle_parking') countParking++;
  });

  const values = [nbParcs, km, countRental, countRepair, countParking];

  document.getElementById('statList').innerHTML = `
    <li class="list-group-item dashboard-item" data-index="0"><span>🌳 Parcs</span><span class="fw-bold">${nbParcs}</span></li>
    <li class="list-group-item dashboard-item" data-index="1"><span>🚴 Longueur pistes</span><span class="fw-bold">${km} km</span></li>
    <li class="list-group-item dashboard-item" data-index="2"><span>📍 Locations vélos</span><span class="fw-bold">${countRental}</span></li>
    <li class="list-group-item dashboard-item" data-index="3"><span>🔧 Bornes réparation</span><span class="fw-bold">${countRepair}</span></li>
    <li class="list-group-item dashboard-item" data-index="4"><span>🚲 Stationnements</span><span class="fw-bold">${countParking}</span></li>`;

  const ctx = document.getElementById('chartCanvas').getContext('2d');
  if (myChart) myChart.destroy();
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Parcs', 'Pistes (km)', 'Locations', 'Réparations', 'Stationnements'],
      datasets: [{
        label: 'Infrastructure vélo et parcs',
        data: values,
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
 // Interaction entre chiffres et graphique
  document.querySelectorAll('.dashboard-item').forEach(item => {
    item.addEventListener('mouseover', () => {
      const idx = parseInt(item.dataset.index);
      myChart.setActiveElements([{ datasetIndex: 0, index: idx }]);
      myChart.tooltip.setActiveElements([{ datasetIndex: 0, index: idx }], { x: 0, y: 0 });
      myChart.update();
    });
    item.addEventListener('mouseleave', () => {
      myChart.setActiveElements([]);
      myChart.tooltip.setActiveElements([], {});
      myChart.update();
    });
  });
}

let drawInteraction;
document.addEventListener('DOMContentLoaded', function() {
  const alertDiv = document.createElement('div');
  alertDiv.innerHTML = `
    <div id="customAlert" class="custom-alert">
      <div class="custom-alert-content">
        <div class="alert-icon"></div>
        <div class="alert-message"></div>
        <button class="alert-close">&times;</button>
      </div>
    </div>
  `;
  document.body.appendChild(alertDiv);

  // Ajouter le CSS nécessaire
  const style = document.createElement('style');
  style.textContent = `
    .custom-alert {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    }
    
    .custom-alert.show {
      opacity: 1;
      visibility: visible;
    }
    
    .custom-alert-content {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      max-width: 400px;
      width: 90%;
      position: relative;
      display: flex;
      align-items: center;
      border-left: 4px solid var(--primary);
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .custom-alert.show .custom-alert-content {
      transform: scale(1);
    }
    
    .alert-icon {
      margin-right: 1rem;
      width: 40px;
      height: 40px;
      min-width: 40px;
      background: var(--gradient-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }
    
    .alert-message {
      flex-grow: 1;
      font-weight: 500;
      color: var(--gray-800);
      font-size: 1.1rem;
    }
    
    .alert-close {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: none;
      border: none;
      color: var(--gray-800);
      font-size: 1.5rem;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: var(--transition);
      padding: 0;
    }
    
    .alert-close:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--primary);
    }
  `;
  document.head.appendChild(style);
});

// Fonction d'alerte personnalisée
function showCustomAlert(message, type = 'info') {
  const alertElement = document.getElementById('customAlert');
  const messageElement = alertElement.querySelector('.alert-message');
  const iconElement = alertElement.querySelector('.alert-icon');
  
  // Définir l'icône en fonction du type (distance ou surface)
  let icon = '';
  if (type === 'distance') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M5 20h14"></path><path d="M5 4h14"></path><path d="M18 12h.01"></path><path d="M18 20h.01"></path><path d="M18 4h.01"></path><path d="M6 12h.01"></path><path d="M6 20h.01"></path><path d="M6 4h.01"></path></svg>';
  } else if (type === 'area') {
    icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect></svg>';
  }
  
  iconElement.innerHTML = icon;
  messageElement.textContent = message;
  
  // Afficher l'alerte
  alertElement.classList.add('show');
  
  // Configurer le bouton de fermeture
  const closeButton = alertElement.querySelector('.alert-close');
  closeButton.onclick = function() {
    alertElement.classList.remove('show');
  };
  
  // Fermer automatiquement après 5 secondes
  setTimeout(() => {
    alertElement.classList.remove('show');
  }, 5000);
}

// Fonction modifiée pour l'interaction de mesure
function addMeasureInteraction(type) {
  if (drawInteraction) map.removeInteraction(drawInteraction);
  drawInteraction = new ol.interaction.Draw({ source: new ol.source.Vector(), type });
  drawInteraction.on('drawend', function(evt) {
    const geom = evt.feature.getGeometry();
    let output = '';
    let alertType = '';
    
    if (type === 'LineString') {
      output = `Distance mesurée : ${(ol.sphere.getLength(geom) / 1000).toFixed(2)} km`;
      alertType = 'distance';
    } else {
      output = `Surface mesurée : ${(ol.sphere.getArea(geom) / 10000).toFixed(2)} ha`;
      alertType = 'area';
    }
    
    // Utiliser l'alerte personnalisée au lieu de alert()
    showCustomAlert(output, alertType);
    map.removeInteraction(drawInteraction);
  });
  map.addInteraction(drawInteraction);
}

map.on('pointermove', function(evt) {
  const coord = ol.proj.toLonLat(evt.coordinate);
  document.getElementById('coords').innerText = `Coordonnées : ${coord[1].toFixed(5)}, ${coord[0].toFixed(5)}`;
});
// === NOUVELLE FONCTION : INTERROGATION DES PARCS ===
map.on('singleclick', function(evt) {
  map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    if (layer === parcs) {
      const nomParc = feature.get('g_name');
      const imageParc = feature.get('image');
      const municip = feature.get('g_municipa') || 'Non disponible';
      const type = feature.get('g_class') || 'Non disponible';
      const dateChar = feature.get('g_dat_char') || 'Non disponible';
      const techno = feature.get('g_acq_tech') || 'Non disponible';
      const lat = feature.get('g_latitude') || '--';
      const lon = feature.get('g_longitud') || '--';

      document.getElementById('parcName').innerText = nomParc || 'Nom non disponible';
      document.getElementById('parcImg').src = imageParc ? 'image_parc/' + imageParc : '';
      document.getElementById('parcMeta').innerHTML = `
        <li><strong>Municipalité :</strong> ${municip}</li>
        <li><strong>Type :</strong> ${type}</li>
        <li><strong>Date de caractérisation :</strong> ${dateChar}</li>
        <li><strong>Technologie :</strong> ${techno}</li>
        <li><strong>Coordonnées :</strong> ${lat}, ${lon}</li>
      `;
      document.getElementById('parcInfo').style.display = 'block';
    }
  });
});
document.getElementById('parcClose').addEventListener('click', () => {
  document.getElementById('parcInfo').style.display = 'none';
});



// Ajoutez ce code à la fin de votre fichier carte.js

// Gestion spécifique du panneau en mode mobile
function setupMobilePanel() {
  // Vérifier si nous sommes en mode mobile (moins de 768px)
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    const panelTitle = document.querySelector('#sidepanel h5');
    
    // Ajouter un gestionnaire de clic sur le titre du panneau
    if (panelTitle) {
      panelTitle.addEventListener('click', function() {
        const panel = document.getElementById('sidepanel');
        panel.classList.toggle('closed');
      });
    }
    
    // Initialiser le panneau en mode fermé sur mobile
    const panel = document.getElementById('sidepanel');
    if (panel && !panel.classList.contains('closed')) {
      panel.classList.add('closed');
    }
  }
}

// Exécuter lors du chargement initial et du redimensionnement
window.addEventListener('load', setupMobilePanel);
window.addEventListener('resize', setupMobilePanel);

// Modifier la fonction toggleSidepanel existante pour prendre en compte le mode mobile
const originalToggleSidepanel = toggleSidepanel;
toggleSidepanel = function() {
  const isMobile = window.innerWidth < 768;
  
  if (!isMobile) {
    // Utiliser la fonction originale sur desktop
    originalToggleSidepanel();
  } else {
    // Sur mobile, simplement basculer la classe closed
    const panel = document.getElementById('sidepanel');
    panel.classList.toggle('closed');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const sidepanel = document.getElementById('sidepanel');
  const toggleButton = document.getElementById('sidepanel-toggle');
  
  // Fonction pour mettre à jour la position du bouton
  function updateTogglePosition() {
    if (sidepanel.classList.contains('closed')) {
      toggleButton.style.left = '0';
    } else {
      toggleButton.style.left = sidepanel.offsetWidth + 'px';
    }
  }
  
  // Observer les changements de classe sur le sidepanel
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        updateTogglePosition();
      }
    });
  });
  
  observer.observe(sidepanel, { attributes: true });
  
  // Position initiale
  updateTogglePosition();
  
  // S'assurer que le bouton se déplace lorsque le panneau est fermé/ouvert
  toggleButton.addEventListener('click', function() {
    setTimeout(updateTogglePosition, 10); // Petit délai pour s'assurer que la classe est déjà changée
  });
});




document.getElementById('geolocateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert("La géolocalisation n'est pas supportée par votre navigateur.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    const lon = position.coords.longitude;
    const lat = position.coords.latitude;

    const userLocation = ol.proj.fromLonLat([lon, lat]);

    const marker = new ol.Feature({
      geometry: new ol.geom.Point(userLocation)
    });

    marker.setStyle(new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: 'rgba(255,0,0,0.9)' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
      })
    }));

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [marker]
      })
    });

    map.addLayer(vectorLayer);
    map.getView().animate({ center: userLocation, zoom: 15 });

  }, function (error) {
    alert("Impossible de récupérer votre position : " + error.message);
  });
});

