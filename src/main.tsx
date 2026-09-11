import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { JazzProvider, useLocalFirstAuth } from "jazz-tools/react";

function JazzAppWrapper() {

  const { secret, isLoading } = useLocalFirstAuth();
  const jazzKey = import.meta.env.VITE_JAZZ_APP_ID;

  if (isLoading || !secret) {
     // The 'key="loading"' attribute ensures React forces a clean DOM unmount/remount when state changes:
    return (
      <div key="loading" className="p-8 text-center text-sm text-slate-400" translate="no">
        Setting up local identity...
      </div>
    );
  }

  return (
    <JazzProvider
      key="app"
      config={{
        appId: jazzKey,
        serverUrl: "https://v2.sync.jazz.tools/",
        // See: https://jazz.tools/docs/getting-started/client-setup#jazz-framework-react
        /* Every client needs an appId and a secret for local-first auth. 
        Without secret, the client runs in anonymous mode and every write is rejected 
        with AnonymousWriteDeniedError. 
        Add a serverUrl to enable sync. 
        For the full auth matrix (anonymous, local-first, external JWT), see Authentication.*/
      
        // Pass the secret to authorize database reads and writes:
        secret: secret, // Keeps the cryptographic authentication valid
      }}
    >
      <App />
    </JazzProvider>
  );
}

// Anti-duplicate createRoot trick for Vite HMR (Hot Module Replacement):
// Directly infer the return type of createRoot:
// FIX: Store the root instance on the global window object during development hot-reloads
const container = document.getElementById('root')!;
const globalWindow = window as unknown as { _reactRoot?: ReturnType<typeof createRoot> };

if (!globalWindow._reactRoot) {
  // Create it the very first time and lock it into memory:
  globalWindow._reactRoot = createRoot(container);
}

globalWindow._reactRoot.render(
  <StrictMode>
    <JazzAppWrapper />
  </StrictMode>
);

// Service worker registration:
// Register the Service Worker in production environments only.
// Note: The 'import.meta.env.PROD' check prevents the Service Worker from caching 
// the Vite local development server (which would break live hot-reloading/HMR updates).
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  const registerSW = () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[SW] Registered successfully at scope:", reg.scope))
      .catch((err) => console.error("[SW] Registration error:", err));
  };

  // If the window has already loaded, register immediately. Otherwise, wait for the load event:
  if (document.readyState === "complete") {
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
}



