const CACHE_VERSION = 'v1';
const CACHE_NAME = `ayto-solver-${CACHE_VERSION}`;
const APP_SHELL = ['./','./index.html','./style.css','./app.js','./manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
