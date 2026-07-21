'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { open, genKey, genToken } = require('./db');
const { RenderQueue } = require('./queue');
const guard = require('./guard');
const hf = require('./hyperframes');
const ff = require('./ffmpeg');

function config() {
  const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
  return {
    port: parseInt(process.env.PORT || '5375', 10),
    adminPassword: process.env.ADMIN_PASSWORD || 'admin',
    dbPath: process.env.DB_PATH || path.join(dataDir, 'urlvid.db'),
    rendersDir: process.env.RENDERS_DIR || path.join(dataDir, 'renders'),
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT || '1', 10),
    jobTimeoutMs: parseInt(process.env.JOB_TIMEOUT_MS || '120000', 10),
    allowPrivate: (process.env.ALLOW_PRIVATE || 'true') !== 'false',
    autoAdmin: process.env.AUTO_ADMIN === '1', // desktop mode: auto-login
  };
}

function createApp(cfg) {
  const db = open(cfg.dbPath);
  const queue = new RenderQueue({ db, rendersDir: cfg.rendersDir, concurrency: cfg.maxConcurrent, jobTimeoutMs: cfg.jobTimeoutMs });
  const rateBuckets = new Map(); // key -> [timestamps]

  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ---- helpers ----
  const cookie = (req, name) => {
    const raw = req.headers.cookie || '';
    const m = raw.split(';').map((s) => s.trim()).find((s) => s.startsWith(name + '='));
    return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
  };
  function validSession(req) {
    if (cfg.autoAdmin) return true;
    const t = cookie(req, 'uv_session');
    if (!t) return false;
    return !!db.prepare('SELECT 1 FROM sessions WHERE token=?').get(t);
  }
  function requireAdmin(req, res, next) {
    if (validSession(req)) return next();
    res.status(401).json({ error: 'Unauthorized' });
  }
  function apiKeyAuth(req, res, next) {
    const key = req.get('X-Api-Key') || req.query.key || (req.body && req.body.key);
    if (!key) return res.status(401).json({ error: 'Missing API key (X-Api-Key header or ?key=).' });
    const row = db.prepare('SELECT * FROM api_keys WHERE key=?').get(key);
    if (!row || row.revoked) return res.status(401).json({ error: 'Invalid or revoked API key.' });
    // daily quota rollover
    const today = new Date().toISOString().slice(0, 10);
    if (row.today_date !== today) { db.prepare('UPDATE api_keys SET today_date=?, renders_today=0 WHERE id=?').run(today, row.id); row.renders_today = 0; }
    if (row.daily_quota > 0 && row.renders_today >= row.daily_quota) return res.status(429).json({ error: 'Daily quota exceeded.' });
    // rate limit (rolling 60s)
    const now = Date.now();
    const bucket = (rateBuckets.get(key) || []).filter((t) => t > now - 60000);
    if (row.rate_per_min > 0 && bucket.length >= row.rate_per_min) {
      res.set('Retry-After', '60');
      return res.status(429).json({ error: 'Rate limit exceeded.' });
    }
    bucket.push(now); rateBuckets.set(key, bucket);
    req.apiKey = row;
    next();
  }

  // ---- health / meta ----
  app.get('/api/health', (req, res) => {
    const caps = ff.capabilities();
    res.json({
      ok: true,
      chromium: { found: !!require('./chromium').resolveChromiumPath(), path: require('./chromium').resolveChromiumPath() || null },
      ffmpeg: { found: caps.ok, path: caps.ok ? caps.bin : null, formats: caps.formats || {} },
      presets: Object.keys(hf.PRESETS),
      maxFrames: hf.MAX_FRAMES,
    });
  });

  // ---- auth ----
  app.post('/api/login', (req, res) => {
    if ((req.body.password || '') !== cfg.adminPassword) return res.status(401).json({ error: 'Wrong password.' });
    const token = genToken();
    db.prepare('INSERT INTO sessions (token) VALUES (?)').run(token);
    res.set('Set-Cookie', `uv_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`);
    res.json({ ok: true });
  });
  app.post('/api/logout', (req, res) => {
    const t = cookie(req, 'uv_session');
    if (t) db.prepare('DELETE FROM sessions WHERE token=?').run(t);
    res.set('Set-Cookie', 'uv_session=; Path=/; Max-Age=0');
    res.json({ ok: true });
  });
  app.get('/api/me', (req, res) => res.json({ authed: validSession(req) }));

  // ---- api keys (admin) ----
  app.get('/api/keys', requireAdmin, (req, res) => {
    res.json(db.prepare('SELECT id,name,key,rate_per_min,daily_quota,renders_total,renders_today,revoked,created_at FROM api_keys ORDER BY id DESC').all());
  });
  app.post('/api/keys', requireAdmin, (req, res) => {
    const name = (req.body.name || 'Key').toString().slice(0, 60);
    const rate = parseInt(req.body.rate_per_min, 10); const quota = parseInt(req.body.daily_quota, 10);
    const key = genKey();
    const info = db.prepare('INSERT INTO api_keys (name,key,rate_per_min,daily_quota) VALUES (?,?,?,?)')
      .run(name, key, Number.isNaN(rate) ? 30 : rate, Number.isNaN(quota) ? 0 : quota);
    res.status(201).json(db.prepare('SELECT * FROM api_keys WHERE id=?').get(info.lastInsertRowid));
  });
  app.put('/api/keys/:id', requireAdmin, (req, res) => {
    const { name, rate_per_min, daily_quota, revoked } = req.body;
    db.prepare('UPDATE api_keys SET name=COALESCE(?,name), rate_per_min=COALESCE(?,rate_per_min), daily_quota=COALESCE(?,daily_quota), revoked=COALESCE(?,revoked) WHERE id=?')
      .run(name ?? null, rate_per_min ?? null, daily_quota ?? null, revoked ?? null, req.params.id);
    res.json({ ok: true });
  });
  app.delete('/api/keys/:id', requireAdmin, (req, res) => { db.prepare('DELETE FROM api_keys WHERE id=?').run(req.params.id); res.json({ ok: true }); });
  app.post('/api/keys/:id/regenerate', requireAdmin, (req, res) => {
    const key = genKey();
    db.prepare('UPDATE api_keys SET key=?, revoked=0 WHERE id=?').run(key, req.params.id);
    res.json({ ok: true, key });
  });

  // ---- the render engine (API-key auth) ----
  function parseRenderReq(req) {
    const src = req.method === 'GET' ? req.query : { ...req.query, ...req.body };
    return hf.normalize(src);
  }
  function tallyKey(keyId, statusCode, tookMs) {
    db.prepare('UPDATE api_keys SET renders_total=renders_total+1, renders_today=renders_today+1 WHERE id=?').run(keyId);
    db.prepare('INSERT INTO usage_log (api_key_id,status_code,took_ms) VALUES (?,?,?)').run(keyId, statusCode, tookMs);
  }

  async function handleRender(req, res) {
    const started = Date.now();
    const spec = parseRenderReq(req);
    if (!spec.url) return res.status(400).json({ error: 'url is required.' });
    const blocked = guard.check(spec.url, { allowPrivate: cfg.allowPrivate });
    if (blocked) return res.status(400).json({ error: blocked });

    const caps = ff.capabilities();
    if (!caps.ok) return res.status(500).json({ error: 'ffmpeg not found on this server. Set FFMPEG_PATH or install ffmpeg.' });
    if (!caps.formats[spec.format]) return res.status(422).json({ error: `This server's ffmpeg can't encode ${spec.format.toUpperCase()}. Install a full ffmpeg build or use format=webm.`, formats: caps.formats });

    const info = db.prepare(`INSERT INTO renders (url,mode,preset,width,height,fps,duration_s,format,params_json,api_key_id,status) VALUES (?,?,?,?,?,?,?,?,?,?, 'queued')`)
      .run(spec.url, spec.mode, spec.preset, spec.width, spec.height, spec.fps, spec.duration, spec.format, JSON.stringify(spec), req.apiKey.id);
    const rowId = info.lastInsertRowid;
    const asyncMode = req.query.async === '1' || req.body.async === '1' || req.body.async === true;

    if (asyncMode) {
      queue.enqueue(rowId, spec).catch(() => {}); // errors captured on the row
      tallyKey(req.apiKey.id, 202, Date.now() - started);
      return res.status(202).json({ job_id: rowId, status: 'queued', poll: `/api/v1/jobs/${rowId}` });
    }

    try {
      const result = await queue.enqueue(rowId, spec);
      const codec = ff.codecFor(spec.format, caps);
      tallyKey(req.apiKey.id, 200, Date.now() - started);
      res.set('Content-Type', codec.mime);
      res.set('X-UrlVid-Render-Id', String(rowId));
      res.set('X-UrlVid-Frames', String(result.frames));
      res.set('Content-Disposition', `inline; filename="urlvid-${rowId}.${codec.ext}"`);
      fs.createReadStream(result.outPath).pipe(res);
    } catch (err) {
      const status = err.status || 500;
      tallyKey(req.apiKey.id, status, Date.now() - started);
      res.status(status).json({ error: err.message || 'Render failed.', code: err.code });
    }
  }
  app.get('/api/v1/render', apiKeyAuth, handleRender);
  app.post('/api/v1/render', apiKeyAuth, handleRender);

  app.get('/api/v1/jobs/:id', apiKeyAuth, (req, res) => {
    const row = db.prepare('SELECT id,url,mode,preset,format,width,height,frames,size_bytes,status,progress,error,took_ms FROM renders WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Job not found.' });
    const out = { job_id: row.id, status: row.status, progress: row.progress, error: row.error, meta: row };
    if (row.status === 'done') out.output = `/api/v1/jobs/${row.id}/file`;
    res.json(out);
  });
  app.get('/api/v1/jobs/:id/file', apiKeyAuth, (req, res) => sendRenderFile(res, req.params.id));

  // ---- library (admin) ----
  app.get('/api/renders', requireAdmin, (req, res) => {
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 50);
    const q = req.query.q ? `%${req.query.q}%` : '%';
    res.json(db.prepare(`SELECT id,url,mode,preset,format,width,height,fps,duration_s,size_bytes,frames,status,progress,error,took_ms,created_at FROM renders WHERE url LIKE ? ORDER BY id DESC LIMIT ?`).all(q, limit));
  });
  function sendRenderFile(res, id) {
    const row = db.prepare('SELECT file_path,format FROM renders WHERE id=?').get(id);
    if (!row || !row.file_path || !fs.existsSync(row.file_path)) return res.status(404).json({ error: 'Not found.' });
    const codec = ff.codecFor(row.format, ff.capabilities());
    res.set('Content-Type', codec ? codec.mime : 'application/octet-stream');
    fs.createReadStream(row.file_path).pipe(res);
  }
  app.get('/api/renders/:id/file', requireAdmin, (req, res) => sendRenderFile(res, req.params.id));
  app.get('/api/renders/:id/poster', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT poster_path FROM renders WHERE id=?').get(req.params.id);
    if (!row || !row.poster_path || !fs.existsSync(row.poster_path)) return res.status(404).end();
    res.set('Content-Type', 'image/jpeg');
    fs.createReadStream(row.poster_path).pipe(res);
  });
  app.delete('/api/renders/:id', requireAdmin, (req, res) => {
    const row = db.prepare('SELECT file_path,poster_path FROM renders WHERE id=?').get(req.params.id);
    if (row) { for (const p of [row.file_path, row.poster_path]) { try { if (p) fs.rmSync(p, { force: true }); } catch (_) {} } }
    db.prepare('DELETE FROM renders WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  });
  app.post('/api/renders/clear', requireAdmin, (req, res) => {
    for (const r of db.prepare('SELECT file_path,poster_path FROM renders').all()) { for (const p of [r.file_path, r.poster_path]) { try { if (p) fs.rmSync(p, { force: true }); } catch (_) {} } }
    db.prepare('DELETE FROM renders').run();
    res.json({ ok: true });
  });

  // ---- stats + settings (admin) ----
  app.get('/api/stats', requireAdmin, (req, res) => {
    const today = new Date().toISOString().slice(0, 10);
    res.json({
      renders_today: db.prepare(`SELECT COUNT(*) n FROM renders WHERE substr(created_at,1,10)=?`).get(today).n,
      renders_total: db.prepare('SELECT COUNT(*) n FROM renders').get().n,
      avg_ms: Math.round(db.prepare(`SELECT AVG(took_ms) a FROM renders WHERE status='done'`).get().a || 0),
      keys: db.prepare('SELECT COUNT(*) n FROM api_keys WHERE revoked=0').get().n,
      recent: db.prepare(`SELECT status_code, took_ms, created_at FROM usage_log ORDER BY id DESC LIMIT 50`).all(),
    });
  });
  app.get('/api/settings', requireAdmin, (req, res) => {
    res.json({ allow_private: cfg.allowPrivate, max_concurrent: cfg.maxConcurrent, ffmpeg: ff.capabilities().formats });
  });

  // ---- static frontend ----
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

  return { app, db, queue };
}

function start() {
  const cfg = config();
  const { app } = createApp(cfg);
  const server = app.listen(cfg.port, () => {
    const caps = ff.capabilities();
    console.log(`\n  UrlVid running → http://localhost:${cfg.port}`);
    console.log(`  Chromium: ${require('./chromium').resolveChromiumPath() || 'NOT FOUND (set CHROMIUM_PATH)'}`);
    console.log(`  ffmpeg:   ${caps.ok ? caps.bin : 'NOT FOUND (set FFMPEG_PATH)'}  formats: ${caps.ok ? Object.entries(caps.formats).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none' : '-'}\n`);
  });
  const shutdown = async () => { try { await hf.closeBrowser(); } catch (_) {} server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000); };
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
  return server;
}

if (require.main === module) start();
module.exports = { createApp, config, start };
