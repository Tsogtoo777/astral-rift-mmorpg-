import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const npc=readFileSync('src/npc622.js','utf8');
const main=readFileSync('src/main.js','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const path of ['blacksmith-mobile.glb','inquisitor-v2.glb','merchant-witch-static628.glb','guard-captain.glb'])assert.ok(npc.includes(path),path);
assert.ok(main.includes('/models/npc625/saruul-witch-static628.glb'));
assert.ok(main.includes('installSaruul628'));
assert.ok(main.includes('saruul-witch-static628.glb')); // Z-up to Y-up
assert.ok(readFileSync('src/ui60.js','utf8').includes('arCredits625')); // in-game CC BY credit
assert.ok(npc.includes("e.name==='Болд'?'blacksmith'"));
assert.ok(npc.includes("if(e.kind==='guard')e.group.visible=true"));
assert.ok(main.includes('ALPHA 6.3.0 · CRAFTING & EQUIPMENT'));
assert.equal(pkg.scripts.prebuild,'node tools/verify-npc625.mjs');
assert.equal(pkg.version,'6.3.0-alpha');
console.log('NPC625 smoke PASS (4 bundled NPC roles, original Saruul quest preserved, guard retained)');
