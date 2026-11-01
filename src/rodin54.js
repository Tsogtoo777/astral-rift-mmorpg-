/**
 * Astral Rift Alpha 5.8.2 — Rigged Rodin + restrained two-handed combat.
 * The original user-supplied GLB provides Idle, Walk, Run and Wave clips.
 * Attacks, guard and dodge use small, time-bounded PROCEDURAL bone overlays:
 * they are not authored sword-animation clips or full IK.
 * This module intentionally retains the rodin54.js path for a small GitHub patch.
 */
export function createRodin54(THREE, gltf, holder) {
  const root = gltf?.scene;
  if (!root) throw new Error('Rodin GLB scene олдсонгүй');
  const clips = new Map((gltf.animations || []).map(clip => [clip.name, clip]));
  for (const name of ['Idle', 'Walk', 'Run']) {
    if (!clips.has(name)) throw new Error(`Rodin animation дутуу: ${name}`);
  }
  let skinnedCount = 0;
  root.traverse(obj => {
    if (obj.isSkinnedMesh) skinnedCount++;
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = false;
    // Skin deformation can extend beyond the original mesh bounding box.
    if (obj.isSkinnedMesh) obj.frustumCulled = false;
    // One untextured gray material is embedded in the supplied GLB. Respect
    // its geometry while giving the armor a more readable steel finish.
    if (obj.isSkinnedMesh && obj.material && !Array.isArray(obj.material)) {
      const armor = obj.material.clone();
      armor.color.setHex(0xb9c6d6);
      armor.metalness = .28;
      armor.roughness = .52;
      obj.material = armor;
    }
  });
  if (!skinnedCount) throw new Error('Rodin skeleton/skin олдсонгүй');
  const bone = name => root.getObjectByName(name);
  const joints = {
    rightArm: bone('RightArm'),
    rightForeArm: bone('RightForeArm'),
    rightHand: bone('RightHand'),
    leftArm: bone('LeftArm'),
    leftForeArm: bone('LeftForeArm'),
    leftHand: bone('LeftHand'),
    spine: bone('Spine2') || bone('Spine')
  };
  if (!joints.rightArm || !joints.rightForeArm || !joints.rightHand ||
      !joints.leftArm || !joints.leftForeArm || !joints.spine) {
    throw new Error('Rodin гар/нурууны ясны нэр таарахгүй байна');
  }

  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y <= .2) throw new Error('Rodin хэмжээ буруу');
  const s = 2.25 / size.y;
  root.scale.setScalar(s);
  root.position.set(
    -(bounds.min.x + bounds.max.x) * .5 * s,
    -bounds.min.y * s,
    -(bounds.min.z + bounds.max.z) * .5 * s
  );
  root.name = 'RodinRiggedPlayer55';

  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.fromEntries(['Idle', 'Walk', 'Run'].map(name => {
    const action = mixer.clipAction(clips.get(name));
    action.setLoop(THREE.LoopRepeat, Infinity);
    return [name, action];
  }));
  let movementState = 'Idle';
  let active = actions.Idle;
  active.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
  mixer.update(0);
  function transition(next) {
    if (combatAction) return;
    if (next === movementState) return;
    const candidate = actions[next];
    if (!candidate) return;
    active.fadeOut(.19);
    candidate.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).fadeIn(.19).play();
    active = candidate;
    movementState = next;
  }

  const steel = new THREE.MeshStandardMaterial({color:0xd7e7f1,metalness:.68,roughness:.27});
  const brass = new THREE.MeshStandardMaterial({color:0xb8a06c,metalness:.5,roughness:.38});
  const leather = new THREE.MeshStandardMaterial({color:0x302b31,metalness:.03,roughness:.82});
  function piece(parent, geometry, material, x, y, z) {
    const item = new THREE.Mesh(geometry,material);
    item.position.set(x,y,z);
    item.castShadow = true;
    parent.add(item);
    return item;
  }
  // The rig is authored at ~1.69m, while the game scales it to 2.25 units.
  // Weapon dimensions here are in rig LOCAL units so it does not hang through
  // the ground. Sword center of grip is mounted to the RightHand bone.
  const sword = new THREE.Group();
  sword.name = 'RodinSword55';
  piece(sword,new THREE.CylinderGeometry(.024,.024,.17,8),leather,0,-.065,0);
  piece(sword,new THREE.SphereGeometry(.035,8,6),brass,0,.025,0);
  piece(sword,new THREE.BoxGeometry(.24,.045,.074),brass,0,-.17,0);
  piece(sword,new THREE.BoxGeometry(.062,.56,.031),steel,0,-.48,0);
  const tip = piece(sword,new THREE.ConeGeometry(.042,.14,4),steel,0,-.83,0);
  tip.rotation.z = Math.PI;
  sword.position.set(-.015,-.07,.028);
  sword.rotation.set(-.34,.04,-.32);
  sword.scale.set(1.08,1.48,1.08); // longer two-handed blade silhouette
  joints.rightHand.add(sword);

  // Alpha 5.9: procedural fallback variants; 5.9.1 can mount the real Katana GLB.
  // Rig, sword attachment and combat clips remain unchanged.
  const proceduralSwordParts=[...sword.children];
  let externalKatana=null;
  let chosenStyle='iron';
  function refreshSwordAppearance() {
    const useRealKatana=chosenStyle==='katana' && !!externalKatana;
    for(const part of proceduralSwordParts)part.visible=!useRealKatana;
    if(externalKatana) externalKatana.visible=useRealKatana;
  }
  function setExternalSwordModel(model=null) {
    if(externalKatana && externalKatana.parent===sword)sword.remove(externalKatana);
    externalKatana=model;
    if(model) sword.add(model);
    refreshSwordAppearance();
  }
  function setSwordStyle(visual='iron') {
    chosenStyle=visual;
    const designs={
      iron:{scale:[1.08,1.48,1.08],color:0xd7e7f1},
      great:{scale:[1.22,1.76,1.20],color:0xa7b8c7},
      katana:{scale:[.91,1.38,.89],color:0x9f87d7}
    };
    const selected=designs[visual]||designs.iron;
    sword.scale.set(...selected.scale);
    if(steel.color?.setHex)steel.color.setHex(selected.color);
    refreshSwordAppearance();
  }
  setSwordStyle('iron');
  const bow = new THREE.Group();
  bow.name = 'RodinBow55';
  const wood = new THREE.MeshStandardMaterial({color:0x73503a,roughness:.78});
  const string = new THREE.LineBasicMaterial({color:0xe6e0c7});
  const bowArc = new THREE.Mesh(new THREE.TorusGeometry(.32,.022,6,18,Math.PI),wood);
  bowArc.rotation.y = Math.PI/2;
  bow.add(bowArc);
  bow.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0,-.32,0),new THREE.Vector3(.015,0,0),new THREE.Vector3(0,.32,0)
  ]),string));
  bow.position.set(.025,-.06,0);
  (joints.leftHand || joints.rightHand).add(bow);
  let equippedWeapon = 0;
  function setWeapon(next) {
    equippedWeapon = next ? 1 : 0;
    if(equippedWeapon!==0 && combatAction)endCombatAction();
    sword.visible = equippedWeapon === 0;
    bow.visible = equippedWeapon === 1;
  }
  setWeapon(0);

  const euler = new THREE.Euler();
  const q = new THREE.Quaternion();
  const PI = Math.PI;
  const clamp01 = x => Math.max(0,Math.min(1,x));
  const smooth = x => {x=clamp01(x);return x*x*(3-2*x);};
  function rotate(joint, x=0, y=0, z=0) {
    if (!joint) return;
    q.setFromEuler(euler.set(x,y,z,'XYZ'));
    joint.quaternion.multiply(q);
  }
  function addPose(pose, factor=1) {
    if (!pose || factor<=.0001) return;
    for (const name of Object.keys(pose)) {
      const a = pose[name];
      rotate(joints[name],a[0]*factor,a[1]*factor,a[2]*factor);
    }
  }

  // Distinct restrained poses, with a wind-up, strike, and recovery. The
  // shoulder, forearm and spine all have authored locomotion base tracks;
  // applying offsets AFTER mixer.update avoids irreversible accumulation.
  const comboPoses = [
    {
      wind:{rightArm:[-.72,-.10,-.20],rightForeArm:[-.28,0,-.08],leftArm:[-.18,0,.10],spine:[-.05,-.12,0]},
      hit: {rightArm:[.46,.15,.48],rightForeArm:[.24,0,-.18],leftArm:[-.12,0,-.12],spine:[.09,.19,0]},
      duration:.51
    },
    {
      wind:{rightArm:[-.60,.16,.37],rightForeArm:[-.34,0,.09],leftArm:[-.20,0,-.09],spine:[-.05,.18,0]},
      hit: {rightArm:[.28,-.25,-.52],rightForeArm:[.31,0,.10],leftArm:[-.18,0,.10],spine:[.06,-.21,0]},
      duration:.54
    },
    {
      wind:{rightArm:[-.82,-.07,-.32],rightForeArm:[-.24,0,.04],leftArm:[-.32,0,.24],leftForeArm:[-.18,0,0],spine:[-.10,-.10,0]},
      hit: {rightArm:[.58,.12,.12],rightForeArm:[-.50,0,.06],leftArm:[-.38,0,.18],leftForeArm:[-.13,0,0],spine:[.11,.14,0]},
      duration:.68
    }
  ];
  const bowWind={leftArm:[-.55,0,-.35],rightArm:[-.65,-.12,.22],rightForeArm:[-.40,0,.10],spine:[-.08,0,0]};
  const bowRelease={leftArm:[-.50,0,-.34],rightArm:[-.14,.12,-.10],rightForeArm:[-.06,0,-.08],spine:[0,.06,0]};
  let attackElapsed=99;
  let comboIndex=0;
  let comboWindow=0;
  let attackWeapon=0;
  let guardWeight=0;
  let clock=0;
  let currentSwing=0;
  // Imported FBX animation actions reuse Rodin's existing mixer. This is
  // animation retargeting rather than the old procedural sword overlay.
  const combatClips = new Map();
  const combatActions = new Map();
  let combatAction = null;
  let combatName = '';
  let combatDuration = 0;
  let combatElapsed = 0;
  let combatHold = false;
  let combatReturning = false;
  function installCombatAnimations(newClips) {
    for (const [name,clip] of Object.entries(newClips||{})) {
      if (!clip?.tracks?.length || !Number.isFinite(clip.duration) || clip.duration<=0) continue;
      const old=combatActions.get(name);
      if(old){ old.stop(); mixer.uncacheAction(combatClips.get(name)); }
      combatClips.set(name,clip);
      combatActions.set(name,mixer.clipAction(clip));
    }
  }
  function endCombatAction() {
    if (!combatAction) return;
    combatAction.fadeOut(.12);
    // Additive imported arm-only action fades out while the normal
    // Idle/Walk/Run layer keeps playing throughout.
    active.setEffectiveWeight(1).fadeIn(.12).play();
    combatAction=null;
    combatName='';
    combatReturning=false;
    combatHold=false;
  }
  function playCombatAction(name,duration=.55,hold=false) {
    if((equippedWeapon!==0 && name!=='Impact') || !combatActions.has(name))return false;
    if(combatAction) {
      if(combatName===name && hold)return true;
      combatAction.fadeOut(.08);
    }
    const a=combatActions.get(name);
    const clip=combatClips.get(name);
    combatAction=a;
    combatName=name;
    combatDuration=Math.max(.16,duration);
    combatElapsed=0;
    combatHold=hold;
    combatReturning=false;
    if(clip.blendMode===THREE.AdditiveAnimationBlendMode){
      // Do NOT fade out Idle/Walk/Run for additive motion; that would expose
      // the distorted foreign retarget bind pose and make the character tip.
      active.setEffectiveWeight(1).play();
    }else{
      active.fadeOut(.09);
    }
    a.reset().setLoop(THREE.LoopOnce,1)
      .setEffectiveWeight(1)
      .setEffectiveTimeScale(Math.max(.12,clip.duration / combatDuration))
      .fadeIn(.09).play();
    a.clampWhenFinished=hold;
    return true;
  }
  function advanceCombatAction(dt,blocking) {
    if(!combatAction)return;
    if(combatHold && !blocking){endCombatAction();return;}
    if(combatHold)return;
    combatElapsed+=dt;
    if(!combatReturning && combatElapsed >= combatDuration-.14) {
      combatReturning=true;
      combatAction.fadeOut(.14);
      active.setEffectiveWeight(1).fadeIn(.14).play();
    }
    if(combatElapsed >= combatDuration) {
      combatAction.stop();
      combatAction=null;
      combatName='';
      combatReturning=false;
    }
  }
  function triggerAttack(nextWeapon=equippedWeapon) {
    attackWeapon=nextWeapon ? 1 : 0;
    if (comboWindow<=0 || attackWeapon===1) comboIndex=0;
    comboIndex=(comboIndex%3)+1;
    comboWindow=.86;
    attackElapsed=0;
    if(attackWeapon===0)playCombatAction('Combo'+comboIndex,comboPoses[comboIndex-1].duration);
  }
  function applyAttack(dt) {
    if (attackElapsed>=10) return;
    const duration=attackWeapon ? .52 : comboPoses[comboIndex-1].duration;
    const p=clamp01(attackElapsed/duration);
    const pose=attackWeapon ? {wind:bowWind,hit:bowRelease} : comboPoses[comboIndex-1];
    // Explicit wind-up and follow-through; both fade away by the end.
    const windWeight=p<.28?smooth(p/.28):p<.65?1-smooth((p-.28)/.37):0;
    const hitWeight=p<.28?0:p<.65?smooth((p-.28)/.37):1-smooth((p-.65)/.35);
    if (!(attackWeapon===0 && combatAction)) {
      addPose(pose.wind,windWeight);
      addPose(pose.hit,hitWeight);
    }
    currentSwing=hitWeight;
    attackElapsed+=dt;
    if (attackElapsed>=duration) attackElapsed=10;
  }
  function update({dt=0,moving=false,sprinting=false,blocking=false,dodging=false,weapon:nextWeapon=0}={}) {
    dt=Math.max(0,Math.min(.06,Number.isFinite(dt)?dt:0));
    clock+=dt;
    comboWindow=Math.max(0,comboWindow-dt);
    if (nextWeapon!==equippedWeapon) setWeapon(nextWeapon);
    advanceCombatAction(dt,blocking);
    if (blocking && equippedWeapon===0 && combatActions.has('Block') && !combatAction && attackElapsed>=10) {
      playCombatAction('Block',combatClips.get('Block').duration,true);
    }
    transition(!moving?'Idle':sprinting?'Run':'Walk');
    active.setEffectiveTimeScale(movementState==='Walk'?.97:movementState==='Run'?1.04:1);
    mixer.update(dt);

    guardWeight+=(Number(blocking && attackElapsed>=10)-guardWeight)*(1-Math.exp(-dt*13));
    if (guardWeight>.003) {
      // Even an imported Block clip can end in a neutral pose; retain a
      // restrained visible guard without bending the whole character.
      const guardFactor=combatName==='Block'?.35:1;
      addPose({rightArm:[-.40,0,-.12],rightForeArm:[-.24,0,.06],leftArm:[-.22,0,.10],spine:[-.04,0,0]},guardWeight*guardFactor);
    }
    if (dodging) {
      addPose({spine:[-.16,0,.05*Math.sin(clock*16)],rightArm:[-.20,0,0],leftArm:[-.18,0,0]},1);
    }
    currentSwing=0;
    applyAttack(dt);
    // Weapon orientation follows the same hand bone through locomotion,
    // guards and strikes; its additional tilt is absolute, not accumulated.
    // Keep the blade near the hand instead of sweeping it sideways with a
    // large secondary wrist twist. The FBX arm tracks own the sword arc.
    sword.rotation.set(-.30-currentSwing*.09,.04,-.25+currentSwing*.04);
  }

  function triggerImpact() {return playCombatAction('Impact',.48);}
  function triggerSpecial(index=0) {
    const type=index===2?'SpinAttack':index===1?'JumpAttack':'Combo3';
    return playCombatAction(type,index===2?1.0:index===1?.83:.7);
  }
  holder.add(root);
  return {
    version:'5.8.2',root,mixer,animations:[...clips.keys()],setWeapon,setSwordStyle,setExternalSwordModel,triggerAttack,triggerImpact,triggerSpecial,installCombatAnimations,update,
    get combatMotions(){return [...combatClips.keys()];},
    get movementState(){return movementState;},
    get currentWeapon(){return equippedWeapon;},
    get comboStep(){return comboIndex;},
    get strikeWeight(){return currentSwing;},
    get attackActive(){return attackElapsed<10;}
  };
}
