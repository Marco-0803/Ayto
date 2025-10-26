const CACHE_VERSION = 'v1';
const CACHE_NAME = `ayto-solver-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/ayto-logo.jpg'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  const req=e.request;
  const isHTML=req.headers.get('accept')?.includes('text/html');
  if(isHTML){
    e.respondWith(fetch(req).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(req).then(r=>r||fetch(req).then(resp=>{
      const cp=resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(req,cp));
      return resp;
    }))
  );
});
