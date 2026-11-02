import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveMeshyRigBones } from '../src/meshy597.js';
const path='public/models/meshy-warrior-mobile.glb';
const bin=fs.readFileSync(path);
assert.equal(bin.toString('ascii',0,4),'glTF','Expected GLB');
const jsonStart=20;
const jsonSize=bin.readUInt32LE(12);
const gltf=JSON.parse(bin.subarray(jsonStart,jsonStart+jsonSize).toString('utf8'));
const jointNames=gltf.skins[0].joints.map(id=>gltf.nodes[id].name);
const expected=['RightArm','RightHand','LeftArm','LeftHand','RightForeArm','LeftForeArm','Spine','Spine1'];
const styles=[
 n=>n,
 n=>n.replaceAll(':','_'),
 n=>n.replaceAll(':',''),
 n=>n.replace(/^mixamorig:/,'')
];
for (const style of styles){
 const bones=jointNames.map(name=>({name:style(name),isBone:true}));
 const root={traverse(cb){for (const bone of bones) cb(bone);}};
 const result=resolveMeshyRigBones(root);
 for (const key of expected){
  assert(result[key],`Bone ${key} missing for ${style('mixamorig:RightHand')}`);
  assert(result[key].name.toLowerCase().replace(/[^a-z0-9]/g,'').endsWith(key.toLowerCase()),`Bad bone mapping: ${key}`);
 }
}
const bones=jointNames.map(name=>({name:name.replace(':','_')}));
const rootWithSkeleton={traverse(cb){cb({isSkinnedMesh:true,skeleton:{bones}});}};
assert(resolveMeshyRigBones(rootWithSkeleton).RightHand,'Fallback to skeleton.bones failed');
const controller=fs.readFileSync('src/meshy597.js','utf8');
const main=fs.readFileSync('src/main.js','utf8');
assert(!controller.includes("throw new Error('Meshy hand/arm bones mismatch')"));
assert.match(controller,/gripAnchor\.add\(grip\)/);
assert.match(main,/ALPHA 5\.9\.9 · MESHY ONLY/);
assert(!main.includes("rodin-rigged.glb"));
console.log('PASS Meshy 5.9.9: 62-joint GLB, name variants, skeleton fallback, no invisible-avatar exception');
