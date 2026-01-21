
const CACHE_NAME = 'mathai-mentor-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Unbounded:wght@400;700;900&family=Montserrat:wght@400;700;900&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Кэш ашылды');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Кэште болса соны қайтару, болмаса желіден алу
      return response || fetch(event.request).then(fetchResponse => {
        // Тек сәтті жауаптарды кэштеу (тек өз доменіміз үшін немесе маңызды ресурстар үшін)
        if (event.request.url.startsWith('http')) {
             return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
             });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Егер желі де, кэш те жоқ болса (тек HTML үшін)
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
