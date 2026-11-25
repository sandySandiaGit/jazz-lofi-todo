import cors from 'cors';
import express from 'express';

import { app } from '../src/schema.js';
import { permissions } from '../src/permissions.js';
import { createJazz, acceptLocalFirstAuth, remote } from 'jazz-tools/backend'

import { createServer } from 'node:http'

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

const appId = process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID;
const secret = process.env.JAZZ_ADMIN_SECRET;

if (!appId || !secret) {
  throw new Error('Missing JAZZ_APP_ID / JAZZ_ADMIN_SECRET')
}

console.log('[Backend] Initializing Jazz with App ID:', appId);

const jazz = createJazz({
  app,
  permissions,
  //authenticate: acceptLocalFirstAuth,
  authenticate: acceptLocalFirstAuth,
  store: remote({
    appId: appId!,
    url: "https://v2.sync.jazz.tools/",
    secret: secret!,
  }),
});

console.log('[Backend] Jazz initialized successfully, mounting middleware...');
 
//Jazz handler:
appExpress.use('/jazz', (req: any, res: any, next: any) => jazz.nodeHandler(req, res, next));

let exportedHandler: any = appExpress;

if (!process.env.VERCEL) {

  // Locally: start the HTTP server and attach WebSockets to it:
  // En local : on démarre le serveur HTTP et on y attache les WebSockets:
  const localServer = appExpress.listen(3001, () => {
    console.log('[Backend] Express server listening on http://localhost:3001');
  });
  jazz.attach(localServer).then(() => {
    console.log('[Backend] Jazz and WebSockets attached successfully!');
  });
  
} else {

  // On Vercel: test with createServer + attach:
  // Sur Vercel : test avec createServer + attach:
  const vercelServer = createServer(appExpress);
  jazz.attach(vercelServer).then(() => {
    console.log('[Backend] Jazz and WebSockets attached on Vercel!');
  });
  exportedHandler = vercelServer;
}

export default exportedHandler;       
