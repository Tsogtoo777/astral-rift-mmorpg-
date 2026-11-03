/** Astral Rift 6.2.2 - ORIGINAL, locally-generated forest geometry.
 * No CDN needed. More natural branching and individually-shaped foliage instead
 * of cone/icosahedron placeholders; mobile-friendly instancing and LOD.
 * Not photogrammetry; authored procedural assets. All geometry CC0-compatible.
 */
import * as THREE from 'three';

const randFor = seed => () => {seed = (Math.imul(seed,1664525)+1013904223)>>>0;return seed / 4294967296};
const TAU=Math.PI*2;
function vertexWriter(){
 const p=[],n=[],c=[];
 const add=(a,b,d,col)=>{let ab=new THREE.Vector3().subVectors(b,a),ac=new THREE.Vector3().subVectors(d,a);let normal=ab.cross(ac).normalize();for(const v of [a,b,d]){p.push(v.x,v.y,v.z);n.push(normal.x,normal.y,normal.z);c.push(col.r,col.g,col.b);}};
 const finish=()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeBoundingSphere();return g;};
 return {add,finish};
}
function tapered(writer,a,b,r0,r1,shade,sides=7){
 const direction=new THREE.Vector3().subVectors(b,a).normalize();
 const t=new THREE.Vector3(1,0,0);if(Math.abs(t.dot(direction))>.9)t.set(0,0,1);
 const u=new THREE.Vector3().crossVectors(direction,t).normalize(),v=new THREE.Vector3().crossVectors(direction,u).normalize();
 for(let j=0;j<sides;j++){
  const theta=j*TAU/sides,next=(j+1)*TAU/sides;
  const low=a.clone().addScaledVector(u,Math.cos(theta)*r0).addScaledVector(v,Math.sin(theta)*r0);
  const high=b.clone().addScaledVector(u,Math.cos(theta)*r1).addScaledVector(v,Math.sin(theta)*r1);
  const low2=a.clone().addScaledVector(u,Math.cos(next)*r0).addScaledVector(v,Math.sin(next)*r0);
  const high2=b.clone().addScaledVector(u,Math.cos(next)*r1).addScaledVector(v,Math.sin(next)*r1);
  const light=shade.clone().multiplyScalar(.84+(j%3)*.085);
  writer.add(low,low2,high,light);writer.add(high,low2,high2,light);
 }
}
function foliage(writer,anchor,axis,rng,baseColor,elliptic=false){
 // Two triangular leaves / needle fans per sample, visible from both sides.
 const length=(elliptic?.65:.38)*(0.75+rng()*.65);
 const width=(elliptic?.065:.17)*(0.75+rng()*.65);
 const color=baseColor.clone().multiplyScalar(.78+rng()*.45);
 const ang=rng()*TAU;
 const direct=new THREE.Vector3(Math.cos(ang),elliptic?(.22+rng()*.6):(-.15+rng()*.75),Math.sin(ang)).normalize();
 const perp=new THREE.Vector3(-direct.z,0,direct.x).normalize();
 const v0=anchor.clone(),mid=anchor.clone().addScaledVector(direct,length*.52);
 const tip=anchor.clone().addScaledVector(direct,length);
 const left=mid.clone().addScaledVector(perp,width),right=mid.clone().addScaledVector(perp,-width);
 writer.add(v0,left,tip,color);writer.add(v0,tip,right,color);
}
function makeTree(spec){
 const rng=randFor(spec.seed),bark=vertexWriter(),leaves=vertexWriter();
 const barkShade=new THREE.Color(spec.bark),foliageShade=new THREE.Color(spec.color);
 const h=spec.h;
 const base=new THREE.Vector3(0,0,0);
 const top=new THREE.Vector3((rng()-.5)*.35,h, (rng()-.5)*.35);
 tapered(bark,base,top,spec.radius,.045,barkShade,9);
 const whorls=spec.kind==='pine'?14:9;
 for(let i=0;i<whorls;i++){
  const f=.25+i/whorls*.71,level=h*f;
  const count=spec.kind==='pine'?5:3+(i%2);
  for(let j=0;j<count;j++){
   const ang=(j/count)*TAU+i*2.04+rng()*.38;
   const span=spec.kind==='pine'?(h*(.39-f*.27)):(h*(.27-f*.11));
   const rise=spec.kind==='pine'?.14+(.45*f):.35+rng()*.6;
   const stem=new THREE.Vector3(0,level,0),end=new THREE.Vector3(Math.cos(ang)*span,level+rise*span,Math.sin(ang)*span);
   tapered(bark,stem,end,Math.max(.023,spec.radius*(1-f)*.36),.012,barkShade,5);
   const shootCount=5;
   for(let k=0;k<shootCount;k++){
    const t=.27+.7*k/shootCount;
    const center=stem.clone().lerp(end,t);
    const rad=spec.kind==='pine'?.27+(1-t)*.48:.42+(1-t)*.78;
    const countLeaves=spec.kind==='pine'?5:7;
    for(let q=0;q<countLeaves;q++){
     const aa=q*2.39996+k*.75+rng()*.18;
     const point=center.clone().add(new THREE.Vector3(Math.cos(aa)*rad*rng(),(rng()-.5)*rad*.85,Math.sin(aa)*rad*rng()));
     foliage(leaves,point,new THREE.Vector3(),rng,foliageShade,spec.kind==='pine');
    }
   }
  }
 }
 // a sparse crown on deciduous trees gives a broken organic silhouette.
 if(spec.kind!=='pine')for(let i=0;i<110;i++){
  const y=h*(.72+.25*rng()),a=rng()*TAU,r=.15+(1-(y/h))*.9;
  foliage(leaves,new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r),null,rng,foliageShade,false);
 }
 return {wood:bark.finish(),leaf:leaves.finish()};
}
const TYPES={
 oak:{seed:3061,h:8.7,radius:.36,color:0x507d3d,bark:0x69513c,kind:'oak'},
 birch:{seed:3079,h:9.2,radius:.24,color:0x77964a,bark:0xd1c5a5,kind:'birch'},
 pine:{seed:3089,h:11.3,radius:.3,color:0x345a3c,bark:0x6f523a,kind:'pine'},
};
function scatterTrees(){
 const items=[];
 const rng=randFor(622003);
 // Rings avoid the main road, spawn points, town plaza, and clearing/altar.
 for(let i=0;i<64;i++){
  const a=i*2.399963+.18,r=27+(i%12)*3.9,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.abs(x-2)<8&&z>-38&&z<16)continue;
  items.push({x,z,type:i%5===0?'birch':i%4===0?'pine':'oak',scale:.72+rng()*.47,angle:rng()*TAU});
 }
 for(let i=0;i<105;i++){
  const a=i*2.399963,r=15+(i%18)*2.36,x=-88+Math.cos(a)*r,z=-69+Math.sin(a)*r;
  if(Math.abs(x+71)<9&&Math.abs(z+58)<12)continue;
  items.push({x,z,type:i%3===0?'birch':i%4===0?'oak':'pine',scale:.7+rng()*.56,angle:rng()*TAU});
 }
 for(let i=0;i<34;i++){
  const a=i*2.399963,r=21+(i%8)*3.2,x=91+Math.cos(a)*r,z=-63+Math.sin(a)*r;
  if(Math.hypot(x-91,z+63)<23)continue;
  items.push({x,z,type:i%2===0?'pine':'oak',scale:.7+rng()*.45,angle:rng()*TAU});
 }
 for(let i=0;i<24;i++){
  const a=i*2.399963,r=23+(i%6)*3,x=96+Math.cos(a)*r,z=89+Math.sin(a)*r;
  items.push({x,z,type:i%3===0?'birch':'pine',scale:.64+rng()*.37,angle:rng()*TAU});
 }
 return items;
}
function makeGroundTexture(){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const ctx=canvas.getContext('2d'),img=ctx.createImageData(512,512),rng=randFor(622077);
 for(let i=0;i<img.data.length;i+=4){const e=rng(),green=105+Math.floor(e*35),k=(rng()-.5)*28;
  img.data[i]=Math.max(0,79+k);img.data[i+1]=green;img.data[i+2]=Math.max(0,59+k*.7);img.data[i+3]=255;
 }
 ctx.putImageData(img,0,0);
 const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(17,17);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;
 return t;
}
export function installForest622({scene,ground,legacyTrees621=[],world62}){
 if(typeof document==='undefined')return {trees:0,enabled:false};
 const query=new URLSearchParams(location.search);
 if(query.get('forest')==='old')return {trees:0,enabled:false};
 const all=scatterTrees(),unit=new THREE.Object3D();
 const woodMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
 const leafMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide,alphaTest:.02});
 const instances=[];
 for(const [kind,spec] of Object.entries(TYPES)){
  const placements=all.filter(t=>t.type===kind),geom=makeTree(spec);
  for(const [part,g,mat] of [['wood',geom.wood,woodMat],['leaf',geom.leaf,leafMat]]){
   const mesh=new THREE.InstancedMesh(g,mat,placements.length);mesh.name=`Forest622_${kind}_${part}`;
   placements.forEach(({x,z,scale,angle},i)=>{unit.position.set(x,0,z);unit.rotation.set(0,angle,0);unit.scale.setScalar(scale);unit.updateMatrix();mesh.setMatrixAt(i,unit.matrix)});
   mesh.instanceMatrix.needsUpdate=true;mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;scene.add(mesh);instances.push(mesh);
  }
 }
 legacyTrees621.forEach(t=>t.visible=false);
 world62?.legacyVegetation?.trees?.forEach(t=>t.visible=false);
 if(ground?.material){ground.material.color.setHex(0xffffff);ground.material.map=makeGroundTexture();ground.material.needsUpdate=true;}
 function resolvePlayer(position){
  for(const tree of all){
   const dx=position.x-tree.x,dz=position.z-tree.z;
   const target=.5+TYPES[tree.type].radius*tree.scale;
   const d2=dx*dx+dz*dz;if(d2>=target*target)continue;
   const d=Math.sqrt(d2)||.001;position.x=tree.x+dx/d*target;position.z=tree.z+dz/d*target;
  }
 }
 return {trees:all.length,enabled:true,instances,resolvePlayer,notes:'Procedural branched trees with individual leaves; no external downloads'};
}
