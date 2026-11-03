import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const npc=readFileSync('src/npc622.js','utf8');
const main=readFileSync('src/main.js','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const path of ['blacksmith-mobile.glb','inquisitor-v2.glb','elf-woman-mobile.glb','guard-captain.glb'])assert.ok(npc.includes(path),path);
assert.ok(main.includes('/models/npc625/witch-girl.glb'));
assert.ok(main.includes('installSaruul625'));
assert.ok(main.includes('if(!legacy)model.rotation.x=Math.PI/2')); // Z-up to Y-up
assert.ok(readFileSync('src/ui60.js','utf8').includes('arCredits625')); // in-game CC BY credit
assert.ok(npc.includes("e.name==='Болд'?'blacksmith'"));
assert.ok(npc.includes('if(isGuard)e.group.visible=true'));
assert.ok(main.includes('ALPHA 6.2.5 · REAL NPC MODELS'));
assert.equal(pkg.scripts.prebuild,'node tools/verify-npc625.mjs');
assert.equal(pkg.version,'6.2.5-alpha');
console.log('NPC625 smoke PASS (4 bundled NPC roles, original Saruul quest preserved, guard retained)');
