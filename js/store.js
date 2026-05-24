/* =========================================================================
   KIT — store: a tiny reactive state container.
   Replaces the "flat global + manual save/load + manual re-render" pattern.

     const s = Kit.createStore({ angle: 45, theme: 'dark' },
                               { persist: { key: 'app.state', keys: ['theme'] } });
     s.subscribe((state, changed) => render());     // any change
     s.on('angle', (v) => paint(v));                // one key
     s.set('angle', 50);  s.set({ a: 1, b: 2 });    // single or batch
   Notifications coalesce within a microtask, so a burst of sets = one render.
   ========================================================================= */
(function (K) {
  'use strict';
  K.createStore = function (initial, opts) {
    opts = opts || {};
    const persist = opts.persist || null;
    let state = Object.assign({}, initial);
    const subs = new Set();
    const keySubs = new Map();

    if (persist && persist.key) {
      const saved = K.storage.getJSON(persist.key, null);
      if (saved && typeof saved === 'object') state = Object.assign(state, saved);
    }
    const pick = (o, keys) => keys.reduce((r, k) => (k in o && (r[k] = o[k]), r), {});
    function save() {
      if (!persist || !persist.key) return;
      K.storage.setJSON(persist.key, persist.keys ? pick(state, persist.keys) : state);
    }

    let pending = null;
    function notify(changed) {
      if (!pending) pending = new Set();
      changed.forEach((c) => pending.add(c));
      Promise.resolve().then(() => {
        if (!pending) return;
        const ch = pending; pending = null;
        subs.forEach((fn) => fn(state, ch));
        ch.forEach((k) => { const set = keySubs.get(k); if (set) set.forEach((fn) => fn(state[k], state)); });
      });
    }

    const api = {
      get(k) { return k == null ? state : state[k]; },
      set(k, v) {
        let changed;
        if (k && typeof k === 'object') {
          changed = Object.keys(k).filter((key) => state[key] !== k[key]);
          if (!changed.length) return state;
          Object.assign(state, k);
        } else {
          if (state[k] === v) return v;
          changed = [k]; state[k] = v;
        }
        save(); notify(changed);
        return v;
      },
      update(fn) { const patch = fn(Object.assign({}, state)); if (patch) api.set(patch); return state; },
      subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
      on(key, fn) { if (!keySubs.has(key)) keySubs.set(key, new Set()); keySubs.get(key).add(fn); return () => keySubs.get(key).delete(fn); },
      reset(next) { state = Object.assign({}, initial, next || {}); save(); notify(Object.keys(state)); },
    };
    return api;
  };
})(window.Kit);
