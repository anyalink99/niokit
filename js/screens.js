/* =========================================================================
   KIT — app skeletons. Two flavours, pick per project:

   Kit.screens — FLAT fade tabs (all screens in the DOM, crossfade between).
     <div class="k-stage">
       <section class="k-screen k-screen--fade" data-screen="home">…</section>
       <section class="k-screen k-screen--fade" data-screen="profile">…</section>
     </div>
     Kit.screens.init({ stage: '.k-stage', start: 'home',
       hooks: { profile: { onEnter(){…}, onLeave(){…} } } });
     Kit.screens.go('profile');

   Kit.nav — push/pop slide STACK (screens built on demand, iOS-style).
     Kit.nav.init({ stage: '.k-stage', start: 'home',
       screens: { home: () => buildHome(), detail: (p) => buildDetail(p) } });
     Kit.nav.push('detail', { id: 3 });   Kit.nav.back();
   ========================================================================= */
(function (K) {
  'use strict';
  const elOf = (s) => (typeof s === 'string' ? K.$(s) : s);

  /* ---------- flat fade tabs ---------- */
  const hooks = {};
  let stage = null, current = null;
  K.screens = {
    init(opts) {
      opts = opts || {};
      stage = elOf(opts.stage) || document.body;
      Object.assign(hooks, opts.hooks || {});
      K.$$('.k-screen', stage).forEach((s) => s.classList.add('k-screen--fade'));
      if (opts.start) this.go(opts.start, opts.params, true);
      return this;
    },
    register(id, h) { hooks[id] = h; return this; },
    has(id) { return !!(stage && K.$(`.k-screen[data-screen="${id}"]`, stage)); },
    current() { return current; },
    go(id, params, force) {
      if (!stage || (id === current && !force)) return;
      const target = K.$(`.k-screen[data-screen="${id}"]`, stage);
      if (!target) return;
      if (current) {
        const prev = K.$(`.k-screen[data-screen="${current}"]`, stage);
        if (prev) prev.classList.remove('is-active');
        if (hooks[current] && hooks[current].onLeave) hooks[current].onLeave();
      }
      target.classList.add('is-active');
      current = id;
      if (hooks[id] && hooks[id].onEnter) hooks[id].onEnter(params);
    },
  };

  /* ---------- push/pop slide stack ---------- */
  let nstage = null, builders = {}, stack = [], onChange = null;
  const topEl = () => (stack.length ? stack[stack.length - 1].el : null);
  function build(id, params) {
    const b = builders[id];
    if (!b) throw new Error('Kit.nav: no screen "' + id + '"');
    const el = b(params);
    el.classList.add('k-screen');
    el.dataset.screen = id;
    return el;
  }
  function emit() { if (onChange) onChange(stack.length ? stack[stack.length - 1].id : null, stack.length); }

  K.nav = {
    init(opts) {
      opts = opts || {};
      nstage = elOf(opts.stage) || document.body;
      builders = opts.screens || {};
      onChange = opts.onChange || null;
      stack = [];
      if (opts.start) this.mount(opts.start, opts.params);
      return this;
    },
    register(id, builder) { builders[id] = builder; return this; },
    depth() { return stack.length; },
    current() { return stack.length ? stack[stack.length - 1].id : null; },
    mount(id, params) { // first screen, no animation
      const el = build(id, params); nstage.appendChild(el); stack.push({ id, el }); emit(); return el;
    },
    push(id, params) {
      const below = topEl();
      const el = build(id, params);
      el.classList.add('k-screen--enter-fwd');
      nstage.appendChild(el);
      stack.push({ id, el });
      el.addEventListener('animationend', () => el.classList.remove('k-screen--enter-fwd'), { once: true });
      if (below) below.classList.add('k-screen--exit-fwd');
      emit(); return el;
    },
    back() {
      if (stack.length <= 1) return false;
      const leaving = stack.pop().el;
      const below = topEl();
      leaving.classList.remove('k-screen--enter-fwd');
      leaving.classList.add('k-screen--exit-back');
      leaving.addEventListener('animationend', () => leaving.remove(), { once: true });
      if (K.reduceMotion()) leaving.remove();
      if (below) {
        below.classList.remove('k-screen--exit-fwd');
        below.classList.add('k-screen--enter-back');
        below.addEventListener('animationend', () => below.classList.remove('k-screen--enter-back'), { once: true });
      }
      emit(); return true;
    },
    reset(id, params) {
      stack.forEach((s) => s.el.remove());
      stack = [];
      return this.mount(id, params);
    },
  };
})(window.Kit);
