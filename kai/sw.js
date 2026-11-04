/* Offline shell for KAI. Bump VERSION when files change. */
const VERSION = 'kai-v190';
const SHELL = ['./', './index.html', './app.js', './config.js', './i18n-en.js', './privacy.html', './terms.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './logo.png', './fonts/manrope-latin.woff2', './fonts/manrope-latin-ext.woff2', './fonts/manrope-cyrillic.woff2'];
const CDN = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /-v\d+(-cdn)?$/.test(k) && k !== VERSION && k !== VERSION + '-cdn').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // app files: answer from cache at once, refresh in the background
  if (url.origin === location.origin) {
    e.respondWith(caches.open(VERSION).then(async cache => {
      const key = req.mode === 'navigate' ? './index.html' : req;
      const hit = await cache.match(key, {ignoreSearch: true});
      const net = fetch(req).then(r => { if (r.ok) cache.put(key, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || new Response('Нет сети', {status: 503});
    }));
    return;
  }
  // libraries and fonts: cache first, keep forever
  if (CDN.includes(url.hostname)) {
    e.respondWith(caches.open(VERSION + '-cdn').then(async cache => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') cache.put(req, r.clone());
      return r;
    }));
  }
  // everything else (Claude API, your computer, model downloads) goes straight to the network
});
