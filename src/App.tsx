import { JazzProvider } from "jazz-tools/react";
import { useState } from "react";
import TodoList from "./TodoList.tsx";
import TodoListPureLoFi from "./TodoListPureLofi.tsx";
import { AccountAuthBar } from "./AccountAuthBar.tsx";

export default function App() {

  const [usePureLoFi, setUsePureLoFi] = useState(false);

  return (

    <JazzProvider
      config={{
        serverUrl: "/jazz",
        client: () => import("jazz-tools/local-first"),
        localFirst: "now",
        initial: "device",
      }}
    >
      <AccountAuthBar />
      <div className="bg-blue-50 text-center px-1 py-5">
        <h2 className="text-pink-500 font-extrabold">
          Jazz Local-First Demo (beta)
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
