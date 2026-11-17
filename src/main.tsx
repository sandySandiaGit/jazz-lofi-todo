import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAccountManager } from 'jazz-tools'
import App from './App.tsx'
import './index.css'

const appId = import.meta.env.VITE_JAZZ_APP_ID;

const accounts = await createAccountManager({
  appId,
});

// Restore the existing local-first account from localStorage, or create a new one:
// Restaure le compte local-first existant dans localStorage, ou en crée un nouveau:
accounts.getLoggedIn() ?? accounts.createLocalFirst();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App  />
  </StrictMode>
)

// Service worker registration:
// Register the Service Worker in production environments only.
// Note: The 'import.meta.env.PROD' check prevents the Service Worker from caching 
// the Vite local development server (which would break live hot-reloading/HMR updates).
if ("serviceWorker" in navigator && import.meta.env.PROD) {

  //let refreshing = false;
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