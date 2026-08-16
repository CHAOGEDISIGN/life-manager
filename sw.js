const CACHE = 'lifemgr-v5';
const PRE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install - precache core files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRE).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', evt => {
  // Only handle GET
  if (evt.request.method !== 'GET') return;

  // For CDN scripts, cache-first
  if (evt.request.url.includes('cdn.jsdelivr.net')) {
    evt.respondWith(
      caches.match(evt.request).then(cached => cached || fetch(evt.request))
    );
    return;
  }

  // For local files, network-first with cache fallback
  evt.respondWith(
    fetch(evt.request, { cache: 'no-store' })
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(evt.request, clone));
        return res;
      })
      .catch(() => caches.match(evt.request))
  );
});
