import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const main=readFileSync('src/main.js','utf8'),npc=readFileSync('src/npc622.js','utf8');
for(const s of ['ALPHA 6.2.8 · NPC STATIC MODEL FIX','saruul-witch-static628.glb','loadSaruul628','installSaruul628','Саруул: OK'])assert.ok(main.includes(s),s);
for(const s of ['merchant-witch-static628.glb',"e.name==='Энхээ'?'traveler'",'traveler:{local:', "kind==='female'&&m.getObjectByProperty"])assert.ok(npc.includes(s),s);
for(const f of ['merchant-witch-static628.glb','saruul-witch-static628.glb'])assert.ok(existsSync('public/models/npc625/'+f));
assert.ok(!main.includes('model.rotation.x=Math.PI/2'));
console.log('NPC 6.2.8 code/asset paths PASS');
