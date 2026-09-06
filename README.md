# Jazz v2 (alpha) and React 19 FullyLoFi Very Tiny To-Do App

A modern, fast, and offline-capable micro To-Do application built with **Jazz.tools v2 (alpha)**, **React 19**, **Vite**, and **Tailwind CSS**. 

The main purpose of this project was to experiment with **Jazz v2** and celebrate a deep passion for the **LoFi Philosophy**. It demonstrates a true **Local-First architecture** paired with a custom Cache-First Service Worker to deliver instant UI updates and seamless offline capabilities.

<img width="536" height="769" alt="2" src="https://github.com/user-attachments/assets/a77299f1-29d0-4454-b9d1-5f95f7099695" />

---

## Features

* **Local-First & Encrypted Storage:** Uses Jazz v2 with OPFS (Origin Private File System) and WebAssembly (WASM) for high-performance, encrypted local-first data persistence.
* **100% Offline Capable:** Custom Cache-First Service Worker ensures the application loads instantly and works completely without an internet connection.
* **Automatic Mesh Synchronization:** Background real-time sync with `cloud.jazz.tools` as soon as network connectivity is restored.
* **Installable PWA:** Includes a web app manifest configured for mobile and desktop PWA installation.

>**Note:** This project was intentionally built using **Jazz v2 (Alpha)** to explore the cutting edge of Local-First web development, despite potential changes before the final release ! ;)

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




   
