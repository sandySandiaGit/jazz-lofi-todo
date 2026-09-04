# Jazz v2 (alpha) and React 19 Fully Local-First To-Do App

A modern, fast, and offline-capable Todo application built with **Jazz.tools v2 (alpha)**, **React 19**, **Vite** and **Tailwind CSS**. 

This project demonstrates a true **Local-First architecture** paired with a custom Cache-First Service Worker to deliver instant UI updates and seamless offline capabilities.

---

## Features

* **Local-First & Encrypted Storage:** Uses Jazz v2 with OPFS (Origin Private File System) and WebAssembly (WASM) for high-performance, encrypted local-first data persistence.
* **100% Offline Capable:** Custom Cache-First Service Worker ensures the application loads instantly and works completely without an internet connection.
* **Automatic Mesh Synchronization:** Background real-time sync with `cloud.jazz.tools` as soon as network connectivity is restored.
* **Installable PWA:** Includes a web app manifest configured for mobile and desktop PWA installation.

>**Note:** This project was intentionally built using **Jazz v2 (Alpha)** to explore the cutting edge of Local-First web development, despite potential API changes before the final release!

---

## Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS
* **Local-First Engine:** `jazz-tools` (v2 Alpha)
* **Storage:** OPFS / WebAssembly
* **PWA:** Custom Cache-First Service Worker
* **Deployment:** Vercel

---

## Getting Started

1. **Clone the repository:**
   ```bash
   
   git clone [https://github.com/sandySandiaGit/jazz-lofi-todo.git](https://github.com/sandySandiaGit/jazz-lofi-todo.git)
   cd jazz-lofi-todo
 
 
2. **Install dependencies:**
   ```bash
   pnpm install

3. **Configure environment variables:**
**Create a .env file in the root directory**
See .env.example file

4. **Run the development server:**
   ```bash
   pnpm dev

5. **Build and Preview (Offline Testing):**
   ```bash
    pnpm build
    pnpm preview
   