# Niokit

A small, framework-free front-end stack for vanilla projects — design tokens, a
motion system, app skeletons, accessible overlays and a component set. **No build
step**: plain `<script>` + `<link>` tags, works straight from `file://`.

It exists because every project (geometric.games, mafia-host-app, settrainer,
37board…) kept rebuilding the same things from scratch — a modal, a toast, a
screen switcher, a toggle, a token palette — each slightly different, each with
the same gaps (no focus-trap, magic-number durations, hardcoded colours). Niokit
is the consolidated "greatest hits", with the rough edges fixed.

```
niokit/
├─ css/                 the library — copy this
│  ├─ tokens.css        all --k-* tokens + themes (dark, light, geometric, mafia, settrainer)
│  ├─ reset.css         conservative reset + optional .k-app shell
│  ├─ motion.css        keyframes, .k-reveal, view-transition + reduced-motion
│  └─ components.css    every k-* component
├─ js/                  the library — copy what you use
│  ├─ kit.js            required: helpers, scroll-lock, theme, namespace
│  ├─ storage · store · dispatch · router · screens
│  ├─ modal · sheet · toast
│  └─ fx · color-picker · keybinds
├─ demo/                a self-contained showcase + PWA/SEO scaffold to copy
├─ README · LICENSE · CHANGELOG · package.json
```

## Quick start

Copy `css/` and `js/` into your project and link them (load only what you use):

```html
<link rel="stylesheet" href="niokit/css/tokens.css" />
<link rel="stylesheet" href="niokit/css/reset.css" />
<link rel="stylesheet" href="niokit/css/motion.css" />
<link rel="stylesheet" href="niokit/css/components.css" />

<script src="niokit/js/kit.js"></script>      <!-- required -->
<script src="niokit/js/storage.js"></script>
<script src="niokit/js/store.js"></script>
<script src="niokit/js/dispatch.js"></script>
<script src="niokit/js/router.js"></script>
<script src="niokit/js/screens.js"></script>
<script src="niokit/js/modal.js"></script>
<script src="niokit/js/sheet.js"></script>
<script src="niokit/js/toast.js"></script>
<script src="niokit/js/fx.js"></script>
<script src="niokit/js/color-picker.js"></script>
<script src="niokit/js/keybinds.js"></script>
```

Everything attaches to one global, `window.Kit` (the short runtime handle); CSS
classes are prefixed `k-` and tokens `--k-`. Open `demo/index.html` for a live,
draggable moodboard of every component and module.

## Design principles

1. **Tokens are the single source of truth.** Colours, spacing, radii,
   durations, easings and z-index live in `css/tokens.css` as `--k-*` variables.
   Override any to retheme; optionally point a Tailwind config at the same vars
   so utilities and components repaint together.
2. **One source for durations.** Overlays close on `animationend`, not a
   hand-synced `setTimeout`. Need a number in JS? `Kit.cssMs('--k-dur-2')`.
3. **Registries, not id-ladders.** Screens/nav take a map of builders; state
   goes through a tiny reactive store.
4. **Accessible overlays by default** — focus-trap, Escape, scroll-lock (no
   layout shift), restore-focus, ARIA, stacking.
5. **Respects `prefers-reduced-motion`** everywhere.

## Modules

| File | What |
|---|---|
| `kit.js` | `Kit.$/$$/el/on`, `reduceMotion`, `afterAnim`, `cssMs`, `setTheme`, `lockScroll` |
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

## Themes

Set `data-theme` on `<html>` to switch palette (and font) instantly — everything
that reads `--k-*` repaints, components and your own chrome alike:

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

## PWA & SEO

`demo/` is an installable, offline-capable, shareable site you can copy: a
`manifest.webmanifest` + icons, a `service-worker.js` (network-first for
html/js/css, cache-first for assets, offline fallback), a rich `<head>`
(OpenGraph/Twitter/JSON-LD, `theme-color` synced to the active palette), plus
`robots.txt`, `sitemap.xml` and a generated `og-image.png`.

## Conventions

- CSS classes are prefixed `k-`; tokens `--k-`; the JS namespace is `Kit`. These
  are deliberately short and stable; rename per taste in one place each.

v0.1.0 · MIT
