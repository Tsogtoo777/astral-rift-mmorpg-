import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chooseGoblinMotion614,loadGoblin614} from '../src/goblin614.js';
assert.equal(chooseGoblinMotion614({alive:false}), 'Dead');
assert.equal(chooseGoblinMotion614({phase:'windup'}), 'Attack');
assert.equal(chooseGoblinMotion614({distance:0,dt:.016}), 'Idle');
assert.equal(chooseGoblinMotion614({distance:.009,dt:.016}), 'Walking');
assert.equal(chooseGoblinMotion614({distance:.08,dt:.016}), 'Running');

// Minimal pure JS three.js-shaped mock for the main lifecycle (no WebGL dependency).
const mkClip=name=>({name,duration:name==='Dead'?2.97:name==='Attack'?2.8:1});
const child={isSkinnedMesh:true,frustumCulled:true,castShadow:false};
const root={name:'',scale:{setScalar(x){this.value=x}},position:{set(...v){this.xyz=v}},traverse(cb){cb(child);}};
const asset={scene:root,animations:['Idle','Walking','Running','Attack','Dead'].map(mkClip)};
class Loader{async loadAsync(url){assert.match(url,/\.glb$/);return asset;}}
class Vec{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}}
class Box3{setFromObject(){return this;}getSize(){return new Vec(1,1.27,1)} get min(){return new Vec(-.5,0,-.5)} get max(){return new Vec(.5,1.27,.5)}}
class Action{
 constructor(clip){this.clip=clip;this.time=0;}setLoop(){return this;}setEffectiveTimeScale(n){this.rate=n;return this;}
 setEffectiveWeight(){return this;}reset(){this.time=0;return this;}play(){this.playing=true;return this;}
 fadeOut(){return this;}fadeIn(){return this;}stop(){this.playing=false;return this;}getClip(){return this.clip;}
}
class Mixer{constructor(){this.actions={};}clipAction(c){return this.actions[c.name]??=new Action(c);}update(dt){for(const a of Object.values(this.actions))if(a.playing)a.time+=dt*(a.rate||1);}}
const THREE={Vector3:Vec,Box3,AnimationMixer:Mixer,LoopOnce:1,LoopRepeat:2};
const stand={name:'placeholder',visible:true};const warn={visible:false};
const enemy={g:{children:[stand,warn],add(o){this.children.push(o)}},warnRing57:warn,warnMark57:warn};
const visual=await loadGoblin614({THREE,GLTFLoader:Loader,enemy});
assert.equal(stand.visible,false,'placeholder must hide, but remain as combat proxy');
assert.equal(visual.state,'Idle');assert.equal(root.scale.value>1,true);
visual.update(.016,{alive:true,phase:'chase',distance:.05});assert.equal(visual.state,'Running');
visual.update(.016,{alive:true,phase:'windup',distance:0});assert.equal(visual.state,'Attack');
visual.die();assert.equal(visual.state,'Dead');
for(let i=0;i<65;i++)visual.update(.05,{alive:false,distance:0,phase:'idle'});
assert.equal(visual.deathFinished,true);assert.equal(root.visible,false);
visual.revive();assert.equal(visual.state,'Idle');assert.equal(root.visible,true);
const main=fs.readFileSync('src/main.js','utf8');
assert.match(main,/const goblinEnemy614=spawn\(-23,-24\)/);
assert.match(main,/loadGoblin614\(\{THREE,GLTFLoader,enemy:goblinEnemy614\}\)/);
assert.match(main,/e\.visual614\?\.die\(\)/);
assert.match(main,/e\.visual614\?\.revive\(\)/);
assert.match(main,/enemyAI57\.phase\(e\)/);
assert.match(main,/e\.visual614\?\.update\(dt,\{alive:false/);
assert.match(main,/ALPHA 6\.1\.4 · GOBLIN/);
console.log('PASS 6.1.4: one rigged Goblin, state transitions, attack/death/revive, existing AI and loot wiring');
