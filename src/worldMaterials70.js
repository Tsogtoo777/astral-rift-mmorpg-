/** Alpha 7: royalty-free procedural material pass. No remote assets or licensing dependency. */
export function makeWorldMaterials70(THREE){
 const owned=[];
 function texture(seed,base,accent,pattern){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');c.fillStyle=base;c.fillRect(0,0,256,256);
  let n=seed>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
  for(let i=0;i<1800;i++){const v=random();c.fillStyle=accent;c.globalAlpha=.025+v*.16;c.fillRect(random()*256,random()*256,2+random()*13,2+random()*9)}
  c.globalAlpha=.5;c.strokeStyle=accent;c.lineWidth=2;
  if(pattern==='brick'){for(let y=0;y<256;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y/32%2)*32;x<256;x+=64){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+32);c.stroke()}}}
  if(pattern==='wood'){for(let x=0;x<256;x+=22){c.beginPath();c.moveTo(x,0);c.lineTo(x+random()*7,256);c.stroke()}}
  if(pattern==='roof'){for(let y=0;y<256;y+=24){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y/24%2)*20;x<256;x+=40){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+24);c.stroke()}}}
  c.globalAlpha=1;const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;owned.push(t);return t;
 }
 const stone=texture(710, '#afa69b','#5c534c','brick');
 const wood=texture(711,'#74543d','#2b1b15','wood');
 const roof=texture(712,'#785253','#302b35','roof');
 const cobble=texture(713,'#9a9389','#514e4b','brick');
 const grass=texture(714,'#5d7651','#314a31','noise');
 grass.repeat.set(32,32);cobble.repeat.set(2,10);
 return {stone,wood,roof,cobble,grass,dispose(){owned.forEach(t=>t.dispose())}};
}
export function decorateTown70(THREE,town,materials){
 const extras=new THREE.Group();extras.name='Alpha7TownDetail';town.add(extras);
 const beamMat=new THREE.MeshStandardMaterial({map:materials.wood,roughness:.9});
 const windowMat=new THREE.MeshStandardMaterial({color:0xe9b36b,emissive:0xffa64d,emissiveIntensity:.32});
 const stoneMat=new THREE.MeshStandardMaterial({map:materials.stone,roughness:1});
 const geo=new THREE.BoxGeometry(1,1,1);
 function part(g,x,y,z,w,h,d,mat){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o)}
 for(const house of town.children){
  if(house.type!=='Group')continue;
  for(const side of [-1,1]){
   part(house,side*2.15,1.7,2.35,.22,3.3,.24,beamMat);
   part(house,side*1.3,2.1,2.37,.76,.7,.1,windowMat);
   part(house,side*1.3,2.1,2.47,.1,.85,.12,beamMat);
   part(house,side*1.3,2.1,2.47,.88,.1,.12,beamMat);
   part(house,side*1.35,.4,2.36,1.5,.35,.32,stoneMat);
  }
  part(house,0,3.35,2.38,4.6,.26,.3,beamMat);
  part(house,0,.25,2.4,5,.5,.4,stoneMat);
 }
 return extras;
}
