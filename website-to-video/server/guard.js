'use strict';
// URL guard — scheme allow-list + optional private-network block (SSRF hygiene).
const net = require('net');

function isPrivateHost(host) {
  const h = (host || '').toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === '::1' || h === '0.0.0.0') return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (net.isIP(h) === 4) {
    const p = h.split('.').map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 169 && p[1] === 254) return true;
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
  }
  if (net.isIP(h) === 6 && (h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80'))) return true;
  return false;
}

// Returns null if allowed, or an error message string if blocked.
function check(rawUrl, { allowPrivate }) {
  let u;
  try { u = new URL(rawUrl); } catch (_) { return 'Invalid URL.'; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return `Unsupported scheme "${u.protocol}". Only http/https are allowed.`;
  if (!allowPrivate && isPrivateHost(u.hostname)) return 'Private/loopback targets are blocked (set ALLOW_PRIVATE=true to allow).';
  return null;
}

module.exports = { check, isPrivateHost };
