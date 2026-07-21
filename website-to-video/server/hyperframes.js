'use strict';
// Hyperframes — UrlVid's local capture engine.
// Drives a headless Chromium through a page, captures an ordered PNG frame sequence to disk,
// and pipes it through ffmpeg (image2 -> chosen codec). Three modes:
//   scroll : deterministic top->bottom auto-scroll walkthrough
//   pan    : Ken-Burns — slow scroll with a subtle zoom ramp (works with any ffmpeg, no zoompan filter)
//   hero   : hold the viewport and sample at wall-clock intervals to catch live CSS/JS animation
//
// Frames are streamed to a temp dir (never held in RAM). We track and kill only the browser we
// launched, and always close the page in `finally`.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const { resolveChromiumPath, launchArgs } = require('./chromium');
const ff = require('./ffmpeg');

const PRESETS = {
  landscape: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
};

const MAX_FRAMES = parseInt(process.env.MAX_FRAMES || '1800', 10); // 60s * 30fps hard cap

let _browser = null;
let _launching = null;

async function getBrowser() {
  if (_browser && _browser.connected) return _browser;
  if (_launching) return _launching;
  const executablePath = resolveChromiumPath();
  if (!executablePath) {
    throw Object.assign(new Error('No Chromium found. Set CHROMIUM_PATH or install Chrome/Chromium.'), { code: 'NO_CHROMIUM' });
  }
  _launching = puppeteer.launch({
    executablePath,
    headless: true,
    args: launchArgs(),
  }).then((b) => {
    _browser = b;
    _launching = null;
    b.on('disconnected', () => { if (_browser === b) _browser = null; });
    return b;
  }).catch((e) => { _launching = null; throw e; });
  return _launching;
}

async function closeBrowser() {
  const b = _browser;
  _browser = null;
  if (!b) return;
  try {
    const proc = b.process();
    await b.close();
    if (proc && !proc.killed) proc.kill('SIGKILL');
  } catch (_) { /* ignore */ }
}

function clampInt(v, lo, hi, dflt) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
}
function even(n) { return Math.max(2, Math.round(n / 2) * 2); }

// Resolve + validate render options into a normalized spec.
function normalize(opts = {}) {
  const mode = ['scroll', 'pan', 'hero'].includes(opts.mode) ? opts.mode : 'scroll';
  const format = ['mp4', 'webm', 'gif'].includes(opts.format) ? opts.format : 'mp4';
  let width, height;
  if (opts.width || opts.height) {
    width = clampInt(opts.width, 160, 3840, 1920);
    height = clampInt(opts.height, 160, 3840, 1080);
  } else {
    const p = PRESETS[opts.preset] || PRESETS.landscape;
    width = p.width; height = p.height;
  }
  width = even(width); height = even(height);
  const fps = clampInt(opts.fps, 1, 60, 30);
  const duration = Math.max(1, Math.min(60, parseFloat(opts.duration) || 8));
  let frames = Math.round(fps * duration);
  if (frames > MAX_FRAMES) frames = MAX_FRAMES;
  if (frames < 1) frames = 1;
  return {
    url: opts.url,
    mode, format, width, height, fps, duration, frames,
    preset: opts.preset || (opts.width || opts.height ? 'custom' : 'landscape'),
    quality: clampInt(opts.quality, 1, 100, 70),
    darkMode: opts.dark_mode === true || opts.dark_mode === '1' || opts.dark_mode === 'true',
    waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'].includes(opts.wait_until) ? opts.wait_until : 'networkidle2',
    delay: clampInt(opts.delay, 0, 10000, 0),
    holdStart: clampInt(opts.hold_start, 0, 10000, 400),
    holdEnd: clampInt(opts.hold_end, 0, 10000, 400),
    hideSelectors: Array.isArray(opts.hide_selectors) ? opts.hide_selectors
      : (typeof opts.hide_selectors === 'string' && opts.hide_selectors.trim() ? opts.hide_selectors.split(',').map((s) => s.trim()).filter(Boolean) : []),
    scrollSpeed: opts.scroll_speed ? clampInt(opts.scroll_speed, 10, 20000, null) : null,
  };
}

// Map quality (1..100, higher=better) to a codec CRF-ish value.
function qualityToCrf(format, quality) {
  const q = Math.max(1, Math.min(100, quality));
  if (format === 'mp4') return Math.round(51 - (q / 100) * 33);   // ~51..18
  if (format === 'webm') return Math.round(63 - (q / 100) * 49);  // ~63..14 (VP8/VP9)
  return null;
}

// Per-frame page state for deterministic modes.
function frameState(spec, i, maxScroll) {
  const { frames, mode, fps, holdStart, holdEnd } = spec;
  const holdStartFrames = Math.min(frames - 1, Math.round((holdStart / 1000) * fps));
  const holdEndFrames = Math.min(frames - 1 - holdStartFrames, Math.round((holdEnd / 1000) * fps));
  const moving = Math.max(1, frames - holdStartFrames - holdEndFrames);
  let t; // 0..1 progress through the scroll
  if (i < holdStartFrames) t = 0;
  else if (i >= frames - holdEndFrames) t = 1;
  else t = (i - holdStartFrames) / (moving - 1 || 1);
  const scrollTop = Math.round(maxScroll * t);
  // pan adds a gentle zoom drift for a Ken-Burns feel
  const scale = mode === 'pan' ? 1 + 0.08 * t : 1;
  return { scrollTop, scale };
}

// Main entry: render a URL to a video file. Returns metadata.
async function render(spec, { framesDir, outPath, posterPath, onProgress = () => {} }) {
  const caps = ff.capabilities();
  if (!caps.ok) throw Object.assign(new Error('ffmpeg not found. Set FFMPEG_PATH or install ffmpeg.'), { code: 'NO_FFMPEG', status: 500 });
  if (!caps.formats[spec.format]) {
    throw Object.assign(new Error(`This ffmpeg build can't encode ${spec.format.toUpperCase()} (missing encoder). Install a full ffmpeg or choose webm.`), { code: 'NO_ENCODER', status: 422 });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();
  let captured = 0;
  try {
    await page.setViewport({ width: spec.width, height: spec.height, deviceScaleFactor: 1 });
    if (spec.darkMode) {
      await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    }
    await page.goto(spec.url, { waitUntil: spec.waitUntil, timeout: 45000 });
    if (spec.hideSelectors.length) {
      await page.evaluate((sels) => {
        for (const s of sels) { try { document.querySelectorAll(s).forEach((el) => el.remove()); } catch (_) {} }
      }, spec.hideSelectors).catch(() => {});
    }
    if (spec.delay) await new Promise((r) => setTimeout(r, spec.delay));

    const maxScroll = await page.evaluate(() => Math.max(0,
      Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement.scrollHeight) - window.innerHeight));

    // Frames are captured as JPEG: the universally-available mjpeg decoder lets us pipe them into
    // any ffmpeg (minimal builds ship an mjpeg decoder but no png decoder; full builds have both).
    const shot = async (idx) => {
      const file = path.join(framesDir, `frame-${String(idx + 1).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
      captured++;
      onProgress(0.05 + 0.75 * (captured / spec.frames));
    };

    if (spec.mode === 'hero') {
      // Wall-clock sampling to catch animation; keep the viewport fixed at the top.
      const interval = 1000 / spec.fps;
      const start = Date.now();
      for (let i = 0; i < spec.frames; i++) {
        const target = start + i * interval;
        const wait = target - Date.now();
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        await shot(i);
      }
    } else {
      let lastScale = 1;
      for (let i = 0; i < spec.frames; i++) {
        const { scrollTop, scale } = frameState(spec, i, maxScroll);
        await page.evaluate((y, s, changed) => {
          window.scrollTo(0, y);
          if (changed) {
            document.documentElement.style.transformOrigin = 'center top';
            document.documentElement.style.transform = s === 1 ? '' : `scale(${s})`;
          }
        }, scrollTop, scale, scale !== lastScale);
        lastScale = scale;
        // small settle so lazy content/paint catches up on the first frames
        if (i < 2) await new Promise((r) => setTimeout(r, 120));
        await shot(i);
      }
    }

    // Poster = a representative middle frame (JPEG).
    const posterFrame = path.join(framesDir, `frame-${String(Math.min(spec.frames, Math.ceil(spec.frames / 2))).padStart(5, '0')}.jpg`);
    try { fs.copyFileSync(posterFrame, posterPath); } catch (_) {}

    await encode(spec, framesDir, outPath, caps, (p) => onProgress(0.8 + 0.2 * p));

    const stat = fs.statSync(outPath);
    return { frames: captured, width: spec.width, height: spec.height, size: stat.size, outPath, posterPath };
  } finally {
    try { await page.close(); } catch (_) {}
  }
}

// Frames are streamed into ffmpeg over stdin as a concatenated PNG stream (image2pipe demuxer).
// PNG is self-delimiting so image2pipe demuxes it reliably — and this avoids the image2 numbered-file
// demuxer, which minimal ffmpeg builds (e.g. Playwright's) don't compile in. Works with full builds too.
function encode(spec, framesDir, outPath, caps, onProgress) {
  return new Promise((resolve, reject) => {
    const codec = ff.codecFor(spec.format, caps);
    const scaleFilter = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
    const args = ['-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(spec.fps), '-i', 'pipe:0'];
    if (spec.format === 'gif') {
      args.push('-vf', scaleFilter, '-c:v', 'gif');
    } else if (spec.format === 'webm') {
      const crf = qualityToCrf('webm', spec.quality);
      args.push('-vf', scaleFilter, '-c:v', codec.vcodec, '-b:v', '0', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-deadline', 'good', '-cpu-used', '2');
    } else { // mp4
      const crf = qualityToCrf('mp4', spec.quality);
      args.push('-vf', scaleFilter, '-c:v', codec.vcodec, '-crf', String(crf), '-pix_fmt', 'yuv420p', '-preset', 'medium', '-movflags', '+faststart');
    }
    args.push('-r', String(spec.fps), outPath);

    const proc = spawn(caps.bin, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    let settled = false;
    const done = (fn, arg) => { if (!settled) { settled = true; fn(arg); } };
    proc.stderr.on('data', (d) => { stderr += d.toString(); if (stderr.length > 8000) stderr = stderr.slice(-8000); });
    proc.on('error', (e) => done(reject, e));
    proc.stdin.on('error', () => { /* EPIPE if ffmpeg dies early — surfaced via close code */ });
    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 0) { onProgress(1); done(resolve); }
      else done(reject, Object.assign(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`), { code: 'ENCODE_FAILED' }));
    });

    // Pump frames in numeric order with backpressure handling.
    (async () => {
      const files = fs.readdirSync(framesDir).filter((f) => f.endsWith('.jpg')).sort();
      for (const f of files) {
        if (settled || proc.stdin.destroyed) break;
        const data = fs.readFileSync(path.join(framesDir, f));
        if (!proc.stdin.write(data)) await new Promise((r) => proc.stdin.once('drain', r));
      }
      proc.stdin.end();
    })().catch((e) => done(reject, e));
  });
}

function tmpFramesDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'urlvid-frames-'));
}

module.exports = { normalize, render, getBrowser, closeBrowser, tmpFramesDir, PRESETS, MAX_FRAMES };
