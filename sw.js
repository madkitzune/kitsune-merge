// Offline cache: core files precached, everything else (art/, voice/) cached on first use.
const V='kitsune-v2.0.0';
const CORE=['./','index.html','style.css','temple.css','pets.css','scenes.css','ui.css','pets.js','scenes.js','game.js','icons.js','feel.js','profile.js','frags.js','monet.js','events.js','i18n.js','manifest.json','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// network-first (fresh code when online), cache fallback offline
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{
    if(r.ok&&(new URL(e.request.url).origin===location.origin||e.request.url.includes('fonts.g'))){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r
  }).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
