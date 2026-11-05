/** Alpha 6.9 — lore-driven outskirts. Decorative geometry; no NPC/model replacements. */
export const SETTLEMENTS69=Object.freeze([
 {id:'ash',name:'Үнсэн Хөндий',x:-78,z:-55,kind:'village',lore:'Rift-ийн дараа дүрвэгсдийн байгуулсан тосгон'},
 {id:'veil',name:'Нууцат Сүм',x:83,z:70,kind:'temple',lore:'Сүмүүдийн нуусан түүхийг хадгалдаг газар'},
 {id:'border',name:'Хилийн Харуул',x:91,z:-82,kind:'fort',lore:'Хаант улсуудын маргаантай хил'},
 {id:'rift',name:'Ан Цавын Хаяа',x:-91,z:98,kind:'rift',lore:'Тэнгэрийн ан цавын нөлөө шингэсэн нутаг'}
]);
export function settlementDistance69(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
export function createLoreWorld69(THREE,scene){
 const group=new THREE.Group();group.name='AstralLoreOutskirts69';scene.add(group);
 const mat=(color,emissive=0)=>new THREE.MeshStandardMaterial({color,roughness:.88,emissive,emissiveIntensity:emissive?.18:0});
 const stone=mat(0x85828c),timber=mat(0x5d4639),roof=mat(0x5b4256),path=mat(0x8f8170),glow=mat(0x9c77d4,0x4c2187);
 const geoBox=new THREE.BoxGeometry(1,1,1);
 function block(parent,x,y,z,w,h,d,material){const mesh=new THREE.Mesh(geoBox,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function house(parent,x,z,size=1){block(parent,x,1.2*size,z,3.5*size,2.4*size,3*size,stone);const top=new THREE.Mesh(new THREE.ConeGeometry(3.1*size,2.3*size,4),roof);top.rotation.y=Math.PI/4;top.position.set(x,3.45*size,z);parent.add(top);block(parent,x,1.3*size,z+1.55*size,.75*size,1.5*size,.13,timber)}
 function roadBetween(x1,z1,x2,z2){const length=Math.hypot(x2-x1,z2-z1);const road=new THREE.Mesh(new THREE.PlaneGeometry(4.4,length),path);road.rotation.x=-Math.PI/2;road.rotation.z=-Math.atan2(x2-x1,z2-z1);road.position.set((x1+x2)/2,.012,(z1+z2)/2);group.add(road)}
 for(const p of SETTLEMENTS69){
  const settlement=new THREE.Group();settlement.name=p.id;settlement.position.set(p.x,0,p.z);group.add(settlement);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(16,17,.22,16),stone);base.position.y=-.13;settlement.add(base);
  if(p.kind==='village'){for(let i=0;i<9;i++){const a=i*2.399,r=5+(i%3)*3;house(settlement,Math.cos(a)*r,Math.sin(a)*r,.72+(i%3)*.1)}}
  if(p.kind==='temple'){block(settlement,0,2,0,11,4,9,stone);for(const x of [-4,4])for(const z of [-3,3])block(settlement,x,4,z,1.1,8,1.1,stone);const spire=new THREE.Mesh(new THREE.ConeGeometry(3,8,6),roof);spire.position.y=8;settlement.add(spire)}
  if(p.kind==='fort'){for(const x of [-11,11])block(settlement,x,3,0,2,6,24,stone);for(const z of [-11,11])block(settlement,0,3,z,24,6,2,stone);for(const x of [-11,11])for(const z of [-11,11])block(settlement,x,5,z,4,10,4,stone);house(settlement,0,0,1.3)}
  if(p.kind==='rift'){for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const pillar=block(settlement,Math.cos(a)*8,3,Math.sin(a)*8,1.4,6,1.4,glow);pillar.rotation.z=.12*Math.sin(i)}const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(5),glow);crystal.position.y=7;settlement.add(crystal)}
  roadBetween(p.x*.25,p.z*.25,p.x*.84,p.z*.84);
 }
 return {group,settlements:SETTLEMENTS69,dispose(){scene.remove(group);group.traverse(o=>{if(o.isMesh&&o.geometry!==geoBox)o.geometry.dispose()});geoBox.dispose();[stone,timber,roof,path,glow].forEach(m=>m.dispose())}};
}
