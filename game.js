'use strict';
/* =====================================================================
   Kitsune Merge 1.0 — merge + temple restoration meta
   ===================================================================== */

/* ===== THEMES: палітра + набір предметів + герой ===== */
const THEMES={
  kitsune:{name:'Лисячий храм',c:{bg:'#3a2352',bg2:'#140b20',panel:'#3b2756',cell:'#4a3368',cell2:'#56407a',acc:'#ff9b4a',gold:'#ffd166',txt:'#fff4e6',mut:'#c9b6e4'},
    items:['🍃','🌸','🍡','🏮','🔔','⛩️','🦊','🌕','💎','👑'],hero:'🦊'},
  sakura:{name:'Сакура',c:{bg:'#ffd6e4',bg2:'#f2a7c3',panel:'#fff0f5',cell:'#ffe1ec',cell2:'#ffd0e0',acc:'#ff6f9f',gold:'#e8578a',txt:'#5a2440',mut:'#a26080'},
    items:['🌱','🌿','🌷','🌸','🌺','💐','🎋','🎎','🏯','🗻'],hero:'🐇'},
  ocean:{name:'Глибини',c:{bg:'#0d4a6e',bg2:'#04182b',panel:'#0f3550',cell:'#14425f',cell2:'#184c6c',acc:'#33d1c6',gold:'#7cf3ff',txt:'#e8fbff',mut:'#8fc4d9'},
    items:['💧','🐚','🦐','🐠','🐡','🦀','🐙','🐬','🐋','🔱'],hero:'🐢'},
  forest:{name:'Нічний ліс',c:{bg:'#1f3a2a',bg2:'#08120c',panel:'#203528',cell:'#2a4434',cell2:'#304d3b',acc:'#9be15d',gold:'#e6f56b',txt:'#effbe6',mut:'#a6c9a6'},
    items:['🍄','🌰','🍂','🦋','🦉','🕯️','📜','🔮','🌙','🐉'],hero:'🦉'},
};
const TIER_RING=['#9e9e9e','#8bc34a','#4fc3f7','#7e57c2','#ff9800','#e91e63','#ffd54f','#00e5ff','#ff5252','#ffffff'];
const CHEST=99, GEN=98;

/* ===== BALANCE CONFIG (дзеркало balance.csv) ===== */
const CFG={
  cols:6, rows:7, tiers:10,
  itemValue:t=>Math.round(3*Math.pow(2.3,t-1)),
  mergeXp:t=>t,
  summonCost:1, energyMax:40, energyRegenSec:30,
  xpToLevel:l=>Math.round(20*Math.pow(1.45,l-1)),
  levelGems:3, levelEnergy:15,
  orderMaxTier:l=>Math.min(6,3+Math.floor(l/3)),   /* 1.6: кап 6 у главі 1 — див. docs/DESIGN.md §3 */
  orderSize:l=>l<3?1:(l<6?2:3),
  orderStars:o=>o.need.reduce((s,t)=>s+Math.ceil(t/2),0),   /* зірки за рівнем предмета */
  comboWindowMs:1600, comboCoins:(n,t)=>n>=2?Math.min(n,5)*t:0,
  chestChance:t=>t>=5?0.25:0, chestLoot:[{c:120},{e:12},{g:4},{c:250},{g:8}],
  hintIdleMs:5000,
  pets:PETS_CFG,
  upgrades:{
    luck:{name:'Удача призову',desc:'шанс одразу отримати рів. 2',base:120,mult:1.7,max:8,val:n=>n*0.06},
    cap:{name:'Ліхтар енергії',desc:'+5 до максимуму енергії',base:150,mult:1.8,max:6,val:n=>n*5},
    greed:{name:'Жадібний лис',desc:'+10% монет із замовлень',base:180,mult:1.9,max:10,val:n=>n*0.10},
  },
  boosters:{refill:{name:'Блискавка',gems:8},auto:{name:'Вихор',gems:12},up:{name:'Зірка',gems:5}},
  rewardedAd:{energy:10,dailyCap:5},
  daily:[{c:50},{e:15},{g:3},{c:150},{e:30},{g:6},{g:15,c:300}],
  iap:[{id:'gems_s',g:40,price:'$0.99'},{id:'gems_m',g:220,price:'$4.99'},{id:'starter',g:100,c:1000,e:60,price:'$1.99',once:true}],
  temple:{
    bellCdMin:5,  bellCoins:l=>20+l*6,
    lampCdMin:3,  lampEnergy:4,
    treeCdMin:4,  treeDrops:[1,1,2],
    pondCdMin:2,  pondGemChance:.15, pondCoins:l=>8+l*3,
    offerMinTier:3, blessMult:2, blessMin:t=>t+1,          // tier 4 → 5 хв ×2 монет
    spiritDropSec:18, spiritMaxDrops:3, spiritChestChance:.15, spiritCoins:l=>10+l*4,
    depthMin:.55,            // масштаб на горизонті (y=0) відносно переднього плану (y=100)
    /* площадки на панорамі: x,y — % світу (y = точка на землі), s — розмір на передньому плані (одиниці = висота сцени/600) */
    pos:{bridge:{x:50,y:58,s:120},lanterns:{x:15,y:72,s:84,lamps:[[10,66],[20,66],[9,80],[21,80]]},torii:{x:86,y:33,s:150},
      tree:{x:20,y:34,s:200},spring:{x:31,y:64,s:130},bell:{x:66,y:80,s:120},altar:{x:73,y:48,s:110},shrine:{x:53,y:18,s:190}},

  },
  meadow:{comfortFr:.05, foxSpeed:9,                  // % світу за секунду
    ai:{idle:[2,4],sit:[3,7],sleep:[7,14],walkW:4,idleW:2,sitW:2,sleepW:1},
    decor:[{id:'m_cushion',ic:'🛏️',name:'Подушка',co:200,comfort:2,x:24,y:80},{id:'m_lantern',ic:'🏮',name:'Ліхтарик',co:350,comfort:2,x:62,y:62},
      {id:'m_berry',ic:'🍓',name:'Ягідний кущ',co:500,comfort:3,x:84,y:74},{id:'m_burrow',ic:'🕳️',name:'Норка',co:800,comfort:4,x:40,y:66}]},
  pond:{bubbleMin:3, maxBubbles:3, pearlChance:.12, foodChance:.35, koiSpeed:14, turnRate:3,
    decor:[{id:'p_lotus',ic:'🌸',name:'Лотоси',co:300,fx:'+10% монет із бульбашок',x:22,y:30},{id:'p_reeds',ic:'🌾',name:'Очерет',co:250,fx:'+5% шанс перлини',x:84,y:22},
      {id:'p_lantern',ic:'🏮',name:'Камʼяний ліхтар',co:500,fx:'бульбашки на 20% частіше',x:80,y:78},{id:'p_bridge',ic:'🌉',name:'Місточок',co:800,fx:'+1 бульбашка в запасі',x:30,y:84}]},
};
/* відбудова храму: зірки ⭐ із замовлень + монети */
const TEMPLE=[
  {id:'bridge',ic:'🌉',name:'Місток через струмок',st:6,co:60,g:3,x:55,y:87,s:44,
    text:'Місток знову тримає кроки. Колись по ньому до храму йшли паломники з усього лісу… можливо, підуть і знову.'},
  {id:'lanterns',ic:'🏮',name:'Камʼяні ліхтарі',st:14,co:190,g:4,x:36,y:52,s:30,
    text:'Дивись, ліхтарі вздовж стежки ожили! Торкнись їх увечері — вони засяють для тебе.'},
  {id:'torii',ic:'⛩️',name:'Брама торії',st:24,co:420,g:5,x:33,y:62,s:62,
    text:'Брама — межа між світом людей і світом духів. Поки вона ціла, тінь не увійде без запрошення.'},
  {id:'tree',ic:'🌳',name:'Священне дерево',st:36,co:720,g:6,x:16,y:36,s:70,
    text:'Цьому дереву тисяча років. Потруси його гілки — воно любить ділитися дарами.'},
  {id:'spring',ic:'⛲',name:'Джерело з коропами',st:50,co:1100,g:8,x:58,y:70,s:54,
    text:'Вода знову співає, а в ставку грають коропи. Погодуй їх — вони бувають вдячні.'},
  {id:'bell',ic:'🔔',name:'Великий дзвін',st:66,co:1600,g:10,x:80,y:53,s:46,
    text:'Дзвін! Його голос чути за три долини. Дзвони час від часу — ліс приносить дари на його поклик.'},
  {id:'altar',ic:'🔥',name:'Вівтар вогню',st:84,co:2400,g:12,x:56,y:44,s:44,
    text:'Вогонь на вівтарі — серце храму. Принось йому дари з поля, і він благословить твою працю.'},
  {id:'shrine',ic:'🏯',name:'Святилище',st:105,co:3500,g:20,x:80,y:28,s:76,
    text:'Ти зробив це, маленький лисе. Храм знову сяє. Але подивись на обрій… тінь стоїть біля лісу. Наша історія тільки починається.'},
];
const TSHORT={bridge:'Місток',torii:'Брама',tree:'Дерево',spring:'Джерело',bell:'Дзвін',altar:'Вівтар',shrine:'Святилище'};   // підписи-стрічки в храмі
const QUEST_POOL=[
  {id:'merge',t:n=>T('Злий предмети {n} разів',{n}),n:l=>15+l*3},
  {id:'order',t:n=>T('Виконай {n} замовлень',{n}),n:l=>3+Math.floor(l/2)},
  {id:'summon',t:n=>T('Признач {n} дарів',{n}),n:l=>25+l*4},
  {id:'tier',t:n=>T('Створи предмет {n}-го рівня',{n}),n:l=>Math.min(8,4+Math.floor(l/3)),max:true},
  {id:'chest',t:n=>T('Відкрий {n} скрині',{n}),n:()=>2},
  {id:'temple',t:n=>T('Доторкнись до дивин храму {n} рази',{n}),n:()=>3,needTemple:true},
  {id:'coins',t:n=>T('Зароби {n} монет',{n}),n:l=>150+l*50},
];

/* ===== STORY ===== */
const NARR={name:'Бабуся Хоші',por:'🦊'};
const TUTORIAL=[
  {id:'tut_01',text:'Нарешті ти прийшов, маленький лисе. Сто років вогні цього храму горіли… а минулої ночі згасли всі до одного.'},
  {id:'tut_02',text:'Без них ліс забуде дорогу додому. Допоможи мені — запали їх знову. Почнемо з малого.'},
  {id:'tut_03',text:'Торкнись кнопки призову. Кожен поклик коштує крихту енергії.',wait:'summon',count:2,focus:'#summon'},
  {id:'tut_04',text:'Два однакові дари — це сила. Перетягни один на інший, і вони зіллються в щось краще.',wait:'merge',focus:'#board'},
  {id:'tut_05',text:'Чудово! Бачиш, хтось чекає на дар нагорі? Коли замовлення світиться — торкнись його.',wait:'order',focus:'#orders'},
  {id:'tut_06',text:'Монети — це вдячність лісу. Витрачай їх у магазині, щоб твої поклики ставали сильнішими.',focus:'#bShop'},
  {id:'tut_07',text:'Решту ти відкриєш сам. Я буду поруч… і розповім більше, коли храм засяє яскравіше.'},
];
const CHAPTERS={
  3:{id:'ch_03',text:'Перший ліхтар знову горить. Я чую, як ліс зітхнув з полегшенням… Але хтось погасив їх навмисно.'},
  5:{id:'ch_05',text:'Ти став сильнішим. Тепер можу сказати: вогні вкрала тінь, що колись була одним із нас — лисом без імені.'},
  8:{id:'ch_08',text:'Брама торії знову відчинена. Тінь відчула це. Будь уважним, маленький лисе — вона йде сюди.'},
  10:{id:'ch_10',text:'Девʼять хвостів… Ти виріс швидше, ніж я мріяла. Коли тінь прийде — ти будеш готовий. Далі буде.'},
};
const TEMPLE_INTRO={id:'',text:'Зірки з замовлень — це надія лісу. Збирай їх, і ми разом відбудуємо храм. Загляни туди, коли захочеш — я чекатиму.'};

/* ===== STATE ===== */
const KEY='kitsune_merge_v3', OLDKEY='kitsune_merge_v2';
const now=()=>Date.now(), today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dayShift=k=>{const d=new Date();d.setDate(d.getDate()+k);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function fresh(){const b=Array(CFG.cols*CFG.rows).fill(0);b[0]=GEN;
  return{v:3,board:b,en:CFG.energyMax,enAt:now(),co:0,ge:10,stars:0,lv:1,xp:0,
  up:{luck:0,cap:0,greed:0},orders:[],daily:{last:null,streak:0},ads:{day:today(),n:0},starter:false,
  set:{theme:'kitsune',sound:true,voice:true,vib:true},tut:0,chapters:[],
  pets:{own:{},active:[],pond:[],food:{rice:3,onigiri:1},chain:0,feeds:0,offers:0,week:null},
  temple:0,tcd:{},bless:{until:0,mult:1},quests:null,flags:{},meadow:{decor:{}},pondS:{last:0,decor:{}},
  stats:{first:today(),days:[today()],sessions:0,playMs:0,merges:0,orders:0,summons:0,adViews:0,iap:0,chests:0,maxCombo:0,taps:0,events:[]}}}
function load(){let s=null;
  try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!s){try{const o=JSON.parse(localStorage.getItem(OLDKEY));if(o){s=Object.assign(fresh(),o,{v:3});s.stats=Object.assign(fresh().stats,o.stats||{});track0(s,'migrated_v2')}}catch(e){}}
  if(!s)s=fresh();
  const f=fresh();for(const k in f)if(s[k]===undefined)s[k]=f[k];for(const k in f.stats)if(s.stats[k]===undefined)s.stats[k]=f.stats[k];
  for(const k in f.set)if(s.set[k]===undefined)s.set[k]=f.set[k];
  if(!s.board.includes(GEN)){const e=s.board.indexOf(0);if(e>=0)s.board[e]=GEN;else s.board[0]=GEN}
  return s}
function track0(s,name,data){s.stats.events.push({t:now(),name,...(data||{})});if(s.stats.events.length>200)s.stats.events.splice(0,s.stats.events.length-200)}
let S=load();
i18nInit(S.set.lang);   // S.set.lang може бути порожнім у старих збереженнях — тоді мова з navigator.language
let saveT=0;const save=()=>{if(window.__reset)return;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function track(name,data){track0(S,name,data)}
S.stats.sessions++; if(!S.stats.days.includes(today()))S.stats.days.push(today()); track('session_start',{});
let sessionStart=now();

/* ===== HELPERS ===== */
const $=id=>document.getElementById(id);
const TH=()=>THEMES[S.set.theme]||THEMES.kitsune;
const ART={},UIOK={},BGOK={},HOSHI={};
const UI={coin:'💰',gem:'💎',energy:'⚡',chest:'🎁',star:'⭐'};
const U=k=>UIOK[k]?`<img class="ui" src="art/ui/${k}.svg" alt="">`:UI[k];
function probe(src){return new Promise(r=>{const im=new Image();im.onload=()=>r(true);im.onerror=()=>r(false);im.src=src})}
/* перший наявний файл (растр Pollinations пріоритетніше за SVG) -> URL або null */
function probeAny(b,exts){return exts.reduce((p,e)=>p.then(u=>u||probe(b+e).then(ok=>ok?b+e:null)),Promise.resolve(null))}
const SCENE={};
function loadArt(th){if(ART[th])return Promise.resolve();ART[th]={};
  const ps=[];for(let t=1;t<=10;t++)ps.push(probeAny(`art/${th}/${t}`,['.png','.svg']).then(u=>{if(u)ART[th][t]=u}));
  ps.push(probeAny(`art/bg/${th}`,['.webp','.svg']).then(u=>{BGOK[th]=u}));
  return Promise.all(ps).then(()=>{if(th===S.set.theme){applyBg();render()}})}
function loadCommon(){const ps=[...petsPreload()];for(const k in UI)ps.push(probe(`art/ui/${k}.svg`).then(ok=>{UIOK[k]=ok}));
  ps.push(probeAny('art/hoshi',['.png','.svg']).then(u=>HOSHI.base=u));ps.push(probeAny('art/ui/generator',['.png','.svg']).then(u=>GENOK=u));
  TEMPLE.forEach(b=>ps.push(Promise.all([probeAny(`art/temple/${b.id}`,['.png','.svg']),probeAny(`art/temple/${b.id}_ruin`,['.png','.svg'])]).then(([x,y])=>{TART[b.id]=x&&y?{on:x,ruin:y}:null})));
  ps.push(probeAny('art/hoshi_talk',['.png','.svg']).then(u=>HOSHI.talk=u));
  ps.push(probe('art/scene/temple_wide.webp').then(ok=>{if(ok){SCENE.wide='art/scene/temple_wide.webp';SCENE.ar=1.5}}));
  ps.push(probe('art/scene/fox_meadow.webp').then(ok=>{if(ok)SCENE.meadow='art/scene/fox_meadow.webp'}));ps.push(probe('art/scene/koi_pond.webp').then(ok=>{if(ok)SCENE.pond='art/scene/koi_pond.webp'}));
  ps.push(...decorPreload());
  ps.push(probe('art/scene/temple_bg.webp').then(ok=>{if(ok)SCENE.day='art/scene/temple_bg.webp'}));ps.push(probe('art/scene/temple_bg_night.webp').then(ok=>{if(ok)SCENE.night='art/scene/temple_bg_night.webp'}));
  ps.push(probe('art/logo.png').then(ok=>{const im=ok&&document.querySelector('#splash .logo img');if(im)im.src='art/logo.png'}));return ps}
let GENOK=false;const TART={};
const tImg=(b,on)=>TART[b.id]?`<img class="tart" src="${on?TART[b.id].on:TART[b.id].ruin}" alt="" style="width:${Math.round(b.s*1.7)}px">`:b.ic;
const icon=t=>t===CHEST?U('chest'):t===GEN?(GENOK?`<img class="art" src="${GENOK}" draggable="false" alt="">`:TH().hero):(ART[S.set.theme]&&ART[S.set.theme][t]?`<img class="art" src="${ART[S.set.theme][t]}" draggable="false" alt="">`:TH().items[t-1]);
const enMax=()=>CFG.energyMax+CFG.upgrades.cap.val(S.up.cap)+PB('fox_sleepy')*CFG.pets.fx.fox_sleepy+(window.MON_CAP?MON_CAP():0);
const blessOn=()=>S.bless&&S.bless.until>now();
function applyBg(){const th=S.set.theme;document.body.classList.toggle('hasbg',!!BGOK[th]);if(BGOK[th])document.body.style.setProperty('--bgimg',`url("${BGOK[th]}")`)}
function applyTheme(){loadArt(S.set.theme);const c=TH().c;for(const k in c)document.documentElement.style.setProperty('--'+k,c[k]);
  document.querySelector('meta[name=theme-color]').content=c.bg2;$('heroIc').textContent=TH().hero;NARR.por=TH().hero;applyBg()}
function toast(t){const e=$('toast');e.innerHTML=t;e.style.opacity=1;clearTimeout(e._t);e._t=setTimeout(()=>e.style.opacity=0,1600)}
function floatTxt(x,y,t){const f=document.createElement('div');f.className='float';f.innerHTML=t;f.style.left=(x-20)+'px';f.style.top=(y-10)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),800)}
function cellEl(i){return document.querySelector(`.c[data-i="${i}"]`)}
function cellCenter(i){const e=cellEl(i);if(!e)return[innerWidth/2,innerHeight/2];const r=e.getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]}
function burst(x,y,col,n=14,dist=50){for(let k=0;k<n;k++){const p=document.createElement('div');p.className='pt';p.style.background=col;p.style.left=x+'px';p.style.top=y+'px';document.body.appendChild(p);
  const a=Math.random()*6.28,d=dist*.6+Math.random()*dist;p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(0)`,opacity:0}],{duration:500+Math.random()*300,easing:'cubic-bezier(.2,.8,.3,1)'}).onfinish=()=>p.remove()}}
function flyTo(x,y,html,target,n=5){const te=$(target);if(!te)return;const r=te.getBoundingClientRect();for(let k=0;k<n;k++){const f=document.createElement('div');f.className='fly';f.innerHTML=html;f.style.left=x+'px';f.style.top=y+'px';document.body.appendChild(f);
  setTimeout(()=>{f.style.left=(r.x+r.width/2)+'px';f.style.top=(r.y+4)+'px';f.style.opacity=.3},30+k*60);setTimeout(()=>{f.remove();te.classList.remove('bump');void te.offsetWidth;te.classList.add('bump')},700+k*60)}}
function shake(){const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake')}
function vib(ms){try{if(S.set.vib&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ===== SOUND (процедурний, WebAudio) ===== */
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,dur=.12,type='sine',vol=.18,delay=0,glide=1.5){if(!S.set.sound)return;const a=ac();if(!a)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*glide,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(a.destination);o.start(t);o.stop(t+dur+.02)}
const SFX={summon:()=>tone(520,.08,'triangle',.12),merge:t=>{tone(300+t*70,.15,'sine');tone(450+t*90,.18,'triangle',.1,.05)},
  coin:()=>{tone(980,.06,'square',.06);tone(1320,.08,'square',.05,.06)},level:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.2,'triangle',.15,i*.1)),
  chest:()=>[392,523,659,784,1046].forEach((f,i)=>tone(f,.15,'sine',.14,i*.06)),err:()=>tone(160,.15,'sawtooth',.08),
  build:()=>{[262,330,392,523,659,784].forEach((f,i)=>tone(f,.28,'triangle',.14,i*.09,1.02));tone(80,.6,'sine',.25,0,.5)},
  bell:()=>{[0,0.02].forEach(d=>{tone(392,2.2,'sine',.22,d,.995);tone(784*1.01,1.6,'sine',.08,d,.99);tone(1176,1.1,'sine',.05,d,.99)})},
  lamp:i=>tone(660+i*110,.18,'sine',.1,0,1.2),
  splash:()=>{tone(900,.12,'sine',.08,0,.4);tone(600,.2,'sine',.06,.05,.5)},
  rustle:()=>{for(let i=0;i<6;i++)tone(2000+Math.random()*1500,.05,'sawtooth',.02,i*.04,.7)},
  fire:()=>{tone(120,.8,'sawtooth',.06,0,2);[523,784,1046].forEach((f,i)=>tone(f,.4,'sine',.08,.2+i*.12))},
  pop:()=>tone(700,.07,'sine',.1,0,1.8)};

/* ===== VOICE ===== */
let voice=null;function playVoice(id){if(voice){voice.pause();voice=null}if(!S.set.voice||!id||lang()!=='uk')return;/*озвучка лише українською*/voice=new Audio('voice/'+id+'.mp3');voice.play().catch(()=>{})}

/* ===== ECONOMY ===== */
function regen(){const per=CFG.energyRegenSec*1000*(tod()==='night'?Math.max(.4,1-CFG.pets.fx.koi_moon*PB('koi_moon')):1);if(S.en>=enMax()){S.enAt=now();return}
  const k=Math.floor((now()-S.enAt)/per);if(k>0){S.en=Math.min(enMax(),S.en+k);S.enAt+=k*per}}
function addCo(n){S.co+=n;Q('coins',n)}
function addXp(n){n=Math.round(n*(1+CFG.pets.fx.koi_sage*PB('koi_sage')));S.xp+=n;while(S.xp>=CFG.xpToLevel(S.lv)){S.xp-=CFG.xpToLevel(S.lv);S.lv++;S.ge+=CFG.levelGems;S.en+=CFG.levelEnergy;track('level_up',{lv:S.lv});SFX.level();vib([30,40,30]);
  toast(T('Рівень {n}!',{n:S.lv})+` +${CFG.levelGems}${U('gem')} +${CFG.levelEnergy}${U('energy')}`);if(CHAPTERS[S.lv]&&!S.chapters.includes(S.lv)){S.chapters.push(S.lv);setTimeout(()=>story([CHAPTERS[S.lv]]),900)}}}

/* ===== QUESTS ===== */
function ensureQuests(){if(S.quests&&S.quests.day===today())return;
  const pool=QUEST_POOL.filter(q=>!q.needTemple||S.temple>=2).slice().sort(()=>Math.random()-.5).slice(0,3);
  const rw=[{g:3},{c:80+S.lv*20},{e:15}];
  S.quests={day:today(),bonus:false,list:pool.map((q,i)=>({id:q.id,n:q.n(S.lv),p:0,rw:rw[i],claimed:false}))}}
function Q(id,amt=1){weeklyQ(id,amt);if(!S.quests||S.quests.day!==today())return;S.quests.list.forEach(q=>{if(q.id!==id||q.claimed)return;const was=q.p>=q.n;
  const def=QUEST_POOL.find(d=>d.id===id);q.p=def.max?Math.max(q.p,amt):q.p+amt;if(!was&&q.p>=q.n){toast(T('📜 Завдання виконано!'));SFX.pop()}})}
const questReady=()=>extraReady()||S.quests&&S.quests.day===today()&&(S.quests.list.some(q=>q.p>=q.n&&!q.claimed)||(!S.quests.bonus&&S.quests.list.every(q=>q.claimed)));
function rwTxt(r){return [r.c?r.c+U('coin'):'',r.e?r.e+U('energy'):'',r.g?r.g+U('gem'):''].filter(Boolean).join(' ')}
function giveRw(r){if(r.c)addCo(r.c);S.en+=r.e||0;S.ge+=r.g||0}
function quests(){ensureQuests();let h=hdr('📜',T('Завдання'),T('Сюжет · тиждень · день'))+questsExtra()+`<h3 style="margin-top:12px">${T('Сьогодні')}</h3><div class="list">`;
  S.quests.list.forEach((q,i)=>{const def=QUEST_POOL.find(d=>d.id===q.id),done=q.p>=q.n;
    h+=`<div class="q${done?' done':''}${q.claimed?' claimed':''}"><div class="qb"><div class="up-n">${def.t(q.n)}</div><div class="bar"><i style="width:${Math.min(100,q.p/q.n*100)}%"></i></div><small>${Math.min(q.p,q.n)}/${q.n} · ${rwTxt(q.rw)}</small></div>
    <button class="price${done&&!q.claimed?' ok':''}" ${done&&!q.claimed?'':'disabled'} onclick="claimQ(${i})">${q.claimed?'✓':T('Забрати')}</button></div>`});
  const all=S.quests.list.every(q=>q.claimed);
  h+=`</div><div class="starter" style="margin-top:10px;cursor:default"><div class="big">${U('chest')}</div><div style="flex:1"><div class="up-n">${T('Усі три — скриня')}</div><small>${rwTxt({g:5,c:150})}</small></div>
    <button class="price${all&&!S.quests.bonus?' ok':''}" ${all&&!S.quests.bonus?'':'disabled'} onclick="claimBonus()">${S.quests.bonus?'✓':T('Забрати')}</button></div>`;
  modal(h)}
function claimQ(i){const q=S.quests.list[i];if(q.claimed||q.p<q.n)return;q.claimed=true;giveRw(q.rw);SFX.chest();track('quest_done',{id:q.id});quests()}
function claimBonus(){if(S.quests.bonus)return;S.quests.bonus=true;giveRw({g:5,c:150});SFX.chest();track('quest_bonus',{});quests()}

/* ===== ORDERS ===== */
function newOrder(){const n=CFG.orderSize(S.lv),mx=CFG.orderMaxTier(S.lv),need=[];
  for(let i=0;i<n;i++)need.push(Math.max(2,Math.ceil(Math.random()**0.8*mx)));
  need.sort((a,b)=>b-a);return{need,coins:need.reduce((s,t)=>s+CFG.itemValue(t),0),xp:need.reduce((s,t)=>s+t*2,0)}}
while(S.orders.length<3)S.orders.push(newOrder());
function canFill(o){const cnt={};S.board.forEach(t=>t&&t<=CFG.tiers&&(cnt[t]=(cnt[t]||0)+1));return o.need.every(t=>(cnt[t]=(cnt[t]||0)-1)>=0)}
function fill(i,ev){const o=S.orders[i];if(!canFill(o)){SFX.err();toast(T('Немає потрібних предметів'));return}
  o.need.forEach(t=>{const j=S.board.indexOf(t);const[x,y]=cellCenter(j);burst(x,y,TIER_RING[t-1],8);S.board[j]=0});
  const mult=(1+CFG.upgrades.greed.val(S.up.greed)+CFG.pets.fx.koi_gold*PB('koi_gold'))*(blessOn()?S.bless.mult:1);
  const coins=Math.round(o.coins*mult);let stars=CFG.orderStars(o);if(Math.random()<CFG.pets.fx.fox_star*PB('fox_star'))stars++;petsOnOrder(ev);addCo(coins);S.stars+=stars;addXp(o.xp);S.stats.orders++;
  track('order_done',{coins,stars,need:o.need.join(',')});if(S.stats.orders===1)track('first_order',{});Q('order');
  floatTxt(ev.clientX,ev.clientY,`+${coins}${U('coin')} +${stars}⭐`);flyTo(ev.clientX,ev.clientY,U('coin'),'rCo');flyTo(ev.clientX,ev.clientY,'⭐','chipTemple',stars);SFX.coin();vib(20);
  S.orders[i]=newOrder();render();tutEvent('order');
  if(!S.flags.templeIntro&&S.tut>=TUTORIAL.length&&S.stars>=TEMPLE[0].st){S.flags.templeIntro=1;setTimeout(()=>story([TEMPLE_INTRO]),700)}}

/* ===== BOARD ===== */
function genIdx(){return S.board.indexOf(GEN)}
function nearestEmpty(from,rowsLimit){const C=CFG.cols;let best=-1,bd=1e9;
  S.board.forEach((t,i)=>{if(t)return;if(rowsLimit&&i>=C*rowsLimit)return;const d=Math.hypot(i%C-from%C,Math.floor(i/C)-Math.floor(from/C))+Math.random()*.3;if(d<bd){bd=d;best=i}});return best}
function summon(fromGen){regen();
  const gi=genIdx();if(fromGen&&gi>=0){const g=cellEl(gi);if(g){g.classList.remove('tap');void g.offsetWidth;g.classList.add('tap')}}
  const b=$('summon');b.classList.remove('tap');void b.offsetWidth;b.classList.add('tap');
  if(S.en<CFG.summonCost){SFX.err();offerEnergy();return}
  const tut=S.tut<TUTORIAL.length;let i=nearestEmpty(gi>=0?gi:0,tut?3:0);if(i<0&&tut)i=nearestEmpty(gi>=0?gi:0);
  if(i<0){SFX.err();toast(T('Поле заповнене — зливай!'));return}
  S.en-=CFG.summonCost;if(S.en+1>=enMax())S.enAt=now();
  const t=tut?1:(Math.random()<CFG.upgrades.luck.val(S.up.luck)+CFG.pets.fx.koi_dragon*PB('koi_dragon')?2:1);S.board[i]=t;
  S.stats.summons++;Q('summon');SFX.summon();vib(8);
  const[sx,sy]=gi>=0?cellCenter(gi):(()=>{const r=b.getBoundingClientRect();return[r.x+r.width/2,r.y]})();
  render(i,'arrive');const[tx,ty]=cellCenter(i);
  const f=document.createElement('div');f.className='flyitem';f.innerHTML=icon(t);document.body.appendChild(f);
  f.animate([{left:sx+'px',top:sy+'px',transform:'translate(-50%,-50%) scale(.4)'},{left:(sx+tx)/2+'px',top:Math.min(sy,ty)-40+'px',transform:'translate(-50%,-50%) scale(1.1)',offset:.5},{left:tx+'px',top:ty+'px',transform:'translate(-50%,-50%) scale(.9)'}],{duration:260,easing:'ease-out'}).onfinish=()=>f.remove();
  tutEvent('summon')}

let combo=0,lastMerge=0;
function merge(a,b){const t=S.board[a];if(a===b||!t||t>CFG.tiers||t!==S.board[b]||t>=CFG.tiers)return false;
  S.board[a]=0;S.board[b]=t+1;addXp(CFG.mergeXp(t+1));S.stats.merges++;track('merge',{tier:t+1});Q('merge');Q('tier',t+1);
  combo=now()-lastMerge<CFG.comboWindowMs?combo+1:1;lastMerge=now();S.stats.maxCombo=Math.max(S.stats.maxCombo,combo);
  render(b);const[x,y]=cellCenter(b);burst(x,y,TIER_RING[t],10+t*2);SFX.merge(t);vib(t>=5?40:12);if(t+1>=6)shake();
  let cb=CFG.comboCoins(combo,t+1);if(cb){if(blessOn())cb*=S.bless.mult;cb=Math.round(cb*(1+CFG.pets.fx.fox_nine*PB('fox_nine')));addCo(cb);const c=$('combo');c.innerHTML=T('Комбо ×{n}',{n:combo})+`  +${cb}${U('coin')}`;c.classList.remove('on');void c.offsetWidth;c.classList.add('on')}
  if(Math.random()<CFG.chestChance(t+1)+(t+1>=5?CFG.pets.fx.fox_luck*PB('fox_luck'):0)){const e=S.board.map((v,i)=>v?-1:i).filter(i=>i>=0);if(e.length){const ci=pick(e);S.board[ci]=CHEST;render(ci);toast(T('Випала скриня! Торкнись її'))}}
  tutEvent('merge');return true}
function move(a,b){if(S.board[b]||!S.board[a])return false;S.board[b]=S.board[a];S.board[a]=0;render(b);return true}
function chestLoot(){return pick(CFG.chestLoot)}
function openChest(i){const l=chestLoot();S.board[i]=0;if(l.c)addCo(l.c);S.en+=l.e||0;S.ge+=l.g||0;S.stats.chests++;Q('chest');track('chest',l);petsOnChest();
  const[x,y]=cellCenter(i);burst(x,y,'#ffd166',24);SFX.chest();vib([20,30,20]);shake();
  floatTxt(x,y,'+'+rwTxt(l));flyTo(x,y,l.c?U('coin'):l.e?U('energy'):U('gem'),l.c?'rCo':l.e?'rEn':'rGe',4);render()}

/* ===== INPUT ===== */
let sel=-1,drag=null,lastInput=now();const ghost=$('ghost');
function cellAt(x,y){const e=document.elementFromPoint(x,y);const c=e&&e.closest('.c');return c?+c.dataset.i:-1}
function clearHint(){document.querySelectorAll('.hint2').forEach(e=>e.classList.remove('hint2'));hinted=false}
addEventListener('pointerdown',()=>{lastInput=now();clearHint();ac()},true);
$('board').addEventListener('pointerdown',e=>{const c=e.target.closest('.c');if(!c)return;drag={i:+c.dataset.i,x:e.clientX,y:e.clientY,moved:false}});
addEventListener('pointermove',e=>{if(!drag||!S.board[drag.i]||S.board[drag.i]===CHEST)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;ghost.innerHTML=icon(S.board[drag.i]);ghost.style.display='flex';if(S.board[drag.i]!==GEN)hint(drag.i)}
  if(drag.moved){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}});
addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;ghost.style.display='none';
  if(d.moved){const j=cellAt(e.clientX,e.clientY);if(j>=0)merge(d.i,j)||move(d.i,j);sel=-1;render();return}
  const i=d.i;if(S.board[i]===CHEST){openChest(i);sel=-1;return}
  if(S.board[i]===GEN&&(sel<0||sel===i)){sel=-1;summon(true);return}
  if(sel<0){if(S.board[i]){sel=i;SFX.pop();render()}return}
  if(sel===i)sel=-1;else if(merge(sel,i)||move(sel,i))sel=-1;else sel=S.board[i]?i:-1;render()});
addEventListener('pointercancel',()=>{drag=null;ghost.style.display='none'});
function hint(i){document.querySelectorAll('.c').forEach((c,j)=>c.classList.toggle('hint',j!==i&&S.board[j]===S.board[i]))}
/* м'які підказки після навчання */
let hinted=false;
setInterval(()=>{if(hinted||S.tut<TUTORIAL.length||$('m').classList.contains('on')||$('tut').classList.contains('on')||templeOpen||!$('splash').classList.contains('out'))return;
  if(now()-lastInput<CFG.hintIdleMs)return;
  const pos={};for(let i=0;i<S.board.length;i++){const t=S.board[i];if(!t||t>=CFG.tiers)continue;if(pos[t]!==undefined){cellEl(pos[t]).classList.add('hint2');cellEl(i).classList.add('hint2');hinted=true;track('hint_shown',{tier:t});return}pos[t]=i}
  const ready=S.orders.findIndex(canFill);if(ready>=0){document.querySelectorAll('.order')[ready].classList.add('hint2');hinted=true;return}
  const g=genIdx();if(g>=0&&S.en>=CFG.summonCost){cellEl(g).classList.add('hint2');hinted=true}},1000);

/* ===== RENDER ===== */
function fitBoard(){const w=$('boardWrap');if(!w)return;const s=Math.min(w.clientWidth,(w.clientHeight)*6/7);$('board').style.width=s+'px';
  document.documentElement.style.setProperty('--cs',((s-10)/6)+'px')}
addEventListener('resize',()=>{fitBoard();if(templeOpen)renderTemple();if(typeof meadowOpen!=='undefined'&&meadowOpen)renderMeadow();if(typeof pondOpen!=='undefined'&&pondOpen)renderPond()});
function render(popIdx,popCls='pop'){regen();
  {const av=document.querySelector('.ava-img span');if(av&&HOSHI.base&&!av.dataset.src){av.dataset.src=HOSHI.base;av.innerHTML=`<img src="${HOSHI.base}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%;border-radius:50%">`}}
  $('en').textContent=S.en+'/'+enMax();$('co').textContent=S.co;$('ge').textContent=S.ge;$('lv').textContent=S.lv;
  const need=CFG.xpToLevel(S.lv);$('xp').style.width=(S.xp/need*100)+'%';$('xptxt').textContent=S.xp+'/'+need;
  $('icEn').innerHTML=U('energy');$('icCo').innerHTML=U('coin');$('icGe').innerHTML=U('gem');
  const nb=TEMPLE[S.temple];$('chipTemple').innerHTML=`⛩️ ${S.temple}/${TEMPLE.length} · ⭐${S.stars}`;
  $('chipTemple').classList.toggle('ready',!!nb&&S.stars>=nb.st&&S.co>=nb.co);
  $('chipBless').style.display=blessOn()?'flex':'none';
  $('dotQ').classList.toggle('on',!!questReady());$('dotD').classList.toggle('on',S.daily.last!==today());
  const gi=genIdx();
  $('board').innerHTML=S.board.map((t,i)=>{let cls='c';if(i===sel)cls+=' sel';if(i===popIdx)cls+=' '+popCls;if(t===CHEST)cls+=' chest';if(t===GEN)cls+=' gen';
    const ring=t===CHEST?'#ffd166':t===GEN?'transparent':TIER_RING[t-1];
    return `<div class="${cls}" data-i="${i}">${t?`<div class="it" style="--ring:${ring}">${icon(t)}</div>${t===GEN?`<i class="e">${S.en}</i>`:t===CHEST?'':'<b>'+t+'</b>'}`:''}</div>`}).join('');
  $('orders').innerHTML=S.orders.map((o,i)=>`<div class="order${canFill(o)?' ready':''}" data-o="${i}"><div class="need">${o.need.map(icon).join('')}</div><div class="rw">${o.coins}${U('coin')} ⭐${CFG.orderStars(o)}</div></div>`).join('');
  if(sel>=0)hint(sel);hinted=false;clearTimeout(saveT);saveT=setTimeout(save,200)}
$('orders').addEventListener('click',e=>{const o=e.target.closest('.order');if(o)fill(+o.dataset.o,e)});
setInterval(()=>{regen();const left=S.en<enMax()?Math.ceil((CFG.energyRegenSec*1000-(now()-S.enAt))/1000):0;
  $('en').textContent=S.en+'/'+enMax();$('entimer').textContent=left?` ${left}s`:'';
  const ge=document.querySelector('.gen i.e');if(ge)ge.textContent=S.en;
  if(blessOn()){$('chipBless').style.display='flex';$('blessT').textContent=mmss(S.bless.until-now())}else $('chipBless').style.display='none';
  petsTick();if(templeOpen)tickTemple();if(typeof scenesTick==='function')scenesTick()},1000);

/* ===== TUTORIAL / STORY ===== */
let tq=[],tcur=null,tcount=0,typer=null,talkT=null;
function story(lines,onDone){tq=lines.slice();tq.done=onDone;nextLine()}
function setTalk(on){const por=$('tPor');clearInterval(talkT);por.classList.toggle('talk',on&&!HOSHI.base);
  if(HOSHI.base){const im=por.querySelector('img');if(!im)return;im.src=HOSHI.base;
    if(on&&HOSHI.talk&&HOSHI.talk.slice(-4)===HOSHI.base.slice(-4)){let f=0;talkT=setInterval(()=>{f^=1;im.src=f?HOSHI.talk:HOSHI.base},166)}}}
function nextLine(){document.querySelectorAll('.focus').forEach(e=>e.classList.remove('focus'));clearInterval(typer);
  tcur=tq.shift();document.body.classList.toggle('tutoring',!!tcur&&TUTORIAL.includes(tcur));
  if(!tcur){$('tut').classList.remove('on');setTalk(false);if(tq.done)tq.done();return}
  const wasOn=$('tut').classList.contains('on');$('tut').classList.add('on');
  if(!wasOn)$('tPor').innerHTML=HOSHI.base?`<img src="${HOSHI.base}" alt="">`:NARR.por;$('tNm').textContent=T(NARR.name);
  const ti=TUTORIAL.indexOf(tcur);if(ti>=0)track('tutorial_step_'+(ti+1),{});
  setTalk(true);
  let k=0;const tx=$('tTx');tx.textContent='';typer=setInterval(()=>{tx.textContent=T(tcur.text).slice(0,++k);if(k>=T(tcur.text).length){clearInterval(typer);typer=null;if(!voice)setTalk(false)}},22);
  playVoice(tcur.id);if(voice)voice.onended=()=>setTalk(false);
  tcount=0;const f=tcur.focus&&document.querySelector(tcur.focus);if(f)f.classList.add('focus');
  const low=f&&f.closest('.nav');$('tut').style.bottom=low?(innerHeight-f.getBoundingClientRect().top+6)+'px':'0px';
  $('tNext').style.display=tcur.wait?'none':'inline-block'}
$('tNext').onclick=()=>{if(typer){clearInterval(typer);typer=null;$('tTx').textContent=T(tcur.text);if(!voice)setTalk(false);return}
  if(tcur&&TUTORIAL.includes(tcur))S.tut=TUTORIAL.indexOf(tcur)+1;nextLine()};
function tutEvent(ev){if(!tcur||tcur.wait!==ev)return;if(++tcount<(tcur.count||1))return;S.tut=TUTORIAL.indexOf(tcur)+1;
  if(ev==='summon'&&S.board.filter(t=>t===1).length<2){tcount--;return}nextLine()}
function startTutorial(){S.tut=0;if(!S.orders.some(o=>o.need.length===1&&o.need[0]===2))S.orders[0]={need:[2],coins:CFG.itemValue(2),xp:4};render();
  track('tutorial_start',{});story(TUTORIAL,()=>{S.tut=TUTORIAL.length;track('tutorial_done',{});save();afterStart()})}
/* навчання фіч: один раз при першому відкритті */
const TEACH={
  openTemple:[{text:'Це наш храм. Кожна будівля просить зірок із замовлень і трохи монет. Веди пальцем, щоб роздивитися долину.',focus:'#tpanel'},
    {text:'Відбудовані місця дарують бонуси, а Джерело відкриє ставок для коропів.'}],
  openMeadow:[{text:'Галявина — дім лисенят. Кружечки з плюсом — місця для декору: що затишніше, то краще лисята працюють.',focus:'#mscene'},
    {text:'Лисята голоднішають. Їжа внизу — торкнись її, щоб нагодувати. Ситі лисята допомагають на полі.',focus:'#mpanel'}],
  openPond:[{text:'У Джерелі живуть коропи. Кожен короп у ставку дає свою силу.',focus:'#pscene'},
    {text:'Не забувай їх годувати — їжа внизу.',focus:'#ppanel'}],
  shop:[{text:'У лавці монети стають силою: покращуй поклик, енергію та удачу.'}],
  boosts:[{text:'Чари коштують кристали. Вони недовгі, але сильні — бережи їх для великих замовлень.'}],
  quests:[{text:'Завдання оновлюються щодня. Сюжетні відкривають нових лисенят і коропів.'}],
  album:[{text:'В альбомі — усі твої дари, лисята й коропи. Тут же можна змінити їм вбрання.'}],
  daily:[{text:'Заходь щодня: що довша серія, то щедріший подарунок.'}],
};
function teach(k){S.flags=S.flags||{};if(S.flags['t_'+k]||S.tut<TUTORIAL.length||$('tut').classList.contains('on')||(k==='openPond'&&!built('spring')))return;
  S.flags['t_'+k]=1;save();track('teach_'+k,{});
  if($('m').classList.contains('on')){mHint=TEACH[k].map(l=>T(l.text)).join(' ');injectHint();return}  /* у вікні — підказка всередині, не поверх */
  story(TEACH[k])}
for(const k in TEACH){const f=window[k];if(typeof f!=='function')continue;window[k]=function(...a){const r=f.apply(this,a);setTimeout(()=>teach(k),450);return r}}

/* ===== MODALS ===== */
/* Єдиний каркас вікна: хрестик у куті + прокручуване тіло; шапка (.mh) — частина тіла. */
let mHint='';
function modal(html,noClose){
  mHint='';
  $('mc').innerHTML=(noClose?'':`<button class="mx" onclick="closeM()" aria-label="${T('Закрити')}">✕</button>`)+`<div class="mbody">${html}</div>`;
  $('mc').classList.toggle('dialog',!!noClose);$('m').classList.add('on')}
function injectHint(){if(!mHint)return;const b=document.querySelector('#mc .mbody');if(!b||b.querySelector('.mhint'))return;
  const h=document.createElement('div');h.className='mhint';h.innerHTML=`${HOSHI.base?`<img src="${HOSHI.base}" alt="">`:''}<p></p>`;h.querySelector('p').textContent=mHint;
  const mh=b.querySelector('.mh');mh?mh.after(h):b.prepend(h)}
function closeM(){mHint='';$('m').classList.remove('on');render();if(templeOpen)renderTemple()}
$('m').addEventListener('click',e=>{if(e.target.id==='m')closeM()});
function confirmM(text,yes){window._yes=()=>{closeM();yes()};modal(`<h3>${T('Точно?')}</h3><p>${text}</p><div style="display:flex;gap:8px"><button onclick="closeM()">${T('Ні')}</button><button class="main" onclick="_yes()">${T('Так')}</button></div>`,true)}
function hdr(ic,t,sub){return `<div class="mh"><div class="mh-ic">${ic}</div><div><div class="mh-t">${t}</div>${sub?`<div class="mh-s">${sub}</div>`:''}</div></div>`}

const DEBUG=/[?&]debug/.test(location.search);
function setLang(k){S.set.lang=k;save();location.reload()}
function settings(){let h=hdr('⚙️',T('Пауза'),T('Гра збережена'))+`<h3>${T('Тема')}</h3><div class="themes">`;
  for(const k in THEMES){const t=THEMES[k];h+=`<div class="th${S.set.theme===k?' on':''}" style="background:linear-gradient(160deg,${t.c.bg},${t.c.bg2});color:${t.c.txt}" onclick="setTheme('${k}')"><div class="sw">${t.items.slice(0,5).join('')}</div>${T(t.name)}</div>`}
  h+=`</div><h3 style="margin-top:14px">${T('Налаштування')}</h3>`;
  h+=`<div style="margin:8px 0"><div style="font-size:14px;margin-bottom:6px">${T('🌐 Мова')}</div><div style="display:flex;gap:6px">${[['uk','Українська'],['ru','Русский'],['en','English']].map(([k,n])=>`<button class="${lang()===k?'main':''}" style="flex:1;padding:8px 4px" onclick="setLang('${k}')">${n}</button>`).join('')}</div></div>`;
  [['sound','🔊 Звуки'],['voice','🎙️ Озвучка'],['vib','📳 Вібрація']].forEach(([k,n])=>h+=`<div class="row"><span>${T(n)}</span><button onclick="S.set.${k}=!S.set.${k};settings()">${S.set[k]?T('Увімк.'):T('Вимк.')}</button></div>`);
  h+=`<div class="row"><span>${T('📖 Пройти історію знову')}</span><button onclick="closeM();startTutorial()">${T('Почати')}</button></div>`;
  if(DEBUG)h+=`<div class="row"><span>${T('📊 Аналітика')}</span><button onclick="stats()">${T('Відкрити')}</button></div>`;modal(h)}
function setTheme(k){S.set.theme=k;applyTheme();track('theme',{k});SFX.chest();settings()}

function upCost(k){const u=CFG.upgrades[k];return Math.round(u.base*Math.pow(u.mult,S.up[k]))}
const UP_UI={luck:{ic:'🍀',fx:n=>Math.round(n*6)+'%'},cap:{ic:'🏮',fx:n=>CFG.energyMax+n*5+'⚡'},greed:{ic:'💰',fx:n=>'+'+n*10+'%'}};
const GEM_UI={gems_s:{ic:'💎',name:'Жменька'},gems_m:{ic:'💎💎💎',name:'Скарбничка',tag:'Найвигідніше'},starter:{ic:'🎁',name:'Стартовий набір'}};
let shopTab='up';
function shop(){let h=hdr('🛒',T('Лавка храму'),`${U('coin')} ${S.co} · ${U('gem')} ${S.ge}`)+
  `<div class="tabs"><div class="tab${shopTab==='up'?' on':''}" onclick="shopTab='up';shop()">${T('Покращення')}</div><div class="tab${shopTab==='boost'?' on':''}" onclick="shopTab='boost';shop()">${T('Чари')}</div><div class="tab${shopTab==='gem'?' on':''}" onclick="shopTab='gem';shop()">${T('Кристали')}</div></div>`;
  if(shopTab==='boost'){h+=boostGrid();modal(h);return}
  if(shopTab==='up'){h+='<div class="list">';
    for(const k in CFG.upgrades){const u=CFG.upgrades[k],lv=S.up[k],max=lv>=u.max,c=upCost(k),ui=UP_UI[k];
      h+=`<div class="up"><div class="big">${ui.ic}</div><div class="up-b"><div class="up-n">${T(u.name)}</div>
      <div class="pips">${Array.from({length:u.max},(_,i)=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div>
      <div class="up-fx">${ui.fx(lv)}${max?'':` <span>→ ${ui.fx(lv+1)}</span>`}</div></div>
      <button class="price${!max&&S.co>=c?' ok':''}" ${max||S.co<c?'disabled':''} onclick="buyUp('${k}')">${max?'MAX':c+'<br>'+U('coin')}</button></div>`}
    h+='</div>'}
  else{if(!S.starter){const p=CFG.iap.find(x=>x.once);h+=`<div class="starter" onclick="iap('${p.id}')"><div class="rib">${T('Один раз!')}</div><div class="big">${U('chest')}</div>
      <div style="flex:1"><div class="up-n">${T('Стартовий набір')}</div><div class="loot">${p.g}${U('gem')} · ${p.c}${U('coin')} · ${p.e}${U('energy')}</div></div><button class="price ok">${p.price}</button></div>`}
    h+='<div class="gems">';CFG.iap.filter(p=>!p.once).forEach(p=>{const ui=GEM_UI[p.id];
      h+=`<div class="gem" onclick="iap('${p.id}')">${ui.tag?`<div class="rib">${T(ui.tag)}</div>`:''}<div class="big">${ui.ic}</div><div class="up-n">${T(ui.name)}</div><div class="loot">${p.g} ${U('gem')}</div><button class="price ok">${p.price}</button></div>`});
    h+=`</div><small style="display:block;text-align:center;margin-top:8px">${T('Демо: справжньої оплати немає')}</small>`}
  modal(h)}
function buyUp(k){const c=upCost(k);if(S.co<c)return;S.co-=c;S.up[k]++;SFX.level();track('upgrade',{k,lv:S.up[k],cost:c});if(!S.flags.firstUp){S.flags.firstUp=1;track('first_upgrade',{k})}shop()}
function iap(id){const p=CFG.iap.find(x=>x.id===id);S.ge+=p.g||0;S.co+=p.c||0;S.en+=p.e||0;if(p.once)S.starter=true;S.stats.iap++;SFX.chest();track('iap_demo',{id});toast(T('Демо-покупка: {p}',{p:p.price}));shop()}

const BOOST_UI={refill:{ic:'⚡',d:'Енергія до максимуму'},auto:{ic:'🌀',d:'Зливає всі пари на полі'},up:{ic:'🌟',d:'Випадковий предмет +1 рівень'}};
function boosts(){shopTab='boost';shop()}
function boostGrid(){let h='<div class="bgrid">';
  for(const k in CFG.boosters){const b=CFG.boosters[k],ui=BOOST_UI[k],ok=S.ge>=b.gems;
    h+=`<div class="bst${ok?'':' no'}" onclick="${ok?`useB('${k}')`:`shopTab='gem';shop()`}"><div class="big">${ui.ic}</div><div class="up-n">${T(b.name)}</div><small>${T(ui.d)}</small><div class="price${ok?' ok':''}">${b.gems} ${U('gem')}</div></div>`}
  return h+'</div>'+adRow()}
function useB(k){const b=CFG.boosters[k];if(S.ge<b.gems)return;S.ge-=b.gems;track('booster',{k});SFX.chest();
  if(k==='refill')S.en=Math.max(S.en,enMax());
  if(k==='auto'){let did=true;while(did){did=false;for(let t=1;t<CFG.tiers;t++){const idx=S.board.map((v,i)=>v===t?i:-1).filter(i=>i>=0);
    for(let j=0;j+1<idx.length;j+=2){S.board[idx[j]]=0;S.board[idx[j+1]]=t+1;addXp(CFG.mergeXp(t+1));Q('merge');Q('tier',t+1);did=true}}}shake()}
  if(k==='up'){const f=S.board.map((v,i)=>v&&v<CFG.tiers?i:-1).filter(i=>i>=0);if(f.length){const i=pick(f);S.board[i]++;Q('tier',S.board[i])}}
  closeM()}
function adRow(){if(S.ads.day!==today())S.ads={day:today(),n:0};const left=CFG.rewardedAd.dailyCap-S.ads.n;
  return `<div class="ad${left<=0?' no':''}" onclick="${left>0?'watchAd()':''}"><div class="big">📺</div><div style="flex:1"><div class="up-n">${T('Безкоштовно за рекламу')}</div><small>+${CFG.rewardedAd.energy}${U('energy')} · ${T('ще {n} сьогодні',{n:left})}</small></div><div class="price ok">▶</div></div>`}
function watchAd(){modal(`<h3>${T('📺 Реклама (заглушка)')}</h3><p id="adt" style="font-size:40px;text-align:center">3</p>`,true);let n=3;const iv=setInterval(()=>{n--;const e=$('adt');if(e)e.textContent=n;
  if(n<=0){clearInterval(iv);S.ads.n++;S.en+=CFG.rewardedAd.energy;S.stats.adViews++;track('ad_rewarded',{});closeM();toast('+'+CFG.rewardedAd.energy+U('energy'))}},1000)}
function offerEnergy(){track('energy_empty',{});modal(hdr('⚡',T('Енергія скінчилась'),T('Наступна через {t}',{t:mmss(CFG.energyRegenSec*1000-(now()-S.enAt))}))+adRow()+
  `<div class="up" style="margin-top:8px" onclick="useB('refill')"><div class="big">⚡</div><div style="flex:1"><div class="up-n">${T('Повна енергія')}</div></div><div class="price${S.ge>=CFG.boosters.refill.gems?' ok':''}">${CFG.boosters.refill.gems} ${U('gem')}</div></div>`)}

function daily(auto){const d=S.daily,t=today();const claimed=d.last===t;
  const yest=dayShift(-1);const idx=claimed?(d.streak-1)%7:(d.last===yest?d.streak%7:0);
  if(auto&&claimed)return false;
  let h=hdr('🎁',T('Щоденна нагорода'),T('Серія: {n} дн.',{n:claimed?d.streak:(d.last===yest?d.streak:0)}))+'<div class="days">'+CFG.daily.map((r,i)=>`<div class="day${i<idx||(claimed&&i===idx)?' got':''}${i===idx?' now':''}">${T('Д{n}',{n:i+1})}<br>${rwTxt(r)}</div>`).join('')+'</div>';
  h+=claimed?`<small>${T('Повертайся завтра!')}</small>`:`<button class="main" style="width:100%" onclick="claim(${idx})">${T('Забрати')}</button>`;modal(h);return true}
function claim(i){const r=CFG.daily[i];giveRw(r);SFX.chest();
  S.daily.streak=S.daily.last===dayShift(-1)?S.daily.streak+1:1;S.daily.last=today();track('daily_claim',{day:i+1});closeM()}

function stats(){const st=S.stats,play=st.playMs+(now()-sessionStart);
  const d=k=>{const x=new Date(st.first+'T00:00');x.setDate(x.getDate()+k);const s=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');return st.days.includes(s)?T('так'):T('ні')};
  modal(hdr('📊',T('Аналітика'),T('Локально, на пристрої'))+`<pre>${T('Перший запуск: {a}',{a:st.first})}
${T('Сесій: {a}   Днів у грі: {b}',{a:st.sessions,b:st.days.length})}
${T('Повернувся D1: {a}   D7: {b}',{a:d(1),b:d(7)})}
${T('Час гри: {a} хв  (сер. сесія {b} хв)',{a:Math.round(play/60000),b:Math.round(play/60000/st.sessions)})}
${T('Призовів: {a}  Злиттів: {b}  Замовлень: {c}',{a:st.summons,b:st.merges,c:st.orders})}
${T('Скринь: {a}  Макс. комбо: {b}  Тема: {c}',{a:st.chests,b:st.maxCombo,c:S.set.theme})}
${T('Храм: {a}/{b}  Дотиків до храму: {c}',{a:S.temple,b:TEMPLE.length,c:st.taps})}
${T('Реклама: {a}  Демо-IAP: {b}',{a:st.adViews,b:st.iap})}

${T('Останні події:')}
${st.events.slice(-12).reverse().map(e=>new Date(e.t).toLocaleTimeString()+' '+e.name).join('\n')}</pre>
<div style="display:flex;gap:8px"><button onclick="exportEvents()">${T('⬇ Експорт JSON')}</button><button onclick="confirmM(T('Весь прогрес буде видалено назавжди.'),()=>{window.__reset=true;localStorage.removeItem(KEY);localStorage.removeItem(OLDKEY);location.reload()})">${T('Скинути')}</button></div>`)}
function exportEvents(){const data=JSON.stringify({exported:new Date().toISOString(),stats:S.stats,state:{lv:S.lv,temple:S.temple,co:S.co,ge:S.ge,stars:S.stars,up:S.up}},null,1);
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='kitsune_events_'+today()+'.json';document.body.appendChild(a);a.click();a.remove();toast(T('Файл збережено'))}
  catch(e){try{navigator.clipboard.writeText(data);toast(T('Скопійовано в буфер'))}catch(e2){}}track('events_export',{})}

/* =====================================================================
   TEMPLE — жива сцена
   ===================================================================== */
let templeOpen=false,spirits=[],dropT=0,tPan=null,lblShow='',lblT=0;
function tod(){const h=new Date().getHours();return h<5||h>=21?'night':h<8?'dawn':h<18?'day':'dusk'}
const SKY={day:['#7ec8f2','#fdf1d6'],dawn:['#f7a07a','#ffe0e8'],dusk:['#ff8a5c','#5a3478'],night:['#0b1030','#2a1b4d']};
function cdLeft(k,min){return Math.max(0,(S.tcd[k]||0)+min*60000-now())}
function built(id){const i=TEMPLE.findIndex(b=>b.id===id);return i>=0&&i<S.temple}
const depthK=y=>CFG.temple.depthMin+(1-CFG.temple.depthMin)*Math.max(0,Math.min(1,y/100));
function openTemple(){templeOpen=true;$('temple').classList.add('on');track('temple_open',{built:S.temple});
  if(!tPan)tPan=makePan($('tscene'),'tworld',{ar:()=>SCENE.wide?SCENE.ar:1.6,sky:'tsky'});
  spirits=[];renderTemple();spawnSpirits();dropT=now();focusTemple(false);
  if(!S.flags.templeFirst){S.flags.templeFirst=1;setTimeout(()=>hoshiSay(T(S.temple?'Ось наш храм. Потягни сцену вбік — і торкайся всього, що відбудуєш.':'Тут був наш храм… Збери зірки з замовлень — і почнемо з містка через струмок.')),500)}}
function focusTemple(anim){const b=TEMPLE[Math.min(S.temple,TEMPLE.length-1)],p=CFG.temple.pos[b.id];if(p)tPan.center(p.x,anim)}
function closeTemple(){templeOpen=false;$('temple').classList.remove('on');spirits=[];render()}
function objHtml(b,i,st){const p=CFG.temple.pos[b.id],k=depthK(p.y),sz=p.s*k;
  const lbl=st==='next'||lblShow===b.id?`<span class="lbl">${T(b.name)}</span>`:'';
  return `<div class="obj ${st}${TART[b.id]?' art':''}${justBuilt===i?' built':''}" data-o="${b.id}"${TSHORT[b.id]?` data-lbl="${T(TSHORT[b.id])}"`:''} style="left:${p.x}%;top:${p.y}%;--s:${sz.toFixed(1)};z-index:${Math.round(p.y)}"><i class="shd"></i>${tImg2(b,st==='on')}${st==='next'?buildBtn(b):''}${lbl}${cdBadge(b.id)}</div>`}
function buildBtn(b){const ok=S.stars>=b.st&&S.co>=b.co;return `<button class="tbuild${ok?' ok':''}" data-build="1"><span>${U('star')} ${Math.min(S.stars,b.st)}/${b.st}</span><span>${U('coin')} ${b.co}</span><b>${ok?T('Будувати'):T('Потрібно')}</b></button>`}
const tImg2=(b,on)=>TART[b.id]?`<img class="tart" src="${on?TART[b.id].on:TART[b.id].ruin}" alt="" draggable="false">`:`<span class="tem">${b.ic}</span>`;
function renderTemple(){const sc=$('tscene'),t=tod(),sky=SKY[t];
  sc.className='tscene pan '+t;
  const bg=SCENE.wide||(t==='night'&&SCENE.night)||SCENE.day;
  let h=`<div class="psky" id="tsky" style="background:linear-gradient(180deg,${sky[0]},${sky[1]})"><div class="sky-o">${t==='night'?'🌙':t==='day'?'☀️':t==='dawn'?'🌅':'🌇'}</div>`;
  if(t==='night')for(let i=0;i<24;i++)h+=`<i class="star" style="left:${(i*53)%100}%;top:${(i*29)%40}%;animation-delay:${(i%5)*.4}s"></i>`;
  h+=`</div><div class="pworld" id="tworld" style="${bg?`background-image:url('${bg}')`:''}">${bg?'':'<div class="ground"></div>'}`;
  TEMPLE.forEach((b,i)=>{const st=i<S.temple?'on':i===S.temple?'next':'off';
    h+=objHtml(b,i,st)});
  drops.forEach(d=>h+=`<div class="drop" data-d="${d.id}" style="left:${d.x}%;top:${d.y}%">${d.chest?U('chest'):U('coin')}</div>`);
  h+=`</div><div class="ptint ${t}"></div>${blessOn()?'<div class="blessaura"></div>':''}
    <div class="tgran" title="${T('Бабуся Хоші')}">${HOSHI.base?`<img src="${HOSHI.base}" alt="">`:'🦊'}</div><div id="tsay" class="say"></div>`;
  sc.innerHTML=h;justBuilt=-1;tPan.layout();
  $('thud').innerHTML=`${U('coin')} ${S.co} · ⭐ ${S.stars} · ${U('gem')} ${S.ge}`;
  const nb=TEMPLE[S.temple];
  $('tpanel').innerHTML=nb?'':`<div class="build"><div style="flex:1"><div class="up-n">${T('Храм відбудовано!')}</div><small>${T('Глава 1 завершена. Далі буде…')}</small></div></div>`;
  petsAfterTemple()}
function cdBadge(id){const m={bell:'bellCdMin',tree:'treeCdMin'}[id];if(!m||!built(id))return '';const l=cdLeft(id,CFG.temple[m]);return l?`<span class="cd">${mmss(l)}</span>`:'<span class="cd rdy">!</span>'}
let justBuilt=-1,lampsLit=false,drops=[];
function buildNext(){const b=TEMPLE[S.temple];if(!b||S.stars<b.st||S.co<b.co)return;S.stars-=b.st;S.co-=b.co;S.ge+=b.g;S.en+=20;justBuilt=S.temple;S.temple++;
  track('temple_build_'+S.temple,{id:b.id});SFX.build();vib([40,60,40]);renderTemple();focusTemple(true);
  setTimeout(()=>{const el=document.querySelector(`#tworld .obj[data-o="${b.id}"]`)||$('tscene');const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height*.8;
    burst(x,y,'#d8c7a8',22,70);setTimeout(()=>burst(x,y-r.height*.4,'#ffd166',30,90),250);
    const ring=document.createElement('div');ring.className='wave';ring.style.left=x+'px';ring.style.top=y+'px';document.body.appendChild(ring);setTimeout(()=>ring.remove(),1200)},350);
  toast(`${b.ic} ${T('{n} відбудовано!',{n:T(b.name)})} +${b.g}${U('gem')} +20${U('energy')}`);
  setTimeout(()=>story([{id:'',text:b.text}]),1200);spawnSpirits()}
/* бабуся: говорить у тому екрані, що відкритий */
function hoshiSay(txt){const e=(typeof pondOpen!=='undefined'&&pondOpen&&$('psay'))||(typeof meadowOpen!=='undefined'&&meadowOpen&&$('msay'))||$('tsay');if(!e)return;e.textContent=txt;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),5200)}
function grannyLine(){const t=tod(),nb=TEMPLE[S.temple];const L=[];
  L.push(T({night:'Не спиться, лисе? Зорі сьогодні такі яскраві…',dawn:'Доброго ранку! Роса на траві — гарна прикмета.',day:'Сонце високо — саме час для праці.',dusk:'Вечоріє… Час запалювати ліхтарі.'}[t]));
  if(nb)L.push(S.stars>=nb.st?T('Зірок досить! Відбудуймо {n}.',{n:T(nb.name).toLowerCase()}):T('Для «{n}» потрібно ще {k} ⭐. Замовлення чекають.',{n:T(nb.name),k:nb.st-S.stars}));else L.push(T('Храм сяє. Я так пишаюся тобою, маленький лисе.'));
  if(blessOn())L.push(T('Вогонь вівтаря ще благословляє тебе — поспішай!'));
  if(built('bell')&&!cdLeft('bell',CFG.temple.bellCdMin))L.push(T('Дзвін давно мовчить. Подзвони — ліс почує.'));
  if(S.pets.active.length)L.push(T('Лисята чекають на галявині. Загляни до них — і не забудь гостинця.'));
  L.push(T('Коли я була молодою, мала лише один хвіст. Терпіння, лисе, терпіння.'),T('Тінь не любить світла. Кожен вогник тут — наш щит.'));
  return pick(L)}
/* духи-вогники (лисята живуть на галявині) */
function spawnSpirits(){spirits=TEMPLE.slice(0,S.temple).map(b=>CFG.temple.pos[b.id]).filter(Boolean)}
function tickTemple(){if(!templeOpen)return;
  if(spirits.length&&now()-dropT>CFG.temple.spiritDropSec*1000&&drops.length<CFG.temple.spiritMaxDrops){dropT=now();const s=pick(spirits);
    drops.push({id:'d'+now(),x:Math.max(4,Math.min(96,s.x+(Math.random()-.5)*12)),y:Math.min(95,s.y+4+Math.random()*5),chest:Math.random()<CFG.temple.spiritChestChance});track('spirit_drop',{});
    const w=$('tworld');if(w){const d=drops[drops.length-1];w.insertAdjacentHTML('beforeend',`<div class="drop" data-d="${d.id}" style="left:${d.x}%;top:${d.y}%">${d.chest?U('chest'):U('coin')}</div>`)}}
  if(lblShow&&now()>lblT){lblShow='';const l=document.querySelector('#tworld .obj:not(.next) .lbl');if(l)l.remove()}
  if(now()%5000<1000)renderCds()}
function renderCds(){TEMPLE.forEach(b=>{const e=document.querySelector(`#tworld .obj[data-o="${b.id}"]`);if(!e)return;const old=e.querySelector('.cd');const nw=cdBadge(b.id);if(old)old.outerHTML=nw||'';else if(nw)e.insertAdjacentHTML('beforeend',nw)})}
$('tscene').addEventListener('click',e=>{const d=e.target.closest('.drop');if(d){collectDrop(d.dataset.d,e);return}
  if(e.target.closest('[data-build]')){const b=TEMPLE[S.temple];if(b&&S.stars>=b.st&&S.co>=b.co)buildNext();else if(b)hoshiSay(S.stars<b.st?T('Ще {n} зір. — виконуй замовлення.',{n:b.st-S.stars}):T('Бракує {n} монет.',{n:b.co-S.co}));return}
  if(e.target.closest('.tgran')){hoshiSay(grannyLine());SFX.pop();track('temple_tap',{o:'granny'});return}
  const o=e.target.closest('.obj');if(!o)return;
  if(!o.querySelector('.lbl')&&!o.classList.contains('lamp')){const b=TEMPLE.find(x=>x.id===o.dataset.o);if(b){o.insertAdjacentHTML('beforeend',`<span class="lbl">${T(b.name)}</span>`);lblShow=b.id;lblT=now()+2500}}
  templeTap(o.dataset.o,o,e)});
function collectDrop(id,e){if(!e){const el=document.querySelector(`.drop[data-d="${id}"]`);if(!el)return;const r=el.getBoundingClientRect();e={clientX:r.x+r.width/2,clientY:r.y+r.height/2}}const i=drops.findIndex(d=>d.id===id);if(i<0)return;const d=drops.splice(i,1)[0];
  if(d.chest){const l=chestLoot();giveRw(l);S.stats.chests++;Q('chest');floatTxt(e.clientX,e.clientY,'+'+rwTxt(l));SFX.chest()}
  else{const c=CFG.temple.spiritCoins(S.lv);addCo(c);floatTxt(e.clientX,e.clientY,'+'+c+U('coin'));SFX.coin()}
  burst(e.clientX,e.clientY,'#ffd166',10);vib(10);track('spirit_pickup',{chest:d.chest});renderTemple()}
function tapFx(el){el.classList.remove('tapped');void el.offsetWidth;el.classList.add('tapped')}
function templeTap(id,el,e){const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;tapFx(el);S.stats.taps++;
  if(id==='granny'){hoshiSay(grannyLine());SFX.pop();track('temple_tap',{o:id});return}
  const idx=TEMPLE.findIndex(b=>b.id===id);
  if(idx>=S.temple){if(idx===S.temple)hoshiSay(T('«{n}» — {s} ⭐ і {c} монет. Ми впораємось!',{n:T(TEMPLE[idx].name),s:TEMPLE[idx].st,c:TEMPLE[idx].co}));else hoshiSay(T('Це ще попереду. Спершу — те, що світиться.'));return}
  track('temple_tap',{o:id});Q('temple');
  const TC=CFG.temple;
  if(id==='bell'){SFX.bell();vib([20,40,20,40]);for(let k=0;k<3;k++)setTimeout(()=>{const w=document.createElement('div');w.className='wave';w.style.left=x+'px';w.style.top=y+'px';document.body.appendChild(w);setTimeout(()=>w.remove(),1200)},k*250);
    if(!cdLeft('bell',TC.bellCdMin)){S.tcd.bell=now();const c=TC.bellCoins(S.lv);addCo(c);floatTxt(x,y-30,'+'+c+U('coin'));flyTo(x,y,U('coin'),'thud',4);track('temple_reward',{o:'bell',c})}
    else hoshiSay(T('Дзвін ще гуде. Ліс відповість трохи згодом.'))}
  else if(id==='lanterns'){lampsLit=true;const ls=[...document.querySelectorAll('.lamp')];ls.forEach((l,k)=>setTimeout(()=>{l.classList.add('lit');SFX.lamp(k);burst(l.getBoundingClientRect().x+13,l.getBoundingClientRect().y+13,'#ffb347',6,30)},k*160));
    if(!cdLeft('lamp',TC.lampCdMin)){S.tcd.lamp=now();setTimeout(()=>{S.en+=TC.lampEnergy;floatTxt(x,y-30,'+'+TC.lampEnergy+U('energy'));track('temple_reward',{o:'lamp'})},700)}}
  else if(id==='tree'){SFX.rustle();for(let k=0;k<8;k++){const l=document.createElement('div');l.className='leaf';l.textContent=pick(['🍃','🍂','🌸']);l.style.left=(x-30+Math.random()*60)+'px';l.style.top=(y-20)+'px';document.body.appendChild(l);setTimeout(()=>l.remove(),1600)}
    if(!cdLeft('tree',TC.treeCdMin)){const free=S.board.filter(t=>!t).length;if(!free){hoshiSay(T('Поле переповнене — звільни місце для дарів дерева.'));return}
      S.tcd.tree=now();let n=0;TC.treeDrops.forEach(t=>{const i=S.board.indexOf(0);if(i>=0){S.board[i]=t;n++}});floatTxt(x,y-30,T('+{n} дари на поле',{n}));petsFoodDrop(.6,x,y);track('temple_reward',{o:'tree',n})}
    else hoshiSay(T('Дерево відпочиває. Гілки ще не налилися дарами.'))}
  else if(id==='spring'){SFX.splash();openPond();return}
  else if(id==='altar'){SFX.fire();burst(x,y,'#ff7a2f',16,40);if(blessOn()){hoshiSay(T('Благословення діє ще {t}.',{t:mmss(S.bless.until-now())}));return}offering()}
  else if(id==='shrine'){burst(x,y,'#ffffff',20,80);SFX.chest();story([{id:'',text:TEMPLE[7].text}])}
  else{burst(x,y,'#ffd166',12,40);SFX.pop();hoshiSay(T(TEMPLE[idx].text))}
  setTimeout(renderCds,50);$('thud').innerHTML=`${U('coin')} ${S.co} · ⭐ ${S.stars} · ${U('gem')} ${S.ge}`}
function offering(){const TC=CFG.temple,have={};S.board.forEach(t=>{if(t>=TC.offerMinTier&&t<=CFG.tiers)have[t]=(have[t]||0)+1});
  const tiers=Object.keys(have).map(Number).sort((a,b)=>a-b);
  let h=hdr('🔥',T('Підношення вогню'),T('Віддай предмет з поля → ×{n} монет на час',{n:TC.blessMult}));
  if(!tiers.length)h+=`<p>${T('На полі немає предметів {n}-го рівня або вище. Злий щось цінне й повертайся.',{n:TC.offerMinTier})}</p>`;
  else{h+='<div class="bgrid">';tiers.forEach(t=>h+=`<div class="bst" onclick="offer(${t})"><div class="big">${icon(t)}</div><div class="up-n">${T('Рів. {n} ×{k}',{n:t,k:have[t]})}</div><small>${T('×{n} монет',{n:TC.blessMult})}</small><div class="price ok">${T('{n} хв',{n:TC.blessMin(t)})}</div></div>`);h+='</div>'}
  modal(h)}
function offer(t){const i=S.board.indexOf(t);if(i<0)return;S.board[i]=0;const TC=CFG.temple;S.bless={until:now()+TC.blessMin(t)*60000,mult:TC.blessMult};
  track('offering',{tier:t});S.pets.offers=(S.pets.offers||0)+1;SFX.fire();vib([30,30,60]);closeM();hoshiSay(T('Вогонь прийняв дар. {n} хвилин усі замовлення приносять удвічі більше монет!',{n:TC.blessMin(t)}));renderTemple()}

/* ===== START ===== */
function afterStart(){ensureQuests();if(!daily(true))render()}
function boot(){applyTheme();ensureQuests();fitBoard();render();
  if(S.tut<TUTORIAL.length)startTutorial();else afterStart()}
/* splash + preload */
(function splash(){const list=[loadArt(S.set.theme),...loadCommon()];let done=0;const bar=$('ldBar');
  list.forEach(p=>p.then(()=>{done++;bar.style.width=(done/list.length*100)+'%'}));
  Promise.all(list).then(()=>{bar.style.width='100%';$('playBtn').classList.add('on')});
  setTimeout(()=>$('playBtn').classList.add('on'),4000);
  $('playBtn').onclick=()=>{ac();tone(523,.15,'triangle',.12);$('splash').classList.add('out');track('splash_play',{});boot()}})();
$('summon').onclick=()=>summon(false);$('bShop').onclick=shop;$('bDaily').onclick=()=>daily();$('bSet').onclick=settings;
$('bQuest').onclick=quests;$('bAlbum').onclick=()=>album();$('bTemple').onclick=openTemple;$('chipTemple').onclick=openTemple;$('tBack').onclick=closeTemple;
addEventListener('visibilitychange',()=>{if(document.hidden){S.stats.playMs+=now()-sessionStart;track('session_end',{});save()}else{sessionStart=now()}});
addEventListener('pagehide',save);
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});

['tpanel','mpanel','ppanel'].forEach(id=>{const p=$(id);if(p&&window.ResizeObserver)new ResizeObserver(()=>p.parentNode.style.setProperty('--pb',p.offsetHeight+'px')).observe(p)});
