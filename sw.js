// Service Worker — macht die App offline-fähig und installierbar.
// Strategie: App-Dateien beim Install cachen ("App-Shell"), zur Laufzeit
// network-first für die Shell (damit Updates ankommen), cache-Fallback offline.

const CACHE = 'einkauf-v1';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './store.js',
  './config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Supabase-API niemals cachen — immer live.
  if (url.hostname.endsWith('supabase.co')) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        // CDN (Tabler-Font) und eigene Dateien im Cache aktuell halten
        if (res.ok && (url.origin === location.origin || url.hostname.includes('jsdelivr'))) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
