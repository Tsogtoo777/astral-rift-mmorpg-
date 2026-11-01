import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeGearLoadPlan591,createEquipmentVisual591,validateSkinnedGear592} from '../src/equipmentVisual591.js';
import {createEquipment59} from '../src/equipment59.js';

const boneNames=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End','LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftHand_End','RightShoulder','RightArm','RightForeArm','RightHand','RightHand_End','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End','RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End'];
function vec(){return {copy(src){this.source=src;return this},set(...v){this.value=v},setScalar(v){this.value=v}}}
function obj(name,isMesh=false){return {name,isMesh,children:[],parent:null,position:vec(),quaternion:vec(),scale:vec(),rotation:{set(...v){this.value=v}},visible:true,
  add(child){child.removeFromParent();child.parent=this;this.children.push(child)},
  remove(child){this.children=this.children.filter(v=>v!==child);child.parent=null},
  removeFromParent(){this.parent?.remove(this)},
  traverse(f){f(this);for(const ch of this.children)ch.traverse(f)},
  updateWorldMatrix(){},
  getObjectByName(name){if(this.name===name)return this;for(const ch of this.children){const f=ch.getObjectByName(name);if(f)return f}return null}
}}
function attribute(count,kind='weight'){
  return {count,itemSize:4,values:new Uint8Array(count*4),clone(){const x=attribute(count);x.values.set(this.values);return x},getComponent(i,c){return this.values[4*i+c]},setComponent(i,c,v){this.values[4*i+c]=v}}
}
function geo(){const index=attribute(6),weight=attribute(6);for(let i=0;i<6;i++){index.setComponent(i,0,18);weight.setComponent(i,0,255)}
 const attributes={position:{count:6},skinIndex:index,skinWeight:weight};return {attributes,getAttribute(k){return attributes[k]},setAttribute(k,v){attributes[k]=v},clone(){return {...this,attributes:{...attributes}}}}
}
function material(){return {clone(){return material()},dispose(){this.disposed=true}}}
class SkinnedMesh {
  constructor(geometry,mat){Object.assign(this,obj('skinnedGear'));this.isSkinnedMesh=true;this.geometry=geometry;this.material=mat}
  bind(skeleton,matrix){this.skeleton=skeleton;this.bindMatrix=matrix}
}
const parent=obj('RigParent'),host=obj('RodinBody',true);host.isSkinnedMesh=true;
host.skeleton={bones:boneNames.map(name=>({name}))};host.bindMatrix={clone(){return {source:'bodyBind'}}};host.bindMode='attached';
parent.add(host);
const root=obj('RodinRoot');root.add(parent);const originalCape=obj('RodinOriginalCape594',true);originalCape.isSkinnedMesh=true;root.add(originalCape);
const rodin={root,setExternalSwordModel(v){this.sword=v}};
const resources={};const urls=[];
function mesh(name){const m=obj(name,true);m.geometry=geo();m.material=material();return m}
const loader={load(url,onDone){urls.push(url);const source=obj('Asset');
 if(url.includes('greaves')){source.add(mesh('LeftGreave'));source.add(mesh('RightGreave'))}
 else if(url.includes('cape'))source.add(mesh('TealCape'));
 else source.add(mesh('PurpleKatana'));
 const gltf={scene:source,parser:{json:{extras:{rodinSkinOrder592:boneNames}}}};
 onDone(gltf);
 }};
const THREE={SkinnedMesh,DoubleSide:2};
assert.deepEqual(makeGearLoadPlan591({boots:'wanderer-boots',cloak:'teal-cape',weapon:'iron-longsword'}),['boots','cloak']);
const equip=createEquipment59();const visual=createEquipmentVisual591(THREE,loader,rodin,equip);
await visual.sync();
assert.equal(visual.loaded.boots.length,2);
assert.equal(visual.loaded.cloak.length,1);
assert.equal(originalCape.visible,false,'new teal cape hides the original cape only after successful load');
assert.equal(host.children?.length||0,0,'does not mount static gear under existing bone or original body');
assert.equal(parent.children.length,4,'body plus two skinned greaves and cape');
for(const item of [...visual.loaded.boots,...visual.loaded.cloak]){
 assert(item.isSkinnedMesh);
 assert.equal(item.skeleton,host.skeleton,'uses live Rodin skeleton');
 assert.equal(item.bindMatrix.source,'bodyBind');
}
assert(urls.every(s=>s.includes('-skinned.glb')));
equip.unequip('cloak');await visual.sync();assert.equal(visual.loaded.cloak[0].visible,false);assert.equal(originalCape.visible,true,'unequip restores original cape');
equip.equip('teal-cape');await visual.sync();assert.equal(originalCape.visible,false,'re-equip hides original again');
equip.buy('dark-katana',999);equip.equip('dark-katana');await visual.sync();
assert(rodin.sword,'Katana retains hand socket, not a deforming skinned mesh');
assert(urls.some(s=>s.endsWith('rodin-dark-katana.glb')));
await visual.sync();assert.equal(urls.length,3,'cached');
visual.dispose();assert.equal(parent.children.length,1);assert.equal(originalCape.visible,true,'cleanup restores original cape');
// The renamed existing file is intentionally kept for small patches.
const code=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert(code.includes('createEquipmentVisual591'));
console.log('PASS 5.9.2: weighted greaves/cape share live Rodin skeleton, enable/disable, katana hard socket, lazy load, cleanup');
