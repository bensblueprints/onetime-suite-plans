/*
 * gate.js — middleware-ordering helper for hosted multi-tenant mode, plus the
 * self-contained login/register HTML pages (inline CSS, zero external assets).
 *
 * Ordering contract (wired by index.js — mount at the TOP of the app):
 *   app.use(mt.authRouter);   // serves + handles /auth/*
 *   app.use(mt.gate);         // everything below here requires a session…
 *   app.use(mt.dbMiddleware); // …and runs against the user's own DB
 *
 * Pass-through rules (in order):
 *   1. /auth/*                          -> next() (authRouter owns these)
 *   2. static assets (/assets/, common extensions) -> next()
 *   3. publicPaths (string prefix, RegExp, or predicate fn) -> next()
 *   4. authenticated                    -> next()
 *   5. API-shaped request               -> 401 JSON
 *   6. anything else                    -> 302 redirect to /auth/login
 */

const ASSET_RE = /\.(js|mjs|css|map|png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|eot|txt|webmanifest)$/i;

function createGate({ getUser, publicPaths = [], apiPrefixes = ['/api/'], loginPath = '/auth/login' } = {}) {
  if (typeof getUser !== 'function') throw new Error('gate: getUser(req) is required');

  const matches = (p, rule) => {
    if (typeof rule === 'string') return p === rule || p.startsWith(rule.endsWith('/') ? rule : rule + '/');
    if (rule instanceof RegExp) return rule.test(p);
    if (typeof rule === 'function') return !!rule(p);
    return false;
  };

  return function gate(req, res, next) {
    const p = (req.path || req.url.split('?')[0]) || '/';
    if (p === '/auth' || p.startsWith('/auth/')) return next();
    if (p.startsWith('/assets/') || ASSET_RE.test(p)) return next();
    if (publicPaths.some((rule) => matches(p, rule))) return next();
    if (getUser(req)) return next();

    const accept = String(req.headers.accept || '');
    const isApi = apiPrefixes.some((pre) => matches(p, pre)) ||
      (accept.includes('application/json') && !accept.includes('text/html'));
    if (isApi) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'unauthorized', login: loginPath }));
    }
    res.statusCode = 302;
    res.setHeader('Location', loginPath);
    res.end();
  };
}

/* ---- login / register pages (self-contained, minimal) -------------------- */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function authPage(mode, appName) {
  const login = mode === 'login';
  const title = login ? 'Sign in' : 'Create account';
  const alt = login
    ? 'No account yet? <a href="/auth/register">Create one</a>'
    : 'Already have an account? <a href="/auth/login">Sign in</a>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — ${esc(appName)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; min-height: 100vh;
         display: grid; place-items: center; background: #0b0d12; color: #e6e9ef; }
  .card { width: min(380px, 92vw); background: #141821; border: 1px solid #232a38;
          border-radius: 12px; padding: 32px 28px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .app { color: #8b93a7; font-size: 13px; margin-bottom: 24px; }
  label { display: block; font-size: 13px; color: #aab2c5; margin: 14px 0 6px; }
  input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #2b3446;
          background: #0b0d12; color: inherit; font-size: 15px; }
  input:focus { outline: 2px solid #4f7cff; border-color: transparent; }
  button { width: 100%; margin-top: 22px; padding: 11px; border: 0; border-radius: 8px;
           background: #4f7cff; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
  button:disabled { opacity: .6; cursor: wait; }
  .err { display: none; margin-top: 14px; padding: 10px 12px; border-radius: 8px; font-size: 13px;
         background: #3b1620; color: #ff9db0; border: 1px solid #5c2231; }
  .alt { margin-top: 20px; font-size: 13px; color: #8b93a7; text-align: center; }
  .alt a { color: #7ea2ff; text-decoration: none; }
</style>
</head>
<body>
<main class="card">
  <h1>${title}</h1>
  <div class="app">${esc(appName)}</div>
  <form id="f">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" autocomplete="email" required autofocus>
    <label for="password">Password</label>
    <input id="password" name="password" type="password" minlength="8"
           autocomplete="${login ? 'current-password' : 'new-password'}" required>
    <button type="submit">${title}</button>
    <div class="err" id="err"></div>
  </form>
  <div class="alt">${alt}</div>
</main>
<script>
  var f = document.getElementById('f'), err = document.getElementById('err');
  f.addEventListener('submit', async function (e) {
    e.preventDefault();
    err.style.display = 'none';
    var btn = f.querySelector('button'); btn.disabled = true;
    try {
      var r = await fetch('/auth/${login ? 'login' : 'register'}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: f.email.value.trim(), password: f.password.value })
      });
      var d = await r.json().catch(function () { return {}; });
      if (r.ok) { location.href = d.redirect || '/'; return; }
      err.textContent = d.error || ('Request failed (' + r.status + ')');
      err.style.display = 'block';
    } catch (x) {
      err.textContent = 'Network error — try again.';
      err.style.display = 'block';
    }
    btn.disabled = false;
  });
</script>
</body>
</html>`;
}

const loginPage = (appName) => authPage('login', appName);
const registerPage = (appName) => authPage('register', appName);

module.exports = { createGate, loginPage, registerPage };
