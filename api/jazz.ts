import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';

import { app } from '../src/schema.js';
import { permissions } from '../src/permissions.js';
import { createJazz, acceptLocalFirstAuth, remote } from 'jazz-tools/backend'

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

const appId = process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID;
const secret = process.env.JAZZ_ADMIN_SECRET;

if (!appId || !secret) {
  console.error('[Backend] FATAL: Missing JAZZ_APP_ID or JAZZ_ADMIN_SECRET environment variables!');
}

try {
  console.log('[Backend] Initializing Jazz...');
  console.log('[Backend] Initializing Jazz with App ID:', appId);

  const jazz = createJazz({
    app,
    permissions,
    authenticate: acceptLocalFirstAuth,
    store: remote({
    //appId: process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID!,
    appId: appId!,
    url: "https://v2.sync.jazz.tools/",
    //secret: process.env.JAZZ_ADMIN_SECRET!,
    secret: secret!,
    }),
  });

  console.log('[Backend] Jazz initialized successfully, mounting middleware...');
  appExpress.use('/jazz', (req:any, res:any, next:NextFunction) => jazz.nodeHandler(req, res, next));

  //api/jazz.ts(25,94): error TS2345: Argument of type 'Request<core.ParamsDictionary, any, any, core.Query, Record<string, any>>' is not assignable to parameter of type 'IncomingMessage'.

  // Locally only (outside Vercel), start the HTTP server and WebSockets:
  // En local uniquement (hors Vercel), on démarre le serveur HTTP et les WebSockets:
  if (!process.env.VERCEL) {
    const server = appExpress.listen(3001, () => {
      console.log('[Backend] Express server listening on http://localhost:3001');
    });
    jazz.attach(server).then(() => {
      console.log('[Backend] Jazz and WebSockets attached successfully!');
    });
  }

} catch (error) {
  console.error('[Backend] FATAL ERROR DURING JAZZ INITIALIZATION:', error);
}

export default appExpress;