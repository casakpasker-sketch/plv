const CACHE_NAME = "scan-plv-cache-v4";
const CORE_ASSETS = [
  "./", "./index.html", "./scanner.html", "./manifest.webmanifest",
  "./favicon.svg?v=2", "./icon.svg", "./plv.css?v=10",
  "./zxing.min.js", "./scan-core.js?v=8", "./pdf-lib.min.js",
  "./plv-model.js?v=12", "./plv-export.js?v=10", "./castorama-reader.js?v=12",
  "./plv.js?v=16", "./scanner.js?v=12", "./google-product-core.js", "./google-search.js",
  "./plv-template.pdf", "./banner-assets/promotion.png", "./banner-assets/quantity-limited.png",
  "./banner-assets/card-exclusive.png", "./banner-assets/casto-price.png",
  "./banner-assets/price-lowered.png", "./banner-assets/clearance.png",
  "./banner-assets/outlet.png", "./banner-assets/standard.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith("scan-plv-cache-") && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") return caches.match(new URL("./index.html", self.registration.scope));
    return Response.error();
  }));
});
