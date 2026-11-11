'use strict';
/* =====================================================================
   PETS: лисята (активний набір 1–3) + коропи кої (живуть у ставку храму),
   їжа, дружба/рівні, скіни, сюжетний ланцюжок і тижневі завдання.
   Завантажується ДО game.js; глобальні S/CFG/U/... використовуються лише в рантаймі.
   ===================================================================== */
const PETS_CFG={
  levels:[0,40,110,220,380],          // дружба для рів. 1..5
  hungerPerHour:8, unlockSat:70, maxSat:100,
  foxSlots:t=>1+(t>=3?1:0)+(t>=6?1:0),                 // t = кількість відбудованих обʼєктів храму
  pondSlots:t=>t>=5?2+(t>=6?1:0)+(t>=7?1:0)+(t>=8?1:0):0,
  fireEveryMin:10,
  gatherEveryMs:2500,
  foodDrop:{order:.25,chest:.5,tree:.6,pond:.35},
  chestPetChance:.04,
  skinGems:30,
  fx:{fox_gather:1,fox_sleepy:2,fox_luck:.05,fox_star:.08,fox_fire:4,fox_nine:.25,
      koi_red:.2,koi_white:.05,koi_gold:.05,koi_sage:.1,koi_moon:.1,koi_dragon:.03},
};
const RARITY={common:{n:'Звичайний',c:'#9e9e9e'},rare:{n:'Рідкісний',c:'#4fc3f7'},epic:{n:'Епічний',c:'#b26bff'},legendary:{n:'Легендарний',c:'#ffd166'}};
const PETS={
  fox_gather:{kind:'fox',name:'Збирайко',r:'common',em:'🦊',f:'',d:l=>T('Сам підбирає монетки й скрині духів у храмі')},
  fox_sleepy:{kind:'fox',name:'Соня',r:'common',em:'🦊',f:'hue-rotate(190deg) saturate(.7)',d:l=>T('+{n} до максимуму енергії',{n:l*2})},
  fox_luck:{kind:'fox',name:'Щасливчик',r:'rare',em:'🦊',f:'hue-rotate(80deg)',d:l=>T('+{n}% шанс скрині при злитті 5+ рівня',{n:l*5})},
  fox_star:{kind:'fox',name:'Зорянка',r:'rare',em:'🦊',f:'hue-rotate(250deg)',d:l=>T('+{n}% шанс зайвої ⭐ за замовлення',{n:l*8})},
  fox_fire:{kind:'fox',name:'Вогник',r:'epic',em:'🦊',f:'hue-rotate(-25deg) saturate(2.2)',d:l=>T('Кожні {m} хв дає +{n}⚡',{m:PETS_CFG.fireEveryMin,n:PETS_CFG.fx.fox_fire+l})},
  fox_nine:{kind:'fox',name:'Девʼятихвіст',r:'legendary',em:'🦊',f:'grayscale(1) brightness(1.7) drop-shadow(0 0 6px #fff)',d:l=>T('+{n}% монет за комбо',{n:l*25})},
  koi_red:{kind:'koi',name:'Червоний',r:'common',em:'🐟',f:'hue-rotate(160deg) saturate(2)',d:l=>T('+{n}% монет зі ставка',{n:l*20})},
  koi_white:{kind:'koi',name:'Сніжний',r:'common',em:'🐟',f:'grayscale(1) brightness(1.8)',d:l=>T('+{n}% шанс кристала зі ставка',{n:l*5})},
  koi_gold:{kind:'koi',name:'Золотий',r:'rare',em:'🐠',f:'hue-rotate(-20deg) saturate(1.6)',d:l=>T('+{n}% монет із замовлень',{n:l*5})},
  koi_sage:{kind:'koi',name:'Мудрець',r:'rare',em:'🐡',f:'',d:l=>T('+{n}% досвіду',{n:l*10})},
  koi_moon:{kind:'koi',name:'Місячний',r:'epic',em:'🐟',f:'hue-rotate(60deg) brightness(1.3)',d:l=>T('Уночі енергія відновлюється на {n}% швидше',{n:l*10})},
  koi_dragon:{kind:'koi',name:'Драконовий',r:'legendary',em:'🐲',f:'',d:l=>T('+{n}% шанс одразу рів. 2 з призову',{n:l*3})},
};
const FOOD={rice:{n:'Рис',em:'🍚',v:10,love:'koi',w:30},senbei:{n:'Сенбей',em:'🍘',v:15,love:'koi',w:22},onigiri:{n:'Онігірі',em:'🍙',v:20,w:20},
  tempura:{n:'Темпура',em:'🍤',v:25,love:'fox',w:14},naruto:{n:'Наруто',em:'🍥',v:30,w:9},inari:{n:'Інарі',em:'🍣',v:50,love:'fox',w:5}};
const SKINS={scarf:{n:'Шарфик',em:'🧣'},bow:{n:'Бантик',em:'🎀'},flowers:{n:'Віночок',em:'🌸'},kimono:{n:'Кімоно',em:'👘'},maple:{n:'Осінній',em:'🍁'},snow:{n:'Зимовий',em:'❄️'}};
const CHAIN=[
  {t:'Відбудуй місток',p:()=>[S.temple,1],rw:{pet:'fox_gather'}},
  {t:'Виконай 10 замовлень',p:()=>[S.stats.orders,10],rw:{food:{inari:2,rice:4}}},
  {t:'Створи предмет 6-го рівня',p:()=>[S.pets.maxTier||0,6],rw:{pet:'fox_sleepy'}},
  {t:'Відбудуй браму торії',p:()=>[S.temple,3],rw:{skin:1,g:5}},
  {t:'Нагодуй улюбленців 3 рази',p:()=>[S.pets.feeds,3],rw:{food:{tempura:3,onigiri:3}}},
  {t:'Відбудуй джерело з коропами',p:()=>[S.temple,5],rw:{pet:'koi_red'}},
  {t:'Досягни 8 рівня',p:()=>[S.lv,8],rw:{pet:'koi_gold'}},
  {t:'Відбудуй великий дзвін',p:()=>[S.temple,6],rw:{pet:'fox_luck'}},
  {t:'Принеси 3 дари вівтарю',p:()=>[S.pets.offers,3],rw:{pet:'fox_fire'}},
  {t:'Досягни 12 рівня',p:()=>[S.lv,12],rw:{pet:'koi_sage'}},
  {t:'Відбудуй святилище',p:()=>[S.temple,8],rw:{pet:'fox_star'}},
  {t:'Нагодуй улюбленців 25 разів',p:()=>[S.pets.feeds,25],rw:{pet:'koi_moon'}},
  {t:'Досягни 15 рівня',p:()=>[S.lv,15],rw:{pet:'fox_nine'}},
];
const PETART={},FOODART={};
const PS=()=>S.pets;
function petsPreload(){const ps=[];
  for(const id in PETS)ps.push(probeAny(`art/pets/${id}`,['.png','.svg']).then(u=>{PETART[id]=u}));
  for(const id in FOOD)ps.push(probeAny(`art/food/${id}`,['.png','.svg']).then(u=>{FOODART[id]=u}));
  for(const k in SKINS)ps.push(probe(`art/skins/${k}.svg`).then(ok=>{SKINART[k]=ok}));return ps}
const SKINART={};
function petIcon(id,big){const p=PETS[id],o=PS().own[id];
  const sk=!(o&&o.skin)?'':(p.kind==='fox'&&SKINART[o.skin]&&PETART[id]&&PETART[id].endsWith('.svg'))?`<img src="art/skins/${o.skin}.svg" alt="" style="position:absolute;left:0;top:0;width:100%;height:100%">`:`<i class="skin">${SKINS[o.skin].em}</i>`;
  return `<span class="pe${big?' big':''}">${PETART[id]?`<img src="${PETART[id]}" alt="">`:`<span style="filter:${p.f||'none'}">${p.em}</span>`}${sk}</span>`}
const foodIcon=id=>FOODART[id]?`<img class="ui" src="${FOODART[id]}" alt="">`:FOOD[id].em;

/* --- стан: ситість лінива (рахуємо від часу), рівень за дружбою --- */
function petSat(id){const o=PS().own[id];if(!o)return 0;return Math.max(0,o.sat-(now()-o.satAt)/3600000*PETS_CFG.hungerPerHour)}
function petLv(id){const o=PS().own[id];if(!o)return 0;let l=0;PETS_CFG.levels.forEach((t,i)=>{if(o.fr>=t)l=i+1});return l}
function inPond(id){return PS().pond.slice(0,PETS_CFG.pondSlots(S.temple)).includes(id)}
/* PB = сила бонусу (рівень) якщо улюбленець активний і ситий, інакше 0 */
function PB(id){if(!S||!S.pets)return 0;const p=PETS[id];if(!p||!PS().own[id])return 0;
  if(p.kind==='fox'&&!PS().active.includes(id))return 0;if(p.kind==='koi'&&!inPond(id))return 0;
  return petSat(id)>0?petLv(id):0}

function unlockPet(id,src){const P=PS();if(P.own[id]){S.ge+=10;toast(T('{n} вже з тобою: +10',{n:T(PETS[id].name)})+U('gem'));return}
  P.own[id]={fr:0,sat:PETS_CFG.unlockSat,satAt:now(),skin:null,skins:[],at:now()};
  const p=PETS[id];if(p.kind==='fox'&&P.active.length<PETS_CFG.foxSlots(S.temple))P.active.push(id);
  if(p.kind==='koi')P.pond.push(id);
  track('pet_unlock',{id,src:src||''});SFX.chest();vib([30,50,30]);
  modal(`<div class="reveal" style="--rc:${RARITY[p.r].c}"><div class="rays"></div>${petIcon(id,true)}<div class="rar">${T(RARITY[p.r].n)}</div>
    <div class="mh-t">${T(p.name)}</div><p>${p.kind==='fox'?T('Лисеня'):T('Короп кої')} · ${p.d(1)}</p>
    ${p.kind==='koi'&&!PETS_CFG.pondSlots(S.temple)?`<small>${T('Житиме у ставку, коли відбудуєш Джерело.')}</small>`:''}</div>`);
  petsRefresh()}
function giveSkin(petId){const P=PS();const ids=petId?[petId]:Object.keys(P.own);if(!ids.length){S.ge+=10;return null}
  const id=pick(ids),o=P.own[id];const free=Object.keys(SKINS).filter(k=>!o.skins.includes(k));if(!free.length){S.ge+=10;return null}
  const k=pick(free);o.skins.push(k);toast(T('Новий скін «{s}» для {p}!',{s:T(SKINS[k].n),p:T(PETS[id].name)}));track('skin_unlock',{id,k});return k}
function addFood(map){for(const k in map)PS().food[k]=(PS().food[k]||0)+map[k]}
function rollFood(){const tot=Object.values(FOOD).reduce((s,f)=>s+f.w,0);let r=Math.random()*tot;for(const k in FOOD){r-=FOOD[k].w;if(r<=0)return k}return 'rice'}
function petsFoodDrop(ch,x,y){if(Math.random()>=ch)return;const k=rollFood();addFood({[k]:1});if(x!==undefined)floatTxt(x+20,y-50,'+'+foodIcon(k));track('food_drop',{k})}
function petsOnOrder(ev){petsFoodDrop(PETS_CFG.foodDrop.order,ev.clientX,ev.clientY)}
function petsOnChest(){petsFoodDrop(PETS_CFG.foodDrop.chest);
  if(Math.random()<PETS_CFG.chestPetChance){const locked=Object.keys(PETS).filter(id=>!PS().own[id]&&(PETS[id].r==='common'||PETS[id].r==='rare'));if(locked.length)setTimeout(()=>unlockPet(pick(locked),'chest'),400)}}

function feed(id,food){const P=PS(),o=P.own[id];if(!o||!(P.food[food]>0))return false;
  const f=FOOD[food],love=f.love===PETS[id].kind?2:1,cur=petSat(id);
  if(cur>=PETS_CFG.maxSat-1){toast(T('{p} ситий і задоволений',{p:T(PETS[id].name)}));return false}
  const lv0=petLv(id);P.food[food]--;o.sat=Math.min(PETS_CFG.maxSat,cur+f.v*love);o.satAt=now();o.fr+=Math.round(f.v*love*(1+(PETS[id].kind==='fox'&&typeof meadowComfort==='function'?meadowComfort()*CFG.meadow.comfortFr:0)));P.feeds++;
  track('pet_feed',{id,food,love});SFX.pop();vib(10);
  const lv1=petLv(id);if(lv1>lv0){track('pet_levelup',{id,lv:lv1});SFX.level();toast(T('{p} — рівень дружби {n}!',{p:T(PETS[id].name),n:lv1}))}
  return love}

/* --- щосекунди --- */
let lastGather=0;
function petsTick(){if(!S||!S.pets)return;const P=PS();
  if(PB('fox_fire')){P.fireAt=P.fireAt||now();if(now()-P.fireAt>PETS_CFG.fireEveryMin*60000){P.fireAt=now();const e=PETS_CFG.fx.fox_fire+PB('fox_fire');S.en+=e;toast('🔥 '+T('Вогник приніс +{e}',{e})+U('energy'));track('pet_gift',{id:'fox_fire',e})}}
  if(typeof templeOpen!=='undefined'&&templeOpen&&PB('fox_gather')&&drops.length&&now()-lastGather>PETS_CFG.gatherEveryMs){lastGather=now();collectDrop(drops[0].id);track('pet_gather',{})}}

/* --- храм: коропи в ставку, панель їжі, перетягування їжі на улюбленця --- */
function foodBarHtml(extra){const P=PS(),foods=Object.keys(FOOD).filter(k=>P.food[k]>0);
  return `<div class="foodbar">${extra||''}${foods.length?foods.map(k=>`<div class="food" data-food="${k}">${foodIcon(k)}<b>${P.food[k]}</b></div>`).join(''):`<small>${T('Їжа падає із замовлень, скринь, дерева і ставка')}</small>`}</div>`}
function petsAfterTemple(){$('tpanel').insertAdjacentHTML('beforeend',`<div class="scnav"><button onclick="openMeadow()">${T('🦊 Галявина')}</button>${built('spring')?`<button onclick="openPond()">${T('🐟 Джерело')}</button>`:''}<button onclick="album()">${T('📖 Альбом')}</button></div>`)}
function petsRefresh(){if(typeof pondOpen!=='undefined'&&pondOpen)renderPond();else if(typeof meadowOpen!=='undefined'&&meadowOpen)renderMeadow();else if(typeof templeOpen!=='undefined'&&templeOpen)renderTemple()}
function petTap(id,el){el.classList.remove('tapped');void el.offsetWidth;el.classList.add('tapped');const r=el.getBoundingClientRect(),s=petSat(id);
  floatTxt(r.x,r.y-10,s>0?'❤️':'😢');hoshiSay(s>0?T('{p}: ситість {s}%, дружба рів. {l}',{p:T(PETS[id].name),s:Math.round(s),l:petLv(id)}):T('{p}: голодний… перетягни на нього їжу',{p:T(PETS[id].name)}));SFX.pop();track('pet_tap',{id})}
let fdrag=null;
addEventListener('pointerdown',e=>{const f=e.target.closest&&e.target.closest('.food');if(!f)return;fdrag={k:f.dataset.food};const g=$('ghost');g.innerHTML=foodIcon(fdrag.k);g.style.display='flex';g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';e.preventDefault()});
addEventListener('pointermove',e=>{if(!fdrag)return;const g=$('ghost');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});
addEventListener('pointerup',e=>{if(!fdrag)return;const k=fdrag.k;fdrag=null;$('ghost').style.display='none';
  const el=document.elementFromPoint(e.clientX,e.clientY);
  if(typeof pondOpen!=='undefined'&&pondOpen&&el&&el.closest('#pscene')){pondThrow(k,e.clientX,e.clientY);return}
  const pe=el&&el.closest('.pet');
  if(!pe){toast(T('Перетягни їжу на лисеня'));return}
  const id=pe.dataset.pet,love=feed(id,k);if(love){floatTxt(e.clientX,e.clientY-20,love>1?'💖💖':'💖');burst(e.clientX,e.clientY,'#ff7fb0',10,40);petsRefresh()}});

/* --- Альбом --- */
let albTab='fox';
function album(tab){if(tab)albTab=tab;const P=PS();
  let h=hdr('📖',T('Альбом улюбленців'),T('Лисята {a}/{b} активні · ставок {c}/{d}',{a:P.active.length,b:PETS_CFG.foxSlots(S.temple),c:Math.min(P.pond.length,PETS_CFG.pondSlots(S.temple)),d:PETS_CFG.pondSlots(S.temple)}))+
  `<div class="tabs">${[['fox','Лисята'],['koi','Коропи'],['food','Їжа']].map(([k,n])=>`<div class="tab${albTab===k?' on':''}" onclick="album('${k}')">${T(n)}</div>`).join('')}</div>`;
  if(albTab==='food'){h+='<div class="bgrid">'+Object.keys(FOOD).map(k=>{const f=FOOD[k];return `<div class="bst"><div class="big">${foodIcon(k)}</div><div class="up-n">${T(f.n)} ×${P.food[k]||0}</div><small>${T('+{n} ситості',{n:f.v})}${f.love?`<br>${f.love==='fox'?T('лисята люблять ×2'):T('коропи люблять ×2')}`:''}</small></div>`}).join('')+'</div>';
    h+=`<small style="display:block;margin-top:8px">${T('Годуй у храмі: перетягни їжу на улюбленця. Або кнопкою в його картці.')}</small>`;return modal(h)}
  h+='<div class="pgrid">';
  for(const id in PETS){const p=PETS[id];if(p.kind!==albTab)continue;const o=P.own[id];
    if(!o){h+=`<div class="pcard locked" style="--rc:${RARITY[p.r].c}"><div class="pi">❔</div><div class="up-n">???</div><small>${T(RARITY[p.r].n)}</small></div>`;continue}
    const s=petSat(id),l=petLv(id),on=p.kind==='fox'?P.active.includes(id):inPond(id);
    h+=`<div class="pcard${on?' on':''}${s<=0?' hungry':''}" style="--rc:${RARITY[p.r].c}" onclick="petCard('${id}')"><div class="pi">${petIcon(id)}</div><div class="up-n">${T(p.name)}</div>
      <small>${on?T('Рів. {n} · активний',{n:l}):T('Рів. {n} · відпочиває',{n:l})}</small><div class="bar sat"><i style="width:${s}%"></i></div></div>`}
  h+='</div>';modal(h)}
function petCard(id){const P=PS(),p=PETS[id],o=P.own[id],l=petLv(id),s=petSat(id),next=PETS_CFG.levels[l];
  const on=p.kind==='fox'?P.active.includes(id):P.pond.includes(id);
  let h=`<div class="reveal small" style="--rc:${RARITY[p.r].c}">${petIcon(id,true)}<div class="rar">${T(RARITY[p.r].n)}</div><div class="mh-t">${T(p.name)}</div>
    <p><b>${p.d(Math.max(1,l))}</b>${s<=0?`<br><span style="color:#ff8a8a">${T('Голодний — бонус не діє')}</span>`:''}</p></div>
    <small>${T('Ситість')}</small><div class="bar sat"><i style="width:${s}%"></i></div>
    <small>${T('Дружба: {n}',{n:o.fr})}${next?T(' / {a} до рів. {b}',{a:next,b:l+1}):T(' (макс.)')}</small><div class="bar"><i style="width:${next?Math.min(100,o.fr/next*100):100}%"></i></div>
    <h3 style="margin-top:10px">${T('Нагодувати')}</h3><div class="foodrow">${Object.keys(FOOD).map(k=>`<button class="fbtn" ${P.food[k]>0?'':'disabled'} onclick="feedFromCard('${id}','${k}')">${foodIcon(k)}<b>${P.food[k]||0}</b></button>`).join('')}</div>
    <h3 style="margin-top:10px">${T('Скіни')}</h3><div class="foodrow">
      <button class="fbtn${!o.skin?' on':''}" onclick="equipSkin('${id}',null)">—</button>
      ${Object.keys(SKINS).map(k=>{const has=o.skins.includes(k);return `<button class="fbtn${o.skin===k?' on':''}${has?'':' lock'}" onclick="${has?`equipSkin('${id}','${k}')`:`buySkin('${id}','${k}')`}">${SKINS[k].em}${has?'':`<b>${PETS_CFG.skinGems}${U('gem')}</b>`}</button>`}).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:10px"><button onclick="album('${p.kind}')">${T('◀ Альбом')}</button>
    <button class="main" onclick="togglePet('${id}')">${p.kind==='fox'?(on?T('Зняти з команди'):T('В команду')):(on?T('Вийняти зі ставка'):T('У ставок'))}</button></div>`;
  modal(h)}
function feedFromCard(id,k){const love=feed(id,k);if(love)toast(T(love>1?'{p} обожнює {f} 💖💖':'{p} дякує за {f} 💖',{p:T(PETS[id].name),f:T(FOOD[k].n).toLowerCase()}));petCard(id)}
function equipSkin(id,k){PS().own[id].skin=k;track('skin_equip',{id,k:k||'none'});SFX.pop();petCard(id)}
function buySkin(id,k){if(S.ge<PETS_CFG.skinGems){toast(T('Бракує кристалів'));return}confirmM(T('Купити «{s}» для {p} за {c}? Скін лише змінює вигляд.',{s:T(SKINS[k].n),p:T(PETS[id].name),c:PETS_CFG.skinGems+U('gem')}),()=>{S.ge-=PETS_CFG.skinGems;PS().own[id].skins.push(k);PS().own[id].skin=k;track('skin_buy',{id,k});track('skin_equip',{id,k});SFX.chest();petCard(id)})}
function togglePet(id){const P=PS(),p=PETS[id];
  if(p.kind==='fox'){const i=P.active.indexOf(id);if(i>=0)P.active.splice(i,1);else{if(P.active.length>=PETS_CFG.foxSlots(S.temple)){toast(T('Усі місця зайняті ({n}). Відбудовуй храм — місць побільшає.',{n:P.active.length}));return}P.active.push(id)}track('pet_active',{id,on:i<0})}
  else{const i=P.pond.indexOf(id);if(i>=0)P.pond.splice(i,1);else{if(!PETS_CFG.pondSlots(S.temple)){toast(T('Спершу відбудуй Джерело'));return}P.pond.unshift(id)}track('pet_pond',{id,on:i<0})}
  if(typeof templeOpen!=='undefined'&&templeOpen)spawnSpirits();petCard(id)}

/* --- сюжетний ланцюжок + тижневі --- */
const weekId=()=>Math.floor((Date.now()/864e5+3)/7);
function ensureWeek(){const P=PS();if(P.week&&P.week.id===weekId())return;
  const pool=QUEST_POOL.filter(q=>!q.needTemple||S.temple>=2).slice().sort(()=>Math.random()-.5).slice(0,2);
  P.week={id:weekId(),list:pool.map((q,i)=>({id:q.id,n:q.max?Math.min(9,q.n(S.lv)+2):q.n(S.lv)*5,p:0,claimed:false,rw:i?{skin:1,g:10,food:{naruto:2,inari:1}}:{pet:'random',food:{tempura:3}}}))}}
function weeklyQ(id,amt){if(!S||!S.pets)return;if(id==='tier')S.pets.maxTier=Math.max(S.pets.maxTier||0,amt);
  const P=PS();if(!P.week||P.week.id!==weekId())return;P.week.list.forEach(q=>{if(q.id!==id||q.claimed)return;const def=QUEST_POOL.find(d=>d.id===id);q.p=def.max?Math.max(q.p,amt):q.p+amt})}
function chainCur(){return CHAIN[PS().chain]}
function chainDone(){const c=chainCur();if(!c)return false;const[a,b]=c.p();return a>=b}
function extraReady(){if(!S||!S.pets)return false;ensureWeek();return chainDone()||PS().week.list.some(q=>q.p>=q.n&&!q.claimed)}
function rwHtml(r){const a=[];if(r.pet)a.push(r.pet==='random'?T('❔ улюбленець'):petIcon(r.pet)+' '+T(PETS[r.pet].name));if(r.skin)a.push(T('🎀 скін'));if(r.g)a.push(r.g+U('gem'));if(r.food)a.push(Object.keys(r.food).map(k=>r.food[k]+foodIcon(k)).join(' '));return a.join(' · ')}
function giveExtra(r,src){if(r.food)addFood(r.food);if(r.g)S.ge+=r.g;if(r.skin)giveSkin();
  if(r.pet){let id=r.pet;if(id==='random'){const locked=Object.keys(PETS).filter(k=>!PS().own[k]&&!CHAIN.some(c=>c.rw.pet===k));const any=Object.keys(PETS).filter(k=>!PS().own[k]);id=pick(locked.length?locked:any.length?any:Object.keys(PETS))}setTimeout(()=>unlockPet(id,src),300)}}
function questsExtra(){ensureWeek();const P=PS(),c=chainCur();let h=`<h3>${T('📖 Сюжет бабусі')}</h3>`;
  if(c){const[a,b]=c.p(),ok=a>=b;h+=`<div class="q${ok?' done':''}"><div class="qb"><div class="up-n">${P.chain+1}. ${T(c.t)}</div><div class="bar"><i style="width:${Math.min(100,a/b*100)}%"></i></div><small>${Math.min(a,b)}/${b} · ${rwHtml(c.rw)}</small></div>
    <button class="price${ok?' ok':''}" ${ok?'':'disabled'} onclick="claimChain()">${T('Забрати')}</button></div>`}
  else h+=`<small>${T('Усі сюжетні завдання виконано. Далі буде…')}</small>`;
  h+=`<h3 style="margin-top:12px">${T('🗓 Тиждень')}</h3><div class="list">`;
  P.week.list.forEach((q,i)=>{const def=QUEST_POOL.find(d=>d.id===q.id),ok=q.p>=q.n;
    h+=`<div class="q${ok?' done':''}${q.claimed?' claimed':''}"><div class="qb"><div class="up-n">${def.t(q.n)}</div><div class="bar"><i style="width:${Math.min(100,q.p/q.n*100)}%"></i></div><small>${Math.min(q.p,q.n)}/${q.n} · ${rwHtml(q.rw)}</small></div>
    <button class="price${ok&&!q.claimed?' ok':''}" ${ok&&!q.claimed?'':'disabled'} onclick="claimWeek(${i})">${q.claimed?'✓':T('Забрати')}</button></div>`});
  return h+'</div>'}
function claimChain(){if(!chainDone())return;const c=chainCur();PS().chain++;track('quest_done',{kind:'story',n:PS().chain});SFX.chest();closeM();giveExtra(c.rw,'story');if(!c.rw.pet)setTimeout(quests,350)}
function claimWeek(i){const q=PS().week.list[i];if(q.claimed||q.p<q.n)return;q.claimed=true;track('quest_done',{kind:'weekly',id:q.id});SFX.chest();closeM();giveExtra(q.rw,'weekly');if(!q.rw.pet)setTimeout(quests,350)}
