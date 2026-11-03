import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chooseWolfMotion615, loadForestWolf615 } from '../src/wolf615.js';
assert.equal(chooseWolfMotion615({alive:false}),'Dead');
assert.equal(chooseWolfMotion615({phase:'windup'}),'Attack');
assert.equal(chooseWolfMotion615({distance:0,dt:.016}),'Idle');
assert.equal(chooseWolfMotion615({distance:.005,dt:.016}),'Walk');
assert.equal(chooseWolfMotion615({distance:.06,dt:.016}),'Run');
// Mock GLTFLoader/Three public API to test wolf lifecycle independently of WebGL.
const mkClip=name=>({name,duration:name==='Dead'?1.75:name==='Attack'?1.15:1});
const skin={isSkinnedMesh:true};
const root={scale:{value:.01},name:'Armature',updateMatrixWorld(){},traverse(cb){cb(skin);}};
const originalScale=root.scale.value;
class Loader{async loadAsync(url){assert.equal(url,'/monsters/forest_wolf.glb');return {scene:root,animations:['Idle','Walk','Run','Attack','Hit','Dead','Howl'].map(mkClip)};}}
class Vec{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}}
class Group{constructor(){this.children=[];this.scale={setScalar(x){this.value=x}};this.position={set(...xyz){this.xyz=xyz}};}add(a){this.children.push(a);}}
class Box{setFromObject(){return this;}getSize(){return new Vec(.001,.000265,.001);}get min(){return new Vec(-.00013,-.00013,-.00015);}get max(){return new Vec(.00013,.000135,.00015);}}
class Act{constructor(clip){this.clip=clip;this.time=0;}setLoop(){return this;}setEffectiveTimeScale(v){this.rate=v;return this;}setEffectiveWeight(){return this;}reset(){this.time=0;return this;}play(){this.playing=true;return this;}stop(){this.playing=false;return this;}fadeOut(){return this;}fadeIn(){return this;}}
class Mixer{constructor(){this.all=[];}clipAction(c){const a=new Act(c);this.all.push(a);return a;}update(dt){for(const a of this.all)if(a.playing)a.time+=dt*(a.rate||1);}}
const THREE={Group,Box3:Box,Vector3:Vec,AnimationMixer:Mixer,LoopOnce:1,LoopRepeat:2};
const proxy={visible:true},warn={visible:true};const enemy={g:{children:[proxy,warn],add(m){this.children.push(m);}},warnRing57:warn};
const visual=await loadForestWolf615({THREE,GLTFLoader:Loader,enemy});
assert.equal(root.scale.value,originalScale,'Original skinned GLTF armature scale must remain .01');
assert.equal(visual.root.scale.value>1000,true,'Original tiny wolf asset requires large outer normalizing scale');
assert.equal(proxy.visible,false);assert.equal(warn.visible,true);
assert.equal(visual.state,'Idle');
for(let i=0;i<12;i++)visual.update(.05,{alive:true,phase:'chase',distance:.16});assert.equal(visual.state,'Run');
visual.update(.016,{alive:true,phase:'windup',distance:0});assert.equal(visual.state,'Attack');
visual.die();assert.equal(visual.state,'Dead');
for(let i=0;i<40;i++)visual.update(.05,{alive:false,phase:'idle',distance:0});
assert.equal(visual.deathFinished,true);assert.equal(visual.root.visible,false);
visual.revive();assert.equal(visual.state,'Idle');assert.equal(visual.root.visible,true);
const main=fs.readFileSync('src/main.js','utf8');
for(const p of [/loadOriginalWolf618/,/wolfEnemy615=spawn\(-30,-23\)/,/e\.visual615\?\.die\(\)/,/e\.visual615\?\.revive\(\)/,/e\.visual615\?\.update\(dt,motion\)/])assert.match(main,p);
console.log('PASS 6.1.5: wolf states, safe root scale, one wolf spawn, death and respawn, GLB wiring');
