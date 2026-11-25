// Service worker de RHOKAIROZ.
// Con conexión pide siempre la versión más reciente; sin conexión usa la última copia.
// No guarda datos del usuario: las fotos viven en IndexedDB.
const CACHE = 'rhokairoz-v1';

const SHELL = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'src/styles/tokens.css',
  'src/styles/layout.css',
  'src/app/app.js',
  'src/app/brand.js',
  'src/app/state.js',
  'src/app/router.js',
  'src/app/floaters.js',
  'src/pages/dashboard.js',
  'src/pages/pending.js',
  'src/pages/settings.js',
  'src/services/photo-store.js',
  'src/utils/dom.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('index.html');
          return Response.error();
        })
      )
  );
});
