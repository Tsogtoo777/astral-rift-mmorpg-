/** Astral Rift Alpha 5.8 — animation retarget for the supplied Great Sword Pack.
 * No FBX avatar mesh is rendered: only animation clips are mapped onto the
 * user's existing 27-bone, rigged Rodin GLB. Unsupported clips fail safely.
 */
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { clone, retargetClip } from 'three/addons/utils/SkeletonUtils.js';
import { GREAT_SWORD_MOTIONS58, greatSwordNames58 } from './greatSwordMap58.js';

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
      const fixedTracks=[];
      for(const track of converted.tracks) {
        const m=/^\.bones\[([^\]]+)\]\.(quaternion|position)$/.exec(track.name);
        if(!m)continue;
        // The game handles locomotion root motion. FBX Hips translation
        // must never move the avatar inside the holder or sink its model.
        if(m[2]==='position')continue;
        track.name=m[1]+'.'+m[2];
        fixedTracks.push(track);
      }
      if(fixedTracks.length<12)throw new Error('Retarget produced insufficient bone tracks');
      const actionClip=new THREE.AnimationClip('GreatSword58_'+item.key,converted.duration,fixedTracks);
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
