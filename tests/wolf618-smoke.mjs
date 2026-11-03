import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WOLF618_BONE_MAP,loadOriginalWolf618} from '../src/wolf618.js';
const m=fs.readFileSync('src/main.js','utf8');
assert.match(m,/loadOriginalWolf618\(\{THREE,GLTFLoader,FBXLoader,enemy:wolfEnemy615\}\)/);
assert.doesNotMatch(m,/loadFBXForestWolf617\(/);
assert.match(m,/ALPHA 6\.2 · WORLD EXPANSION/);
assert.equal(Object.keys(WOLF618_BONE_MAP).length,23);
for(const n of ['frontleg','frontleg0','frontleg1','R_frontleg','backleg','backleg0','R_backleg','tail1','head'])assert.ok(WOLF618_BONE_MAP[n]);
const src=fs.readFileSync('src/wolf618.js','utf8');
assert.match(src,/retargetWolfMotion618/);
assert.match(src,/get\('wolfmotion'\)==='original'/);
assert.match(src,/WOLF_FBX617_URL/);
const glb=fs.readFileSync('src/wolf615.js','utf8');
assert.match(glb,/motionOverrides/);
assert.match(glb,/motionSource='FBX-motion-on-Meshy-rig'/);
assert.match(glb,/clips\.set\(name,overrides\[name\]\)/);
assert.match(glb,/catch\(err\)/); // fallback to original motions on any retarget error
console.log('PASS 6.1.8: original wolf GLB visible; authored FBX only as Walk/Run motion source; safety opt-out');
