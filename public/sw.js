const VERSION = "63"; // Change it to force a hard cache update!
const CACHE_NAME = "V" + VERSION;
const OFFLINE_URL = "/offline.html";

// Only immutable root files are precached at startup (in 1a)
// (Static root files vs dynamically hashed assets handled below in 1b):
const STATIC_ASSETS = [
  OFFLINE_URL,
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-128.png", 
  "/icon-512.png"
];

// =================================================================================
// 1. INSTALLATION - Precaching base files + Vite hashed assets during installation
// =================================================================================
self.addEventListener("install", (event) => {

  console.log("[SW] Installing version:", CACHE_NAME);

  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1a. Precache static assets (prevents requiring an initial online reload):
      for (const url of STATIC_ASSETS) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn("[SW] Initial precache failed for:", url, err);
        }
      }

      // 1b. DEEP VITE PARSING & WASM FIX: Recursive scan for dynamic imports
      // Deep Precache scan: Uses a queue to recursively discover nested chunks and WASM modules:
      try {
        const indexResp = await fetch("/index.html");
        const html = await indexResp.text();
        const assetsToCache = new Set();

        // Find direct asset links in index.html:
        const htmlRegex = /(?:src|href)="(\/assets\/[^"]+)"/g;
        let match;
        while ((match = htmlRegex.exec(html)) !== null) {
          assetsToCache.add(match[1]);
        }

        // Recursive scan queue to inspect all 
        // discovered JS bundles (Level 1, Level 2, Level 3...):
        const queue = Array.from(assetsToCache);
        const processed = new Set();

        while (queue.length > 0) {
          const assetUrl = queue.shift();
          if (processed.has(assetUrl)) continue;
          processed.add(assetUrl);

          if (assetUrl.endsWith(".js")) {
            try {
              const jsResp = await fetch(assetUrl);
              const jsText = await jsResp.text();

              // Matches relative, absolute, or Vite chunk import patterns 
              // (supports .js, .wasm, .css):
              const jsChunkRegex = /(?:"|')((?:\.\/|\/)?(?:assets\/)?[a-zA-Z0-9_.-]+\.(?:js|wasm|css))(?:["'])/g;
              let jsMatch;
              while ((jsMatch = jsChunkRegex.exec(jsText)) !== null) {
                // Normalize relative paths (ex: ./jazz_wasm-...) into absolute URLs 
                // (ex: /assets/jazz_wasm-Je1OU6Ey.js) prior to precaching:
                let chunkPath = jsMatch[1].replace(/^\.\//, ""); // Strip leading "./"
                if (!chunkPath.startsWith("/")) chunkPath = "/" + chunkPath;
                if (!chunkPath.startsWith("/assets/")) chunkPath = "/assets/" + chunkPath;

                // Precache hashed Vite chunks and enqueue new JS files for further deep scanning:
                if (chunkPath.includes("-") && !assetsToCache.has(chunkPath)) {
                  assetsToCache.add(chunkPath);
                  if (chunkPath.endsWith(".js")) {
                    queue.push(chunkPath);
                  }
                }
              }
            } catch (e) {
              console.warn("[SW] Deep scan failed for bundle:", assetUrl, e);
            }
          }
        }

        // Add all discovered static assets and WASM modules to cache:
        for (const asset of assetsToCache) {
          console.log("[SW] Auto-precaching asset:", asset);
          await cache.add(asset);
        }
      } catch (err) {
        console.warn("[SW] Failed to parse assets:", err);
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
