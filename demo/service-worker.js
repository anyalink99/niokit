/* =========================================================================
   Niokit — generic service worker (adapted from mafia-host-app).
   Strategy: network-first for navigations + html/js/css (fresh code), cache-
   first for other same-origin assets, stale-while-revalidate for Google Fonts
   & Tailwind CDN, offline fallback to index.html. Bump CACHE_NAME on release.
   ========================================================================= */
var CACHE_NAME = 'niokit-static-v1';
var ASSETS = [
  './', './index.html', './demo.js', './manifest.webmanifest',
  '../css/tokens.css', '../css/reset.css', '../css/motion.css', '../css/components.css',
  '../js/kit.js', '../js/storage.js', '../js/store.js', '../js/dispatch.js', '../js/router.js', '../js/screens.js',
  '../js/modal.js', '../js/sheet.js', '../js/toast.js', '../js/fx.js', '../js/color-picker.js', '../js/keybinds.js',
  './icon.svg', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE_NAME) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function sameOrigin(url) { try { return new URL(url).origin === self.location.origin; } catch (e) { return false; } }
function networkFirst(req) {
  if (!sameOrigin(req.url)) return false;
  if (req.mode === 'navigate') return true;
  return /\.(html|js|css)(\?.*)?$/i.test(new URL(req.url).pathname);
}
function cdnAsset(req) {
  if (req.method !== 'GET') return false;
  try { var h = new URL(req.url).hostname; return h === 'cdn.tailwindcss.com' || h === 'fonts.googleapis.com' || h === 'fonts.gstatic.com'; }
  catch (e) { return false; }
}
function put(req, res) { var copy = res.clone(); caches.open(CACHE_NAME).then(function (c) { c.put(req, copy); }); return res; }

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  if (cdnAsset(req)) {
    e.respondWith(fetch(req).then(function (r) { return (r && r.ok && (r.type === 'basic' || r.type === 'cors')) ? put(req, r) : r; }).catch(function () { return caches.match(req); }));
    return;
  }
  if (!sameOrigin(req.url)) return;

  if (networkFirst(req)) {
    e.respondWith(fetch(req).then(function (r) { return (r && r.ok && r.type === 'basic') ? put(req, r) : r; })
      .catch(function () { return caches.match(req).then(function (c) { return c || caches.match('./index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (c) {
    return c || fetch(req).then(function (r) { return (r && r.ok) ? put(req, r) : r; }).catch(function () {
      return req.mode === 'navigate' ? caches.match('./index.html') : Response.error();
    });
  }));
});
