import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAccountManager } from 'jazz-tools'
import App from './App.tsx'
import './index.css'

const appId = import.meta.env.VITE_JAZZ_APP_ID;

const serverUrl = "https://v2.sync.jazz.tools/"

const accounts = await createAccountManager({ appId, serverUrl })

const account = (accounts.getLoggedIn()) ?? (accounts.createLocalFirst())

//console.log("[Jazz] Account loaded on startup:", account?.id);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App account={account} />
  </StrictMode>
)

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