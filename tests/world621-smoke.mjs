import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SOURCES621,assetUrl621,layout621,installWorld621} from '../src/world621.js';
assert.equal(Object.keys(SOURCES621).length,11);
assert.equal(new Set(Object.values(SOURCES621).map(a=>a.id)).size,11);
assert.ok(Object.values(SOURCES621).every(a=>/^https:\/\/3dassets.dev\/assets\//.test(a.url)));
assert.ok(assetUrl621('oak').endsWith('/28310/v1/model.glb'));
assert.equal(assetUrl621('oak',true),'/world621/oak.glb');
const geo=layout621();assert.ok(geo.plants.length>=45 && geo.boulders.length>=20);
assert.ok(geo.plants.every(p=>p.scale>.35 && Number.isFinite(p.x)));
const main=fs.readFileSync('src/main.js','utf8');
assert.ok(main.includes('detail622:true,onPlaced:c=>worldCollision6211.add(c)'), 'world colliders registered for successfully loaded CDN props');
assert.match(main,/ALPHA 6\.2 · WORLD EXPANSION · 6\.2\.1 ASSETS/);
assert.match(fs.readFileSync('src/world62.js','utf8'),/legacyVegetation/);
class Group{constructor(){this.children=[];this.position={set:(...x)=>this.pos=x};this.rotation={y:0};this.scale={setScalar:(v)=>this.s=v};this.visible=true;}add(x){this.children.push(x)}clone(){return new Group()}traverse(fn){} }
class GLTFLoader{static reads=0;loadAsync(url){assert.ok(url.startsWith('https://cdn.3dassets.dev/'));GLTFLoader.reads++;return Promise.resolve({scene:new Group()})}}
const oldTown=Array.from({length:8},()=>({visible:true}));const oldTrees=Array.from({length:30},()=>({visible:true}));const oldForest={trees:[{visible:true},{visible:true}],rocks:[{visible:true}]};const scene=new Group();
const beforeDoc=globalThis.document;globalThis.document=undefined;
try{
const x=await installWorld621({THREE:{Group},GLTFLoader,scene,world62:{legacyVegetation:oldForest},legacyTownBuildings621:oldTown,legacyTrees621:oldTrees});
assert.equal(x.failed,0);assert.equal(x.loaded,6);assert.ok(x.placements>=60);assert.equal(x.houses,0);assert.ok(x.trees>=35);
assert.equal(GLTFLoader.reads,6,'single request per unique GLB');
assert.ok(oldTown.every(x=>x.visible),'CDN house overlay must not replace locally bundled 4.2 houses');assert.ok(oldTrees.every(x=>!x.visible));assert.equal(oldForest.trees[0].visible,false);
}finally{globalThis.document=beforeDoc}
class OfflineLoader{loadAsync(){return Promise.reject(new Error('Network blocked'))}}
const originals=Array.from({length:8},()=>({visible:true}));
const result=await installWorld621({THREE:{Group},GLTFLoader:OfflineLoader,scene:new Group(),legacyTownBuildings621:originals,legacyTrees621:[]});
assert.equal(result.loaded,0);assert.equal(result.placements,0);assert.ok(originals.every(x=>x.visible));
console.log('PASS 6.2.1: model catalog, authored placement, per-URL load caching, graceful placeholder hiding');
