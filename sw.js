// Service worker : le menu fonctionne hors ligne après la première visite.
const VERSION = "v16-202611020032";
const CORE = ["./", "./index.html", "./manifest.json", "./lib/qrcode.js"];
const IMAGES = ["./img/t/brochettes-crevettes.jpg", "./img/t/brochettes-calamar.jpg", "./img/t/brochettes-boeuf.jpg", "./img/t/rognons-agneau.jpg", "./img/t/pattes-poulet-grillees.jpg", "./img/t/gesiers-poulet.jpg", "./img/t/poitrine-porc-grillee.jpg", "./img/t/pommes-de-terre-brochette.jpg", "./img/t/tofu-brochette.jpg", "./img/t/lotus-grille.jpg", "./img/t/ailes-de-poulet-grillees.jpg", "./img/t/boeuf-aux-pommes-de-terre-et-tomates.jpg", "./img/t/boeuf-braise-aux-epices.jpg", "./img/t/boeuf-dans-l-huile-pimentee.jpg", "./img/t/boeuf-sate.jpg", "./img/t/boulettes-de-porc-sauce-soja.jpg", "./img/t/canard-frit-aux-epices.jpg", "./img/t/champignons-blancs-frits.jpg", "./img/t/champignons-noirs-sautes.jpg", "./img/t/chou-chinois-saute.jpg", "./img/t/ciboulette-chinoise-sautee-aux-oeufs.jpg", "./img/t/crabe-saute-au-piment.jpg", "./img/t/crevettes-a-la-moutarde.jpg", "./img/t/crevettes-a-la-vapeur.jpg", "./img/t/crevettes-au-pain-frit.jpg", "./img/t/crevettes-aux-noix-de-cajou.jpg", "./img/t/cuisse-de-porc-a-la-vapeur.jpg", "./img/t/filet-de-boeuf-au-curry.jpg", "./img/t/filet-de-boeuf-aux-poivrons-verts.jpg", "./img/t/filet-de-boeuf-dans-l-huile-pimentee.jpg", "./img/t/filet-de-poulet-frit.jpg", "./img/t/fondue-chinoise.jpg", "./img/t/germes-de-soja-sautes.jpg", "./img/t/golden-pain-grille.jpg", "./img/t/golden-soupe-au-boeuf.jpg", "./img/t/jus-de-fruits-presse.jpg", "./img/t/langouste-a-la-vapeur.jpg", "./img/t/litchis.jpg", "./img/t/mapo-tofu.jpg", "./img/t/marmite-au-poisson.jpg", "./img/t/marmite-aux-aubergines.jpg", "./img/t/marmite-aux-fruits-de-mer.jpg", "./img/t/mouton-saute-au-piment.jpg", "./img/t/niangao-saute.jpg", "./img/t/nouilles-sautees-aux-legumes.jpg", "./img/t/petites-crevettes-frites.jpg", "./img/t/petits-pains-farcis-a-la-vapeur.jpg", "./img/t/pieds-de-porc-sauce-soja.jpg", "./img/t/poisson-entier-a-la-vapeur.jpg", "./img/t/poisson-entier-sauce-aigre-douce.jpg", "./img/t/pommes-de-terre-grillees.jpg", "./img/t/pommes-de-terre-sautees.jpg", "./img/t/porc-a-l-ananas.jpg", "./img/t/porc-au-meicai.jpg", "./img/t/poulet-au-citron.jpg", "./img/t/poulet-pane-frit.jpg", "./img/t/poulet-sauce-aigre-douce.jpg", "./img/t/poulet-saute-au-piment-vert.jpg", "./img/t/poulet-saute-piment-rouge.jpg", "./img/t/riz-cantonais-au-jambon.jpg", "./img/t/salade-au-champignon-noir.jpg", "./img/t/salade-au-journal-sautee.jpg", "./img/t/salade-d-algues-vertes.jpg", "./img/t/salade-de-concombres.jpg", "./img/t/salade-de-pattes-de-poulet.jpg", "./img/t/salade-de-pousses-de-bambou.jpg", "./img/t/salade-de-tofu-bambou.jpg", "./img/t/saumon-nature.jpg", "./img/t/seiches-sauce-piquante.jpg", "./img/t/soupe-de-nouilles-au-boeuf.jpg", "./img/t/soupe-de-poulet-aux-vermicelles.jpg", "./img/t/soupe-de-vermicelles-blancs-au-boeuf.jpg", "./img/t/suancaiyu.jpg", "./img/t/tarte-a-la-citrouille.jpg", "./img/t/tete-de-poisson-a-la-vapeur.jpg", "./img/t/tofu-aux-oeufs-de-cent-ans.jpg", "./img/t/tofu-grille.jpg", "./img/t/tomates-sautees-aux-oeufs.jpg", "./img/whatsapp-qr.png", "./img/icon-192.png"];

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
