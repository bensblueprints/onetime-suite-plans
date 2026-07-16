/*
 * mac-dmg-driver.js — builds Mac arm64 DMGs for all desktop apps on the Mac mini.
 * Self-resuming: skips apps whose *-arm64.dmg already exists locally; run again
 * to continue. Time-boxed via --max-minutes N (default 8) so it fits background
 * command windows; exits 0 with "MORE_REMAINING" when time runs out.
 *
 * Usage: node mac-dmg-driver.js [--max-minutes 8]
 * Requires: ssh key ~/.ssh/id_ed25519 authorized for benji@100.88.187.70.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MAC = 'benji@100.88.187.70';
const SSH = 'ssh -i ~/.ssh/id_ed25519 -o BatchMode=yes -o ConnectTimeout=10';
const SCP = 'scp -i ~/.ssh/id_ed25519 -o BatchMode=yes';
const RESULTS = path.join(ROOT, 'mac-dmg-results.json');
const maxMin = Number((process.argv.find(a => a.startsWith('--max-minutes')) || '').split('=')[1] ||
  (process.argv[process.argv.indexOf('--max-minutes') + 1])) || 8;
const deadline = Date.now() + maxMin * 60_000;

const rows = require(path.join(ROOT, 'seed-rows.json'));
const desktop = rows.filter(r => r.type === 'desktop' && r.slug !== 'wispertalk');

// resolve local dir per app: try repo base name, then scan package.json productName/name
const dirs = fs.readdirSync(ROOT).filter(d => {
  try { return fs.statSync(path.join(ROOT, d)).isDirectory() && fs.existsSync(path.join(ROOT, d, 'package.json')); }
  catch { return false; }
});
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const pkgIndex = dirs.map(d => {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(ROOT, d, 'package.json'), 'utf8'));
    return { dir: d, name: norm(p.name), product: norm(p.build && p.build.productName) };
  } catch { return { dir: d, name: '', product: '' }; }
});
function findDir(app) {
  const repoBase = app.mvpRepo ? app.mvpRepo.split('/').pop().replace(/-mvp$/, '') : null;
  if (repoBase && dirs.includes(repoBase)) return repoBase;
  const b = norm(app.app), s = norm(app.slug);
  const hit = pkgIndex.find(x => x.product === b || x.name === s || x.name === norm(repoBase) || x.product === s);
  return hit ? hit.dir : null;
}
function hasDmg(dir) {
  for (const sub of ['dist', 'release']) {
    const p = path.join(ROOT, dir, sub);
    if (fs.existsSync(p) && fs.readdirSync(p).some(f => f.endsWith('-arm64.dmg'))) return true;
  }
  return false;
}
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8', timeout: 8 * 60_000, ...opts });

let results = fs.existsSync(RESULTS) ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : {};
const save = () => fs.writeFileSync(RESULTS, JSON.stringify(results, null, 1));

let built = 0, skipped = 0, failed = 0, remaining = 0;
for (const app of desktop) {
  const dir = findDir(app);
  if (!dir) { results[app.slug] = { ok: false, err: 'no local dir found' }; failed++; save(); continue; }
  if (hasDmg(dir) || (results[app.slug] && results[app.slug].ok)) { skipped++; continue; }
  if (Date.now() > deadline) { remaining++; continue; }
  process.stdout.write(`[build] ${app.slug} (${dir}) ... `);
  try {
    const tgz = `/tmp/ots-${app.slug}.tgz`; // git-bash /tmp
    sh(`cd "${ROOT}" && tar --exclude=node_modules --exclude=dist --exclude=release --exclude=.git -czf ${tgz} ${dir}`);
    sh(`${SCP} ${tgz} ${MAC}:/tmp/ots-src.tgz`);
    sh(`${SSH} ${MAC} "set -e; rm -rf ~/ots-builds/${dir}; mkdir -p ~/ots-builds; cd ~/ots-builds; tar xzf /tmp/ots-src.tgz; cd ${dir}; npm ci --silent >/dev/null 2>&1 || npm install --silent >/dev/null 2>&1; SKIP_LICENSE_CHECK=1 npx electron-builder --mac --arm64 >/dev/null 2>&1; ls dist/*-arm64.dmg release/*-arm64.dmg 2>/dev/null | head -1"`);
    const remote = sh(`${SSH} ${MAC} "ls ~/ots-builds/${dir}/dist/*-arm64.dmg ~/ots-builds/${dir}/release/*-arm64.dmg 2>/dev/null | head -1"`).trim();
    if (!remote) throw new Error('no dmg produced');
    const outSub = remote.includes('/release/') ? 'release' : 'dist';
    fs.mkdirSync(path.join(ROOT, dir, outSub), { recursive: true });
    sh(`${SCP} "${MAC}:${remote}" "${path.join(ROOT, dir, outSub).replace(/\\/g, '/')}/"`);
    sh(`${SCP} "${MAC}:${remote}.blockmap" "${path.join(ROOT, dir, outSub).replace(/\\/g, '/')}/" || true`, {});
    sh(`${SSH} ${MAC} "rm -rf ~/ots-builds/${dir} /tmp/ots-src.tgz"`);
    results[app.slug] = { ok: true, dir, dmg: path.basename(remote) };
    built++; console.log('OK', path.basename(remote));
  } catch (e) {
    results[app.slug] = { ok: false, dir, err: String(e.message || e).slice(0, 200) };
    failed++; console.log('FAIL', String(e.message || e).slice(0, 120));
    try { sh(`${SSH} ${MAC} "rm -rf ~/ots-builds/${dir}"`); } catch {}
  }
  save();
}
console.log(`\nbuilt=${built} skipped(done)=${skipped} failed=${failed} remaining=${remaining}`);
if (remaining > 0) console.log('MORE_REMAINING — run again to continue');
