// Minimal mint script — turns files in /exports into receipts in /receipts
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const __filename=fileURLToPath(import.meta.url); const __dirname=path.dirname(__filename);
const root=path.resolve(__dirname,'..');
const exportsDir=path.join(root,'exports');
const receiptsDir=path.join(root,'receipts');
const indexFile=path.join(receiptsDir,'index.json');
fs.mkdirSync(receiptsDir,{recursive:true});
if(!fs.existsSync(indexFile)) fs.writeFileSync(indexFile,'[]');
const index=JSON.parse(fs.readFileSync(indexFile,'utf8'));
function sha256Hex(buf){return crypto.createHash('sha256').update(buf).digest('hex')}
function idFrom(hash){return 'os_'+hash.slice(0,12)}
function now(){return new Date().toISOString()}
const files=fs.existsSync(exportsDir)?fs.readdirSync(exportsDir).filter(f=>fs.statSync(path.join(exportsDir,f)).isFile()):[];
for(const name of files){
  const buf=fs.readFileSync(path.join(exportsDir,name));
  const h=sha256Hex(buf);
  const rid=idFrom(h);
  const rec={
    receipt_id:rid,
    issued_at:now(),
    artifact:{ name, bytes:buf.length, sha256:h },
    source:{ repo:process.env.GITHUB_REPOSITORY||'', ref:process.env.GITHUB_REF||'' }
  };
  const out=path.join(receiptsDir, rid+'.json');
  fs.writeFileSync(out, JSON.stringify(rec,null,2));
  if(!index.find(x=>x.receipt_id===rid)) index.push({receipt_id:rid, name, sha256:h, issued_at:rec.issued_at});
}
fs.writeFileSync(indexFile, JSON.stringify(index,null,2));
console.log('minted', files.length, 'receipts');
