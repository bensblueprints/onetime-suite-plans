'use strict';
// Chromium executable resolution for puppeteer-core.
// puppeteer-core downloads NO browser at install time, so we locate one at runtime:
//   CHROMIUM_PATH / PUPPETEER_EXECUTABLE_PATH env -> common OS locations -> Playwright cache.

const fs = require('fs');
const path = require('path');

function firstExisting(paths) {
  for (const p of paths) {
    try { if (p && fs.existsSync(p)) return p; } catch (_) { /* ignore */ }
  }
  return null;
}

function playwrightCandidates() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root) return [];
  let dirs = [];
  try {
    dirs = fs.readdirSync(root)
      .filter((d) => d.startsWith('chromium') && !d.includes('headless_shell'))
      .map((d) => path.join(root, d));
  } catch (_) { return []; }
  const out = [];
  for (const d of dirs) {
    out.push(
      path.join(d, 'chrome-linux', 'chrome'),
      path.join(d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'),
      path.join(d, 'chrome-win', 'chrome.exe'),
    );
  }
  return out;
}

function resolveChromiumPath() {
  const explicit = process.env.CHROMIUM_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;

  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ...playwrightCandidates(),
  ];
  return firstExisting(candidates);
}

function launchArgs() {
  const base = ['--hide-scrollbars', '--disable-gpu', '--force-color-profile=srgb', '--disable-features=IsolateOrigins,site-per-process'];
  const extra = (process.env.PUPPETEER_ARGS || '').split(/\s+/).filter(Boolean);
  return [...base, ...extra];
}

module.exports = { resolveChromiumPath, launchArgs };
