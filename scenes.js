'use strict';
/* =====================================================================
   SCENES: горизонтальний pan (храм, галявина), Лисяча галявина, Джерело (ставок кої).
   Завантажується ДО game.js; глобальні S/CFG/... використовуються лише в рантаймі.
   ===================================================================== */

/* ---------- pan зі інерцією і межами ---------- */
function makePan(view,worldId,o){
  const P={x:0,W:0,vw:0,v:0,drag:null,moved:false,raf:0};
  P.layout=()=>{const w=document.getElementById(worldId);if(!w)return;P.vw=view.clientWidth;const H=view.clientHeight;
    P.W=Math.max(P.vw,Math.round(H*o.ar()));w.style.width=P.W+'px';view.style.setProperty('--u',(H/600).toFixed(3)+'px');
    const sky=o.sky&&document.getElementById(o.sky);if(sky)sky.style.width=Math.round(P.vw+(P.W-P.vw)*.25+2)+'px';P.apply()};
  P.apply=()=>{P.x=Math.max(0,Math.min(P.W-P.vw,P.x));const w=document.getElementById(worldId);if(w)w.style.transform=`translate3d(${-P.x}px,0,0)`;
    const sky=o.sky&&document.getElementById(o.sky);if(sky)sky.style.transform=`translate3d(${-P.x*.25}px,0,0)`};
  P.center=(pct,anim)=>{const tx=P.W*pct/100-P.vw/2;cancelAnimationFrame(P.raf);if(!anim){P.x=tx;P.apply();return}
    const x0=P.x,t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/650),e=1-Math.pow(1-k,3);P.x=x0+(tx-x0)*e;P.apply();if(k<1)P.raf=requestAnimationFrame(st)};P.raf=requestAnimationFrame(st)};
  view.addEventListener('pointerdown',e=>{if(e.target.closest('.food'))return;cancelAnimationFrame(P.raf);P.drag={x:e.clientX,x0:P.x,lx:e.clientX,t:performance.now()};P.moved=false;P.v=0});
  addEventListener('pointermove',e=>{if(!P.drag)return;const dx=e.clientX-P.drag.x;if(!P.moved&&Math.abs(dx)>8)P.moved=true;if(!P.moved)return;
    const t=performance.now();P.v=(e.clientX-P.drag.lx)/Math.max(1,t-P.drag.t);P.drag.lx=e.clientX;P.drag.t=t;P.x=P.drag.x0-dx;P.apply()});
  const up=()=>{if(!P.drag)return;P.drag=null;if(!P.moved)return;let v=-P.v*16;
    const step=()=>{v*=.93;P.x+=v;P.apply();if(Math.abs(v)>.3&&P.x>0&&P.x<P.W-P.vw)P.raf=requestAnimationFrame(step)};P.raf=requestAnimationFrame(step)};
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  view.addEventListener('click',e=>{if(P.moved){e.stopPropagation();e.preventDefault();P.moved=false}},true);
  return P}
const rnd=(a,b)=>a+Math.random()*(b-a);
const DECOR={};
function decorPreload(){return [...CFG.meadow.decor,...CFG.pond.decor].map(d=>probe(`art/decor/${d.id}.png`).then(ok=>{DECOR[d.id]=ok}))}
const decorIcon=d=>DECOR[d.id]?`<img class="tart" src="art/decor/${d.id}.png" alt="" draggable="false">`:`<span class="tem">${d.ic}</span>`;
function buyDecor(where,id){const list=where==='meadow'?CFG.meadow.decor:CFG.pond.decor,d=list.find(x=>x.id===id),st=where==='meadow'?S.meadow:S.pondS;
  if(!d||st.decor[id])return;
  confirmM(`${T('Поставити «{n}» за {c}?',{n:T(d.name),c:d.co+U('coin')})}<br><small>${where==='meadow'?T('+{n} комфорту: лисята швидше стають друзями',{n:d.comfort}):T(d.fx)}</small>`,()=>{
    if(S.co<d.co){toast(T('Бракує монет'));SFX.err();return}S.co-=d.co;st.decor[id]=1;track('decor_buy',{id,where});SFX.build();vib([30,40]);
    if(where==='meadow')renderMeadow();else renderPond();
    const el=document.querySelector(`[data-dec="${id}"]`);if(el){const r=el.getBoundingClientRect();burst(r.x+r.width/2,r.y+r.height/2,'#ffd166',20,60)}})}

/* =====================================================================
   ЛИСЯЧА ГАЛЯВИНА
   ===================================================================== */
let meadowOpen=false,mPan=null,mfox=[];
function meadowComfort(){let c=0;CFG.meadow.decor.forEach(d=>{if(S.meadow&&S.meadow.decor[d.id])c+=d.comfort});return c}
function openMeadow(){meadowOpen=true;$('meadow').classList.add('on');track('meadow_open',{n:S.pets.active.length,comfort:meadowComfort()});
  if(!mPan)mPan=makePan($('mscene'),'mworld',{ar:()=>1.5,sky:'msky'});initFoxes();renderMeadow();mPan.center(50,false);
  setTimeout(()=>hoshiSay(T(S.pets.active.length?'Лисята тут граються. Пригости їх — перетягни їжу на лисеня.':'Тут поки порожньо. Виконуй сюжетні завдання — і перше лисеня прийде.')),400)}
function closeMeadow(){meadowOpen=false;$('meadow').classList.remove('on');petsRefresh();render()}
function initFoxes(){const ids=S.pets.active.filter(id=>S.pets.own[id]);const keep={};mfox.forEach(f=>keep[f.id]=f);
  mfox=ids.map((id,i)=>keep[id]||{id,x:30+i*20,y:72+(i%2)*10,st:'idle',until:now()+800+i*900,face:1,after:null})}
function foxHtml(f){const s=petSat(f.id);return `<div class="mfox pet ${f.st}${s<=0?' hungry':''}" id="mf_${f.id}" data-pet="${f.id}" style="left:${f.x}%;top:${f.y}%;--s:${(64*depthK(f.y)).toFixed(1)};z-index:${Math.round(f.y)+1}">
  <div class="satb" title="${T('Ситість')}"><i style="width:${s}%"></i></div><i class="shd"></i><div class="fb" style="transform:scaleX(${f.face})">${petIcon(f.id)}</div><span class="zz">💤</span></div>`}
function renderMeadow(){const sc=$('mscene'),t=tod();sc.className='tscene pan '+t;
  const sky=SKY[t];let h=`<div class="psky" id="msky" style="background:linear-gradient(180deg,${sky[0]},${sky[1]})"><div class="sky-o">${t==='night'?'🌙':'☀️'}</div></div><div class="pworld" id="mworld" style="${SCENE.meadow?`background-image:url('${SCENE.meadow}')`:''}">${SCENE.meadow?'':'<div class="ground meadowg"><i class="hill"></i><i class="hill h2"></i></div>'}`;
  CFG.meadow.decor.forEach(d=>{const own=S.meadow.decor[d.id];
    h+=`<div class="dec${own?' own':''}" data-dec="${d.id}" data-where="meadow" style="left:${d.x}%;top:${d.y}%;--s:${(66*depthK(d.y)).toFixed(1)};z-index:${Math.round(d.y)}">${own?`<i class="shd"></i>${decorIcon(d)}`:`<span class="slot">+<small>${d.ic}</small></span>`}</div>`});
  mfox.forEach(f=>h+=foxHtml(f));
  h+=`</div><div class="ptint ${t}"></div><div id="msay" class="say"></div>`;
  sc.innerHTML=h;mPan.layout();
  $('mhud').innerHTML=`${U('coin')} ${S.co} · 🛋️ ${meadowComfort()}`;
  $('mpanel').innerHTML=foodBarHtml(`<button class="icon" onclick="album('fox')">📖</button>`)}
function sleepSpot(){const own=CFG.meadow.decor.filter(d=>(d.id==='m_cushion'||d.id==='m_burrow')&&S.meadow.decor[d.id]);return own.length?pick(own):null}
function foxStep(f){const el=$('mf_'+f.id);if(!el)return;const A=CFG.meadow.ai,hungry=petSat(f.id)<30;
  const ws=[A.walkW,A.idleW,A.sitW,A.sleepW+(hungry?3:0)],tot=ws.reduce((a,b)=>a+b,0);let r=Math.random()*tot,i=0;while(r>ws[i]){r-=ws[i];i++}
  let st=['walk','idle','sit','sleep'][i];const spot=st==='sleep'&&Math.random()<.7?sleepSpot():null;
  if(st==='walk'||spot){const tx=spot?spot.x+rnd(-3,3):rnd(8,92),ty=spot?spot.y+rnd(1,4):rnd(58,92);
    const dur=Math.max(.6,Math.hypot((tx-f.x)*1.5,ty-f.y)/CFG.meadow.foxSpeed);f.face=tx>f.x?1:-1;
    el.style.transition=`left ${dur}s linear,top ${dur}s linear`;f.x=tx;f.y=ty;el.style.left=tx+'%';el.style.top=ty+'%';el.style.zIndex=Math.round(ty)+1;el.style.setProperty('--s',(64*depthK(ty)).toFixed(1));
    f.st='walk';f.until=now()+dur*1000;f.after=spot?'sleep':null}
  else{f.st=st;f.until=now()+rnd(...A[st])*1000}
  el.classList.remove('walk','idle','sit','sleep');el.classList.add(f.st);el.querySelector('.fb').style.transform=`scaleX(${f.face})`}
document.getElementById('mscene').addEventListener('click',e=>{const d=e.target.closest('.dec');if(d){if(!d.classList.contains('own'))buyDecor('meadow',d.dataset.dec);else{const x=CFG.meadow.decor.find(q=>q.id===d.dataset.dec);d.classList.remove('tapped');void d.offsetWidth;d.classList.add('tapped');hoshiSay(T('{n}: +{c} комфорту. Лисятам тут затишно.',{n:T(x.name),c:x.comfort}))}return}
  const f=e.target.closest('.mfox');if(f){const m=mfox.find(q=>q.id===f.dataset.pet);if(m&&m.st==='sleep'){m.st='idle';m.until=now()+2000;f.classList.remove('sleep')}
    f.classList.remove('jump');void f.offsetWidth;f.classList.add('jump');petTap(f.dataset.pet,f);const r=f.getBoundingClientRect();burst(r.x+r.width/2,r.y+r.height/3,'#ff7fb0',8,30);track('meadow_tap',{id:f.dataset.pet})}});

/* =====================================================================
   ДЖЕРЕЛО — ставок кої (портрет)
   ===================================================================== */
let pondOpen=false,koi=[],pRAF=0,pTarget=null,pFood=[];
function pondFx(){const d=S.pondS.decor;return{coin:d.p_lotus?1.1:1,pearl:d.p_reeds?.05:0,rate:d.p_lantern?.8:1,max:CFG.pond.maxBubbles+(d.p_bridge?1:0)}}
function pondKoiIds(){return S.pets.pond.slice(0,PETS_CFG.pondSlots(S.temple)).filter(id=>S.pets.own[id])}
function openPond(){if(!built('spring')){toast(T('Спершу відбудуй Джерело'));return}
  pondOpen=true;$('pond').classList.add('on');track('pond_open',{koi:pondKoiIds().length});
  koi=pondKoiIds().map(id=>({id,x:rnd(25,75),y:rnd(25,75),a:rnd(0,6.28),tx:50,ty:50,until:0}));pFood=[];pTarget=null;
  accrueBubbles();renderPond();cancelAnimationFrame(pRAF);let lt=performance.now();
  const loop=t=>{if(!pondOpen)return;pondStep(Math.min(.05,(t-lt)/1000));lt=t;pRAF=requestAnimationFrame(loop)};pRAF=requestAnimationFrame(loop);
  setTimeout(()=>hoshiSay(T(koi.length?'Торкнись води — коропи підпливуть. Кинь їм корм просто у воду.':'Ставок чекає на коропів. Їх дарують сюжетні завдання.')),400)}
function closePond(){pondOpen=false;cancelAnimationFrame(pRAF);$('pond').classList.remove('on');petsRefresh()}
function accrueBubbles(){const fx=pondFx(),per=CFG.pond.bubbleMin*60000*fx.rate,P=S.pondS;P.b=P.b||[];if(!P.last)P.last=now()-per;
  let n=Math.floor((now()-P.last)/per);if(n<=0)return false;P.last+=n*per;let added=false;
  for(;n>0&&P.b.length<fx.max;n--){P.b.push({id:'b'+now()+n,x:rnd(15,85),y:rnd(18,80),pearl:Math.random()<CFG.pond.pearlChance+fx.pearl+CFG.pets.fx.koi_white*PB('koi_white')});added=true}
  if(P.b.length>=fx.max)P.last=now();return added}
function koiHtml(k){return `<div class="koi2 pet" id="pk_${k.id}" data-pet="${k.id}" style="left:${k.x}%;top:${k.y}%"><div class="kb">${petIcon(k.id)}</div></div>`}
function renderPond(){const sc=$('pscene'),t=tod();sc.className='pscene '+t;
  sc.style.backgroundImage=SCENE.pond?`url('${SCENE.pond}')`:'';
  let h=SCENE.pond?'':'<div class="water"><i class="caust"></i></div>';
  CFG.pond.decor.forEach(d=>{const own=S.pondS.decor[d.id];h+=`<div class="dec${own?' own':''}" data-dec="${d.id}" style="left:${d.x}%;top:${d.y}%;--s:60">${own?decorIcon(d):`<span class="slot">+<small>${d.ic}</small></span>`}</div>`});
  (S.pondS.b||[]).forEach(b=>h+=`<div class="bub" data-b="${b.id}" style="left:${b.x}%;top:${b.y}%">${b.pearl?'<span class="pearl"></span>':U('coin')}</div>`);
  pFood.forEach(f=>h+=`<div class="pellet" id="pf_${f.id}" style="left:${f.x}%;top:${f.y}%">${foodIcon(f.k)}</div>`);
  koi.forEach(k=>h+=koiHtml(k));
  h+=`<div class="ptint ${t}"></div><div id="psay" class="say"></div>`;
  sc.innerHTML=h;
  $('phud').innerHTML=`${U('coin')} ${S.co} · ${U('gem')} ${S.ge} · 🐟 ${koi.length}/${PETS_CFG.pondSlots(S.temple)}`;
  $('ppanel').innerHTML=foodBarHtml(`<button class="icon" onclick="album('koi')">📖</button>`)}
function ripple(cx,cy,big){const w=document.createElement('div');w.className='wave water'+(big?' big':'');w.style.left=cx+'px';w.style.top=cy+'px';document.body.appendChild(w);setTimeout(()=>w.remove(),1200)}
function pondStep(dt){const sc=$('pscene');if(!sc)return;const ar=sc.clientWidth/Math.max(1,sc.clientHeight),C=CFG.pond;
  koi.forEach(k=>{let tx,ty,fast=false,food=null;
    if(pFood.length){food=pFood.reduce((b,f)=>{const d=Math.hypot((f.x-k.x)*ar,f.y-k.y);return!b||d<b.d?{f,d}:b},null).f;tx=food.x;ty=food.y;fast=true}
    else if(pTarget&&now()<pTarget.until){tx=pTarget.x+(k.id.length%3-1)*4;ty=pTarget.y+(k.id.length%2?3:-3);fast=true}
    else{if(now()>k.until||Math.hypot((k.tx-k.x)*ar,k.ty-k.y)<4){k.tx=rnd(10,90);k.ty=rnd(12,88);k.until=now()+rnd(3000,7000)}tx=k.tx;ty=k.ty}
    const want=Math.atan2(ty-k.y,(tx-k.x)*ar);let da=want-k.a;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;
    k.a+=Math.max(-C.turnRate*dt,Math.min(C.turnRate*dt,da));const sp=C.koiSpeed*(fast?1.9:1)*(Math.abs(da)>1.2?.5:1);
    k.x=Math.max(5,Math.min(95,k.x+Math.cos(k.a)*sp*dt/ar));k.y=Math.max(8,Math.min(92,k.y+Math.sin(k.a)*sp*dt));
    if(food&&Math.hypot((food.x-k.x)*ar,food.y-k.y)<4.5)eatFood(k,food);
    const el=document.getElementById('pk_'+k.id);if(el){el.style.left=k.x+'%';el.style.top=k.y+'%';
      const deg=k.a*57.3,flipY=Math.cos(k.a)<0?-1:1,fx=PETART[k.id]?1:-1;el.firstChild.style.transform=`rotate(${deg}deg) scaleY(${flipY}) scaleX(${fx})`}})}
function eatFood(k,f){pFood=pFood.filter(x=>x!==f);const el=$('pf_'+f.id);if(el)el.remove();const love=feed(k.id,f.k);
  const pe=$('pk_'+k.id);if(pe){const r=pe.getBoundingClientRect();floatTxt(r.x,r.y-10,love?(love>1?'💖💖':'💖'):'😌');ripple(r.x+r.width/2,r.y+r.height/2)}
  if(love)track('koi_feed',{id:k.id,food:f.k,love});renderPondPanel()}
function renderPondPanel(){$('ppanel').innerHTML=foodBarHtml(`<button class="icon" onclick="album('koi')">📖</button>`)}
function pondThrow(k,cx,cy){if(!(S.pets.food[k]>0))return;if(!koi.length){toast(T('У ставку ще немає коропів'));return}
  const r=$('pscene').getBoundingClientRect();const f={id:'f'+now(),k,x:(cx-r.x)/r.width*100,y:(cy-r.y)/r.height*100};pFood.push(f);
  $('pscene').insertAdjacentHTML('beforeend',`<div class="pellet" id="pf_${f.id}" style="left:${f.x}%;top:${f.y}%">${foodIcon(k)}</div>`);
  ripple(cx,cy,true);SFX.splash();track('koi_throw',{food:k})}
function collectBubble(id,e){const P=S.pondS,i=(P.b||[]).findIndex(b=>b.id===id);if(i<0)return;const b=P.b.splice(i,1)[0],fx=pondFx();
  if(b.pearl){S.ge+=1;floatTxt(e.clientX,e.clientY,'+1'+U('gem'))}
  else{const c=Math.round(CFG.temple.pondCoins(S.lv)*(1+CFG.pets.fx.koi_red*PB('koi_red'))*fx.coin);addCo(c);floatTxt(e.clientX,e.clientY,'+'+c+U('coin'))}
  petsFoodDrop(CFG.pond.foodChance,e.clientX,e.clientY);SFX.coin();burst(e.clientX,e.clientY,'#9fe8ff',10,40);track('pond_bubble',{pearl:b.pearl});Q('temple');
  const el=document.querySelector(`.bub[data-b="${id}"]`);if(el)el.remove();$('phud').innerHTML=`${U('coin')} ${S.co} · ${U('gem')} ${S.ge} · 🐟 ${koi.length}/${PETS_CFG.pondSlots(S.temple)}`;renderPondPanel()}
document.getElementById('pscene').addEventListener('click',e=>{const b=e.target.closest('.bub');if(b){collectBubble(b.dataset.b,e);return}
  const d=e.target.closest('.dec');if(d){if(!d.classList.contains('own'))buyDecor('pond',d.dataset.dec);else{const x=CFG.pond.decor.find(q=>q.id===d.dataset.dec);hoshiSay(`${T(x.name)}: ${T(x.fx)}.`)}return}
  const k=e.target.closest('.koi2');if(k){petTap(k.dataset.pet,k);return}
  const r=$('pscene').getBoundingClientRect();pTarget={x:(e.clientX-r.x)/r.width*100,y:(e.clientY-r.y)/r.height*100,until:now()+3500};
  ripple(e.clientX,e.clientY);setTimeout(()=>ripple(e.clientX,e.clientY),220);SFX.splash();track('pond_tap',{})});

/* ---------- щосекунди ---------- */
function scenesTick(){
  if(meadowOpen)mfox.forEach(f=>{if(now()<f.until)return;const el=$('mf_'+f.id);
    if(f.after){f.st=f.after;f.after=null;f.until=now()+rnd(...CFG.meadow.ai.sleep)*1000;if(el){el.classList.remove('walk','idle','sit');el.classList.add('sleep')}}else foxStep(f);
    if(el){const s=petSat(f.id),b=el.querySelector('.satb i');if(b)b.style.width=s+'%';el.classList.toggle('hungry',s<=0)}});
  if(pondOpen&&accrueBubbles())renderPond()}
