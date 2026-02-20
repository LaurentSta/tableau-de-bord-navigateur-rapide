const NOM_CACHE = "tableau-bord-v1";

const FICHIERS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/stockage.js",
  "./js/horloge.js",
  "./js/meteo.js",
  "./js/app.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(NOM_CACHE).then((cache) => cache.addAll(FICHIERS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.map((cle) => (cle === NOM_CACHE ? null : caches.delete(cle))))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((rep) => rep || fetch(event.request))
  );
});