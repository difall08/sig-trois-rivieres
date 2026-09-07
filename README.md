# 🚴 SIG Trois-Rivières — Réseau Cyclable et Parcs Urbains

Application web SIG interactive pour l'exploration du réseau cyclable et des parcs urbains de la ville de Trois-Rivières, Québec.

![Aperçu de la carte](banniere.png)

---

## 📌 Description

Ce projet propose une carte web dynamique permettant de visualiser et d'analyser les infrastructures vertes et cyclables de Trois-Rivières. Il s'adresse aussi bien aux citoyens qu'aux acteurs de la planification urbaine.

---

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** avec couches activables/désactivables :
  - Parcs urbains
  - Pistes cyclables
  - Routes
  - Limites municipales
  - Densité de population
- 📍 **Points d'intérêt** : locations de vélos, bornes de réparation, stationnements
- 🛰️ **Couches WMS** : pistes cyclables et routes via services web géospatiaux
- 🗾 **Fonds de carte** : OpenStreetMap, gris foncé, satellite
- 📏 **Outils de mesure** : distance et superficie
- 📊 **Tableau de bord statistique** avec graphiques (Chart.js)
- 📍 **Géolocalisation** de l'utilisateur en temps réel
- 💬 **Fiches info** au clic sur les parcs (nom, type, date, coordonnées)
- 📱 Interface responsive (Bootstrap 5)

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|---|---|
| HTML5 / CSS3 | Structure et style |
| JavaScript (ES6) | Logique interactive |
| [OpenLayers](https://openlayers.org/) | Moteur cartographique |
| Bootstrap 5 | Interface responsive |
| Chart.js | Graphiques statistiques |
| GeoJSON | Format des données géospatiales |
| WMS | Services cartographiques web |

---

## 📂 Structure du projet

```
sig-trois-rivieres/
├── index.html          # Page d'accueil
├── carte.html          # Page carte interactive
├── contact.html        # Page contact
├── index.css           # Styles page d'accueil
├── carte.css           # Styles carte
├── carte.js            # Logique cartographique
├── data/
│   ├── parcs.geojson
│   ├── pistes.geojson
│   ├── routes.geojson
│   └── ...
├── icons/              # Icônes de la carte
└── images/             # Images et bannières
```

---

## 🗂️ Données

Les données proviennent de sources ouvertes :
- [Portail données ouvertes - Ville de Trois-Rivières](https://www.v3r.net/services/donnees-ouvertes)
- OpenStreetMap contributors

---

## 🚀 Installation et utilisation

```bash
# Cloner le dépôt
git clone https://github.com/difall08/sig-trois-rivieres.git

# Ouvrir dans le navigateur
# Aucune installation requise - ouvrir index.html directement
# ou utiliser un serveur local :
npx serve .
```

---

## 👩‍💻 Auteure

**Dieumbe FALL**  
Géomaticienne | M.Sc. Géomatique appliquée - Université de Sherbrooke  
[LinkedIn](https://www.linkedin.com/in/dieumbe-fall-55982220b/) · [GitHub](https://github.com/difall08)

---

## 📄 Licence

Projet académique — Université de Sherbrooke, 2025.  
Données sous licence ouverte (Ville de Trois-Rivières / OSM).
