import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WORLD62_RADIUS,SPAWN_SITES62,ZONES62,zoneAt62} from '../src/world62.js';
assert.equal(WORLD62_RADIUS,155);
assert.equal(ZONES62.length,4);
assert.equal(SPAWN_SITES62.length,19);
assert.equal(SPAWN_SITES62.filter(x=>x.kind==='wolf').length,7);
assert.equal(SPAWN_SITES62.filter(x=>x.kind==='goblin').length,12);
assert.equal(SPAWN_SITES62.filter(x=>x.tier==='chief').length,1);
assert.equal(new Set(SPAWN_SITES62.map(x=>x.id)).size,19);
assert.ok(SPAWN_SITES62.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.z)&&Math.hypot(x.x,x.z)>35&&Math.abs(x.x)<WORLD62_RADIUS&&Math.abs(x.z)<WORLD62_RADIUS));
assert.equal(zoneAt62(0,0).id,'town');
assert.equal(zoneAt62(-88,-69).id,'forest');
assert.equal(zoneAt62(91,-63).id,'camp');
assert.equal(zoneAt62(96,89).id,'ruins');
const main=fs.readFileSync('src/main.js','utf8');
assert.match(main,/createWorld62\(\{THREE,scene\}\)/);
assert.match(main,/\bcloneSkeleton62\(asset.scene\)/);
assert.match(main,/if\(e.world62\)/);
assert.match(main,/requestRegionRig62/);
assert.match(main,/activeRegionBudget62=new Set\(nearby.slice\(0,7\)/);
assert.match(main,/new THREE.PlaneGeometry\(360,360\)/);
assert.match(main,/ALPHA 6\.2 · WORLD EXPANSION/);
console.log('PASS 6.2: 3 distinct new zones, 19 lazy enemies, skinned cache, outdoor bounds and HUD');
// Geometry smoke without needing a GPU/browser. This catches invalid constructor
// paths in the procedural world before the user uploads it to Vercel.
class Object62 {
  constructor(){this.children=[];this.position={set(...v){this.values=v}};this.rotation={set(...v){this.values=v}};this.scale={set(...v){this.values=v}};this.matrix={};}
  add(o){this.children.push(o);} updateMatrix(){}
}
class Mesh62 extends Object62 {constructor(geo,mat){super();this.geometry=geo;this.material=mat;}}
class Instanced62 extends Mesh62 {constructor(g,m,count){super(g,m);this.count=count;this.instanceMatrix={};}setMatrixAt(i,m){assert.ok(i<this.count);}}
class Geo62 {constructor(...args){this.args=args;}}
class Material62 {constructor(params){this.params=params;}}
class Texture62 {constructor(canvas){this.image=canvas;}}
const THREE={Group:class extends Object62{},Object3D:Object62,Mesh:Mesh62,InstancedMesh:Instanced62,
  CircleGeometry:Geo62,CylinderGeometry:Geo62,ConeGeometry:Geo62,IcosahedronGeometry:Geo62,
  PlaneGeometry:Geo62,BoxGeometry:Geo62,OctahedronGeometry:Geo62,
  MeshStandardMaterial:Material62,MeshBasicMaterial:Material62,CanvasTexture:Texture62,
  DoubleSide:2,SRGBColorSpace:'srgb'};
const previousDocument=globalThis.document;
globalThis.document={createElement(type){assert.equal(type,'canvas');return {width:0,height:0,getContext(){return {fillRect(){},strokeRect(){},fillText(){}};}}}};
try{
  const {createWorld62}=await import('../src/world62.js');
  const scene=new Object62();const result=createWorld62({THREE,scene});
  assert.equal(scene.children.length,1);
  assert.ok(result.root.children.length>20);
  assert.equal(result.root.children.filter(x=>x instanceof Instanced62).length,3);
}finally {globalThis.document=previousDocument;}
console.log('PASS 6.2: procedural region geometry instantiates and vegetation uses 3 instanced draws');
