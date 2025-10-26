const CACHE_VERSION='v10';const CACHE_NAME=`ayto-solver-${CACHE_VERSION}`;
const APP_SHELL=['/Ayto/','/Ayto/index.html','/Ayto/style.css','/Ayto/app.js','/Ayto/manifest.json','/Ayto/icons/icon-192.png','/Ayto/icons/icon-512.png','/Ayto/icons/ayto-logo.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{const req=e.request;const html=req.headers.get('accept')?.includes('text/html');if(html){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE_NAME).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match('/Ayto/index.html')));return;}
e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const cp=n.clone();caches.open(CACHE_NAME).then(c=>c.put(req,cp));return n;})));});