import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeWorldCollision6211} from '../src/world6211.js';
import {createWorld62} from '../src/world62.js';
// Basic obstacle geometry and sweep with sliding.
const c=makeWorldCollision6211([{name:'wall',type:'box',x:4,z:0,w:2,d:6},
  {name:'post',type:'circle',x:0,z:6,r:1.0}]);
assert.equal(c.blocked(4,0),true);
assert.equal(c.blocked(0,0),false);
assert.equal(c.blocked(0,6),true);
assert.equal(c.blocked(0,4),false);
const walk=c.move(0,0,9,0);assert.ok(walk.x<2.7,'movement must stop before the wall');
const slide=c.move(2,0,2,4);assert.ok(slide.z>0,'must slide along the wall');
const cam={x:0,y:2,z:0};const desired={x:10,y:2,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z}};
assert.equal(c.resolveCamera(cam,desired),true);assert.ok(desired.x<4);
const noHit={x:0,y:2,z:-8,set(x,y,z){this.x=x;this.y=y;this.z=z}};
assert.equal(c.resolveCamera(cam,noHit),false);
// Procedural world collider contract; explicit only for visible rocks, walls, tents and ruins.
class Object3{constructor(){this.children=[];this.position={set(){}};this.rotation={set(){}};this.scale={set(){}};this.matrix={}}add(o){this.children.push(o)}updateMatrix(){}}
class Mesh extends Object3{constructor(geo,mat){super();this.geometry=geo;this.material=mat}}
class Instanced extends Mesh{constructor(g,m,count){super(g,m);this.count=count;this.instanceMatrix={}}setMatrixAt(){}}
class Geo{constructor(...args){this.args=args}}
class Mat{constructor(o){this.params=o}}
class Tex{constructor(c){this.image=c}}
const THREE={Group:Object3,Object3D:Object3,Mesh,InstancedMesh:Instanced,CircleGeometry:Geo,
  CylinderGeometry:Geo,ConeGeometry:Geo,IcosahedronGeometry:Geo,PlaneGeometry:Geo,
  BoxGeometry:Geo,OctahedronGeometry:Geo,MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,
  CanvasTexture:Tex,SRGBColorSpace:'srgb',DoubleSide:2};
const oldDoc=globalThis.document;
globalThis.document={createElement(){return {getContext(){return {fillText(){},fillRect(){},strokeRect(){}}}}}};
let world;try{world=createWorld62({THREE,scene:new Object3()});}finally{globalThis.document=oldDoc;}
assert.ok(world.colliders.length>45,'procedural assets should expose footprints');
const reg=makeWorldCollision6211(world.colliders);
assert.equal(reg.blocked(91,-63),true,'camp fire solid');
assert.equal(reg.blocked(82,-55),true,'goblin tent solid');
assert.equal(reg.blocked(96,89),true,'ruins altar solid');
assert.equal(reg.blocked(65,-55),false,'goblin portal arrival should be open');
assert.equal(reg.blocked(75,63),false,'ruins portal arrival should be open');
assert.equal(reg.blocked(-60,-53),false,'forest portal arrival should be open');
// No 6.2.1 overlapping houses; the bundled 4.2 module controls the village.
const assets=fs.readFileSync('src/world621.js','utf8');
assert.match(assets,/worldbuildings'\)==='experimental'/);
const main=fs.readFileSync('src/main.js','utf8');
assert.match(main,/obsoleteDistrictHouses6211\.forEach/);
assert.match(main,/obsoleteCastleTowers6211\.forEach/);
assert.match(main,/worldCollision6211\.blocked\(x,z\)/);
assert.match(main,/town-fountain6211/);
assert.match(main,/player\.position\.set\(2,0,-5\)/);
assert.match(main,/worldCollision6211\.resolveCamera/);
assert.match(main,/world40\.architectureReady\.then/);
console.log('PASS 6.2.11: no overlapping CDN houses, collision footprints, non-penetrating movement/camera, old visual cleanup');
