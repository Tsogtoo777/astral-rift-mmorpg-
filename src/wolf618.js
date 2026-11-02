/** Astral Rift 6.1.8 — ONLY the original Meshy wolf is visible.
 * The supplied FBX wolf is used ONLY as an optional source of Walk/Run joint motion.
 * Sample the FBX pose, transfer the rotations to the 27 original Meshy bones,
 * and bake normal three.js AnimationClips on the original GLB skeleton.
 * Attack/Hit/Dead/Idle always remain the original Meshy GLB clips.
 */
import { loadForestWolf615 } from './wolf615.js';
import { wolf617ClipMap, WOLF_FBX617_URL } from './wolf617.js';

// semantic target-bone -> FBX skeleton bone names (the FBX came from a different artist)
export const WOLF618_BONE_MAP = Object.freeze({
  Hips:'Becken', chest:'Brust', head:'Kopf',
  frontleg:'Schalterplatte_L', frontleg0:'Oberarm_L', frontleg1:'Unterarm_L', frontleg2:'Vorderpfote_L',
  R_frontleg:'Schalterplatte_R', R_frontleg0:'Oberarm_R', R_frontleg1:'Unterarm_R', R_frontleg2:'Vorderpfote_R',
  backleg:'Oberschenkel_L', backleg0:'Unterschenkel_L', backleg1:'Pfote1_L', backleg2:'Pfote2_L',
  R_backleg:'Oberschenkel_R', R_backleg0:'Unterschenkel_R', R_backleg1:'Pfote1_R', R_backleg2:'Pfote2_R',
  tailstart:'Schwanz',tail1:'Schwanz.001',tail2:'Schwanz.002',tail3:'Schwanz.003'
});
function norm(n) {return String(n).toLowerCase().replace(/[^a-z0-9]/g,'');}
function boneMap(root) {
  const bones=new Map();root.traverse(o=>{if(o.isBone)bones.set(norm(o.name),o);});return bones;
}
function getBone(map,name) {return map.get(norm(name));}
function depth(o) {let d=0;while(o?.parent){d++;o=o.parent;}return d;}
function worldQuat(o,THREE){return o.getWorldQuaternion(new THREE.Quaternion());}
function bodyForward(root, bones, hipName, headName, THREE) {
  const hip=getBone(bones,hipName),head=getBone(bones,headName);
  const v=new THREE.Vector3();
  if(!hip||!head)return v.set(0,0,1);
  v.subVectors(head.getWorldPosition(new THREE.Vector3()),hip.getWorldPosition(new THREE.Vector3()));
  v.y=0;return v.lengthSq()>1e-12?v.normalize():v.set(0,0,1);
}
/** Builds 2 clips for the original Meshy skeleton. No FBX mesh is ever rendered. */
export function retargetWolfMotion618({THREE,fbx,meshWolf}) {
  const src=boneMap(fbx),dst=boneMap(meshWolf);
  const pairs=Object.entries(WOLF618_BONE_MAP)
    .map(([to,from])=>({target:getBone(dst,to),source:getBone(src,from),to,from}))
    .filter(x=>x.target&&x.source).sort((a,b)=>depth(a.target)-depth(b.target));
  if(pairs.length<17)throw Error(`Wolf skeleton mapping incomplete: ${pairs.length}/23`);
  fbx.updateMatrixWorld(true);meshWolf.updateMatrixWorld(true);
  // FBX and GLB front directions can differ. Align their body-forward axes once.
  const srcFwd=bodyForward(fbx,src,'Becken','Kopf',THREE);
  const dstFwd=bodyForward(meshWolf,dst,'Hips','head',THREE);
  const align=new THREE.Quaternion().setFromUnitVectors(srcFwd,dstFwd);
  const alignInv=align.clone().invert();
  const srcRest=new Map(),dstRest=new Map(),sourceTransforms=new Map();
  fbx.traverse(o=>{if(o.isBone)sourceTransforms.set(o,{pos:o.position.clone(),q:o.quaternion.clone(),scale:o.scale.clone()});});
  for(const p of pairs){srcRest.set(p.source,worldQuat(p.source,THREE));dstRest.set(p.target,worldQuat(p.target,THREE));}
  const dstBoneSet=new Set(pairs.map(p=>p.target));
  const targetParents=new Map();
  for(const p of pairs){let par=p.target.parent;while(par&&!dstBoneSet.has(par))par=par.parent;targetParents.set(p.target,par);}
  const originalParentQuats=new Map();
  for(const p of pairs){
    const par=p.target.parent;
    if(par&&!originalParentQuats.has(par))originalParentQuats.set(par,worldQuat(par,THREE));
  }
  const authored=wolf617ClipMap(fbx.animations||[]);
  if(!authored.Walk||!authored.Run)throw Error('FBX file does not contain Walk and Run clips');
  const sourceMixer=new THREE.AnimationMixer(fbx);
  const output={};
  for(const name of ['Walk','Run']){
    const input=authored[name];if(!(input.duration>.1))throw Error(`${name} clip too short`);
    sourceMixer.stopAllAction();
    sourceTransforms.forEach((rest,b)=>{b.position.copy(rest.pos);b.quaternion.copy(rest.q);b.scale.copy(rest.scale);});
    fbx.updateMatrixWorld(true);
    const action=sourceMixer.clipAction(input).reset();
    action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();
    const frames=Math.max(12,Math.ceil(input.duration*30));
    const times=[],values=new Map(pairs.map(p=>[p.target,[]]));
    for(let k=0;k<=frames;k++){
      const t=input.duration*k/frames;
      sourceMixer.setTime(t);
      fbx.updateMatrixWorld(true);
      const calculatedWorld=new Map();
      for(const p of pairs){
        // World-space delta is independent of the different local bone axes.
        const delta=worldQuat(p.source,THREE).multiply(srcRest.get(p.source).clone().invert());
        const aligned=align.clone().multiply(delta).multiply(alignInv);
        // Limit large rotations from the unrelated skeleton to protect the mesh.
        const safe=new THREE.Quaternion().slerp(aligned,.8).normalize();
        const world=safe.multiply(dstRest.get(p.target));
        const parent=p.target.parent;
        const parentWorld=calculatedWorld.get(parent)||originalParentQuats.get(parent)||new THREE.Quaternion();
        const local=parentWorld.clone().invert().multiply(world).normalize();
        const v=values.get(p.target);
        if(![local.x,local.y,local.z,local.w].every(Number.isFinite))throw Error('Bad retarget quaternion');
        v.push(local.x,local.y,local.z,local.w);
        calculatedWorld.set(p.target,world);
      }
      times.push(t);
    }
    action.stop();
    const tracks=pairs.map(p=>new THREE.QuaternionKeyframeTrack(`${p.target.name}.quaternion`,times,values.get(p.target)));
    output[name]=new THREE.AnimationClip(name,input.duration,tracks);
    if(output[name].tracks.length<17)throw Error(`Retargeted ${name} insufficient tracks`);
  }
  sourceMixer.stopAllAction();
  sourceTransforms.forEach((rest,b)=>{b.position.copy(rest.pos);b.quaternion.copy(rest.q);b.scale.copy(rest.scale);});
  fbx.updateMatrixWorld(true);
  return output;
}
/** Loads only the ORIGINAL wolf's model, materials and Attack/Hit/Death animations.
 * FBX is optional motion data: failing FBX never changes the displayed creature.
 * URL option ?wolfmotion=original disables experimental retargeting if needed.
 */
export async function loadOriginalWolf618({THREE,GLTFLoader,FBXLoader,enemy}){
  const oldMotion=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('wolfmotion')==='original';
  return loadForestWolf615({THREE,GLTFLoader,enemy,
    motionOverrides:oldMotion?null:async meshWolf=>{
      const fbx=await new FBXLoader().loadAsync(WOLF_FBX617_URL);
      return retargetWolfMotion618({THREE,fbx,meshWolf});
    }
  });
}
