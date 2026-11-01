/**
 * Astral Rift Alpha 5.9.1 — lightweight user-provided GLB equipment previews.
 * Greaves and cape are STATIC, rigidly attached to animated bones (NOT skinned
 * or physically simulated). A failed/missing asset keeps the existing Rodin
 * avatar and procedural sword fully playable.
 *
 * Original uploaded source GLBs stay unchanged outside the game bundle.
 */
const ASSETS_591 = Object.freeze({
  boots:'/equipment/rodin-greaves-lite.glb',
  cloak:'/equipment/rodin-teal-cape-lite.glb',
  katana:'/equipment/rodin-dark-katana.glb'
});

export function makeGearLoadPlan591(equipped = {}) {
  const result=[];
  if (equipped.boots === 'wanderer-boots') result.push('boots');
  if (equipped.cloak === 'teal-cape') result.push('cloak');
  if (equipped.weapon === 'dark-katana') result.push('katana');
  return result;
}

export function createEquipmentVisual591(THREE, loader, rodin, equipment, {onStatus=()=>{}}={}) {
  if (!rodin?.root || !rodin?.setExternalSwordModel) throw new Error('Rodin 5.9.1 visual hooks missing');
  const root=rodin.root;
  const joint=name=>root.getObjectByName(name);
  const leftLeg=joint('LeftLeg'),rightLeg=joint('RightLeg'),spine=joint('Spine2')||joint('Spine1');
  const loaded={};
  const pending=new Map();
  let disposed=false;
  const report=(key,message)=>{try{onStatus({key,message});}catch{}};
  function configured(key) {
    if (key==='boots') return equipment.get('boots')?.id==='wanderer-boots';
    if (key==='cloak') return equipment.get('cloak')?.id==='teal-cape';
    if (key==='katana') return equipment.get('weapon')?.id==='dark-katana';
    return false;
  }
  function enable(key){
    if (key==='katana') return;
    if (loaded[key]) loaded[key].forEach(obj=>{obj.visible=configured(key);});
  }
  function decorate(model) {
    model.traverse(obj=>{
      if(!obj.isMesh)return;
      obj.castShadow=true;
      obj.receiveShadow=false;
      // The source cape is an extremely thin AI-created mesh.
      if(obj.material){
        const mats=Array.isArray(obj.material)?obj.material:[obj.material];
        obj.material=mats.map(m=>{const copy=m.clone();copy.side=THREE.DoubleSide;return copy;});
        if(!Array.isArray(obj.material)||obj.material.length===1)obj.material=obj.material[0];
      }
    });
  }
  function placeGreaves(scene) {
    if (!leftLeg || !rightLeg) throw new Error('Rodin Leg bones unavailable');
    const meshes={};
    scene.traverse(obj=>{if(obj.isMesh)meshes[obj.name]=obj;});
    const names=['LeftGreave','RightGreave'];
    if(!names.every(n=>meshes[n]))throw new Error('Greaves need two separated meshes');
    const items=[];
    for(const [i,bone] of [leftLeg,rightLeg].entries()){
      const mesh=meshes[names[i]];
      // Source boots are 1 unit high. The player's knee-to-ground distance is
      // about 0.5 rig units; set top of new mesh at the shin joint.
      mesh.position.set(0,-.49,.016);
      mesh.rotation.y=Math.PI/2; // original pair is arranged along source Z
      mesh.scale.setScalar(.49);
      bone.add(mesh);
      items.push(mesh);
    }
    return items;
  }
  function placeCape(scene) {
    if(!spine)throw new Error('Rodin Spine2 bone unavailable');
    const cape=scene;
    // Cape source height 1; hang from upper back to mid-thigh. Rigid mount:
    // it follows torso but cannot deform like a proper clothing skin.
    cape.scale.setScalar(.73);
    cape.position.set(0,-.63,-.26);
    cape.rotation.set(.10,0,0);
    spine.add(cape);
    return [cape];
  }
  function placeKatana(scene) {
    // The katana image-to-3D model has handle at Y ~.86 and blade tip at Y ~0.
    // Anchor its grip to the existing RightHand sword mount.
    scene.scale.setScalar(.79);
    scene.position.set(0,-.85,0);
    scene.rotation.set(0,0,0);
    rodin.setExternalSwordModel(scene);
    return [scene];
  }
  function load(key) {
    if(disposed||loaded[key]) return Promise.resolve();
    if(pending.has(key)) return pending.get(key);
    const promise = new Promise((resolve)=>{
      loader.load(ASSETS_591[key], gltf=>{
        if(disposed){resolve();return;}
        try{
          const model=gltf.scene;
          decorate(model);
          const items=key==='boots'?placeGreaves(model):key==='cloak'?placeCape(model):placeKatana(model);
          loaded[key]=items;
          enable(key);
          report(key,'loaded');
        }catch(err){
          report(key,'mount-failed');
          console.warn('[Equipment 5.9.1] '+key+' cannot mount:',err);
        }
        resolve();
      },undefined,err=>{
        report(key,'load-failed');
        console.warn('[Equipment 5.9.1] '+key+' GLB unavailable:',err);
        resolve();
      });
    });
    pending.set(key,promise);
    void promise.finally(()=>pending.delete(key));
    return promise;
  }
  async function sync() {
    if(disposed)return;
    // Hide previously loaded pieces immediately when an item is unequipped.
    for(const key of ['boots','cloak'])enable(key);
    const plan=makeGearLoadPlan591({
      boots:equipment.get('boots')?.id,
      cloak:equipment.get('cloak')?.id,
      weapon:equipment.get('weapon')?.id
    });
    // Serial load avoids downloading both heavyweight meshes at once on phone.
    for(const key of plan)await load(key);
    // Weapon fallback/selection is controlled by the Rodin module itself.
  }
  function dispose(){disposed=true;for(const key of ['boots','cloak']){
    for(const mesh of loaded[key]||[])mesh.removeFromParent();
  }}
  return {sync,dispose,loaded,assets:ASSETS_591};
}
