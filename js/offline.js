/* ============================================================
   MODULE: js/offline.js — PWA registration + offline stash + HUD pill.
   Registers the root service worker first (full navigation control where
   the whole project folder is served), falls back to the assets/ copy.
   Also stashes every game file into Cache Storage from the page on every
   visit, so a game loaded once can reopen offline. Drives the offline
   indicator pill (#offlinePill) and the "Update Ready · Reload" button.
============================================================ */
(() => {
  const CACHE = '8x8-block-puzzle-v1';
  const SAME_ORIGIN_FILES = [
    './', 'index.html', 'manifest.webmanifest', 'assets/manifest.webmanifest',
    'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon-180.png',
    'assets/icon-maskable-512.png', 'assets/three.min.js',
    'css/style.css',
    'js/themes.js', 'js/version.js', 'js/shapes.js', 'js/board.js', 'js/scoring.js',
    'js/effects/registry.js', 'js/effects/row-sweep.js',
    'js/effects/col-cascade.js', 'js/effects/cross-burst.js',
    'js/effects/chain-finisher.js', 'js/effects/perfect-burst.js',
    'js/effects/effect-selector.js', 'js/renderer.js',
    'js/components/game-hud.js', 'js/components/block-grid.js',
    'js/components/shape-tray.js', 'js/drag.js', 'js/main.js',
    'js/offline.js', 'js/vendor/three.min.js', 'sw.js', 'assets/sw.js',
  ];
  const CDN_FILES = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js',
    'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap',
  ];
  const pill = document.getElementById('offlinePill');
  const dot = pill?.querySelector('.dot');
  const label = pill?.querySelector('.txt');
  const updateBtn = document.getElementById('updateBtn');
  const setPill = (mode, text) => {
    if (!pill) return;
    pill.dataset.mode = mode;
    if (label) label.textContent = text;
    if (dot) dot.dataset.mode = mode;
  };
  let stashed = false;
  const renderPill = () => {
    if (!navigator.onLine) setPill('offline', 'Offline · playing from cache');
    else if (stashed) setPill('ready', 'Saved · plays offline');
    else setPill('saving', 'Saving for offline…');
  };
  window.addEventListener('online', renderPill);
  window.addEventListener('offline', renderPill);
  renderPill();
  const stash = async () => {
    if (!('caches' in window)) { renderPill(); return; }
    try {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(SAME_ORIGIN_FILES.map(async (path) => {
        try { await cache.add(new URL(path, document.baseURI).href); } catch (_) { /* path may not exist in preview layout */ }
      }));
      await Promise.allSettled(CDN_FILES.map(async (u) => {
        try {
          const res = await fetch(u, { mode: 'no-cors' });
          await cache.put(u, res);
        } catch (_) { /* offline or blocked — local copies cover gameplay */ }
      }));
      stashed = true;
    } catch (_) { /* Cache Storage unavailable (private mode etc.) */ }
    renderPill();
  };
  let waitingWorker = null;
  let reloading = false;
  const showUpdate = (worker) => { waitingWorker = worker; if (updateBtn) updateBtn.hidden = false; };
  if (updateBtn) updateBtn.addEventListener('click', () => {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    else location.reload();
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
    const watch = (reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw);
        });
      });
    };
    (async () => {
      let reg = null;
      try { reg = await navigator.serviceWorker.register('sw.js'); }
      catch (_) {
        try { reg = await navigator.serviceWorker.register('assets/sw.js'); } catch (_) { reg = null; }
      }
      watch(reg);
    })();
  }
  if (document.readyState === 'complete') stash();
  else window.addEventListener('load', stash);
})();
