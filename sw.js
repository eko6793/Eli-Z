// Eli-Z: Seite nach dem ersten Aufruf offline verfügbar machen
const C = "eliz-13";
const OCR = "eliz-ocr-1";
const DATEIEN = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const OCR_DATEIEN = ["ocr/tesseract.min.js", "ocr/worker.min.js", "ocr/tesseract-core-simd.wasm.js", "ocr/tesseract-core.wasm.js", "ocr/deu.traineddata", "ocr/eng.traineddata"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(DATEIEN)));
  // Scan-Dateien einzeln nachladen; ein Fehler hier verhindert die Installation der App nicht
  e.waitUntil(caches.open(OCR).then(c => Promise.all(OCR_DATEIEN.map(u => c.match(u).then(h => h || c.add(u)).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C && x !== OCR).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin && u.pathname.indexOf("/ocr/") > -1) {
    e.respondWith(caches.open(OCR).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => {
    const netz = fetch(e.request).then(res => { if (res.ok && u.origin === location.origin) { const k = res.clone(); caches.open(C).then(c => c.put(e.request, k)); } return res; }).catch(() => r);
    return r || netz;
  }));
});
