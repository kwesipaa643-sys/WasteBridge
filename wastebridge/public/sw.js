// Minimal service worker: network-first for pages (falls back to cache offline), cache-first for static assets.
const CACHE = "wb-driver-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/driver"]))); });
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.url.includes("/api/")) return;
  const isStatic = req.url.includes("/_next/static") || req.url.includes("/icons/");
  e.respondWith(
    isStatic
      ? caches.match(req).then((hit) => hit || fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; }))
      : fetch(req).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put(req, c)); return r; }).catch(() => caches.match(req).then((h) => h || caches.match("/driver")))
  );
});
