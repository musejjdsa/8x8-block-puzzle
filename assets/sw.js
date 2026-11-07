/* sw.js — 8×8 Block Puzzle service worker.
   Network-first with a versioned cache: online always serves the newest
   build and writes it back to cache; offline falls back to the cache.
   This file lives at the project root AND as an identical copy in assets/.
   It resolves its file list against the PARENT of its scope, so the same
   file works from both locations (the assets/ copy can only control its
   own directory — see README "Offline / PWA" for what that means). */
const VERSION = 'v1';
const CACHE = '8x8-block-puzzle-' + VERSION;

/* App shell + everything the game needs offline, relative to the app root. */
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/manifest.webmanifest',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-180.png',
  'assets/icon-maskable-512.png',
  'assets/three.min.js',
  'css/style.css',
  'js/board.js',
  'js/shapes.js',
  'js/scoring.js',
  'js/themes.js',
  'js/renderer.js',
  'js/drag.js',
  'js/main.js',
  'js/offline.js',
  'js/vendor/three.min.js',
  'js/components/block-grid.js',
  'js/components/shape-tray.js',
  'js/components/game-hud.js',
  'js/effects/registry.js',
  'js/effects/row-sweep.js',
  'js/effects/col-cascade.js',
  'js/effects/cross-burst.js',
  'js/effects/chain-finisher.js',
  'js/effects/perfect-burst.js',
  'js/effects/effect-selector.js',
  'sw.js',
];
const CDN_CORE = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js',
];

/* App root = scope, or scope's parent when this copy runs from assets/. */
const scope = self.registration.scope;
const appBase = scope.endsWith('assets/') ? scope.slice(0, -'assets/'.length) : scope;
const urlFor = (path) => new URL(path.replace(/^\.\//, ''), appBase).href;
const INDEX_URL = urlFor('index.html');

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Per-file adds: one 404 (e.g. a path that only exists in the full
    // project layout) must not fail the whole install.
    await Promise.allSettled(CORE.map(async (path) => {
      try { await cache.add(urlFor(path)); } catch (_) { /* skip missing */ }
    }));
    await Promise.allSettled(CDN_CORE.map(async (u) => {
      try {
        const res = await fetch(u, { mode: 'no-cors' });
        await cache.put(u, res);
      } catch (_) { /* CDN unreachable — local copy already cached */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('8x8-block-puzzle-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Network-first: a fresh build wins whenever we're online.
      const fresh = await fetch(request);
      if (fresh && (fresh.ok || fresh.type === 'opaque')) {
        try { await cache.put(request, fresh.clone()); } catch (_) { /* quota / partial */ }
      }
      return fresh;
    } catch (_) {
      const hit = await cache.match(request, { ignoreSearch: true });
      if (hit) return hit;
      if (request.mode === 'navigate') {
        const shell = await cache.match(INDEX_URL) || await cache.match(urlFor('./'));
        if (shell) return shell;
      }
      throw new Error('offline and not cached: ' + request.url);
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
