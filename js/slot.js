/* =========================================================================
   KIT — slot: inline collapsible side panel for flex rows.

   The heavy lifting is in CSS (.k-slot in components.css) — negative-margin
   gap-cancel math means the panel can sit in layout permanently and just
   animate width:0 ⇄ width:N without leaving phantom gaps. This module is
   just a thin class-toggle wrapper that uses raf2 so a freshly-mounted
   slot transitions from 0 instead of jumping to its open width.

     <aside class="k-slot" id="detail">…</aside>
     Kit.slot.open('detail');
     Kit.slot.close('detail');
     Kit.slot.toggle('detail');           // flip current state
     Kit.slot.toggle('detail', true);     // force open
     Kit.slot.isOpen('detail') -> bool
   ========================================================================= */
(function (K) {
  'use strict';

  function resolve(target) {
    if (typeof target === 'string') return document.getElementById(target);
    if (target instanceof HTMLElement) return target;
    return null;
  }

  const S = {
    open(target) {
      const el = resolve(target);
      if (!el || el.classList.contains('is-open')) return;
      const tick = K.raf2 || ((cb) => requestAnimationFrame(() => requestAnimationFrame(cb)));
      tick(() => el.classList.add('is-open'));
    },
    close(target) {
      const el = resolve(target);
      if (el) el.classList.remove('is-open');
    },
    toggle(target, force) {
      if (typeof force === 'boolean') return force ? S.open(target) : S.close(target);
      const el = resolve(target);
      if (!el) return;
      if (el.classList.contains('is-open')) S.close(target);
      else S.open(target);
    },
    isOpen(target) {
      const el = resolve(target);
      return !!(el && el.classList.contains('is-open'));
    },
  };

  K.slot = S;
})(window.Kit);
