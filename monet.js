/* =====================================================================
   MONETISATION — системи доходу (демо: справжньої оплати немає).
   1. Сезонний пропуск «Храмовий шлях»: 30 щаблів, безкоштовна + платна доріжка.
   2. Копилка: кристали капають за гру, розбити — $1.99.
   3. Персональні пропозиції з таймером: у потрібний момент, одна за раз.
   4. Підписка «Благословення Хоші»: щодня кристали й енергія, +10 до макс. енергії.
   5. Реклама за нагороду: ×2 за замовлення, ×2 щоденного подарунка, мішечок осколків.
   Усі числа — у MON нижче (і в docs/DESIGN.md §3).
   ===================================================================== */
const MON = {
  pass: { tiers: 30, ptsPerTier: 100, price: '$4.99', days: 14, pts: { order: 10, quest: 30, daily: 20, build: 60 } },
  piggy: { perOrder: 2, perMerges: [5, 1], cap: 150, min: 50, price: '$1.99' },
  sub: { price: '$4.99', days: 7, cap: 10, daily: { g: 10, e: 20 } },
  adCap: 8, orderX2Ms: 5000,
  offers: {
    energy:  { title: 'Запас енергії',       rw: { e: 120, g: 15 },            price: '$0.99', min: 30, tag: 'Енергія скінчилась' },
    builder: { title: 'Набір будівельника',  rw: { c: 1500, g: 20, f: 6 },     price: '$1.99', min: 60, tag: 'Майже відбудовано' },
    level:   { title: 'Подарунок рівня',     rw: { g: 40, f: 10, e: 50 },      price: '$2.99', min: 45, tag: 'Новий рівень' },
  },
};
[
  ['Храмовий шлях', 'Храмовый путь', 'Temple Path'], ['Сезон: ще {d} дн.', 'Сезон: ещё {d} дн.', 'Season: {d} days left'],
  ['Щабель {n}', 'Ступень {n}', 'Tier {n}'], ['Безкоштовно', 'Бесплатно', 'Free'], ['Преміум', 'Премиум', 'Premium'],
  ['Відкрити преміум', 'Открыть премиум', 'Unlock premium'], ['Забрати все', 'Забрать всё', 'Claim all'],
  ['Очки шляху: замовлення, завдання, щоденний подарунок, будівлі', 'Очки пути: заказы, задания, ежедневный подарок, здания', 'Path points: orders, quests, daily gift, buildings'],
  ['Копилка', 'Копилка', 'Piggy bank'], ['Кристали капають у копилку за замовлення й злиття', 'Кристаллы капают в копилку за заказы и слияния', 'Gems drip into the piggy bank from orders and merges'],
  ['Розбити', 'Разбить', 'Break'], ['Ще трохи — від {n}', 'Ещё немного — от {n}', 'A bit more — from {n}'], ['Копилка повна!', 'Копилка полна!', 'Piggy bank is full!'],
  ['Благословення Хоші', 'Благословение Хоши', 'Hoshi\'s Blessing'], ['на тиждень', 'на неделю', 'per week'],
  ['Щодня {g} і {e} · +{c} до макс. енергії · реклама без очікування', 'Каждый день {g} и {e} · +{c} к макс. энергии · реклама без ожидания', 'Daily {g} and {e} · +{c} max energy · no ad wait'],
  ['Активне ще {d} дн.', 'Активно ещё {d} дн.', 'Active for {d} more days'], ['Подарунок благословення', 'Подарок благословения', 'Blessing gift'],
  ['Безкоштовно за рекламу', 'Бесплатно за рекламу', 'Free for an ad'], ['Сьогодні вже взято', 'Сегодня уже взято', 'Already taken today'],
  ['×2 за рекламу', '×2 за рекламу', '×2 for an ad'], ['Забрати ×2', 'Забрать ×2', 'Claim ×2'],
  ['Реклама на сьогодні скінчилась', 'Реклама на сегодня закончилась', 'No more ads today'],
  ['Запас енергії', 'Запас энергии', 'Energy stash'], ['Набір будівельника', 'Набор строителя', 'Builder pack'], ['Подарунок рівня', 'Подарок уровня', 'Level gift'],
  ['Енергія скінчилась', 'Энергия закончилась', 'Out of energy'], ['Майже відбудовано', 'Почти отстроено', 'Almost built'], ['Новий рівень', 'Новый уровень', 'New level'],
  ['Лише зараз', 'Только сейчас', 'Only now'], ['Демо-покупка: {p}', 'Демо-покупка: {p}', 'Demo purchase: {p}'],
  ['Пропозиція', 'Предложение', 'Offer'], ['Кристали', 'Кристаллы', 'Gems'],
].forEach(([uk, ru, en]) => { I18N.uk[uk] = uk; I18N.ru[uk] = ru; I18N.en[uk] = en; });

const M = () => (S.mon ||= { piggy: 0, merges: 0, offer: null, seen: {}, pass: null, sub: { until: 0, last: '' }, adPouch: '' });
const seasonId = () => Math.floor(Date.now() / (MON.pass.days * 864e5));
const daysLeft = until => Math.max(0, Math.ceil((until - now()) / 864e5));
const subOn = () => M().sub.until > now();
window.MON_CAP = () => (subOn() ? MON.sub.cap : 0);   // використовується в enMax()

/* ---------- нагороди: {c,e,g,f(осколки),food,skin} ---------- */
function monGive(r, src) {
  if (r.c) addCo(r.c);
  if (r.e) S.en += r.e;
  if (r.g) S.ge += r.g;
  if (r.food) addFood(r.food);
  if (r.skin) giveSkin();
  if (r.f) fragToast(giveFrags(r.f, null, src));
}
const monTxt = r => [r.c && r.c + U('coin'), r.e && r.e + U('energy'), r.g && r.g + U('gem'), r.f && r.f + '🧩',
  r.food && Object.keys(r.food).map(k => r.food[k] + foodIcon(k)).join(''), r.skin && '🎀'].filter(Boolean).join(' ');
function demoPay(price, id) { S.stats.iap++; track('iap_demo', { id }); SFX.chest(); toast(T('Демо-покупка: {p}', { p: price })); }

/* ---------- реклама за нагороду ---------- */
function adLeft() { if (S.ads.day !== today()) S.ads = { day: today(), n: 0 }; return MON.adCap - S.ads.n; }
function adThen(id, done) {
  if (adLeft() <= 0) { toast(T('Реклама на сьогодні скінчилась')); return; }
  const finish = () => { S.ads.n++; S.stats.adViews++; track('ad_rewarded', { id }); closeM(); done(); };
  if (subOn()) return finish();
  modal(`<h3>${T('📺 Реклама (заглушка)')}</h3><p id="adt" style="font-size:40px;text-align:center">3</p>`, true);
  let n = 3; const iv = setInterval(() => { n--; const e = $('adt'); if (e) e.textContent = n; if (n <= 0) { clearInterval(iv); finish(); } }, 1000);
}
window.adThen = adThen;

/* ---------- 1. сезонний пропуск ---------- */
function passState() {
  const m = M();
  if (!m.pass || m.pass.season !== seasonId()) m.pass = { season: seasonId(), pts: 0, prem: false, free: [], paid: [] };
  return m.pass;
}
const passTier = () => Math.min(MON.pass.tiers, Math.floor(passState().pts / MON.pass.ptsPerTier));
function passReward(i, paid) {
  const n = i + 1;
  if (!paid) return n % 10 === 0 ? { f: 5, g: 5 } : [{ c: 100 + i * 20 }, { e: 15 }, { food: { rice: 2, onigiri: 1 } }, { f: 2 }, { g: 3 }][i % 5];
  return n % 10 === 0 ? { skin: 1, g: 20, f: 8 } : [{ g: 8 }, { f: 4 }, { e: 30 }, { c: 300 + i * 40 }, { f: 6 }][i % 5];
}
function passAdd(k) {
  const p = passState(), before = passTier();
  p.pts += MON.pass.pts[k] || 0;
  if (passTier() > before) { toast('🎫 ' + T('Щабель {n}', { n: passTier() })); track('pass_tier', { n: passTier() }); }
  passDot();
}
const passReady = () => { const p = passState(), t = passTier(); for (let i = 0; i < t; i++) { if (!p.free.includes(i) || (p.prem && !p.paid.includes(i))) return true; } return false; };
function passDot() { const d = $('dotP'); if (d) d.classList.toggle('on', passReady()); }
function passClaim(i, paid) {
  const p = passState(), list = paid ? p.paid : p.free;
  if (i >= passTier() || list.includes(i) || (paid && !p.prem)) return;
  list.push(i); monGive(passReward(i, paid), 'pass'); track('pass_claim', { i, paid }); SFX.coin();
}
window.passClaimAll = () => { for (let i = 0; i < passTier(); i++) { passClaim(i, false); passClaim(i, true); } pass(); };
window.passClaimOne = (i, paid) => { passClaim(i, paid); pass(); };
window.passBuy = () => { const p = passState(); if (p.prem) return; p.prem = true; demoPay(MON.pass.price, 'pass'); track('pass_premium', {}); pass(); };
function pass() {
  const p = passState(), t = passTier(), per = MON.pass.ptsPerTier;
  const into = t >= MON.pass.tiers ? per : p.pts - t * per;
  const end = (seasonId() + 1) * MON.pass.days * 864e5;
  let h = hdr('🎫', T('Храмовий шлях'), T('Сезон: ще {d} дн.', { d: daysLeft(end) })) + `
    <div class="ps-top"><div class="ps-lv">${t}</div><div style="flex:1"><div class="bar ps-bar"><i style="width:${into / per * 100}%"></i></div>
      <small>${into}/${per} · ${T('Очки шляху: замовлення, завдання, щоденний подарунок, будівлі')}</small></div></div>
    <div class="ps-actions">${p.prem ? '' : `<button class="main" onclick="passBuy()">${T('Відкрити преміум')} · ${MON.pass.price}</button>`}
      <button onclick="passClaimAll()" ${passReady() ? '' : 'disabled'}>${T('Забрати все')}</button></div>
    <div class="ps-head"><span></span><b>${T('Безкоштовно')}</b><b class="pr">${T('Преміум')}</b></div><div class="ps-list">`;
  for (let i = 0; i < MON.pass.tiers; i++) {
    const open = i < t, cell = paid => {
      const got = (paid ? p.paid : p.free).includes(i), lock = paid && !p.prem;
      const cls = got ? 'got' : open && !lock ? 'ready' : 'lock';
      return `<button class="ps-c ${cls}${paid ? ' paid' : ''}" ${cls === 'ready' ? `onclick="passClaimOne(${i},${paid})"` : 'disabled'}>${monTxt(passReward(i, paid))}${got ? '<i>✓</i>' : lock ? '<i>🔒</i>' : ''}</button>`;
    };
    h += `<div class="ps-row${open ? ' open' : ''}"><span class="ps-n">${i + 1}</span>${cell(false)}${cell(true)}</div>`;
  }
  modal(h + '</div>');
  passDot();
}
window.pass = pass;

/* ---------- 2. копилка ---------- */
function piggyAdd(n) { const m = M(); const was = m.piggy; m.piggy = Math.min(MON.piggy.cap, m.piggy + n); if (was < MON.piggy.cap && m.piggy >= MON.piggy.cap) toast('🐷 ' + T('Копилка повна!')); }
window.piggyBreak = () => {
  const m = M(); if (m.piggy < MON.piggy.min) return;
  const g = m.piggy; m.piggy = 0; S.ge += g; demoPay(MON.piggy.price, 'piggy'); track('piggy_break', { g }); shop();
};
const piggyHtml = () => {
  const m = M(), ok = m.piggy >= MON.piggy.min;
  return `<div class="up mon-card"><div class="big">🐷</div><div class="up-b" style="flex:1"><div class="up-n">${T('Копилка')} · ${m.piggy}/${MON.piggy.cap}${U('gem')}</div>
    <div class="bar"><i style="width:${m.piggy / MON.piggy.cap * 100}%"></i></div><small>${ok ? T('Кристали капають у копилку за замовлення й злиття') : T('Ще трохи — від {n}', { n: MON.piggy.min + U('gem') })}</small></div>
    <button class="price${ok ? ' ok' : ''}" ${ok ? '' : 'disabled'} onclick="piggyBreak()">${T('Розбити')}<br>${MON.piggy.price}</button></div>`;
};

/* ---------- 3. персональні пропозиції ---------- */
function offerTrigger(id, key) {
  const m = M(), o = MON.offers[id];
  if (S.tut < TUTORIAL.length) return;
  if (m.offer && m.offer.until > now()) return;           // одна пропозиція за раз
  if (m.seen[key]) return;
  m.seen[key] = 1; m.offer = { id, until: now() + o.min * 60000 };
  track('offer_shown', { id });
  setTimeout(() => offerShow(), 600);
  offerChip();
}
function offerShow() {
  const m = M(); if (!m.offer || m.offer.until <= now()) return offerChip();
  const o = MON.offers[m.offer.id];
  modal(hdr('🎁', T(o.title), T(o.tag)) + `<div class="of-box"><div class="of-tag">${T('Лише зараз')} · <span id="ofT">${mmss(m.offer.until - now())}</span></div>
    <div class="of-rw">${monTxt(o.rw)}</div><button class="main of-buy" onclick="offerBuy()">${o.price}</button></div>`);
}
window.offerShow = offerShow;
window.offerBuy = () => {
  const m = M(); if (!m.offer) return; const o = MON.offers[m.offer.id];
  demoPay(o.price, 'offer_' + m.offer.id); track('offer_buy', { id: m.offer.id }); monGive(o.rw, 'offer');
  m.offer = null; offerChip(); closeM();
};
function offerChip() {
  const c = $('chipOffer'); if (!c) return;
  const m = M(), on = m.offer && m.offer.until > now();
  c.style.display = on ? 'flex' : 'none';
  if (on) c.innerHTML = `🎁 ${mmss(m.offer.until - now())}`;
}

/* ---------- 4. підписка ---------- */
window.subBuy = () => {
  const m = M(); m.sub.until = Math.max(now(), m.sub.until) + MON.sub.days * 864e5;
  demoPay(MON.sub.price, 'sub'); track('sub_start', {}); subDaily(); shop();
};
function subDaily() {
  const m = M(); if (!subOn() || m.sub.last === today()) return;
  m.sub.last = today(); monGive({ g: MON.sub.daily.g, e: MON.sub.daily.e }, 'sub');
  toast('✨ ' + T('Подарунок благословення') + ': ' + monTxt(MON.sub.daily)); track('sub_daily', {});
}
const subHtml = () => {
  const on = subOn();
  return `<div class="up mon-card sub"><div class="big">✨</div><div class="up-b" style="flex:1"><div class="up-n">${T('Благословення Хоші')}</div>
    <small>${T('Щодня {g} і {e} · +{c} до макс. енергії · реклама без очікування', { g: MON.sub.daily.g + U('gem'), e: MON.sub.daily.e + U('energy'), c: MON.sub.cap })}</small>
    ${on ? `<small class="ok-t">✓ ${T('Активне ще {d} дн.', { d: daysLeft(M().sub.until) })}</small>` : ''}</div>
    <button class="price${on ? '' : ' ok'}" onclick="subBuy()">${MON.sub.price}<br><small>${T('на тиждень')}</small></button></div>`;
};

/* ---------- встановлення: обгортки дій гри ---------- */
(() => {
  /* замовлення: очки пропуску, копилка, ×2 за рекламу */
  const baseFill = fill;
  fill = function (i, ev) {
    const before = S.stats.orders, co0 = S.co;
    const r = baseFill(i, ev);
    if (S.stats.orders > before) {
      passAdd('order'); piggyAdd(MON.piggy.perOrder);
      const got = S.co - co0; if (got > 0) orderX2(got);
    }
    return r;
  };
  function orderX2(coins) {
    if (adLeft() <= 0 || S.tut < TUTORIAL.length) return;
    let b = $('adX2'); if (b) b.remove();
    b = document.createElement('button'); b.id = 'adX2'; b.className = 'ad-x2';
    b.innerHTML = `📺 ${T('×2 за рекламу')} +${coins}${U('coin')}`;
    b.onclick = () => { b.remove(); adThen('order_x2', () => { addCo(coins); render(); toast('+' + coins + U('coin')); }); };
    document.body.appendChild(b);
    setTimeout(() => b.remove(), MON.orderX2Ms);
  }
  /* злиття → копилка */
  const baseMerge = merge;
  merge = function (a, b) {
    const ok = baseMerge(a, b);
    if (ok) { const m = M(); m.merges = (m.merges || 0) + 1; if (m.merges % MON.piggy.perMerges[0] === 0) piggyAdd(MON.piggy.perMerges[1]); }
    return ok;
  };
  /* завдання, щоденний подарунок, будівлі → очки пропуску */
  const baseQ = claimQ; claimQ = function (i) { const was = S.quests.list[i].claimed; baseQ(i); if (!was && S.quests.list[i].claimed) passAdd('quest'); };
  const baseChain = claimChain; claimChain = function () { const c = PS().chain; baseChain(); if (PS().chain > c) passAdd('quest'); };
  const baseBuild = buildNext; buildNext = function () { const t = S.temple; baseBuild(); if (S.temple > t) passAdd('build'); };
  const baseClaim = claim; claim = function (i) { baseClaim(i); passAdd('daily'); };
  /* щоденний подарунок: друга кнопка «×2 за рекламу» */
  const baseDaily = daily;
  daily = function (auto) {
    const r = baseDaily(auto);
    const d = S.daily, claimed = d.last === today();
    if (!claimed && $('m').classList.contains('on') && adLeft() > 0) {
      const btn = document.querySelector('#mc .mbody > button.main');
      if (btn) btn.insertAdjacentHTML('afterend', `<button class="ad-btn" onclick="dailyX2()">📺 ${T('Забрати ×2')}</button>`);
    }
    return r;
  };
  window.dailyX2 = () => {
    const d = S.daily, idx = d.last === dayShift(-1) ? d.streak % 7 : 0;
    adThen('daily_x2', () => { claim(idx); giveRw(CFG.daily[idx]); toast('×2 ' + rwTxt(CFG.daily[idx])); render(); });
  };

  /* тригери пропозицій */
  const baseOffer = offerEnergy;
  offerEnergy = function () { baseOffer(); offerTrigger('energy', 'energy_' + today()); };
  const baseRender = render;
  render = function (...a) {
    baseRender(...a);
    const nb = TEMPLE[S.temple];
    if (nb && S.stars >= nb.st && S.co < nb.co && S.co >= nb.co * .4) offerTrigger('builder', 'builder_' + S.temple);
    if (S.lv >= 3 && S.lv % 3 === 0) offerTrigger('level', 'level_' + S.lv);
  };

  /* лавка, вкладка «Кристали»: копилка, підписка, мішечки осколків */
  const baseShop = shop;
  shop = function () {
    baseShop();
    if (shopTab !== 'gem') return;
    const tabs = document.querySelector('#mc .tabs'); if (!tabs) return;
    const freeToday = M().adPouch === today();
    tabs.insertAdjacentHTML('afterend', piggyHtml() + subHtml() + `
      <div class="up mon-card"><div class="big">🧩</div><div class="up-b" style="flex:1"><div class="up-n">${T('Мішечок осколків')}</div><small>${T('{n} випадкових осколків', { n: FRAG.packSize })}</small></div>
        <button class="price${S.ge >= FRAG.packGems ? ' ok' : ''}" onclick="buyFragPack()">${FRAG.packGems}<br>${U('gem')}</button></div>
      <div class="up mon-card"><div class="big">📺</div><div class="up-b" style="flex:1"><div class="up-n">${T('Мішечок осколків')} · ${T('Безкоштовно за рекламу')}</div>
        <small>${freeToday ? T('Сьогодні вже взято') : T('{n} випадкових осколків', { n: 3 })}</small></div>
        <button class="price${freeToday ? '' : ' ok'}" ${freeToday ? 'disabled' : ''} onclick="adPouch()">▶</button></div>`);
  };
  window.adPouch = () => adThen('frag_pouch', () => { M().adPouch = today(); fragToast(giveFrags(3, null, 'ad')); shop(); });

  /* кнопки на головному екрані: пропуск і таймер пропозиції */
  const row = document.querySelector('.lvl');
  if (row) {
    row.insertAdjacentHTML('beforeend', `<div class="chip of-chip" id="chipOffer" style="display:none" onclick="offerShow()"></div>
      <button class="icon med" id="bPass" onclick="pass()">🎫<i class="dot" id="dotP"></i></button>`);
  }
  setInterval(() => { offerChip(); const t = $('ofT'); const m = M(); if (t && m.offer) t.textContent = mmss(Math.max(0, m.offer.until - now())); }, 1000);

  $('bShop').onclick = () => shop();   // кнопка була прив'язана до старого посилання

  /* старт: щоденний подарунок підписки */
  const baseAfter = afterStart;
  afterStart = function () { baseAfter(); subDaily(); passDot(); offerChip(); };
})();
