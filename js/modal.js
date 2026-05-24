/* =========================================================================
   KIT — modal: accessible dialog with backdrop, scroll-lock, focus-trap,
   Escape, restore-focus and stacking. Closes on animationend (no magic ms).

   Pre-existing markup:
     <div class="k-modal" id="help"><div class="k-modal__backdrop"></div>
       <div class="k-modal__panel">…</div></div>
     Kit.modal.open('help');

   Built on the fly (auto-removed on close):
     Kit.modal.open({ html: '<h2>Hi</h2>' });
     Kit.modal.open(someContentEl, { dismissible: true, onClose() {} });
   ========================================================================= */
(function (K) {
  'use strict';
  const open = [];
  const baseZ = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--k-z-modal'), 10) || 900;
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function resolve(target, opts) {
    let overlay = null, created = false;
    if (typeof target === 'string') overlay = document.getElementById(target);
    else if (target instanceof HTMLElement && target.classList.contains('k-modal')) overlay = target;

    if (!overlay) {
      created = true;
      overlay = K.el('div.k-modal', { class: opts.className || '' });
      const backdrop = K.el('div.k-modal__backdrop');
      const panel = K.el('div.k-modal__panel');
      if (typeof target === 'string') panel.innerHTML = target;       // html string
      else if (opts.html) panel.innerHTML = opts.html;
      else if (target instanceof HTMLElement) panel.appendChild(target); // content node
      overlay.appendChild(backdrop); overlay.appendChild(panel);
      document.body.appendChild(overlay);
    } else if (!overlay.querySelector('.k-modal__backdrop')) {
      overlay.insertBefore(K.el('div.k-modal__backdrop'), overlay.firstChild);
    }
    return { overlay, created };
  }

  const M = {
    open(target, opts) {
      opts = opts || {};
      const dismissible = opts.dismissible !== false;
      const { overlay, created } = resolve(target, opts);
      const panel = overlay.querySelector('.k-modal__panel');
      const backdrop = overlay.querySelector('.k-modal__backdrop');

      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      panel.setAttribute('tabindex', '-1');
      overlay.style.zIndex = baseZ() + open.length * 2;

      const inst = { overlay, panel, created, onClose: opts.onClose, prevFocus: document.activeElement };

      const onKey = (e) => {
        if (e.key === 'Escape' && dismissible) { e.stopPropagation(); M.close(overlay); }
        else if (e.key === 'Tab') {
          const f = K.$$(FOCUSABLE, panel).filter((n) => n.offsetParent !== null);
          if (!f.length) { e.preventDefault(); return; }
          const first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      inst.onKey = onKey;
      overlay.addEventListener('keydown', onKey);
      if (dismissible) backdrop.addEventListener('click', () => M.close(overlay));

      open.push(inst);
      K.lockScroll();
      overlay.classList.remove('is-closing');
      overlay.classList.add('is-open');

      K.raf2(() => { const f = K.$$(FOCUSABLE, panel).filter((n) => n.offsetParent !== null); (f[0] || panel).focus(); });
      if (opts.onOpen) opts.onOpen(panel, overlay);
      return inst;
    },

    close(target) {
      const overlay = typeof target === 'string' ? document.getElementById(target) : (target && target.overlay) || target;
      const i = open.findIndex((o) => o.overlay === overlay);
      if (i === -1) return;
      const inst = open.splice(i, 1)[0];
      inst.overlay.classList.add('is-closing');
      K.afterAnim(inst.panel, K.cssMs('--k-dur-2') + 80).then(() => {
        inst.overlay.classList.remove('is-open', 'is-closing');
        inst.overlay.removeEventListener('keydown', inst.onKey);
        if (inst.created) inst.overlay.remove();
        K.unlockScroll();
        if (inst.prevFocus && inst.prevFocus.focus) inst.prevFocus.focus();
        if (inst.onClose) inst.onClose();
      });
    },

    closeTop() { if (open.length) M.close(open[open.length - 1].overlay); },
    count() { return open.length; },
  };
  K.modal = M;
})(window.Kit);
