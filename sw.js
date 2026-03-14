/* ═══════════════════════════════════════════════════════════════
   KEMPEL REFRIGERACIÓN — Service Worker v1
   Mejoras 1, 8, 65, 67, 96, 98, 99, 101, 105
   ═══════════════════════════════════════════════════════════════ */

const STATIC_CACHE  = 'kempel-static-v1';
const DYNAMIC_CACHE = 'kempel-dynamic-v1';
const PAGES_CACHE   = 'kempel-pages-v1';
const ALL_CACHES    = [STATIC_CACHE, DYNAMIC_CACHE, PAGES_CACHE];

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './Franco.webp',
  './Agustin.webp',
  './samsung.svg',
  './lg.svg',
  './Logo_Carrier.svg',
  './Logo_GREE.svg',
  './Logo_de_BGH.svg',
  './Philco_logo.svg',
  './Whirlpool_Logo.svg',
  './Electrolux_logo.svg.svg'
];

/* ── INSTALL: cachear assets estáticos ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install parcial:', err))
  );
});

/* ── ACTIVATE: limpiar cachés viejas + claim ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => clients.claim())
  );
});

/* ── FETCH: estrategias por tipo de recurso ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Ignorar peticiones no-GET y extensiones externas no cacheables */
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin &&
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('cdnjs.cloudflare.com')) return;

  /* ESTRATEGIA 1: Network First para HTML (siempre fresco) */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => { caches.open(PAGES_CACHE).then(c => c.put(request, res.clone())); return res; })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  /* ESTRATEGIA 2: Cache First para imágenes y fuentes (rara vez cambian) */
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
          return res;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  /* ESTRATEGIA 3: Stale While Revalidate para CSS/JS (rápido + actualizable) */
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request).then(res => {
          if (res.ok) caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  /* FALLBACK: Network with cache fallback */
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

/* ── BACKGROUND SYNC: consultas offline (Mejora 96) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'kempel-pending-consultation') {
    event.waitUntil(
      self.registration.showNotification('Kempel Refrigeración', {
        body: '¡Conexión recuperada! Tu consulta está lista para enviar.',
        icon: './icon-192.png',
        badge: './icon-192.png',
        tag: 'kempel-sync',
        requireInteraction: true
      }).catch(() => {})
    );
  }
});

/* ── NOTIFICACIONES: abrir app al hacer clic ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        clientList[0].focus();
        clientList[0].navigate('./#diagnostico');
      } else {
        clients.openWindow('./#diagnostico');
      }
    })
  );
});

/* ── MENSAJE: recibir skipWaiting desde la app ── */
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') self.skipWaiting();
});
