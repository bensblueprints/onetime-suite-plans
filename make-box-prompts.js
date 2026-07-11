#!/usr/bin/env node
// Generate Nano Banana 2 box-design prompts for every product -> box-prompts/<slug>.md
// Part 1: generation prompt (photorealistic retail software box)
// Part 2: box copy instruction block (exact text that must appear on the box)

const fs = require('fs');
const path = require('path');

const SITE = 'C:/Users/ADMIN/Desktop/onetimesuite-com/src';
const load = (f) => { const m = require(path.join(SITE, f)); return Array.isArray(m) ? m : m.products || Object.values(m)[0]; };
const all = [...load('products.js'), ...load('products-51-100.js')];

const OUT = path.join(__dirname, 'box-prompts');
fs.mkdirSync(OUT, { recursive: true });

const genPrompt = (p, feats) => `Photorealistic 3D product photograph of a retail software box, in the style of classic Adobe/Microsoft shrink-wrapped shelf boxes, standing upright at a slight angle on a clean seamless studio surface with a soft realistic shadow, professional studio lighting, subtle reflection. The box has a dark premium charcoal/near-black design with a vivid orange accent color (#e8420c) and paper-white typography, matte finish with crisp printed graphics.

FRONT PANEL (facing camera): bold large product name "${p.brand}" in clean modern sans-serif; below it the tagline "${p.tagline}" in smaller white text; a central icon motif representing ${p.oneliner.replace(/\.$/, '').toLowerCase()}; a small "Windows" platform badge near the bottom corner; a round orange price sticker badge reading "PAY ONCE — OWN FOREVER" with a large "$${p.price}" in the center. Small brand mark "OneTime Suite" at the bottom of the front panel.

VISIBLE SIDE PANEL (angled to the right): a clean bulleted feature list in legible white sans-serif text on the dark background:
${feats.map((f) => `"${f}"`).join(', ')}.

All text must be perfectly legible, sharp, correctly spelled, clean typography, no garbled letters, no duplicate stickers. High-end commercial product photography, 4k detail, neutral light-gray studio background. Aspect ratio 3:4.`;

let count = 0;
for (const p of all) {
  const feats = (p.features || []).slice(0, 5).map((f) => f[1]);
  feats.push('No Subscription. Ever.');
  const md = `# ${p.brand} — Software Box Prompt (Nano Banana 2)

## Part 1 — Box generation prompt

${genPrompt(p, feats)}

## Part 2 — Box copy instructions (exact text spec)

Every string below must appear on the box exactly as written — letter-perfect, no paraphrasing:

| Element | Exact text |
|---|---|
| Product name (front, largest) | ${p.brand} |
| Tagline (front, under name) | ${p.tagline} |
| Price sticker (front, orange, round) | PAY ONCE — OWN FOREVER / $${p.price} |
| Platform badge (front, bottom corner) | Windows |
| Brand mark (front, bottom) | OneTime Suite |
${feats.map((f, i) => `| Side panel bullet ${i + 1} | ${f} |`).join('\n')}

Design constants: charcoal/near-black box, orange #e8420c accent, paper-white type, one price sticker only, 3:4 portrait, studio product shot.

*Motif hint:* ${p.icon || ''} ${p.oneliner}
*Replaces:* ${p.competitor} (${p.compPrice})
`;
  fs.writeFileSync(path.join(OUT, `${p.slug}.md`), md);
  count++;
}
console.log(`wrote ${count} box prompt files to box-prompts/`);
