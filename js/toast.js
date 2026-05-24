/* =========================================================================
   KIT — toast: stacked, auto-dismissing, tap-to-dismiss transient messages.
     Kit.toast('Saved');                         // default
     Kit.toast.good('Done ✓');  Kit.toast.danger('Failed');
     Kit.toast.show('Custom', { type: 'warn', duration: 4000 });
   ========================================================================= */
(function (K) {
  'use strict';
  let container = null;
  const ensure = () => (container || (container = document.body.appendChild(K.el('div.k-toasts'))));

  function show(msg, opts) {
    opts = opts || {};
    const cls = 'div.k-toast' + (opts.type && opts.type !== 'default' ? '.k-toast--' + opts.type : '');
    const el = K.el(cls, { text: msg, role: 'status', 'aria-live': 'polite' });
    ensure().appendChild(el);
    const hide = () => { clearTimeout(el._t); el.classList.add('is-out'); K.afterAnim(el, K.cssMs('--k-dur-2') + 80).then(() => el.remove()); };
    el._t = setTimeout(hide, opts.duration != null ? opts.duration : 2600);
    el.addEventListener('click', hide);
    return el;
  }
  const T = (msg, opts) => show(msg, opts);
  T.show = show;
  T.good = (m, o) => show(m, Object.assign({ type: 'good' }, o));
  T.warn = (m, o) => show(m, Object.assign({ type: 'warn' }, o));
  T.danger = (m, o) => show(m, Object.assign({ type: 'danger' }, o));
  K.toast = T;
})(window.Kit);
