

# Jazz v2 (alpha) and React 19 FullyLoFi Very Tiny To-Do App

A modern, fast, and offline-capable micro To-Do application built with **Jazz.tools v2 (alpha 56)**, **React 19**, **Vite**, and **Tailwind CSS**. 

The main purpose of this project was to experiment with **Jazz v2** 💙 and celebrate a deep passion for the **LoFi Philosophy** 💗. It demonstrates a true **Local-First architecture** paired with a custom **Cache-First Service Worker** to deliver **instant UI updates** and **seamless offline capabilities**.

<p align="center">
  <img src="https://github.com/user-attachments/assets/31aeb710-6f6d-48ee-8f6c-a1c60ba7012c" style="width: 320px; height: auto; object-fit: contain;" alt="App Mobile Preview" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img width="276" height="600" alt="offline-mobile3" src="https://github.com/user-attachments/assets/cd808507-a36f-4d5f-aaf0-994a5a92ba30" />
</p>

---

## Features

* **Local-First & Encrypted Storage:** Uses Jazz v2 with OPFS (Origin Private File System) and WebAssembly (WASM) for high-performance, encrypted local-first data persistence.
* **100% Offline Capable:** Custom Cache-First Service Worker ensures the application loads instantly and works completely without an internet connection.
* **Automatic Mesh Synchronization:** Background real-time sync with `cloud.jazz.tools` as soon as network connectivity is restored.
* **Installable PWA:** Includes a web app manifest configured for mobile and desktop PWA installation.

>**Note:** This project was intentionally built using **Jazz v2 (Alpha)** to explore the cutting edge of Local-First web development, despite potential API changes before the final release ! ;)

---

## Technical Demonstrations & Features Tour

Explore these short screen recordings to see the local-first engine and custom service worker in action:

### 1. Online/Offline CRUD & Real-Time Sync
*Instant state mutations locally with asynchronous mesh queuing, powered by Jazz v2 (WASM & OPFS).*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/bc1c5201-655f-4e47-a14a-a1e9024b0f9d" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

* **Zero-Latency Offline CRUD:** Task operations (Create, Update, Delete) execute instantly against the local in-browser database with zero network dependency.
* **Resilient Sync Mesh:** When connectivity is restored, local **CRDT (Conflict-free Replicated Data Type)** state changes automatically merge and sync across connected devices in real time.

### 2. Lie-Fi Detection & Network Resilience
*How the custom Service Worker catches slow/faulty connections and gracefully activates the offline layer.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/9413b8ca-6c0d-45ed-b5b2-c92bb78873a9" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

### 3. Offline Conflict Resolution (CRDT & LWW)
*Automatic resolution of concurrent offline edits across isolated clients using Last-Write-Wins (LWW) CRDT logic upon reconnection.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/2b28d9a9-45bb-483b-8b77-31471f02c0c3" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

* **CRDT Merge Engine:** allows multiple offline devices to edit data independently and automatically merge changes upon reconnection without a central server lock.
* **Last-Write-Wins (LWW):** for atomic scalar fields like s.string(), Jazz resolves concurrent edits by preserving the update with the latest timestamp ("LAST").
* **Multi-Field Merge:** independent property updates (e.g., editing a title on Client A while toggling `done` on Client B) merge seamlessly without data loss.

### 4. Real-Time WebSocket Synchronization
*Live, encrypted data updates syncing across multiple application client tabs instantly.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/c6b88d45-1871-406b-8c70-f8917f590760" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

### The Paradigm Shift: The Network Is No Longer the Boss

While the demo videos above use DevTools toggles and Lie-Fi simulation to prove resilience, **the true magic of Jazz v2 is that the application doesn't care about network status at all !**

* **Always-Local Execution:** The app operates 100% against the in-browser local database (OPFS/WASM) with zero latency.
* **Network as a Silent Sync Layer:** Connectivity is no longer a prerequisite for user actions : the network is demoted to a simple background transport layer that replicates CRDT state and enables real-time collaboration when available.
* **No `isOnline` Hacks:** No blocking loading spinners, no fragile state checks, and no dropped data. The app just works, always !

### 🎵 Music Credits
This project is built strictly for **educational, non-commercial portfolio purposes**. It features beautiful ambient tracks that provide the perfect focus atmosphere while coding !

**Video #1**
* **Track:** [R3DN1K - Ocean Eyes](https://www.youtube.com/watch?v=DIWySdVP1RA)
* **Artist:** [R3DN1K](https://www.youtube.com/channel/UCHc2HZiVCZ3U6syfz8isvTw)
* *Note: Non-commercial educational showcase.*

**Video #2**
* **Track:** [LARA Walker - Fading Sky](https://www.youtube.com/watch?v=m_tlT8zlgZQ)
* **Artist:** [LARAWalkerVEVO](https://www.youtube.com/@LARAWalkerVEVO)
* *Note: Non-commercial educational showcase.*

**Videos #3 and #4**
* **Track:** [Alan Walker Style x AVA - All Alone (Official Music Video)](https://www.youtube.com/watch?v=7bTZWNly9-0)
* **Artist:** [Audio Vibes Alliance (AVA)](https://www.youtube.com/channel/UCetEJ0BCDRAVog5IEb0LDdw)
* *Note: Featured in the app demonstration with explicit permission from the creator. Special thanks to Audio Vibes Alliance for their kindness and for letting me share their beautiful music ! 🎶🎵💙*
  
---

## Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS
* **Local-First Engine:** `jazz-tools` (Jazz 2.0.0-alpha.56)
* **Storage:** OPFS / WebAssembly
* **PWA:** Custom Cache-First Service Worker
* **Deployment:** Vercel

---

## Getting started

1. **Clone the repository:**
    ```bash
    git clone https://github.com/sandySandiaGit/jazz-lofi-todo.git
    cd jazz-lofi-todo
    ```
   
2. **Install dependencies:**
   ```bash
   pnpm install
    ```

3. **Configure environment variables:**
Create a `.env` file in the root directory based on `.env.example`.

---

## Running the tiny App

**Run Local Development (with Hot-Reloading):**
```bash
pnpm dev
 ```
**Run Production Preview (for Service Worker & Offline Testing):**
```bash
pnpm build
pnpm preview
 ```
