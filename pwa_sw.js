const allowedDomain = ["cdn.code.so","www.tmp.link","res.cntmp.link","www.ttttt.link","static-tmplink.vx-cdn.com"];
const resSet = "tmplink-static-1601";
const assets = [
  '/',
];

self.addEventListener("install", installEvent => {
  self.skipWaiting();
  installEvent.waitUntil(
    caches.open(resSet).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== resSet) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  const url = new URL(event.request.url);
  const domain = url.hostname;
  const path = url.pathname; 
  const cacheKey = domain + path; 

  if (isAllowDomain(domain)) {
    // Skip caching for HTML, JS, CSS, and JSON files
    if (shouldSkipCache(path)) {
      event.respondWith(fetch(event.request));
      return;
    }

    event.respondWith(
      caches.match(cacheKey).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            caches.open(resSet).then(cache => {
              cache.put(cacheKey, response);
            });
          }
          return response.clone();
        });
      })
    );
  }
})


function isAllowDomain(domain){
  for (let i = 0; i < allowedDomain.length; i++) {
    if (allowedDomain[i] === domain) {
      return true;
    }
  }
  return false;
}

function shouldSkipCache(path) {
  const noCacheExtensions = ['.html', '.js', '.css', '.json'];
  return noCacheExtensions.some(ext => path.toLowerCase().endsWith(ext));
}
