/* =========================================================================
   KIT — keybind manager: capture/rebind/dedupe, layout-independent (uses
   event.code, so Cyrillic/QWERTY/etc. all work). Optional persistence.

     const kb = Kit.keybinds.create({
       binds: { shuffle: 'Space', reset: 'KeyR' },
       persist: 'app.binds',
       onChange: (binds) => renderKeys(),
     });
     kb.on('shuffle', () => doShuffle());   // fires when bound key pressed
     kb.start('shuffle');                   // arm rebinding; next key is captured
     kb.onCapture((action) => render());    // capture finished/cancelled
     Kit.keybinds.label('KeyR') // -> 'R'
   ========================================================================= */
(function (K) {
  'use strict';

  function label(code) {
    if (!code) return '—';
    return code
      .replace(/^Key/, '').replace(/^Digit/, '')
      .replace('ArrowLeft', '←').replace('ArrowRight', '→').replace('ArrowUp', '↑').replace('ArrowDown', '↓')
      .replace('Backquote', '`').replace('Minus', '-').replace('Equal', '=')
      .replace('BracketLeft', '[').replace('BracketRight', ']')
      .replace('Semicolon', ';').replace('Quote', "'").replace('Comma', ',').replace('Period', '.').replace('Slash', '/')
      .replace('ControlLeft', 'Ctrl').replace('ControlRight', 'Ctrl')
      .replace('ShiftLeft', 'Shift').replace('ShiftRight', 'Shift');
  }

  function create(opts) {
    opts = opts || {};
    const binds = Object.assign({}, opts.binds || {});
    const persist = opts.persist || null;
    const actionCbs = {};
    let capturing = null, captureCb = null;
    if (persist) { const saved = K.storage.getJSON(persist, null); if (saved) Object.assign(binds, saved); }
    const save = () => { if (persist) K.storage.setJSON(persist, binds); };

    const handler = (e) => {
      if (capturing) {
        e.preventDefault();
        if (e.code === 'Escape') { capturing = null; if (captureCb) captureCb(null, binds); return; }
        for (const a in binds) if (binds[a] === e.code) delete binds[a]; // dedupe
        binds[capturing] = e.code;
        const done = capturing; capturing = null; save();
        if (captureCb) captureCb(done, binds);
        if (opts.onChange) opts.onChange(binds);
        return;
      }
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      for (const a in binds) {
        if (binds[a] === e.code && actionCbs[a]) { e.preventDefault(); actionCbs[a](e); }
      }
    };
    document.addEventListener('keydown', handler);

    return {
      binds,
      get: (a) => binds[a],
      set: (a, code) => { binds[a] = code; save(); if (opts.onChange) opts.onChange(binds); },
      on: (a, cb) => { actionCbs[a] = cb; },
      start: (a) => { capturing = a; },
      cancel: () => { capturing = null; },
      capturing: () => capturing,
      onCapture: (cb) => { captureCb = cb; },
      match: (e) => { for (const a in binds) if (binds[a] === e.code) return a; return null; },
      label,
      destroy: () => document.removeEventListener('keydown', handler),
    };
  }

  K.keybinds = { create, label };
})(window.Kit);
