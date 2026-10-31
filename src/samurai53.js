// Astral Rift Alpha 5.3 — permanent Samurai player.
// Source: user-supplied Oedo TIME! Low-Poly Samurai Trial Pack v1.1.1.
// Its GLB contains a genuine humanoid skin (56 joints) plus Run and DrawSword.
// Walk is a slower playback of Run; attacks/block/dodge are compact procedural
// overlays pending *actual* animation clips. No invented Mixamo clips.
export function createSamurai53(THREE, gltf, holder) {
  const root = gltf?.scene;
  if (!root) throw new Error('Samurai GLB has no scene');
  if (!gltf.animations?.some(clip => clip.name === 'Samurai_Run')) {
    throw new Error('Missing Samurai_Run animation');
  }
  let skinCount = 0;
  root.traverse(obj => {
    if (obj.isSkinnedMesh) skinCount++;
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = false;
      obj.frustumCulled = false; // Skinned bounds move during actions
    }
  });
  if (!skinCount) throw new Error('Samurai model has no skinned meshes');

  // Keep the same gameplay capsule/ground position as the original player.
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.1) throw new Error('Invalid Samurai bounds');
  const scale = 2.25 / size.y;
  root.scale.setScalar(scale);
  root.position.set(-(bounds.min.x + bounds.max.x) * .5 * scale,
                    -bounds.min.y * scale,
                    -(bounds.min.z + bounds.max.z) * .5 * scale);
  // The GLTFLoader can sanitize punctuation in bone names (e.g. arm_stretch.r
  // becomes arm_stretch_r). Do not rename GLTF nodes: clip bindings depend on them.
  root.userData.astralPlayer53 = true;

  const mixer = new THREE.AnimationMixer(root);
  const runClip = gltf.animations.find(a => a.name === 'Samurai_Run');
  const drawClip = gltf.animations.find(a => a.name === 'Samurai_DrawSword');
  const runAction = mixer.clipAction(runClip);
  runAction.setLoop(THREE.LoopRepeat, Infinity);
  runAction.setEffectiveWeight(0);
  runAction.play();
  const drawAction = drawClip ? mixer.clipAction(drawClip) : null;
  if (drawAction) { drawAction.setLoop(THREE.LoopOnce, 1); drawAction.clampWhenFinished = true; }
  mixer.addEventListener('finished', ev => {
    if (ev.action === drawAction) drawAction.fadeOut(.18);
  });

  // GLTFLoader sanitizes names differently between Three.js revisions.  The
  // original asset calls its arm bone "arm_stretch.r"; the runtime can expose
  // it as "arm_stretch_r" or "arm_stretchr".  The 5.3 implementation used only
  // exact original strings and threw during avatar initialization, leaving a
  // visible but unanimated Samurai in its bind pose.
  const canonical = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g,'');
  const nodesByCanonical = new Map();
  root.traverse(node => {
    for (const name of [node.name,node.userData?.name,node.userData?.originalName]) {
      if (name && !nodesByCanonical.has(canonical(name))) nodesByCanonical.set(canonical(name),node);
    }
  });
  const lookup = name => root.getObjectByName(name) || nodesByCanonical.get(canonical(name));
  const mesh = name => lookup(name);
  const bone = name => lookup(name);
  const swords = {
    hip: mesh('katana'),
    hand: mesh('katana_hand'),
    left: mesh('katana_lhand'),
    sheath: mesh('saya'),
    sheathHand: mesh('saya_hand'),
    hipBone: bone('bone_sword'),
    handBone: bone('bone_sword_hand'),
    leftBone: bone('bone_sword_lhand'),
    sheathHandBone: bone('bone_sheath_hand')
  };
  const arm = bone('arm_stretch.r');
  const shoulder = bone('shoulder.r');
  const forearm = bone('forearm_stretch.r');
  const spine = bone('spine_02.x');
  const head = bone('head.x');
  const overlayBones = [arm,shoulder,forearm,spine,head].filter(Boolean);
  const baseRotations = overlayBones.map(node => node.quaternion.clone());
  if (!arm || !spine || !swords.hand || !swords.handBone) {
    const missing = [
      !arm && 'arm_stretch.r',
      !spine && 'spine_02.x',
      !swords.hand && 'katana_hand',
      !swords.handBone && 'bone_sword_hand'
    ].filter(Boolean);
    throw new Error('Samurai required nodes missing: '+missing.join(', '));
  }
  // Mount only after we know the animation controller can be initialized.
  holder.add(root);

  // The original clips animate visibility by scaling *multiple copies* of the
  // sword, rather than attaching a separate sword. Override at the end of each
  // mixer tick so running NEVER makes the equipped sword disappear.
  let weapon = 0; // 0 sword, 1 bow (gameplay weapon swap preserved)
  let activeAttack = 0;
  let combo = 0;
  let elapsed = 0;
  let movementWeight = 0;
  const temporary = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const swing = (node, rx, ry, rz) => {
    if (!node) return;
    temporary.setFromEuler(euler.set(rx, ry, rz, 'XYZ'));
    node.quaternion.multiply(temporary);
  };
  // Low-cost bow visual for the existing bow skill, tied to an actual hand bone.
  // The old floating world-space LEGO bow is removed.
  const bowVisual = new THREE.Group();
  bowVisual.name = 'SamuraiBow53';
  const wood = new THREE.MeshStandardMaterial({color:0x744a31,roughness:.75});
  const string = new THREE.LineBasicMaterial({color:0xe7dbc2});
  const bowArc = new THREE.Mesh(new THREE.TorusGeometry(.34,.022,5,16,Math.PI),wood);
  bowArc.rotation.set(0,Math.PI/2,.08);
  bowVisual.add(bowArc);
  const pts=[new THREE.Vector3(0,-.34,0),new THREE.Vector3(.0,.0,.0),new THREE.Vector3(0,.34,0)];
  const wire=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),string);
  bowVisual.add(wire);
  bowVisual.position.set(0,-.03,-.07);
  bowVisual.scale.setScalar(.68);
  const hand = bone('hand.r') || arm;
  hand.add(bowVisual);

  function applyWeaponVisibility() {
    const swordOn = weapon === 0;
    // Only one sword mesh at a time; keep sheath at hip.
    if (swords.hand) swords.hand.visible = swordOn;
    if (swords.hip) swords.hip.visible = !swordOn;
    if (swords.left) swords.left.visible = false;
    if (swords.sheath) swords.sheath.visible = true;
    if (swords.sheathHand) swords.sheathHand.visible = false;
    if (swords.handBone) swords.handBone.scale.setScalar(swordOn ? 1 : 0);
    if (swords.hipBone) swords.hipBone.scale.setScalar(swordOn ? 0 : 1);
    if (swords.leftBone) swords.leftBone.scale.setScalar(0);
    if (swords.sheathHandBone) swords.sheathHandBone.scale.setScalar(0);
    bowVisual.visible = !swordOn;
  }
  function setWeapon(value) {
    const changed = weapon !== value;
    weapon = value ? 1 : 0;
    if (changed && weapon === 0 && drawAction) {
      drawAction.stop();
      drawAction.reset();
      drawAction.setEffectiveTimeScale(1);
      drawAction.setEffectiveWeight(1);
      drawAction.fadeIn(.12).play();
    }
    applyWeaponVisibility();
  }
  function triggerAttack() {
    combo = (combo % 3) + 1;
    activeAttack = .52;
  }
  function update({dt=0, moving=false, sprinting=false, blocking=false, dodging=false, weapon:currentWeapon=0}={}) {
    dt = Math.min(.05,Math.max(0,dt));
    elapsed += dt;
    if (currentWeapon !== weapon) setWeapon(currentWeapon);
    movementWeight = THREE.MathUtils.damp(movementWeight,moving ? 1 : 0,9,dt);
    // Source pack has no Idle clip. Hold a gentle fraction of the run stance
    // while stationary instead of snapping back to the rig's T-pose.
    runAction.setEffectiveWeight(.22 + .78*movementWeight);
    runAction.setEffectiveTimeScale(moving ? (sprinting ? 1.28 : .78) : 0);
    if (!moving) runAction.time = Math.min(runClip.duration || .67, .12);
    overlayBones.forEach((node,i) => node.quaternion.copy(baseRotations[i]));
    mixer.update(dt);

    // The source asset has no sword-attack animation. These are modest upper-
    // body bone poses; real attack clips can replace them without changing the
    // movement/camera/combat wiring.
    activeAttack = Math.max(0,activeAttack-dt);
    if (activeAttack > 0) {
      const progress = 1-activeAttack/.52;
      const envelope = Math.sin(Math.PI * progress);
      const side = combo === 2 ? -1 : 1;
      swing(shoulder,-.42*envelope,side*.18*envelope,-.20*envelope);
      swing(arm,-.84*envelope,side*.28*envelope,.14*envelope);
      swing(forearm,-.38*envelope,0,0);
      swing(spine,0,side*.17*envelope,0);
    } else if (blocking) {
      swing(arm,-.49,0,-.12);
      swing(forearm,-.30,0,0);
    } else if (dodging) {
      swing(spine,-.22,0,.10);
    } else if (!moving) {
      swing(spine,Math.sin(elapsed*2)*.006,0,0);
      swing(head,0,Math.sin(elapsed*.8)*.009,0);
    }
    applyWeaponVisibility();
    root.rotation.z = dodging ? Math.sin(elapsed*24)*.04 : 0;
  }
  applyWeaponVisibility();
  return {root,mixer,animations:gltf.animations.map(a=>a.name),setWeapon,triggerAttack,update};
}
