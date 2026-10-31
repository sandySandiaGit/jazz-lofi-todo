

# Jazz v2 (alpha) and React 19 FullyLoFi Very Tiny To-Do App

A modern, fast, and offline-capable micro To-Do application built with **Jazz.tools v2 (alpha 59)**, **React 19**, **Vite**, and **Tailwind CSS**. 

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

Explore these short screen recordings to see the Local-First engine and custom service worker in action:

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
* **Local-First Engine:** `jazz-tools` (Jazz 2.0.0-alpha.59)
* **Storage:** IndexedDB / OPFS / WebAssembly
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
> 💡 **Note on Testing Offline Sync (`alpha.59`):**
> Browser DevTools network emulation (such as *Network > Offline* or *Application > Service Workers > Offline checkbox*) may not fully intercept background WebSocket channels or local inter-tab worker sync used by Jazz `alpha.59`.
> 
> To properly test offline mode and multi-device synchronization resilience, please test by temporarily **disabling your device's Wi-Fi / Ethernet connection** or switching to **Airplane Mode**.

---

## Moving Towards "Pure Local-First"💗 

In his talk [*What if useState() was your Database?*](https://www.youtube.com/watch?v=kP_ItV3Ikc0), **Anselm Eickhoff** (creator of Jazz) tackles traditional backend complexity and network glue code, asking a simple
question: what if our database was as seamless and reactive as local UI state? 

The first part of this section illustrates how Jazz natively solves this by eliminating API glue code and `useState` duplication when reading business data (`useAll()`).

In the second part, inspired by this **Local-First vision**, we apply that **same philosophy** to the **frontend**: just as Jazz eliminates backend network glue code, this project **extends that mindset to form handling**, eliminating UI glue code by replacing input `useState` hooks with native HTML `FormData` and the `React 19 action attribute`.

<p align="center">
  <img src="https://github.com/user-attachments/assets/7e09b1d2-04bc-476e-ba18-29fa5bbdf11d" style="width: 500px; height: auto; object-fit: contain;" alt="React Miami interview with Anselm Eickhoff." />
</p>

> 💡 **A Note on the "Pure LoFi" Terminology:**
> 
> To be clear: native HTML `FormData` and React 19 form actions are standard Web & React patterns, **not part of the official Local-First architecture spec!** 
> 
> Coining this form pattern "Pure LoFi" is a **playful extrapolation on my part**, fueled by Anselm's talk and a shared enthusiasm for eliminating unnecessary `useState` boilerplate. Just as Jazz eliminates backend network glue code, this experiment simply pushes that same philosophy to the frontend UI layer!

### I. Eliminating `useState` for Reading & Synchronizing Business Data

In traditional React applications backed by a REST/GraphQL API, reading database state requires managing asynchronous fetches, local state duplication, and loading flags.

#### A. Before Jazz: Traditional React + REST API
Developers spend a huge amount of time fetching data from a backend server and injecting it into local React state:

```typescript
import { useState, useEffect } from "react";
import { type Todo } from "./types";

export default function App() {

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/todos");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Failed to fetch todos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);
}
```
#### B. After Jazz: Reactive Local Store
**With Jazz, your local database IS your reactive state!** You subscribe directly to the local store with zero API glue code:

```typescript
import { useAll, useDb } from "jazz-tools/react"; // useDb is used for mutations: 
// (db.insert(),db.upsert(),db.delete,db.update...) see below II.1 & II.2.A-B
import { app, type Todo } from "./schema.ts";

export default function TodoList() {

  // Subscribe directly to Jazz's reactive local store:
  const { data: todos = [], isLoading: isTodosLoading } = useAll(app?.todos);
}
```
### II. Eliminating useState for Form Input Writing

Traditionally, developers declare a `useState` hook for every single input field (title, category, etc.), generating repetitive boilerplate just to keep the DOM input in sync with React state, triggering unnecessary re-renders on every keystroke.

By adopting a **Pure Local-First mindset**, we eliminate **redundant intermediate states** and let native HTML elements handle transient user inputs.

---

### What Concretely Changes in the Code?

<table>
  <thead>
    <tr>
      <th width="13%">Concept</th>
      <th width="29%">Traditional React Pattern</th>
      <th width="29%">Pure LoFi Pattern (FormData + onSubmit)</th>
      <th width="29%">Pure LoFi Pattern (FormData + React 19 form action attribute)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Form Inputs</strong></td>
      <td>Controlled inputs via <code>useState</code> (updated on every keystroke via <code>onChange</code>)</td>
      <td>Native HTML form + <code>FormData</code> extracted manually on submission</td>
      <td>Native HTML form + <code>FormData</code>passed automatically as argument to the Action</td>
    </tr>
    <tr>
      <td><strong>React State (<code>useState</code>)</strong></td>
      <td>Overused for everything (inputs, data, filters)</td>
      <td><strong>Reserved strictly for ephemeral UI state</strong> (e.g., <code>editingId</code>, open modals)</td>
      <td><strong>Reserved strictly for ephemeral UI state</strong> (e.g., <code>editingId</code>, open modals)</td>
    </tr>
    <tr>
      <td><strong>Form Resetting</strong></td>
      <td>Manual state clear handlers (<code>setTitle("")</code>)</td>
      <td>Imperative DOM reset (<code>e.currentTarget.reset()</code>)</td>
      <td><strong>Automated</strong> by the framework once the Action completes</td>
    </tr>
    <tr>
      <td><strong>Event Trapping</strong></td>
      <td>Manual intercept via <code>e.preventDefault()</code></td>
      <td>Manual intercept via <code>e.preventDefault()</code></td>
      <td><strong>No longer required</strong>: natively managed by the <code>action</code> attribute</td>
    </tr>
    <tr>
      <td><strong>React Re-renders</strong></td>
      <td>Triggered on every single keypress</td>
      <td>Triggered only when the local database mutates</td>
      <td>Triggered only when the local database mutates</td>
    </tr>
  </tbody>
</table>


> 💡 **Try it Live in the App:**
> An interactive toggle button is included in `App.tsx`. You can switch between the **Standard React** (`<TodoList />`) and **Pure Local-First with FormData + React 19 form action attribute** (`<TodoListPureLoFi />`) implementations directly in your browser without altering any code!
>
> Open your browser console in Standard React mode to see styled logs tracking **re-renders on every single keypress**.
>
> While **useRef** could bypass these re-renders, it introduces heavy boilerplate and imperative DOM manipulation, making **FormData + React 19 form action attribute** the **cleaner Local-First approach** !

<div align="center">
<table border="0" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img alt="PureLoFi" src="https://github.com/user-attachments/assets/49c2f25a-c980-4a28-b634-c8bf8d164dde" width="192" />
      <p><b><code>TodoListPureLoFi Component</code></b></p>
    </td>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img alt="Keypress logs" src="https://github.com/user-attachments/assets/1a99f6d2-1419-4397-86af-02d3f76d6794" width="500" />
      <p><b><code>TodoList Component</code></b></p>
    </td>
  </tr>
</table>
</div>

---

### Code Comparison: Before vs. After (The Three-Way Evolution)
#### 1. Before: Controlled React Pattern (Heavy Intermediate State) => TodoList.tsx

```tsx
const db = useDb();

const [title, setTitle] = useState<string>("");

const handleAddTodo = (e: React.SubmitEvent<HTMLFormElement>) => {

  e.preventDefault();

  db.insert(app.todos, { title }); // Simplified !
  setTitle(""); // Manual state cleanup
};

return (
  <form onSubmit={handleAddTodo}>
    <input required
      value={title} 
      onChange={(e) => setTitle(e.target.value)} 
    />
  </form>
);
```

#### 2. After: Pure Local-First Pattern (Native HTML + Jazz) - Zero useState
##### A. Intermediate: Uncontrolled Pattern (Traditional FormData) => `TodoListPureLoFi2.md`
```tsx
const db = useDb();

const handleAddTodo = (e: React.SubmitEvent<HTMLFormElement>) => {

  e.preventDefault();

  // Extract values using native Browser API (no React state needed):
  const formData = new FormData(e.currentTarget);
  const title = formData.get("title") as string; // Matches input name attribute
  
  db.insert(app.todos, { title }); // Simplified !
  e.currentTarget.reset(); // Native HTML form reset
};

return (
  <form onSubmit={handleAddTodo}>
    <input required name="title" />
  </form>
);
```

##### B. Upgraded React 19 Form Action Pattern (Zero Boilerplate) => `TodoListPureLoFi.tsx`
```tsx
const db = useDb();

// React 19 automatically handles event interception and resets form fields natively

const handleAddTodo = (formData: FormData) => {

  // Extract values natively straight from the FormData argument:
  const title = formData.get("title") as string; // Matches input name attribute

  db.insert(app.todos, { title }); // Simplified !
};

return (
  // Pass our handler straight to the new native 'action' attribute:
  <form action={handleAddTodo}>
    <input required name="title" />
  </form>
);
```
---

### Key Benefits

#### A. Provided by Jazz

**1. Instant Reactivity & Local Persistence**: writes apply instantly in memory (`db.insert()`), `useAll()` reflects them immediately, and persistence to IndexedDB happens in the background.

#### B. Provided by Native HTML Forms & React 19 Action

**2. Zero Boilerplate**: completely eliminates repetitive `useState` declarations, `onChange` text listeners, manual event preventions, and imperative form cleanups.

**3. Fewer Re-renders**: prevents unnecessary React re-renders on every single keystroke.

---

## Other UI Screenshots

<div align="center">
<table border="0" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img alt="1" src="https://github.com/user-attachments/assets/f38fccaf-936d-4603-b781-c122d8d0ab2a" width="300" />
      <p><b><code>All Category Filter - Desktop Layout - Online</code></b></p>
    </td>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img alt="4" src="https://github.com/user-attachments/assets/e526fa08-1e86-44a3-812c-6a804071a999" width="300" />
      <p><b><code>Work Category Filter - Desktop Layout - Offline</code></b></p>
    </td>
  </tr>
  <tr>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img width="300" alt="5" src="https://github.com/user-attachments/assets/fc210328-358a-4f26-8fee-c7398b73296b" />
      <p><b><code>Personal Category Filter - Mobile Layout - Offline</code></b></p>
    </td>
    <td align="center" valign="bottom" style="border: 0px solid transparent;">
      <img width="300" alt="6" src="https://github.com/user-attachments/assets/f19e39f7-90aa-48c4-92f0-31f992351731" />
      <p><b><code>Task Deletion Confirmation Modal</code></b></p>
    </td>
  </tr>
</table>
</div>


