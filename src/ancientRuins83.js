import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const BASE='/architecture/ancient-ruins/';
const ASSETS={
 wall:'kadamba-weathered-wall-section-optimized.glb',
 pillar:'kadamba-granite-temple-pillar-optimized.glb',
 roof:'kadamba-stepped-stone-roof-module-optimized.glb',
 arch:'carved-sandstone-torana-archway-optimized.glb',
 steps:'kadamba-carved-stone-entrance-steps-optimized.glb',
 floor:'mossy-stone-floor-slab-optimized.glb',
 door:'ornate-stone-door-frame-optimized.glb',
 altar:'carved-shrine-pedestal-optimized.glb',
 guardian:'guardian-deity-broken-statue-optimized.glb',
 nandi:'broken-stone-nandi-bull-sculpture-optimized.glb',
 plinth:'nandi-bull-shrine-plinth-optimized.glb',
 ruined:'low-ruined-wall-section-optimized.glb',
 lamp:'gilded-bronze-lantern-hanging-optimized.glb',
 tile:'ornate-marble-floor-tile-large-optimized.glb'
};
export function installAncientRuins83(THREE,scene,loreWorld){
 const root=new THREE.Group();root.name='AncientRuins83';root.position.set(83,0,70);scene.add(root);
 const loader=new GLTFLoader(),models=new Map(),blockers=[];let loaded=false,loading=null;
 function place(key,x,z,height=0,yaw=0,scale=1){
  const original=models.get(key);if(!original)return;
  const item=original.clone(true);item.rotation.y=yaw;item.scale.setScalar(scale);
  item.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(item);
  const center=bounds.getCenter(new THREE.Vector3());
  item.position.set(x-center.x,height-bounds.min.y,z-center.z);
  item.traverse(n=>{if(n.isMesh){n.castShadow=false;n.receiveShadow=true}});
  root.add(item);return item;
 }
 function solid(x,z,rx,rz){blockers.push({x:83+x,z:70+z,rx,rz});}
 function build(){
  for(let x=-8;x<=8;x+=2)for(let z=-9;z<=9;z+=2){
   place((Math.abs(x)+Math.abs(z))%6===0?'tile':'floor',x,z,-.1,0,1.15);
  }
  place('arch',0,-13,0,0,1.65);place('steps',0,-8.5,0,0,1.2);place('door',0,6.4,0,0,1.3);
  for(const x of [-7,7]){
   for(const z of [-6,-1,4]){place('pillar',x,z,0,0,1.65);solid(x,z,.8,.8)}
   for(const z of [-9,9]){place('ruined',x,z,0,Math.PI/2,2);solid(x,z,.7,1.2)}
  }
  for(const z of [-10,10])for(const x of [-6,6]){place('wall',x,z,0,0,1.5);solid(x,z,2.6,.7)}
  place('roof',0,9,5.4,0,1.7);place('altar',0,8,0,0,1.4);
  place('guardian',-3,7,0,Math.PI/4,1.55);place('guardian',3,7,0,-Math.PI/4,1.55);
  place('plinth',0,-3,0,0,1.2);place('nandi',0,-3,.8,Math.PI,1.05);
  for(const x of [-5,5])place('lamp',x,3,3.5,0,1.1);
  const old=loreWorld?.group?.children?.find(c=>c.name==='veil');if(old)old.visible=false;
  loaded=true;
 }
 async function load(){
  if(loading)return loading;
  loading=(async()=>{
   // Load essential models first; never hide the fallback unless all are present.
   for(const [key,file] of Object.entries(ASSETS)){
    try{const gltf=await loader.loadAsync(BASE+file);models.set(key,gltf.scene)}
    catch(err){console.warn('[Astral ruins] optional GLB unavailable',file,err)}
   }
   if(['wall','pillar','arch','floor','door'].every(k=>models.has(k)))build();
   return {loaded,models:models.size,expected:Object.keys(ASSETS).length};
  })();return loading;
 }
 return {root,load,get loaded(){return loaded},blocked(x,z,r=.35){return loaded&&blockers.some(b=>Math.abs(x-b.x)<b.rx+r&&Math.abs(z-b.z)<b.rz+r)}};
}
