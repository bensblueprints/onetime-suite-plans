/*
 * index.js — one-call wiring for hosted multi-tenant mode.
 *
 *   const { createMultiTenant } = require('./multi-tenant/index.js');
 *   // ESM apps: const { createMultiTenant } =
 *   //   createRequire(import.meta.url)('./multi-tenant/index.js');
 *
 *   const mt = createMultiTenant({
 *     dataDir: DATA_DIR,             // app's data dir (system.db + users/ live here)
 *     openUserDb: openDb,            // the app's EXISTING db-init (opens + CREATE TABLE IF NOT EXISTS)
 *     appName: 'My App',
 *     publicPaths: ['/ping/', /^\/[a-z0-9-]+$/],  // routes that stay public
 *   });
 *
 *   app.use(mt.authRouter);   // /auth/* pages + endpoints
 *   app.use(mt.gate);         // redirect anonymous page loads to /auth/login, 401 anonymous API calls
 *   app.use(mt.dbMiddleware); // req.user + req.db + binds mt.db proxy for this request
 *
 *   const db = mt.db;         // drop-in replacement for the old module-level db handle
 *
 * See INTEGRATION.md for the full per-app checklist.
 */
const { createDbRouter } = require('./db-router.js');
const { createAuth } = require('./auth.js');
const { createGate } = require('./gate.js');

function createMultiTenant({
  dataDir,
  openUserDb,
  appName = 'App',
  Database,            // better-sqlite3 ctor for system.db; defaults to require('better-sqlite3')
  sessionSecret,
  sessionTtlMs,
  cookieName,
  cookieSecure,
  verifyPurchase,
  publicPaths = [],
  apiPrefixes = ['/api/'],
  maxOpen,
} = {}) {
  const dbRouter = createDbRouter({ dataDir, openUserDb, maxOpen });
  const auth = createAuth({
    dataDir, Database, appName, sessionSecret, sessionTtlMs, cookieName, cookieSecure, verifyPurchase,
    onUserCreated: (id) => dbRouter.dbFor(id), // eagerly create data/users/<id>.db at registration
  });
  const gate = createGate({ getUser: auth.getUser, publicPaths, apiPrefixes });

  /* Attach req.user + req.db and bind the mt.db proxy for the rest of the request. */
  function dbMiddleware(req, res, next) {
    const user = auth.getUser(req);
    if (!user) return next(); // public route (gate already vetted access)
    req.user = user;
    req.db = dbRouter.dbFor(user.id);
    dbRouter.runWith(user.id, next);
  }

  return {
    // middleware (mount in this order, at the top of the app)
    authRouter: auth.router,
    gate,
    dbMiddleware,
    // per-user DB access
    db: dbRouter.db,                       // ALS-bound proxy: drop-in for the old module-level handle
    dbFor: dbRouter.dbFor,
    dbPathFor: dbRouter.dbPathFor,
    listUserIds: dbRouter.listUserIds,
    forEachUserDb: dbRouter.forEachUserDb, // schedulers + cross-user public lookups
    runWith: dbRouter.runWith,
    // auth utilities
    getUser: auth.getUser,
    requireUser: auth.requireUser,
    logout: auth.logout,                   // (req, res) — for legacy /api/logout shims
    systemDb: auth.systemDb,
    close: () => { dbRouter.closeAll(); auth.close(); },
  };
}

module.exports = { createMultiTenant };
