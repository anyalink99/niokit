/* =========================================================================
   KIT — dispatch: one delegated click listener for the whole app.
     Kit.dispatch.init();                       // once, after DOM ready
     Kit.dispatch.action('save', (el, e, h) => {...});
     Kit.dispatch.actions({ save: fn, cancel: fn });
   Markup: <button data-action="save">  ·  <button data-goto="settings">
   data-goto routes through Kit.nav (push) or Kit.screens (go) if present.
   ========================================================================= */
(function (K) {
  'use strict';
  const actions = {};
  const helpers = {
    intAttr: (el, name, d) => { const v = parseInt(el.getAttribute(name), 10); return Number.isNaN(v) ? (d != null ? d : 0) : v; },
    attr: (el, name) => el.getAttribute(name),
    closest: (el, sel) => el.closest(sel),
  };
  let inited = false;

  const D = {
    action(name, fn) { actions[name] = fn; return D; },
    actions(map) { Object.assign(actions, map); return D; },
    has(name) { return !!actions[name]; },
    init(opts) {
      if (inited) return D; inited = true;
      const root = (opts && opts.root) || document.body;
      root.addEventListener('click', (e) => {
        const a = e.target.closest('[data-action]');
        if (a && root.contains(a)) {
          const name = a.getAttribute('data-action');
          if (actions[name]) { e.preventDefault(); actions[name](a, e, helpers); return; }
        }
        const g = e.target.closest('[data-goto]');
        if (g && root.contains(g)) {
          e.preventDefault();
          const id = g.getAttribute('data-goto');
          const mode = g.getAttribute('data-goto-mode'); // 'push' | 'go'
          if (mode === 'push' && K.nav) K.nav.push(id);
          else if (K.screens && K.screens.has && K.screens.has(id)) K.screens.go(id);
          else if (K.nav) K.nav.push(id);
        }
        const b = e.target.closest('[data-back]');
        if (b && root.contains(b)) { e.preventDefault(); if (K.nav) K.nav.back(); }
      });
      return D;
    },
  };
  K.dispatch = D;
})(window.Kit);
