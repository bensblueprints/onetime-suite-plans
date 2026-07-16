/*
 * auth.js — email+password auth for hosted multi-tenant mode.
 *
 * Zero npm deps (mirrors whop-license.js): plain connect-style middleware that
 * works under Express or bare node:http. Owns a SYSTEM database at
 * <dataDir>/system.db (users + sessions tables) — user CONTENT never lives
 * here; that goes in each user's own file via db-router.js.
 *
 * Routes handled (everything else falls through to next()):
 *   GET  /auth/login     login page (HTML)
 *   GET  /auth/register  register page (HTML)
 *   POST /auth/register  { email, password } -> 201 + session cookie
 *   POST /auth/login     { email, password } -> 200 + session cookie
 *   POST /auth/logout    kills the session, clears the cookie
 *   GET  /auth/me        { user: { id, email, created_at } } or 401
 *
 * Passwords: crypto.scrypt with a per-user 16-byte salt (no native deps,
 * unlike bcrypt), compared with timingSafeEqual.
 * Sessions: 32-byte random token stored in system.db, sent as a SIGNED
 * httpOnly SameSite=Lax cookie `<token>.<hmac-sha256(token, SESSION_SECRET)>`.
 */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { loginPage, registerPage } = require('./gate.js');
const signupGate = require('./signup-gate.js');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const DAY_MS = 24 * 3600 * 1000;

/* ---- small http helpers (Express-compatible, but plain node works too) --- */
function sendJson(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(obj));
}
function sendHtml(res, code, html) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}
function redirect(res, url) {
  res.statusCode = 302;
  res.setHeader('Location', url);
  res.end();
}
function appendCookie(res, cookie) {
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', prev ? [].concat(prev, cookie) : cookie);
}
function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function readBody(req) {
  // Respect a body parser that already ran (e.g. app-level express.json()).
  if (req.body !== undefined) return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 64 * 1024) req.destroy(); });
    req.on('end', () => {
      const ct = String(req.headers['content-type'] || '');
      if (ct.includes('json')) { try { return resolve(JSON.parse(raw)); } catch { return resolve({}); } }
      if (ct.includes('urlencoded')) return resolve(Object.fromEntries(new URLSearchParams(raw)));
      resolve({});
    });
    req.on('error', () => resolve({}));
  });
}

/* ---- passwords ------------------------------------------------------------ */
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [algo, saltHex, hashHex] = String(stored || '').split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expect = Buffer.from(hashHex, 'hex');
  const got = crypto.scryptSync(String(password), Buffer.from(saltHex, 'hex'), expect.length);
  return crypto.timingSafeEqual(got, expect);
}
// Constant work for "no such user" so login timing doesn't leak account existence.
const DUMMY_HASH = hashPassword('correct horse battery staple');

function createAuth({
  dataDir,
  Database,                 // better-sqlite3 constructor; defaults to require() from the vendored location
  appName = 'App',
  sessionSecret,            // falls back to SESSION_SECRET env, then a persisted generated secret
  sessionTtlMs = 30 * DAY_MS,
  cookieName = 'mt_session',
  cookieSecure = process.env.COOKIE_SECURE === '1',
  verifyPurchase = signupGate.verifyPurchase,
  onUserCreated = null,     // (userId) => void — index.js uses this to eagerly create the user's DB file
} = {}) {
  if (!dataDir) throw new Error('auth: dataDir is required');
  if (!Database) Database = require('better-sqlite3'); // resolves via the host app's node_modules when vendored

  /* secret */
  let secret = sessionSecret || process.env.SESSION_SECRET;
  if (!secret) {
    const secretFile = path.join(dataDir, '.session-secret');
    fs.mkdirSync(dataDir, { recursive: true });
    try {
      secret = fs.readFileSync(secretFile, 'utf8').trim();
    } catch { /* first run */ }
    if (!secret) {
      secret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(secretFile, secret, { mode: 0o600 });
      console.warn(`[multi-tenant] SESSION_SECRET not set — generated one and saved it to ${secretFile}`);
    }
  }

  /* system db */
  fs.mkdirSync(dataDir, { recursive: true });
  const systemDb = new Database(path.join(dataDir, 'system.db'));
  systemDb.pragma('journal_mode = WAL');
  systemDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      pass_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
  `);

  /* signed session cookies */
  const hmac = (v) => crypto.createHmac('sha256', secret).update(v).digest('hex');
  const signToken = (token) => `${token}.${hmac(token)}`;
  function unsignToken(value) {
    const i = String(value || '').lastIndexOf('.');
    if (i <= 0) return null;
    const token = value.slice(0, i);
    const sig = Buffer.from(value.slice(i + 1));
    const want = Buffer.from(hmac(token));
    if (sig.length !== want.length || !crypto.timingSafeEqual(sig, want)) return null;
    return token;
  }
  const cookieAttrs = () =>
    `HttpOnly; Path=/; SameSite=Lax; Max-Age=${Math.floor(sessionTtlMs / 1000)}${cookieSecure ? '; Secure' : ''}`;

  function createSession(res, userId) {
    const now = Date.now();
    systemDb.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now); // opportunistic prune
    const token = crypto.randomBytes(32).toString('hex');
    systemDb.prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(token, userId, now, now + sessionTtlMs);
    appendCookie(res, `${cookieName}=${signToken(token)}; ${cookieAttrs()}`);
    return token;
  }
  function clearSessionCookie(res) {
    appendCookie(res, `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${cookieSecure ? '; Secure' : ''}`);
  }

  /* current user (memoized per request) */
  function getUser(req) {
    if (req._mtUser !== undefined) return req._mtUser;
    let user = null;
    const token = unsignToken(parseCookies(req)[cookieName]);
    if (token) {
      user = systemDb.prepare(`
        SELECT u.id, u.email, u.created_at FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > ?
      `).get(token, Date.now()) || null;
    }
    req._mtUser = user;
    return user;
  }

  /* handlers */
  async function handleRegister(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Enter a valid email address' });
    if (password.length < MIN_PASSWORD) return sendJson(res, 400, { error: `Password must be at least ${MIN_PASSWORD} characters` });

    let purchased = false;
    try { purchased = await verifyPurchase(email); } catch (e) {
      return sendJson(res, 502, { error: 'Purchase check failed — try again shortly' });
    }
    if (!purchased) return sendJson(res, 403, { error: 'No purchase found for this email — buy the app first' });

    const id = crypto.randomUUID();
    try {
      systemDb.prepare('INSERT INTO users (id, email, pass_hash, created_at) VALUES (?, ?, ?, ?)')
        .run(id, email, hashPassword(password), Date.now());
    } catch (e) {
      if (/UNIQUE/.test(e.message)) return sendJson(res, 409, { error: 'An account with this email already exists' });
      throw e;
    }
    if (onUserCreated) { try { onUserCreated(id); } catch (e) { console.error('[multi-tenant] onUserCreated:', e.message); } }
    createSession(res, id);
    sendJson(res, 201, { ok: true, user: { id, email }, redirect: '/' });
  }

  async function handleLogin(req, res) {
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = systemDb.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const ok = verifyPassword(password, user ? user.pass_hash : DUMMY_HASH) && !!user;
    if (!ok) return sendJson(res, 401, { error: 'Wrong email or password' });
    createSession(res, user.id);
    sendJson(res, 200, { ok: true, user: { id: user.id, email: user.email }, redirect: '/' });
  }

  function logout(req, res) {
    const token = unsignToken(parseCookies(req)[cookieName]);
    if (token) systemDb.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
  }

  /* the router: connect-style middleware owning /auth/* */
  function router(req, res, next) {
    const p = (req.path || req.url.split('?')[0]) || '/';
    if (p !== '/auth' && !p.startsWith('/auth/')) return next();
    const method = req.method.toUpperCase();
    const route = `${method} ${p.replace(/\/+$/, '') || '/auth'}`;
    const fail = (e) => { console.error('[multi-tenant] auth error:', e); sendJson(res, 500, { error: 'internal error' }); };
    switch (route) {
      case 'GET /auth':
      case 'GET /auth/login':
        return getUser(req) ? redirect(res, '/') : sendHtml(res, 200, loginPage(appName));
      case 'GET /auth/register':
        return getUser(req) ? redirect(res, '/') : sendHtml(res, 200, registerPage(appName));
      case 'POST /auth/register': return void handleRegister(req, res).catch(fail);
      case 'POST /auth/login': return void handleLogin(req, res).catch(fail);
      case 'POST /auth/logout': return logout(req, res);
      case 'GET /auth/me': {
        const user = getUser(req);
        return user ? sendJson(res, 200, { user }) : sendJson(res, 401, { error: 'unauthorized' });
      }
      default:
        return sendJson(res, 404, { error: 'not found' });
    }
  }

  /* strict guard for app routes that must have a user (JSON 401 when missing) */
  function requireUser(req, res, next) {
    const user = getUser(req);
    if (!user) return sendJson(res, 401, { error: 'unauthorized', login: '/auth/login' });
    req.user = user;
    next();
  }

  return {
    router, getUser, requireUser, logout, systemDb,
    close: () => { try { systemDb.close(); } catch { /* noop */ } },
    _internals: { hashPassword, verifyPassword, signToken, unsignToken },
  };
}

module.exports = { createAuth, hashPassword, verifyPassword };
