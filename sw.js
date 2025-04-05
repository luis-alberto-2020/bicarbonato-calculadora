const CACHE_NAME = 'bicarb-calculator-v1'; // Cambiar versión si actualizas archivos
const urlsToCache = [
  '/', // Cachea la raíz
  '/index.html',
  '/style.css',
  '/calculator.js',
  // Añadir aquí las rutas a los íconos si quieres cachearlos también
  '/icons/icon-192x192.png' // Ejemplo
];

// Evento 'install': Se dispara cuando el SW se instala por primera vez.
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalando...');
  // Espera hasta que el cache esté listo
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Cache abierto, añadiendo archivos base...');
        // Añade todos los archivos definidos al cache
        return cache.addAll(urlsToCache);
      })
      .then(() => {
         console.log('[ServiceWorker] Archivos base cacheados correctamente.');
         // Forzar la activación del nuevo SW inmediatamente (opcional pero útil para desarrollo)
         return self.skipWaiting();
      })
      .catch(error => {
          console.error('[ServiceWorker] Fallo al cachear archivos base:', error);
      })
  );
});

// Evento 'activate': Se dispara después de 'install', limpia caches viejos.
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Borrando cache viejo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
        console.log('[ServiceWorker] Activado y listo para controlar clientes.');
        // Tomar control de las páginas abiertas inmediatamente
        return self.clients.claim();
    })
  );
});


// Evento 'fetch': Se dispara cada vez que la página pide un recurso (HTML, CSS, JS, imagen...).
self.addEventListener('fetch', event => {
  // Estrategia: Cache First (primero busca en cache, si no, va a la red)
  event.respondWith(
    caches.match(event.request) // Intenta encontrar el recurso en el cache
      .then(response => {
        // Si se encuentra en cache, lo devuelve
        if (response) {
          // console.log('[ServiceWorker] Sirviendo desde cache:', event.request.url);
          return response;
        }
        // Si no está en cache, va a la red
        // console.log('[ServiceWorker] No en cache, buscando en red:', event.request.url);
        return fetch(event.request);
      })
      .catch(error => {
          // Manejo básico de error si falla el cache y la red
          console.error('[ServiceWorker] Error en fetch:', error);
          // Podrías devolver una página offline básica aquí si quieres
      })
  );
});