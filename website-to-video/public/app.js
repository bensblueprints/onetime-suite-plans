'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const api = async (url, opts = {}) => {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res;
};
const json = async (url, opts) => (await api(url, opts)).json();

let HEALTH = null;

// ---------- auth ----------
async function boot() {
  const me = await json('/api/me');
  if (me.authed) showApp(); else showLogin();
}
function showLogin() { $('#login').classList.remove('hidden'); $('#app').classList.add('hidden'); }
async function showApp() {
  $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
  HEALTH = await json('/api/health');
  renderEngineStatus();
  buildFormatOptions();
  await refreshKeys();
  navigate('dashboard');
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('#login-password').value }) });
  if (res.ok) showApp();
  else { const el = $('#login-error'); el.textContent = 'Wrong password.'; el.classList.remove('hidden'); }
});
$('#logout').addEventListener('click', async () => { await api('/api/logout', { method: 'POST' }); showLogin(); });

// ---------- nav ----------
$$('.nav-item').forEach((a) => a.addEventListener('click', () => navigate(a.dataset.view)));
function navigate(view) {
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
  $$('.panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== view));
  if (view === 'dashboard') loadDashboard();
  if (view === 'library') loadLibrary();
  if (view === 'keys') refreshKeys();
  if (view === 'docs') loadDocs();
}

// ---------- engine status ----------
function renderEngineStatus() {
  const fmts = Object.entries(HEALTH.ffmpeg.formats || {}).filter(([, v]) => v).map(([k]) => k);
  $('#engine-status').innerHTML =
    `Chromium ${HEALTH.chromium.found ? '●' : '○'} · ffmpeg ${HEALTH.ffmpeg.found ? '●' : '○'}<br>formats: ${fmts.join(', ') || 'none'}`;
  $('#engine-detail').innerHTML = [
    pill('Chromium', HEALTH.chromium.found),
    pill('ffmpeg', HEALTH.ffmpeg.found),
    ...['mp4', 'webm', 'gif'].map((f) => pill(f.toUpperCase(), HEALTH.ffmpeg.formats[f])),
  ].join('');
}
const pill = (label, ok) => `<span class="pill ${ok ? 'ok' : 'no'}">${label} ${ok ? '✓' : '✗'}</span>`;

function buildFormatOptions() {
  const sel = $('#format-select'); sel.innerHTML = '';
  for (const f of ['mp4', 'webm', 'gif']) {
    const ok = HEALTH.ffmpeg.formats[f];
    const o = document.createElement('option');
    o.value = f; o.textContent = f.toUpperCase() + (ok ? '' : ' (encoder missing)'); o.disabled = !ok;
    sel.appendChild(o);
  }
  // default to first available
  const first = ['webm', 'mp4', 'gif'].find((f) => HEALTH.ffmpeg.formats[f]);
  if (first) sel.value = first;
}

// ---------- dashboard ----------
async function loadDashboard() {
  const s = await json('/api/stats');
  $('#stat-grid').innerHTML = [
    stat(s.renders_today, 'Renders today'),
    stat(s.renders_total, 'Total renders'),
    stat(s.avg_ms ? (s.avg_ms / 1000).toFixed(1) + 's' : '—', 'Avg render time'),
    stat(s.keys, 'Active keys'),
  ].join('');
}
const stat = (n, l) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;

// ---------- playground ----------
$$('#preset-row .chip').forEach((c) => c.addEventListener('click', () => {
  $$('#preset-row .chip').forEach((x) => x.classList.remove('active'));
  c.classList.add('active'); $('input[name=preset]').value = c.dataset.preset;
}));

function formToParams() {
  const f = $('#render-form'); const p = {};
  new FormData(f).forEach((v, k) => { p[k] = v; });
  p.dark_mode = f.dark_mode.checked ? '1' : '';
  return p;
}
function buildCurl(p, key) {
  const base = location.origin;
  const body = { ...p }; delete body.key;
  return `curl -X POST "${base}/api/v1/render" \\\n  -H "X-Api-Key: ${key || 'YOUR_KEY'}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}' --output video.${p.format}`;
}

$('#render-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const p = formToParams();
  const key = $('#key-select').value;
  $('#curl-box').textContent = buildCurl(p, key);
  if (!key) { alert('Create an API key first (API Keys tab).'); return; }
  const btn = $('#render-btn'); btn.disabled = true;
  const prog = $('#render-progress'); prog.textContent = 'Rendering…';
  const body = { ...p }; delete body.key;
  try {
    const res = await fetch(`/api/v1/render?async=1`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Api-Key': key }, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Render failed'); }
    const { job_id } = await res.json();
    await pollJob(job_id, key, prog);
  } catch (err) {
    prog.textContent = ''; $('#preview-body').innerHTML = `<p class="error">${err.message}</p>`;
  } finally { btn.disabled = false; }
});

async function pollJob(id, key, prog) {
  for (let i = 0; i < 300; i++) {
    const j = await json(`/api/v1/jobs/${id}`, { headers: { 'X-Api-Key': key } });
    prog.textContent = `Rendering… ${Math.round((j.progress || 0) * 100)}%`;
    if (j.status === 'done') {
      prog.textContent = 'Done ✓';
      const url = `/api/v1/jobs/${id}/file`;
      const blob = await (await fetch(url, { headers: { 'X-Api-Key': key } })).blob();
      const src = URL.createObjectURL(blob);
      $('#preview-body').innerHTML = `<video src="${src}" controls autoplay loop muted></video>`;
      return;
    }
    if (j.status === 'error') throw new Error(j.error || 'Render failed');
    await new Promise((r) => setTimeout(r, 700));
  }
  throw new Error('Timed out waiting for render.');
}

// ---------- library ----------
$('#library-search').addEventListener('input', debounce(loadLibrary, 300));
async function loadLibrary() {
  const q = $('#library-search').value;
  const rows = await json(`/api/renders?limit=100&q=${encodeURIComponent(q)}`);
  $('#library-grid').innerHTML = rows.map(renderCard).join('') || '<p class="muted">No renders yet.</p>';
  $$('#library-grid [data-del]').forEach((b) => b.addEventListener('click', async () => {
    await api(`/api/renders/${b.dataset.del}`, { method: 'DELETE' }); loadLibrary();
  }));
}
function renderCard(r) {
  const thumb = r.status === 'done' ? `<img src="/api/renders/${r.id}/poster" loading="lazy" />` : `<span class="muted">${r.status}…</span>`;
  return `<div class="render-card">
    <div class="thumb">${thumb}</div>
    <div class="meta">
      <div class="u" title="${esc(r.url)}">${esc(r.url)}</div>
      <div class="sub"><span class="badge ${r.status}">${r.status}</span><span>${r.mode}</span><span>${r.width}×${r.height}</span><span>${r.format}</span><span>${fmtSize(r.size_bytes)}</span></div>
    </div>
    <div class="acts">
      ${r.status === 'done' ? `<a class="btn btn-sm" href="/api/renders/${r.id}/file" target="_blank">Open</a>` : ''}
      <button class="btn btn-sm btn-ghost" data-del="${r.id}">Delete</button>
    </div>
  </div>`;
}

// ---------- keys ----------
async function refreshKeys() {
  const keys = await json('/api/keys');
  const sel = $('#key-select');
  sel.innerHTML = keys.filter((k) => !k.revoked).map((k) => `<option value="${k.key}">${esc(k.name)}</option>`).join('') || '<option value="">— no keys —</option>';
  $('#keys-list').innerHTML = keys.map((k) => `
    <div class="key-row">
      <div class="grow">
        <div class="k-name">${esc(k.name)} ${k.revoked ? '<span class="badge error">revoked</span>' : ''}</div>
        <div class="k-sub">${k.renders_total} renders · ${k.rate_per_min}/min · ${k.daily_quota ? k.daily_quota + '/day' : 'unlimited/day'}</div>
      </div>
      <code>${esc(k.key)}</code>
      <button class="btn btn-sm btn-ghost" data-revoke="${k.id}" data-rev="${k.revoked}">${k.revoked ? 'Enable' : 'Revoke'}</button>
      <button class="btn btn-sm btn-ghost" data-delkey="${k.id}">Delete</button>
    </div>`).join('') || '<p class="muted">No API keys yet. Create one to use the render API.</p>';
  $$('[data-revoke]').forEach((b) => b.addEventListener('click', async () => {
    await api(`/api/keys/${b.dataset.revoke}`, { method: 'PUT', body: JSON.stringify({ revoked: b.dataset.rev === '1' ? 0 : 1 }) }); refreshKeys();
  }));
  $$('[data-delkey]').forEach((b) => b.addEventListener('click', async () => {
    await api(`/api/keys/${b.dataset.delkey}`, { method: 'DELETE' }); refreshKeys();
  }));
}
$('#new-key').addEventListener('click', async () => {
  const name = prompt('Key name?', 'My app'); if (name === null) return;
  await api('/api/keys', { method: 'POST', body: JSON.stringify({ name }) });
  refreshKeys();
});

// ---------- docs ----------
function loadDocs() {
  $('#docs-body').innerHTML = `
    <h3>Render a video</h3>
    <p><code>POST /api/v1/render</code> — authenticate with <code>X-Api-Key</code> header or <code>?key=</code>.</p>
    <p>Returns the encoded video bytes, or <code>202 {job_id}</code> when called with <code>?async=1</code> (poll <code>/api/v1/jobs/:id</code>).</p>
    <table>
      <tr><th>Param</th><th>Values</th><th>Default</th></tr>
      <tr><td>url</td><td>http/https URL (required)</td><td>—</td></tr>
      <tr><td>mode</td><td>scroll · pan · hero</td><td>scroll</td></tr>
      <tr><td>preset</td><td>landscape · square · vertical</td><td>landscape</td></tr>
      <tr><td>width / height</td><td>160–3840 (overrides preset)</td><td>—</td></tr>
      <tr><td>format</td><td>mp4 · webm · gif</td><td>mp4</td></tr>
      <tr><td>duration</td><td>1–60 seconds</td><td>8</td></tr>
      <tr><td>fps</td><td>1–60</td><td>30</td></tr>
      <tr><td>quality</td><td>1–100</td><td>70</td></tr>
      <tr><td>dark_mode</td><td>1 / 0</td><td>0</td></tr>
      <tr><td>wait_until</td><td>load · domcontentloaded · networkidle0 · networkidle2</td><td>networkidle2</td></tr>
      <tr><td>delay</td><td>ms after load (≤10000)</td><td>0</td></tr>
      <tr><td>hold_start / hold_end</td><td>ms lingering at top/bottom</td><td>400</td></tr>
      <tr><td>hide_selectors</td><td>comma-separated CSS selectors to remove</td><td>—</td></tr>
    </table>
    <h3>Example</h3>
    <pre>curl -X POST "${location.origin}/api/v1/render" \\
  -H "X-Api-Key: uv_..." -H "Content-Type: application/json" \\
  -d '{"url":"https://stripe.com","mode":"scroll","preset":"vertical","format":"mp4","duration":10}' \\
  --output stripe.mp4</pre>
    <p class="muted">All rendering runs locally on this server — your Chromium, your ffmpeg. No credits, no watermark.</p>`;
}

// ---------- utils ----------
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function fmtSize(b) { if (!b) return '—'; const u = ['B', 'KB', 'MB', 'GB']; let i = 0, n = b; while (n >= 1024 && i < 3) { n /= 1024; i++; } return n.toFixed(1) + u[i]; }
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

boot();
