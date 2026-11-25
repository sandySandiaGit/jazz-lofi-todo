import cors from 'cors';
import express from 'express';

import { app } from '../src/jazz.generated.js';
import permissions from "../src/jazz.permissions.json" with { type: "json" };
import { createJazz, acceptDeviceAccounts, remote } from 'jazz-tools/backend'

import { createServer } from 'node:http'

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

const appId = process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID;
const secret = process.env.JAZZ_ADMIN_SECRET;

if (!appId || !secret) {
  throw new Error('Missing JAZZ_APP_ID / JAZZ_ADMIN_SECRET')
}

console.log('[Backend] Initializing Jazz with App ID:', appId);

const vercelHost =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL;

const jazz = createJazz({
  app,
  permissions,
  authenticate: acceptDeviceAccounts,
  // Explicitly set publicUrl on Vercel (production or preview); leave undefined locally
  // so createJazz infers the forwarded Host header from Vite dev (5173) or preview (4173):
  publicUrl: vercelHost ? `https://${vercelHost}/jazz` : undefined,
  store: remote({
    appId: appId!,
    url: "https://v2.sync.jazz.tools/",
    secret: secret!,
  }),
});

console.log('[Backend] Jazz initialized successfully, mounting middleware...');

//Jazz handler:
appExpress.use('/jazz', (req: any, res: any, next: any) => jazz.nodeHandler(req, res, next));

const server = createServer(appExpress);

// 1. This runs in both environments (locally and on Vercel) 
// to attach WebSockets to the same `server` instance :
jazz.attach(server).then(() => {
  console.log('[Backend] Jazz and WebSockets attached successfully!');
});

// 2. Locally, that exact same `server` instance (with WebSockets already attached) 
// starts listening on port 3001:
if (!process.env.VERCEL) {
  server.listen(3001, () => {
    console.log('[Backend] Express server listening on http://localhost:3001');
  });
}

// 3. On Vercel, Vercel takes that exact same exported `server` 
// and handles listening itself:
export default server;
      
