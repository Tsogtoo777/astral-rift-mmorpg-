/** Downloads third-party fantasy NPC GLBs before Vite build. Best-effort:
 * Vercel build can still succeed offline; the runtime uses previous NPC assets.
 * All fetched assets belong to their original creators; see LICENSE_NPC623.md.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
const sources=[
  {name:'tavern-peasant.glb',url:'https://vibeassets.io/download/fbd1hbd0su',origin:'VibeAssets CC0'},
  {name:'hooded-scholar.glb',url:'https://vibeassets.io/download/k6bdm27lba',origin:'VibeAssets CC0'},
  {name:'guard-captain.glb',url:'https://vibeassets.io/download/9h7odik5fl',origin:'VibeAssets CC0'},
  {name:'vale-shieldmaiden.glb',url:'https://assetyard.dev/pack/files/vale-shieldmaiden.glb',origin:'AssetYard Free for game use',sha256:'06ff3473344df33d609cfb61560b7991441bf2376f63536270e685ca42db6d81'},
];
const root=resolve(process.cwd(),'public/models/npc623');
await mkdir(root,{recursive:true});
let ok=0,fail=0;
for(const src of sources){
  const dest=resolve(root,src.name);
  try{
    const prev=await readFile(dest).catch(()=>null);
    if(prev&&prev.length>30000&&prev.subarray(0,4).toString()==='glTF'){
      console.log('[NPC623] Already bundled:',src.name);ok++;continue;
    }
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    let response;
    try{response=await fetch(src.url,{signal:controller.signal,headers:{'User-Agent':'AstralRift-Asset-Installer/1.0'}});}
    finally{clearTimeout(timeout);}
    if(!response.ok)throw Error('HTTP '+response.status);
    const payload=Buffer.from(await response.arrayBuffer());
    if(payload.length<30000||payload.length>40*1024*1024||payload.subarray(0,4).toString()!=='glTF'||payload.readUInt32LE(8)!==payload.length)
      throw Error('Not a valid self-contained GLB');
    const digest=createHash('sha256').update(payload).digest('hex');
    if(src.sha256&&digest!==src.sha256)throw Error('Vendor SHA256 mismatch: '+digest);
    await writeFile(dest,payload);console.log('[NPC623] Imported',src.name,payload.length,'bytes');ok++;
  }catch(err){fail++;console.warn('[NPC623] Unavailable:',src.name,String(err.message||err));}
}
console.log(`[NPC623] Asset downloads: ${ok} OK / ${fail} missing. Old NPC fallback retained.`);
