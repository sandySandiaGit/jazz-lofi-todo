// See documentation: https://jazz.tools/docs/install/client#jazz-framework-react =>
// "Set up your app" =>
// "Create the basic structure for your app with Jazz and a to-do list."

import type { AccountHandle } from "jazz-tools";
import { JazzProvider } from "jazz-tools/react";
import TodoList from "./TodoList.tsx";
import TodoListPureLoFi from "./TodoListPureLoFi.tsx";
import { useState } from "react";

// ARCHITECTURAL NOTE:
// In earlier Jazz APIs, backend initialization relied on raw secrets or internal types
// like 'AccountDBconfig'. In the modern v2 Alpha API, the configuration is streamlined:
// the React provider now directly consumes the high-level 'AccountHandle' object.
// From documentation: "Prepare the account outside the context with createAccountManager" (see: main.tsx)
export default function App({ account }: { account: AccountHandle }) {
    const [usePureLoFi, setUsePureLoFi] = useState(false);

    return (
        <JazzProvider
            config={{
                appId: import.meta.env.VITE_JAZZ_APP_ID,
                serverUrl: "https://v2.sync.jazz.tools/",
                account,
            }}
        >
            <div className="bg-blue-50 text-center px-1 py-5">
                <h2 className="text-pink-500 font-extrabold">
                    Jazz Local-First Demo
                </h2>
                <button
                    onClick={() => setUsePureLoFi(!usePureLoFi)}
                    className="cursor-pointer text-blue-900 hover:font-extrabold"
                >
                    Switch to{" "}
                    {usePureLoFi
                        ? "Standard React (useStates)"
                        : "Pure Local-First (FormData)"}
                </button>
            </div>

            {usePureLoFi ? <TodoListPureLoFi /> : <TodoList />}
        </JazzProvider>
    );
}
