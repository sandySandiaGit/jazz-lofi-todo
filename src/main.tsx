import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAccountManager } from 'jazz-tools'
import App from './App.tsx'
import './index.css'

// Créer le gestionnaire de compte EN DEHORS du composant React:
// docu: "Prepare the account outside the context with createAccountManager."
const appId = "b993414f-b59d-4db0-9ada-14929d90cf36"
const serverUrl = "https://v2.sync.jazz.tools/"

// 1. Initialiser le gestionnaire:
const accounts = await createAccountManager({ appId, serverUrl })

// 2. Ajouter 'await' pour résoudre les promesses et obtenir l'objet AccountHandle:
// Récupérer le compte connecté ou en créer un local-first:
const account = (accounts.getLoggedIn()) ?? (accounts.createLocalFirst())

console.log("[Jazz] Account loaded on startup!!!!!!!!!!!!!:", account?.id);

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