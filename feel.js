/* =====================================================================
   FEEL — відгук на дії (game feel).
   Принципи: подія -> набір коротких реакцій за рівнем важливості;
   рух лише з easing; усе повертається у спокій; ввід не блокується.
   Підключається після game.js і обгортає merge / fill / move / render / modal.
   ===================================================================== */
const FEEL = (() => {
  const EASE_OUT = 'cubic-bezier(.22,1,.36,1)';      // settle
  const EASE_IN = 'cubic-bezier(.55,0,.75,.2)';      // fall into slot
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- рівні важливості: одна точка налаштування для всієї гри --- */
  const TIER = {
    small:  { burst: 8,  dist: 36, vib: 8,  trauma: 0 },
    medium: { burst: 14, dist: 50, vib: 14, trauma: .25 },
    large:  { burst: 26, dist: 80, vib: 40, trauma: .6, flash: true, stop: 70 },
  };
  const tierOf = t => (t >= 6 ? 'large' : t >= 4 ? 'medium' : 'small');

  /* --- тряска через "травму", що згасає (плавна, не дрижання) --- */
  let trauma = 0, raf = 0, phase = 0;
  function addTrauma(v) {
    if (reduced || !v) return;
    trauma = Math.min(1, trauma + v);
    if (!raf) raf = requestAnimationFrame(shakeStep);
  }
  function shakeStep() {
    const app = document.getElementById('boardWrap');
    trauma = Math.max(0, trauma - 0.045);
    phase += 0.9;
    const s = trauma * trauma;
    if (app) app.style.transform = s ? `translate(${(9 * s * Math.sin(phase * 1.7)).toFixed(2)}px,${(6 * s * Math.sin(phase * 2.3)).toFixed(2)}px) rotate(${(1.2 * s * Math.sin(phase * 1.1)).toFixed(2)}deg)` : '';
    raf = trauma > 0 ? requestAnimationFrame(shakeStep) : 0;
  }

  function flash() {
    if (reduced) return;
    const f = document.createElement('div');
    f.className = 'fx-flash';
    document.body.appendChild(f);
    f.animate([{ opacity: .55 }, { opacity: 0 }], { duration: 220, easing: 'ease-out' }).onfinish = () => f.remove();
  }

  /* --- клон предмета, що летить між точками --- */
  function flight(html, from, to, { dur = 170, ease = EASE_IN, scaleTo = 1, cls = '' } = {}) {
    const f = document.createElement('div');
    f.className = 'flyitem ' + cls;
    f.innerHTML = html;
    document.body.appendChild(f);
    const a = f.animate([
      { left: from.x + 'px', top: from.y + 'px', transform: 'translate(-50%,-50%) scale(1)' },
      { left: to.x + 'px', top: to.y + 'px', transform: `translate(-50%,-50%) scale(${scaleTo})` },
    ], { duration: reduced ? 1 : dur, easing: ease, fill: 'forwards' });
    return a.finished.then(() => f.remove());
  }
  const center = el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; };

  /* --- "пружина": стиск -> overshoot -> спокій --- */
  function squash(el, k = 1) {
    if (!el || reduced) return;
    el.animate([
      { transform: `scale(${1 + .3 * k},${1 - .3 * k})` },
      { transform: `scale(${1 - .12 * k},${1 + .14 * k})`, offset: .45 },
      { transform: 'scale(1)' },
    ], { duration: 320, easing: EASE_OUT });
  }

  /* --- лічильники ресурсів рахують, а не стрибають --- */
  const shown = {};
  function count(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const from = shown[id] ?? value;
    shown[id] = value;
    if (from === value || reduced) { el.textContent = value; return; }
    const t0 = performance.now(), dur = Math.min(700, 250 + Math.abs(value - from) * 4);
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (value - from) * e);
      if (p < 1 && shown[id] === value) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const box = el.closest('.res');
    if (box && value > from) squash(box, .35);
  }

  /* ================= обгортки ігрових дій ================= */
  /* остання точка відпускання пальця (capture — до обробника гри) */
  let lastUp = { x: 0, y: 0, t: 0, drag: false };
  addEventListener('pointerup', e => { lastUp = { x: e.clientX, y: e.clientY, t: performance.now(), drag: ghost.style.display !== 'none' }; }, true);
  const justDropped = () => lastUp.drag && performance.now() - lastUp.t < 80;

  function install() {
    /* злиття: предмет-джерело летить у ціль, ціль "пружинить" */
    const baseMerge = merge;
    merge = function (a, b) {
      const t = S.board[a];
      const srcEl = cellEl(a), srcIt = srcEl && srcEl.querySelector('.it');
      const html = srcIt && srcIt.outerHTML;
      const from = justDropped() ? { x: lastUp.x, y: lastUp.y } : srcEl && center(srcEl);
      const ok = baseMerge(a, b);
      if (!ok) return ok;
      const dst = cellEl(b);
      const tier = TIER[tierOf(t + 1)];
      const land = () => {
        const it = dst && dst.querySelector('.it');
        squash(it, tier === TIER.large ? 1.2 : 1);
        addTrauma(tier.trauma);
        if (tier.flash) flash();
        if (dst) { dst.classList.remove('fx-ring'); void dst.offsetWidth; dst.classList.add('fx-ring'); }
      };
      if (html && dst && from) {
        const it = dst.querySelector('.it'); if (it) it.style.opacity = 0;
        flight(html, from, center(dst), { dur: 150 }).then(() => { if (it) it.style.opacity = ''; land(); });
      } else land();
      return ok;
    };

    /* переміщення: предмет ковзає, а не телепортується */
    const baseMove = move;
    move = function (a, b) {
      const srcEl = cellEl(a), it = srcEl && srcEl.querySelector('.it');
      const html = it && it.outerHTML;
      const from = justDropped() ? { x: lastUp.x, y: lastUp.y } : srcEl && center(srcEl);
      const ok = baseMove(a, b);
      if (ok && html && from) {
        const dst = cellEl(b), dIt = dst && dst.querySelector('.it');
        if (dIt) dIt.style.opacity = 0;
        flight(html, from, center(dst), { dur: 140, ease: EASE_OUT }).then(() => { if (dIt) { dIt.style.opacity = ''; squash(dIt, .4); } });
      }
      return ok;
    };

    /* замовлення: потрібні предмети злітаються в картку, картка "штампується" */
    const baseFill = fill;
    fill = function (i, ev) {
      const o = S.orders[i];
      const card = document.querySelectorAll('.order')[i];
      if (!o || !card || !canFill(o)) return baseFill(i, ev);
      const target = center(card), used = new Set(), flights = [];
      o.need.forEach((t, k) => {
        const j = S.board.findIndex((v, idx) => v === t && !used.has(idx));
        used.add(j);
        const el = cellEl(j), it = el && el.querySelector('.it');
        if (it) flights.push(() => flight(it.outerHTML, center(el), target, { dur: 260 + k * 60, ease: EASE_IN, scaleTo: .5 }));
      });
      flights.forEach(f => f());
      baseFill(i, ev);
      const nc = document.querySelectorAll('.order')[i];
      if (nc && !reduced) nc.animate([
        { transform: 'translateY(-14px) scale(.85)', opacity: 0 },
        { transform: 'translateY(2px) scale(1.04)', opacity: 1, offset: .7 },
        { transform: 'none' },
      ], { duration: 380, delay: 220, easing: EASE_OUT, fill: 'backwards' });
      addTrauma(.15);
    };

    /* невдалий кидок: привид повертається на місце */
    addEventListener('pointerup', e => {
      if (ghost.style.display === 'none' || !ghostFrom) return;
      const j = cellAt(e.clientX, e.clientY);
      if (j >= 0) return; // кинули на клітинку: обробить гра
      const from = { x: e.clientX, y: e.clientY }, to = ghostFrom;
      flight(ghost.innerHTML, from, to, { dur: 200, ease: EASE_OUT });
    }, true);
    let ghostFrom = null;
    $('board').addEventListener('pointerdown', e => {
      const c = e.target.closest('.c');
      ghostFrom = c ? center(c) : null;
      if (c) c.classList.add('fx-press');
    });
    addEventListener('pointerup', () => document.querySelectorAll('.fx-press').forEach(c => c.classList.remove('fx-press')));

    /* підняте з поля: клітинка-джерело тьмяніє під час перетягування */
    new MutationObserver(() => {
      const on = ghost.style.display !== 'none';
      document.querySelectorAll('.fx-lifted').forEach(c => c.classList.remove('fx-lifted'));
      if (on && drag) { const c = cellEl(drag.i); if (c) c.classList.add('fx-lifted'); }
    }).observe(ghost, { attributes: true, attributeFilter: ['style'] });

    /* лічильники */
    const baseRender = render;
    render = function (...a) {
      baseRender(...a);
      count('co', S.co);
      count('ge', S.ge);
    };

    /* вікна: плавне закриття */
    const baseClose = closeM;
    closeM = function () {
      const m = $('m');
      if (!m.classList.contains('on') || reduced) return baseClose();
      m.classList.add('closing');
      setTimeout(() => { m.classList.remove('closing'); baseClose(); }, 170);
    };
  }


  /* ================= переходи між екранами =================
     Відкриття: сцена "розкривається" колом з точки дотику (circle clip-path),
     сама картинка трохи наближається. Закриття: коло стискається до кнопки "назад",
     головний екран легко "повертається" масштабом. */
  let lastDown = { x: innerWidth / 2, y: innerHeight - 40 };
  addEventListener('pointerdown', e => { lastDown = { x: e.clientX, y: e.clientY }; }, true);
  const R = () => Math.hypot(innerWidth, innerHeight);

  function irisIn(el) {
    if (reduced || !el) return;
    const { x, y } = lastDown;
    el.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R()}px at ${x}px ${y}px)` }],
      { duration: 460, easing: EASE_OUT });
    const sc = el.querySelector('.tscene,.pscene');
    if (sc) sc.animate([{ transform: 'scale(1.12)', filter: 'brightness(1.4)' }, { transform: 'none', filter: 'none' }], { duration: 600, easing: EASE_OUT });
    el.querySelectorAll('.thead,#tpanel,#mpanel,#ppanel').forEach((u, k) =>
      u.animate([{ opacity: 0, transform: `translateY(${k ? 24 : -24}px)` }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 200, easing: EASE_OUT, fill: 'backwards' }));
  }
  function irisOut(el, done) {
    if (reduced || !el || !el.classList.contains('on')) return done();
    const b = el.querySelector('.thead .icon'), c = b ? center(b) : { x: 30, y: 30 };
    el.animate([{ clipPath: `circle(${R()}px at ${c.x}px ${c.y}px)` }, { clipPath: `circle(0px at ${c.x}px ${c.y}px)` }],
      { duration: 300, easing: EASE_IN, fill: 'forwards' }).finished.then(() => {
        done();
        el.getAnimations().forEach(a => a.cancel());
        const app = $('app');
        if (app && !document.querySelector('.screen.on')) app.animate([{ transform: 'scale(.94)', opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: EASE_OUT });
      });
  }
  function wrapScreen(openName, closeName, id) {
    const baseOpen = window[openName], baseClose = window[closeName];
    window[openName] = function (...a) {
      const el = $(id), was = el.classList.contains('on');
      const r = baseOpen.apply(this, a);
      if (!was && el.classList.contains('on')) irisIn(el);
      return r;
    };
    window[closeName] = function (...a) { irisOut($(id), () => baseClose.apply(this, a)); };
  }
  function installScreens() {
    wrapScreen('openTemple', 'closeTemple', 'temple');
    wrapScreen('openMeadow', 'closeMeadow', 'meadow');
    wrapScreen('openPond', 'closePond', 'pond');
    /* ці кнопки були прив'язані до старих посилань — перев'язуємо на обгортки */
    $('bTemple').onclick = () => openTemple();
    $('chipTemple').onclick = () => openTemple();
    $('tBack').onclick = () => closeTemple();
  }

  return { installScreens, install, addTrauma, flash, squash, flight, count, TIER, tierOf };
})();
FEEL.install();
FEEL.installScreens();
