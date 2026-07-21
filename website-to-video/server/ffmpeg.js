'use strict';
// ffmpeg resolution + capability probing.
// UrlVid never bundles ffmpeg as a hard dependency (keeps `npm i` clean and offline).
// Resolution order: FFMPEG_PATH env -> optional `ffmpeg-static` module -> system `ffmpeg` on PATH.
// We probe `-encoders` once at boot and cache which output formats are actually available,
// so a missing codec becomes a clean 422 instead of a 500 mid-render.

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');

let _cache = null;

function resolveFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  // Optional dependency — present only if the user chose to install it.
  try {
    const p = require('ffmpeg-static');
    if (p && fs.existsSync(p)) return p;
  } catch (_) { /* not installed, fine */ }
  // Fall back to whatever `ffmpeg` resolves to on PATH.
  const which = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['ffmpeg'], { encoding: 'utf8' });
  if (which.status === 0) {
    const first = (which.stdout || '').split(/\r?\n/).find(Boolean);
    if (first && fs.existsSync(first.trim())) return first.trim();
  }
  return 'ffmpeg'; // last resort: hope it's on PATH at spawn time
}

function probe(bin) {
  let encoders = '';
  try {
    encoders = execFileSync(bin, ['-hide_banner', '-encoders'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (_) {
    return { ok: false, bin, formats: {}, encoders: [] };
  }
  const has = (re) => re.test(encoders);
  const formats = {
    // format -> { encoder detected, extra requirement note }
    webm: has(/\blibvpx(_vp8)?\b/) || has(/\blibvpx-vp9\b/),
    mp4: has(/\blibx264\b/) || has(/\bh264\b/),
    gif: has(/\bgif\b/),
  };
  return { ok: true, bin, formats, encoders };
}

// Public: cached capability set.
function capabilities() {
  if (_cache) return _cache;
  const bin = resolveFfmpegPath();
  _cache = probe(bin);
  return _cache;
}

function refresh() { _cache = null; return capabilities(); }

// Map an output format to its ffmpeg vcodec + container flags.
function codecFor(format, caps) {
  switch (format) {
    case 'webm':
      return { vcodec: caps.encoders && /libvpx-vp9/.test(caps.encoders) ? 'libvpx-vp9' : 'libvpx', container: 'webm', mime: 'video/webm', ext: 'webm' };
    case 'mp4':
      return { vcodec: 'libx264', container: 'mp4', mime: 'video/mp4', ext: 'mp4' };
    case 'gif':
      return { vcodec: 'gif', container: 'gif', mime: 'image/gif', ext: 'gif' };
    default:
      return null;
  }
}

module.exports = { resolveFfmpegPath, capabilities, refresh, codecFor };
