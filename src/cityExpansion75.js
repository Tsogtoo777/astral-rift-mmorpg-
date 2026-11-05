// Alpha 7.5: outer residential ring using the EXISTING Quaternius glTF modules.
// Original starter buildings, quest entrances, NPCs and castle coordinates stay fixed.
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function installCityExpansion75(THREE,scene){
 const root=new THREE.Group();root.name='StarterCityExpansion75';scene.add(root);
 const footprints=[];
 const positions=[[-32,-15],[-32,-5],[-32,6],[-32,16],[32,-15],[32,-5],[32,6],[32,16],[-21,-29],[-10,-30],[10,-30],[21,-29]];
 const loader=new GLTFLoader();const names=['Wall_Plaster_Straight','Wall_Plaster_Door_Round','Wall_Plaster_Window_Wide_Round','Roof_RoundTiles_6x6','DoorFrame_Round_Brick','Prop_Chimney'];
 const loaded=Promise.allSettled(names.map(n=>loader.loadAsync('/architecture/medieval/'+n+'.gltf'))).then(results=>{
  const models=new Map();results.forEach((r,i)=>{if(r.status==='fulfilled')models.set(names[i],r.value.scene)});
  if(names.slice(0,5).some(n=>!models.has(n))){console.warn('[Astral 7.5] Expansion assets missing; no partial houses created');return false;}
  function add(g,name,x,y,z,rotation=0){const model=models.get(name);if(!model)return null;const obj=model.clone(true);obj.position.set(x,y,z);obj.rotation.y=rotation;obj.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});g.add(obj);return obj;}
  positions.forEach(([x,z],i)=>{
   const house=new THREE.Group();house.position.set(x,0,z);house.rotation.y=i%2?Math.PI:0;root.add(house);
   for(const xx of [-2,0,2]){
    add(house,xx===0?'Wall_Plaster_Door_Round':'Wall_Plaster_Window_Wide_Round',xx,0,3);
    add(house,'Wall_Plaster_Straight',xx,0,-3,Math.PI);
   }
   for(const zz of [-2,0,2]){add(house,'Wall_Plaster_Straight',-3,0,zz,-Math.PI/2);add(house,'Wall_Plaster_Straight',3,0,zz,Math.PI/2);}
   const roof=add(house,'Roof_RoundTiles_6x6',0,3.15,0);if(roof)roof.scale.set(.76,.65,.76);
   add(house,'DoorFrame_Round_Brick',0,0,3.06);
   if(i%3===0){const chimney=add(house,'Prop_Chimney',1.5,3.4,-1.4);if(chimney)chimney.scale.setScalar(.65)}
   footprints.push({x,z,r:3.1});
  });
  console.info('[Astral 7.5] Expanded starter city by',footprints.length,'real glTF houses');return true;
 });
 return {root,ready:loaded,blocked(x,z,radius=.35){return footprints.some(p=>Math.abs(x-p.x)<p.r+radius&&Math.abs(z-p.z)<p.r+radius)}};
}
