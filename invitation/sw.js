/* Service worker — invitation + scanner consultables hors-ligne. */
var CACHE = "ee-inv-v3";
var CORE = [
  "./", "index.html", "checkin.html", "scanner.html",
  "favicon.svg", "mariage.ics", "manifest.webmanifest",
  "img/couple-bw.jpg", "img/flowers.jpg", "img/rings-wm.png", "img/pin.png",
  "img/corner-tl.png", "img/corner-tr.png", "img/corner-bl.png", "img/corner-br.png"
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
  // Données dynamiques (Apps Script) : toujours réseau, jamais cache.
  if (url.indexOf("script.google.com") > -1 || url.indexOf("googleusercontent.com") > -1) return;

  var accept = e.request.headers.get("accept") || "";
  var isDoc = e.request.mode === "navigate" || e.request.destination === "document" || accept.indexOf("text/html") > -1;

  if (isDoc) {
    // PAGES : réseau d'abord (dernière version), cache en secours (hors-ligne).
    e.respondWith(
      fetch(e.request).then(function (res) {
        try { var c = res.clone(); caches.open(CACHE).then(function (ch) { ch.put(e.request, c); }); } catch (x) {}
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (h) { return h || caches.match("index.html"); });
      })
    );
    return;
  }

  // ASSETS (images, polices, librairies) : cache d'abord, réseau en secours.
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
