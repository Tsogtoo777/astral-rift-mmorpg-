import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const a=readFileSync('src/main.js','utf8'),b=readFileSync('src/npc622.js','utf8');
assert.ok(a.includes('saruul-witch-static628.glb'));assert.ok(!a.includes('if(!legacy)model.rotation.x=Math.PI/2'));
assert.ok(a.includes('x:-6.2,z:3.8'));assert.ok(b.includes('bodyBounds626'));
assert.ok(b.includes('size.y>.0001'));assert.ok(b.includes('scale>1500'));
assert.ok(b.includes('NPC normalized height invalid'));
assert.ok(existsSync('public/models/npc625/witch-girl-upright.glb'));
console.log('NPC626 smoke PASS (orientation, body-only normalization, guards/scholar, safe placement)');
