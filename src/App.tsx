

// AccountDBconfig: now c'est account et plus secret!!!
// voir docu: https://jazz.tools/docs/install/client#jazz-framework-react
// Set up your app
// Create the basic structure for your app with Jazz and a to-do list.

import type { AccountHandle } from 'jazz-tools'
import { JazzProvider } from 'jazz-tools/react'
import TodoList  from './TodoList.tsx'

// Prepare the account outside the context with createAccountManager (voir main.tsx)
export default function App({ account }: { account: AccountHandle }) {

  return (
    <JazzProvider
      config={{
        appId: "b993414f-b59d-4db0-9ada-14929d90cf36",
        serverUrl: "https://v2.sync.jazz.tools/",
        account: account,  //AccountHandle au lieu de secret
      }}
    >
      <TodoList />
    </JazzProvider>
  );
}

