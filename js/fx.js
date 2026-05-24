/* =========================================================================
   KIT — fx: small interaction/animation helpers.
     Kit.fx.animateHeight(el, () => { el.innerHTML = ... })   // FLIP height morph
     Kit.fx.press(el)                                         // robust pressed state
     Kit.fx.longpress(el, (e) => {}, { ms: 500 })
     Kit.fx.swipe(el, { onSwipe: (dir, info) => {}, threshold: 40 })
     Kit.fx.tilt(el)                                          // subtle pointer tilt
   ========================================================================= */
(function (K) {
  'use strict';
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  const fx = {
    _z: 20,
    /* smoothly morph height across a DOM mutation (Web Animations API) */
    animateHeight(el, mutate, opts) {
      const from = el.offsetHeight;
      if (mutate) mutate();
      const to = el.offsetHeight;
      if (K.reduceMotion() || from === to) return Promise.resolve();
      const dur = (opts && opts.duration) || 280;
      const prevOverflow = el.style.overflow;
      el.style.overflow = 'hidden';
      const anim = el.animate([{ height: from + 'px' }, { height: to + 'px' }], { duration: dur, easing: EASE });
      return anim.finished.catch(() => {}).then(() => { el.style.overflow = prevOverflow; });
    },

    /* adds/removes .is-pressed — avoids :active sticking after a swipe/drag */
    press(el) {
      const on = () => el.classList.add('is-pressed');
      const off = () => el.classList.remove('is-pressed');
      el.addEventListener('pointerdown', on);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => el.addEventListener(t, off));
      return el;
    },

    longpress(el, fn, opts) {
      opts = opts || {}; const ms = opts.ms || 500; let t = null, sx = 0, sy = 0;
      const clear = () => { if (t) { clearTimeout(t); t = null; } };
      el.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; clear(); t = setTimeout(() => { t = null; fn(e); }, ms); });
      el.addEventListener('pointermove', (e) => { if (t && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) clear(); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((tp) => el.addEventListener(tp, clear));
      return () => clear();
    },

    swipe(el, opts) {
      opts = opts || {}; const thr = opts.threshold || 40; let sx = 0, sy = 0, down = false;
      el.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sy = e.clientY; });
      const end = (e) => {
        if (!down) return; down = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < thr) return;
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        if (opts.onSwipe) opts.onSwipe(dir, { dx, dy, event: e });
      };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', () => { down = false; });
      return el;
    },

    /* make an absolutely-positioned element draggable by `handle` (or itself);
       updates left/top, lifts z-index. Powers moodboard-style canvases. */
    draggable(el, opts) {
      opts = opts || {};
      const handle = opts.handle ? (typeof opts.handle === 'string' ? el.querySelector(opts.handle) : opts.handle) : el;
      let down = false, sx = 0, sy = 0, ox = 0, oy = 0;
      const start = (e) => {
        if (e.button === 1 || e.button === 2) return;
        down = true; sx = e.clientX; sy = e.clientY;
        ox = parseFloat(el.style.left) || el.offsetLeft; oy = parseFloat(el.style.top) || el.offsetTop;
        el.style.zIndex = ++fx._z; el.classList.add('is-dragging');
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
      };
      const move = (e) => { if (!down) return; const x = ox + (e.clientX - sx), y = oy + (e.clientY - sy); el.style.left = x + 'px'; el.style.top = y + 'px'; if (opts.onMove) opts.onMove(x, y); };
      const end = () => { if (!down) return; down = false; el.classList.remove('is-dragging'); if (opts.onEnd) opts.onEnd(parseFloat(el.style.left) || 0, parseFloat(el.style.top) || 0); };
      handle.addEventListener('pointerdown', start);
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
      return () => { handle.removeEventListener('pointerdown', start); handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', end); };
    },

    /* drag `handle` to resize `target` along an axis; persists to storage. */
    resizable(handle, opts) {
      opts = opts || {};
      const target = typeof opts.target === 'string' ? document.querySelector(opts.target) : opts.target;
      const axis = opts.axis || 'x', dim = axis === 'x' ? 'width' : 'height';
      const min = opts.min || 200, max = opts.max || 4000;
      if (opts.storageKey) { const v = K.storage.getInt(opts.storageKey, 0); if (v) target.style[dim] = v + 'px'; }
      let down = false, s = 0, base = 0;
      handle.addEventListener('pointerdown', (e) => { down = true; s = axis === 'x' ? e.clientX : e.clientY; base = axis === 'x' ? target.offsetWidth : target.offsetHeight; try { handle.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
      handle.addEventListener('pointermove', (e) => { if (!down) return; const d = ((axis === 'x' ? e.clientX : e.clientY) - s) * (opts.invert ? -1 : 1); target.style[dim] = Math.max(min, Math.min(max, base + d)) + 'px'; if (opts.onResize) opts.onResize(); });
      const end = () => { if (!down) return; down = false; if (opts.storageKey) K.storage.set(opts.storageKey, parseInt(target.style[dim], 10)); };
      handle.addEventListener('pointerup', end); handle.addEventListener('pointercancel', end);
    },

    /* subtle 3D tilt toward the pointer; returns a disposer */
    tilt(el, opts) {
      opts = opts || {}; const max = opts.max || 8;
      if (K.reduceMotion()) return () => {};
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(600px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
      };
      const reset = () => { el.style.transform = ''; };
      el.addEventListener('pointermove', move); el.addEventListener('pointerleave', reset);
      return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); reset(); };
    },
  };
  K.fx = fx;
})(window.Kit);
