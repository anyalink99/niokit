/* =========================================================================
   KIT — storage: a small typed localStorage wrapper (already library-grade).
   Kit.storage (unprefixed) or Kit.createStorage('myapp.') for a namespace.
   ========================================================================= */
(function (K) {
  'use strict';
  function make(prefix) {
    prefix = prefix || '';
    const key = (k) => prefix + k;
    const api = {
      get(k, fallback) { try { const v = localStorage.getItem(key(k)); return v == null ? (fallback != null ? fallback : null) : v; } catch (e) { return fallback != null ? fallback : null; } },
      set(k, v) { try { localStorage.setItem(key(k), String(v)); } catch (e) {} return v; },
      remove(k) { try { localStorage.removeItem(key(k)); } catch (e) {} },
      getInt(k, fallback) { const v = parseInt(api.get(k), 10); return Number.isNaN(v) ? (fallback != null ? fallback : 0) : v; },
      getBool(k, fallback) { const v = api.get(k); return v == null ? !!fallback : (v === 'true' || v === '1'); },
      getJSON(k, fallback) { try { const v = api.get(k); return v == null ? (fallback != null ? fallback : null) : JSON.parse(v); } catch (e) { return fallback != null ? fallback : null; } },
      setJSON(k, v) { return api.set(k, JSON.stringify(v)); },
      scoped(p) { return make(prefix + p); },
    };
    return api;
  }
  K.storage = make('');
  K.createStorage = make;
})(window.Kit);
