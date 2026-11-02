/** Astral Rift 6.1.5 — standalone Forest Wolf, 27-bone GLB, 7 animation clips.
 * Intentional GLTF scene scale (.01) is NOT overwritten. All dimensions are
 * normalized on an OUTER wrapper to avoid corrupting the wolf skeleton.
 * Reuses the main game's enemy AI, collision, damage and loot lifecycle.
 */
export function chooseWolfMotion615({alive=true,phase='idle',distance=0,dt=.016}={}) {
  if(!alive)return 'Dead';
  if(phase==='windup')return 'Attack';
  const speed=distance/Math.max(.001,dt);
  if(speed>1.7)return 'Run';
  if(speed>.12)return 'Walk';
  return 'Idle';
}

export async function loadForestWolf615({THREE,GLTFLoader,enemy,assetUrl='/monsters/forest_wolf.glb'}) {
  if(!enemy?.g)throw Error('Wolf enemy group missing');
  const gltf=await new GLTFLoader().loadAsync(assetUrl),root=gltf.scene;
  if(!root)throw Error('Wolf scene missing');
  const clipNames=['Idle','Walk','Run','Attack','Hit','Dead','Howl'];
  const clips=new Map((gltf.animations||[]).map(c=>[c.name,c]));
  for(const name of clipNames)if(!clips.has(name))throw Error(`Wolf clip missing: ${name}`);
  let skinned=0;
  root.traverse(obj=>{if(obj.isSkinnedMesh){skinned++;obj.frustumCulled=false;obj.castShadow=true;obj.receiveShadow=false;}});
  if(!skinned)throw Error('Wolf skin/skeleton missing');
  root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root);
  const size=bounds.getSize(new THREE.Vector3());
  if(!(size.y>1e-7))throw Error('Wolf bounds invalid');
  // DO NOT set root.scale: GLB has scaled armature & animated joint paths.
  const container=new THREE.Group();container.name='ForestWolf615';
  container.add(root);
  const factor=.98/size.y;
  container.scale.setScalar(factor);
  container.position.set(-.5*(bounds.min.x+bounds.max.x)*factor,-bounds.min.y*factor,-.5*(bounds.min.z+bounds.max.z)*factor);
  // The old placeholder must be invisible, but stays owned by main.js for hit FX.
  for(const child of enemy.g.children){if(child!==enemy.warnRing57&&child!==enemy.warnMark57)child.visible=false;}
  enemy.g.add(container);
  const mixer=new THREE.AnimationMixer(root),actions={};
  for(const name of clipNames){
    const a=mixer.clipAction(clips.get(name));
    a.enabled=true;
    a.setLoop(['Attack','Hit','Dead','Howl'].includes(name)?THREE.LoopOnce:THREE.LoopRepeat,Infinity);
    a.clampWhenFinished=['Dead','Howl'].includes(name);
    actions[name]=a;
  }
  // The procedural Attack clip is 1.15s; AI windup is about .47 seconds.
  // Playing 1.15s at 2.0x keeps the physical contact within the telegraph.
  actions.Attack.setEffectiveTimeScale(2.0);
  let state='Idle',deathElapsed=0,deathFinished=false,hitRemaining=0;
  actions.Idle.play();
  function change(next){
    if(!actions[next]||state===next)return;
    const prev=actions[state],neu=actions[next];
    neu.reset();neu.enabled=true;neu.setEffectiveWeight(1);
    if(next==='Attack')neu.setEffectiveTimeScale(2);
    else neu.setEffectiveTimeScale(1);
    neu.play();
    if(prev){if(next==='Dead')prev.stop();else prev.fadeOut(.15);}
    if(next!=='Dead')neu.fadeIn(.15);
    state=next;
  }
  return {
    root:container,mixer,clips,get state(){return state;},get deathFinished(){return deathFinished;},
    die(){if(state==='Dead')return;deathElapsed=0;hitRemaining=0;deathFinished=false;change('Dead');},
    hit(){if(state==='Dead'||hitRemaining>0)return;hitRemaining=Math.min(.5,clips.get('Hit').duration);change('Hit');},
    revive(){deathElapsed=0;hitRemaining=0;deathFinished=false;Object.values(actions).forEach(a=>a.stop());state='Idle';actions.Idle.reset().play();container.visible=true;},
    update(dt,{alive,phase,distance}) {
      const step=Math.min(.06,Math.max(0,Number(dt)||0));
      if(!alive){
        if(state!=='Dead')this.die();
        mixer.update(step);deathElapsed+=step;
        if(deathElapsed>=clips.get('Dead').duration+.08){deathFinished=true;container.visible=false;}
        return;
      }
      container.visible=true;
      let desired=chooseWolfMotion615({alive,phase,distance,dt:step});
      if(hitRemaining>0){hitRemaining=Math.max(0,hitRemaining-step);desired='Hit';}
      // No forced restart at each AI recover tick: let the attack finish.
      if(state==='Attack'&&desired==='Idle'&&actions.Attack.time<clips.get('Attack').duration-.04)desired='Attack';
      change(desired);mixer.update(step);
    }
  };
}
