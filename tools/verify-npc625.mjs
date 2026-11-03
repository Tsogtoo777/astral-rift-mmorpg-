/** Alpha 6.2.5 build gate: no CDN downloads; verifies 6 NPC 3D models including upright Witch. */
import {readFile} from 'node:fs/promises';
const checks=[
 ['public/models/npc623/guard-captain.glb',24,10],
 ['public/models/npc625/blacksmith-mobile.glb',0,0],
 ['public/models/npc625/inquisitor-v2.glb',24,10],
 ['public/models/npc625/witch-girl.glb',83,0],
 ['public/models/npc625/witch-girl-upright.glb',83,0],
 ['public/models/npc625/elf-woman-mobile.glb',117,0],
];
for(const [path,minimumBones,minimumClips] of checks){
 const b=await readFile(path);
 if(b.length<100_000||b.toString('ascii',0,4)!=='glTF'||b.readUInt32LE(4)!==2||b.readUInt32LE(8)!==b.length)throw Error('Invalid missing NPC625 GLB: '+path);
 const j=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
 const bones=Math.max(0,...(j.skins||[]).map(s=>s.joints?.length||0));
 if(bones<minimumBones||(j.animations?.length||0)<minimumClips)throw Error('NPC625 skeleton or animations missing: '+path);
 for(const im of j.images||[])if(im.bufferView===undefined)throw Error('NPC625 needs self-contained images: '+path);
 console.log('[NPC625] VERIFIED',path, (b.length/1e6).toFixed(2)+' MB',bones+' bones',(j.animations?.length||0)+' clips');
}
