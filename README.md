# Kit

A small, framework-free front-end stack for vanilla projects — design tokens, a
motion system, app skeletons, accessible overlays and a component set. **No build
step**: plain `<script>` + `<link>` tags, works straight from `file://`.

It exists because every project (geometric.games, mafia-host-app, settrainer,
37board…) kept rebuilding the same things from scratch: a modal, a toast, a
screen switcher, a toggle, a token palette — each slightly different, each with
the same gaps (no focus-trap, magic-number durations, hardcoded colours). Kit is
the consolidated "greatest hits", with the rough edges fixed.

## Quick start

```html
<link rel="stylesheet" href="kit/css/tokens.css" />
<link rel="stylesheet" href="kit/css/reset.css" />
<link rel="stylesheet" href="kit/css/motion.css" />
<link rel="stylesheet" href="kit/css/components.css" />

<!-- load only what you use; this is the full order -->
<script src="kit/js/kit.js"></script>      <!-- required: helpers + namespace -->
<script src="kit/js/storage.js"></script>
<script src="kit/js/store.js"></script>
<script src="kit/js/dispatch.js"></script>
<script src="kit/js/router.js"></script>
<script src="kit/js/screens.js"></script>
<script src="kit/js/modal.js"></script>
<script src="kit/js/sheet.js"></script>
<script src="kit/js/toast.js"></script>
<script src="kit/js/fx.js"></script>
<script src="kit/js/color-picker.js"></script>
<script src="kit/js/keybinds.js"></script>
```

Everything attaches to one global: `window.Kit`. Open `index.html` for a live
kitchen-sink of every component and module.

## Design principles

1. **Tokens are the single source of truth.** Colours, spacing, radii,
   durations, easings and z-index all live in `css/tokens.css` as `--k-*`
   variables. Override any of them to retheme (a `data-theme="light"` set ships
   in the box). Optional: point your Tailwind config at the same vars
   (`colors: { accent: 'var(--k-accent)' }`) so utilities and kit components
   repaint together.
2. **One source for durations.** Overlays close on `animationend` (not a
   `setTimeout(220)` kept in sync with CSS by hand). Need a number in JS? read it
   with `Kit.cssMs('--k-dur-2')`.
3. **Registries, not id-ladders.** Screens/nav take a map of builders; state goes
   through a tiny reactive store. No more 60-line `if (screen === …)` switches.
4. **Accessible overlays by default** — focus-trap, Escape, scroll-lock,
   restore-focus, ARIA, stacking.
5. **Respects `prefers-reduced-motion`** everywhere.

## Modules

| File | What |
|---|---|
| `kit.js` | `Kit.$/$$/el/on`, `reduceMotion`, `afterAnim`, `cssMs`, `setTheme` |
| `storage.js` | typed `localStorage` wrapper (`Kit.storage`, `Kit.createStorage(prefix)`) |
| `store.js` | `Kit.createStore(initial, { persist })` — reactive get/set/subscribe |
| `dispatch.js` | one delegated listener: `data-action` → handler map, `data-goto`/`data-back` |
| `router.js` | `Kit.router` — history path+query routing with a `file://` fallback |
| `screens.js` | `Kit.screens` (flat fade tabs) + `Kit.nav` (push/pop slide stack) |
| `modal.js` | `Kit.modal.open/close` — focus-trap, scroll-lock, Escape, stacking |
| `sheet.js` | `Kit.sheet.open/close` — bottom sheet with swipe-to-dismiss |
| `toast.js` | `Kit.toast(msg)` / `.good/.warn/.danger` — stacked, auto-dismiss |
| `fx.js` | `animateHeight` (FLIP), `press`, `longpress`, `swipe`, `tilt`, `draggable`, `resizable` |
| `color-picker.js` | `Kit.ColorPicker.mount/open` — SV+hue+hex, pointer & touch |
| `keybinds.js` | `Kit.keybinds.create` — capture/rebind/dedupe, layout-independent |

## CSS

| File | What |
|---|---|
| `tokens.css` | all `--k-*` design tokens + themes (default dark, `light`, `geometric`, `mafia`, `settrainer`) |
| `reset.css` | conservative reset + optional `.k-app` locked-viewport shell |
| `motion.css` | keyframe library, `.k-reveal` stagger util, reduced-motion guard |
| `components.css` | `k-btn`, `k-segment`, `k-switch`, `k-row`, `k-card`, `k-chip`, `k-range`, `k-field`, `k-screen`, `k-modal`, `k-sheet`, `k-toast`, `k-cp` |

## Themes

Set `data-theme` on `<html>` to switch palette (and font) instantly — everything
that reads `--k-*` repaints, app components and your own chrome alike:

```js
Kit.setTheme('mafia');   // 'geometric' | 'mafia' | 'settrainer' | 'light' | null (default dark)

// animate the swap with a crossfade (View Transitions API):
if (document.startViewTransition) document.startViewTransition(() => Kit.setTheme('mafia'));
else Kit.setTheme('mafia');
```

The three named palettes are lifted from real projects so they're authentic:
`geometric` (violet on plum, system sans), `mafia` (black/coal + gold + blood,
**Cormorant Garamond** serif), `settrainer` (magenta on plum, system sans). Only
`mafia` pulls a web font; the rest use the system stack like the source projects.
Add your own by copying a `:root[data-theme="…"]` block in `tokens.css`. For a live
accent tweak: `document.documentElement.style.setProperty('--k-accent', hex)`.

## PWA & SEO

The demo ships an installable, offline-capable, shareable setup you can copy:

- `manifest.webmanifest` + icons (`icon.svg`, `icon-192/512.png`, maskable, apple-touch).
- `service-worker.js` — network-first for html/js/css, cache-first for assets,
  stale-while-revalidate for Google Fonts / Tailwind CDN, offline fallback. Bump
  `CACHE_NAME` per release. Registered only over http(s) (no-op on `file://`).
- Rich `<head>`: description, `theme-color` (kept in sync with the active palette),
  OpenGraph + Twitter cards, canonical, JSON-LD; plus `robots.txt` + `sitemap.xml`.
- `og-image.png` (1200×630) generated from the icon.

## Conventions

- CSS classes are prefixed `k-`; tokens `--k-`; the JS namespace is `Kit`.
- Rename the prefix/namespace per taste — it's deliberately small.

v0.1.0 · MIT
