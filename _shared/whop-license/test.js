/*
 * Full-flow harness for whop-license.js — no real Whop, no browser.
 * Boots a fake Whop (OAuth authorize/token/userinfo + v1 access) and the REAL
 * device registry (license-registry/server), then drives:
 *   desktop first activation -> cached relaunch -> device limit -> self-serve
 *   deactivate -> grace expiry -> server one-time activation.
 */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const FAKE_PORT = 5597, REG_PORT = 5596;
process.env.WHOP_OAUTH_BASE = `http://127.0.0.1:${FAKE_PORT}/oauth`;
process.env.WHOP_API_BASE = `http://127.0.0.1:${FAKE_PORT}/api/v1`;
process.env.WHOP_DEVICE_REGISTRY = `http://127.0.0.1:${REG_PORT}`;
process.env.WHOP_EXPERIENCE_ID = 'exp_TESTAPP';
process.env.WHOP_CLIENT_ID = 'app_TEST';

const lic = require('./whop-license');
let failures = 0;
const assert = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + '  ' + m); if (!c) failures++; };
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'lic-'));

/* fake Whop: /oauth/authorize 302s back with a code; token/userinfo/access respond */
let fakeUser = 'user_ben', fakeHasAccess = true;
const fake = http.createServer((req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${FAKE_PORT}`);
  if (u.pathname === '/oauth/authorize') {
    const cb = new URL(u.searchParams.get('redirect_uri'));
    cb.searchParams.set('code', 'code-123');
    cb.searchParams.set('state', u.searchParams.get('state'));
    res.writeHead(302, { Location: cb.toString() }); return res.end();
  }
  res.setHeader('Content-Type', 'application/json');
  if (u.pathname === '/oauth/token') return res.end(JSON.stringify({ access_token: 'tok-' + fakeUser.replace('user_', ''), refresh_token: 'ref-1', expires_in: 3600 }));
  if (u.pathname === '/oauth/userinfo') return res.end(JSON.stringify({ sub: fakeUser }));
  if (u.pathname.startsWith('/api/v1/users/')) return res.end(JSON.stringify({ has_access: fakeHasAccess, access_level: fakeHasAccess ? 'customer' : 'no_access' }));
  res.writeHead(404); res.end();
});

/* "browser": follow the authorize URL redirect chain like a user clicking through */
const openUrl = url => fetch(url, { redirect: 'follow' });

(async () => {
  await new Promise(r => fake.listen(FAKE_PORT, r));
  const reg = spawn(process.execPath, [path.join(__dirname, '..', '..', 'license-registry', 'server', 'index.js')], {
    env: { ...process.env, PORT: REG_PORT, DATA_DIR: tmp(), WHOP_USERINFO_URL: `http://127.0.0.1:${FAKE_PORT}/oauth/userinfo`, MAX_DEVICES: '1' },
    stdio: 'ignore',
  });
  await new Promise(r => setTimeout(r, 1200));

  // each login gets its own loopback port (avoids keep-alive socket reuse between steps)
  let nextPort = 8741;
  const port = () => ({ config: { port: nextPort++ } });

  // 1. desktop first activation
  const dir1 = tmp();
  const r1 = await lic.ensureLicensed({ stateDir: dir1, openUrl, ...port() });
  assert(r1.ok && r1.firstActivation, 'desktop first activation via OAuth');
  const st = JSON.parse(fs.readFileSync(path.join(dir1, 'whop-license.json'), 'utf8'));
  assert(st.userId === 'user_ben' && st.deviceHash, 'state file has userId + deviceHash');

  // 2. relaunch: instant, no OAuth (kill the fake to prove nothing is called)
  const r2 = await lic.ensureLicensed({ stateDir: dir1, openUrl: () => { throw new Error('should not open browser'); } });
  assert(r2.ok && !r2.firstActivation, 'relaunch uses cache, no browser');

  // 3. device limit (MAX_DEVICES=1, same fingerprint = same device — simulate second device via changed state dir AND hash env? fingerprint is machine-bound, so re-register is idempotent. Register a synthetic 2nd device directly instead.)
  const reg2 = await fetch(`http://127.0.0.1:${REG_PORT}/devices/register`, {
    method: 'POST', headers: { Authorization: 'Bearer tok-ben', 'Content-Type': 'application/json' },
    body: JSON.stringify({ experience_id: 'exp_TESTAPP', device_hash: 'other-machine', device_label: 'Other PC' }),
  });
  assert(reg2.status === 409, 'registry enforces cap for a 2nd device (409)');
  const devices = (await reg2.json()).devices;
  assert(devices.length === 1, '409 returns current device list');

  // 4. self-serve deactivate then the other machine fits
  const de = await fetch(`http://127.0.0.1:${REG_PORT}/devices/deactivate`, {
    method: 'POST', headers: { Authorization: 'Bearer tok-ben', 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: devices[0].id }),
  });
  assert(de.ok, 'self-serve deactivate frees the slot');

  // 5. grace expiry: backdate lastCheck 11 days with lastGood=false -> throws + clears state
  const stale = { ...st, lastCheck: Date.now() - 11 * 24 * 3600 * 1000, lastGood: false, refreshToken: null };
  fs.writeFileSync(path.join(dir1, 'whop-license.json'), JSON.stringify(stale));
  let graceErr = null;
  await lic.ensureLicensed({ stateDir: dir1, openUrl: () => {} }).catch(e => (graceErr = e));
  assert(graceErr && graceErr.code === 'GRACE_EXPIRED', 'expired grace + failed check -> GRACE_EXPIRED');
  assert(!fs.existsSync(path.join(dir1, 'whop-license.json')), 'state cleared so next run re-activates');

  // 6. no-license user is refused
  fakeHasAccess = false;
  let deny = null;
  await lic.ensureLicensed({ stateDir: tmp(), openUrl, ...port() }).catch(e => (deny = e));
  assert(deny && deny.code === 'NO_LICENSE', 'user without membership -> NO_LICENSE');
  fakeHasAccess = true;

  // 7. server one-time activation
  const dataDir = tmp();
  assert(!lic.isActivated({ dataDir }), 'server app starts unactivated');
  const act = await lic.activateOnce({ dataDir, openUrl, ...port() });
  assert(act.ok, 'server activateOnce succeeds');
  assert(lic.isActivated({ dataDir }), 'activation file persisted');
  const act2 = await lic.activateOnce({ dataDir, openUrl: () => { throw new Error('no phone home'); } });
  assert(act2.already === true, 'second activateOnce is a no-op (never phones home again)');

  reg.kill(); fake.close();
  console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
