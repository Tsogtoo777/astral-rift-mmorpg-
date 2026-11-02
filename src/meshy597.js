/** Astral Rift Alpha 6.1.6 — cape cleanup and stable katana grip.
 * User-supplied GLB has ONE mesh, 62 skin joints, and TWO animations:
 * Walking (1.03s) and Running (0.63s). There is no Idle or sword animation.
 * A relaxed bind-pose Idle and lightweight procedural arm swings are fallback
 * visual behaviors, NOT authentic imported animation clips.
 * Meshy is the SOLE player visual and animation controller.
 */
/**
 * GLTFLoader sanitizes node names (notably ':' -> '_') while the input GLB
 * uses labels like 'mixamorig:RightHand'. Resolve against ACTUAL loaded bones,
 * including skeleton bones, without depending on GLTFLoader's punctuation.
 * This is intentionally separated from the renderer so it can be regression-tested.
 */
export function resolveMeshyRigBones(root) {
  const normalize = value => String(value || '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
    .replace(/^mixamorig/, '')
    .replace(/^armature/, '');
  const named = new Map();
  const add = bone => {
    if (!bone || !bone.name) return;
    const name = normalize(bone.name);
    if (name && !named.has(name)) named.set(name, bone);
  };
  root.traverse(obj => {
    if (obj.isBone) add(obj);
    if (obj.isSkinnedMesh && obj.skeleton) {
      for (const bone of obj.skeleton.bones || []) add(bone);
    }
  });
  const get = name => named.get(normalize(name)) || null;
  return {
    RightArm: get('RightArm'), RightForeArm: get('RightForeArm'), RightHand: get('RightHand'),
    LeftArm: get('LeftArm'), LeftForeArm: get('LeftForeArm'), LeftHand: get('LeftHand'),
    Spine: get('Spine'), Spine1: get('Spine1')
  };
}

/**
 * Meshy SmartRig's single mesh contains cloak-tail vertices that are influenced
 * by hand and leg bones, despite also having dedicated spine-parented cloth bones.
 * Restore most of that leaked weight to a nearby existing cape joint.  No new
 * geometry / draw calls / render-loop vertices: a one-time vertex buffer edit.
 * Vertices without convincing cape weights are intentionally left untouched.
 */
export function stabilizeMeshyCapeWeights(root) {
  let fixed=0;
  const capeName=/^Bone_0(?:2[6-9]|3[0-9]|4[0-3])$/;
  const badFollow=/^(?:mixamorig[:_])?(?:Left|Right)(?:UpLeg|Leg|Foot|ToeBase|Toe_End|Hand(?:Middle[1-4]|Thumb[1-4])?|ForeArm)$/i;
  root.traverse(obj=>{
    if(!obj.isSkinnedMesh||!obj.skeleton||!obj.geometry)return;
    const {skinIndex,skinWeight,position}=obj.geometry.attributes;
    if(!skinIndex||!skinWeight||!position||obj.geometry.userData?.meshyCape612)return;
    const capeIds=new Set(),badIds=new Set();
    obj.skeleton.bones.forEach((b,i)=>{
      if(capeName.test(b.name))capeIds.add(i);
      if(badFollow.test(b.name))badIds.add(i);
    });
    if(!capeIds.size)return;
    const ids=[0,0,0,0],wt=[0,0,0,0];
    for(let i=0;i<skinIndex.count;i++){
      const y=position.getY(i);
      if(y<.24||y>1.12)continue;
      let capeTotal=0,best=-1,bestWeight=0,leak=0;
      for(let k=0;k<4;k++){
        ids[k]=Math.round(skinIndex.getComponent(i,k));
        wt[k]=skinWeight.getComponent(i,k);
        if(capeIds.has(ids[k])){capeTotal+=wt[k];if(wt[k]>bestWeight){best=k;bestWeight=wt[k];}}
        if(badIds.has(ids[k]))leak+=wt[k];
      }
      if(best<0||capeTotal<.36||leak<.06)continue;
      let moved=0;
      for(let k=0;k<4;k++){
        if(!badIds.has(ids[k]))continue;
        const part=wt[k]*.78;
        wt[k]-=part;moved+=part;
      }
      if(moved<.001)continue;
      wt[best]+=moved;
      for(let k=0;k<4;k++)skinWeight.setComponent(i,k,wt[k]);
      fixed++;
    }
    skinWeight.needsUpdate=true;
    obj.geometry.userData.meshyCape612=true;
  });
  return fixed;
}

export function createMeshy597(THREE, gltf, holder) {
  const root=gltf?.scene;
  if(!root)throw new Error('Meshy GLB scene дутуу');
  const clips=new Map((gltf.animations||[]).map(clip=>[clip.name,clip]));
  if(!clips.has('Walking')||!clips.has('Running'))throw new Error('Meshy Walking/Running клип алга');
  let meshCount=0;
  root.traverse(o=>{
    if(!o.isMesh)return;
    o.castShadow=true;
    o.receiveShadow=false;
    if(o.isSkinnedMesh){ meshCount++;o.frustumCulled=false; }
  });
  if(!meshCount)throw new Error('Meshy GLB skinned mesh / skeleton байхгүй');
  // No-cape model was preprocessed offline; do not reassign remaining armor weights.
  const correctedCapeVertices=0;
  console.info('[Meshy 6.1.6] finger-driven dangling skirt removed from experimental no-cape mesh');
  const bones=resolveMeshyRigBones(root);
  // A valid skinned character must still render if a hand bone gets renamed by
  // an exporter. Use nearby bones for accessories; don't hide the whole avatar.
  if(!bones.RightArm||!bones.RightHand||!bones.LeftArm){
    console.warn('[Meshy 5.9.9] Some arm bones were not resolved; character animations remain enabled.',
      Object.fromEntries(Object.entries(bones).map(([key,bone])=>[key,bone?.name||null])));
  }
  const bounds=new THREE.Box3().setFromObject(root);
  const dimensions=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(dimensions.y)||dimensions.y<.5)throw new Error('Meshy хэмжээг уншиж чадсангүй');
  const scale=2.25/dimensions.y;
  root.position.set(-(bounds.min.x+bounds.max.x)*.5*scale,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*.5*scale);
  root.scale.setScalar(scale);
  root.name='MeshyRiggedPlayer597';
  holder.add(root);
  // Subtle grounded contact cue, especially useful when the night sun is dim.
  // 24 triangles, no extra light, no physics, and never attached to a foot bone.
  const contactShadow=new THREE.Mesh(
    new THREE.CircleGeometry(.31,24),
    new THREE.MeshBasicMaterial({color:0x101820,transparent:true,opacity:.16,depthWrite:false})
  );
  contactShadow.name='MeshyContactShadow612';
  contactShadow.rotation.x=-Math.PI/2;
  contactShadow.position.y=.018;
  contactShadow.renderOrder=1;
  holder.add(contactShadow);

  const mixer=new THREE.AnimationMixer(root);
  // The previous Idle was a frozen sample from the MIDDLE of Walking,
  // leaving one knee lifted after stopping. Preserve the original neutral
  // GLB bind/rest pose for *every* animated joint instead.
  function neutralIdleClip(source){
    const nodes=new Map();root.traverse(obj=>{if(obj.name)nodes.set(obj.name,obj);});
    const tracks=source.tracks.map(track=>{
      const dot=track.name.lastIndexOf('.');
      const node=nodes.get(track.name.slice(0,dot));
      const property=track.name.slice(dot+1);
      const value=property==='position'?node?.position?.toArray():
        property==='quaternion'?node?.quaternion?.toArray():
        property==='scale'?node?.scale?.toArray():null;
      // Preserve unrecognized tracks without throwing on future Meshy exports.
      const v=value||Array.from(track.createInterpolant().evaluate(0));
      return new track.constructor(track.name,[0,1],[...v,...v]);
    });
    return new THREE.AnimationClip('IdleNeutral612',1,tracks);
  }
  const actions={Idle:mixer.clipAction(neutralIdleClip(clips.get('Walking'))),Walk:mixer.clipAction(clips.get('Walking')),Run:mixer.clipAction(clips.get('Running'))};
  Object.values(actions).forEach(a=>{a.setLoop(THREE.LoopRepeat,Infinity);a.enabled=true;});
  let active=null;
  let movement='Idle';
  // Save the neutral knee/hip orientations for a very gentle animation limiter.
  const legRest=new Map();
  const capeRest=[]; // Empty for cape-free asset; no extra simulated cloth tails
  root.traverse(obj=>{
    if(!obj.isBone)return;
    const name=obj.name.replace(/[^a-z0-9]/gi,'').toLowerCase();
    if(/(?:left|right)(?:upleg|leg)$/.test(name))legRest.set(obj,{q:obj.quaternion.clone(),isKnee:name.endsWith('leg')&&!name.endsWith('upleg')});
    const match=null; // Cape bones retained in skin hierarchy for animation compatibility.
    if(match){
      const n=Number(match[1]);
      // 3 chains attached to Spine2: 26..31, 32..37, 38..43
      const chain=n<=31?0:n<=37?1:2;
      const depth=(n<=31?n-26:n<=37?n-32:n-38);
      capeRest.push({bone:obj,q:obj.quaternion.clone(),chain,depth});
    }
  });
  let capeMotion=0;

  const lastOverlay=new Map();
  const euler=new THREE.Euler(),q=new THREE.Quaternion();
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  let swing=99,combo=0,clock=0,weapon=0,blockWeight=0;

  const grip=new THREE.Group(); grip.name='MeshySwordGrip597';
  grip.position.set(0,.075,-.012); grip.rotation.set(0,0,0);
  const gripAnchor=bones.RightHand||bones.RightForeArm||bones.RightArm||root;
  if(!bones.RightHand)grip.position.set(.15,-.65,.22); // Emergency fallback only.
  gripAnchor.add(grip);
  // The character's bind-pose hand +Y aims downward/backward in world space.
  // Calibrate the blade axis ONCE against character-forward while preserving
  // hand parenting. Imported sword blades then follow actual animation bones.
  if(bones.RightHand){
    root.updateMatrixWorld(true);
    const handWorld=bones.RightHand.getWorldQuaternion(new THREE.Quaternion());
    const characterWorld=root.getWorldQuaternion(new THREE.Quaternion());
    const wanted=new THREE.Vector3(.16,-.40,.90).normalize().applyQuaternion(characterWorld);
    wanted.applyQuaternion(handWorld.invert());
    grip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),wanted.normalize());
  }
  // In Idle/Walk/Run keep the blade pointing diagonally forward and down,
  // even when the imported locomotion rotates the hand unexpectedly. While
  // attacking, retain the last local grip so the blade follows the real arm
  // through the authored procedural swing. The GLB itself is not re-rigged.
  const bladeAxis616=new THREE.Vector3(0,1,0);
  const intendedBlade616=new THREE.Vector3(.16,-.48,.86).normalize();
  const swordHandWorld616=new THREE.Quaternion();
  const swordHeroWorld616=new THREE.Quaternion();
  const targetGrip616=new THREE.Quaternion();
  function stabilizeSwordGrip616(dt){
    if(!bones.RightHand||swing<.58||weapon)return;
    root.updateMatrixWorld(true);
    bones.RightHand.getWorldQuaternion(swordHandWorld616);
    root.getWorldQuaternion(swordHeroWorld616);
    const desired=intendedBlade616.clone().applyQuaternion(swordHeroWorld616)
      .applyQuaternion(swordHandWorld616.invert()).normalize();
    targetGrip616.setFromUnitVectors(bladeAxis616,desired);
    // No instantaneous teleport/jolt when a walk or run blend starts.
    grip.quaternion.slerp(targetGrip616,1-Math.exp(-15*dt));
  }
  const fallbackSword=new THREE.Group();fallbackSword.rotation.z=Math.PI;grip.add(fallbackSword);
  const steel=new THREE.MeshStandardMaterial({color:0xad97d8,metalness:.58,roughness:.31});
  const hilt=new THREE.MeshStandardMaterial({color:0x33303c,metalness:.22,roughness:.8});
  const gripPart=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.18,8),hilt);
  gripPart.position.y=-.085;fallbackSword.add(gripPart);
  const guard=new THREE.Mesh(new THREE.BoxGeometry(.19,.032,.052),steel);
  guard.position.y=-.19;fallbackSword.add(guard);
  const blade=new THREE.Mesh(new THREE.BoxGeometry(.056,.69,.024),steel);
  blade.position.y=-.54;fallbackSword.add(blade);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.037,.12,4),steel);
  tip.position.y=-.94;tip.rotation.z=Math.PI;fallbackSword.add(tip);
  let importedSword=null;
  function setSwordModel(model){
    if(importedSword)importedSword.removeFromParent();
    importedSword=model||null;
    if(model){
      // Meshy hand local +Y points toward the fingers/ground; GLB katana
      // has blade tip at Y=0 and handle near Y=.85. Flip 180 degrees
      // then place the hilt center at the calibrated palm anchor.
      model.position.set(0,.70,0);model.rotation.set(0,0,Math.PI);model.scale.setScalar(.82);
      model.traverse(o=>{if(o.isMesh)o.castShadow=true;});
      grip.add(model);
    }
    fallbackSword.visible=!model;
  }
  function setSwordStyle(style='iron'){
    const options={iron:[0xb6bdcc,.93],great:[0xdba35b,1.1],katana:[0xb591f5,.95]};
    const [color,size]=options[style]||options.iron;
    steel.color.setHex(color);fallbackSword.scale.setScalar(size);
    if(importedSword){
      importedSword.scale.setScalar(.82*size);
      importedSword.position.y=.70*size;
      importedSword.traverse(o=>{if(o.isMesh&&o.material){
        // Preserve custom katana textures; only tint common flat materials.
        const all=Array.isArray(o.material)?o.material:[o.material];
        for(const mat of all){if(!mat.map && mat.color)mat.color.setHex(color);}
      }});
    }
  }
  const bow=new THREE.Group();bow.name='MeshyBow597';
  const bowArc=new THREE.Mesh(new THREE.TorusGeometry(.25,.016,6,20,Math.PI),hilt);
  bowArc.rotation.y=Math.PI/2;bow.add(bowArc);
  const bowAnchor=bones.LeftHand||bones.LeftForeArm||bones.LeftArm||root;
  if(!bones.LeftHand)bow.position.set(-.15,-.65,.2);
  bowAnchor.add(bow);
  function setWeapon(w){weapon=w?1:0;grip.visible=!weapon;bow.visible=!!weapon;}
  setWeapon(0);
  function triggerAttack(w=weapon){weapon=w?1:0;combo=(combo%3)+1;swing=0;}
  function triggerSpecial(){swing=0;}
  function undoOverlay(){
    for(const [bone,prior] of lastOverlay){bone.quaternion.multiply(prior.clone().invert()).normalize();}
    lastOverlay.clear();
  }
  function overlay(name,rx=0,ry=0,rz=0){
    const b=bones[name];if(!b)return;
    q.setFromEuler(euler.set(rx,ry,rz,'XYZ'));
    b.quaternion.multiply(q).normalize();
    const previous=lastOverlay.get(b);
    if(previous)previous.multiply(q).normalize();else lastOverlay.set(b,q.clone());
  }
  function switchMotion(next){
    if(next===movement && active)return;
    const old=active;
    const a=actions[next];
    const transferPhase=old && a && movement!=='Idle' && next!=='Idle';
    const phase=transferPhase ? ((old.time/old.getClip().duration)%1+1)%1 : 0;
    old?.fadeOut(.27);
    movement=next;
    if(a){
      a.reset();
      // Keep feet on roughly the same stride phase instead of restarting at
      // frame zero every time the mobile sprint threshold is crossed.
      if(transferPhase)a.time=phase*a.getClip().duration;
      a.setEffectiveWeight(1).fadeIn(.27).play();
    }
    active=a||null;
  }
  function update({dt=0,moving=false,sprinting=false,blocking=false,dodging=false,weapon:next=0}={}){
    dt=clamp(Number.isFinite(dt)?dt:0);dt=Math.min(dt,.06);clock+=dt;
    setWeapon(next);
    undoOverlay();
    switchMotion(!moving?'Idle':sprinting?'Run':'Walk');
    mixer.update(dt);
    // Soften extreme knee flex on autogenerated Meshy locomotion clips,
    // while leaving the original motion and movement speed intact.
    if(movement!=='Idle'){
      const run=movement==='Run';
      for(const [bone,rest] of legRest){
        const correction=rest.isKnee?(run?.19:.10):(run?.085:.05);
        bone.quaternion.slerp(rest.q,correction).normalize();
      }
    }
    // Spine-attached cape chains only; subtle trailing motion, no physics sim.
    // Pose is recalculated from its original local bind rotation every frame,
    // so it never accumulates rotation or drags the knees.
    const desiredCape=moving?(sprinting?1:.65):.09;
    capeMotion+=(desiredCape-capeMotion)*(1-Math.exp(-6*dt));
    for(const {bone,q:base,chain,depth} of capeRest){
      const amount=capeMotion*(.012+.003*depth);
      const wave=Math.sin(clock*(sprinting?7.1:4.1)-depth*.5+chain*1.8);
      const side=chain===0?-1:chain===2?1:0;
      q.setFromEuler(euler.set(amount*(.42+.40*wave),0,side*amount*.45,'XYZ'));
      bone.quaternion.copy(base).multiply(q).normalize();
    }

    const desiredBlock=blocking?1:0;
    blockWeight+=(desiredBlock-blockWeight)*(1-Math.exp(-12*dt));
    if(movement==='Idle')overlay('Spine1', .009*Math.sin(clock*1.8), 0,0);
    if(blockWeight>.005){
      overlay('RightArm',-.38*blockWeight,0,-.16*blockWeight);
      overlay('RightForeArm',-.32*blockWeight,0,.08*blockWeight);
      overlay('LeftArm',-.25*blockWeight,0,.15*blockWeight);
    }
    if(dodging)overlay('Spine',-.12,0,.035*Math.sin(clock*15));
    if(swing<10){
      // The exported file contains no Attack clip. Restrained procedural fallback.
      const p=clamp(swing/.58);
      const wind=(p<.32?smooth(p/.32):p<.53?1-smooth((p-.32)/.21):0);
      const hit=(p<.36?0:p<.65?smooth((p-.36)/.29):1-smooth((p-.65)/.35));
      const sign=combo%2?-1:1;
      overlay('RightArm',-.65*wind+.40*hit,.12*sign*hit,-.15*wind+.38*sign*hit);
      overlay('RightForeArm',-.28*wind+.18*hit,0,-.10*hit);
      overlay('LeftArm',-.14*wind-.12*hit,0,.12*wind);
      overlay('Spine1',-.07*wind+.08*hit,-.10*sign*wind+.16*sign*hit,0);
      swing+=dt;if(swing>=.58)swing=99;
    }
    stabilizeSwordGrip616(dt);
  }
  return {version:'6.1.6',root,mixer,correctedCapeVertices,animations:[...clips.keys()],setWeapon,setSwordStyle,setSwordModel,triggerAttack,triggerSpecial,update};
}
