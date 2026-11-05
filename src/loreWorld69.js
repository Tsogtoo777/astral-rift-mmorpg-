/** Alpha 6.9.1: lore settlements art pass. Shared geometry/materials; no downloaded assets. */
export const SETTLEMENTS69=Object.freeze([
 {id:'ash',name:'Үнсэн Хөндий',x:-78,z:-55,kind:'village',lore:'Rift-ийн дараа дүрвэгсдийн байгуулсан тосгон'},
 {id:'veil',name:'Нууцат Сүм',x:83,z:70,kind:'temple',lore:'Сүмүүдийн нуусан түүхийг хадгалдаг газар'},
 {id:'border',name:'Хилийн Харуул',x:91,z:-82,kind:'fort',lore:'Хаант улсуудын маргаантай хил'},
 {id:'rift',name:'Ан Цавын Хаяа',x:-91,z:98,kind:'rift',lore:'Тэнгэрийн ан цавын нөлөө шингэсэн нутаг'}
]);
export function settlementDistance69(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
export function createLoreWorld69(THREE,scene){
 const group=new THREE.Group();group.name='AstralLoreOutskirts69';scene.add(group);
 const materials=[];
 const mat=(color,opts={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.86,...opts});materials.push(m);return m};
 const limestone=mat(0x9b9289),darkStone=mat(0x49434e),plaster=mat(0xb5a18d),wood=mat(0x614535),beam=mat(0x392c2b),tile=mat(0x71494a),path=mat(0x8b7a67),grass=mat(0x546f49),gold=mat(0xc9a86b,{metalness:.5,roughness:.35}),riftStone=mat(0x484154),rune=mat(0xb18ef7,{emissive:0x6b3aba,emissiveIntensity:.75}),crystalMat=mat(0x9c74e5,{emissive:0x6534b0,emissiveIntensity:.65,metalness:.2,roughness:.22});
 const geometries=[];
 const geo=(g)=>{geometries.push(g);return g};
 const cube=geo(new THREE.BoxGeometry(1,1,1)),roofGeo=geo(new THREE.ConeGeometry(1,1,4)),pillarGeo=geo(new THREE.CylinderGeometry(1,1,1,8)),crystalGeo=geo(new THREE.OctahedronGeometry(1));
 function mesh(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.receiveShadow=true;parent.add(o);return o}
 function block(g,x,y,z,w,h,d,m){return mesh(g,cube,m,x,y,z,w,h,d)}
 function cone(g,x,y,z,r,h,m){const o=mesh(g,roofGeo,m,x,y,z,r,h,r);o.rotation.y=Math.PI/4;return o}
 function column(g,x,y,z,r,h,m){return mesh(g,pillarGeo,m,x,y,z,r,h,r)}
 function gem(g,x,y,z,size,m=crystalMat){const o=mesh(g,crystalGeo,m,x,y,z,size,size*1.55,size);o.rotation.z=.16;return o}
 function house(g,x,z,s=1){
  block(g,x,1.25*s,z,4.3*s,2.5*s,3.7*s,plaster);
  cone(g,x,3.6*s,z,3.15*s,2.1*s,tile);
  for(const dx of [-1.75,1.75])block(g,x+dx*s,1.5*s,z+1.89*s,.22*s,3*s,.23*s,beam);
  block(g,x,1.13*s,z+1.91*s,.92*s,1.78*s,.18*s,wood);
  for(const dx of [-1.22,1.22])block(g,x+dx*s,2*s,z+1.92*s,.55*s,.62*s,.18*s,darkStone);
  block(g,x,3.2*s,z+1.9*s,3.9*s,.18*s,.23*s,beam);
 }
 function roadBetween(x1,z1,x2,z2){const length=Math.hypot(x2-x1,z2-z1);const road=mesh(group,geo(new THREE.PlaneGeometry(4.4,length)),path,(x1+x2)/2,.015,(z1+z2)/2);road.rotation.x=-Math.PI/2;road.rotation.z=-Math.atan2(x2-x1,z2-z1)}
 for(const p of SETTLEMENTS69){
  const g=new THREE.Group();g.name=p.id;g.position.set(p.x,0,p.z);group.add(g);
  mesh(g,geo(new THREE.CylinderGeometry(17,18,.16,24)),grass,0,-.12,0);
  if(p.kind==='village'){
   for(let i=0;i<9;i++){const a=i*2.399,r=6+(i%3)*3;house(g,Math.cos(a)*r,Math.sin(a)*r,.62+(i%3)*.09)}
   for(let i=0;i<5;i++){const a=i*1.257;column(g,Math.cos(a)*14,.6,Math.sin(a)*14,.15,1.2,wood)}
   block(g,0,.08,0,5,.16,5,path);column(g,0,.7,0,1.3,1.3,limestone);column(g,0,1.45,0,.9,.2,darkStone);
  }
  if(p.kind==='temple'){
   for(const z of [-7,7])block(g,0,1.5,z,15,3,1.5,darkStone);
   block(g,0,1.8,0,12,3.6,11,limestone);
   for(const x of [-5,5])for(const z of [-4,4]){column(g,x,4.3,z,.65,8,limestone);column(g,x,8.45,z,.85,.65,gold)}
   cone(g,0,10,0,7.5,5,darkStone);
   block(g,0,2.5,5.65,2,3,.18,beam);
   for(const x of [-3,3])gem(g,x,5.5,5.8,.48,rune);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;column(g,Math.cos(a)*12,1.8,Math.sin(a)*12,.7,3.6,darkStone)}
  }
  if(p.kind==='fort'){
   for(const x of [-11,11])block(g,x,3,0,2.4,6,25,limestone);
   for(const z of [-11,11])block(g,0,3,z,25,6,2.4,limestone);
   for(const x of [-11,11])for(const z of [-11,11]){
    column(g,x,5.5,z,2.7,11,darkStone);cone(g,x,12,z,3.2,4,tile);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;block(g,x+Math.cos(a)*2.3,10.8,z+Math.sin(a)*2.3,.8,1.3,.8,limestone)}
   }
   house(g,0,0,1.1);
   block(g,0,2,-11.15,3.8,4,.25,beam);
   for(const x of [-2.5,2.5])column(g,x,3.3,-12,.4,6.6,gold);
  }
  if(p.kind==='rift'){
   for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9,r=8.5+(i%2)*2;
    const x=Math.cos(a)*r,z=Math.sin(a)*r,h=3.7+(i%3)*1.8;
    const pillar=column(g,x,h/2,z,.85,h,riftStone);pillar.rotation.z=.13*Math.sin(i*3);
    block(g,x,h*.77,z,1.55,.22,1.55,rune);
    gem(g,x,h+.45,z,.45+(i%2)*.15,rune);
   }
   mesh(g,geo(new THREE.TorusGeometry(5.6,.23,6,32)),rune,0,.18,0).rotation.x=Math.PI/2;
   const core=gem(g,0,6,0,3.2);core.rotation.y=.32;
   for(let i=0;i<6;i++){const a=i*Math.PI/3;gem(g,Math.cos(a)*5.6,1.2,Math.sin(a)*5.6,.65,rune)}
  }
  roadBetween(p.x*.25,p.z*.25,p.x*.84,p.z*.84);
 }
 return {group,settlements:SETTLEMENTS69,dispose(){scene.remove(group);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}};
}
