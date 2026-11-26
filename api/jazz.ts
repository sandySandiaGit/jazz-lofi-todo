import cors from 'cors';
import express from 'express';

import { app } from '../src/schema.js';
import { permissions } from '../src/permissions.js';
import { createJazz, acceptLocalFirstAuth, remote } from 'jazz-tools/backend'

import { createServer } from 'node:http'

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

const server = createServer(appExpress);
const port = Number(process.env.PORT) || 3001;

const appId = process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID;
const secret = process.env.JAZZ_ADMIN_SECRET;

if (!appId || !secret) {
  throw new Error('Missing JAZZ_APP_ID / JAZZ_ADMIN_SECRET')
}

console.log('[Backend] Initializing Jazz with App ID:', appId);

const jazz = createJazz({
  app,
  permissions,
  authenticate: acceptLocalFirstAuth,
  store: remote({
    appId: appId!,
    url: "https://v2.sync.jazz.tools/",
    secret: secret!,
  }),
});

console.log('[Backend] Jazz initialized successfully, mounting middleware...');
 
// Root health-check route for Render (GET / -> 200 OK)
// so Render's automatic health check (GET /) gets an instant 200 OK instead of a 404:
appExpress.get('/', (_req, res) => res.status(200).send('OK'));
//Jazz handler:
appExpress.use('/jazz', (req: any, res: any, next: any) => jazz.nodeHandler(req, res, next));

jazz.attach(server).then(() => {
  console.log('[Backend] Jazz and WebSockets attached successfully!');
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[Backend] Express + WS server listening on port ${port}`);
});

export default server;  
    
