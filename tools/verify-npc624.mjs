/** Offline-safe deployment verification for the user-supplied Captain V2. */
import {readFile} from 'node:fs/promises';
const path='public/models/npc623/guard-captain.glb';
const b=await readFile(path);
if(b.length<100000||b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('[NPC624] Invalid or missing bundled GLB: '+path);
const j=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
if(j.skins?.[0]?.joints?.length!==24||j.animations?.length!==10||j.images?.length!==3)throw Error('[NPC624] Captain V2 asset structure mismatch');
console.log(`[NPC624] VERIFIED bundled guard-captain.glb — ${(b.length/1024/1024).toFixed(2)} MiB; 24 bones, 10 animations, 3 embedded textures; no network download needed.`);
