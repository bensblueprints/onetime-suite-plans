/*
 * whop-license.js — shared Whop-native license validation for OneTimeSuite apps.
 * Vendored into each app (no npm dependency). Node 18+ (global fetch).
 *
 * Config: whop-license.config.json next to this file (generated per app from
 * onetime-suite/license-experience-map.json), env vars override:
 *   { "experienceId": "exp_xxx", "appName": "PDFsmith", "clientId": "app_xxx",
 *     "clientSecret": "", "port": 8734 }
 *
 * Security model: NO company API key ships in the app. The user authenticates
 * via Whop OAuth 2.1 + PKCE (loopback redirect) and their OWN access token is
 * used for GET /api/v1/users/{id}/access/{experienceId}. clientSecret is a
 * public-client credential (optional, only if Whop requires it at exchange).
 *
 * Desktop mode:  ensureLicensed() — first run does OAuth + access check, binds
 *   a device fingerprint, caches state; later runs are instant (background
 *   re-validate at most daily, non-blocking; 10-day offline grace).
 * Server mode:   activateOnce() — one-time check at setup, writes an
 *   activation file, never phones home again.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const crypto = require('crypto');

const OAUTH_BASE = process.env.WHOP_OAUTH_BASE || 'https://api.whop.com/oauth';
const API_BASE = process.env.WHOP_API_BASE || 'https://api.whop.com/api/v1';
const REGISTRY_BASE = process.env.WHOP_DEVICE_REGISTRY || 'https://license.onetimesuite.com';
const RECHECK_MS = 24 * 60 * 60 * 1000;        // background re-validate daily
const GRACE_MS = 10 * 24 * 60 * 60 * 1000;     // offline grace: 10 days

function loadConfig(overrides = {}) {
  let file = {};
  try { file = JSON.parse(fs.readFileSync(path.join(__dirname, 'whop-license.config.json'), 'utf8')); } catch {}
  const cfg = {
    experienceId: process.env.WHOP_EXPERIENCE_ID || file.experienceId,
    clientId: process.env.WHOP_CLIENT_ID || file.clientId,
    clientSecret: process.env.WHOP_CLIENT_SECRET || file.clientSecret || '',
    appName: file.appName || 'this app',
    port: Number(process.env.WHOP_OAUTH_PORT || file.port || 8734),
    ...overrides,
  };
  if (!cfg.experienceId || !cfg.clientId) throw new Error('whop-license: experienceId and clientId are required (whop-license.config.json)');
  return cfg;
}

const b64url = buf => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function deviceFingerprint() {
  return crypto.createHash('sha256')
    .update([os.hostname(), os.platform(), os.arch(), os.userInfo().username].join('|'))
    .digest('hex').slice(0, 32);
}

/* ---------- OAuth 2.1 + PKCE over a loopback redirect ---------- */
async function loginWithWhop(cfg, openUrl) {
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const state = b64url(crypto.randomBytes(16));
  const redirectUri = `http://127.0.0.1:${cfg.port}/callback`;

  const authUrl = `${OAUTH_BASE}/authorize?` + new URLSearchParams({
    client_id: cfg.clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: 'openid profile', state, nonce: b64url(crypto.randomBytes(16)), // Whop requires nonce with openid scope
    code_challenge: challenge, code_challenge_method: 'S256',
  });

  const code = await new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, redirectUri);
      if (u.pathname !== '/callback') { res.writeHead(404); res.end(); return; }
      res.setHeader('Content-Type', 'text/html');
      res.end(`<body style="font-family:system-ui;padding:3rem;text-align:center"><h2>${u.searchParams.get('code') ? 'Signed in — you can close this tab and return to ' + cfg.appName + '.' : 'Sign-in failed: ' + (u.searchParams.get('error') || 'no code')}</h2></body>`);
      srv.close();
      if (u.searchParams.get('state') !== state) return reject(new Error('OAuth state mismatch'));
      u.searchParams.get('code') ? resolve(u.searchParams.get('code'))
        : reject(new Error(u.searchParams.get('error') || 'OAuth was cancelled'));
    });
    srv.on('error', reject);
    srv.listen(cfg.port, '127.0.0.1', () => Promise.resolve(openUrl(authUrl)).catch(reject));
    setTimeout(() => { try { srv.close(); } catch {} ; reject(new Error('Sign-in timed out (5 minutes)')); }, 5 * 60 * 1000).unref();
  });

  const body = { grant_type: 'authorization_code', client_id: cfg.clientId, code, redirect_uri: redirectUri, code_verifier: verifier };
  if (cfg.clientSecret) body.client_secret = cfg.clientSecret;
  const tokRes = await fetch(`${OAUTH_BASE}/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const tokens = await tokRes.json();
  if (!tokRes.ok || !tokens.access_token) throw new Error('Whop token exchange failed: ' + JSON.stringify(tokens).slice(0, 200));

  const uiRes = await fetch(`${OAUTH_BASE}/userinfo`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const userInfo = await uiRes.json();
  if (!uiRes.ok || !userInfo.sub) throw new Error('Whop userinfo failed: ' + JSON.stringify(userInfo).slice(0, 200));
  return { userId: userInfo.sub, tokens };
}

async function refreshTokens(cfg, refreshToken) {
  const body = { grant_type: 'refresh_token', client_id: cfg.clientId, refresh_token: refreshToken };
  if (cfg.clientSecret) body.client_secret = cfg.clientSecret;
  const res = await fetch(`${OAUTH_BASE}/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const j = await res.json();
  if (!res.ok || !j.access_token) throw new Error('refresh failed');
  return j;
}

/* Check the signed-in user's own access with their own token. */
async function checkAccess(cfg, accessToken, userId) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/access/${cfg.experienceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401 || res.status === 403) return { hasAccess: false, accessLevel: 'no_access', authExpired: res.status === 401 };
  if (!res.ok) throw new Error(`access check HTTP ${res.status}`);
  const j = await res.json();
  return { hasAccess: !!j.has_access, accessLevel: j.access_level || (j.has_access ? 'customer' : 'no_access') };
}

/* ---------- central device registry (desktop apps only) ---------- */
async function registerDevice(cfg, accessToken, deviceHash) {
  const res = await fetch(`${REGISTRY_BASE}/devices/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ experience_id: cfg.experienceId, device_hash: deviceHash, device_label: os.hostname() }),
  });
  if (res.status === 409) return { limitReached: true, devices: (await res.json()).devices };
  if (!res.ok) throw new Error(`device registry HTTP ${res.status}`);
  return { limitReached: false };
}
async function listDevices(cfg, accessToken) {
  const res = await fetch(`${REGISTRY_BASE}/devices?experience_id=${cfg.experienceId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`device registry HTTP ${res.status}`);
  return res.json();
}
async function deactivateRemoteDevice(cfg, accessToken, deviceIdOrOpts) {
  const body = typeof deviceIdOrOpts === 'string'
    ? { device_id: deviceIdOrOpts }
    : { device_hash: deviceIdOrOpts.deviceHash, experience_id: cfg.experienceId };
  const res = await fetch(`${REGISTRY_BASE}/devices/deactivate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`device registry HTTP ${res.status}`);
  return res.json();
}

/* ---------- state ---------- */
const loadState = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
function saveState(f, s) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(s, null, 2)); }

/* ---------- desktop mode ---------- */
/**
 * ensureLicensed({ stateDir, openUrl }) -> { ok, state } | throws on hard deny.
 * - stateDir: per-app writable dir (Electron: app.getPath('userData'))
 * - openUrl:  fn(url) opening the system browser (Electron: shell.openExternal)
 * Never blocks startup after first activation; re-validates in background.
 */
async function ensureLicensed({ stateDir, openUrl, config }) {
  const cfg = loadConfig(config);
  const stateFile = path.join(stateDir, 'whop-license.json');
  let state = loadState(stateFile);

  if (!state || state.deviceHash !== deviceFingerprint()) {
    const { userId, tokens } = await loginWithWhop(cfg, openUrl);
    const access = await checkAccess(cfg, tokens.access_token, userId);
    if (!access.hasAccess) { const e = new Error(`No active ${cfg.appName} license on this Whop account.`); e.code = 'NO_LICENSE'; throw e; }
    // enforce the device cap via the central registry (fail-open if unreachable)
    const reg = await registerDevice(cfg, tokens.access_token, deviceFingerprint()).catch(() => ({ limitReached: false }));
    if (reg.limitReached) {
      const e = new Error(`Device limit reached for ${cfg.appName}. Deactivate one of your other devices to activate this one.`);
      e.code = 'DEVICE_LIMIT'; e.devices = reg.devices;
      e.deactivate = deviceId => deactivateRemoteDevice(cfg, tokens.access_token, deviceId);
      throw e;
    }
    state = {
      userId, deviceHash: deviceFingerprint(), experienceId: cfg.experienceId,
      refreshToken: tokens.refresh_token || null, accessLevel: access.accessLevel,
      lastCheck: Date.now(), lastGood: true, activatedAt: new Date().toISOString(),
    };
    saveState(stateFile, state);
    return { ok: true, state, firstActivation: true };
  }

  // Background re-validation (never blocks startup)
  if (Date.now() - state.lastCheck > RECHECK_MS && state.refreshToken) {
    (async () => {
      try {
        const t = await refreshTokens(cfg, state.refreshToken);
        if (t.refresh_token) state.refreshToken = t.refresh_token;
        const access = await checkAccess(cfg, t.access_token, state.userId);
        state.lastCheck = Date.now(); state.lastGood = access.hasAccess;
        saveState(stateFile, state);
        registerDevice(cfg, t.access_token, state.deviceHash).catch(() => {}); // bump last_seen

      } catch { /* transient network/auth errors — grace period covers us */ }
    })();
  }

  const expired = Date.now() - state.lastCheck > GRACE_MS;
  if (expired && !state.lastGood) {
    const e = new Error(`${cfg.appName} could not verify your license for over 10 days. Please sign in again.`);
    e.code = 'GRACE_EXPIRED';
    try { fs.unlinkSync(stateFile); } catch {}
    throw e;
  }
  if (!state.lastGood && !expired) return { ok: true, state, warning: 'license re-check failed — will retry' };
  return { ok: true, state };
}

/* Self-serve device deactivation: clears this device's activation. */
function deactivateDevice({ stateDir }) {
  try { fs.unlinkSync(path.join(stateDir, 'whop-license.json')); return true; } catch { return false; }
}

/* ---------- server / self-hosted mode ---------- */
/**
 * One-time activation at install/setup — never phones home again afterwards.
 * isActivated({dataDir}) is the only thing the app calls at boot.
 */
function activationFile(dataDir) { return path.join(dataDir, '.whop-activated.json'); }
function isActivated({ dataDir }) {
  const s = loadState(activationFile(dataDir));
  return !!(s && s.userId && s.experienceId);
}
async function activateOnce({ dataDir, openUrl, config }) {
  const cfg = loadConfig(config);
  if (isActivated({ dataDir })) return { ok: true, already: true };
  const { userId, tokens } = await loginWithWhop(cfg, openUrl);
  const access = await checkAccess(cfg, tokens.access_token, userId);
  if (!access.hasAccess) { const e = new Error(`No active ${cfg.appName} license on this Whop account.`); e.code = 'NO_LICENSE'; throw e; }
  saveState(activationFile(dataDir), {
    userId, experienceId: cfg.experienceId, accessLevel: access.accessLevel,
    activatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

module.exports = {
  loadConfig, loginWithWhop, checkAccess, refreshTokens,
  ensureLicensed, deactivateDevice,
  registerDevice, listDevices, deactivateRemoteDevice,
  isActivated, activateOnce, activationFile,
  deviceFingerprint,
};
