/*
 * notion-seed.js — builds seed-rows.json for the Notion "🚀 Launch Tracker" DB
 * (OneTimeSuite Launch HQ). Merges:
 *   onetimesuite-com/src/{products,products-51-100,extra-products,coming-soon}.js
 *   onetimesuite-com/src/whop-links.json      (checkout + product IDs)
 *   onetimesuite-com/src/youtube-videos.json  (promo video per slug)
 *   onetimesuite-com/build.js DESKTOP_SLUGS   (app type)
 * Assigns Day # 1-100 readiness-first. Rerunnable — output is deterministic
 * except Launch Date which derives from START_DATE below.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'C:/Users/ADMIN/Desktop/onetimesuite-com';
const START_DATE = '2026-07-17'; // Day 1

const products = require(path.join(SITE, 'src/products.js'));
const p51 = require(path.join(SITE, 'src/products-51-100.js'));
const extras = require(path.join(SITE, 'src/extra-products.js'));
const coming = require(path.join(SITE, 'src/coming-soon.js'));
const whop = JSON.parse(fs.readFileSync(path.join(SITE, 'src/whop-links.json'), 'utf8'));
const yt = JSON.parse(fs.readFileSync(path.join(SITE, 'src/youtube-videos.json'), 'utf8'));

// DESKTOP_SLUGS from build.js
const buildJs = fs.readFileSync(path.join(SITE, 'build.js'), 'utf8');
const dsMatch = buildJs.match(/DESKTOP_SLUGS = new Set\(\[([\s\S]*?)\]\)/);
const DESKTOP = new Set(dsMatch[1].match(/'([^']+)'/g).map(s => s.replace(/'/g, '')));

const LAUNCHED = new Set(['bloomrecorder', 'wispertalk', 'linkleaf']);

const all = [];
for (const p of [...products, ...p51, ...extras]) {
  all.push({
    slug: p.slug, brand: p.brand, price: p.price,
    repo: p.repo || null, closedSource: !!p.closedSource,
    kind: p.kind || (DESKTOP.has(p.slug) ? 'desktop' : 'web'),
  });
}
// Dealstack (coming-soon.js) — shipped repo, no landing page data yet
for (const c of coming) {
  all.push({
    slug: c.brand.toLowerCase(), brand: c.brand, price: c.price,
    repo: 'dealstack-crm-mvp', closedSource: false, kind: c.kind,
    note: 'No landing-page data yet (coming-soon.js) — needs product page before launch.',
  });
}
if (all.length !== 103) throw new Error(`expected 103 apps, got ${all.length}`);

// readiness score (higher = earlier)
function score(a) {
  let s = 0;
  if (yt[a.slug]) s += 2;                      // promo video already live
  if (a.kind === 'desktop') s += 2;            // no Docker/Coolify deploy needed
  if (['door-tracker', 'doortracker', 'famping'].includes(a.slug)) s -= 3; // mobile complexity
  if (a.slug === 'dealstack') s -= 2;          // missing landing page
  return s;
}

const unlaunched = all.filter(a => !LAUNCHED.has(a.slug));
unlaunched.sort((x, y) =>
  score(y) - score(x) || y.price - x.price || x.brand.localeCompare(y.brand));

const start = new Date(START_DATE + 'T00:00:00Z');
const dayOf = {};
unlaunched.forEach((a, i) => {
  const d = new Date(start.getTime() + i * 86400000);
  dayOf[a.slug] = { day: i + 1, date: d.toISOString().slice(0, 10) };
});

// rebrand gap: BloomRecorder (ex-ClipDeck) has no whop-links.json entry
whop.bloomrecorder = whop.bloomrecorder ||
  { checkoutUrl: 'https://whop.com/checkout/plan_Ma48eglvyofUF', productId: null };

const rows = all.map(a => {
  const w = whop[a.slug] || {};
  const v = yt[a.slug] || {};
  const launched = LAUNCHED.has(a.slug);
  const cleanRepo = a.repo ? a.repo.replace(/-mvp$/, '') : null;
  const sched = dayOf[a.slug] || {};
  return {
    app: a.brand,
    slug: a.slug,
    type: a.kind,
    price: a.price,
    day: sched.day ?? null,
    launchDate: sched.date ?? null,
    status: launched ? 'LAUNCHED' : 'Backlog',
    built: true,
    smokeTestsPass: true,
    whopLicenseIntegrated: !a.closedSource || a.slug === 'wispertalk', // wispertalk has own licensing
    winExeBuilt: a.slug === 'bloomrecorder',
    macDmgBuilt: false,
    installersReleased: a.slug === 'bloomrecorder',
    signed: false,
    webDeployed: ['door-tracker', 'famping'].includes(cleanRepo || ''),
    subdomainLive: false,
    liveUrl: null,
    whopCheckout: w.checkoutUrl || (a.slug === 'wispertalk' ? 'https://wispertalk.com' : null),
    whopProductId: w.productId || null,
    checkoutVerified: false,
    youtubeVideo: v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : null,
    videoLive: !!v.videoId,
    siteFlippedAvailable: launched,
    fbPosted: false, linkedinPosted: false, discordPosted: false,
    privateRepo: cleanRepo && !a.closedSource ? `https://github.com/bensblueprints/${cleanRepo}` : null,
    mvpRepo: a.repo && !a.closedSource ? `https://github.com/bensblueprints/${a.repo}` : null,
    releaseUrl: a.slug === 'bloomrecorder'
      ? 'https://github.com/bensblueprints/bloomrecorder/releases/tag/v1.0.0' : null,
    notes: [
      a.note,
      a.closedSource ? 'Closed source — separate repos, own licensing/site.' : null,
      'All installers must be (re)built AFTER 2026-07-16 Whop-license integration — pre-existing Z:\\software installers are stale.',
    ].filter(Boolean).join(' '),
  };
});

fs.writeFileSync(path.join(__dirname, 'seed-rows.json'), JSON.stringify(rows, null, 1));
console.log(`wrote ${rows.length} rows; day1=${unlaunched[0].brand}; last=${unlaunched[99].brand} (${dayOf[unlaunched[99].slug].date})`);
console.log('type counts:', rows.reduce((m, r) => (m[r.type] = (m[r.type] || 0) + 1, m), {}));
console.log('with video:', rows.filter(r => r.videoLive).length, '| with whop link:', rows.filter(r => r.whopCheckout).length);
