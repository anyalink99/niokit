/* =========================================================================
   KIT — bottom sheet: slides up, swipe-down (grip or content-at-top) to
   dismiss, backdrop + Escape + scroll-lock. Driven by inline transitions so
   the drag feels native.

     Kit.sheet.open('<h3>Filters</h3>…', { onClose() {} });
     Kit.sheet.open(contentEl, { grip: true });
     Kit.sheet.close();   // closes the top sheet
   ========================================================================= */
(function (K) {
  'use strict';
  const open = [];
  const baseZ = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--k-z-sheet'), 10) || 800;

  function build(content, opts) {
    const overlay = K.el('div.k-sheet', { class: opts.className || '' });
    const backdrop = K.el('div.k-sheet__backdrop');
    const panel = K.el('div.k-sheet__panel');
    if (opts.grip !== false) panel.appendChild(K.el('div.k-sheet__grip'));
    if (typeof content === 'string') panel.insertAdjacentHTML('beforeend', content);
    else if (opts.html) panel.insertAdjacentHTML('beforeend', opts.html);
    else if (content instanceof HTMLElement) panel.appendChild(content);
    overlay.appendChild(backdrop); overlay.appendChild(panel);
    document.body.appendChild(overlay);
    return { overlay, backdrop, panel };
  }

  function cleanup(inst) {
    inst.overlay.remove();
    document.removeEventListener('keydown', inst.onKey);
    if (!open.length) document.documentElement.classList.remove('k-scroll-locked');
    if (inst.prevFocus && inst.prevFocus.focus) inst.prevFocus.focus();
    if (inst.onClose) inst.onClose();
  }

  const S = {
    open(content, opts) {
      opts = opts || {};
      const inst = build(content, opts);
      inst.onClose = opts.onClose;
      inst.prevFocus = document.activeElement;
      inst.dismissible = opts.dismissible !== false;
      inst.overlay.setAttribute('role', 'dialog');
      inst.overlay.setAttribute('aria-modal', 'true');
      inst.overlay.style.zIndex = baseZ() + open.length * 2;
      open.push(inst);

      document.documentElement.classList.add('k-scroll-locked');
      inst.overlay.classList.add('is-open');
      K.raf2(() => { inst.backdrop.style.opacity = '1'; inst.panel.style.transform = 'translateY(0)'; });

      if (inst.dismissible) inst.backdrop.addEventListener('click', () => S.close(inst.overlay));
      inst.onKey = (e) => { if (e.key === 'Escape' && inst.dismissible) S.close(inst.overlay); };
      document.addEventListener('keydown', inst.onKey);
      attachDrag(inst);
      if (opts.onOpen) opts.onOpen(inst.panel, inst.overlay);
      return inst;
    },

    close(target) {
      let inst;
      if (!target) inst = open[open.length - 1];
      else { const ov = target.overlay || target; inst = open.find((o) => o.overlay === ov); }
      if (!inst) return;
      open.splice(open.indexOf(inst), 1);
      inst.panel.style.transition = ''; inst.backdrop.style.transition = '';
      inst.panel.style.transform = 'translateY(100%)';
      inst.backdrop.style.opacity = '0';
      const ms = K.reduceMotion() ? 0 : K.cssMs('--k-dur-3') + 60;
      setTimeout(() => cleanup(inst), ms);
    },
    count() { return open.length; },
  };

  function attachDrag(inst) {
    const panel = inst.panel, backdrop = inst.backdrop;
    let dragging = false, allow = false, startY = 0, dy = 0, h = 0;
    panel.addEventListener('pointerdown', (e) => {
      allow = !!e.target.closest('.k-sheet__grip') || panel.scrollTop <= 0;
      dragging = true; startY = e.clientY; dy = 0; h = panel.offsetHeight;
    });
    panel.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const d = e.clientY - startY;
      if (!allow) return;
      if (d <= 0) { dragging = false; panel.style.transition = ''; panel.style.transform = 'translateY(0)'; return; }
      dy = d;
      panel.style.transition = 'none';
      panel.style.transform = `translateY(${dy}px)`;
      backdrop.style.opacity = String(Math.max(0, 1 - dy / (h * 1.1)));
      e.preventDefault();
      try { panel.setPointerCapture(e.pointerId); } catch (_) {}
    });
    const end = () => {
      if (!dragging) return; dragging = false;
      panel.style.transition = ''; backdrop.style.transition = '';
      if (dy > Math.min(160, h * 0.3)) S.close(inst.overlay);
      else { panel.style.transform = 'translateY(0)'; backdrop.style.opacity = '1'; }
      dy = 0;
    };
    panel.addEventListener('pointerup', end);
    panel.addEventListener('pointercancel', end);
  }

  K.sheet = S;
})(window.Kit);
