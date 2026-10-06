import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAccountManager } from 'jazz-tools'
import App from './App.tsx'
import './index.css'


// 1. CONFIGURATION & ENVIRONMENT
// Securely fetch the app ID from Vite's environment variables:
const appId = import.meta.env.VITE_JAZZ_APP_ID;
const serverUrl = "https://v2.sync.jazz.tools/"


// 2. INITIALIZE THE ACCOUNT MANAGER (Asynchronous Step)
// As recommended ("Prepare the account outside the context with createAccountManager"),
// we instantiate the manager OUTSIDE the React component tree.
// Since 'main.tsx' acts as an ES Module, we can leverage native TOP-LEVEL AWAIT here.
// This safely pauses the entry-point execution to resolve the Promise<AccountManager>,
// ensuring the UI doesn't mount until Jazz's local infrastructure is fully ready.
// Under the hood, Jazz is performing essential initialization tasks:
//   - Initializing the local client-side database (IndexedDB)
//   - Loading cryptographic keys for the application (appId)
//   - Verifying if a secure session or authentication token already exists on this device:
const accounts = await createAccountManager({ appId, serverUrl })


// 3. RESOLVE THE ACTIVE ACCOUNT HANDLE (Synchronous Step)
// This step retrieves the logged-in account or instantly creates a local-first anonymous one.
// No 'await' is required here because the previous initialization step already loaded 
// everything into memory (RAM).
//   - .getLoggedIn() instantly checks RAM for an active session.
//   - .createLocalFirst() instantly spins up a crypto-identity in the browser.
// Because Jazz is fundamentally Local-First, creating an account does NOT block the UI 
// waiting for a server response; remote peer synchronization happens asynchronously in the background !
const account = (accounts.getLoggedIn()) ?? (accounts.createLocalFirst())

//console.log("[Jazz] Account loaded on startup:", account?.id);

// 4. RENDER THE APPLICATION
// The UI mounts only after the local-first state is completely ready:
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