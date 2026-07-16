/*
 * gen-configs.js — generate each app's whop-license.config.json from
 * onetime-suite/license-experience-map.json (slug -> exp_xxx, built from the
 * user's Whop CSV) and the site catalog (slug -> brand + repo/dir name).
 *
 *   node _shared/whop-license/gen-configs.js [--dry] [slug ...]
 *
 * Writes <appDir>/src/whop-license.config.json when the app has src/, else
 * <appDir>/whop-license.config.json. Prints a table; skips missing dirs.
 */
const fs = require('fs');
const path = require('path');

const SUITE = path.join(__dirname, '..', '..');
const SITE_SRC = 'C:/Users/ADMIN/Desktop/onetimesuite-com/src';
const CLIENT_ID = 'app_B2TMUEvC9aRUNZ'; // OneTimeSuite Whop OAuth app

const expMap = require(path.join(SUITE, 'license-experience-map.json'));
const catalog = {};
for (const f of ['products.js', 'products-51-100.js', 'extra-products.js'])
  for (const p of require(path.join(SITE_SRC, f))) catalog[p.slug] = p;

const dry = process.argv.includes('--dry');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));

/* index every app dir in onetime-suite (and bloomrecorder on Desktop) by
   dir name + package.json name/productName, so repo-name != dir-name cases resolve */
const dirIndex = {}; // key(lowercase) -> absolute dir
function indexDir(abs, name) {
  dirIndex[name.toLowerCase()] = abs;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(abs, 'package.json'), 'utf8'));
    if (pkg.name) dirIndex[String(pkg.name).toLowerCase()] = abs;
    if (pkg.productName) dirIndex[String(pkg.productName).toLowerCase().replace(/\s+/g, '')] = abs;
  } catch {}
}
for (const d of fs.readdirSync(SUITE, { withFileTypes: true }))
  if (d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.')) indexDir(path.join(SUITE, d.name), d.name);
indexDir('C:/Users/ADMIN/Desktop/bloomrecorder', 'bloomrecorder');

const DIR_ALIASES = { linkleaf: 'link-in-bio', castport: 'podcast-host' };

function resolveAppDir(slug, p) {
  if (DIR_ALIASES[slug] && dirIndex[DIR_ALIASES[slug]]) return dirIndex[DIR_ALIASES[slug]];
  const repo = (p.repo || slug).replace(/-mvp$/i, '');
  const brandKey = p.brand.toLowerCase().replace(/\s+/g, '');
  for (const key of [repo.toLowerCase(), slug.toLowerCase(), brandKey]) {
    if (dirIndex[key]) return dirIndex[key];
  }
  return null;
}

let written = 0, missing = [];
for (const [slug, experienceId] of Object.entries(expMap)) {
  if (only.length && !only.includes(slug)) continue;
  const p = catalog[slug];
  if (!p) { missing.push(slug + ' (no catalog entry)'); continue; }
  const appDir = resolveAppDir(slug, p);
  if (!appDir) { missing.push(`${slug} (no local dir for repo ${(p.repo || slug)})`); continue; }
  const target = fs.existsSync(path.join(appDir, 'src'))
    ? path.join(appDir, 'src', 'whop-license.config.json')
    : path.join(appDir, 'whop-license.config.json');
  const cfg = { experienceId, appName: p.brand, clientId: CLIENT_ID, port: 8734 };
  if (!dry) fs.writeFileSync(target, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`${slug.padEnd(22)} ${experienceId}  -> ${path.relative(SUITE, target)}`);
  written++;
}
console.log(`\n${written} configs ${dry ? 'planned' : 'written'}; ${missing.length} skipped${missing.length ? ':\n  ' + missing.join('\n  ') : ''}`);
