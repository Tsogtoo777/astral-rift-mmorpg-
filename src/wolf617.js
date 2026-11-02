/** Astral Rift 6.1.7 — optional authored FBX wolf (Idle, Walk, Run, Creep, Sit).
 * Uses a SEPARATE skeleton/mesh from the Meshy GLB Wolf. Do not retarget
 * the Meshy Attack/Hit/Death clips to it; those bones do not correspond.
 * If FBX loading or its motion validation fails main.js falls back to GLB.
 */
export const WOLF_FBX617_URL = '/monsters/forest-wolf/Wolf.fbx';

export function wolf617ClipMap(animations = []) {
  const known = {};
  for (const clip of animations) {
    const n = String(clip?.name || '').toLowerCase();
    if (n.includes('idle') && !known.Idle) known.Idle = clip;
    else if (n.includes('walk') && !known.Walk) known.Walk = clip;
    else if (n.includes('run') && !known.Run) known.Run = clip;
    else if (n.includes('creep') && !known.Creep) known.Creep = clip;
    else if ((n.includes('seat') || n.includes('sit')) && !known.Sit) known.Sit = clip;
  }
  return known;
}

export async function loadFBXForestWolf617({ THREE, FBXLoader, enemy, assetUrl = WOLF_FBX617_URL }) {
  if (!enemy?.g) throw new Error('Wolf entity group missing');
  const wolf = await new FBXLoader().loadAsync(assetUrl);
  if (!wolf?.traverse || !wolf?.animations) throw new Error('Invalid FBX wolf scene');
  const clips = wolf617ClipMap(wolf.animations);
  for (const name of ['Idle', 'Walk', 'Run', 'Creep', 'Sit']) {
    if (!clips[name] || !(clips[name].duration > 0)) {
      throw new Error(`FBX wolf authored clip missing: ${name}`);
    }
  }
  let skinned = 0;
  wolf.traverse(o => {
    if (!o.isSkinnedMesh) return;
    ++skinned;
    o.frustumCulled = false; // animated bones move the visible geometry
    o.castShadow = true;
    o.receiveShadow = false;
  });
  if (skinned === 0) throw new Error('FBX wolf has no SkinnedMesh');
  wolf.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(wolf);
  const size = bounds.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 1e-5) throw new Error('FBX wolf has invalid bounds');

  // Mesh remains on its ORIGINAL FBX armature; scale an external wrapper only.
  const root = new THREE.Group(); root.name = 'AuthoredWolf617';
  const pivot = new THREE.Group(); root.add(pivot);
  pivot.add(wolf);
  const factor = 1.10 / size.y;
  pivot.scale.setScalar(factor);
  pivot.position.set(
    -(bounds.min.x + bounds.max.x) * factor / 2,
    -bounds.min.y * factor,
    -(bounds.min.z + bounds.max.z) * factor / 2
  );
  const mixer = new THREE.AnimationMixer(wolf);
  const actions = {};
  for (const name of Object.keys(clips)) {
    const action = mixer.clipAction(clips[name]);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.enabled = true;
    actions[name] = action;
  }
  // Only after ALL validation passes do we hide the placeholder and attach.
  const oldObjects = enemy.g.children.filter(ch => ch !== enemy.warnRing57 && ch !== enemy.warnMark57);
  oldObjects.forEach(ch => { ch.visible = false; });
  enemy.g.add(root);

  let state = 'Idle', deathSeconds = 0, hitSeconds = 0, idleSeconds = 0;
  let filteredSpeed = 0, running = false, deathFinished = false;
  actions.Idle.reset().play();
  function play(next) {
    if (state === next || !actions[next]) return;
    const previous = actions[state];
    const target = actions[next];
    target.reset().setEffectiveWeight(1).play();
    if (previous) previous.fadeOut(.22);
    target.fadeIn(.22);
    state = next;
  }
  function restore() {
    deathSeconds = 0; hitSeconds = 0; idleSeconds = 0;
    filteredSpeed = 0; running = false; deathFinished = false;
    root.rotation.set(0, 0, 0); root.visible = true;
    for (const action of Object.values(actions)) action.stop();
    state = 'Idle'; actions.Idle.reset().play();
  }
  return {
    root, mixer, clips, get state() { return state; },
    get deathFinished() { return deathFinished; },
    get source() { return 'FBX-Authored'; },
    die() {
      if (deathSeconds > 0 || deathFinished) return;
      deathSeconds = .00001; hitSeconds = 0;
      // The provided FBX contains NO authored death clip; pose falls via root.
      for (const action of Object.values(actions)) action.stop();
    },
    hit() { if (deathSeconds > 0 || deathFinished) return; hitSeconds = .32; },
    revive() { restore(); },
    update(dt, {alive = true, phase = 'idle', distance = 0} = {}) {
      const step = Math.max(0, Math.min(.06, Number(dt) || 0));
      if (!alive || deathSeconds > 0) {
        if (deathSeconds === 0) this.die();
        deathSeconds += step;
        const t = Math.min(1, deathSeconds / 1.25);
        root.rotation.z = -Math.PI * .46 * t * t * (3 - 2 * t);
        if (deathSeconds >= 2.3) { deathFinished = true; root.visible = false; }
        return;
      }
      root.visible = true;
      const rawSpeed = Math.min(12, Math.max(0, Number(distance) || 0) / Math.max(step, .008));
      filteredSpeed += (rawSpeed - filteredSpeed) * (1 - Math.exp(-7 * step));
      if (filteredSpeed > 1.7) running = true;
      else if (filteredSpeed < .95) running = false;
      idleSeconds = filteredSpeed < .18 ? idleSeconds + step : 0;
      // The FBX has NO Attack, Hit or Dead clips. Creep is used for a short
      // attack anticipation; visual recoil/fall are separate root gestures.
      const desired = phase === 'windup' ? 'Creep' :
        running ? 'Run' : filteredSpeed > .18 ? 'Walk' :
        idleSeconds > 9 && Math.sin(idleSeconds * .35) > .92 ? 'Sit' : 'Idle';
      play(desired);
      if (hitSeconds > 0) {
        hitSeconds = Math.max(0, hitSeconds - step);
        root.rotation.z = Math.sin(hitSeconds * 12) * .11;
      } else root.rotation.z += (0 - root.rotation.z) * (1 - Math.exp(-15 * step));
      mixer.update(step);
    }
  };
}
