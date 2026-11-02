import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeGearLoadPlan591,createEquipmentVisual591} from '../src/equipmentVisual591.js';
import {createEquipment59} from '../src/equipment59.js';

assert.deepEqual(makeGearLoadPlan591({boots:'wanderer-boots',cloak:'teal-cape',weapon:'iron-longsword'}),['boots','cloak']);
assert.deepEqual(makeGearLoadPlan591({boots:null,cloak:null,weapon:'dark-katana'}),['katana']);

const nodes={};
function node(name,{isMesh=false}={}) {
  const n={name,isMesh,children:[],parent:null,visible:true,
    material:{clone(){return {...this}},side:0},
    position:{set(...v){this.value=v}},rotation:{set(...v){this.value=v},set y(v){this.yAngle=v}},scale:{setScalar(v){this.value=v}},
    add(child){child.removeFromParent?.();this.children.push(child);child.parent=this},
    remove(child){this.children=this.children.filter(c=>c!==child);child.parent=null},
    removeFromParent(){this.parent?.remove(this)},
    traverse(cb){cb(this);for(const child of this.children)child.traverse(cb)},
    getObjectByName(query){if(this.name===query)return this;for(const child of this.children){const hit=child.getObjectByName(query);if(hit)return hit}return null}
  };nodes[name]=n;return n;
}
const root=node('Rodin');
const l=node('LeftLeg'),r=node('RightLeg'),spine=node('Spine2');
root.add(l);root.add(r);root.add(spine);
const loaded=[];
const mounted=[];
const rodin={root,setExternalSwordModel(model){mounted.push(model)}};
const loader={load(url,onLoad,_progress,onError){loaded.push(url);
  const scene=node('Scene'+url);
  if(url.includes('greaves')){scene.add(node('LeftGreave',{isMesh:true}));scene.add(node('RightGreave',{isMesh:true}));}
  else scene.add(node(url.includes('cape')?'CapeMesh':'KatanaMesh',{isMesh:true}));
  onLoad({scene});
}};
const gear=createEquipment59();
const vis=createEquipmentVisual591({DoubleSide:2},loader,rodin,gear);
await vis.sync();
assert.equal(l.children.length,1);
assert.equal(r.children.length,1);
assert.equal(spine.children.length,1);
assert.equal(loaded.length,2,'load only equipped assets');
assert.equal(mounted.length,0,'do not preload locked katana');
assert.deepEqual(l.children[0].position.value,[0,-.49,.016]);
gear.unequip('cloak');await vis.sync();
assert.equal(spine.children[0].visible,false,'unequipping hides rigid cape');
gear.buy('dark-katana',999);gear.equip('dark-katana');await vis.sync();
assert.equal(loaded.length,3);
assert.equal(mounted.length,1);
assert(mounted[0], 'real katana attached when purchased and equipped');
await vis.sync();assert.equal(loaded.length,3,'assets cached across UI refresh');
vis.dispose(); assert.equal(l.children.length,0);assert.equal(spine.children.length,0);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const rodinCode=fs.readFileSync(new URL('../src/rodin54.js',import.meta.url),'utf8');
assert(main.includes('equipmentVisual591=createEquipmentVisual591'));
assert(main.includes('equipmentVisual591?.sync()'));
assert(rodinCode.includes('setExternalSwordModel'));
console.log('PASS Alpha 5.9.1: 3D models attached lazily, 2 greaves follow shin bones, cloak toggles, katana loaded on equip, cached + safe dispose');
