const CACHE_STATIC_NAME    = 'demo-wpa-static-v0.1';
const CACHE_DYNAMIC_NAME   = 'demo-wpa-dynamic-v0.1';
const CACHE_INMUTABLE_NAME = 'demo-wpa-inmutable-v0.1';
const MAX_CACHE_SIZE = 10;

const ASSETS_STATIC = [
    '/',
    '/index.html',
    '/img/main.png',
    '/css/styles.css',
    '/js/app.js',
    '/pages/fallback.html'
];

const ASSETS_INMUTABLE = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.slim.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js',
    'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js'
];

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
}

self.addEventListener('install', e => {
    const cachePromise = caches.open(CACHE_STATIC_NAME)
        .then(cache => cache.addAll(ASSETS_STATIC));
    
    const cacheInmutablePromise = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => cache.addAll(ASSETS_INMUTABLE));

    e.waitUntil(Promise.all([cachePromise, cacheInmutablePromise]));

    console.log('serviceWorker has been installed');
});

self.addEventListener('activate', e => { 
    e.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(keys
                    .filter(key => key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME && key !== CACHE_INMUTABLE_NAME) 
                    .map(key => caches.delete(key))
                );
            })
    );
    console.log('serviceWorker has been activated');
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then(cacheRes => {
                return cacheRes || fetch(e.request).then(fetchRes => {
                    return caches.open(CACHE_DYNAMIC_NAME)
                        .then(cache => {
                            cache.put(e.request.url, fetchRes.clone());
                            limitCacheSize(CACHE_DYNAMIC_NAME, MAX_CACHE_SIZE)
                            return fetchRes;
                        });
                });
            }).catch(() => {
                if(e.request.url.indexOf('.html') > -1){
                    return caches.match('/pages/fallback.html')
                }
            })
    );
});