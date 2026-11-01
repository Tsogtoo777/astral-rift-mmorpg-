// Alpha 5.5. Tests use the ACTUAL uploaded GLB metadata and a minimal Three-like
// runtime stub. These tests prove controller wiring, not rendered visual quality.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRodin54 } from '../src/rodin54.js';
const asset = fs.readFileSync(new URL('../public/models/rodin-rigged.glb',import.meta.url));
assert.equal(asset.toString('utf8',0,4),'glTF');
const byteLength = asset.readUInt32LE(8);
assert.equal(byteLength,asset.length);
const jsonLength = asset.readUInt32LE(12);
const info = JSON.parse(asset.toString('utf8',20,20+jsonLength));
assert.equal(info.skins.length,1);
assert.equal(info.skins[0].joints.length,27);
assert.deepEqual(info.animations.map(a=>a.name),['Bind','Idle','Walk','Run','Wave']);
const skinAttrs = info.meshes[0].primitives[0].attributes;
assert.ok('JOINTS_0' in skinAttrs && 'WEIGHTS_0' in skinAttrs);
const clips = info.animations.map(a=>({name:a.name,duration:a.name==='Bind'?0:1}));
class Vec3 {
  constructor(x=0,y=0,z=0){this.set(x,y,z)}
  set(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;return this}
  setScalar(v){return this.set(v,v,v)}
}
class Quat {multiply(){this.multiplies=(this.multiplies||0)+1;return this}setFromEuler(){return this}}
class Euler {set(){return this}}
class Node {
  constructor(name=''){this.name=name;this.children=[];this.position=new Vec3();this.rotation={set(){}};this.scale=new Vec3(1,1,1);this.quaternion=new Quat();this.isMesh=false;this.isSkinnedMesh=false;this.visible=true}
  add(obj){this.children.push(obj);return this}
  traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}
  getObjectByName(name){if(this.name===name)return this;for(const c of this.children){const found=c.getObjectByName(name);if(found)return found}}
}
class Group extends Node{}
class Mesh extends Node {constructor(...args){super();this.isMesh=true;this.geometry=args[0];this.material=args[1]}}
class Line extends Node{}
class BufferGeometry {setFromPoints(){return this}}
class Box3 {setFromObject(){this.min=new Vec3(-.5,0,-.3);this.max=new Vec3(.5,1.68883,.3);return this}getSize(v){return v.set(1,1.68883,.6)}}
class Action {
  constructor(clip){this.clip=clip;this.playing=false}
  setLoop(){return this}reset(){return this}setEffectiveWeight(){return this}setEffectiveTimeScale(){return this}
  play(){this.playing=true;return this}fadeIn(){return this}fadeOut(){return this}
}
class Mixer {
  constructor(){this.actions=new Map()}
  clipAction(clip){if(!this.actions.has(clip.name))this.actions.set(clip.name,new Action(clip));return this.actions.get(clip.name)}
  update(dt){this.lastUpdate=dt}
}
const THREE={Box3,Vector3:Vec3,Quaternion:Quat,Euler,Group,Mesh,Line,BufferGeometry,
  CylinderGeometry:class{},BoxGeometry:class{},ConeGeometry:class{},TorusGeometry:class{},SphereGeometry:class{},
  MeshStandardMaterial:class{},LineBasicMaterial:class{},AnimationMixer:Mixer,LoopRepeat:1};
const root=new Group('ArcadeRig');
root.add(Object.assign(new Mesh(),{isSkinnedMesh:true,name:'model'}));
for(const b of info.skins[0].joints){
  const name=info.nodes[b].name;
  root.add(new Group(name));
}
const holder=new Group('Holder');
const ctl=createRodin54(THREE,{scene:root,animations:clips},holder);
assert.equal(holder.children.length,1);
assert.equal(ctl.movementState,'Idle');
assert.equal(ctl.version,'5.8');
assert.equal(root.getObjectByName('RodinSword55').visible,true);
assert.equal(root.getObjectByName('RodinBow55').visible,false);
ctl.update({dt:1/60,moving:true,weapon:0});
assert.equal(ctl.movementState,'Walk');
ctl.update({dt:1/60,moving:true,sprinting:true,weapon:0});
assert.equal(ctl.movementState,'Run');
ctl.update({dt:1/60,moving:false,weapon:0});
assert.equal(ctl.movementState,'Idle');
assert.equal(ctl.version,'5.8');
ctl.triggerAttack();
ctl.update({dt:1/60,weapon:0});
ctl.update({dt:1/60,weapon:0});
assert.ok(root.getObjectByName('RightArm').quaternion.multiplies>0);
assert.equal(ctl.comboStep,1);
assert.equal(ctl.attackActive,true);
for(let i=0;i<12;i++)ctl.update({dt:1/60,weapon:0});
assert.ok(ctl.strikeWeight>0, 'windup must advance to a real strike pose');
ctl.triggerAttack(0);
assert.equal(ctl.comboStep,2);
ctl.triggerAttack(0);
assert.equal(ctl.comboStep,3);
ctl.update({dt:1/60,weapon:0});
assert.ok(root.getObjectByName('LeftArm').quaternion.multiplies>0, 'heavy attack moves support arm');
ctl.update({dt:1/60,weapon:1});
assert.equal(root.getObjectByName('RodinSword55').visible,false);
assert.equal(root.getObjectByName('RodinBow55').visible,true);
assert.equal(ctl.currentWeapon,1);
ctl.triggerAttack(1);
assert.equal(ctl.comboStep,1,'bow attacks do not advance sword combo');
ctl.update({dt:1/60,weapon:0});
assert.equal(root.getObjectByName('RodinSword55').visible,true);
assert.equal(root.getObjectByName('RodinBow55').visible,false);
for(const missing of ['Idle','Walk','Run']) {
  assert.throws(()=>createRodin54(THREE,{scene:root,animations:clips.filter(x=>x.name!==missing)},new Group()),new RegExp('дутуу'));
}
console.log('PASS: real GLB metadata 27 bones, 5 clips, skinned mesh; movement fades, attached weapons, attack, missing-clip safeguards');

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('ALPHA 5.8 · GREAT SWORD COMBAT'));
assert.ok(main.includes('Math.hypot(move.x,move.y)>.88'),'mobile full joystick must activate sprint');
assert.ok(main.includes('rodin54?.triggerAttack(state.weapon)'),'bow and sword attacks must differ');
assert.ok(!main.includes('/models/samurai-player.glb'));
assert.ok(!main.includes('/models/hero.glb'));
assert.ok(main.includes('cameraDistance10=(inside09>=0||inCastle25)?3.15:3.95'));
console.log('PASS: retained 5.5 rigged Rodin poses and mobile sprint inside Alpha 5.7');
