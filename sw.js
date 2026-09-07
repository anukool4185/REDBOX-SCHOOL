/* ============================================================
   REDBOX SCHOOL — Service Worker (v2)
   ============================================================ */
const CACHE = "redbox-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./admin.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.hostname.indexOf("script.google") !== -1 ||
      url.hostname.indexOf("googleusercontent") !== -1) return;
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(hit => {
      if (hit) {
        fetch(e.request)
          .then(res => caches.open(CACHE).then(c => c.put(e.request, res.clone())))
          .catch(() => {});
        return hit;
      }
      return fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
