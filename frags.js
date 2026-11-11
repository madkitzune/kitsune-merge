/* =====================================================================
   FRAGMENTS — лисята й коропи відкриваються поступово, з осколків.
   Осколки падають із замовлень, скринь, сюжету, пропуску, копилки й магазину.
   Потрібно: звичайний 10 · рідкісний 20 · епічний 35 · легендарний 50.
   Осколки вже відкритого улюбленця перетворюються на дружбу (+15 за осколок).
   Підключається після game.js і pets.js.
   ===================================================================== */
const FRAG = {
  need: { common: 10, rare: 20, epic: 35, legendary: 50 },
  weight: { common: 6, rare: 3, epic: 1.5, legendary: .6 },  // шанс, що осколок буде саме цього рівня
  orderChance: .35,           // осколок за замовлення
  chest: [2, 3],              // осколків зі скрині
  storyShare: .6,             // сюжетна нагорода = 60% осколків улюбленця
  dupFriend: 15,              // дружба за зайвий осколок
  packGems: 15, packSize: 6,  // мішечок осколків у лавці
};
[
  ['Осколки', 'Осколки', 'Shards'],
  ['Осколок: {p}', 'Осколок: {p}', 'Shard: {p}'],
  ['+{n} осколків', '+{n} осколков', '+{n} shards'],
  ['Збери осколки, щоб відкрити', 'Собери осколки, чтобы открыть', 'Collect shards to unlock'],
  ['Осколки падають із замовлень, скринь і сюжетних завдань. Їх також дають копилка, пропуск і лавка.', 'Осколки падают из заказов, сундуков и сюжетных заданий. Их также дают копилка, пропуск и лавка.', 'Shards drop from orders, chests and story quests. The piggy bank, the pass and the shop give them too.'],
  ['Мішечок осколків', 'Мешочек осколков', 'Shard pouch'],
  ['{n} випадкових осколків', '{n} случайных осколков', '{n} random shards'],
  ['Зібрано!', 'Собрано!', 'Complete!'],
  ['Зайві осколки → дружба', 'Лишние осколки → дружба', 'Extra shards → friendship'],
].forEach(([uk, ru, en]) => { I18N.uk[uk] = uk; I18N.ru[uk] = ru; I18N.en[uk] = en; });

const fragHave = id => (PS().frags ||= {})[id] || 0;
const fragNeed = id => FRAG.need[PETS[id].r];

/* випадковий улюбленець для осколка: спершу закриті, з вагою за рідкістю */
function fragRollPet() {
  const locked = Object.keys(PETS).filter(id => !PS().own[id]);
  const pool = locked.length ? locked : Object.keys(PETS);
  const tot = pool.reduce((s, id) => s + FRAG.weight[PETS[id].r], 0);
  let r = Math.random() * tot;
  for (const id of pool) { r -= FRAG.weight[PETS[id].r]; if (r <= 0) return id; }
  return pool[0];
}

/* видати n осколків улюбленцю id (або випадковим); повертає список {id,n} */
function giveFrags(n, id, src) {
  PS().frags ||= {};
  const got = {};
  for (let k = 0; k < n; k++) { const pid = id || fragRollPet(); got[pid] = (got[pid] || 0) + 1; }
  const out = [];
  for (const pid in got) {
    const P = PS(), cnt = got[pid];
    if (P.own[pid]) { P.own[pid].fr += cnt * FRAG.dupFriend; out.push({ id: pid, n: cnt, dup: true }); continue; }
    P.frags[pid] = fragHave(pid) + cnt;
    out.push({ id: pid, n: cnt });
    if (P.frags[pid] >= fragNeed(pid)) { P.frags[pid] = 0; setTimeout(() => unlockPet(pid, 'frags'), 500); }
  }
  track('frags', { n, src: src || '' });
  return out;
}
const fragIcon = (id, small) => `<span class="frag${small ? ' s' : ''}">${PETART[id] ? `<img src="${PETART[id]}" alt="">` : PETS[id].em}<i>🧩</i></span>`;
function fragToast(list) {
  if (!list.length) return;
  toast(list.map(f => `${fragIcon(f.id, true)} +${f.n}`).join('  '));
}

(() => {
  /* замовлення: шанс осколка */
  const baseFill = fill;
  fill = function (i, ev) {
    const before = S.stats.orders;
    const r = baseFill(i, ev);
    if (S.stats.orders > before && Math.random() < FRAG.orderChance) {
      const g = giveFrags(1, null, 'order');
      if (ev && ev.clientX) floatTxt(ev.clientX - 10, ev.clientY - 40, fragIcon(g[0].id, true) + '+1');
    }
    return r;
  };

  /* скриня: 2–3 осколки замість рідкісного миттєвого відкриття улюбленця */
  petsOnChest = function () {
    petsFoodDrop(PETS_CFG.foodDrop.chest);
    const [a, b] = FRAG.chest;
    fragToast(giveFrags(a + Math.floor(Math.random() * (b - a + 1)), null, 'chest'));
  };

  /* сюжет і тижневі: замість цілого улюбленця — великий набір його осколків */
  const baseGive = giveExtra;
  giveExtra = function (r, src) {
    if (!r.pet) return baseGive(r, src);
    const rest = { ...r }; delete rest.pet;
    baseGive(rest, src);
    if (r.pet === 'random') return fragToast(giveFrags(8, null, src));
    /* перший сюжетний улюбленець — цілком (перший лисеня має прийти в першій сесії) */
    const first = src === 'story' && PS().chain === 1;
    const n = first ? fragNeed(r.pet) : Math.ceil(fragNeed(r.pet) * FRAG.storyShare);
    fragToast(giveFrags(n, r.pet, src));
  };
  /* текст нагороди: «N осколків» замість «улюбленець» */
  const baseRw = rwHtml;
  rwHtml = function (r) {
    if (!r.pet) return baseRw(r);
    const rest = { ...r }; delete rest.pet;
    const f = r.pet === 'random' ? `🧩 ×8` : `${fragIcon(r.pet, true)} ×${Math.ceil(fragNeed(r.pet) * FRAG.storyShare)}`;
    return [f, baseRw(rest)].filter(Boolean).join(' · ');
  };

  /* альбом: закриті улюбленці — силует і шкала осколків */
  const baseAlbum = album;
  album = function (tab) {
    baseAlbum(tab);
    if (albTab === 'food') return;
    const ids = Object.keys(PETS).filter(id => PETS[id].kind === albTab);
    const cards = document.querySelectorAll('#mc .pgrid .pcard');
    cards.forEach((c, k) => {
      const id = ids[k];
      if (!id || PS().own[id]) return;
      const h = fragHave(id), n = fragNeed(id);
      c.classList.add('fraglock');
      c.onclick = () => fragCard(id);
      c.innerHTML = `<div class="pi">${PETART[id] ? `<img class="sil" src="${PETART[id]}" alt="">` : '❔'}</div>
        <div class="up-n">${h ? T(PETS[id].name) : '???'}</div><small>🧩 ${h}/${n}</small>
        <div class="bar frbar"><i style="width:${Math.min(100, h / n * 100)}%"></i></div>`;
    });
  };
  window.fragCard = id => {
    const p = PETS[id], h = fragHave(id), n = fragNeed(id);
    modal(`<div class="reveal small" style="--rc:${RARITY[p.r].c}">
        <span class="pe big">${PETART[id] ? `<img class="sil" src="${PETART[id]}" alt="">` : '❔'}</span>
        <div class="rar">${T(RARITY[p.r].n)}</div><div class="mh-t">${h ? T(p.name) : '???'}</div>
        <p>${T('Збери осколки, щоб відкрити')}</p></div>
      <div class="bar frbar big"><i style="width:${Math.min(100, h / n * 100)}%"></i><span>🧩 ${h} / ${n}</span></div>
      <p class="pf-tip" style="margin-top:10px">${T('Осколки падають із замовлень, скринь і сюжетних завдань. Їх також дають копилка, пропуск і лавка.')}</p>
      <button onclick="album('${p.kind}')">${T('◀ Альбом')}</button>`);
  };

  /* мішечок осколків у лавці (вкладка «Кристали») */
  window.buyFragPack = () => {
    if (S.ge < FRAG.packGems) { toast(T('Бракує кристалів')); return; }
    S.ge -= FRAG.packGems; track('frag_pack', {}); SFX.chest();
    fragToast(giveFrags(FRAG.packSize, null, 'shop')); shop();
  };
})();
