import { JazzProvider } from "jazz-tools/react";
import { useState } from "react";
import TodoList from "./TodoList.tsx";
import TodoListPureLoFi from "./TodoListPureLofi.tsx";

export default function App() {

  const [usePureLoFi, setUsePureLoFi] = useState(false);
  
  const appId = import.meta.env.VITE_JAZZ_APP_ID
 
  return (

    <JazzProvider

      client={() => import("jazz-tools/local-first")}
      scope={appId}
      serverUrl="/jazz"
    >
      <div className="bg-blue-50 text-center px-1 py-5">
        <h2 className="text-pink-500 font-extrabold">
          Jazz Local-First Demo (alpha.60)
        </h2>
        <button
          onClick={() => setUsePureLoFi(!usePureLoFi)}
          className="cursor-pointer text-blue-900 hover:font-extrabold"
        >
          Switch to{" "}
          {usePureLoFi
            ? 'Standard React (useStates)'
            : '"Pure Local-First" (FormData)'}
        </button>
      </div>

      {usePureLoFi ? <TodoListPureLoFi /> : <TodoList />}
    </JazzProvider>
  );
}
