const VERSION = "60"; // Change it to force a hard cache update!
const CACHE_NAME = "V" + VERSION;
const OFFLINE_URL = "/offline.html";

// Only immutable root files are precached at startup:
const STATIC_ASSETS = [
  OFFLINE_URL,
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-128.png", 
  "/icon-512.png"
];

// =======================================================================================================
// 1. INSTALLATION - Precaching base files + Vite hashed assets during installation
// =======================================================================================================
self.addEventListener("install", (event) => {

  console.log("[SW] Installing version:", CACHE_NAME);

  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1a. Precache static assets (prevents requiring an initial online reload)
      for (const url of STATIC_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("[SW] Initial precache failed for:", url, err);
        }
      }

      // 1b. VITE TRICK: Parse index.html to collect compiled JS/CSS assets
      try {
        const indexResp = await fetch("/index.html");
        const html = await indexResp.text();
        const regex = /(?:src|href)="(\/assets\/[^"]+)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          console.log("[SW] Auto-precaching Vite asset:", match[1]);
          await cache.add(match[1]);
        }
      } catch (err) {
        console.warn("[SW] Failed to parse Vite assets from index.html:", err);
      }
    })()
  );
});

// ===========================================================
// 2. ACTIVATION AND CLEANUP OF OLD CACHES
// ===========================================================
self.addEventListener("activate", (event) => {

  console.log("[SW] Activating version:", CACHE_NAME);

  event.waitUntil(
    (async () => {
     
      // Retrieve all existing cache names:
      const cacheNames = await caches.keys();

      // Delete all legacy caches except the current one (CACHE_NAME):
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) 
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })()
  );
  self.clients.claim();
});

// ================================================================
// 3. CACHE-FIRST STRATEGY with Network Fallback & Runtime Caching
// ================================================================
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // ------------------------------
  // IGNORE VITE DEVELOPMENT FILES:
  // ------------------------------
  if (url.pathname.startsWith("/@") || url.pathname.startsWith("/src/") || url.search.includes("t=")) {
    return; // Stop the SW here since the browser will handle it natively!
  }

  if (url.origin !== location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // STEP 1: Search the cache for the requested resource, ignoring strict URL query parameters
      const cachedResponse = 
        await cache.match(event.request, { ignoreSearch: true, ignoreVary: true }) || 
        await cache.match(event.request.url, { ignoreSearch: true, ignoreVary: true });

      if (cachedResponse) return cachedResponse;
      
      // STEP 2: For an SPA, if navigating to the root or a route, look for /index.html
      if (event.request.mode === "navigate") {
        const indexResponse = await cache.match("/index.html") || await cache.match("/");
        if (indexResponse) return indexResponse;
      }

      // STEP 3: Otherwise, attempt to fetch from the network
      try {
        const networkResponse = await fetch(event.request);
        
        // FIX: Only cache successful responses, and normalize the key to ignore changing query strings
        if (networkResponse.ok) {
          // We cache by the clean pathname URL to match our ignoreSearch configuration rules
          await cache.put(url.pathname, networkResponse.clone());
        }
        return networkResponse;

      } catch (error) {

        console.warn("[SW] Offline, network unreachable for:", url.pathname);

        // STEP 4: In case of network failure during HTML navigation
        if (event.request.mode === "navigate") {
          const offlinePage = (await cache.match(OFFLINE_URL)) || (await cache.match("/index.html"));
          if (offlinePage) return offlinePage;
        }

        // STEP 5: Return a clean HTTP response with COOP/COEP headers 
        // to fix the Web Worker issue instead of throwing an error:
        return new Response("Resource unavailable offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ 
                "Content-Type": "text/plain",
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "credentialless"
            }),
        });
      }
    })()
  );
});
