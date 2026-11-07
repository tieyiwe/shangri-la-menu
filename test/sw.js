// Service worker : le menu fonctionne hors ligne après la première visite.
const VERSION = "test-202611070734";
const CORE = ["./", "./index.html", "../lib/qrcode.js"];
const IMAGES = [];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE.map(u => new Request(u, {cache: "reload"})));
    // Photos : en arrière-plan, sans bloquer l'installation si une image échoue
    Promise.all(IMAGES.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Page : réseau d'abord (pour voir les mises à jour), cache si pas de connexion
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req, {cache: "no-store"});
        const c = await caches.open(VERSION); c.put("./index.html", res.clone());
        return res;
      } catch (_) {
        return (await caches.match("./index.html")) || (await caches.match("./"));
      }
    })());
    return;
  }
  // Images, polices, manifeste : cache d'abord, réseau ensuite
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) { const c = await caches.open(VERSION); c.put(req, res.clone()); }
        return res;
      } catch (_) { return hit || Response.error(); }
    })());
  }
});
