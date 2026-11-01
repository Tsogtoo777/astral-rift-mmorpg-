/**
 * Astral Rift 5.9.5 — fitted original cape recolor, no floating GLB cape.
 *
 * The offline build transforms the supplied GLBs into Rodin's bind-space and
 * transfers skin influences (filtered by garment region) onto their vertices.
 * No new rig, manual marker placement, per-frame CPU vertex deformation, or
 * second animation mixer is required. SkinnedMesh uses the existing GPU skinning.
 * Katana is still a hard object attached via Rodin's hand grip socket.
 * The external AI-generated cape does not match Rodin's silhouette. To avoid
 * floating fabric, the default visible teal cape is a material variation of
 * RodinOriginalCape594 (already skinned correctly to Rodin). The separate
 * teal cape GLB remains on disk for future offline re-fitting, but is NOT
 * rendered as wearable in 5.9.5. Not a cloth physics simulation.
 */
const ASSETS_592 = Object.freeze({
  boots:'/equipment/rodin-greaves-skinned.glb',
  cloak:'/equipment/rodin-teal-cape-skinned.glb',
  katana:'/equipment/rodin-dark-katana.glb'
});

export function makeGearLoadPlan591(equipped={}) {
  const items=[];
  if(equipped.boots==='wanderer-boots')items.push('boots');
  if(equipped.cloak==='teal-cape')items.push('cloak');
  if(equipped.weapon==='dark-katana')items.push('katana');
  return items;
}

export function validateSkinnedGear592(THREE, source, rigSkeleton, expectedNames) {
  if(!source?.geometry?.attributes?.position)throw new Error('Gear mesh missing position');
  const skinIndex=source.geometry.getAttribute('skinIndex');
  const skinWeight=source.geometry.getAttribute('skinWeight');
  if(!skinIndex||!skinWeight||skinIndex.itemSize!==4||skinWeight.itemSize!==4 ||
      skinIndex.count!==source.geometry.getAttribute('position').count ||
      skinWeight.count!==skinIndex.count){
    throw new Error('Skin weights missing or wrong vertex count');
  }
  if(!Array.isArray(expectedNames)||expectedNames.length!==rigSkeleton.bones.length){
    throw new Error('Bind skeleton metadata missing');
  }
  const actual=rigSkeleton.bones.map(b=>b.name);
  const reorder=expectedNames.map(name=>actual.indexOf(name));
  if(reorder.some(i=>i<0))throw new Error('Rodin bone names changed');
  if(reorder.some((i,j)=>i!==j)){
    // The processed GLBs store joints in the original 27-bone Rodin order.
    // Map once if a later GLB loader changes bone array order.
    const copy=skinIndex.clone();
    for(let i=0;i<copy.count;i++)for(let c=0;c<4;c++){
      const old=copy.getComponent(i,c);
      if(old<0 || old>=reorder.length)throw new Error('Gear joint index out of range');
      copy.setComponent(i,c,reorder[old]);
    }
    source.geometry=source.geometry.clone();
    source.geometry.setAttribute('skinIndex',copy);
  }
  return true;
}

export function createEquipmentVisual591(THREE,loader,rodin,equipment,{onStatus=()=>{}}={}) {
  if(!rodin?.root||!rodin?.setExternalSwordModel)throw new Error('Rodin equipment hooks missing');
  const root=rodin.root;
  // 5.9.4 Rodin GLB has a separately controllable, already fitted cape.
  // Make a color-only cape variant from the actual Rodin mesh: it follows the
  // original skinning exactly. The unfitted user GLB remains offscreen.
  const originalCape=root.getObjectByName('RodinOriginalCape594');
  if (!originalCape?.isSkinnedMesh) {
    console.warn('[Equipment 5.9.4] Original cape is not independently switchable; replace rodin-rigged.glb with patched asset');
  }
  let host=null;
  root.traverse(o=>{if(o.isSkinnedMesh&&!host)host=o;});
  if(!host?.skeleton?.bones?.length)throw new Error('Rodin skinned mesh missing');
  const originalCapeMaterial=originalCape?.material || null;
  const makeTeal=(src)=>{
    const material=src.clone();
    material.name='Rodin Fitted Teal Cape 595';
    material.color.set('#18aab3');
    if('roughness' in material)material.roughness=.92;
    if('metalness' in material)material.metalness=0;
    material.side=THREE.DoubleSide;
    return material;
  };
  const tealCapeMaterial=originalCape
    ? (Array.isArray(originalCapeMaterial)
        ? originalCapeMaterial.map(makeTeal)
        : makeTeal(originalCapeMaterial)) : null;
  const loaded={};
  const pending=new Map();
  let cloakReported=false;
  let disposed=false;
  const report=(key,message)=>{try{onStatus({key,message});}catch{}}
  function configured(key){
    if(key==='boots')return equipment.get('boots')?.id==='wanderer-boots';
    if(key==='cloak')return equipment.get('cloak')?.id==='teal-cape';
    return equipment.get('weapon')?.id==='dark-katana';
  }
  function refresh(){
    for(const obj of loaded.boots||[])obj.visible=configured('boots');
    if(originalCape){
      // NEVER hide original cape when teal is equipped; it IS the fitted
      // wearable, changing only its material. This prevents gaps/detachment.
      originalCape.visible=true;
      const active=configured('cloak');
      originalCape.material=active?tealCapeMaterial:originalCapeMaterial;
      if(active && !cloakReported){report('cloak','loaded');cloakReported=true;}
    }
  }

  function bindSkinnedAsset(gltf,key) {
    const expected=gltf?.parser?.json?.extras?.rodinSkinOrder592;
    if(!expected)throw new Error('5.9.2 preprocessed GLB is missing skin order metadata');
    const meshes=[];
    gltf.scene.traverse(obj=>{if(obj.isMesh)meshes.push(obj);});
    const expectedMeshNames=key==='boots'?['LeftGreave','RightGreave']:['TealCape'];
    if(meshes.length!==expectedMeshNames.length ||
       !expectedMeshNames.every(name=>meshes.some(m=>m.name===name))){
      throw new Error('Equipment mesh parts missing');
    }
    const created=[];
    // The offline source vertices are fitted in Rodin MODEL bind coordinates.
    // Mount in the same parent/transform space as Rodin's own skinned body.
    host.updateWorldMatrix(true,false);
    try {
      for(const src of meshes){
        validateSkinnedGear592(THREE,src,host.skeleton,expected);
        const old=Array.isArray(src.material)?src.material:[src.material];
        const mats=old.map(mat=>{
          const copy=mat.clone();
          if(key==='cloak')copy.side=THREE.DoubleSide;
          return copy;
        });
        const item=new THREE.SkinnedMesh(src.geometry,mats.length===1?mats[0]:mats);
        item.name='RodinWeightedGear592_'+src.name;
        item.position.copy(host.position);
        item.quaternion.copy(host.quaternion);
        item.scale.copy(host.scale);
        item.frustumCulled=false;
        item.castShadow=true;
        item.receiveShadow=false;
        item.bindMode=host.bindMode;
        host.parent.add(item);
        // Use the original inverse-bind matrices, NOT another bind pose.
        item.bind(host.skeleton,host.bindMatrix.clone());
        item.visible=configured(key);
        created.push(item);
      }
    }catch(e){
      for(const item of created){item.removeFromParent();
        const materials=Array.isArray(item.material)?item.material:[item.material];
        for(const mat of materials)mat?.dispose?.();
      }
      throw e;
    }
    return created;
  }
  function placeKatana(gltf){
    const model=gltf.scene;
    model.traverse(obj=>{if(obj.isMesh)obj.castShadow=true;});
    model.scale.setScalar(.79);
    model.position.set(0,-.85,0);
    model.rotation.set(0,0,0);
    rodin.setExternalSwordModel(model);
    return [model];
  }
  function load(key){
    if(disposed||loaded[key])return Promise.resolve();
    if(pending.has(key))return pending.get(key);
    const task=new Promise(resolve=>{
      loader.load(ASSETS_592[key],gltf=>{
        if(disposed){resolve();return;}
        try{
          loaded[key]=key==='katana'?placeKatana(gltf):bindSkinnedAsset(gltf,key);
          refresh();report(key,'loaded');
        }catch(e){
          console.warn('[Equipment 5.9.2] '+key+' skin failed:',e);
          report(key,'mount-failed');
        }
        resolve();
      },undefined,e=>{
        console.warn('[Equipment 5.9.2] '+key+' asset unavailable:',e);
        report(key,'load-failed');resolve();
      });
    });
    pending.set(key,task);
    void task.finally(()=>pending.delete(key));
    return task;
  }
  async function sync(){
    if(disposed)return;
    refresh();
    const plan=makeGearLoadPlan591({
      boots:equipment.get('boots')?.id,
      cloak:equipment.get('cloak')?.id,
      weapon:equipment.get('weapon')?.id
    });
    for(const key of plan){
      if(disposed)break;
      if(key==='cloak'){
        if(!originalCape)report('cloak','base-asset-missing');
        // Do not fetch/render ill-fitting external teal cape.
        continue;
      }
      await load(key);
    }
    refresh();
  }
  function dispose(){
    disposed=true;
    for(const key of ['boots'])for(const item of loaded[key]||[]){
      item.removeFromParent();
      const mats=Array.isArray(item.material)?item.material:[item.material];
      for(const mat of mats)mat?.dispose?.();
    }
    if(originalCape){originalCape.material=originalCapeMaterial;originalCape.visible=true;}
    const tealMats=Array.isArray(tealCapeMaterial)?tealCapeMaterial:[tealCapeMaterial];
    tealMats.forEach(m=>m?.dispose?.());
    if(loaded.katana?.length)rodin.setExternalSwordModel(null);
  }
  return {sync,dispose,loaded,assets:ASSETS_592,originalCape,capeMode:'fitted-recolor-595'};
}
