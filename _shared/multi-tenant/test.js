/*
 * Full-flow harness for the multi-tenant module — no Express, no network deps.
 * Boots a bare node:http app wired exactly like INTEGRATION.md prescribes
 * (authRouter -> gate -> dbMiddleware -> app routes using the mt.db proxy)
 * and drives: register -> login -> session persists (even across a second
 * server instance sharing system.db) -> per-user DB files -> user A's rows are
 * invisible to user B (API + raw file level) -> logout kills the session ->
 * wrong password / duplicate email / tampered cookie rejected -> purchase
 * gate refusal.
 *
 * better-sqlite3 is resolved from a sibling app's node_modules (the canonical
 * _shared copy has none). Override with MT_BSQLITE=<path-to-module-dir>.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

function resolveBetterSqlite3() {
  if (process.env.MT_BSQLITE) return require(process.env.MT_BSQLITE);
  const suiteRoot = path.join(__dirname, '..', '..');
  for (const dir of fs.readdirSync(suiteRoot)) {
    const p = path.join(suiteRoot, dir, 'node_modules', 'better-sqlite3');
    if (fs.existsSync(path.join(p, 'package.json'))) return require(p);
  }
  throw new Error('better-sqlite3 not found in any sibling app — set MT_BSQLITE');
}
const Database = resolveBetterSqlite3();
const { createMultiTenant } = require('./index.js');

let failures = 0;
const assert = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + '  ' + m); if (!c) failures++; };

/* ---- the "app": a notes app with the canonical single-tenant db-init ------ */
function openUserDb(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL)');
  return db;
}

function makeServer(mt, port) {
  const db = mt.db; // module-level handle, exactly like a converted app
  const server = http.createServer((req, res) => {
    // Body parsing happens BEFORE dbMiddleware — same rule as INTEGRATION.md
    // (mount express.json() and friends above mt.dbMiddleware): stream-event
    // callbacks registered before AsyncLocalStorage.run() lose the context.
    const run = () =>
      mt.authRouter(req, res, () =>
        mt.gate(req, res, () =>
          mt.dbMiddleware(req, res, () => {
            const p = req.url.split('?')[0];
            if (req.method === 'GET' && p === '/') {
              res.setHeader('Content-Type', 'text/html'); return res.end('<h1>app home</h1>');
            }
            if (req.method === 'GET' && p === '/api/notes') {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify(db.prepare('SELECT * FROM notes ORDER BY id').all()));
            }
            if (req.method === 'POST' && p === '/api/notes') {
              const info = db.prepare('INSERT INTO notes (text) VALUES (?)').run(req.body.text);
              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ id: info.lastInsertRowid }));
            }
            res.statusCode = 404; res.end('not found');
          })));
    if (req.method === 'POST' || req.method === 'PUT') {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', () => { try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; } run(); });
    } else run();
  });
  return new Promise((r) => server.listen(port, '127.0.0.1', () => r(server)));
}

/* ---- tiny client with per-user cookie jars -------------------------------- */
async function call(base, jar, method, p, body) {
  const res = await fetch(base + p, {
    method,
    redirect: 'manual',
    headers: { 'Content-Type': 'application/json', ...(jar.cookie ? { Cookie: jar.cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) jar.cookie = setCookie.split(';')[0];
  let data = null;
  try { data = JSON.parse(await res.clone().text()); } catch { data = await res.text(); }
  return { status: res.status, headers: res.headers, data };
}

(async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-test-'));
  const PORT = 5581, PORT2 = 5582;
  const BASE = `http://127.0.0.1:${PORT}`;

  const mt = createMultiTenant({ dataDir, openUserDb, Database, appName: 'MT Test App' });
  const server = await makeServer(mt, PORT);

  const A = {}, B = {}; // cookie jars

  // gate behavior for anonymous traffic
  const home = await call(BASE, {}, 'GET', '/');
  assert(home.status === 302 && home.headers.get('location') === '/auth/login',
    'anonymous page load redirects to /auth/login');
  const api = await call(BASE, {}, 'GET', '/api/notes');
  assert(api.status === 401, 'anonymous API call gets 401 JSON, not a redirect');
  const loginHtml = await call(BASE, {}, 'GET', '/auth/login');
  assert(loginHtml.status === 200 && String(loginHtml.data).includes('<form'),
    '/auth/login serves the self-contained login page');
  const asset = await call(BASE, {}, 'GET', '/assets/app.css');
  assert(asset.status === 404, 'static asset paths pass the gate (404 from app, not 302)');

  // registration
  const regA = await call(BASE, A, 'POST', '/auth/register', { email: 'A@Test.com', password: 'password-a1' });
  assert(regA.status === 201 && regA.data.user.email === 'a@test.com',
    'register user A (201, email normalized to lowercase)');
  assert(/^mt_session=[0-9a-f]{64}\.[0-9a-f]{64}$/.test(A.cookie), 'session cookie is <token>.<hmac signature>');
  const meA = await call(BASE, A, 'GET', '/auth/me');
  assert(meA.status === 200 && meA.data.user.email === 'a@test.com', 'GET /auth/me returns the session user');

  const idA = meA.data.user.id;
  assert(fs.existsSync(path.join(dataDir, 'users', idA + '.db')),
    'per-user DB file data/users/<id>.db created at registration');

  const dup = await call(BASE, {}, 'POST', '/auth/register', { email: 'a@test.com', password: 'password-xx' });
  assert(dup.status === 409, 'duplicate email registration rejected (409)');
  const shortPw = await call(BASE, {}, 'POST', '/auth/register', { email: 'c@test.com', password: 'short' });
  assert(shortPw.status === 400, 'short password rejected (400)');

  const regB = await call(BASE, B, 'POST', '/auth/register', { email: 'b@test.com', password: 'password-b1' });
  assert(regB.status === 201, 'register user B');
  const idB = regB.data.user.id;

  // per-user isolation through the app's untouched queries
  const write = await call(BASE, A, 'POST', '/api/notes', { text: 'alpha secret' });
  assert(write.status === 201, 'user A writes a row through the app route');
  const listA = await call(BASE, A, 'GET', '/api/notes');
  assert(listA.data.length === 1 && listA.data[0].text === 'alpha secret', 'user A sees their row');
  const listB = await call(BASE, B, 'GET', '/api/notes');
  assert(Array.isArray(listB.data) && listB.data.length === 0, "user B CANNOT see user A's row (file isolation)");

  // ...and at the raw file level
  const rawA = new Database(path.join(dataDir, 'users', idA + '.db'), { readonly: true });
  const rawB = new Database(path.join(dataDir, 'users', idB + '.db'), { readonly: true });
  assert(rawA.prepare('SELECT COUNT(*) n FROM notes').get().n === 1
      && rawB.prepare('SELECT COUNT(*) n FROM notes').get().n === 0,
    "on disk: A's db has the row, B's db does not");
  rawA.close(); rawB.close();

  // password storage + wrong password
  const stored = mt.systemDb.prepare('SELECT pass_hash FROM users WHERE id = ?').get(idA).pass_hash;
  assert(stored.startsWith('scrypt$') && !stored.includes('password-a1'),
    'password stored as salted scrypt hash, not plaintext');
  const badPw = await call(BASE, {}, 'POST', '/auth/login', { email: 'a@test.com', password: 'wrong-password' });
  assert(badPw.status === 401, 'wrong password rejected (401)');
  const badUser = await call(BASE, {}, 'POST', '/auth/login', { email: 'ghost@test.com', password: 'whatever12' });
  assert(badUser.status === 401, 'unknown email rejected (401)');

  // tampered cookie
  const tampered = { cookie: A.cookie.slice(0, -4) + 'beef' };
  const meTampered = await call(BASE, tampered, 'GET', '/auth/me');
  assert(meTampered.status === 401, 'tampered cookie signature rejected');

  // sessions are DB-backed: a SECOND instance over the same dataDir honors A's cookie
  const mt2 = createMultiTenant({ dataDir, openUserDb, Database, appName: 'MT Test App', verifyPurchase: () => false });
  const server2 = await makeServer(mt2, PORT2);
  const meRestart = await call(`http://127.0.0.1:${PORT2}`, { cookie: A.cookie }, 'GET', '/auth/me');
  assert(meRestart.status === 200 && meRestart.data.user.id === idA,
    'session survives process restart (SQLite-backed store in system.db)');

  // signup-gate: verifyPurchase() === false refuses registration
  const refused = await call(`http://127.0.0.1:${PORT2}`, {}, 'POST', '/auth/register',
    { email: 'nobuy@test.com', password: 'password-nn' });
  assert(refused.status === 403, 'verifyPurchase=false refuses registration (403 purchase gate)');

  // logout kills the session everywhere
  const out = await call(BASE, A, 'POST', '/auth/logout');
  assert(out.status === 200, 'logout succeeds');
  A.cookie = out.headers.get('set-cookie').includes('Max-Age=0') ? '' : A.cookie;
  const meOut = await call(BASE, A, 'GET', '/auth/me');
  assert(meOut.status === 401, 'session is dead after logout');

  // re-login works
  const relog = await call(BASE, A, 'POST', '/auth/login', { email: 'a@test.com', password: 'password-a1' });
  assert(relog.status === 200 && /^mt_session=/.test(A.cookie), 're-login issues a fresh session');

  // scheduler surface: forEachUserDb visits every user's DB
  const visited = [];
  mt.forEachUserDb(({ userId, db }) => { visited.push(userId); db.prepare('SELECT COUNT(*) n FROM notes').get(); });
  assert(visited.length === 2 && visited.includes(idA) && visited.includes(idB),
    'forEachUserDb visits both user DBs (background-job surface)');

  server.close(); server2.close(); mt.close(); mt2.close();
  console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
