import cors from 'cors';
import express, { type Request, type Response, type NextFunction } from 'express';

import { app } from '../src/schema';
import { permissions } from '../src/permissions';
import { createJazz, acceptLocalFirstAuth, remote } from 'jazz-tools/backend'

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

try {
  console.log('[Backend] Initializing Jazz...');

  const jazz = createJazz({
    app,
    permissions,
    authenticate: acceptLocalFirstAuth,
    store: remote({
    appId: process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID!,
    url: "https://v2.sync.jazz.tools/",
    secret: process.env.JAZZ_ADMIN_SECRET!,
    }),
  });

  appExpress.use('/jazz', (req:Request, res:Response, next:NextFunction) => jazz.nodeHandler(req, res, next));

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