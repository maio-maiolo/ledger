const CACHE_NAME = 'ledger-v7-white-footer-final';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './ledger.css',
  './css/app.css',
  './app.css',
  './favicon.ico',
  './img/favicon-16x16.png',
  './img/favicon-32x32.png',
  './img/apple-touch-icon.png',
  './img/logo-icon-192.png',
  './img/logo-icon-512.png',
  './img/logo-icon-192-maskable.png',
  './img/logo-icon-512-maskable.png',
  './img/og-ledger-whatsapp-1200x630.png',
  './img/ledger-icon-footer-transparent.png',
  './img/academia-digital-ntx-footer-transparent.png',
  './img/logo-full-transparent.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(err => console.log('Cache fallo:', err)))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('firestore') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('google.com') ||
    event.request.url.includes('/js/') ||
    event.request.url.includes('firebase.js') ||
    event.request.url.includes('core.js') ||
    event.request.url.includes('finanzas.js')
  ) {
    event.respondWith(fetch(event.request).catch(()=> caches.match(event.request)));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && url.origin === location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
