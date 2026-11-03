// Eli-Z: Seite nach dem ersten Aufruf offline verfügbar machen
const C = "eliz-4";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(DATEIEN))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(r => {
    const netz = fetch(e.request).then(res => { if (res.ok && new URL(e.request.url).origin === location.origin) { const k = res.clone(); caches.open(C).then(c => c.put(e.request, k)); } return res; }).catch(() => r);
    return r || netz;
  }));
});
