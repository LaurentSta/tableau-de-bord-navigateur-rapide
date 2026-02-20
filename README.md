# Démarrage rapide navigateur

Page d’accueil de navigateur légère et rapide, conçue pour un chargement instantané.

## Fonctions
- Recherche textuelle avec choix du moteur (Qwant, DuckDuckGo, Google)
- Favoris : ajout / suppression, avec icônes automatiques
- Fond d’écran : chargement d’une image, réinitialisation
- Météo (Open-Meteo) : géolocalisation si autorisée, sinon ville
- Horloge en temps réel
- Stockage local navigateur (favoris, fond, préférences)
- Mise en cache via Service Worker : démarrage très rapide après première visite

## Technologie
- HTML5
- CSS natif
- JavaScript natif (ES6)
- Service Worker (cache)

## Installation (local)
Ouvrez `index.html` dans un navigateur.
Note : la météo et certaines fonctions peuvent être plus fiables via un petit serveur Web.

### Serveur local simple (exemple)
- Python :
  - `python -m http.server 8080`
Puis ouvrir :
- `http://localhost:8080`

## Déploiement sur GitHub Pages
1. Pousser le dépôt sur GitHub.
2. Settings → Pages
3. Source : branche `main` (ou `master`) / dossier racine
4. L’URL GitHub Pages sera affichée.

## Remarques
- Le “choix du navigateur” ne peut pas être imposé depuis une page Web.
- Les icônes des favoris utilisent un service externe : DuckDuckGo (icons.duckduckgo.com).
- Les données restent locales au navigateur (pas de synchronisation multi-postes).