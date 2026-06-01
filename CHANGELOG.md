# Changelog

All notable changes to Niokit are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions use [SemVer](https://semver.org/).

## [0.3.0] — 2026-05-31

### Added
- **Accordion** (`css/components.css` + `js/accordion.js`) — vertical
  collapsible sections with measured `max-height` animation. The trick is
  animating to/from `height: auto`: CSS can't, so JS measures the inner
  element's scrollHeight, writes it inline as max-height (which CAN
  transition from 0), and switches back to `max-height: none` after the
  transition ends so the section can grow when its contents change.
  Close reverses: pin current height in px, force reflow, then set 0.
  Headers get a chevron via `::before` that rotates -90deg ⇄ 0deg.

  Init: `Kit.accordion('#acc')` (multi-open by default) or
  `Kit.accordion('#acc', { single: true })` for true accordion. `data-single`
  attribute on the root is the declarative equivalent. Imperative API:
  `Kit.accordion.{expand,collapse,toggle,isExpanded,recompute}(item)`.
  `.recompute(itemOrRoot)` is for when the contents of an open section
  change and the pinned `none` is no longer accurate.

  Lifted from mafia-host-app's `.unified-section` accordion. Demo card
  added (3 sections, single-mode).

## [0.2.2] — 2026-05-31

### Fixed
- **`Kit.el` — CSS custom properties** in `style: {...}` were silently
  ignored. `Object.assign(node.style, { '--foo': 'bar' })` sets a regular
  JS property on the style object but CSSOM doesn't pick it up — needs
  `node.style.setProperty('--foo', 'bar')`. Symptom: in the slot demo
  `--k-slot-w: '128px'` had no effect and the slot fell back to the
  default `22rem` (352px), overflowing its parent and crushing the sibling.
  Helper now detects `--`-prefixed keys and routes them through
  `setProperty`; regular CSS properties stay on the fast path.

## [0.2.1] — 2026-05-31

### Fixed
- **Slot demo**: visible "ghost" strip remained when collapsed, because the
  demo had `padding`/`display:flex`/text directly on `.k-slot`. With
  `box-sizing: border-box`, `width: 0` clamps the content area but the
  padding still renders as a ~24px-wide background bar. Rewrote demo to
  use the recommended pattern (all visual content in a child div; `.k-slot`
  stays a bare geometry box). Added `box-sizing: border-box` to `.k-slot`
  defensively. Expanded comments in components.css + slot.js to document
  the three setup requirements (parent flex+gap, --k-slot-cancel = gap/2,
  content in child).

## [0.2.0] — 2026-05-31

### Added
- **Slot** (`css/components.css` + `js/slot.js`) — inline side panel for flex
  rows that collapses to zero width and back without leaving a phantom gap.
  CSS does the math: `--k-slot-cancel` (negative `margin-inline`, default
  `--k-space-2` = 8px) eats one parent `gap`, so neighbours sit exactly
  where they would with `display:none`. JS is a thin class-toggle wrapper
  (`Kit.slot.open / .close / .toggle / .isOpen`) with a `raf2` so a
  freshly-mounted slot transitions from 0 instead of jumping. Use
  `--k-slot-w` to set open width (default `22rem`); easing/duration come
  from `--k-ease` and `--k-dur-3` (slide) + `--k-dur-2` (opacity).
- Demo card showing toggle/open/close in a 3-column flex row (`demo/`).

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
