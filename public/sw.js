const CACHE_NAME = "jazz-pwa-v20";
const STATIC_SHELL = ["/", "/index.html"];

// 1. INSTALL : Precache uniquement le shell de l'application (sans scan récursif fragile):
// 1. INSTALL : Precache app shell only (no fragile recursive scan):
self.addEventListener("install", (event) => {
  console.log("[SW] Installing version:", CACHE_NAME);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of STATIC_SHELL) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("[SW] Shell precache skipped for:", url, err);
        }
      }
      await self.skipWaiting();
    })()
  );
});

// 2. ACTIVATE : Suppression des anciens caches et prise de contrôle immédiate:
// 2. ACTIVATE : Delete legacy caches and claim clients immediately:
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating version:", CACHE_NAME);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// 3. FETCH : Stratégies différenciées (WASM / Assets vs Navigation):
// 3. FETCH : Differentiated strategies (WASM / Assets vs Navigation):
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // On n'intercepte que les requêtes GET sur notre propre origine:
  // Intercept GET requests on own origin only:
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // STRATÉGIE A : Fichiers WASM, JS et CSS dans /assets/ -> Cache-First avec fallback Réseau:
  // STRATEGY A : WASM, JS, and CSS files in /assets/ -> Cache-First with Network fallback:
  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".wasm")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        // 1. Si le fichier WASM ou JS est déjà en cache, on le sert immédiatement:
        // 1. If WASM or JS file is already cached, serve it immediately:
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Sinon, on va le chercher sur le réseau et on le met en cache pour la suite:
        // 2. Otherwise, fetch from network and store in cache for next time:
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // On met en cache en arrière-plan sans bloquer ni lever d'erreur non capturée(via catch())
            // Background cache update without blocking or throwing unhandled errors (via catch())
            cache.put(request, networkResponse.clone()).catch((err) => {
              console.warn("[SW] Cache put skipped:", err);
            });
          }
          return networkResponse;
        } catch (err) {
          console.error("[SW] Network fetch failed for asset:", request.url, err);
          return Response.error();
        }
      })()
    );
    return;
  }

  // STRATÉGIE B : Navigation HTML & API -> Network-First avec fallback Cache:
  // STRATEGY B : HTML Navigation & API -> Network-First with Cache fallback
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone()).catch((err) => {
            console.warn("[SW] Cache put skipped:", err);
          });
        }
        return networkResponse;
      } catch (err) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        if (request.mode === "navigate") {
          return (await caches.match("/index.html")) || Response.error();
        }
        return Response.error();
      }
    })()
  );
});