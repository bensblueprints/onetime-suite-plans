'use strict';
// Tiny FIFO render queue with a concurrency cap and per-job timeout.
// Each job runs the Hyperframes engine; progress is written back to the `renders` row.
const fs = require('fs');
const path = require('path');
const hf = require('./hyperframes');

class RenderQueue {
  constructor({ db, rendersDir, concurrency = 1, jobTimeoutMs = 120000 }) {
    this.db = db;
    this.rendersDir = rendersDir;
    this.concurrency = Math.max(1, concurrency);
    this.jobTimeoutMs = jobTimeoutMs;
    this.active = 0;
    this.waiting = [];
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  // Enqueue a render for an existing `renders` row id + normalized spec. Returns a promise
  // that resolves with the render metadata (or rejects on failure).
  enqueue(rowId, spec) {
    return new Promise((resolve, reject) => {
      this.waiting.push({ rowId, spec, resolve, reject });
      this._pump();
    });
  }

  _pump() {
    while (this.active < this.concurrency && this.waiting.length) {
      const job = this.waiting.shift();
      this.active++;
      this._run(job).finally(() => { this.active--; this._pump(); });
    }
  }

  async _run({ rowId, spec, resolve, reject }) {
    const started = Date.now();
    const framesDir = hf.tmpFramesDir();
    const outPath = path.join(this.rendersDir, `render-${rowId}.${spec.format}`);
    const posterPath = path.join(this.rendersDir, `render-${rowId}.poster.jpg`);
    const setProgress = this.db.prepare('UPDATE renders SET progress=?, status=? WHERE id=?');
    setProgress.run(0, 'running', rowId);

    let timer;
    try {
      const result = await Promise.race([
        hf.render(spec, {
          framesDir, outPath, posterPath,
          onProgress: (p) => { try { this.db.prepare('UPDATE renders SET progress=? WHERE id=?').run(Math.min(0.99, p), rowId); } catch (_) {} },
        }),
        new Promise((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error('Render timed out.'), { code: 'TIMEOUT', status: 504 })), this.jobTimeoutMs); }),
      ]);
      clearTimeout(timer);
      const tookMs = Date.now() - started;
      this.db.prepare(`UPDATE renders SET status='done', progress=1, file_path=?, poster_path=?, size_bytes=?, frames=?, width=?, height=?, took_ms=? WHERE id=?`)
        .run(result.outPath, fs.existsSync(posterPath) ? posterPath : null, result.size, result.frames, result.width, result.height, tookMs, rowId);
      resolve({ ...result, tookMs, rowId });
    } catch (err) {
      clearTimeout(timer);
      this.db.prepare(`UPDATE renders SET status='error', error=? WHERE id=?`).run(String(err.message || err).slice(0, 500), rowId);
      reject(err);
    } finally {
      try { fs.rmSync(framesDir, { recursive: true, force: true }); } catch (_) {}
    }
  }
}

module.exports = { RenderQueue };
