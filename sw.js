// Service worker : le menu fonctionne hors ligne après la première visite.
const VERSION = "v1-202611011346";
const CORE = ["./", "./index.html", "./manifest.json"];
const IMAGES = [   "./img/ailes-de-poulet-grillees.jpg",   "./img/boeuf-aux-pommes-de-terre-et-tomates.jpg",   "./img/boeuf-braise-aux-epices.jpg",   "./img/boeuf-dans-l-huile-pimentee.jpg",   "./img/boeuf-sate.jpg",   "./img/boulettes-de-porc-sauce-soja.jpg",   "./img/canard-frit-aux-epices.jpg",   "./img/champignons-blancs-frits.jpg",   "./img/champignons-noirs-sautes.jpg",   "./img/chou-chinois-saute.jpg",   "./img/ciboulette-chinoise-sautee-aux-oeufs.jpg",   "./img/crabe-saute-au-piment.jpg",   "./img/crevettes-a-la-moutarde.jpg",   "./img/crevettes-a-la-vapeur.jpg",   "./img/crevettes-au-pain-frit.jpg",   "./img/crevettes-aux-noix-de-cajou.jpg",   "./img/cuisse-de-porc-a-la-vapeur.jpg",   "./img/filet-de-boeuf-au-curry.jpg",   "./img/filet-de-boeuf-aux-poivrons-verts.jpg",   "./img/filet-de-boeuf-dans-l-huile-pimentee.jpg",   "./img/filet-de-poulet-frit.jpg",   "./img/fondue-chinoise.jpg",   "./img/germes-de-soja-sautes.jpg",   "./img/golden-pain-grille.jpg",   "./img/golden-soupe-au-boeuf.jpg",   "./img/icon-192.png",   "./img/icon-512.png",   "./img/jus-de-fruits-presse.jpg",   "./img/langouste-a-la-vapeur.jpg",   "./img/litchis.jpg",   "./img/mapo-tofu.jpg",   "./img/marmite-au-poisson.jpg",   "./img/marmite-aux-aubergines.jpg",   "./img/marmite-aux-fruits-de-mer.jpg",   "./img/mouton-saute-au-piment.jpg",   "./img/niangao-saute.jpg",   "./img/nouilles-sautees-aux-legumes.jpg",   "./img/petites-crevettes-frites.jpg",   "./img/petits-pains-farcis-a-la-vapeur.jpg",   "./img/pieds-de-porc-sauce-soja.jpg",   "./img/poisson-entier-a-la-vapeur.jpg",   "./img/poisson-entier-sauce-aigre-douce.jpg",   "./img/pommes-de-terre-grillees.jpg",   "./img/pommes-de-terre-sautees.jpg",   "./img/porc-a-l-ananas.jpg",   "./img/porc-au-meicai.jpg",   "./img/poulet-au-citron.jpg",   "./img/poulet-pane-frit.jpg",   "./img/poulet-sauce-aigre-douce.jpg",   "./img/poulet-saute-au-piment-vert.jpg",   "./img/poulet-saute-piment-rouge.jpg",   "./img/riz-cantonais-au-jambon.jpg",   "./img/salade-au-champignon-noir.jpg",   "./img/salade-au-journal-sautee.jpg",   "./img/salade-d-algues-vertes.jpg",   "./img/salade-de-concombres.jpg",   "./img/salade-de-pattes-de-poulet.jpg",   "./img/salade-de-pousses-de-bambou.jpg",   "./img/salade-de-tofu-bambou.jpg",   "./img/saumon-nature.jpg",   "./img/seiches-sauce-piquante.jpg",   "./img/soupe-de-nouilles-au-boeuf.jpg",   "./img/soupe-de-poulet-aux-vermicelles.jpg",   "./img/soupe-de-vermicelles-blancs-au-boeuf.jpg",   "./img/suancaiyu.jpg",   "./img/tarte-a-la-citrouille.jpg",   "./img/tete-de-poisson-a-la-vapeur.jpg",   "./img/tofu-aux-oeufs-de-cent-ans.jpg",   "./img/tofu-grille.jpg",   "./img/tomates-sautees-aux-oeufs.jpg",   "./img/whatsapp-qr.png",  ];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE);
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
        const res = await fetch(req);
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
