# 8x8 Block Puzzle

A drag-and-drop block puzzle on an 8×8 board, built with Three.js.
Drag (or tap) one of the three tray pieces onto the board. Fill all
8 cells in a row or a column to clear it. Clearing on consecutive
moves builds a combo multiplier; emptying the whole board with a
placement scores a **Perfect Clear: +500 × multiplier**. The game ends
when none of your three pieces fits anywhere.

Five themes / levels: Royal (default), Bubblegum, Ocean, Sunset,
Lemon — later levels deal bigger pieces.

## Project structure

```
index.html                  Markup only — pulls in everything below
manifest.webmanifest        PWA manifest (root copy; icons under assets/)
sw.js                       Service worker (root copy; identical to assets/sw.js)
css/
  style.css                 All styling (native CSS, custom properties)
js/
  themes.js                 Theme config (palette, board/cell colours, effect picks)
  shapes.js                 Shape definitions (cells + weight by level)
  board.js                  Pure board logic — no DOM, no Three.js
  scoring.js                Points, combo & Perfect Clear multiplier
  renderer.js               Three.js renderer (board meshes only)
  drag.js                   Drag controller (pointer events, tap-to-select)
                            + the shared `$` query helper used by main.js
  main.js                   Game state, placement, levels, New Game,
                            help modal, boot (calls initDrag, deal, refresh)
  offline.js                PWA registration + offline stash + HUD pill
  vendor/
    three.min.js            Self-hosted Three.js r160 (same bytes as assets/)
  components/               Web Components (classic scripts, globals)
    game-hud.js             <game-hud> — score / best / level / mult / chain
    block-grid.js           <block-grid> — the 8×8 board host, owns Renderer3D
    shape-tray.js           <shape-tray> — the 3-piece tray
  effects/                  Clear-effects registry + stateful selector
    registry.js             ClearEffects registry + shared particle helper
    row-sweep.js            Row clear: horizontal sweep
    col-cascade.js          Column clear: vertical cascade
    cross-burst.js          Row + column together
    chain-finisher.js       Alternating row↔column chain finisher
    perfect-burst.js        High-intensity board-clear burst
    effect-selector.js      The ONLY place that picks effect + intensity:
                            tracks clear timing, chain length, lines at
                            once, previous effect/direction; rapid clears
                            escalate intensity, a gap decays the chain.
assets/
  three.min.js              Self-hosted Three.js r160 (CDN is fallback only)
  icon-180.png              Apple touch icon
  icon-192.png / icon-512.png
  icon-maskable-512.png
  manifest.webmanifest      Manifest copy for the assets/ scope
  sw.js                     Identical service-worker copy (assets scope)
```

Scripts are classic (non-module) scripts loaded in dependency order
in `index.html`: themes → shapes → board → scoring → effects
(registry, row-sweep, col-cascade, cross-burst, chain-finisher,
perfect-burst, effect-selector) → renderer → components → drag →
main → offline. Game code is modern JavaScript throughout (arrow
functions, `const`/`let`, `map`/`filter`/`reduce`, template literals).
No `new URL(...).pathname` file-path handling anywhere, so paths stay
Windows-safe.

Adding a new clear effect is just a new file in `js/effects/` that
calls `ClearEffects.register({...})` plus a `<script>` tag in
`index.html` — board, scoring and drag code never change.

## Run locally

Any static server works (a plain `file://` open will not load the
modules reliably and cannot register the service worker):

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

or `npx serve .`

## Publish to GitHub Pages

1. Create a new repo (e.g. `8x8-block-puzzle`) and push this folder
   to `main`:
   ```sh
   git init
   git add .
   git commit -m "8x8 Block Puzzle MVP"
   git branch -M main
   git remote add origin git@github.com:<you>/8x8-block-puzzle.git
   git push -u origin main
   ```
2. Repo → **Settings → Pages** → Source: **Deploy from a branch**,
   Branch: `main`, Folder: `/ (root)`.
3. The game is live at
   `https://<you>.github.io/8x8-block-puzzle/` — the root `sw.js`
   then controls the whole site, so offline play works fully.

Nothing in this repo is pushed automatically; publishing is a manual
step, on your word.

## Offline / PWA

Installable PWA: manifest + icons + a network-first service worker
with a versioned cache (`8x8-block-puzzle-v1`). Online it always
serves the newest build and writes it back to cache; offline it falls
back to the cache. `js/offline.js` also stashes every game file into
Cache Storage from the page on every visit, and drives the small
offline pill (amber = saving, green = saved, hollow cyan = playing
offline) plus the "Update ready · Reload" button.

One platform limit, carried over from the hosted preview: a service
worker can only control its own directory. The `assets/sw.js` copy can
only control `assets/`; the root `sw.js` controls the whole project —
so full offline reopening is guaranteed where the whole folder is
served together (GitHub Pages, or a local server over this folder),
not from a single staged preview page.

Three.js is self-hosted (`assets/three.min.js`, r160 UMD build) so the
game works offline; the cdnjs copy is only a fallback if the local
file fails to load. The UMD build logs its own r150+ deprecation
warning in the console ("use ES Modules or alternatives") — harmless,
and expected until the renderer moves to ES modules.

## Rules the build guarantees

- **Empty start.** The board always starts as 64 empty slots
  (`Board.create()` is all nulls in `js/main.js`); blocks appear only
  when the player places a tray piece, and New Game wipes every
  rendered block (`Renderer3D.clearAll()`) before resetting. There is
  no seeded/demo board in the shipped game.
- **No-scroll, no page-scroll drag.** The page is viewport-locked
  (`100dvh`, `overflow: hidden`, `overscroll-behavior: none`) and
  `touch-action: none` is set on the board, tray, pieces and drag
  ghost; `touchmove` is `preventDefault`ed while a drag is active.
- **Minimal screen.** How-to-play lives in a modal behind the `(?)`
  icon — no persistent instructions on the game screen. The HUD is
  just Score / Best / Level / Multiplier / Chain plus three icon
  buttons (help, theme, new game) and a tiny offline dot.

## Verification (2026-11-07, split from the exported single file)

- All 21 JS files pass `node --check`; both manifests parse as JSON;
  `sw.js` ≡ `assets/sw.js`, `assets/three.min.js` ≡
  `js/vendor/three.min.js` (byte-identical).
- Every `src`/`href` in `index.html`, every path in
  `js/offline.js`'s file list, every entry in `sw.js`'s precache list
  and both manifests' icon paths resolve to a file in this folder.
  (The only "external" reference is the intentional cdnjs fallback.)
- Served locally and loaded in a headless Chromium (SwiftShader):
  start screen renders — Royal layout, empty 8×8 board, 3 tray
  pieces, HUD `Score 0 · Best 0 · Level 1 · Mult ×1 · Chain 0` —
  with no console errors and the service worker fetched (200).
- Pure-logic tests run in Node against the split files: empty-start
  board, placement + blocking, full-row detection, Perfect Clear
  scoring (8-cell row clear that empties the board = 680 pts,
  multiplier → ×2), all 5 effects registered, row clear → `row-sweep`,
  row+column → `cross-burst`.
- The split itself was caught live by that headless load: the first
  run failed with `$('#tray').render is not a function` because the
  splitter had stripped the tray's `customElements.define` line; the
  splitter was fixed and the load re-verified clean.

Not verified live: a real-device touch drag (pointer events +
`touch-action: none` are code-verified and were exercised in the
hosted build), an actual offline reload after closing the browser,
and install-to-home-screen on a phone.
