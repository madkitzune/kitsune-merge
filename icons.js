/* Емодзі в інтерфейсі -> намальовані іконки art/ui/*.svg (будь-який текст, що з'являється в DOM). */
(function(){
const MAP={'⭐':'star','🌟':'star','💖':'heart','❤️':'heart','📖':'book','📜':'scroll','⛩️':'temple','⛩':'temple','🏯':'temple','🛒':'shop',
  '✨':'spark','⚙️':'gear','⚙':'gear','🦊':'fox','🐟':'fish','🐠':'fish','🐡':'fish','🔥':'fire','🌙':'moon','☀️':'sun','🏮':'lantern','🔔':'bell',
  '🔊':'sound','🎙️':'mic','📳':'vibrate','📊':'chart','📺':'tv','✓':'check','✅':'check','❔':'help','🌸':'flower','🍃':'leaf','🍂':'leaf','🍀':'leaf',
  '💤':'sleep','🗓':'calendar','🗓️':'calendar','🎀':'bow','◀':'back','🔒':'lock','💰':'coin','💎':'gem','⚡':'energy','🎁':'chest'};
const keys=Object.keys(MAP).sort((a,b)=>b.length-a.length);
const RE=new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,PRE:1};
function fix(root){if(!root)return;if(root.nodeType===1&&(SKIP[root.nodeName]||root.nodeName==='IMG'))return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;if(!p||SKIP[p.nodeName]||p.closest&&p.closest('[data-raw]'))return 2;RE.lastIndex=0;return RE.test(n.nodeValue)?1:2}});
  const list=[];while(w.nextNode())list.push(w.currentNode);
  for(const n of list){const s=n.nodeValue,f=document.createDocumentFragment();let last=0;RE.lastIndex=0;let m;
    while((m=RE.exec(s))){if(m.index>last)f.appendChild(document.createTextNode(s.slice(last,m.index)));
      const im=document.createElement('img');im.className='ei';im.alt='';im.draggable=false;im.src='art/ui/'+MAP[m[0]]+'.svg';f.appendChild(im);last=m.index+m[0].length}
    if(last<s.length)f.appendChild(document.createTextNode(s.slice(last).replace(/^️/,'')));n.parentNode.replaceChild(f,n)}}
/* обробляємо лише змінені вузли, а не весь документ (важливо для телефонів) */
let pend=new Set(),q=false;const run=()=>{q=false;const s=pend;pend=new Set();for(const n of s)if(n.isConnected)fix(n.nodeType===3?n.parentNode:n)};
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')pend.add(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)pend.add(n)})}
  if(pend.size&&!q){q=true;queueMicrotask(run)}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener('DOMContentLoaded',run);
})();
