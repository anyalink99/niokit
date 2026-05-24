/* Kit moodboard demo (not part of the kit). Scattered, draggable frames. */
(function () {
  'use strict';
  const K = window.Kit;
  const board = K.$('#board');
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const FRAME_SVG = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4.5" y="4.5" width="15" height="15" rx="3"/></svg>';

  function pickGroup(container, sel) {
    K.on(container, 'click', sel, (e, b) => K.$$(sel, container).forEach((x) => x.classList.toggle('is-on', x === b)));
    return container;
  }
  function frame(spec, ...kids) {
    const f = K.el('div.frame' + (spec.cls ? '.' + spec.cls : ''), { style: { left: spec.x + 'px', top: spec.y + 'px', width: (spec.w || 300) + 'px', '--rot': (spec.rot || 0) + 'deg' } });
    if (!spec.sticker) f.appendChild(K.el('div.frame__bar', {}, K.el('span', { html: FRAME_SVG }), K.el('span.nm', { text: spec.name })));
    f.appendChild(K.el('div.frame__body', {}, ...kids));
    board.appendChild(f);
    K.fx.draggable(f, { handle: spec.sticker ? null : '.frame__bar' });
    return f;
  }
  const btn = (label, cls, ds) => K.el('button.k-btn' + (cls || ''), { text: label, dataset: ds || {} });

  /* ---------- brand sticker ---------- */
  frame({ sticker: true, x: 88, y: 96, rot: -3, w: 332, cls: 'sticker' },
    K.el('div.ttl', {}, K.el('img', { src: 'icon.svg', alt: '' }), document.createTextNode('Kit')),
    K.el('div.sub', { text: 'Один стек на все vanilla-проекты — токены, движок анимаций, скелеты, оверлеи, компоненты.' }),
    K.el('div.from', { text: 'best of geometric · mafia · settrainer' })
  );

  /* ---------- buttons ---------- */
  frame({ name: 'buttons', x: 472, y: 84, rot: 2, w: 392 },
    K.el('div.row-flex', {},
      btn('Primary', '.k-btn--primary', { action: 'say', msg: 'Primary' }),
      btn('Default', '', { action: 'say', msg: 'Default' }),
      btn('Ghost', '.k-btn--ghost', { action: 'say', msg: 'Ghost' }),
      btn('Danger', '.k-btn--danger', { action: 'say', msg: 'Danger' }),
      btn('3D press', '.k-btn--3d', { action: 'say', msg: '3D' })
    )
  );

  /* ---------- controls ---------- */
  const sw = (label, checked, disabled) => K.el('div.k-row', {},
    K.el('span.k-row__label', { text: label }),
    K.el('label.k-switch', {}, K.el('input', { type: 'checkbox', checked: !!checked, disabled: !!disabled }), K.el('span.k-switch__track')));
  frame({ name: 'controls', x: 100, y: 392, rot: -1.5, w: 330 },
    pickGroup(K.el('div.k-segment', { style: { marginBottom: '12px' } },
      K.el('button.k-segment__opt.is-on', { text: 'День', dataset: { seg: 'day' } }),
      K.el('button.k-segment__opt', { text: 'Неделя', dataset: { seg: 'week' } }),
      K.el('button.k-segment__opt', { text: 'Всё', dataset: { seg: 'all' } })), '.k-segment__opt'),
    sw('Уведомления', true), sw('Звук', false), sw('Вибрация', false, true),
    K.el('div.k-row', {}, K.el('span.k-row__label', { text: 'Громкость' }), K.el('input.k-range', { type: 'range', min: 0, max: 100, value: 60, style: { maxWidth: '130px' } }))
  );

  /* ---------- select (cards + chips) ---------- */
  const card = (t, s, on) => K.el('button.k-card' + (on ? '.is-on' : ''), {}, K.el('b', { text: t }), K.el('div.muted', { text: s }));
  frame({ name: 'select', x: 520, y: 476, rot: 1.5, w: 318 },
    pickGroup(K.el('div.grid2', {}, card('Standard', '81 карта', true), card('Classic', '12 фигур', false)), '.k-card'),
    pickGroup(K.el('div.row-flex', { style: { marginTop: '12px' } }, ...['6a', '6b', '6c', '7a'].map((g, i) => K.el('button.k-chip' + (i === 0 ? '.is-on' : ''), { text: g }))), '.k-chip')
  );

  /* ---------- overlays ---------- */
  frame({ name: 'overlays', x: 904, y: 96, rot: -2, w: 322 },
    K.el('div.row-flex', {},
      btn('Модалка', '.k-btn--primary', { action: 'modal' }),
      btn('Шит', '', { action: 'sheet' }),
      btn('Toast', '', { action: 'toast', type: 'default' }),
      btn('Good', '', { action: 'toast', type: 'good' }),
      btn('Danger', '', { action: 'toast', type: 'danger' })
    )
  );

  /* ---------- screens: flat tabs ---------- */
  const tScreen = (id, title, note) => K.el('section.k-screen', { dataset: { screen: id } }, K.el('div.pad', {}, K.el('h3', { text: title }), K.el('p.muted', { text: note })));
  frame({ name: 'screens · tabs', x: 884, y: 424, rot: 1.5, w: 300 },
    K.el('div.device', {},
      K.el('div.k-stage#tabs-stage', {}, tScreen('t1', 'Лента', 'Кроссфейд между экранами.'), tScreen('t2', 'Поиск', 'onEnter-хук на входе.'), tScreen('t3', 'Профиль', 'tab-bar навигация.')),
      pickGroup(K.el('div.demo-tabbar#tabs-bar', {}, K.el('button.is-on', { text: 'Лента', dataset: { tab: 't1' } }), K.el('button', { text: 'Поиск', dataset: { tab: 't2' } }), K.el('button', { text: 'Профиль', dataset: { tab: 't3' } })), 'button'))
  );

  /* ---------- screens: push/pop stack ---------- */
  frame({ name: 'screens · stack', x: 1244, y: 150, rot: -1, w: 300 }, K.el('div.device', {}, K.el('div.k-stage#nav-stage', {})));

  /* ---------- store ---------- */
  frame({ name: 'store', x: 150, y: 772, rot: 2, w: 296 },
    K.el('div.row-flex', {},
      btn('−', '', { action: 'dec' }), K.el('div.count#count-a', { text: '0' }), btn('+', '', { action: 'inc' }),
      K.el('span.muted', { text: '×2' }), K.el('b#count-b', { text: '0' }))
  );

  /* ---------- color picker ---------- */
  const cpHost = K.el('div');
  frame({ name: 'color picker', x: 506, y: 838, rot: -1.5, w: 272 }, cpHost);

  /* ---------- keybinds (compact) ---------- */
  const kbHost = K.el('div#kb-rows');
  frame({ name: 'keybinds', x: 904, y: 806, rot: 1.5, w: 238 }, kbHost);

  /* ---------- tokens ---------- */
  const tokHost = K.el('div.sw-row#token-strip');
  frame({ name: 'tokens', x: 1248, y: 520, rot: -2, w: 360 }, tokHost,
    K.el('p.muted', { style: { marginTop: '12px' }, html: 'Перекрась одну <b style="color:var(--k-text-2)">--k-*</b> — обновится и кит, и страница.' }));

  /* ---------- fx ---------- */
  const morphBox = K.el('div#morph-box', { style: { marginTop: '12px', background: 'var(--k-surface-2)', border: '1px solid var(--k-line)', borderRadius: '12px', padding: '14px', fontSize: '13px' } }, K.el('p', { text: 'Нажми height — блок плавно сморфит высоту.' }));
  frame({ name: 'fx', x: 1232, y: 858, rot: 1.5, w: 330 },
    K.el('div.row-flex', {}, btn('height', '', { action: 'morph' }), K.el('button.k-btn#lp', { text: 'long-press' }), K.el('button.k-btn#swipezone', { text: 'swipe ↔' })),
    morphBox
  );

  /* ===================== wiring ===================== */
  K.dispatch.actions({
    say: (el) => K.toast(el.dataset.msg + ' нажата'),
    modal: () => K.modal.open('demo-modal'),
    'modal-nested': () => K.modal.open({ html: '<h2 style="font-family:var(--k-font-display);font-weight:700;font-size:22px;margin-bottom:8px">Вложенная</h2><p style="color:var(--k-text-3)">Стекинг: поверх первой, Escape закрывает верхнюю.</p>' }),
    sheet: () => {
      const list = Array.from({ length: 16 }, (_, i) => `<div class="k-row" style="margin-top:8px"><span class="k-row__label">Пункт ${i + 1}</span></div>`).join('');
      K.sheet.open('<div style="font-family:var(--k-font-display);font-size:22px;font-weight:700;margin-bottom:4px">Шит со списком</div><p style="color:var(--k-text-3);font-size:13px">Свайп вниз за ручку — закрыть.</p>' + list);
    },
    toast: (el) => K.toast.show('Тост: ' + el.dataset.type, { type: el.dataset.type }),
    inc: () => store.set('n', store.get('n') + 1),
    dec: () => store.set('n', store.get('n') - 1),
    morph: () => {
      morphBox._big = !morphBox._big;
      K.fx.animateHeight(morphBox, () => { morphBox.innerHTML = morphBox._big
        ? '<p>Высота плавно меняется через Web Animations API (FLIP).</p><p style="margin-top:10px">Вторая строка…</p><p style="margin-top:10px">…и третья.</p>'
        : '<p>Нажми height — блок плавно сморфит высоту.</p>'; });
    },
  }).init();

  K.$('#demo-modal-ok').addEventListener('click', () => K.modal.close('demo-modal'));

  /* screens */
  K.screens.init({ stage: '#tabs-stage', start: 't1' });
  K.on(K.$('#tabs-bar'), 'click', 'button', (e, b) => K.screens.go(b.dataset.tab));
  const navHome = () => K.el('section', {}, K.el('div.pad', {},
    K.el('h3', { text: 'Главная' }), K.el('p.muted', { text: 'Уходи вглубь со слайдом.' }),
    K.el('button.k-btn.k-btn--primary.k-btn--sm', { text: 'Деталь →', style: { marginTop: '12px' }, on: { click: () => K.nav.push('detail', { n: K.nav.depth() }) } })));
  const navDetail = (p) => K.el('section', {}, K.el('div.pad', {},
    K.el('button.k-btn.k-btn--ghost.k-btn--sm', { text: '← Назад', on: { click: () => K.nav.back() } }),
    K.el('h3', { text: 'Деталь #' + (p && p.n != null ? p.n : '?'), style: { marginTop: '12px' } }),
    K.el('button.k-btn.k-btn--sm', { text: 'Глубже →', style: { marginTop: '12px' }, on: { click: () => K.nav.push('detail', { n: K.nav.depth() }) } })));
  K.nav.init({ stage: '#nav-stage', start: 'home', screens: { home: navHome, detail: navDetail } });

  /* store */
  const store = K.createStore({ n: 0 });
  store.on('n', (v) => { K.$('#count-a').textContent = v; K.$('#count-b').textContent = v; });

  /* color picker */
  const picker = K.ColorPicker.mount(cpHost, { value: cssVar('--k-accent'), onChange: (hex) => document.documentElement.style.setProperty('--k-accent', hex) });

  /* keybinds (compact, 2 keys) */
  const kb = K.keybinds.create({ binds: { shuffle: 'Space', reset: 'KeyR' }, onChange: renderKeys });
  kb.on('shuffle', () => K.toast('⌨ shuffle'));
  kb.on('reset', () => K.toast('⌨ reset'));
  kb.onCapture(() => renderKeys());
  function renderKeys() {
    const labels = { shuffle: 'Перемешать', reset: 'Сброс' };
    kbHost.innerHTML = '';
    Object.keys(labels).forEach((a) => kbHost.appendChild(K.el('div.k-row', {},
      K.el('span.k-row__label', { text: labels[a] }),
      K.el('button.k-btn.k-btn--sm.kb-key', { text: kb.capturing() === a ? 'жми…' : K.keybinds.label(kb.get(a)), on: { click: () => { kb.start(a); renderKeys(); } } }))));
  }
  renderKeys();

  /* fx */
  K.fx.longpress(K.$('#lp'), () => K.toast('Long-press!'), { ms: 450 });
  K.fx.press(K.$('#lp'));
  K.fx.swipe(K.$('#swipezone'), { onSwipe: (dir) => K.toast('Свайп: ' + dir) });

  /* ---------- themes (crossfade via View Transitions) ---------- */
  const THEMES = [
    { id: 'geometric', name: 'Geometric', dots: ['#1a161d', '#382f42', '#c084fc'] },
    { id: 'mafia', name: 'Mafia', dots: ['#0c0a09', '#292524', '#d4af37'] },
    { id: 'settrainer', name: 'Settrainer', dots: ['#1a161d', '#3d3442', '#ec4899'] },
    { id: 'light', name: 'Light', dots: ['#f4f2ec', '#ece8df', '#2f7d32'] },
  ];
  let current = document.documentElement.getAttribute('data-theme') || 'geometric';
  const bar = K.$('#themebar');
  THEMES.forEach((t) => bar.appendChild(K.el('button', { dataset: { id: t.id }, on: { click: () => switchTheme(t.id) } },
    K.el('span.d', {}, ...t.dots.map((c) => K.el('i', { style: { background: c } }))), K.el('span', { text: t.name }))));

  const TOKENS = [['--k-bg', 'bg'], ['--k-surface', 'surface'], ['--k-surface-2', 'surface-2'], ['--k-text', 'text'], ['--k-accent', 'accent'], ['--k-good', 'good'], ['--k-warn', 'warn'], ['--k-danger', 'danger']];
  function refreshTokens() {
    tokHost.innerHTML = '';
    TOKENS.forEach(([v, label]) => tokHost.appendChild(K.el('i', { title: label + ' ' + cssVar(v), style: { background: cssVar(v) } })));
  }
  function applyTheme(id) {
    current = id; K.setTheme(id);
    try { localStorage.setItem('kit.demo.theme', id); } catch (e) {}
    document.documentElement.style.removeProperty('--k-accent');
    K.$$('#themebar button').forEach((b) => b.classList.toggle('is-on', b.dataset.id === id));
    refreshTokens();
    if (picker) picker.set(cssVar('--k-accent'));
    const meta = K.$('#meta-theme'); if (meta) meta.setAttribute('content', cssVar('--k-bg'));
  }
  function switchTheme(id) {
    if (document.startViewTransition && !K.reduceMotion()) document.startViewTransition(() => applyTheme(id));
    else applyTheme(id);
  }
  applyTheme(current);

  /* center the canvas on the content */
  const vp = K.$('#viewport');
  vp.scrollTo({ left: 60, top: 40 });
})();
