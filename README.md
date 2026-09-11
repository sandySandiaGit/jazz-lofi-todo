
# Jazz v2 (alpha) and React 19 FullyLoFi Very Tiny To-Do App

A modern, fast, and offline-capable micro To-Do application built with **Jazz.tools v2 (alpha)**, **React 19**, **Vite**, and **Tailwind CSS**. 

The main purpose of this project was to experiment with **Jazz v2** and celebrate a deep passion for the **LoFi Philosophy**. It demonstrates a true **Local-First architecture** paired with a custom Cache-First Service Worker to deliver instant UI updates and seamless offline capabilities.

<p align="center">
  <img src="https://github.com/user-attachments/assets/82f3fd6a-9e43-4da6-8f45-8f62097d8464" style="width: 320px; height: auto; object-fit: contain;" alt="App Mobile Preview" />
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

<!--<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/bc1c5201-655f-4e47-a14a-a1e9024b0f9d" controls style="max-width: 100%;"></video>
    </td>
  </tr>
</table>-->

> [!NOTE]
> **Local-First Offline & Sync Demo**
> 
> This video demonstrates the core **Local-First** paradigm powered by **Jazz v2 (WASM & OPFS)**:
> 
> * **Instant Offline CRUD:** Task operations (Create, Update, Delete) execute with zero latency against the local in-browser database:no internet connection required!
> * **Resilient Sync Mesh:** As soon as network connectivity is restored, local CRDT state changes automatically merge and sync across all connected devices in real time.

### 2. Lie-Fi Detection & Network Resilience
*How the custom Service Worker catches slow/faulty connections and gracefully activates the offline layer.*

<!--<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/9413b8ca-6c0d-45ed-b5b2-c92bb78873a9" controls style="max-width: 100%;"></video>
    </td>
  </tr>
</table>-->

### 3. Real-Time WebSocket Synchronization
*Live, encrypted data updates syncing across multiple application client tabs instantly.*

<table>
  <tr>
    <td width="550">
      <video src="https://github.com/user-attachments/assets/c6b88d45-1871-406b-8c70-f8917f590760" controls style="max-width: 100%;"></video>
    </td>
  </tr>
</table>

### 🎵 Music Credits
* **Track:** [Alan Walker Style x AVA - All Alone (Official Music Video)](https://www.youtube.com/watch?v=7bTZWNly9-0&list=RDDIWySdVP1RA&index=2)
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

## Run Local Development (with Hot-Reloading)

```bash
pnpm dev
 ```
---

## Run Production Preview (for Service Worker & Offline Testing)

```bash
pnpm build
pnpm preview
 ```




   
