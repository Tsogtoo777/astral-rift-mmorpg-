// Astral Rift 4.2: real, licensed glTF architecture. Hero GLBs/rig/animations are untouched.
// Quaternius Medieval Village MegaKit (Standard), CC0 1.0; license in public/architecture/medieval/.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const ARCH42_ASSETS = [
  'Wall_Plaster_Straight','Wall_Plaster_Door_Round','Wall_Plaster_Window_Wide_Round',
  'Wall_UnevenBrick_Straight','Wall_UnevenBrick_Window_Wide_Round',
  'Roof_RoundTiles_6x6','Roof_RoundTiles_4x6','Roof_Front_Brick6',
  'Roof_Dormer_RoundTile','DoorFrame_Round_Brick','DoorFrame_Round_WoodDark',
  'Window_Wide_Round1','WindowShutters_Wide_Round_Open','Corner_Exterior_Wood',
  'Floor_Brick','Prop_Wagon','Prop_Crate','Prop_Chimney','Prop_Vine1',
  'Stairs_Exterior_NoFirstStep','Roof_Tower_RoundTiles','Wall_Plaster_WoodGrid'
];

const HOUSE_LABELS=['ДАРХАН','ДЭН БУУДАЛ','ДЭЛГҮҮР','НОМЫН ДЭЛГҮҮР','АЛХИМИ','ЭДЛЭЛ','УРЧУУД','ХУДАЛДАА'];

export function installArchitecture42({scene,city24,houses09,onStatus=()=>{}}){
  const root=new THREE.Group();root.name='Architecture42RealGLTF';scene.add(root);
  const loader=new GLTFLoader();
  const templates=new Map();
  const sharedMaterials=new Map();
  const houses=[];
  const props=[];
  const collisionProps=[];
  const hallRoofs=[];
  const dungeonRoot=new THREE.Group();dungeonRoot.name='Architecture42DungeonTiles';dungeonRoot.visible=false;scene.add(dungeonRoot);
  let loaded=false;
  const make=(name,parent,x=0,y=0,z=0,ry=0)=>{
    const source=templates.get(name) || (name==='Roof_RoundTiles_4x6'?templates.get('Roof_RoundTiles_6x6'):null) || (name.startsWith('Wall_UnevenBrick_')?templates.get(name.replace('Wall_UnevenBrick_','Wall_Plaster_')):null);
    if(!source)return null;
    const model=source.clone(true);
    model.position.set(x,y,z);model.rotation.y=ry;
    model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
    parent.add(model);return model;
  };
  function sign(parent,label){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#253444';ctx.fillRect(0,0,512,128);
    ctx.strokeStyle='#d6af69';ctx.lineWidth=10;ctx.strokeRect(6,6,500,116);
    ctx.font='bold 43px sans-serif';ctx.fillStyle='#f7e6c3';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(label,256,65,476);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.35,.58),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
    mesh.position.set(0,3.15,3.2);parent.add(mesh);
  }
  function buildHouse(x,z,index){
    const g=new THREE.Group();g.name=`MedievalHouse_${index+1}`;g.position.set(x,0,z);
    // 2m-wide authored wall modules form a 6x6m house. The 0.83 scale preserves
    // the original 2.5.1 doorway/solid footprint and therefore old quest/interior triggers.
    g.scale.set(.83,1.12,.83);root.add(g);
    const brick=index%3===1;
    const straight=brick?'Wall_UnevenBrick_Straight':'Wall_Plaster_Straight';
    const window=brick?'Wall_UnevenBrick_Window_Wide_Round':'Wall_Plaster_Window_Wide_Round';
    for(const xx of [-2,0,2]){
      make(xx===0?'Wall_Plaster_Door_Round':window,g,xx,0,3);
      make(xx===0?straight:window,g,xx,0,-3,Math.PI);
    }
    for(const zz of [-2,0,2]){
      make(zz===0?window:straight,g,-3,0,zz,-Math.PI/2);
      make(zz===0?window:straight,g,3,0,zz,Math.PI/2);
    }
    for(const xx of [-3,3])for(const zz of [-3,3])make('Corner_Exterior_Wood',g,xx,0,zz);
    for(const xx of [-2,0,2])for(const zz of [-2,0,2])make('Floor_Brick',g,xx,.04,zz);
    const roof=make(index%4===3?'Roof_RoundTiles_4x6':'Roof_RoundTiles_6x6',g,0,3.25,0);
    if(roof)roof.scale.set(index%4===3?.79:.76,.62,index%4===3?.76:.76);
    make(index%2===0?'DoorFrame_Round_Brick':'DoorFrame_Round_WoodDark',g,0,0,3.09);
    if(index%2===0){
      const dormer=make('Roof_Dormer_RoundTile',g,-.6,4.05,1.55);
      if(dormer)dormer.scale.set(.65,.65,.65);
    }
    if(index%3!==2){const chimney=make('Prop_Chimney',g,1.65,3.5,-1.55);if(chimney)chimney.scale.set(.65,.65,.65)}
    if(index%2===1){const vine=make('Prop_Vine1',g,-2.5,1.2,3.14);if(vine)vine.scale.set(.7,.7,.7)}
    make('Stairs_Exterior_NoFirstStep',g,0,0,3.85);
    sign(g,HOUSE_LABELS[index]);
    houses.push({g,x,z});
  }
  function prop(name,x,z,rotation=0,scale=1){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);root.add(g);
    make(name,g);props.push(g);return g;
  }
  function dressHall(cx,cz){
    // Authored plaster/stone facades over the original physical hall walls;
    // no collision or quest changes, and the center doorway remains walkable.
    const g=new THREE.Group();g.name='MedievalGuildFacade';g.position.set(cx,0,cz);root.add(g);
    for(const x of [-4,-2,0,2,4]){
      if(x!==0)make('Wall_Plaster_Window_Wide_Round',g,x,0,-4.62);
      make('Wall_Plaster_Straight',g,x,0,4.62,Math.PI);
    }
    for(const z of [-4,-2,0,2,4]){
      make('Wall_Plaster_Straight',g,-5.1,0,z,-Math.PI/2);
      make('Wall_Plaster_Straight',g,5.1,0,z,Math.PI/2);
    }
    // Wall assets are 3m tall; stretch only the vertical axis to meet 5.5m hall walls.
    g.scale.y=1.83;
    const roof=make('Roof_RoundTiles_6x6',g,0,3.07,0);
    if(roof){roof.scale.set(1.3,.44,1.3);hallRoofs.push({roof,cx,cz});}
  }
  function dressDungeon(){
    // The old boss logic, arena limits and exit remain untouched.
    for(const x of [42,44,46,48,50,52,54])for(const z of [-54,-52,-50,-48,-46,-44,-42]){
      if(Math.hypot(x-48,z+48)>9.1)continue;
      const tile=make('Floor_Brick',dungeonRoot,x,.012,z);
      if(tile)tile.receiveShadow=true;
    }
  }
  function decorate(){
    // Off the main road: no invisible barriers in the quest/portal corridor.
    prop('Prop_Wagon',-23,-17,Math.PI/2,.9);
    prop('Prop_Wagon',24,-18,-Math.PI/2,.9);
    for(const [x,z] of [[-17,-16],[-16,-17],[22,-17],[25,-16],[-23,4]])prop('Prop_Crate',x,z,0,.85);
    collisionProps.push({x:-23,z:-17,w:2.5,d:3.5},{x:24,z:-18,w:2.5,d:3.5});
  }
  const required=['Wall_Plaster_Straight','Wall_Plaster_Door_Round','Wall_Plaster_Window_Wide_Round','Roof_RoundTiles_6x6','Floor_Brick'];
  // Four parallel downloads prevent 22 simultaneous PBR texture decodes on phones.
  let nextAsset=0;
  const assetResults=new Array(ARCH42_ASSETS.length);
  async function loadWorker(){
    while(nextAsset<ARCH42_ASSETS.length){
      const index=nextAsset++;
      const name=ARCH42_ASSETS[index];
      try{await loadOne(name);assetResults[index]={status:'fulfilled',value:name};}
      catch(reason){assetResults[index]={status:'rejected',reason};}
    }
  }
  async function loadOne(name){
    const gltf=await loader.loadAsync(`/architecture/medieval/${name}.gltf`);
    if(!gltf?.scene)throw new Error(`Empty scene: ${name}`);
    // All modules use the same small set of named PBR materials. Sharing those
    // materials avoids duplicating large 1024px textures in mobile GPU memory.
    gltf.scene.traverse(o=>{
      if(!o.isMesh)return;
      const unify=m=>{
        if(!m?.name)return m;
        if(sharedMaterials.has(m.name))return sharedMaterials.get(m.name);
        sharedMaterials.set(m.name,m);return m;
      };
      o.material=Array.isArray(o.material)?o.material.map(unify):unify(o.material);
    });
    templates.set(name,gltf.scene);
    return name;
  }
  const ready=Promise.all(Array.from({length:4},()=>loadWorker())).then(()=>{
    const results=assetResults;
    const failed=ARCH42_ASSETS.filter((_,i)=>results[i].status==='rejected');
    const missing=required.filter(n=>!templates.has(n));
    if(missing.length){onStatus(`⚠ 3D архитектур ачаалагдсангүй (${missing.join(', ')})`);return {ok:false,failed,missing,houses:0};}
    // Atomic replacement: retain the old town until all essential real assets load.
    houses09.forEach(([x,z],i)=>buildHouse(x,z,i));
    decorate();
    dressHall(27,15);dressHall(-27,15);dressDungeon();
    city24.children.slice(0,houses09.length).forEach(g=>{g.visible=false;});
    loaded=true;
    onStatus(`🏘 ${houses.length} байшинг бодит glTF модульд шилжүүллээ`);
    if(failed.length)console.warn('Astral Rift: optional medieval assets failed',failed);
    return {ok:true,failed,missing:[],houses:houses.length};
  }).catch(err=>{console.error('Astral Rift architecture42',err);onStatus('⚠ 3D архитектурын алдаа; хуучин байшин хэвээр');return {ok:false,error:String(err),houses:0};});
  function blocked(x,z){
    if(!loaded)return false;
    return collisionProps.some(p=>Math.abs(x-p.x)<p.w/2+.38&&Math.abs(z-p.z)<p.d/2+.38);
  }
  // Lightweight camera collision using the actual authored house footprints, not a
  // per-frame raycast through hundreds of textured meshes on a mobile GPU.
  function cameraCollision(target,desired){
    if(!loaded)return;
    const dx=desired.x-target.x,dy=desired.y-target.y,dz=desired.z-target.z;
    let earliest=1;
    for(const h of houses){
      const bounds=[[h.x-2.65,h.x+2.65,target.x,dx],[.02,6.9,target.y,dy],[h.z-2.65,h.z+2.65,target.z,dz]];
      let tmin=0,tmax=1,hit=true;
      for(const [min,max,start,delta] of bounds){
        if(Math.abs(delta)<1e-8){if(start<min||start>max){hit=false;break}continue}
        const a=(min-start)/delta,b=(max-start)/delta;
        tmin=Math.max(tmin,Math.min(a,b));tmax=Math.min(tmax,Math.max(a,b));
        if(tmin>tmax){hit=false;break}
      }
      if(hit&&tmin>.02&&tmin<earliest)earliest=tmin;
    }
    if(earliest<1){const t=Math.max(.13,earliest-.07);desired.set(target.x+dx*t,target.y+dy*t,target.z+dz*t)}
  }
  let lastVisibility=-1;
  function update(now,playerPosition,isInterior,isDungeon,isCastle){
    if(!loaded||now-lastVisibility<350)return;
    lastVisibility=now;
    root.visible=!isInterior&&!isDungeon&&!isCastle&&Math.hypot(playerPosition.x,playerPosition.z)<95;
    dungeonRoot.visible=isDungeon;
    for(const {roof,cx,cz} of hallRoofs){
      roof.visible=!(Math.abs(playerPosition.x-cx)<4.7&&Math.abs(playerPosition.z-cz)<4.7);
    }
  }
  return {root,dungeonRoot,ready,blocked,cameraCollision,update,get loaded(){return loaded},get houseCount(){return houses.length}};
}
