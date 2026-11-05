// Astral Rift 8.1 — region art pass. Real Quaternius glTF geometry only.
// The original lore groups remain visible until the replacement assets load.
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function installRegionArchitecture81(THREE,scene,loreWorld){
  const root=new THREE.Group();root.name='RegionArchitecture81';scene.add(root);
  const loader=new GLTFLoader();
  const specs=[
    ['Wall_Plaster_Straight','/architecture/medieval/'],
    ['Wall_Plaster_Door_Round','/architecture/medieval/'],
    ['Wall_Plaster_Window_Wide_Round','/architecture/medieval/'],
    ['Roof_RoundTiles_6x6','/architecture/medieval/'],
    ['Prop_Chimney','/architecture/medieval/'],
    ['Wall_UnevenBrick_Straight','/architecture/medieval/'],
    ['Floor_Brick','/architecture/medieval/'],
    // Kenney Castle Kit CC0: optional until its selected GLBs are committed.
    ['wall','/architecture/castle/'],['wall-corner','/architecture/castle/'],
    ['tower-square','/architecture/castle/'],['gate','/architecture/castle/']
  ];
  const models=new Map(), footprint=[];
  function place(parent,name,x,y,z,scale=1,rot=0){
    const template=models.get(name);if(!template)return null;
    const o=template.clone(true);o.position.set(x,y,z);o.rotation.y=rot;o.scale.setScalar(scale);
    o.traverse(n=>{if(n.isMesh){n.castShadow=false;n.receiveShadow=true}});
    parent.add(o);return o;
  }
  function group(name,x,z){const g=new THREE.Group();g.name=name;g.position.set(x,0,z);root.add(g);return g;}
  function house(g,x,z,rotation=0,scale=1){
    const h=new THREE.Group();h.position.set(x,0,z);h.rotation.y=rotation;h.scale.setScalar(scale);g.add(h);
    for(const dx of [-2,0,2]){
      place(h,dx===0?'Wall_Plaster_Door_Round':'Wall_Plaster_Window_Wide_Round',dx,0,3);
      place(h,'Wall_Plaster_Straight',dx,0,-3,1,Math.PI);
    }
    for(const dz of [-2,0,2]){
      place(h,'Wall_Plaster_Straight',-3,0,dz,1,-Math.PI/2);
      place(h,'Wall_Plaster_Straight',3,0,dz,1,Math.PI/2);
    }
    const roof=place(h,'Roof_RoundTiles_6x6',0,3.1,0,.77);
    if(roof)roof.scale.y=.62;
    if(Math.round(x+z)%3===0)place(h,'Prop_Chimney',1.3,3.3,-1.4,.65);
    footprint.push({x:g.position.x+x,z:g.position.z+z,r:3.1*scale});
  }
  function replaceOld(id){
    const old=loreWorld.group.children.find(c=>c.name===id);
    if(old)old.visible=false;
  }
  function buildVillage(){
    const g=group('AshValley81',-78,-55);
    [[-11,-8,0],[-3,-10,0],[6,-10,0],[13,-5,-Math.PI/2],
      [-13,5,Math.PI/2],[-5,8,Math.PI],[5,9,Math.PI],[13,7,-Math.PI/2]]
      .forEach(([x,z,a])=>house(g,x,z,a,.85));
    for(const [x,z] of [[-8,-1],[0,-1],[8,-1]])place(g,'Floor_Brick',x,.02,z,1.1);
    replaceOld('ash');
  }
  function buildTemple(){
    const g=group('VeiledTemple81',83,70);
    // Ancient stone sanctuary: authored brick wall modules, not primitive blocks.
    for(const x of [-6,-3,0,3,6]){
      place(g,'Wall_UnevenBrick_Straight',x,0,-7,1,Math.PI);
      if(Math.abs(x)>2)place(g,'Wall_UnevenBrick_Straight',x,0,7);
    }
    for(const z of [-4,-1,2,5]){
      place(g,'Wall_UnevenBrick_Straight',-7,0,z,1,-Math.PI/2);
      place(g,'Wall_UnevenBrick_Straight',7,0,z,1,Math.PI/2);
    }
    for(const x of [-4,0,4])for(const z of [-3,1,5])place(g,'Floor_Brick',x,.02,z);
    replaceOld('veil');
  }
  function buildFort(){
    if(!['wall','wall-corner','tower-square','gate'].every(n=>models.has(n)))return false;
    const g=group('BorderWatchCastle81',91,-82);
    for(const x of [-12,-8,-4,4,8,12]){
      place(g,'wall',x,0,-12);
      place(g,'wall',x,0,12,1,Math.PI);
    }
    for(const z of [-8,-4,0,4,8]){
      place(g,'wall',-12,0,z,1,Math.PI/2);
      place(g,'wall',12,0,z,1,-Math.PI/2);
    }
    for(const x of [-12,12])for(const z of [-12,12])place(g,'tower-square',x,0,z);
    place(g,'gate',0,0,-12);
    house(g,0,2,0,.75);
    replaceOld('border');return true;
  }
  const ready=(async()=>{
    // Sequential loading avoids decoding all PBR textures on mobile at once.
    for(const [name,base] of specs){
      try{const asset=await loader.loadAsync(base+name+(base.includes('/castle/')?'.glb':'.gltf'));models.set(name,asset.scene)}
      catch(err){console.info('[Astral 8.1] optional asset unavailable',name);}
    }
    const village=['Wall_Plaster_Straight','Wall_Plaster_Door_Round','Wall_Plaster_Window_Wide_Round','Roof_RoundTiles_6x6'].every(n=>models.has(n));
    if(village)buildVillage();
    if(models.has('Wall_UnevenBrick_Straight')&&models.has('Floor_Brick'))buildTemple();
    const fort=buildFort();
    return {village,temple:models.has('Wall_UnevenBrick_Straight')&&models.has('Floor_Brick'),fort,assets:models.size};
  })();
  return {root,ready,blocked(x,z,r=.35){return footprint.some(p=>Math.abs(x-p.x)<p.r+r&&Math.abs(z-p.z)<p.r+r)}};
}
