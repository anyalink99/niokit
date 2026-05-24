/* =========================================================================
   KIT — history router (lifted from geometric.games). Path + query routing
   with a graceful file:// fallback (keeps an in-memory path when the History
   API is unavailable, so the same code works opened as a file).

     Kit.router.init({ onRoute: (r) => render(r) });   // r = {path, segments, query}
     Kit.router.push('/cut/half?daily=1');
     Kit.router.replace('/');
   ========================================================================= */
(function (K) {
  'use strict';
  function canPush() { try { return location.protocol !== 'file:' && !!window.history && typeof history.pushState === 'function'; } catch (e) { return false; } }
  let mem = location.pathname + location.search;
  let onRoute = null;

  function parse() {
    const full = canPush() ? (location.pathname + location.search) : mem;
    const path = full.split('?')[0];
    const search = full.indexOf('?') >= 0 ? full.slice(full.indexOf('?')) : '';
    const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    const query = {}; new URLSearchParams(search).forEach((v, k) => { query[k] = v; });
    return { path, segments, query };
  }
  function go(url, replace) {
    if (canPush()) history[replace ? 'replaceState' : 'pushState']({}, '', url);
    else mem = url;
    if (onRoute) onRoute(parse());
  }
  const R = {
    init(opts) {
      opts = opts || {}; onRoute = opts.onRoute || null;
      if (canPush()) window.addEventListener('popstate', () => { if (onRoute) onRoute(parse()); });
      if (opts.fire !== false && onRoute) onRoute(parse());
      return R;
    },
    parse,
    push: (url) => go(url, false),
    replace: (url) => go(url, true),
    canPush,
  };
  K.router = R;
})(window.Kit);
