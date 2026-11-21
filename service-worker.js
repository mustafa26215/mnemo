// Bump CACHE_VERSION whenever you change any cached file so installed apps pick up the update.
// Saved words live in localStorage, which updates never touch.
const CACHE_VERSION = 'mnemo-v10';
const CORE = ['./', './index.html', './manifest.json'];
const EXTRA = ['./icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg', './icons/favicon-32.png', './icons/favicon.ico', './fonts/fraunces-latin-600-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION)
    .then(c => c.addAll(CORE).then(() => Promise.all(EXTRA.map(a => c.add(a).catch(() => {})))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('mnemo-') && k !== CACHE_VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Pages: network first so updates arrive, but fall back to the saved app after 4 seconds or when offline.
  if (req.mode === 'navigate') {
    const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE_VERSION).then(c => c.put('./index.html', copy)); } return res; });
    const slow = new Promise(r => setTimeout(() => r(null), 4000));
    e.respondWith(Promise.race([net, slow])
      .then(res => res || caches.match('./index.html').then(hit => hit || net))
      .catch(() => caches.match('./index.html')));
    return;
  }

  // Everything else: show the saved copy immediately and refresh it in the background.
  e.respondWith(caches.open(CACHE_VERSION).then(c => c.match(req).then(hit => {
    const fresh = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit || Response.error());
    return hit || fresh;
  })));
});
