'use strict';
// UrlVid smoke test — exercises the real capture+encode pipeline against a local target page.
// Uses the resolved ffmpeg/chromium. NOTE: a minimal ffmpeg (e.g. Playwright's build) only ships
// VP8/WebM, so the end-to-end video assertions use format=webm; mp4/gif are codec-detected and the
// mp4 path is asserted to return a clean 422 when libx264 is absent (never a 500).

const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const SRV_PORT = 5385;
const TARGET_PORT = 5386;
const BASE = `http://127.0.0.1:${SRV_PORT}`;
const PASSWORD = 'smoke-pass';

let passed = 0, failed = 0, skipped = 0;
const ok = (name, cond, detail = '') => { if (cond) { passed++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${detail}`); } };
const skip = (name, why) => { skipped++; console.log(`  – ${name} (skipped: ${why})`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- target site: a tall, sectioned page with a hero + dark-mode CSS ----
const TARGET_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Smoke Target</title>
<style>
  body{margin:0;font-family:sans-serif}
  section{height:900px;display:grid;place-items:center;font-size:64px;color:#fff}
  #hero{background:#6d5efc}#s2{background:#0aa}#s3{background:#e0507a}#s4{background:#2b2f3a}
  @media (prefers-color-scheme: dark){#hero{background:#111}}
  #cookie{position:fixed;bottom:0;left:0;right:0;background:#000;color:#fff;padding:20px;text-align:center}
</style></head><body>
  <section id="hero">Hero</section><section id="s2">Two</section>
  <section id="s3">Three</section><section id="s4">Four</section>
  <div id="cookie">Accept cookies?</div>
</body></html>`;

function startTarget() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(TARGET_HTML); });
    s.listen(TARGET_PORT, '127.0.0.1', () => resolve(s));
  });
}

// ---- helpers ----
let COOKIE = '';
async function req(method, url, { key, body, cookie } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (key) headers['X-Api-Key'] = key;
  if (cookie) headers['Cookie'] = cookie;
  const res = await fetch(BASE + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return res;
}
async function buf(res) { return Buffer.from(await res.arrayBuffer()); }

function findBins() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  let chromium = process.env.CHROMIUM_PATH, ffmpeg = process.env.FFMPEG_PATH;
  try {
    if (!chromium) { const d = fs.readdirSync(root).find((x) => x.startsWith('chromium-')); if (d) chromium = path.join(root, d, 'chrome-linux', 'chrome'); }
    if (!ffmpeg) { const d = fs.readdirSync(root).find((x) => x.startsWith('ffmpeg-')); if (d) { const f = fs.readdirSync(path.join(root, d)).find((x) => x.startsWith('ffmpeg')); if (f) ffmpeg = path.join(root, d, f); } }
  } catch (_) {}
  return { chromium, ffmpeg };
}

async function main() {
  const target = await startTarget();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'urlvid-smoke-'));
  const bins = findBins();
  const env = {
    ...process.env,
    PORT: String(SRV_PORT), ADMIN_PASSWORD: PASSWORD,
    DB_PATH: path.join(dataDir, 'db.sqlite'), RENDERS_DIR: path.join(dataDir, 'renders'),
    MAX_CONCURRENT: '1', JOB_TIMEOUT_MS: '60000', ALLOW_PRIVATE: 'true',
  };
  if (bins.chromium) env.CHROMIUM_PATH = bins.chromium;
  if (bins.ffmpeg) env.FFMPEG_PATH = bins.ffmpeg;

  console.log(`\nStarting UrlVid server (chromium=${!!bins.chromium}, ffmpeg=${bins.ffmpeg || 'PATH'})…`);
  const server = spawn('node', [path.join(__dirname, '..', 'server', 'index.js')], { env, stdio: ['ignore', 'ignore', 'inherit'] });

  const cleanup = () => {
    try { server.kill('SIGTERM'); } catch (_) {}
    try { target.close(); } catch (_) {}
    setTimeout(() => { try { fs.rmSync(dataDir, { recursive: true, force: true }); } catch (_) {} }, 500);
  };

  try {
    // wait for boot
    let up = false;
    for (let i = 0; i < 40; i++) { try { const r = await req('GET', '/api/health'); if (r.ok) { up = true; break; } } catch (_) {} await sleep(250); }
    if (!up) throw new Error('server did not start');

    // 1. health
    const health = await (await req('GET', '/api/health')).json();
    ok('health ok', health.ok === true);
    ok('chromium detected', health.chromium.found === true, JSON.stringify(health.chromium));
    ok('ffmpeg detected', health.ffmpeg.found === true, JSON.stringify(health.ffmpeg));
    const canWebm = !!health.ffmpeg.formats.webm;
    const canMp4 = !!health.ffmpeg.formats.mp4;
    ok('webm encoder available (VP8 floor)', canWebm, JSON.stringify(health.ffmpeg.formats));

    // 2. auth gates
    ok('wrong password 401', (await req('POST', '/api/login', { body: { password: 'nope' } })).status === 401);
    const loginRes = await req('POST', '/api/login', { body: { password: PASSWORD } });
    ok('login 200', loginRes.status === 200);
    COOKIE = (loginRes.headers.get('set-cookie') || '').split(';')[0];
    ok('keys API unauth 401', (await req('GET', '/api/keys')).status === 401);

    // 3. create key
    const keyRes = await req('POST', '/api/keys', { cookie: COOKIE, body: { name: 'smoke', rate_per_min: 30 } });
    const keyRow = await keyRes.json();
    ok('create key 201', keyRes.status === 201);
    ok('key prefixed uv_', typeof keyRow.key === 'string' && keyRow.key.startsWith('uv_'), keyRow.key);
    const KEY = keyRow.key;

    const EBML = [0x1a, 0x45, 0xdf, 0xa3];
    const isWebm = (b) => b.length > 4 && EBML.every((x, i) => b[i] === x);
    const isJpeg = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

    if (canWebm) {
      // 4. sync render (scroll, webm)
      const r = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'scroll', format: 'webm', duration: 2, fps: 8, preset: 'landscape' } });
      ok('sync render 200', r.status === 200, `status ${r.status}`);
      ok('content-type video/webm', (r.headers.get('content-type') || '').includes('video/webm'));
      const body = await buf(r);
      ok('body is valid WebM (EBML magic)', isWebm(body), `len ${body.length}`);
      ok('body length > 2000', body.length > 2000, `len ${body.length}`);
      const rid = r.headers.get('x-urlvid-render-id');
      ok('render-id header set', !!rid);
      const frames = parseInt(r.headers.get('x-urlvid-frames'), 10);
      ok('frames ≈ fps*duration', frames >= 14 && frames <= 18, `frames ${frames}`);

      // library row + poster
      const lib = await (await req('GET', '/api/renders?limit=5', { cookie: COOKIE })).json();
      const row = lib.find((x) => String(x.id) === String(rid));
      ok('render row status done', row && row.status === 'done', row && row.status);
      ok('render row size matches body', row && Math.abs(row.size_bytes - body.length) < 50, row && `${row.size_bytes} vs ${body.length}`);
      const posterRes = await req('GET', `/api/renders/${rid}/poster`, { cookie: COOKIE });
      ok('poster served (JPEG)', posterRes.status === 200 && isJpeg(await buf(posterRes)));

      // 5. async render
      const a = await req('POST', '/api/v1/render?async=1', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'scroll', format: 'webm', duration: 1, fps: 8 } });
      ok('async render 202', a.status === 202, `status ${a.status}`);
      const { job_id } = await a.json();
      let done = null;
      for (let i = 0; i < 120; i++) { const j = await (await req('GET', `/api/v1/jobs/${job_id}`, { key: KEY })).json(); if (j.status === 'done') { done = j; break; } if (j.status === 'error') { done = j; break; } await sleep(500); }
      ok('async job done', done && done.status === 'done', done && (done.error || done.status));
      if (done && done.status === 'done') {
        const fb = await buf(await req('GET', `/api/v1/jobs/${job_id}/file`, { key: KEY }));
        ok('async output valid WebM', isWebm(fb));
      }

      // 6. hero + pan modes
      const hero = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'hero', format: 'webm', duration: 1, fps: 8 } });
      ok('hero mode 200 + WebM', hero.status === 200 && isWebm(await buf(hero)), `status ${hero.status}`);
      const pan = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'pan', format: 'webm', duration: 1, fps: 8 } });
      ok('pan mode 200 + WebM', pan.status === 200 && isWebm(await buf(pan)), `status ${pan.status}`);

      // 7. vertical preset dimensions
      const vert = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'scroll', format: 'webm', duration: 1, fps: 6, preset: 'vertical' } });
      const vrid = vert.headers.get('x-urlvid-render-id');
      await buf(vert);
      const vlib = await (await req('GET', '/api/renders?limit=5', { cookie: COOKIE })).json();
      const vrow = vlib.find((x) => String(x.id) === String(vrid));
      ok('vertical stored 1080x1920', vrow && vrow.width === 1080 && vrow.height === 1920, vrow && `${vrow.width}x${vrow.height}`);

      // hide_selectors still renders
      const hs = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, mode: 'scroll', format: 'webm', duration: 1, fps: 6, hide_selectors: '#cookie' } });
      ok('hide_selectors render 200', hs.status === 200, `status ${hs.status}`);
      await buf(hs);
    } else {
      skip('webm render pipeline', 'no webm encoder in resolved ffmpeg');
    }

    // 8. auth/guard/rate-limit (fast paths, no heavy render)
    ok('no key 401', (await req('POST', '/api/v1/render', { body: { url: 'http://127.0.0.1:' + TARGET_PORT } })).status === 401);
    // revoked key
    const rk = await (await req('POST', '/api/keys', { cookie: COOKIE, body: { name: 'rev' } })).json();
    await req('PUT', `/api/keys/${rk.id}`, { cookie: COOKIE, body: { revoked: 1 } });
    ok('revoked key 401', (await req('POST', '/api/v1/render', { key: rk.key, body: { url: 'http://127.0.0.1:' + TARGET_PORT } })).status === 401);
    // rate limit: fresh key rate=1, two rapid async requests
    const limited = await (await req('POST', '/api/keys', { cookie: COOKIE, body: { name: 'rl', rate_per_min: 1 } })).json();
    const first = await req('POST', '/api/v1/render?async=1', { key: limited.key, body: { url: `http://127.0.0.1:${TARGET_PORT}`, format: 'webm', duration: 1, fps: 4 } });
    const second = await req('POST', '/api/v1/render?async=1', { key: limited.key, body: { url: `http://127.0.0.1:${TARGET_PORT}`, format: 'webm', duration: 1, fps: 4 } });
    ok('rate limit: first allowed', first.status === 202 || first.status === 200, `status ${first.status}`);
    ok('rate limit: second 429', second.status === 429, `status ${second.status}`);

    // guard
    ok('file:// scheme 400', (await req('POST', '/api/v1/render', { key: KEY, body: { url: 'file:///etc/hosts' } })).status === 400);
    ok('missing url 400', (await req('POST', '/api/v1/render', { key: KEY, body: { mode: 'scroll' } })).status === 400);

    // 9. format negotiation for mp4
    const mp4 = await req('POST', '/api/v1/render', { key: KEY, body: { url: `http://127.0.0.1:${TARGET_PORT}`, format: 'mp4', duration: 1, fps: 6 } });
    if (canMp4) {
      ok('mp4 render 200 (libx264 present)', mp4.status === 200, `status ${mp4.status}`);
      await buf(mp4);
    } else {
      ok('mp4 → clean 422 when encoder missing (not 500)', mp4.status === 422, `status ${mp4.status}`);
    }
  } catch (err) {
    failed++; console.log('  ✗ FATAL', err.message);
  } finally {
    cleanup();
  }

  console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (!process.env.FFMPEG_PATH || /playwright/i.test(process.env.FFMPEG_PATH || '')) {
    console.log('Note: resolved ffmpeg is a minimal/VP8-only build — WebM path verified end-to-end; MP4/GIF require a full ffmpeg (e.g. the Docker image installs one).');
  }
  process.exit(failed === 0 ? 0 : 1);
}

main();
