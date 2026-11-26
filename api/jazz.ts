import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

import { app } from '../src/schema.js';
import { permissions } from '../src/permissions.js';
import { createJazz, acceptLocalFirstAuth, remote } from 'jazz-tools/backend';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');

const appExpress = express();
appExpress.use(cors({ origin: '*' }));

// Required COOP/COEP headers for SQLite WASM / SharedArrayBuffer:
appExpress.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

const server = createServer(appExpress);
const port = Number(process.env.PORT) || 3001;

const appId = process.env.JAZZ_APP_ID || process.env.VITE_JAZZ_APP_ID;
const secret = process.env.JAZZ_ADMIN_SECRET;

if (!appId || !secret) {
  throw new Error('Missing JAZZ_APP_ID / JAZZ_ADMIN_SECRET');
}

const jazz = createJazz({
  app,
  permissions,
  authenticate: acceptLocalFirstAuth,
  store: remote({
    appId: appId!,
    url:"https://v2.sync.jazz.tools/",
    secret: secret!,
  }),
});

// Jazz sync & WebSocket middleware:
appExpress.use('/jazz', (req: any, res: any, next: any) => jazz.nodeHandler(req, res, next));

// Serve the built Vite frontend from dist/:
appExpress.use(express.static(distPath));

// SPA fallback for client-side routes:
appExpress.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

jazz.attach(server).then(() => {
  console.log('[Backend] Jazz and WebSockets attached successfully!');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[Backend] Express + WS server listening on port ${port}`);
});

export default server;
