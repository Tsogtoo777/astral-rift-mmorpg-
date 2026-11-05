// Alpha 7.5: outer residential ring using the EXISTING Quaternius glTF modules.
// Original starter buildings, quest entrances, NPCs and castle coordinates stay fixed.
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function installCityExpansion75(THREE,scene){
 const root=new THREE.Group();root.name='StarterCityExpansion75';scene.add(root);
 const footprints=[];
 const streets=new THREE.Group();streets.name='StarterCityStreets80';root.add(streets);
 const roadMaterial=new THREE.MeshStandardMaterial({color:0x8b8073,roughness:1,depthWrite:false});
 function street(x,z,w,d){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),roadMaterial);o.rotation.x=-Math.PI/2;o.position.set(x,.025,z);o.receiveShadow=true;streets.add(o)}
 // Central travel corridor remains open for existing NPC, quest and castle routes.
 street(-38,-3,5,80);street(38,-3,5,80);street(0,-35,82,5);
 street(-27,31,19,4);street(27,31,19,4);
 const positions=[
  // West artisan quarter / East merchant quarter
  [-32,-15],[-32,-5],[-32,6],[-32,16],[32,-15],[32,-5],[32,6],[32,16],
  // South residential quarter
  [-21,-29],[-10,-30],[10,-30],[21,-29],
  // Expanded perimeter: visible town districts, not enlarged individual meshes
  [-44,-23],[-44,-12],[-44,-1],[-44,10],[-44,21],
  [44,-23],[44,-12],[44,-1],[44,10],[44,21],
  [-34,-39],[-23,-40],[-12,-41],[12,-41],[23,-40],[34,-39],
  [-33,35],[-22,37],[22,37],[33,35],
  // Fill previously empty streets with real medieval modular houses.
  [-20,-15],[-20,-5],[-20,7],[-20,18],
  [20,-15],[20,-5],[20,7],[20,18],
  [-11,27],[11,27],[-48,33],[48,33],
  [-46,-35],[46,-35],[-20,-49],[20,-49]
 ];
 const loader=new GLTFLoader();const names=['Wall_Plaster_Straight','Wall_Plaster_Door_Round','Wall_Plaster_Window_Wide_Round','Roof_RoundTiles_6x6','DoorFrame_Round_Brick','Prop_Chimney'];
 const loaded=Promise.allSettled(names.map(n=>loader.loadAsync('/architecture/medieval/'+n+'.gltf'))).then(results=>{
  const models=new Map();results.forEach((r,i)=>{if(r.status==='fulfilled')models.set(names[i],r.value.scene)});
  if(names.slice(0,4).some(n=>!models.has(n))){console.warn('[Astral 7.5] Expansion assets missing; no partial houses created');return false;}
  function add(g,name,x,y,z,rotation=0){const model=models.get(name);if(!model)return null;const obj=model.clone(true);obj.position.set(x,y,z);obj.rotation.y=rotation;obj.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});g.add(obj);return obj;}
  positions.forEach(([x,z],i)=>{
   const house=new THREE.Group();house.position.set(x,0,z);house.rotation.y=i%2?Math.PI:0;house.name='MedievalResidence_'+i;root.add(house);
   for(const xx of [-2,0,2]){
    add(house,xx===0?'Wall_Plaster_Door_Round':'Wall_Plaster_Window_Wide_Round',xx,0,3);
    add(house,'Wall_Plaster_Straight',xx,0,-3,Math.PI);
   }
   for(const zz of [-2,0,2]){add(house,'Wall_Plaster_Straight',-3,0,zz,-Math.PI/2);add(house,'Wall_Plaster_Straight',3,0,zz,Math.PI/2);}
   const roof=add(house,'Roof_RoundTiles_6x6',0,3.15,0);if(roof)roof.scale.set(.76,.65,.76);
   if(models.has('DoorFrame_Round_Brick'))add(house,'DoorFrame_Round_Brick',0,0,3.06);
   if(i%3===0){const chimney=add(house,'Prop_Chimney',1.5,3.4,-1.4);if(chimney)chimney.scale.setScalar(.65)}
   footprints.push({x,z,r:3.1});
  });
  console.info('[Astral 7.5] Expanded starter city by',footprints.length,'real glTF houses');return true;
 });
 return {root,ready:loaded,blocked(x,z,radius=.35){return footprints.some(p=>Math.abs(x-p.x)<p.r+radius&&Math.abs(z-p.z)<p.r+radius)}};
}
