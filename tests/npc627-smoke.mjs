import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const a=readFileSync('src/main.js','utf8'),b=readFileSync('src/npc622.js','utf8'),w=readFileSync('src/alpha40.js','utf8');
for(const needle of ['ALPHA 6.2.8 · NPC STATIC MODEL FIX','saruul-witch-static628.glb','installSaruul628','onGuardModelReady:()=>world40.hideLegacyGuards()'])assert.ok(a.includes(needle),needle);
for(const needle of ['merchant-witch-static628.glb','onGuardModelReady?.()','npcdebug','status(e.name'])assert.ok(b.includes(needle),needle);
assert.ok(w.includes('hideLegacyGuards'));assert.ok(w.includes('guards.filter(obj=>obj.g.visible)'));
assert.ok(existsSync('public/models/npc625/merchant-witch.glb'));console.log('NPC627 smoke PASS');
