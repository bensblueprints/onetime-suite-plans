// Swap OAuth client_id across all app configs. Usage: node swap-client-id.js <newClientId>
const fs=require('fs'), cp=require('child_process');
const NEW=process.argv[2]; if(!/^app_\w+$/.test(NEW||'')){console.error('need app_ id');process.exit(1);}
const files=cp.execSync('git ls-files --others --cached -- "*/whop-license.config.json"',{cwd:__dirname,encoding:'utf8'}).split('\n').filter(Boolean);
// git ls-files won't catch gitignored app dirs; use find instead
const all=cp.execSync('find . -maxdepth 2 -name whop-license.config.json',{cwd:__dirname,encoding:'utf8'}).split('\n').filter(Boolean);
let n=0;
for(const f of all){const j=JSON.parse(fs.readFileSync(f,'utf8')); if(j.clientId&&j.clientId!==NEW){j.clientId=NEW; fs.writeFileSync(f,JSON.stringify(j,null,2)+'\n'); n++;}}
console.log(`updated ${n} configs to clientId=${NEW}`);
