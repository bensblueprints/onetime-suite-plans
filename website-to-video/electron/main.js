'use strict';
// Thin Electron wrapper — starts the same Express server on a free local port with the data dir
// pointed at Electron's userData, auto-logged-in as admin, and opens a window at it.
// The server code is reused unchanged (per BUILD-SPEC).
const { app, BrowserWindow } = require('electron');
const path = require('path');
const net = require('net');

function freePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
  });
}

async function main() {
  const port = await freePort();
  const userData = app.getPath('userData');
  process.env.PORT = String(port);
  process.env.DATA_DIR = userData;
  process.env.AUTO_ADMIN = '1';            // desktop mode: skip the login gate
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'desktop';
  process.env.ALLOW_PRIVATE = process.env.ALLOW_PRIVATE || 'true';

  require(path.join(__dirname, '..', 'server', 'index.js')).start();

  await app.whenReady();
  const win = new BrowserWindow({
    width: 1280, height: 860, backgroundColor: '#0b0c10',
    title: 'UrlVid', autoHideMenuBar: true,
    webPreferences: { contextIsolation: true },
  });
  // small delay so the server is listening
  setTimeout(() => win.loadURL(`http://127.0.0.1:${port}`), 600);
}

app.on('window-all-closed', () => app.quit());
main();
