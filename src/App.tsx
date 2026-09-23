
// See documentation: https://jazz.tools/docs/install/client#jazz-framework-react
// "Set up your app"
// "Create the basic structure for your app with Jazz and a to-do list."

import type { AccountHandle } from 'jazz-tools'
import { JazzProvider } from 'jazz-tools/react'
import TodoList  from './TodoList.tsx'

// From documentation: "Prepare the account outside the context with createAccountManager" (see: main.tsx)
export default function App({ account }: { account: AccountHandle }) {

  const appId = import.meta.env.VITE_JAZZ_APP_ID;

  return (
    <JazzProvider
      config={{
        appId: appId,
        serverUrl: "https://v2.sync.jazz.tools/",
        account,
      }}
    >
       <TodoList /> 
    </JazzProvider>
  );
}

