import fs from 'node:fs';
import assert from 'node:assert/strict';
const code=fs.readFileSync('src/npc622.js','utf8');
const downloader=fs.readFileSync('tools/download-npc623.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const x of ['NPC_SOURCES623','cloneSkeleton(gltf.scene)','new THREE.AnimationMixer','e.label.visible=d<7.5','src.local','fallback[e.kind]','e.talkUntil=performance.now()+3600'])assert.ok(code.includes(x),x);
for(const x of ['tavern-peasant.glb','hooded-scholar.glb','guard-captain.glb','vale-shieldmaiden.glb',"payload.readUInt32LE(8)","payload.subarray(0,4).toString()!=='glTF'"])assert.ok(downloader.includes(x),x);
assert.equal(pkg.scripts.prebuild,'node tools/download-npc623.mjs');
console.log('NPC623 smoke: PASS (static integration only; external GLBs not verified)');
