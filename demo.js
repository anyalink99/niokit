/* Kit kitchen-sink demo wiring (not part of the kit itself). */
(function () {
  'use strict';
  const K = window.Kit;

  /* ---------- palettes ---------- */
  const THEMES = [
    { id: 'geometric', name: 'Geometric', from: 'geometric.games', dots: ['#1a161d', '#382f42', '#c084fc'] },
    { id: 'mafia', name: 'Mafia', from: 'mafia-host-app', dots: ['#0c0a09', '#292524', '#d4af37'] },
    { id: 'settrainer', name: 'Settrainer', from: 'settrainer', dots: ['#1a161d', '#3d3442', '#ec4899'] },
    { id: 'light', name: 'Light', from: 'kit', dots: ['#f4f2ec', '#ece8df', '#2f7d32'] },
  ];
  let current = document.documentElement.getAttribute('data-theme') || 'geometric';

  const palettes = K.$('#palettes');
  THEMES.forEach((t) => {
    const b = K.el('button.pal', { dataset: { id: t.id }, on: { click: () => applyTheme(t.id) } },
      K.el('span.dots', {}, ...t.dots.map((c) => K.el('i', { style: { background: c } }))),
      K.el('span', {}, K.el('span.pal-name', { text: t.name }), K.el('span.pal-from', { html: '<br>' + t.from }))
    );
    palettes.appendChild(b);
  });

  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const TOKENS = [['--k-bg', 'bg'], ['--k-surface', 'surface'], ['--k-surface-2', 'surface-2'], ['--k-text', 'text'], ['--k-accent', 'accent'], ['--k-good', 'good'], ['--k-warn', 'warn'], ['--k-danger', 'danger']];

  function refreshTokenUI() {
    const strip = K.$('#token-strip'); strip.innerHTML = '';
    TOKENS.forEach(([v, label]) => {
      const val = cssVar(v);
      strip.appendChild(K.el('div.sw', {}, K.el('i', { style: { background: val } }), K.el('span', { text: label }), K.el('span', { text: val })));
    });
    const fam = (cssVar('--k-font-display') || '').split(',')[0].replace(/['"]/g, '') || 'system';
    K.$('#font-name').textContent = fam;
    const meta = K.$('#meta-theme'); if (meta) meta.setAttribute('content', cssVar('--k-bg'));
  }

  function applyTheme(id) {
    current = id;
    K.setTheme(id);
    document.documentElement.style.removeProperty('--k-accent'); // drop any color-picker override
    try { localStorage.setItem('kit.demo.theme', id); } catch (e) {}
    K.$$('.pal').forEach((p) => p.classList.toggle('is-on', p.dataset.id === id));
    refreshTokenUI();
    if (picker) picker.set(cssVar('--k-accent'));
  }

  /* ---------- table of contents + scroll-spy ---------- */
  const SECTIONS = [['01', 'Основа'], ['02', 'Кнопки'], ['03', 'Контролы'], ['04', 'Оверлеи'], ['05', 'Экраны'], ['06', 'Стор'], ['07', 'Color'], ['08', 'Хоткеи'], ['09', 'FX'], ['10', 'PWA']];
  const toc = K.$('#toc');
  SECTIONS.forEach(([n, name]) => {
    toc.appendChild(K.el('a', { href: '#sec-' + n, dataset: { sec: 'sec-' + n } }, K.el('span.n', { text: n }), K.el('span', { text: name })));
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) {
      K.$$('#toc a').forEach((a) => a.classList.toggle('is-on', a.dataset.sec === e.target.id));
    } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  K.$$('.spec').forEach((s) => spy.observe(s));

  /* ---------- dispatch ---------- */
  K.dispatch.actions({
    say: (el) => K.toast(el.dataset.msg + ' нажата'),
    modal: () => K.modal.open('demo-modal'),
    'modal-nested': () => K.modal.open({ html: '<h2 style="font-family:var(--k-font-display);font-weight:700;font-size:22px;margin-bottom:8px">Вложенная</h2><p style="color:var(--k-text-3)">Стекинг: поверх первой. Escape закрывает верхнюю, фон по-прежнему не уезжает.</p>' }),
    sheet: () => {
      const list = Array.from({ length: 16 }, (_, i) => `<div class="k-row" style="margin-top:8px"><span class="k-row__label">Пункт ${i + 1}</span></div>`).join('');
      K.sheet.open('<div style="font-family:var(--k-font-display);font-size:22px;font-weight:700;margin-bottom:4px">Шит со списком</div><p style="color:var(--k-text-3);font-size:13px">Свайп вниз за ручку — закрыть.</p>' + list);
    },
    toast: (el) => K.toast.show('Тост: ' + el.dataset.type, { type: el.dataset.type }),
    inc: () => store.set('n', store.get('n') + 1),
    dec: () => store.set('n', store.get('n') - 1),
    morph: () => {
      const box = K.$('#morph-box'); box._big = !box._big;
      K.fx.animateHeight(box, () => { box.innerHTML = box._big
        ? '<p>Высота плавно меняется через Web Animations API (FLIP).</p><p style="margin-top:10px">Вторая строка…</p><p style="margin-top:10px">…и третья, чтобы блок заметно подрос.</p>'
        : '<p>Нажми «animateHeight» — блок плавно сморфит высоту при смене контента.</p>'; });
    },
    install: () => { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; } },
  }).init();

  K.$('#demo-modal-ok').addEventListener('click', () => K.modal.close('demo-modal'));

  /* ---------- single-select groups (segment / chips / cards) ---------- */
  function pickGroup(container, sel) {
    K.on(container, 'click', sel, (e, b) => K.$$(sel, container).forEach((x) => x.classList.toggle('is-on', x === b)));
  }
  pickGroup(K.$('#seg'), '.k-segment__opt');
  pickGroup(K.$('#chips'), '.k-chip');
  pickGroup(K.$('#cards'), '.k-card');

  /* ---------- screens: flat tabs ---------- */
  K.screens.init({ stage: '#tabs-stage', start: 't1', hooks: { t2: { onEnter: () => console.log('entered Поиск') } } });
  K.on(K.$('#tabs-bar'), 'click', 'button', (e, b) => {
    K.screens.go(b.dataset.tab);
    K.$$('#tabs-bar button').forEach((x) => x.classList.toggle('is-on', x === b));
  });

  /* ---------- screens: push/pop stack ---------- */
  const navHome = () => K.el('section', {}, K.el('div.pad', {},
    K.el('h3', { text: 'Главная' }),
    K.el('p.muted', { text: 'Уходи вглубь со слайдом.' }),
    K.el('button.k-btn.k-btn--primary', { text: 'Открыть деталь →', style: { marginTop: '14px' }, on: { click: () => K.nav.push('detail', { n: K.nav.depth() }) } })));
  const navDetail = (p) => K.el('section', {}, K.el('div.pad', {},
    K.el('button.k-btn.k-btn--ghost.k-btn--sm', { text: '← Назад', on: { click: () => K.nav.back() } }),
    K.el('h3', { text: 'Деталь #' + (p && p.n != null ? p.n : '?'), style: { marginTop: '14px' } }),
    K.el('p.muted', { text: 'Можно ещё глубже.' }),
    K.el('button.k-btn', { text: 'Глубже →', style: { marginTop: '14px' }, on: { click: () => K.nav.push('detail', { n: K.nav.depth() }) } })));
  K.nav.init({ stage: '#nav-stage', start: 'home', screens: { home: navHome, detail: navDetail } });

  /* ---------- store ---------- */
  const store = K.createStore({ n: 0 });
  store.on('n', (v) => { K.$('#count-a').textContent = v; K.$('#count-b').textContent = v; });

  /* ---------- color picker (tweaks the live accent) ---------- */
  const picker = K.ColorPicker.mount(K.$('#cp-inline'), { value: cssVar('--k-accent'), onChange: (hex) => document.documentElement.style.setProperty('--k-accent', hex) });

  /* ---------- keybinds ---------- */
  const kb = K.keybinds.create({ binds: { shuffle: 'Space', reset: 'KeyR', hint: 'KeyH' }, onChange: renderKeys });
  kb.on('shuffle', () => K.toast('⌨ shuffle'));
  kb.on('reset', () => K.toast('⌨ reset'));
  kb.on('hint', () => K.toast('⌨ hint'));
  kb.onCapture(() => renderKeys());
  function renderKeys() {
    const labels = { shuffle: 'Перемешать', reset: 'Сброс', hint: 'Подсказка' };
    const wrap = K.$('#kb-rows'); wrap.innerHTML = '';
    Object.keys(labels).forEach((a) => {
      wrap.appendChild(K.el('div.k-row', {},
        K.el('span.k-row__label', { text: labels[a] }),
        K.el('button.k-btn.k-btn--sm.kb-key', { text: kb.capturing() === a ? 'жми клавишу…' : K.keybinds.label(kb.get(a)), on: { click: () => { kb.start(a); renderKeys(); } } })));
    });
  }
  renderKeys();

  /* ---------- fx ---------- */
  K.fx.longpress(K.$('#lp'), () => K.toast('Long-press!'), { ms: 450 });
  K.fx.press(K.$('#lp'));
  K.fx.swipe(K.$('#swipezone'), { onSwipe: (dir) => K.toast('Свайп: ' + dir) });

  /* ---------- PWA ---------- */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const b = K.$('#install-btn'); if (b) b.style.display = ''; });
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
  (function pwaStatus() {
    const el = K.$('#pwa-status');
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) el.textContent = 'Запущено как установленное приложение.';
    else if (location.protocol === 'file:') el.textContent = 'Открыто как файл — манифест и SEO активны; service-worker и установка включаются при отдаче по http(s).';
    else el.textContent = 'Готово к установке. Service-worker зарегистрирован, офлайн-кэш активен.';
  })();

  /* ---------- boot ---------- */
  applyTheme(current);
})();
