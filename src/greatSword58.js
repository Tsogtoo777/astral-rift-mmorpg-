/** Astral Rift Alpha 5.8.1 — safe additive animation retarget for the supplied Great Sword Pack.
 * No FBX avatar mesh is rendered: only animation clips are mapped onto the
 * user's existing 27-bone, rigged Rodin GLB. Unsupported clips fail safely.
 */
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { clone, retargetClip } from 'three/addons/utils/SkeletonUtils.js';
import { GREAT_SWORD_MOTIONS58, greatSwordNames58, safeCombatBone581, swordEnvelope581 } from './greatSwordMap58.js';

const STATUS = Object.freeze({ready:'ready',partial:'partial',fallback:'fallback'});

function skinnedMesh58(root) {
  let result=null;
  root.traverse(obj=>{if(obj.isSkinnedMesh&&!result)result=obj;});
  return result;
}
function boneNames58(bones) {return bones.map(b=>b.name).filter(Boolean);}

export async function loadGreatSword58(THREE, rodin, {onProgress=()=>{}}={}) {
  if(!rodin?.root || !rodin?.installCombatAnimations) {
    throw new Error('Rigged Rodin animation controller байхгүй');
  }
  const loader=new FBXLoader();
  const errors=[];
  let success=0;
  const targetRig=clone(rodin.root);
  const targetMesh=skinnedMesh58(targetRig);
  if(!targetMesh?.skeleton?.bones?.length)throw new Error('Rodin skinned skeleton not found');
  const targetNames=boneNames58(targetMesh.skeleton.bones);
  const targetHips=targetMesh.skeleton.bones.find(b=>b.name==='Hips');
  const baseHipPosition=targetHips?.position.clone();
  // Process serially: lower simultaneous memory use on mobile WebGL devices.
  for(const item of GREAT_SWORD_MOTIONS58) {
    try {
      const fbx=await loader.loadAsync('/animations/great-sword/'+encodeURIComponent(item.file));
      const clip=fbx.animations?.find(c=>c.duration>0 && c.tracks.length>0);
      if(!clip)throw new Error('FBX animation track not found');
      if(!Number.isFinite(clip.duration) || clip.duration>25)throw new Error('FBX animation duration unsupported');
      const skeletonMesh=skinnedMesh58(fbx);
      const bones=skeletonMesh?.skeleton?.bones?.length ? skeletonMesh.skeleton.bones : [];
      if(!bones.length) fbx.traverse(obj=>{if(obj.isBone)bones.push(obj);});
      if(bones.length<18)throw new Error('Mixamo skeleton bones missing');
      // SkeletonUtils expects a .skeleton on the source AnimationMixer root.
      fbx.skeleton=new THREE.Skeleton(bones);
      const names=greatSwordNames58(targetNames,boneNames58(bones));
      if(!names.Hips || !names.RightHand || !names.LeftArm || !names.RightArm || Object.keys(names).length<16) {
        throw new Error('FBX and Rodin bones not compatible');
      }
      targetRig.updateMatrixWorld(true);
      fbx.updateMatrixWorld(true);
      const converted=retargetClip(targetMesh,fbx,clip,{
        names, hip:names.Hips, hipInfluence:new THREE.Vector3(0,0,0),
        preserveBonePositions:true, fps:24
      });
      // Important: a Mixamo full-body clip can roll the AnnoMotion Rodin
      // pelvis by 90–180 degrees when their bind poses have different axes.
      // Extract only relative arm/shoulder/upper-spine motion. Keeping
      // locomotion active and layering these DELTAS prevents flips/floating.
      const safeTracks=[];
      const identity=new THREE.Quaternion();
      for(const track of converted.tracks) {
        const m=/^\.bones\[([^\]]+)\]\.(quaternion|position)$/.exec(track.name);
        if(!m || m[2]!=='quaternion')continue; // no FBX root translation
        const limit=safeCombatBone581(m[1]);
        if(!limit || track.values.length<8)continue; // hips, legs, root forbidden
        const invFirst=new THREE.Quaternion().fromArray(track.values,0).normalize().invert();
        const values=new Float32Array(track.values.length);
        for(let j=0;j<track.times.length;j++){
          const current=new THREE.Quaternion().fromArray(track.values,j*4).normalize();
          const delta=invFirst.clone().multiply(current).normalize();
          // Reject/cap extreme retargeted orientation, without discarding
          // subtler sword motions. Values are delta quaternions, not absolute
          // bind-pose quaternions, so they work as a safe additive animation.
          const angle=identity.angleTo(delta);
          const bound=Number.isFinite(angle)&&angle>.0001?Math.min(1,limit/angle):1;
          const envelope=swordEnvelope581(track.times[j],converted.duration,item.key==='Block');
          identity.clone().slerp(delta,bound*envelope).toArray(values,j*4);
        }
        safeTracks.push(new THREE.QuaternionKeyframeTrack(m[1]+'.quaternion',track.times,values));
      }
      const activeArms=safeTracks.filter(t=>/(LeftArm|RightArm|ForeArm)/.test(t.name)).length;
      if(activeArms<3)throw new Error('Not enough safe arm tracks in retargeted clip');
      const actionClip=new THREE.AnimationClip('GreatSword581_'+item.key,converted.duration,safeTracks);
      actionClip.blendMode=THREE.AdditiveAnimationBlendMode;
      actionClip.optimize();
      rodin.installCombatAnimations({[item.key]:actionClip});
      success++;
      onProgress({key:item.key,loaded:success,total:GREAT_SWORD_MOTIONS58.length});
    } catch(error) {
      const message=error?.message||String(error);
      errors.push({key:item.key,message});
      console.warn('GreatSword58 animation skipped:',item.key,message);
    }
  }
  const status=success===0?STATUS.fallback:success===GREAT_SWORD_MOTIONS58.length?STATUS.ready:STATUS.partial;
  return {status,loaded:success,total:GREAT_SWORD_MOTIONS58.length,errors};
}
