import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import * as THREE from 'three';
import {createEnemyAI57} from '../src/enemyAI57.js';
import {makeWorldCollision6211} from '../src/world6211.js';
import {installForest622} from '../src/forest622.js';
import {architectureTextureUrl42} from '../src/architecture42.js';
import {createEquipment59} from '../src/equipment59.js';

// Both independent axis probes are free, but their combined diagonal is solid.
const blocked=(x,z)=>x>.03&&z>.03;
const e={alive:true,g:{position:{x:0,z:0},rotation:{y:0}},home:{x:0,z:0},cool:1};
const ai=createEnemyAI57({player:{position:{x:5,z:5}},isBlocked:blocked,onAttack(){}});
ai.update(e,.06);
assert.equal(blocked(e.g.position.x,e.g.position.z),false,'diagonal enemy step entered collider');
assert.ok(e.g.position.x>0||e.g.position.z>0,'enemy should slide instead of freezing');

// Check every referenced architecture texture after the runtime URL mapping.
for(const file of ['Wall_UnevenBrick_Straight','Wall_UnevenBrick_Window_Wide_Round']){
 const doc=JSON.parse(readFileSync(`public/architecture/medieval/${file}.gltf`));
 for(const image of doc.images||[]){
  const url=architectureTextureUrl42(`public/architecture/medieval/${image.uri}`);
  assert.ok(existsSync(url),`missing resolved texture ${url}`);
 }
}
assert.equal(architectureTextureUrl42('/foo/T_Plaster_Normal.png'),'/foo/T_Plaster_Normal.png');

// Real procedural forest and collision system, no WebGL renderer required.
globalThis.location={search:''};
globalThis.document={createElement(){return {getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(){}}}}}};
const forest=installForest622({scene:new THREE.Scene()});
assert.equal(forest.instances.length,6,'retain six instanced forest batches');
assert.equal(forest.colliders.length,forest.trees);
const world=makeWorldCollision6211(forest.colliders);
for(const c of forest.colliders){
 assert.equal(world.blocked(c.x,c.z),true,'tree must obstruct shared navigation and dodge movement');
 const position={x:c.x,z:c.z};forest.resolvePlayer(position);
 assert.ok(Math.hypot(position.x-c.x,position.z-c.z)>.5,'exact-center overlap must be expelled');
}
location.search='?forest=old';
assert.deepEqual(installForest622({scene:new THREE.Scene()}).colliders,[]);

// Execute the actual cache helper with a counting loader.
const npc=readFileSync('src/npc622.js','utf8');
const cacheBody=npc.slice(npc.indexOf('async function fetchCached('),npc.indexOf('\n for(const e of entries)',npc.indexOf('async function fetchCached(')));
let loads=0;
const fetchCached=new Function('loader','modelCache',`${cacheBody};return fetchCached;`)({loadAsync(url){loads++;return Promise.resolve({url})}},new Map());
const [scholar,traveler]=await Promise.all([fetchCached('scholar','same.glb'),fetchCached('traveler','same.glb')]);
assert.equal(loads,1,'one load/decode per URL');assert.equal(scholar,traveler);
const fallback=npc.match(/fallback=\{citizen:'([^']+)'/)[1];
assert.ok(existsSync('public'+fallback),'citizen fallback must be bundled');

// The current rig and both original locomotion clips remain available.
const bytes=readFileSync('public/models/meshy-warrior-nocape.glb');
const rig=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
assert.equal(rig.skins[0].joints.length,62);
assert.deepEqual(rig.animations.map(c=>c.name).sort(),['Running','Walking']);
const gear=createEquipment59();const purchase=gear.buy('dark-katana',600);
assert.equal(purchase.ok,true);assert.equal(gear.buy('dark-katana',600).ok,false);
assert.equal(gear.equip('dark-katana'),true);
assert.deepEqual(createEquipment59(gear.snapshot()).snapshot(),gear.snapshot());
console.log('PASS: diagonal collision, architecture textures, forest shared footprints/center recovery, NPC URL cache/fallback, current rig and equipment persistence');
