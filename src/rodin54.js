/**
 * Astral Rift Alpha 5.4 — one rigged Rodin player.
 * Animations come directly from user-supplied AnnoMotion `rigged-model (1).glb`:
 * Idle, Walk, Run, Wave.  `Bind` is a rest pose, not a gameplay animation.
 * Sword swing, dodge and block are modest procedural overlays, NOT authored clips.
 */
export function createRodin54(THREE, gltf, holder) {
  const root = gltf?.scene;
  if (!root) throw new Error('Rodin GLB scene олдсонгүй');
  const clips = new Map((gltf.animations || []).map(clip => [clip.name, clip]));
  for (const name of ['Idle','Walk','Run']) {
    if (!clips.has(name)) throw new Error(`Rodin animation дутуу: ${name}`);
  }
  const skinMeshes = [];
  root.traverse(obj => {
    if (obj.isSkinnedMesh) skinMeshes.push(obj);
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = false;
      // Bounds of animated geometry can exceed the static/rest mesh bounds.
      if (obj.isSkinnedMesh) obj.frustumCulled = false;
    }
  });
  if (!skinMeshes.length) throw new Error('Rodin GLB skeleton/skin олдсонгүй');
  const getBone = name => root.getObjectByName(name);
  const rightArm = getBone('RightArm');
  const rightForeArm = getBone('RightForeArm');
  const rightHand = getBone('RightHand');
  const leftHand = getBone('LeftHand');
  const spine = getBone('Spine2') || getBone('Spine');
  if (!rightArm || !rightForeArm || !rightHand || !spine) {
    throw new Error('Rodin гар/нурууны ясны нэр таарахгүй байна');
  }

  // Normalize the original 1.69m model to the game's existing 2.25-unit capsule.
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  if (!(size.y > .2) || !Number.isFinite(size.y)) {
    throw new Error('Rodin model bounds буруу');
  }
  const s = 2.25 / size.y;
  root.scale.setScalar(s);
  root.position.set(-.5 * (bounds.min.x + bounds.max.x) * s,
                     -bounds.min.y * s,
                     -.5 * (bounds.min.z + bounds.max.z) * s);
  root.name = 'RodinRiggedPlayer54';

  // One animation mixer; state changes fade rather than snapping to a bind pose.
  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.fromEntries(['Idle','Walk','Run'].map(name => {
    const action = mixer.clipAction(clips.get(name));
    action.setLoop(THREE.LoopRepeat, Infinity);
    return [name,action];
  }));
  let state = 'Idle';
  let active = actions.Idle;
  active.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
  mixer.update(0);
  function transition(next) {
    if (next === state) return;
    const nextAction = actions[next];
    if (!nextAction) return;
    active.fadeOut(.17);
    nextAction.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).fadeIn(.17).play();
    active = nextAction;
    state = next;
  }

  // Sword and bow are new game props, parented to bones, NOT second player meshes.
  // The uploaded GLB contains NO weapon or SwordAttack animation.
  const sword = new THREE.Group();
  sword.name = 'RodinSword54';
  const steel = new THREE.MeshStandardMaterial({color:0xc7d9e3,metalness:.72,roughness:.3});
  const gold = new THREE.MeshStandardMaterial({color:0xb59b62,metalness:.55,roughness:.35});
  const grip = new THREE.MeshStandardMaterial({color:0x302734,roughness:.8});
  function part(parent,geometry,material,x,y,z) {
    const obj = new THREE.Mesh(geometry,material);
    obj.position.set(x,y,z);
    obj.castShadow = true;
    parent.add(obj);
    return obj;
  }
  part(sword,new THREE.CylinderGeometry(.022,.027,.20,7),grip,0,-.09,0);
  part(sword,new THREE.BoxGeometry(.20,.035,.065),gold,0,-.22,0);
  part(sword,new THREE.BoxGeometry(.058,.72,.024),steel,0,-.59,0);
  const point = part(sword,new THREE.ConeGeometry(.041,.15,4),steel,0,-1.01,0);
  point.rotation.z = Math.PI;
  sword.position.set(0,-.045,.015);
  sword.rotation.set(.05,0,-.07);
  rightHand.add(sword);

  const bow = new THREE.Group();
  bow.name = 'RodinBow54';
  const wood = new THREE.MeshStandardMaterial({color:0x775037,roughness:.8});
  const string = new THREE.LineBasicMaterial({color:0xe9e0c5});
  const bowArc = new THREE.Mesh(new THREE.TorusGeometry(.34,.02,5,14,Math.PI),wood);
  bowArc.rotation.y = Math.PI/2;
  bow.add(bowArc);
  bow.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0,-.34,0),new THREE.Vector3(.02,0,0),new THREE.Vector3(0,.34,0)
  ]),string));
  bow.position.set(.03,-.1,0);
  (leftHand || rightHand).add(bow);
  let weapon = 0; // 0=sword, 1=bow. Keep existing combat and equipment rules.
  function setWeapon(value) {
    weapon = value ? 1 : 0;
    sword.visible = weapon === 0;
    bow.visible = weapon === 1;
  }
  setWeapon(0);

  let attackTime = 0;
  let attackCombo = 0;
  let clock = 0;
  const swingQuat = new THREE.Quaternion();
  const angles = new THREE.Euler();
  function augment(bone,rx=0,ry=0,rz=0) {
    if (!bone) return;
    swingQuat.setFromEuler(angles.set(rx,ry,rz,'XYZ'));
    bone.quaternion.multiply(swingQuat);
  }
  function triggerAttack() {
    attackCombo = (attackCombo % 3) + 1;
    attackTime = .48;
  }
  function update({dt=0,moving=false,sprinting=false,blocking=false,dodging=false,weapon:nextWeapon=0}={}) {
    dt = Math.max(0,Math.min(.05,dt));
    clock += dt;
    if (nextWeapon !== weapon) setWeapon(nextWeapon);
    transition(!moving ? 'Idle' : sprinting ? 'Run' : 'Walk');
    // Keep animations at authored tempo; joystick movement is handled by game.
    mixer.update(dt);
    attackTime = Math.max(0,attackTime-dt);
    if (attackTime > 0) {
      const p = 1-attackTime/.48;
      const k = Math.sin(p*Math.PI);
      const side = attackCombo === 2 ? -1 : 1;
      // Additive after AnimationMixer update; bones belong to the real rig.
      augment(rightArm,-.8*k,side*.18*k,side*.22*k);
      augment(rightForeArm,-.55*k,0,-.10*k);
      augment(spine,0,side*.14*k,0);
    } else if (blocking) {
      augment(rightArm,-.45,0,-.16);
      augment(rightForeArm,-.3,0,0);
    } else if (dodging) {
      augment(spine,-.16,0,.08*Math.sin(clock*18));
    }
  }
  holder.add(root);
  return {
    root,mixer,animations:[...clips.keys()],
    setWeapon,triggerAttack,update,
    get movementState(){return state;},
    get currentWeapon(){return weapon;}
  };
}
