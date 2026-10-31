// Standalone Alpha 4.0 smoke test. No npm packages or browser required.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
class Vector3 {constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}clone(){return new Vector3(this.x,this.y,this.z)}distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z)}sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}normalize(){const d=Math.hypot(this.x,this.y,this.z)||1;this.x/=d;this.y/=d;this.z/=d;return this}length(){return Math.hypot(this.x,this.y,this.z)}addScaledVector(v,k){this.x+=v.x*k;this.y+=v.y*k;this.z+=v.z*k;return this}copy(v){return this.set(v.x,v.y,v.z)}}
class Group{constructor(){this.position=new Vector3();this.rotation={x:0,y:0,z:0};this.scale={x:1,y:1,z:1};this.children=[];this.visible=true}add(x){this.children.push(x);x.parent=this}getWorldPosition(v){let o=this;v.set(0,0,0);while(o){v.x+=o.position.x;v.y+=o.position.y;v.z+=o.position.z;o=o.parent}return v}}
class Mesh extends Group{constructor(geo,material){super();this.geometry=geo;this.material=material}}
class BoxGeometry{constructor(...a){this.a=a}}
class CylinderGeometry{constructor(...a){this.a=a}}
class ConeGeometry{constructor(...a){this.a=a}}
class SphereGeometry{constructor(...a){this.a=a}}
class OctahedronGeometry{constructor(...a){this.a=a}}
class TorusGeometry{constructor(...a){this.a=a}}
class PlaneGeometry{constructor(...a){this.a=a}}
class MeshStandardMaterial{constructor(o){Object.assign(this,o)}}
class MeshBasicMaterial{constructor(o){Object.assign(this,o)}}
class CanvasTexture{constructor(c){this.canvas=c}}
const SRGBColorSpace='sRGB';
class Raycaster{set(){}intersectObjects(){return []}}
const MathUtils={clamp:(v,a,b)=>Math.min(b,Math.max(a,v))};

const THREE={Vector3,Group,Mesh,BoxGeometry,CylinderGeometry,ConeGeometry,SphereGeometry,OctahedronGeometry,TorusGeometry,PlaneGeometry,MeshStandardMaterial,MeshBasicMaterial,CanvasTexture,SRGBColorSpace,Raycaster,MathUtils};
globalThis.__THREE_MOCK__=THREE;
const source=fs.readFileSync(path.join(dir,'../src/alpha40.js'),'utf8').replace("import * as THREE from 'three';",'const THREE=globalThis.__THREE_MOCK__;');
const {createAlpha40}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

const elements=new Map();class E{constructor(tag='div'){this.tag=tag;this.style={};this.classList={open:false,add:()=>this.classList.open=true,remove:()=>this.classList.open=false,contains:()=>this.classList.open};this.children=[];this.textContent=''}set innerHTML(v){this.html=v}get innerHTML(){return this.html}appendChild(x){this.children.push(x)}querySelector(q){if(!elements.has(q))elements.set(q,new E(q));return elements.get(q)}getContext(){return new Proxy({},{get:(t,k)=>t[k]??(()=>{})})}addEventListener(){}setAttribute(){}}
globalThis.document={createElement:t=>new E(t),getElementById:id=>{if(!elements.has('#'+id))elements.set('#'+id,new E());return elements.get('#'+id)}};
globalThis.window={addEventListener:()=>{}};const saved=new Map();globalThis.localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};globalThis.devicePixelRatio=1;
let castle=false,interior=false,dungeon=false,gold=0,ore=0,crystal=0,xp=0;const scene=new Group(),player=new Group(),castleHall25=new Group(),interior09=new Group();
const api={scene,player,renderer:{setPixelRatio(){},setSize(){},shadowMap:{}},camera:{},castleHall25,hallOrigin25:new Vector3(56,0,51),interior09,rooms22:[new Group()],openWindow(){},closeWindow(){},msg(){},saveGame(){},gainXp:v=>xp+=v,teleport25(){},app:new E(),panel:new E(),isCastle:()=>castle,isInterior:()=>interior,isDungeon:()=>dungeon,getHour:()=>12,addResources:({gold:g=0,ore:o=0,crystal:c=0})=>{gold+=g;ore+=o;crystal+=c}};
const w=createAlpha40(api);
if(!w.blocked(27+5,15))throw Error('Guild wall collision failed');
if(w.blocked(27,15-4.5))throw Error('Guild entrance is blocked');
player.position.set(23,0,7);if(!w.interact())throw Error('Guild NPC missing');document.getElementById('guildStart40').onclick();
for(let i=0;i<3;i++)w.recordKill({boss:false});
player.position.set(36,0,-44);if(!w.interact())throw Error('Ruins relic missing');
player.position.set(23,0,7);w.interact();document.getElementById('guildClaim40').onclick();
if(gold!==350||ore!==4||crystal!==2||xp!==250)throw Error('Quest rewards failed');
castle=true;player.position.set(56,0,45);if(!w.interact())throw Error('Royal NPC missing');
if(!w.blocked(56,43.8))throw Error('Throne collision missing');
player.position.set(56,0,48);w.update(1000,.016);
w.showMap();w.hideMap();
console.log('PASS: module construction, world collisions, quest, rewards, royal dialogue, map, update');
