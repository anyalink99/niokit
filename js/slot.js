/* =========================================================================
   KIT — slot: inline collapsible side panel for flex rows.

   The heavy lifting is in CSS (.k-slot in components.css — see comment
   there for the THREE setup requirements: parent flex+gap, --k-slot-cancel
   = parent_gap / 2, and content in a CHILD div, not directly on .k-slot).

   This module is just a thin class-toggle wrapper. The only smart bit is
   raf2 on open() — a slot that was JUST mounted with class added in the
   same tick would skip the transition and snap straight to its open width.
   Two requestAnimationFrame ticks ensure the browser has painted the
   initial width:0 state before we add .is-open.

     <aside class="k-slot" id="detail" style="--k-slot-w: 22rem">
       <div>your content with padding/bg/etc</div>
     </aside>
     Kit.slot.open('detail');
     Kit.slot.close('detail');
     Kit.slot.toggle('detail');           // flip current state
     Kit.slot.toggle('detail', true);     // force open (idempotent)
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
