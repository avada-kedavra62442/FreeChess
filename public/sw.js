const CACHE = "freechess-shell-v14";
const CORE = ["/", "/manifest.webmanifest", "/icons/icon.svg", "/icons/apple-touch-icon.svg", "/icons/apple-touch-icon.png", "/icons/icon-72.svg", "/icons/icon-96.svg", "/icons/icon-128.svg", "/icons/icon-192.svg", "/icons/icon-256.svg", "/icons/icon-512.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match("/"))));
});