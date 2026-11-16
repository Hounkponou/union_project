/* Service worker — rend l'invitation + le scanner consultables hors-ligne. */
var CACHE = "ee-inv-v1";
var CORE = [
  "./", "index.html", "checkin.html", "scanner.html",
  "favicon.svg", "mariage.ics", "manifest.webmanifest",
  "img/couple-bw.jpg", "img/flowers.jpg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = e.request.url;
  // Données dynamiques (Apps Script) : toujours le réseau, jamais le cache.
  if (url.indexOf("script.google.com") > -1 || url.indexOf("googleusercontent.com") > -1) return;
  // Le reste (pages, images, polices, librairies CDN) : cache d'abord, puis réseau.
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        try { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); } catch (err) {}
        return res;
      }).catch(function () { return hit; });
    })
  );
});
