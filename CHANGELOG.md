# Changelog

All notable changes to Niokit are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions use [SemVer](https://semver.org/).

## [0.1.0] — 2026-05-24

Initial release. A framework-free vanilla front-end stack, no build step.

### Added
- **Tokens** (`css/tokens.css`) — colours, spacing, radii, durations, easings,
  z-index as `--k-*` variables; default dark + `light`, and three palettes
  lifted from real projects: `geometric`, `mafia`, `settrainer`.
- **Motion** (`css/motion.css`) — keyframe library, `.k-reveal` stagger,
  View-Transitions crossfade hook, reduced-motion guard.
- **Components** (`css/components.css`) — buttons (incl. 3D press), segmented
  control, switch, settings row, card, chip, range, field, screen, modal,
  sheet, toast, color-picker.
- **JS modules** — `kit` (helpers + scroll-lock + theme), `storage`, `store`
  (reactive), `dispatch` (delegated `data-action`/`data-goto`), `router`
  (history + file:// fallback), `screens` (flat tabs) + `nav` (push/pop stack),
  `modal` (focus-trap/scroll-lock/Escape/stacking), `sheet` (swipe-dismiss),
  `toast`, `fx` (animateHeight FLIP, press/longpress/swipe/tilt, draggable,
  resizable), `color-picker`, `keybinds`.
- **Demo** (`demo/`) — draggable Figma-style moodboard, live palette switcher
  with crossfade, plus an installable PWA + SEO scaffold (manifest,
  service-worker, icons, OpenGraph/Twitter/JSON-LD, robots, sitemap).
