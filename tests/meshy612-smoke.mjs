import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stabilizeMeshyCapeWeights} from '../src/meshy597.js';
const src=fs.readFileSync('src/meshy597.js','utf8');
assert.match(src,/IdleNeutral612/);
assert.match(src,/node\?\.quaternion\?\.toArray\(\)/);
assert.doesNotMatch(src,/IdleGenerated598|stillPoseClip\(/);
assert.match(src,/if\(next===movement && active\)return/);
assert.match(src,/bone\.quaternion\.slerp\(rest\.q,correction\)/);
assert.match(src,/capeRest/);
assert.match(src,/MeshyContactShadow612/);
assert.match(src,/skinned mesh|SkinnedMesh/i);
const binary=fs.readFileSync('public/models/meshy-warrior-mobile.glb');
assert.equal(binary.toString('ascii',0,4),'glTF');
const jsonSize=binary.readUInt32LE(12);
const gltf=JSON.parse(binary.toString('utf8',20,20+jsonSize));
const dataOffset=20+jsonSize+8;
const prim=gltf.meshes[0].primitives[0];
const dtypes={5121:['getUint8',1],5123:['getUint16',2],5125:['getUint32',4],5126:['getFloat32',4]};
function attribute(index){
 const a=gltf.accessors[index],view=gltf.bufferViews[a.bufferView];
 const elems={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type];
 const [getter,bytes]=dtypes[a.componentType];
 const offset=dataOffset+(view.byteOffset||0)+(a.byteOffset||0);
 const stride=view.byteStride||bytes*elems;
 const buffer=new DataView(binary.buffer,binary.byteOffset,binary.byteLength);
 const rows=Array.from({length:a.count},(_,i)=>Array.from({length:elems},(_,k)=>buffer[getter](offset+i*stride+k*bytes,true)));
 return rows;
}
const pos=attribute(prim.attributes.POSITION);
const joints=attribute(prim.attributes.JOINTS_0);
const weight=attribute(prim.attributes.WEIGHTS_0);
const originals=weight.map(x=>[...x]);
const bones=gltf.skins[0].joints.map(id=>({name:gltf.nodes[id].name.replaceAll(':','_')}));
class Attr{
 constructor(arr){this.rows=arr;this.count=arr.length;this.needsUpdate=false;}
 getY(i){return this.rows[i][1]}
 getComponent(i,k){return this.rows[i][k]}
 setComponent(i,k,value){this.rows[i][k]=value}
}
const geometry={attributes:{position:new Attr(pos),skinIndex:new Attr(joints),skinWeight:new Attr(weight)},userData:{}};
const mesh={isSkinnedMesh:true,skeleton:{bones},geometry};
const root={traverse(fn){fn(mesh)}};
const fixed=stabilizeMeshyCapeWeights(root);
assert(fixed>250,`Expected actual cape leakage; modified ${fixed} vertices`);
assert(fixed<15000,`Too broad; edited ${fixed} vertices`);
assert(geometry.attributes.skinWeight.needsUpdate);
let changed=0;
for(let i=0;i<weight.length;i++){
 const total=weight[i].reduce((a,b)=>a+b,0);
 assert(Math.abs(total-1)<1e-4,`Vertex ${i} weights no longer normalized: ${total}`);
 if(weight[i].some((v,k)=>Math.abs(v-originals[i][k])>1e-4)) changed++;
}
assert.equal(changed,fixed);
assert.equal(stabilizeMeshyCapeWeights(root),0,'Cape processing must be idempotent');
console.log(`PASS 6.1.2: neutral idle, leg knee damping, cape chains; ${fixed} real GLB vertices cleaned without weight loss`);
