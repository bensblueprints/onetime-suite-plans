/*
 * db-router.js — per-user SQLite routing for hosted multi-tenant mode.
 *
 * Architecture (FINAL): app code stays single-tenant; each registered user
 * gets their OWN database file at <dataDir>/users/<userId>.db. Isolation is
 * file-based — app queries are untouched.
 *
 * The app hands us its existing db-init function (`openUserDb(dbPath)`, the
 * module that opens SQLite and runs its CREATE TABLE IF NOT EXISTS schema).
 * First open of a user's file therefore creates + migrates it automatically.
 *
 * Open handles are LRU-cached (better-sqlite3 handles are cheap, but don't
 * hold hundreds open — least-recently-used is closed past `maxOpen`).
 *
 * Two ways for app code to reach the current user's DB:
 *   1. `req.db` (set by the dbMiddleware wired in index.js)
 *   2. `router.db` — a Proxy bound via AsyncLocalStorage to the request's
 *      handle, so a module-level `const db = mt.db` keeps every existing
 *      `db.prepare(...)` call site working unchanged.
 * Background jobs (schedulers) use `forEachUserDb(fn)` to visit every user's
 * DB per tick, or `runWith(userId, fn)` to run inside a user's context.
 */
const path = require('path');
const fs = require('fs');
const { AsyncLocalStorage } = require('async_hooks');

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

function createDbRouter({ dataDir, openUserDb, maxOpen = 200 } = {}) {
  if (!dataDir) throw new Error('db-router: dataDir is required');
  if (typeof openUserDb !== 'function') {
    throw new Error("db-router: openUserDb(dbPath) is required (pass the app's existing db-init/openDb)");
  }
  const usersDir = path.join(dataDir, 'users');
  fs.mkdirSync(usersDir, { recursive: true });

  const als = new AsyncLocalStorage();
  const cache = new Map(); // userId -> open db handle; Map insertion order = LRU order

  function dbPathFor(userId) {
    userId = String(userId);
    if (!SAFE_ID.test(userId)) throw new Error('db-router: invalid user id: ' + userId);
    return path.join(usersDir, userId + '.db');
  }

  function dbFor(userId) {
    userId = String(userId);
    const cached = cache.get(userId);
    if (cached) {
      cache.delete(userId);
      cache.set(userId, cached); // bump to most-recently-used
      return cached;
    }
    const db = openUserDb(dbPathFor(userId)); // creates + runs app schema on first open
    cache.set(userId, db);
    while (cache.size > maxOpen) {
      const [oldId, oldDb] = cache.entries().next().value; // least-recently-used
      cache.delete(oldId);
      try { oldDb.close(); } catch { /* already closed */ }
    }
    return db;
  }

  /* All user ids that have a DB file on disk (includes users not currently cached). */
  function listUserIds() {
    let files;
    try { files = fs.readdirSync(usersDir); } catch { return []; }
    return files
      .filter((f) => f.endsWith('.db') && SAFE_ID.test(f.slice(0, -3)))
      .map((f) => f.slice(0, -3))
      .sort(); // deterministic order (cross-user lookups: first match wins)
  }

  /*
   * Visit every user DB: fn({ userId, db }). Doubles as a cross-user finder —
   * the FIRST non-undefined return value stops iteration and is returned
   * (used for public token/slug lookups where the owner is unknown).
   * Schedulers just return undefined to visit all.
   */
  function forEachUserDb(fn) {
    for (const userId of listUserIds()) {
      const out = fn({ userId, db: dbFor(userId) });
      if (out !== undefined) return out;
    }
    return undefined;
  }

  /* Run fn() with the ALS proxy bound to this user's DB. */
  function runWith(userId, fn) {
    return als.run(dbFor(userId), fn);
  }

  /*
   * Drop-in stand-in for the app's old module-level `db`. Resolves to the
   * current request's (or runWith context's) handle on every property access.
   */
  const db = new Proxy({}, {
    get(_t, prop) {
      const handle = als.getStore();
      if (!handle) {
        throw new Error(
          `multi-tenant db-router: db.${String(prop)} used outside a user context ` +
          '(route not behind dbMiddleware, or a background job — use forEachUserDb/runWith)'
        );
      }
      const v = handle[prop];
      return typeof v === 'function' ? v.bind(handle) : v;
    },
    has(_t, prop) {
      const handle = als.getStore();
      return handle ? prop in handle : false;
    },
  });

  function closeAll() {
    for (const [, h] of cache) { try { h.close(); } catch { /* noop */ } }
    cache.clear();
  }

  return { db, dbFor, dbPathFor, listUserIds, forEachUserDb, runWith, closeAll, _cache: cache };
}

module.exports = { createDbRouter };
