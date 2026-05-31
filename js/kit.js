/* =========================================================================
   KIT — core helpers + namespace bootstrap (plain script, runs from file://)
   window.Kit is the single namespace every module attaches to.
   ========================================================================= */
window.Kit = window.Kit || {};
(function (K) {
  'use strict';
  K.version = '0.2.1';

  K.$  = (sel, root) => (root || document).querySelector(sel);
  K.$$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  /* el('button.k-btn.k-btn--primary#go', {text, on:{click}}, ...children)
     tag may carry #id and .classes; opts maps to props/attrs/style/dataset/on. */
  K.el = function (tag, opts) {
    opts = opts || {};
    let id = null; const classes = [];
    let name = String(tag || 'div').replace(/[#.][^#.]+/g, (m) => {
      if (m[0] === '#') id = m.slice(1); else classes.push(m.slice(1));
      return '';
    });
    const node = document.createElement(name || 'div');
    if (id) node.id = id;
    if (classes.length) node.className = classes.join(' ');
    for (const key in opts) {
      const v = opts[key];
      if (v == null) continue;
      if (key === 'class' || key === 'className') node.className = (node.className ? node.className + ' ' : '') + v;
      else if (key === 'html') node.innerHTML = v;
      else if (key === 'text') node.textContent = v;
      else if (key === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (key === 'dataset' && typeof v === 'object') Object.assign(node.dataset, v);
      else if (key === 'on' && typeof v === 'object') for (const ev in v) node.addEventListener(ev, v[ev]);
      else if (key in node) { try { node[key] = v; } catch (e) { node.setAttribute(key, v); } }
      else node.setAttribute(key, v);
    }
    const kids = Array.prototype.slice.call(arguments, 2).flat(Infinity);
    for (const c of kids) { if (c == null || c === false) continue; node.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
    return node;
  };

  /* direct listener: on(el,'click',fn) ; delegated: on(el,'click','.sel',(e,match)=>{}) */
  K.on = function (target, type, sel, handler) {
    if (typeof sel === 'function') { target.addEventListener(type, sel); return () => target.removeEventListener(type, sel); }
    const fn = (e) => { const t = e.target.closest(sel); if (t && target.contains(t)) handler(e, t); };
    target.addEventListener(type, fn); return () => target.removeEventListener(type, fn);
  };

  K.reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  K.raf2 = (cb) => requestAnimationFrame(() => requestAnimationFrame(cb));

  /* resolve when the element's CSS animation ends (safety-timeout + reduced-motion aware) */
  K.afterAnim = function (el, fallbackMs) {
    return new Promise((resolve) => {
      if (!el || K.reduceMotion()) { resolve(); return; }
      let done = false;
      const finish = () => { if (done) return; done = true; el.removeEventListener('animationend', onEnd); clearTimeout(t); resolve(); };
      const onEnd = (e) => { if (e.target === el) finish(); };
      el.addEventListener('animationend', onEnd);
      const t = setTimeout(finish, fallbackMs || 900);
    });
  };

  /* read a CSS <time> custom property as milliseconds, e.g. cssMs('--k-dur-2') */
  K.cssMs = function (varName, el) {
    const v = getComputedStyle(el || document.documentElement).getPropertyValue(varName).trim();
    if (!v) return 0;
    return v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
  };

  /* theme helper */
  K.setTheme = (name) => { if (name) document.documentElement.setAttribute('data-theme', name); else document.documentElement.removeAttribute('data-theme'); };

  /* scroll lock with scrollbar-width compensation (no layout shift), ref-counted
     so nested/stacked overlays (modal + sheet) don't unlock each other early. */
  let lockN = 0, lockPad = '';
  K.lockScroll = function () {
    if (++lockN > 1) return;
    const sw = window.innerWidth - document.documentElement.clientWidth;
    lockPad = document.documentElement.style.paddingRight;
    if (sw > 0) document.documentElement.style.paddingRight = sw + 'px';
    document.documentElement.classList.add('k-scroll-locked');
  };
  K.unlockScroll = function () {
    if (lockN > 0) lockN--;
    if (lockN > 0) return;
    document.documentElement.classList.remove('k-scroll-locked');
    document.documentElement.style.paddingRight = lockPad;
  };
})(window.Kit);
