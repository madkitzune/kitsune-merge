/* =====================================================================
   EVENTS — фестивалі з міні-іграми іншого жанру. Нагорода: осколки й скіни.
   Кожні 3 дні новий фестиваль із власною міні-грою:
     • «Ловля ліхтариків» — аркада (кошик ловить ліхтарики, оминай колючки)
     • «Пари коропів» — гра на пам'ять (відкривай картки парами)
     • «Ритм дзвону» — ритм-гра (торкайся, коли коло збігається з дзвоном)
   Квитки-ліхтарики: 3 щодня безкоштовно, +1 за кожні 3 замовлення, +2 за рекламу.
   Гра → очки фестивалю (шкала з 5 нагородами) + осколки героя фестивалю за рахунок.
   ===================================================================== */
const EV = {
  days: 3, freeDaily: 3, perOrders: 3, adTickets: 2,
  milestones: [
    { pts: 100, rw: { f: 3 } },
    { pts: 250, rw: { food: { tempura: 2, inari: 1 } } },
    { pts: 450, rw: { hero: 4 } },
    { pts: 700, rw: { g: 15, hero: 3 } },
    { pts: 1000, rw: { skin: 1, hero: 5 } },
  ],
  shardsPerScore: 60, maxShardsPerPlay: 4,
  games: ['catch', 'memory', 'rhythm'],
};
[
  ['Фестиваль', 'Фестиваль', 'Festival'], ['Ловля ліхтариків', 'Ловля фонариков', 'Lantern Catch'],
  ['Пари коропів', 'Пары карпов', 'Koi Pairs'], ['Ритм дзвону', 'Ритм колокола', 'Bell Rhythm'],
  ['Лови ліхтарики кошиком, оминай колючки. 30 секунд.', 'Лови фонарики корзинкой, избегай колючек. 30 секунд.', 'Catch lanterns in the basket, dodge the thorns. 30 seconds.'],
  ['Відкривай картки й шукай пари. Що швидше — то більше очок.', 'Открывай карточки и ищи пары. Чем быстрее — тем больше очков.', 'Flip cards to find pairs. The faster, the more points.'],
  ['Торкайся, коли коло збігається з дзвоном.', 'Касайся, когда круг совпадает с колоколом.', 'Tap when the ring meets the bell.'],
  ['Герой фестивалю', 'Герой фестиваля', 'Festival hero'], ['Ще {t}', 'Ещё {t}', '{t} left'],
  ['Грати', 'Играть', 'Play'], ['Квитки', 'Билеты', 'Tickets'], ['+{n} квитки за рекламу', '+{n} билета за рекламу', '+{n} tickets for an ad'],
  ['Квитки: 3 щодня, +1 за кожні 3 замовлення', 'Билеты: 3 в день, +1 за каждые 3 заказа', 'Tickets: 3 daily, +1 per 3 orders'],
  ['Нагороди фестивалю', 'Награды фестиваля', 'Festival rewards'], ['Рекорд: {n}', 'Рекорд: {n}', 'Best: {n}'],
  ['Очки', 'Очки', 'Score'], ['Час', 'Время', 'Time'], ['Готово!', 'Готово!', 'Done!'],
  ['Ще раз', 'Ещё раз', 'Again'], ['До фестивалю', 'К фестивалю', 'Back to festival'],
  ['Немає квитків', 'Нет билетов', 'No tickets'], ['Ідеально!', 'Идеально!', 'Perfect!'], ['Добре', 'Хорошо', 'Good'], ['Мимо', 'Мимо', 'Miss'],
  ['Новий фестиваль!', 'Новый фестиваль!', 'New festival!'],
].forEach(([uk, ru, en]) => { I18N.uk[uk] = uk; I18N.ru[uk] = ru; I18N.en[uk] = en; });

const evIdNow = () => Math.floor(Date.now() / (EV.days * 864e5));
const evGame = id => EV.games[id % EV.games.length];
const EVNAME = { catch: 'Ловля ліхтариків', memory: 'Пари коропів', rhythm: 'Ритм дзвону' };
const EVDESC = { catch: 'Лови ліхтарики кошиком, оминай колючки. 30 секунд.', memory: 'Відкривай картки й шукай пари. Що швидше — то більше очок.', rhythm: 'Торкайся, коли коло збігається з дзвоном.' };
const EVICON = { catch: '🏮', memory: '🐟', rhythm: '🔔' };

function evState() {
  const id = evIdNow();
  if (!S.ev || S.ev.id !== id) {
    const keep = S.ev ? S.ev.tickets : EV.freeDaily;
    /* герой фестивалю — закритий улюбленець (детерміновано від id), інакше будь-який */
    const locked = Object.keys(PETS).filter(k => !PS().own[k]);
    const pool = locked.length ? locked : Object.keys(PETS);
    S.ev = { id, pts: 0, best: 0, claimed: [], tickets: keep, free: '', orders: 0, hero: pool[id % pool.length] };
    if (S.tut >= TUTORIAL.length) setTimeout(() => toast('🏮 ' + T('Новий фестиваль!')), 1500);
  }
  if (S.ev.free !== today()) { S.ev.free = today(); S.ev.tickets = Math.max(S.ev.tickets, EV.freeDaily); }
  return S.ev;
}
const evEnd = () => (evIdNow() + 1) * EV.days * 864e5;
const evLeft = () => { const ms = evEnd() - now(), h = Math.floor(ms / 3600000); return h >= 24 ? Math.floor(h / 24) + T('д') + ' ' + (h % 24) + T('г') : h + T('г') + ' ' + Math.floor(ms % 3600000 / 60000) + T('хв'); };
[['д', 'д', 'd'], ['г', 'ч', 'h'], ['хв', 'м', 'm']].forEach(([uk, ru, en]) => { I18N.uk[uk] = uk; I18N.ru[uk] = ru; I18N.en[uk] = en; });

function evGive(rw, src) {
  const e = evState();
  if (rw.hero) fragToast(giveFrags(rw.hero, e.hero, src));
  const rest = { ...rw }; delete rest.hero;
  if (Object.keys(rest).length) monGive(rest, src);
}
const evRwTxt = rw => [rw.hero && `${fragIcon(evState().hero, true)}×${rw.hero}`, monTxt({ ...rw, hero: undefined })].filter(Boolean).join(' ');
const evReady = () => { const e = evState(); return e.tickets > 0 || EV.milestones.some((m, i) => e.pts >= m.pts && !e.claimed.includes(i)); };
function evDot() { const d = $('dotE'); if (d) d.classList.toggle('on', S.tut >= TUTORIAL.length && evReady()); }

/* ---------- хаб фестивалю ---------- */
function festival() {
  const e = evState(), g = evGame(e.id);
  let h = hdr(EVICON[g], T('Фестиваль') + ': ' + T(EVNAME[g]), T('Ще {t}', { t: evLeft() })) + `
    <div class="ev-hero"><div class="ev-pet">${fragIcon(e.hero)}</div><div style="flex:1"><small>${T('Герой фестивалю')}</small>
      <div class="up-n">${PS().own[e.hero] || fragHave(e.hero) ? T(PETS[e.hero].name) : '???'}</div><small>${T(EVDESC[g])}</small></div></div>
    <div class="ev-play"><div class="ev-tix">🏮 <b>${e.tickets}</b><small>${T('Квитки')}</small></div>
      <button class="main" ${e.tickets > 0 ? '' : 'disabled'} onclick="evPlay()">${T('Грати')} · 1🏮</button></div>
    <div class="ev-sub"><small>${T('Квитки: 3 щодня, +1 за кожні 3 замовлення')} · ${T('Рекорд: {n}', { n: e.best })}</small>
      <button class="ad-btn" onclick="evAdTickets()">📺 ${T('+{n} квитки за рекламу', { n: EV.adTickets })}</button></div>
    <h3>${T('Нагороди фестивалю')} · ${e.pts} ${T('Очки').toLowerCase()}</h3><div class="ev-track">`;
  EV.milestones.forEach((m, i) => {
    const got = e.claimed.includes(i), ok = e.pts >= m.pts;
    h += `<div class="ev-m${got ? ' got' : ok ? ' ok' : ''}"><div class="ev-mp">${m.pts}</div><div class="ev-mr">${evRwTxt(m.rw)}</div>
      <button class="price${ok && !got ? ' ok' : ''}" ${ok && !got ? '' : 'disabled'} onclick="evClaim(${i})">${got ? '✓' : T('Забрати')}</button></div>`;
  });
  modal(h + '</div>');
  evDot();
}
window.festival = festival;
window.evClaim = i => { const e = evState(), m = EV.milestones[i]; if (e.pts < m.pts || e.claimed.includes(i)) return; e.claimed.push(i); evGive(m.rw, 'event'); track('event_claim', { i }); SFX.chest(); festival(); };
window.evAdTickets = () => adThen('event_tickets', () => { evState().tickets += EV.adTickets; festival(); });
window.evPlay = () => {
  const e = evState(); if (e.tickets <= 0) { toast(T('Немає квитків')); return; }
  e.tickets--; save(); closeM(); track('event_play', { g: evGame(e.id) });
  MINI[evGame(e.id)]();
};

/* ---------- каркас міні-гри: повноекранний шар ---------- */
let miniEnd = null;
function miniOpen(title) {
  let m = $('mini'); if (!m) { m = document.createElement('div'); m.id = 'mini'; document.body.appendChild(m); }
  m.innerHTML = `<div class="mi-top"><div class="mi-t">${title}</div><div class="mi-s">${T('Очки')}: <b id="miScore">0</b></div><div class="mi-s">⏱ <b id="miTime"></b></div></div><div id="miField"></div>`;
  m.classList.add('on');
  return $('miField');
}
function miniFinish(score) {
  const e = evState(), g = evGame(e.id);
  if (miniEnd) miniEnd(); miniEnd = null;
  score = Math.max(0, Math.round(score));
  e.pts += score; e.best = Math.max(e.best, score);
  const shards = Math.min(EV.maxShardsPerPlay, Math.floor(score / EV.shardsPerScore));
  if (shards) giveFrags(shards, e.hero, 'event_play');
  track('event_score', { g, score, shards }); SFX.level(); save();
  const m = $('mini');
  m.insertAdjacentHTML('beforeend', `<div class="mi-res"><div class="card"><div class="mbody" style="text-align:center">
    <div class="mh"><div class="mh-t">${T('Готово!')}</div></div><div class="mi-big">${score}</div><p>${T('Очки')} · ${T('Рекорд: {n}', { n: e.best })}</p>
    ${shards ? `<div class="of-rw">${fragIcon(e.hero)} +${shards}</div>` : ''}
    <div class="pf-btns"><button onclick="miniClose()">${T('До фестивалю')}</button><button class="main" ${e.tickets > 0 ? '' : 'disabled'} onclick="miniClose(true)">${T('Ще раз')} · 1🏮</button></div></div></div></div>`);
}
window.miniClose = again => { const m = $('mini'); m.classList.remove('on'); m.innerHTML = ''; render(); if (again) evPlay(); else festival(); };
function miniTimer(sec, tick, done) {
  const t0 = performance.now(); let raf = 0, stop = false;
  const step = t => { if (stop) return; const left = Math.max(0, sec - (t - t0) / 1000); $('miTime').textContent = Math.ceil(left); tick && tick(t); if (left <= 0) { stop = true; done(); return; } raf = requestAnimationFrame(step); };
  raf = requestAnimationFrame(step);
  return () => { stop = true; cancelAnimationFrame(raf); };
}
const setScore = s => { const e = $('miScore'); if (e) e.textContent = Math.round(s); };

/* ---------- 1. Ловля ліхтариків (аркада) ---------- */
function gameCatch() {
  const f = miniOpen('🏮 ' + T('Ловля ліхтариків'));
  const cv = document.createElement('canvas'); f.appendChild(cv);
  const W = cv.width = f.clientWidth * devicePixelRatio, H = cv.height = f.clientHeight * devicePixelRatio, k = devicePixelRatio;
  const ctx = cv.getContext('2d');
  const img = src => { const i = new Image(); i.src = src; return i; };
  const LANT = img('art/ui/lantern.svg'), STAR = img('art/ui/star.svg'), FOX = img(PETART.fox_gather || 'art/ui/fox.svg');
  let bx = W / 2, score = 0, lives = 3, items = [], last = 0, spawn = 0;
  const bw = 90 * k, by = H - 70 * k;
  const move = e => { const r = cv.getBoundingClientRect(); bx = Math.max(bw / 2, Math.min(W - bw / 2, (e.clientX - r.left) * k)); };
  cv.addEventListener('pointermove', move); cv.addEventListener('pointerdown', move);
  const stop = miniTimer(30, t => {
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t; spawn -= dt;
    const speed = 1 + (30 - +$('miTime').textContent) / 20;
    if (spawn <= 0) { spawn = .55 / speed; const r = Math.random(); items.push({ x: (30 + Math.random() * (W / k - 60)) * k, y: -30 * k, v: (140 + Math.random() * 80) * speed * k, t: r < .18 ? 'bad' : r < .3 ? 'gold' : 'ok' }); }
    ctx.clearRect(0, 0, W, H);
    items.forEach(it => {
      it.y += it.v * dt; const s = 34 * k;
      if (it.t === 'bad') { ctx.fillStyle = '#5a3a5a'; ctx.beginPath(); for (let a = 0; a < 16; a++) { const r2 = a % 2 ? s * .25 : s * .5, an = a / 16 * 6.283; ctx.lineTo(it.x + Math.cos(an) * r2, it.y + Math.sin(an) * r2); } ctx.fill(); }
      else ctx.drawImage(it.t === 'gold' ? STAR : LANT, it.x - s / 2, it.y - s / 2, s, s);
      if (it.y > by - 20 * k && it.y < by + 20 * k && Math.abs(it.x - bx) < bw / 2) {
        it.dead = true;
        if (it.t === 'bad') { lives--; SFX.err(); vib(30); if (lives <= 0) { stop(); miniFinish(score); } }
        else { score += it.t === 'gold' ? 30 : 10; SFX.coin(); setScore(score); }
      }
      if (it.y > H + 40) it.dead = true;
    });
    items = items.filter(i => !i.dead);
    ctx.fillStyle = '#9a5d32'; ctx.beginPath(); ctx.roundRect(bx - bw / 2, by, bw, 26 * k, 10 * k); ctx.fill();
    if (FOX.complete) ctx.drawImage(FOX, bx - 30 * k, by - 58 * k, 60 * k, 60 * k);
    ctx.font = `${18 * k}px sans-serif`; ctx.fillText('❤'.repeat(lives), 10 * k, 26 * k);
  }, () => miniFinish(score));
  miniEnd = stop;
}

/* ---------- 2. Пари коропів (пам'ять) ---------- */
function gameMemory() {
  const f = miniOpen('🐟 ' + T('Пари коропів'));
  const ids = [...Object.keys(PETS).filter(k => PETS[k].kind === 'koi'), 'fox_gather', 'fox_nine'];
  const deck = [...ids, ...ids].sort(() => Math.random() - .5);
  f.innerHTML = `<div class="mm-grid">${deck.map((id, i) => `<button class="mm-c" data-i="${i}"><span class="mm-b"><img src="${PETART[id] || ''}" alt=""></span></button>`).join('')}</div>`;
  let open = [], pairs = 0, score = 0, lock = false, combo = 0;
  const stop = miniTimer(60, null, () => miniFinish(score));
  miniEnd = stop;
  f.querySelector('.mm-grid').addEventListener('click', ev => {
    const c = ev.target.closest('.mm-c'); if (!c || lock || c.classList.contains('up') || c.classList.contains('done')) return;
    c.classList.add('up'); SFX.pop(); open.push(c);
    if (open.length < 2) return;
    const [a, b] = open; open = [];
    if (deck[a.dataset.i] === deck[b.dataset.i]) {
      combo++; pairs++; score += 20 + combo * 5 + Math.round(+$('miTime').textContent / 3); setScore(score); SFX.coin();
      a.classList.add('done'); b.classList.add('done');
      if (pairs === ids.length) { stop(); miniFinish(score); }
    } else { combo = 0; lock = true; setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); lock = false; }, 650); }
  });
}

/* ---------- 3. Ритм дзвону (ритм) ---------- */
function gameRhythm() {
  const f = miniOpen('🔔 ' + T('Ритм дзвону'));
  f.innerHTML = `<div class="rh-wrap"><div class="rh-bell"><img src="art/ui/bell.svg" alt=""></div><div class="rh-ring" id="rhRing"></div><div class="rh-fb" id="rhFb"></div><button class="rh-tap" id="rhTap"></button></div>`;
  const ring = $('rhRing'), fb = $('rhFb');
  const N = 20; let n = 0, score = 0, combo = 0, start = 0, dur = 1300, hit = false;
  const next = () => { if (n >= N) { stop(); miniFinish(score); return; } n++; hit = false; start = performance.now(); dur = Math.max(700, 1300 - n * 30); };
  const show = (txt, cls) => { fb.textContent = txt; fb.className = 'rh-fb on ' + cls; setTimeout(() => fb.classList.remove('on'), 350); };
  const stop = miniTimer(45, t => {
    const p = (t - start) / dur;                       // 0 → 1: коло стискається до дзвону
    ring.style.transform = `translate(-50%,-50%) scale(${Math.max(.2, 2.6 - p * 1.6)})`;
    if (p > 1.25) { if (!hit) { combo = 0; show(T('Мимо'), 'miss'); } next(); }
  }, () => miniFinish(score));
  miniEnd = stop;
  $('rhTap').addEventListener('pointerdown', () => {
    if (hit) return; const p = (performance.now() - start) / dur, d = Math.abs(p - 1);
    hit = true;
    if (d < .08) { combo++; score += 20 + combo * 2; show(T('Ідеально!'), 'perfect'); SFX.bell(); }
    else if (d < .2) { combo++; score += 10 + combo; show(T('Добре'), 'good'); SFX.lamp(2); }
    else { combo = 0; show(T('Мимо'), 'miss'); SFX.err(); }
    setScore(score); vib(10); setTimeout(next, 250);
  });
  next();
}
const MINI = { catch: gameCatch, memory: gameMemory, rhythm: gameRhythm };

/* ---------- встановлення ---------- */
(() => {
  const baseFill = fill;
  fill = function (i, ev) {
    const before = S.stats.orders; const r = baseFill(i, ev);
    if (S.stats.orders > before) { const e = evState(); e.orders = (e.orders || 0) + 1; if (e.orders % EV.perOrders === 0) { e.tickets++; toast('🏮 +1 ' + T('Квитки').toLowerCase()); } evDot(); }
    return r;
  };
  const row = document.querySelector('.lvl');
  if (row) row.insertAdjacentHTML('beforeend', `<button class="icon med" id="bEvent" onclick="festival()">🏮<i class="dot" id="dotE"></i></button>`);
  const baseAfter = afterStart; afterStart = function () { baseAfter(); evState(); evDot(); };
})();
