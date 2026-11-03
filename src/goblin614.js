/** Astral Rift 6.1.4 — first rigged Goblin Raider.
 * Only one Goblin is loaded for this playtest. Main.js remains authoritative
 * for collision, targeting, HP, quest rewards, and respawn timing.
 * This controller only owns the skinned 3D visuals and animation mixer.
 */
export function chooseGoblinMotion614({alive=true,phase='idle',distance=0,dt=.016}={}) {
  if (!alive) return 'Dead';
  if (phase === 'windup') return 'Attack';
  const speed = distance / Math.max(.001,dt);
  if (speed > 1.75) return 'Running';
  if (speed > .14) return 'Walking';
  return 'Idle';
}

export async function loadGoblin614({THREE, GLTFLoader, enemy, assetUrl='/monsters/goblin_raider.glb', assetFactory=null}) {
  if (!enemy?.g) throw Error('Goblin enemy group missing');
  const gltf=assetFactory?await assetFactory(assetUrl):await new GLTFLoader().loadAsync(assetUrl);
  const root=gltf.scene;
  if (!root) throw Error('Goblin scene missing');
  const names=['Idle','Walking','Running','Attack','Dead'];
  const clips=new Map((gltf.animations||[]).map(c=>[c.name,c]));
  for(const n of names) if(!clips.has(n)) throw Error(`Goblin ${n} animation missing`);
  let skinned=0;
  root.traverse(obj=>{
    if(obj.isSkinnedMesh){skinned++;obj.frustumCulled=false;obj.castShadow=true;obj.receiveShadow=false;}
  });
  if(!skinned) throw Error('Goblin skeleton missing');
  const bounds=new THREE.Box3().setFromObject(root);
  const size=bounds.getSize(new THREE.Vector3());
  if(!(size.y>.5)) throw Error('Goblin bounds invalid');
  // Original GLB is 1.27m. A short 1.4m enemy with feet touching y=0.
  const scale=1.42/size.y;
  root.scale.setScalar(scale);
  root.position.set(-(bounds.min.x+bounds.max.x)*.5*scale,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*.5*scale);
  root.name='GoblinRaider614';
  // Do not dispose enemy.m: it is the old combat hit-reaction proxy.
  // The original placeholder body and its decoration are only hidden.
  for(const child of enemy.g.children){if(child!==enemy.warnRing57 && child!==enemy.warnMark57)child.visible=false;}
  enemy.g.add(root);
  const mixer=new THREE.AnimationMixer(root);
  const actions=Object.fromEntries(names.map(n=>[n,mixer.clipAction(clips.get(n))]));
  for(const [name,a] of Object.entries(actions)) {
    a.enabled=true;
    a.setLoop(name==='Attack'||name==='Dead'?THREE.LoopOnce:THREE.LoopRepeat,name==='Attack'||name==='Dead'?1:Infinity);
    a.clampWhenFinished=name==='Attack'||name==='Dead';
    if(name==='Attack')a.setEffectiveTimeScale(clips.get('Attack').duration/.67);
  }
  let state='Idle',deadTime=0,deadFinished=false;
  actions.Idle.play();
  function transition(next){
    if(!actions[next]||next===state)return;
    const old=actions[state],neu=actions[next];
    neu.reset();neu.enabled=true;neu.setEffectiveWeight(next==='Attack'?.72:1);
    if(next==='Attack')neu.setEffectiveTimeScale(clips.get('Attack').duration/.67);
    else neu.setEffectiveTimeScale(1);
    neu.play();
    if(old){if(next==='Dead'){old.stop();}else old.fadeOut(.12);}
    if(next!=='Dead')neu.fadeIn(.12);
    state=next;
  }
  return {
    root, mixer, clips, get state(){return state;},
    get deathFinished(){return deadFinished;},
    die(){if(state==='Dead')return;deadTime=0;deadFinished=false;transition('Dead');},
    revive(){deadTime=0;deadFinished=false;for(const a of Object.values(actions))a.stop();state='Idle';actions.Idle.reset().play();root.visible=true;},
    update(dt,{alive,phase,distance}){
      const delta=Math.min(.06,Math.max(0,dt||0));
      if(!alive){
        if(state!=='Dead')this.die();
        mixer.update(delta);
        deadTime+=delta;
        if(deadTime>=clips.get('Dead').duration+.08){deadFinished=true;root.visible=false;}
        return;
      }
      root.visible=true;
      let desired=chooseGoblinMotion614({alive,phase,distance,dt:delta});
      // When Attack has completed and the AI is recovering, return to Idle.
      if(state==='Attack' && desired==='Idle' && actions.Attack.time<actions.Attack.getClip().duration-.04)
        desired='Attack';
      transition(desired);
      mixer.update(delta);
    }
  };
}
