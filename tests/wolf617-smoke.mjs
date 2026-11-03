import assert from 'node:assert/strict';
import fs from 'node:fs';
import {wolf617ClipMap,loadFBXForestWolf617,WOLF_FBX617_URL} from '../src/wolf617.js';
const rawNames=[
 'Wolf_Skeleton|Wolf_Idle_', 'Wolf_Skeleton|Wolf_Walk_cycle_',
 'Wolf_Skeleton|Wolf_Run_Cycle_', 'Wolf_Skeleton|Wolf_creep_cycle',
 'Wolf_Skeleton|Wolf_seat_', 'Wolf_Skeleton|000'
];
const mkClip=name=>({name,duration:1.2});
const map=wolf617ClipMap(rawNames.map(mkClip));
assert.deepEqual(Object.keys(map).sort(),['Creep','Idle','Run','Sit','Walk']);
assert.equal(WOLF_FBX617_URL,'/monsters/forest-wolf/Wolf.fbx');
const skin={isSkinnedMesh:true};
const wolf={animations:rawNames.map(mkClip),traverse(fn){fn(skin);},updateMatrixWorld(){}};
class Loader{async loadAsync(p){assert.equal(p,WOLF_FBX617_URL);return wolf;}}
class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
class Box{setFromObject(){return this;}getSize(){return new Vector3(2,1.5,3)}get min(){return new Vector3(-1,0,-1.5)}get max(){return new Vector3(1,1.5,1.5)}}
class Group{constructor(){this.children=[];this.scale={setScalar(v){this.value=v;}};this.position={set(...v){this.coords=v}};this.rotation={z:0,set(x,y,z){this.z=z}};this.visible=true;}add(o){this.children.push(o);}}
class Action{constructor(clip){this.clip=clip;}setLoop(){return this;}reset(){return this;}setEffectiveWeight(){return this;}play(){this.playing=true;return this;}fadeOut(){return this;}fadeIn(){return this;}stop(){this.playing=false;return this;}}
class Mixer{clipAction(c){return new Action(c);}update(dt){assert.ok(dt>=0)}}
const THREE={Vector3,Box3:Box,Group,AnimationMixer:Mixer,LoopRepeat:2201};
const old={visible:true};const warn={visible:true};const enemy={warnRing57:warn,g:{children:[old,warn],add(x){this.children.push(x)}}};
const controller=await loadFBXForestWolf617({THREE,FBXLoader:Loader,enemy});
assert.equal(controller.state,'Idle');assert.equal(controller.root.scale?.value,undefined);assert.equal(old.visible,false);assert.equal(warn.visible,true);
assert.equal(controller.source,'FBX-Authored');
for(let i=0;i<18;i++)controller.update(.05,{alive:true,phase:'chase',distance:.18});
assert.equal(controller.state,'Run');
controller.update(.05,{alive:true,phase:'windup',distance:0});assert.equal(controller.state,'Creep');
controller.hit();controller.update(.1,{alive:true,phase:'chase',distance:.08});
controller.die();for(let i=0;i<55;i++)controller.update(.05,{alive:false});
assert.equal(controller.deathFinished,true);assert.equal(controller.root.visible,false);
controller.revive();assert.equal(controller.state,'Idle');assert.equal(controller.root.visible,true);
const main=fs.readFileSync('src/main.js','utf8');
assert.match(main,/import \{ FBXLoader \} from 'three\/addons\/loaders\/FBXLoader\.js'/);
assert.doesNotMatch(main,/loadFBXForestWolf617\(/);assert.match(main,/loadOriginalWolf618\(/);
assert.match(main,/ALPHA 6\.2/);
console.log('PASS 6.1.7: authored motion discovery, safe FBX loading, fallback wiring, combat state and death lifecycle');
