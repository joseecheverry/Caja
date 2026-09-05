const CACHE = 'caja-v1';
const ARCHIVOS = ['./', './index.html', './icono-192.png', './manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; })
                        .map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

// La app se sirve desde el cache; las llamadas a Sheets o Supabase van directo a la red.
self.addEventListener('fetch', function(e){
  const u = new URL(e.request.url);
  if(u.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        const copia = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        return res;
      });
    }).catch(function(){ return caches.match('./index.html'); })
  );
});
