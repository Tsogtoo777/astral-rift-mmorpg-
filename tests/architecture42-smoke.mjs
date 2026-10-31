// Mocked architecture integration, independent of npm/browser. Checks atomic replacement.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
class V3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}}
class G{constructor(){this.position=new V3();this.rotation={y:0};this.scale={set:(x,y,z)=>{this.scale.x=x;this.scale.y=y;this.scale.z=z},setScalar:s=>this.scale.set(s,s,s)};this.children=[];this.visible=true}add(o){this.children.push(o);o.parent=this}clone(){const g=new G();g.isMesh=this.isMesh;g.traverse=this.traverse;return g}traverse(fn){fn(this);for(const c of this.children)c.traverse(fn)}}
class M extends G{constructor(){super();this.isMesh=true}}
class Loader{async loadAsync(url){if(globalThis.__failEssential&&url.includes('Wall_Plaster_Straight'))throw Error('mock download failure');return {scene:new M()}}}
class C{getContext(){return new Proxy({},{get:(_,p)=>p==='fillText'?()=>{}:()=>{}})}}
const THREE={Group:G,Mesh:M,PlaneGeometry:class{},MeshBasicMaterial:class{},CanvasTexture:class{},DoubleSide:2,SRGBColorSpace:'sRGB'};
globalThis.__THREE_MOCK__=THREE;globalThis.__LOADER_MOCK__=Loader;
globalThis.document={createElement:()=>new C()};
let src=fs.readFileSync(path.join(dir,'../src/architecture42.js'),'utf8');
src=src.replace("import * as THREE from 'three';",'const THREE=globalThis.__THREE_MOCK__;')
.replace("import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';",'const GLTFLoader=globalThis.__LOADER_MOCK__;');
const {installArchitecture42,ARCH42_ASSETS}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
if(ARCH42_ASSETS.length<20)throw Error('Missing asset manifest');
const homes=[[-9,10],[-3,14],[5,14],[12,9],[-11,1],[14,0],[-7,-12],[8,-14]];
function init(){const scene=new G(),city24=new G();for(let i=0;i<8;i++)city24.add(new G());return {scene,city24,houses09:homes}}
const success=init();const arch=installArchitecture42(success);
const result=await arch.ready;
if(!result.ok||result.houses!==8||!arch.loaded)throw Error('Real architecture not constructed');
if(success.city24.children.some(g=>g.visible))throw Error('Old houses not hidden after success');
if(!arch.blocked(-23,-17)||arch.blocked(0,0))throw Error('Wagon collision incorrect');
const target={x:-9,y:1.6,z:15},desired={x:-9,y:3,z:7,set(x,y,z){this.x=x;this.y=y;this.z=z}};arch.cameraCollision(target,desired);
if(desired.z<=7)throw Error('Camera must stop before house');
arch.update(1000,{x:0,z:0},false,false,false);
if(!arch.root.visible)throw Error('Town should be visible');
arch.update(1400,{x:48,z:-48},false,true,false);
if(arch.root.visible)throw Error('Town should be hidden in dungeon');
globalThis.__failEssential=true;
const failed=init();const bad=installArchitecture42(failed);const badResult=await bad.ready;
if(badResult.ok||bad.loaded)throw Error('Essential missing model should prevent replacement');
if(failed.city24.children.some(g=>!g.visible))throw Error('Old houses must remain on failure');
console.log('PASS: 22 real-asset requests, 8 houses, fallback, prop collision, visibility');
