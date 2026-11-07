/* ============================================================
   MODULE: js/version.js — SINGLE SOURCE OF TRUTH for the game version.
   Semantic versioning (MAJOR.MINOR.PATCH). To release a new version,
   change VERSION here only — the footer at the bottom of the screen
   and the How to Play modal both read it via [data-version], so no
   markup ever needs editing. See README "Versioning".
   (Classic script, like every other js/ file: a plain global const,
   not an ES-module export — main.js reads VERSION as a global.)
============================================================ */
const VERSION='1.2.0';
