import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
/** Loads user-supplied Quaternius CC0 glTF assets. Leaves old buildings intact if files are missing. */
export async function installMedievalVillage70(THREE,scene,legacyBuildings){
 const loader=new GLTFLoader();const root='/assets/medieval/';
 const names=['Roof_RoundTiles_6x6','DoorFrame_Round_Brick','Door_1_Round','Balcony_Simple_Straight','Roof_Front_Brick4','Prop_Brick1'];
 const loaded=await Promise.allSettled(names.map(n=>loader.loadAsync(root+n+'.gltf')));
 const models=new Map();loaded.forEach((result,i)=>{if(result.status==='fulfilled')models.set(names[i],result.value.scene)});
 if(!models.has('Roof_RoundTiles_6x6')||!models.has('DoorFrame_Round_Brick')){console.info('[Astral Rift] Medieval assets not installed; keeping legacy houses');return {installed:false,loaded:models.size,total:names.length};}
 const village=new THREE.Group();village.name='QuaterniusMedievalVillage70';scene.add(village);
 const wallMat=new THREE.MeshStandardMaterial({color:0xb6a899,roughness:.96});
 const beamMat=new THREE.MeshStandardMaterial({color:0x654532,roughness:.9});
 const windowMat=new THREE.MeshStandardMaterial({color:0xffd090,emissive:0xffa85a,emissiveIntensity:.38,roughness:.5});
 function box(g,w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
 function addModel(g,name,x,y,z,w,h,d){
  const template=models.get(name);if(!template)return;
  const o=template.clone(true);o.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(o);const size=bounds.getSize(new THREE.Vector3());if(size.x<.001||size.y<.001||size.z<.001)return;
  o.scale.set(w/size.x,h/size.y,d/size.z);o.updateMatrixWorld(true);
  const scaled=new THREE.Box3().setFromObject(o);const center=scaled.getCenter(new THREE.Vector3());
  o.position.set(x-center.x,y-scaled.min.y,z-center.z);
  o.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true}});g.add(o);
 }
 for(let i=0;i<legacyBuildings.length;i++){
  const old=legacyBuildings[i];const house=new THREE.Group();house.position.copy(old.position);house.rotation.copy(old.rotation);village.add(house);
  const shade=i%3===0?0xb2a79a:i%3===1?0xbdb1a1:0xa89d92;
  const material=wallMat.clone();material.color.setHex(shade);
  box(house,4.9,3.5,4.6,0,1.75,0,material);
  box(house,5.25,.5,5,0,.24,0,beamMat);
  for(const x of [-2.4,2.4]){box(house,.22,3.5,.24,x,1.75,2.34,beamMat);box(house,.22,3.5,.24,x,1.75,-2.34,beamMat)}
  for(const y of [.6,3.35])box(house,4.9,.18,.25,0,y,2.35,beamMat);
  for(const x of [-1.45,1.45]){box(house,.85,1,.1,x,2.15,2.37,windowMat);box(house,.1,1.12,.15,x,2.15,2.47,beamMat);box(house,.95,.12,.15,x,2.15,2.47,beamMat)}
  addModel(house,'Roof_RoundTiles_6x6',0,3.55,0,5.8,2.2,5.7);
  addModel(house,'DoorFrame_Round_Brick',0,.15,2.5,1.65,2.4,.35);
  addModel(house,'Door_1_Round',0,.16,2.7,1.15,1.85,.2);
  if(i%2===0)addModel(house,'Balcony_Simple_Straight',0,2.6,2.8,2.2,.9,.8);
  if(i%3===0)addModel(house,'Roof_Front_Brick4',0,3.45,2.4,4.9,1.4,.45);
  old.visible=false;
 }
 console.info('[Astral Rift] Installed Quaternius medieval village',models.size,'assets');
 return {installed:true,loaded:models.size,total:names.length,group:village};
}
