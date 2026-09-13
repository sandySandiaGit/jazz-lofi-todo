
# Jazz v2 (alpha) and React 19 FullyLoFi Very Tiny To-Do App

A modern, fast, and offline-capable micro To-Do application built with **Jazz.tools v2 (alpha)**, **React 19**, **Vite**, and **Tailwind CSS**. 

The main purpose of this project was to experiment with **Jazz v2** 💙 and celebrate a deep passion for the **LoFi Philosophy** 💗. It demonstrates a true **Local-First architecture** paired with a custom **Cache-First Service Worker** to deliver **instant UI updates** and **seamless offline capabilities**.

<p align="center">
  <img src="https://github.com/user-attachments/assets/31aeb710-6f6d-48ee-8f6c-a1c60ba7012c" style="width: 320px; height: auto; object-fit: contain;" alt="App Mobile Preview" />
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

### 1. Online/Offline CRUD Operations
*Instant state mutations locally with asynchronous mesh queuing.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/bc1c5201-655f-4e47-a14a-a1e9024b0f9d" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

 **Local-First Offline & Sync Demo**
 This video demonstrates the core **Local-First** paradigm powered by **Jazz v2 (WASM & OPFS)**:
 * **Instant Offline CRUD:** Task operations (Create, Update, Delete) execute with zero latency against the local in-browser database:no internet connection required!
 * **Resilient Sync Mesh:** As soon as network connectivity is restored, local CRDT state changes automatically merge and sync across all connected devices in real time.

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

**CRDTs** are one of the core **Local-First** concepts powering **Jazz v2**:
A **CRDT (Conflict-free Replicated Data Type)**  allows multiple offline devices to edit data independently and automatically merge changes upon reconnection without a central server lock. 
* **Last-Write-Wins (LWW)**: For atomic fields like s.string(), Jazz resolves concurrent edits by preserving the update with the latest logical timestamp (LAST).
* **Multi-Field Merge**: Independent property updates (e.g., changing a title on Client A while toggling done on Client B) merge seamlessly without data loss.

### 4. Real-Time WebSocket Synchronization
*Live, encrypted data updates syncing across multiple application client tabs instantly.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/c6b88d45-1871-406b-8c70-f8917f590760" autoplay loop muted playsinline controls width="100%"></video>
    </td>
  </tr>
</table>

### 🎵 Music Credits
This project is built strictly for **educational, non-commercial portfolio purposes**. It features beautiful ambient tracks that provide the perfect focus atmosphere while coding !

**Video #1**
* **Track:** [R3DN1K - Ocean Eyes](https://www.youtube.com/watch?v=DIWySdVP1RA)
* **Artist:** [R3DN1K](https://www.youtube.com/channel/UCHc2HZiVCZ3U6syfz8isvTw)
* *Note: Fair Use educational fallback. Fully attributed to the artist.*

**Video #2**
* **Track:** [LARA Walker - Fading Sky](https://www.youtube.com/watch?v=m_tlT8zlgZQ)
* **Artist:** [LARAWalkerVEVO](https://www.youtube.com/@LARAWalkerVEVO)
* *Note: Fair Use educational fallback. Fully attributed to the artist.*

**Videos #3 and #4**
* **Track:** [Alan Walker Style x AVA - All Alone (Official Music Video)](https://www.youtube.com/watch?v=7bTZWNly9-0)
* **Artist:** [Audio Vibes Alliance (AVA)](https://www.youtube.com/channel/UCetEJ0BCDRAVog5IEb0LDdw)
* *Note: Featured in the app demonstration with explicit permission from the creator. Special thanks to Audio Vibes Alliance for their kindness and for letting me share their beautiful music ! 🎶🎵💙*
  
---

## Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS
* **Local-First Engine:** `jazz-tools` (v2 Alpha)
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
