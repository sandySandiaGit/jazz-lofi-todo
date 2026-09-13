const VERSION = "66"; // Change it to force a hard cache update!
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

      // 1b. DEEP VITE PARSING & WASM FIX: Recursive scan for dynamic imports & WASM modules
      try {
        const indexResp = await fetch("/index.html");
        const html = await indexResp.text();
        const assetsToCache = new Set();

        // Helper to safely format paths without double slashes:
        const normalizePath = (rawPath) => {
          if (!rawPath) return null;
          let cleaned = rawPath.replace(/['"`]/g, "").replace(/^\.\//, "").replace(/^\//, "");
          if (!cleaned.startsWith("assets/")) {
            cleaned = "assets/" + cleaned;
          }
          return "/" + cleaned;
        };

        // Find direct asset links in index.html:
        const htmlRegex = /(?:src|href)="([^"]+)"/g;
        let match;
        while ((match = htmlRegex.exec(html)) !== null) {
          const path = normalizePath(match[1]);
          if (path && path.includes("-")) assetsToCache.add(path);
        }

        // Recursive scan queue to inspect all discovered JS bundles:
        const queue = Array.from(assetsToCache);
        const processed = new Set();

        while (queue.length > 0) {
          const assetUrl = queue.shift();
          if (processed.has(assetUrl)) continue;
          processed.add(assetUrl);

          if (assetUrl.endsWith(".js")) {
            try {
              const jsResp = await fetch(assetUrl);
              if (!jsResp.ok) continue;
              const jsText = await jsResp.text();

              // 1. Match strings ending in .js, .wasm, or .css inside quotes or backticks:
              const jsChunkRegex = /(?:["'`])([^"'\`\s?#]+\.(?:js|wasm|css))(?:["'`])/g;
              let jsMatch;
              while ((jsMatch = jsChunkRegex.exec(jsText)) !== null) {
                const chunkPath = normalizePath(jsMatch[1]);
                if (chunkPath && chunkPath.includes("-") && !assetsToCache.has(chunkPath)) {
                  console.log("[SW Scan] Discovered chunk:", chunkPath);
                  assetsToCache.add(chunkPath);
                  if (chunkPath.endsWith(".js")) queue.push(chunkPath);
                }
              }

              // 2. Fallback scan specifically targeting jazz/wasm references:
              const jazzWasmRegex = /(?:assets\/)?(jazz[a-zA-Z0-9_-]*\.(?:js|wasm))/gi;
              let wasmMatch;
              while ((wasmMatch = jazzWasmRegex.exec(jsText)) !== null) {
                const wasmPath = normalizePath(wasmMatch[1]);
                if (wasmPath && !assetsToCache.has(wasmPath)) {
                  console.log("[SW Scan] Explicit WASM target found:", wasmPath);
                  assetsToCache.add(wasmPath);
                }
              }
            } catch (e) {
              console.warn("[SW] Deep scan failed for bundle:", assetUrl, e);
            }
          }
        }

        // Cache all discovered static assets and WASM modules:
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
