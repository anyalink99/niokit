/* =========================================================================
   KIT — accordion: vertical collapsible sections with measured max-height
   animation (no magic 99999px hack, no jump on close).

   The hard part is animating to/from auto-height. CSS can't transition to
   `height: auto`, so we measure the inner element's scrollHeight, write it
   as an explicit max-height (which CAN transition from 0), and switch to
   `max-height: none` after the transition finishes so the section can grow
   when its contents change later. On close we reverse: pin current height
   first, force reflow, then set to 0 — otherwise the transition from
   `none` is instant.

   Markup:
     <div class="k-accordion" id="acc" data-single>
       <section class="k-accordion__item is-expanded">
         <button class="k-accordion__header" type="button">Section 1</button>
         <div class="k-accordion__body">
           <div class="k-accordion__inner">…content…</div>
         </div>
       </section>
       <section class="k-accordion__item">…</section>
     </div>

   Init (auto-binds clicks on .k-accordion__header):
     Kit.accordion('#acc');                    // multi-open
     Kit.accordion('#acc', { single: true });  // accordion (one at a time)
     Kit.accordion(rootEl, { single: true });  // by element instead of selector

     `data-single` attribute on the root is equivalent to `{ single: true }`.

   Imperative API (operate on an item element):
     Kit.accordion.expand(item)              // opens, idempotent
     Kit.accordion.collapse(item)            // closes, idempotent
     Kit.accordion.toggle(item)              // flip current state
     Kit.accordion.toggle(item, true|false)  // force open / close
     Kit.accordion.isExpanded(item) -> bool
     Kit.accordion.recompute(item|root)      // after content changed inside
                                             // an open section, recalc maxh
   ========================================================================= */
(function (K) {
  'use strict';

  function bodyOf(item) { return item && item.querySelector(':scope > .k-accordion__body'); }
  function innerOf(item) {
    var b = bodyOf(item);
    return b && (b.querySelector(':scope > .k-accordion__inner') || b.firstElementChild);
  }

  function animateBodyTo(item, targetPx) {
    var body = bodyOf(item);
    if (!body) return;
    body.style.maxHeight = targetPx + 'px';
    var onEnd = function (e) {
      if (e && e.propertyName !== 'max-height') return;
      body.removeEventListener('transitionend', onEnd);
      // Только если секция всё ещё «open» к моменту окончания. Иначе быстрый
      // toggle во время transition оставил бы её с maxHeight: none на закрытой.
      if (item.classList.contains('is-expanded')) body.style.maxHeight = 'none';
    };
    body.addEventListener('transitionend', onEnd);
  }

  function expand(item) {
    if (!item || item.classList.contains('is-expanded')) return;
    var body = bodyOf(item);
    if (!body) return;
    item.classList.add('is-expanded');
    body.style.maxHeight = '0px';
    void body.offsetHeight; // force reflow — иначе transition стартует уже с целевой высоты
    var inner = innerOf(item);
    animateBodyTo(item, inner ? inner.scrollHeight : body.scrollHeight);
  }

  function collapse(item) {
    if (!item || !item.classList.contains('is-expanded')) return;
    var body = bodyOf(item);
    if (!body) return;
    // Текущая высота может быть `none` — transition с auto не пойдёт.
    // Фиксируем её в px, форсим reflow, потом ставим 0.
    var inner = innerOf(item);
    body.style.maxHeight = (inner ? inner.scrollHeight : body.scrollHeight) + 'px';
    void body.offsetHeight;
    item.classList.remove('is-expanded');
    body.style.maxHeight = '0px';
  }

  function toggle(item, force) {
    if (typeof force === 'boolean') return force ? expand(item) : collapse(item);
    if (!item) return;
    if (item.classList.contains('is-expanded')) collapse(item);
    else expand(item);
  }

  function isExpanded(item) {
    return !!(item && item.classList.contains('is-expanded'));
  }

  // Когда контент внутри открытой секции поменялся (показалось/скрылось
  // что-то, перерендерилось), её max-height (зафиксированный в `none`)
  // достаточен. Но если переход ещё идёт — перевыставляем actual scrollHeight.
  function recompute(target) {
    if (!target) return;
    var items;
    if (target.classList && target.classList.contains('k-accordion__item')) {
      items = [target];
    } else {
      items = K.$$('.k-accordion__item.is-expanded', target);
    }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.classList.contains('is-expanded')) continue;
      var body = bodyOf(item);
      var inner = innerOf(item);
      if (body) animateBodyTo(item, inner ? inner.scrollHeight : body.scrollHeight);
    }
  }

  // Главная функция-инициализатор. Можно вызвать на root-элементе/селекторе,
  // дальше click'и по .k-accordion__header сами разводятся.
  function init(rootOrSelector, opts) {
    var root = typeof rootOrSelector === 'string' ? document.querySelector(rootOrSelector) : rootOrSelector;
    if (!root) return null;
    opts = opts || {};
    var single = opts.single === true || root.hasAttribute('data-single');

    // Секции, которые уже помечены .is-expanded в HTML, должны сразу иметь
    // max-height: none — без этого они закрыты (max-height из CSS = 0).
    var pre = K.$$('.k-accordion__item.is-expanded', root);
    for (var i = 0; i < pre.length; i++) {
      var b = bodyOf(pre[i]);
      if (b) b.style.maxHeight = 'none';
    }

    K.on(root, 'click', '.k-accordion__header', function (e, headerEl) {
      var item = headerEl.closest('.k-accordion__item');
      if (!item || !root.contains(item)) return;
      if (item.classList.contains('is-expanded')) {
        collapse(item);
      } else {
        if (single) {
          var open = K.$$('.k-accordion__item.is-expanded', root);
          for (var j = 0; j < open.length; j++) collapse(open[j]);
        }
        expand(item);
      }
    });

    return root;
  }

  // Экспортируем init как callable + методы на нём. Перекликается с Kit.toast
  // (можно вызвать Kit.toast(msg) или Kit.toast.show(...)).
  init.expand = expand;
  init.collapse = collapse;
  init.toggle = toggle;
  init.isExpanded = isExpanded;
  init.recompute = recompute;

  K.accordion = init;
})(window.Kit);
