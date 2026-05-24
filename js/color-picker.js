/* =========================================================================
   KIT — color picker (SV square + hue bar + hex), pointer & touch, no deps.
     const cp = Kit.ColorPicker.mount(containerEl, {
       value: '#c8ff5e', onChange: (hex) => {}
     });  // -> { get(), set(hex), destroy() }

     Kit.ColorPicker.open({ value, onChange, onDone });  // inside a kit modal
   ========================================================================= */
(function (K) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function hexToRgb(hex) {
    let h = String(hex).replace('#', '').trim();
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return { h, s: mx ? d / mx : 0, v: mx };
  }
  function hsvToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
  }

  function mount(container, opts) {
    opts = opts || {};
    let h = 0, s = 1, v = 1;
    const root = K.el('div.k-cp', {},
      K.el('div.k-cp__sv', {}, K.el('div.k-cp__thumb.k-cp__sv-thumb')),
      K.el('div.k-cp__hue', {}, K.el('div.k-cp__thumb.k-cp__hue-thumb')),
      K.el('div.k-cp__row', {},
        K.el('input.k-field.k-cp__hex', { type: 'text', spellcheck: false, maxlength: 7 }),
        K.el('div.k-cp__swatch')
      )
    );
    container.appendChild(root);
    const sv = K.$('.k-cp__sv', root), hue = K.$('.k-cp__hue', root);
    const svThumb = K.$('.k-cp__sv-thumb', root), hueThumb = K.$('.k-cp__hue-thumb', root);
    const hex = K.$('.k-cp__hex', root), swatch = K.$('.k-cp__swatch', root);

    function current() { const c = hsvToRgb(h, s, v); return rgbToHex(c.r, c.g, c.b); }
    function paint(emit) {
      sv.style.background = `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), hsl(${h} 100% 50%)`;
      svThumb.style.left = s * 100 + '%';
      svThumb.style.top = (1 - v) * 100 + '%';
      hueThumb.style.left = (h / 360) * 100 + '%';
      const hexv = current();
      swatch.style.background = hexv;
      if (document.activeElement !== hex) hex.value = hexv.toUpperCase();
      if (emit && opts.onChange) opts.onChange(hexv);
    }
    function setHex(val) {
      const rgb = hexToRgb(val); if (!rgb) return false;
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b); h = hsv.h; s = hsv.s; v = hsv.v; return true;
    }

    function drag(el, onMove) {
      const handler = (e) => { const r = el.getBoundingClientRect(); onMove(clamp(e.clientX - r.left, 0, r.width) / r.width, clamp(e.clientY - r.top, 0, r.height) / r.height); paint(true); };
      el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); handler(e); const mv = (ev) => handler(ev); const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); }; el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); });
    }
    drag(sv, (x, y) => { s = x; v = 1 - y; });
    drag(hue, (x) => { h = x * 360; });
    hex.addEventListener('input', () => { let val = hex.value.trim(); if (val[0] !== '#') val = '#' + val; if (setHex(val)) paint(true); });

    if (opts.value) setHex(opts.value);
    paint(false);
    return { get: current, set: (val) => { if (setHex(val)) paint(false); }, destroy: () => root.remove(), el: root };
  }

  function openModal(opts) {
    opts = opts || {};
    const wrap = K.el('div', { style: { display: 'grid', gap: '14px', placeItems: 'center' } });
    const cp = mount(wrap, { value: opts.value, onChange: opts.onChange });
    const actions = K.el('div', { style: { display: 'flex', gap: '8px', width: '100%' } },
      K.el('button.k-btn.k-btn--block', { text: 'Отмена', on: { click: () => K.modal.close(inst.overlay) } }),
      K.el('button.k-btn.k-btn--primary.k-btn--block', { text: 'Готово', on: { click: () => { if (opts.onDone) opts.onDone(cp.get()); K.modal.close(inst.overlay); } } })
    );
    wrap.appendChild(actions);
    const inst = K.modal.open(wrap, { onClose: opts.onClose });
    return cp;
  }

  K.ColorPicker = { mount, open: openModal, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb };
})(window.Kit);
