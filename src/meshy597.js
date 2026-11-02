/** Astral Rift Alpha 5.9.9 — Meshy SmartRig bone-name compatibility fix.
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

  const mixer=new THREE.AnimationMixer(root);
  // Build a relaxed STILL Idle from a sampled frame of the supplied Walking clip.
  // This is a static pose generated from real animation tracks, NOT a supplied Idle clip.
  function stillPoseClip(source){
    const at=Math.min(source.duration*.49,source.duration*.5);
    const tracks=source.tracks.map(track=>{
      const sample=Array.from(track.createInterpolant().evaluate(at));
      return new track.constructor(track.name,[0,1],[...sample,...sample]);
    });
    return new THREE.AnimationClip('IdleGenerated598',1,tracks);
  }
  const actions={Idle:mixer.clipAction(stillPoseClip(clips.get('Walking'))),Walk:mixer.clipAction(clips.get('Walking')),Run:mixer.clipAction(clips.get('Running'))};
  Object.values(actions).forEach(a=>{a.setLoop(THREE.LoopRepeat,Infinity);a.enabled=true;});
  let active=null;
  let movement='Idle';
  const lastOverlay=new Map();
  const euler=new THREE.Euler(),q=new THREE.Quaternion();
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  let swing=99,combo=0,clock=0,weapon=0,blockWeight=0;

  const grip=new THREE.Group(); grip.name='MeshySwordGrip597';
  grip.position.set(-.008,-.035,.015); grip.rotation.set(-.24,0,-.20);
  const gripAnchor=bones.RightHand||bones.RightForeArm||bones.RightArm||root;
  if(!bones.RightHand)grip.position.set(.15,-.65,.22); // Emergency fallback only.
  gripAnchor.add(grip);
  const fallbackSword=new THREE.Group();grip.add(fallbackSword);
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
      model.position.set(0,-.83,0);model.rotation.set(0,0,0);model.scale.setScalar(.83);
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
      importedSword.scale.setScalar(.83*size);
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
    if(next===movement)return;
    active?.fadeOut(.16);
    movement=next;
    const a=actions[next];
    if(a){a.reset().setEffectiveWeight(1).fadeIn(.16).play();}
    active=a||null;
  }
  function update({dt=0,moving=false,sprinting=false,blocking=false,dodging=false,weapon:next=0}={}){
    dt=clamp(Number.isFinite(dt)?dt:0);dt=Math.min(dt,.06);clock+=dt;
    setWeapon(next);
    undoOverlay();
    switchMotion(!moving?'Idle':sprinting?'Run':'Walk');
    mixer.update(dt);
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
  }
  return {version:'5.9.9',root,mixer,animations:[...clips.keys()],setWeapon,setSwordStyle,setSwordModel,triggerAttack,triggerSpecial,update};
}
