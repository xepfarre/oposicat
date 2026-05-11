// Service Worker bàsic per a OposiCAT (Estratègia Network-First)
const CACHE_NAME = 'oposicat-v2'; // Canviem versió per forçar actualització

self.addEventListener('install', (event) => {
  // Salta l'espera per activar-se immediatament
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Esborra caches antigues
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Estratègia: Network First
  // Intentem anar a buscar a la xarxa, si falla anem al cau.
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
