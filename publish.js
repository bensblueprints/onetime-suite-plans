// Publish an app dir as a public repo on github.com/bensblueprints
// Usage: node publish.js <app-dir-name> "<description>"
// Requires env GITHUB_PAT
const { execSync } = require('child_process');
const path = require('path');

const fs = require('fs');
const os = require('os');

const [dir, description, repoNameArg] = process.argv.slice(2);
const PAT = process.env.GITHUB_PAT || fs.readFileSync(path.join(os.homedir(), '.ghpat'), 'utf8').trim();
if (!dir || !PAT) { console.error('usage: node publish.js <dir> "<description>" (PAT from ~/.ghpat)'); process.exit(1); }

const repoName = repoNameArg || dir;
const appPath = path.join(__dirname, dir);
const run = (cmd, opts = {}) => execSync(cmd, { cwd: appPath, stdio: 'pipe', encoding: 'utf8', ...opts });

(async () => {
  // 1. create repo (idempotent: 422 if exists is fine)
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ name: repoName, description: description || '', private: false, has_issues: true }),
  });
  if (res.status === 201) console.log(`created repo bensblueprints/${repoName}`);
  else if (res.status === 422) console.log(`repo bensblueprints/${repoName} already exists`);
  else { console.error(`repo create failed: ${res.status} ${await res.text()}`); process.exit(1); }

  // 2. push
  try { run('git remote remove origin'); } catch {}
  run(`git remote add origin https://${PAT}@github.com/bensblueprints/${repoName}.git`);
  run('git branch -M main');
  console.log(run('git push -u origin main --force'));
  // scrub PAT from stored remote
  run(`git remote set-url origin https://github.com/bensblueprints/${repoName}.git`);

  // 3. topics
  await fetch(`https://api.github.com/repos/bensblueprints/${repoName}/topics`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ names: ['electron', 'desktop-app', 'self-hosted', 'one-time-purchase', 'saas-alternative'] }),
  });
  console.log(`https://github.com/bensblueprints/${repoName} — done`);
})();
