/** Astral Rift Alpha 6.2 — outdoor expansion. All world data deterministic.
 * No network, no gameplay state, no new WebGL canvas; call once per scene.
 * Existing central town, NPCs, dungeons and authored GLBs remain untouched.
 */
export const WORLD62_RADIUS = 155;
export const ZONES62 = Object.freeze([
  {id:'town',name:'Эхлэл хот',x:0,z:0,r:33,level:'Safe'},
  {id:'forest',name:'Шидэт ойн гүн',x:-88,z:-69,r:37,level:'Lv.3–7'},
  {id:'camp',name:'Гоблиний хуаран',x:91,z:-63,r:37,level:'Lv.5–12'},
  {id:'ruins',name:'Эртний балгас',x:96,z:89,r:32,level:'Lv.10–15'},
]);
// Total when added to the existing 6.1.8 originals: 8 wolves + 13 goblins.
export const SPAWN_SITES62 = Object.freeze([
  // Seven more wolves. Keep a clear passage to the grove at (-36,-43).
  {id:'w01',kind:'wolf',tier:'normal',x:-62,z:-57,level:3,hp:90},
  {id:'w02',kind:'wolf',tier:'normal',x:-75,z:-78,level:4,hp:100},
  {id:'w03',kind:'wolf',tier:'normal',x:-89,z:-53,level:4,hp:100},
  {id:'w04',kind:'wolf',tier:'normal',x:-105,z:-73,level:5,hp:115},
  {id:'w05',kind:'wolf',tier:'normal',x:-106,z:-95,level:6,hp:120},
  {id:'w06',kind:'wolf',tier:'normal',x:-71,z:-96,level:6,hp:120},
  {id:'w07',kind:'wolf',tier:'fast',x:-94,z:-114,level:7,hp:145},
  // Twelve more goblins. Existing original is the first Raider.
  {id:'g01',kind:'goblin',tier:'scout',x:63,z:-57,level:5,hp:105},
  {id:'g02',kind:'goblin',tier:'scout',x:76,z:-43,level:5,hp:105},
  {id:'g03',kind:'goblin',tier:'scout',x:80,z:-91,level:5,hp:105},
  {id:'g04',kind:'goblin',tier:'scout',x:110,z:-51,level:6,hp:115},
  {id:'g05',kind:'goblin',tier:'scout',x:111,z:-81,level:6,hp:115},
  {id:'g06',kind:'goblin',tier:'raider',x:88,z:-37,level:7,hp:150},
  {id:'g07',kind:'goblin',tier:'raider',x:115,z:-39,level:7,hp:150},
  {id:'g08',kind:'goblin',tier:'raider',x:118,z:-95,level:8,hp:160},
  {id:'g09',kind:'goblin',tier:'raider',x:70,z:-110,level:8,hp:160},
  {id:'g10',kind:'goblin',tier:'elite',x:100,z:-104,level:10,hp:300},
  {id:'g11',kind:'goblin',tier:'elite',x:126,z:-72,level:10,hp:300},
  {id:'g12',kind:'goblin',tier:'chief',x:91,z:-68,level:12,hp:650},
]);
export function zoneAt62(x,z){
  const outdoor=ZONES62.slice(1);
  let zone=ZONES62[0],dmin=33;
  for(const z0 of outdoor){const d=Math.hypot(x-z0.x,z-z0.z);if(d<z0.r&&d<dmin+20){zone=z0;dmin=d;}}
  if(zone.id==='town'&&Math.hypot(x,z)>33)return {id:'wilderness',name:'Зэрлэг тал',level:'Wild'};
  return zone;
}
// One scene graph and instanced vegetation; important for mobile draw-call budget.
export function createWorld62({THREE,scene}){
  const root=new THREE.Group();root.name='WorldExpansion62';scene.add(root);
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.94,...extra});
  const pine=mat(0x275847),pineAlt=mat(0x3c7551),wood=mat(0x67482f),stone=mat(0x88877d),earth=mat(0x746345),
    moss=mat(0x486d4b),rust=mat(0x94543d),gold=mat(0xc5a767),crystal=mat(0x7d9acb,{emissive:0x2a477a,emissiveIntensity:.34});
  const circle=new THREE.CircleGeometry(1,40);
  for(const [x,z,sx,sz,m] of [[-88,-72,57,49,moss],[91,-67,49,47,earth],[96,89,43,39,stone]]){
    const land=new THREE.Mesh(circle,m);land.rotation.x=-Math.PI/2;land.position.set(x,.012,z);land.scale.set(sx,sz,1);land.receiveShadow=true;root.add(land);
  }
  const unit=new THREE.Object3D();
  function instanced(geo,material,transforms){
    const mesh=new THREE.InstancedMesh(geo,material,transforms.length);mesh.frustumCulled=false;
    transforms.forEach(([x,y,z,sx,sy,sz,ry=0],i)=>{unit.position.set(x,y,z);unit.rotation.set(0,ry,0);unit.scale.set(sx,sy,sz);unit.updateMatrix();mesh.setMatrixAt(i,unit.matrix)});
    mesh.instanceMatrix.needsUpdate=true;root.add(mesh);return mesh;
  }
  const trunks=[],crowns=[],boulders=[];
  for(let i=0;i<78;i++){
    const a=i*2.399963,r=14+(i%13)*2.35;
    const x=-88+Math.cos(a)*r,z=-69+Math.sin(a)*r;
    if(Math.abs(x+73)<7&&Math.abs(z+62)<12)continue;
    const h=2.8+(i%6)*.4;
    trunks.push([x,h/2,z,.32,h,.32,i*.3]);crowns.push([x,h+.9,z,1.45,2.4,1.45,i*.3]);
    if(i%3===0)boulders.push([x+2,.4,z-2,.75,.65,.65,i*.31]);
  }
  for(let i=0;i<38;i++){
    const a=i*2.399963,r=17+(i%5)*6;
    const x=96+Math.cos(a)*r,z=89+Math.sin(a)*r;
    if(i%2===0)boulders.push([x,.5,z,1.4,1.15,1.05,i*.5]);
  }
  instanced(new THREE.CylinderGeometry(1,1,1,6),wood,trunks);
  instanced(new THREE.ConeGeometry(1,1,7),pine,crowns);
  instanced(new THREE.IcosahedronGeometry(1,0),stone,boulders);
  function obj(geo,material,x,y,z,rotation=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.rotation.y=rotation;m.castShadow=false;m.receiveShadow=true;root.add(m);return m}
  function plankRoad(a,b,width=5){
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
    const m=obj(new THREE.PlaneGeometry(width,length),earth,(a[0]+b[0])/2,.022,(a[1]+b[1])/2);
    m.rotation.x=-Math.PI/2;m.rotation.z=Math.atan2(dx,dz);return m;
  }
  // Paths deliberately run outside existing village collision footprints.
  plankRoad([-31,-38],[-59,-53],4.1);plankRoad([-59,-53],[-88,-69],4.1);
  plankRoad([40,-52],[65,-57],4.2);plankRoad([65,-57],[91,-63],5);
  plankRoad([40,40],[70,63],4.3);plankRoad([70,63],[96,89],4.3);
  // Camp palisade in a horseshoe, open towards the western approach.
  for(let i=0;i<23;i++){
    const theta=-1.15+i*5.1/22,x=91+16*Math.cos(theta),z=-63+16*Math.sin(theta);
    obj(new THREE.CylinderGeometry(.46,.53,3.5,5),wood,x,1.75,z,theta);
  }
  for(const [x,z,angle] of [[82,-55,.25],[100,-73,-.5],[99,-51,.5]]){
    obj(new THREE.ConeGeometry(4.1,3.3,4),rust,x,2.0,z,Math.PI/4+angle);
    obj(new THREE.CylinderGeometry(2.35,2.5,.4,7),wood,x,.2,z);
  }
  obj(new THREE.CylinderGeometry(1.2,1.4,.45,9),stone,91,.23,-63);
  obj(new THREE.ConeGeometry(.8,2,7),mat(0xe69b46,{emissive:0x98400c,emissiveIntensity:.8}),91,1.3,-63);
  // Old ruins: broken pillars around a dormant teleport/quest altar.
  for(let i=0;i<9;i++){
    const a=i*2*Math.PI/9,x=96+13*Math.cos(a),z=89+13*Math.sin(a),h=2.6+(i%4)*.7;
    obj(new THREE.CylinderGeometry(.65,.8,h,8),stone,x,h/2,z,a);
    obj(new THREE.BoxGeometry(1.8,.3,1.8),stone,x,h+.15,z,a);
  }
  obj(new THREE.CylinderGeometry(3.2,3.5,.65,12),stone,96,.33,89);
  obj(new THREE.OctahedronGeometry(1.1),crystal,96,2.7,89);
  function sign(s,x,z){const cv=document.createElement('canvas');cv.width=512;cv.height=128;
    const c=cv.getContext('2d');c.fillStyle='#172d30';c.fillRect(0,0,512,128);c.strokeStyle='#d9b877';c.lineWidth=8;c.strokeRect(5,5,502,118);
    c.fillStyle='#f4e6bc';c.font='bold 35px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(s,256,64,465);
    const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
    obj(new THREE.BoxGeometry(.14,2.6,.14),wood,x,1.3,z);obj(new THREE.PlaneGeometry(4,1),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),x,3,z);
  }
  sign('ШИДЭТ ОЙ',-63,-53);sign('ГОБЛИНИЙ ХУАРАН',66,-56);sign('ЭРТНИЙ БАЛГАС',77,67);
  return {root,zones:ZONES62,spawnSites:SPAWN_SITES62};
}
