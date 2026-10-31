import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import './style.css';
const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><strong>✦ ASTRAL RIFT <small>ALPHA 2.2</small></strong><div class="bar"><div id="hpbar"></div></div><div class="expbar"><div id="expfill"></div></div><div id="stats"></div><div id="target">Бай: байхгүй</div><div id="hint">WASD хөдөлгөөн • хулганаар камер • click довтлох • X зэвсэг солих • Space бултах • Tab бай сонгох • 1–3 чадвар</div></div><div id="questbox">✦ <b>Саруулын даалгавар</b><div id="questtext">Саруултай уулзаарай</div></div><div id="minimap"><div id="maparrow">▲</div><span>Эхлэл хот</span></div><div id="cross">✧</div><div id="mobile"><div id="pad"><div id="stick"></div></div><div id="actions"><button id="attack">⚔</button><button id="dodge">↝</button><button id="switch">⇄</button><button id="lock">◎</button><button id="skill1">1</button><button id="skill2">2</button><button id="skill3">3</button></div></div><div id="toast"></div>`;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x99cde4);scene.fog=new THREE.FogExp2(0xb6d8db,.009);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;app.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdcecff,0x6a5845,2.4));const sun=new THREE.DirectionalLight(0xffe5b0,2);sun.position.set(-22,36,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x6a895b,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function trunk(x,z){const t=new THREE.Mesh(new THREE.CylinderGeometry(.27,.4,3,7),new THREE.MeshStandardMaterial({color:0x60452f}));t.position.set(x,1.5,z);t.castShadow=true;scene.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(1.7,4.5,8),new THREE.MeshStandardMaterial({color:0x254f3c}));c.position.set(x,4.6,z);c.castShadow=true;scene.add(c)}
for(let i=0;i<65;i++){const a=i*2.399,r=24+(i%9)*4;trunk(Math.cos(a)*r,Math.sin(a)*r)}
for(let i=0;i<9;i++)box(1.8,1.5,1.8,0x727c83,-16+i*4,.75,-17);
const player=new THREE.Group();scene.add(player);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.43,.95,5,10),new THREE.MeshStandardMaterial({color:0x353d49,metalness:.55,roughness:.55}));body.position.y=1.25;body.castShadow=true;player.add(body);
// Alpha 0.3: articulated legs and arms, attached to the player body.
const armorMat=new THREE.MeshStandardMaterial({color:0x303a4b,metalness:.55,roughness:.4});
function limb(w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),armorMat);m.position.set(x,y,z);m.castShadow=true;player.add(m);return m}
const leftLeg=limb(.27,.75,.3,-.24,.46,0),rightLeg=limb(.27,.75,.3,.24,.46,0);
const leftArm=limb(.25,.85,.28,-.57,1.45,0),rightArm=limb(.25,.85,.28,.57,1.45,0);
const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),new THREE.MeshStandardMaterial({color:0xe2bd94}));head.position.y=2.13;player.add(head);
// Alpha 0.4 layered adventurer armor, cape and pauldrons.
const steel=new THREE.MeshStandardMaterial({color:0x8e9dab,metalness:.8,roughness:.26});
const trim=new THREE.MeshStandardMaterial({color:0x99784b,metalness:.65,roughness:.35});
const capeMat=new THREE.MeshStandardMaterial({color:0x752f39,side:THREE.DoubleSide,roughness:1});
function equipMesh(geometry,material,x,y,z,rx=0,ry=0,rz=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;player.add(m);return m}
equipMesh(new THREE.BoxGeometry(.72,.55,.22),steel,0,1.63,.34);
equipMesh(new THREE.BoxGeometry(.8,.11,.26),trim,0,1.38,.36);
for(const x of [-.56,.56]){equipMesh(new THREE.SphereGeometry(.28,10,8),steel,x,1.79,0);equipMesh(new THREE.BoxGeometry(.27,.24,.37),steel,x,.35,.05)}
equipMesh(new THREE.ConeGeometry(.35,.42,7),new THREE.MeshStandardMaterial({color:0x282b30}),0,2.42,0);
const cape=equipMesh(new THREE.PlaneGeometry(1.25,1.7),capeMat,0,1.24,-.42,-.12);
const scarf=equipMesh(new THREE.TorusGeometry(.37,.1,6,16),capeMat,0,1.92,0,Math.PI/2);
const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,1.25,.18),new THREE.MeshStandardMaterial({color:0xcde6ef,metalness:.85,roughness:.2}));blade.position.set(.62,1.25,.1);blade.rotation.z=-.3;player.add(blade);
const bow=new THREE.Mesh(new THREE.TorusGeometry(.55,.055,6,20,Math.PI),new THREE.MeshStandardMaterial({color:0x7a4427}));bow.position.set(.65,1.35,.05);bow.rotation.y=Math.PI/2;bow.visible=false;player.add(bow);
// Alpha 0.2: small safe town, shopkeeper and quest giver.
const town=new THREE.Group();scene.add(town);
function townBox(g,w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.85}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function building(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);townBox(g,4.8,3.4,4.5,color,0,1.7,0);townBox(g,5.1,.28,4.9,0x5e4a3c,0,3.32,0);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.85,2.5,4),new THREE.MeshStandardMaterial({color:0x79423a,roughness:.9}));roof.rotation.y=Math.PI/4;roof.position.y=4.5;roof.castShadow=true;g.add(roof);for(const side of [-1,1]){townBox(g,.2,3.4,.24,0x4c3427,side*2.3,1.7,2.3);townBox(g,.9,1,.12,0x5c8eaa,side*1.3,2.1,2.29)}townBox(g,1.05,1.8,.15,0x483324,0,.9,2.3);townBox(g,1.35,.14,.2,0xd7b46e,0,1.9,2.43);const lamp=new THREE.PointLight(0xffae56,1.3,6);lamp.position.set(1.9,2.2,2.5);g.add(lamp);town.add(g)}
for(const [x,z,c] of [[-9,10,0xb7a48b],[-3,14,0xaba69b],[5,14,0xc6aa85],[12,9,0xb5a28d],[-11,1,0xa8a4a0],[14,0,0xc1aa8b],[-7,-12,0xb2a18b],[8,-14,0xb4a69b]])building(x,z,c);
// Alpha 2.1 — richer low-poly town landmarks. Static meshes, no extra shadow-casting lights.
const town21=new THREE.Group();scene.add(town21);
const mats21={wood:new THREE.MeshStandardMaterial({color:0x765039,roughness:.9}),gold:new THREE.MeshStandardMaterial({color:0xe0b76a,metalness:.25,roughness:.45}),cloth:new THREE.MeshStandardMaterial({color:0x386d8a,side:THREE.DoubleSide}),red:new THREE.MeshStandardMaterial({color:0x9c5148,side:THREE.DoubleSide}),stone:new THREE.MeshStandardMaterial({color:0x8d928e}),leaf:new THREE.MeshStandardMaterial({color:0x4f9566}),water:new THREE.MeshStandardMaterial({color:0x4ba9b8,transparent:true,opacity:.78})};
function townPart21(geometry,material,x,y,z,parent=town21){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function sign21(label,x,z){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#172f3e';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#e8c47c';ctx.lineWidth=9;ctx.strokeRect(6,6,500,116);ctx.font='bold 44px sans-serif';ctx.fillStyle='#fff1c6';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,65);const texture=new THREE.CanvasTexture(canvas);const board=townPart21(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),x,3.55,z);return board}
sign21('⚒ ДАРХАН',-9,12.38);sign21('☕ ДЭН БУУДАЛ',-3,16.38);sign21('✦ ДЭЛГҮҮР',5,16.38);
function market21(x,z,shade){const g=new THREE.Group();g.position.set(x,0,z);town21.add(g);for(const a of [-1,1])for(const b of [-1,1])townPart21(new THREE.CylinderGeometry(.07,.09,2.5,6),mats21.wood,a*1.4,1.25,b*.85,g);const canopy=townPart21(new THREE.ConeGeometry(2.2,1.15,4),shade,0,2.65,0,g);canopy.rotation.y=Math.PI/4;townPart21(new THREE.BoxGeometry(2.6,.22,1.3),mats21.wood,0,1.05,.4,g);for(let i=0;i<5;i++)townPart21(new THREE.IcosahedronGeometry(.15,0),i%2?mats21.gold:mats21.leaf,-.9+i*.45,1.26,.4,g)}
market21(-4,-5,mats21.cloth);market21(10,-5,mats21.red);
function bench21(x,z){townPart21(new THREE.BoxGeometry(2,.17,.55),mats21.wood,x,.7,z);townPart21(new THREE.BoxGeometry(2,.72,.13),mats21.wood,x,1.1,z-.3);for(const d of [-.75,.75])townPart21(new THREE.BoxGeometry(.16,.65,.42),mats21.stone,x+d,.35,z)}
bench21(-3,5);bench21(8,5);
for(const [x,z] of [[-12,-4],[-8,7],[11,7],[12,-11]]){townPart21(new THREE.CylinderGeometry(.07,.1,3.3,7),mats21.wood,x,1.65,z);townPart21(new THREE.BoxGeometry(.6,.55,.6),mats21.gold,x,3.25,z);townPart21(new THREE.ConeGeometry(.46,.5,4),mats21.stone,x,3.75,z)}
for(const [x,z] of [[-13,6],[12,13],[-9,-8],[13,-9]]){townPart21(new THREE.CylinderGeometry(.85,.9,.34,10),mats21.stone,x,.17,z);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;townPart21(new THREE.SphereGeometry(.19,6,5),i%2?mats21.gold:mats21.leaf,x+Math.cos(a)*.57,.48,z+Math.sin(a)*.57)}}
// Paved streets: a road into the town and a circular plaza.
const stoneMat=new THREE.MeshStandardMaterial({color:0x9b9689,roughness:1});
const road=new THREE.Mesh(new THREE.PlaneGeometry(8,42),stoneMat);road.rotation.x=-Math.PI/2;road.position.set(2,.026,-9);road.receiveShadow=true;scene.add(road);
for(let z=-28;z<12;z+=2.1)for(let x=-1.5;x<6;x+=1.8){const stone=new THREE.Mesh(new THREE.BoxGeometry(1.6,.045,1.85),new THREE.MeshStandardMaterial({color:(Math.round(x+z)%3===0?0xafa99b:0x8d8b81)}));stone.position.set(x,.06,z);stone.receiveShadow=true;scene.add(stone)}
function cylinder(r1,r2,h,color,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),new THREE.MeshStandardMaterial({color}));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
// Fountain, flags, crates and lanterns.
cylinder(2.3,2.5,.45,0x807f80,2,.3,4);cylinder(1.95,1.95,.12,0x69b5cb,2,.56,4);cylinder(.48,.7,2,0xaaa69b,2,1.55,4);cylinder(.8,.65,.18,0xd6c6a7,2,2.55,4);
for(const [x,z] of [[-5,6],[10,5],[-5,-4],[10,-4]]){cylinder(.1,.13,4,0x483a2e,x,2,z);const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.8),new THREE.MeshStandardMaterial({color:0x355b89,side:THREE.DoubleSide}));flag.position.set(x+.55,2.7,z);scene.add(flag);const l=new THREE.PointLight(0xffb45e,1,6);l.position.set(x,2.8,z);scene.add(l)}
for(const [x,z] of [[-8,4],[10,12],[-10,-8],[9,-10]]){box(1.2,.9,1.1,0x755638,x,.45,z);box(.1,.93,1.2,0xa58b5a,x,.45,z)}
// Distant castle silhouette in the hills.
for(const [x,z,h] of [[-19,40,11],[-12,42,16],[-4,42,13],[5,42,18]]){box(5,h,5,0x8a8e93,x,h/2,z);const cone=new THREE.Mesh(new THREE.ConeGeometry(3.6,5,4),new THREE.MeshStandardMaterial({color:0x4a5979}));cone.position.set(x,h+2.5,z);cone.rotation.y=Math.PI/4;scene.add(cone)}
const plaza=new THREE.Mesh(new THREE.CylinderGeometry(7,7,.08,32),new THREE.MeshStandardMaterial({color:0x9c9488}));plaza.position.set(2,.018,7);scene.add(plaza);
const npc=new THREE.Group();npc.position.set(1,0,7);const npcBody=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.75,5,10),new THREE.MeshStandardMaterial({color:0x9a75b5}));npcBody.position.y=1.1;npc.add(npcBody);const npcHead=new THREE.Mesh(new THREE.SphereGeometry(.29,12,8),new THREE.MeshStandardMaterial({color:0xe7c4a4}));npcHead.position.y=1.92;npc.add(npcHead);scene.add(npc);
// Alpha 1.0: replace capsule-only Saruul with an articulated fantasy NPC.
npcBody.visible=false;
npcHead.scale.set(1.06,1.08,.92);
const saruulSkin10=new THREE.MeshStandardMaterial({color:0xf0c7a7,roughness:.85});
const saruulHair10=new THREE.MeshStandardMaterial({color:0x273453,roughness:.8});
const saruulCloth10=new THREE.MeshStandardMaterial({color:0x7bd0e4,roughness:.8});
const saruulWhite10=new THREE.MeshStandardMaterial({color:0xe6edf6,roughness:.85});
function saruulPart10(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;npc.add(m);return m;}
saruulPart10(new THREE.CylinderGeometry(.29,.42,1.05,10),saruulCloth10,0,1.19,0);
saruulPart10(new THREE.ConeGeometry(.55,.8,12),saruulWhite10,0,.72,0).rotation.y=Math.PI/12;
for(const side of [-1,1]){
  const arm=saruulPart10(new THREE.CapsuleGeometry(.115,.54,4,8),saruulWhite10,side*.43,1.3,0);
  arm.rotation.z=side*.16;
  saruulPart10(new THREE.SphereGeometry(.12,8,6),saruulSkin10,side*.49,.91,.03);
  saruulPart10(new THREE.CapsuleGeometry(.13,.53,4,8),saruulCloth10,side*.2,.35,0);
  saruulPart10(new THREE.BoxGeometry(.3,.17,.43),saruulHair10,side*.2,.11,.11);
  saruulPart10(new THREE.SphereGeometry(.052,8,6),saruulHair10,side*.115,1.96,.27);
}
const saruulCap10=saruulPart10(new THREE.SphereGeometry(.32,12,10),saruulHair10,0,2.13,-.07);
saruulCap10.scale.set(1.05,.7,1.1);
for(const side of [-1,1]){
  const hair=saruulPart10(new THREE.CapsuleGeometry(.16,.86,5,8),saruulHair10,side*.27,1.64,-.18);
  hair.rotation.z=side*.09;
}
saruulPart10(new THREE.BoxGeometry(.42,.09,.13),saruulWhite10,0,1.47,.3);

// Alpha 0.5 — stylized anime fantasy art pass, built from lightweight meshes.
// All gameplay, saves, controls, quest and combat code below remains from 0.4.
const ink=new THREE.MeshStandardMaterial({color:0x202a40,roughness:.85});
const hairMat=new THREE.MeshStandardMaterial({color:0x26364c,roughness:.85});
const skinMat=new THREE.MeshStandardMaterial({color:0xffd7b3,roughness:.9});
const cyanGlow=new THREE.MeshStandardMaterial({color:0x65e9ff,emissive:0x1e8cb5,emissiveIntensity:1.3,roughness:.3});
function artMesh(parent,geometry,mat,x,y,z,rotY=0){const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);o.rotation.y=rotY;o.castShadow=true;parent.add(o);return o}
// Character: hair, eyes, armor details, boots and glowing crystal.
const hairCap=artMesh(player,new THREE.SphereGeometry(.325,12,9),hairMat,0,2.26,-.025);hairCap.scale.set(1.05,.67,1.04);
for(const [x,ang] of [[-.22,-.25],[-.07,0],[.12,.22],[.27,.35]]){const tuft=artMesh(player,new THREE.ConeGeometry(.13,.39,5),hairMat,x,2.34,.19);tuft.rotation.z=ang;tuft.rotation.x=.48}
for(const x of [-.115,.115]){const eye=artMesh(player,new THREE.SphereGeometry(.044,8,6),ink,x,2.17,.293);eye.scale.set(.85,1.3,.45);artMesh(player,new THREE.BoxGeometry(.22,.08,.08),trim,x*2.25,1.63,.47);}
artMesh(player,new THREE.OctahedronGeometry(.16),cyanGlow,0,1.63,.49);
for(const x of [-.24,.24]){artMesh(player,new THREE.BoxGeometry(.33,.22,.4),ink,x,.18,.075);artMesh(player,new THREE.BoxGeometry(.31,.12,.42),steel,x,.31,.09)}
for(const x of [-.56,.56]){artMesh(player,new THREE.BoxGeometry(.24,.23,.31),trim,x,1.04,.01)}
const hairBack=artMesh(player,new THREE.ConeGeometry(.26,.66,6),hairMat,0,1.98,-.23);hairBack.rotation.x=-.2;
// Building detail: timber frames, glowing windows, flower boxes, tiled roofs.
const timber=new THREE.MeshStandardMaterial({color:0x624431,roughness:.95});
const plaster=new THREE.MeshStandardMaterial({color:0xd6c3a1,roughness:1});
const windowMat=new THREE.MeshStandardMaterial({color:0x80c7e5,emissive:0x275f85,emissiveIntensity:.55});
const roofMat=new THREE.MeshStandardMaterial({color:0x486078,roughness:.85});
const bloomMats=[0xef91ac,0xf9df86,0xb9a0ee,0xfffbf2].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
function detailsAt(x,z,i){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  for(const a of [-2.1,2.1]){artMesh(g,new THREE.BoxGeometry(.19,3.45,.23),timber,a,1.73,2.33);artMesh(g,new THREE.BoxGeometry(.19,3.45,.23),timber,a,1.73,-2.33)}
  for(const y of [.45,3.12])artMesh(g,new THREE.BoxGeometry(4.8,.16,.22),timber,0,y,2.36);
  for(const a of [-1.25,1.25]){artMesh(g,new THREE.BoxGeometry(.85,1.04,.1),windowMat,a,2.08,2.39);artMesh(g,new THREE.BoxGeometry(.11,1.09,.13),timber,a,2.08,2.47);artMesh(g,new THREE.BoxGeometry(.9,.1,.13),timber,a,2.08,2.48);artMesh(g,new THREE.BoxGeometry(1.03,.23,.36),timber,a,1.49,2.49)}
  for(let k=0;k<3;k++)artMesh(g,new THREE.BoxGeometry(4.7,.08,.12),roofMat,0,3.72+k*.33,2.55-k*.35);
  artMesh(g,new THREE.BoxGeometry(.65,.12,.12),trim,0,2.16,2.49);
  if(i%2===0){const awn=artMesh(g,new THREE.BoxGeometry(2.7,.08,1.5),new THREE.MeshStandardMaterial({color:0x446b8c,roughness:1}),0,2.45,3.1);awn.rotation.x=-.18;}
}
[[-9,10],[-3,14],[5,14],[12,9],[-11,1],[14,0],[-7,-12],[8,-14]].forEach(([x,z],i)=>detailsAt(x,z,i));
// Distant rolling hills, clouds, scattered shrubs and flowers.
const hillMat=new THREE.MeshStandardMaterial({color:0x64877e,roughness:1});
for(let i=0;i<18;i++){const a=i*Math.PI*2/18;const r=66;const h=8+(i%5)*3;const hill=artMesh(scene,new THREE.ConeGeometry(14+(i%3)*3,h,7),hillMat,Math.cos(a)*r,h/2-1,Math.sin(a)*r);hill.rotation.y=i*.47}
const cloudMat=new THREE.MeshBasicMaterial({color:0xf6fcff,transparent:true,opacity:.74,depthWrite:false});
for(let i=0;i<12;i++){const a=i*2.4,r=36+(i%4)*9;const g=new THREE.Group();g.position.set(Math.cos(a)*r,23+(i%4)*3,Math.sin(a)*r);scene.add(g);for(let j=0;j<3;j++){const c=artMesh(g,new THREE.SphereGeometry(2.2,8,6),cloudMat,(j-1)*2,Math.sin(j)*.35,0);c.scale.y=.45}}
const leafMat=new THREE.MeshStandardMaterial({color:0x39785c,roughness:1});
const leafLight=new THREE.MeshStandardMaterial({color:0x6fa76b,roughness:1});
for(let i=0;i<110;i++){const a=i*2.39996,r=18+(i%23)*2.1;const x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x-2)<8&&z>-29&&z<17)continue;
  const shrub=artMesh(scene,new THREE.IcosahedronGeometry(.48+(i%4)*.12,0),i%3?leafMat:leafLight,x,.36,z);shrub.scale.y=.65;
  if(i%3===0){const f=artMesh(scene,new THREE.IcosahedronGeometry(.13,0),bloomMats[i%4],x+.22,.67,z+.1);f.castShadow=false;}}
// Plaza paving ring and floating quest indicator.
const ring=new THREE.Mesh(new THREE.TorusGeometry(6.95,.14,6,48),new THREE.MeshStandardMaterial({color:0xd7c7a4,metalness:.12}));ring.rotation.x=Math.PI/2;ring.position.set(2,.14,7);scene.add(ring);
const questGem=artMesh(scene,new THREE.OctahedronGeometry(.31),cyanGlow,1,3.02,7);
const questHalo=new THREE.PointLight(0x4fe0ff,1.25,6);questHalo.position.set(1,2.95,7);scene.add(questHalo);
const versionLabel=document.createElement('div');versionLabel.id='zoneLabel';versionLabel.textContent='✦ ЭХЛЭЛ ХОТ · ALPHA 2.2';document.querySelector('#app').appendChild(versionLabel);
const saveKey='astral-rift-alpha03-save';let saved={};try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}')}catch{}
let questAccepted=!!saved.questAccepted,questComplete=!!saved.questComplete,gold=Number(saved.gold)||0,inventory=Array.isArray(saved.inventory)?saved.inventory:['Хоёр гарын илд','Нум'];
let potions16=Math.max(0,Number(saved.potions16??2)||0),questKills16=Math.max(0,Number(saved.questKills16)||0);
let level=Math.max(1,Number(saved.level)||1),xp=Math.max(0,Number(saved.xp)||0),totalKills=Number(saved.totalKills)||0;
let achievements17=Array.isArray(saved.achievements17)?saved.achievements17:[];
// Alpha 1.8: persistent RPG equipment, crafting materials and repeatable bounty.
let ore18=Math.max(0,Number(saved.ore18)||0),crystal18=Math.max(0,Number(saved.crystal18)||0);
let swordRank18=Math.min(10,Math.max(0,Number(saved.swordRank18)||0));
let bowRank18=Math.min(10,Math.max(0,Number(saved.bowRank18)||0));
let armorRank18=Math.min(10,Math.max(0,Number(saved.armorRank18)||0));
let bounty18=Math.max(0,Number(saved.bounty18)||0),bountyClaims18=Math.max(0,Number(saved.bountyClaims18)||0);
// Alpha 1.9: persistent skill progression and monster variants.
const talentNames19=['⚔️ Илдний мастер','🏹 Мэргэн харваач','❤️ Тэсвэр','✨ Ур чадвар'];
let talents19=Array.isArray(saved.talents19)?[0,1,2,3].map(i=>Math.min(5,Math.max(0,Number(saved.talents19[i])||0))):[0,0,0,0];
let talentPoints19=Math.max(0,Number(saved.talentPoints19)||0);
let battleLog18=[];
function logBattle18(t){battleLog18.unshift(t);battleLog18=battleLog18.slice(0,8)}

function saveGame(){try{localStorage.setItem(saveKey,JSON.stringify({questAccepted,questComplete,gold,inventory,level,xp,totalKills,bossWins07,potions16,questKills16,achievements17,ore18,crystal18,swordRank18,bowRank18,armorRank18,bounty18,bountyClaims18,talents19,talentPoints19}))}catch{}}
function gainXp(amount){xp+=amount;while(xp>=level*80){xp-=level*80;level++;talentPoints19++;state.max+=10;state.hp=state.max;msg('LEVEL UP! '+level+' · +1 Skill Point')}saveGame()}

const panel=document.createElement('div');panel.id='panel';panel.innerHTML='<button id="townBtn">NPC / E</button><button id="bagBtn">🎒 Bag / I</button><button id="shopBtn16">🛒 Shop</button>';document.querySelector('#app').appendChild(panel);
const win=document.createElement('div');win.id='window';document.querySelector('#app').appendChild(win);
function closeWindow(){win.style.display='none'}
function openWindow(title,content){win.innerHTML='<h2>'+title+'</h2>'+content+'<p><button id="closeWindow">Хаах</button></p>';win.style.display='block';document.querySelector('#closeWindow').onclick=closeWindow}
function showBag(){
  openWindow('🎒 Inventory',`<p>🪙 Алт: <b>${gold}</b> · ❤️ Эм: <b>${potions16}</b></p><p>${inventory.map(item=>'• '+item).join('<br>')}</p><p>Зэвсэг: ${state.weapon?'Нум':'Хоёр гарын илд'} · Илд +${swordRank18} · Нум +${bowRank18} · Хуяг +${armorRank18}</p><p>⛏️ Хүдэр: ${ore18} · 💎 Кристалл: ${crystal18}</p><button id="forgeFromBag18">⚒️ Дархны газар</button><button id="usePotion16">❤️ Эм хэрэглэх (+50 HP)</button><button id="swapWeapon16">⇄ Зэвсэг солих</button>`);
  document.querySelector('#forgeFromBag18').onclick=showForge18;
  document.querySelector('#usePotion16').onclick=()=>{usePotion16();showBag()};
  document.querySelector('#swapWeapon16').onclick=()=>{swap();showBag()};
}
function usePotion16(){
  if(!potions16){msg('Эм дууссан — Shop-оос аваарай');return}
  if(state.hp>=state.max){msg('HP бүрэн байна');return}
  potions16--;state.hp=Math.min(state.max,state.hp+50);saveGame();msg('❤️ HP +50');
}
function showShop16(){
  if(player.position.distanceTo(npc.position)>6){msg('Саруулд ойртоод дэлгүүр нээнэ');return}
  openWindow('🛒 Саруулын дэлгүүр',`<p>🪙 Чиний алт: ${gold}</p><p>❤️ Эдгээх эм — 30 алт (+50 HP)</p><button id="buyPotion16">30 алт · Эм авах</button>`);
  document.querySelector('#buyPotion16').onclick=()=>{
    if(gold<30){msg('Алт хүрэлцэхгүй');return}
    gold-=30;potions16++;saveGame();msg('Эм авлаа');showShop16();
  };
}
function talk(){
  if(player.position.distanceTo(npc.position)>6){msg('NPC-д ойртоорой (хот: x=1, z=7)');return}
  if(!questAccepted){
    openWindow('Саруул — Аялагч','<p>Ойн мангасуудаас 3-ыг ялж, хотыг хамгаалаарай.</p><button id="acceptQuest">Даалгавар авах</button>');
    document.querySelector('#acceptQuest').onclick=()=>{questAccepted=true;questKills16=0;saveGame();closeWindow();msg('Даалгавар эхэллээ!')};
  }else if(questComplete){
    openWindow('Саруул','<p>Сайн ажиллалаа! Дараагийн 3 мангасыг ялж дахин шагнал аваарай.</p><button id="repeatQuest">Шинэ даалгавар</button>');
    document.querySelector('#repeatQuest').onclick=()=>{questComplete=false;questKills16=0;saveGame();closeWindow();msg('Шинэ даалгавар эхэллээ')};
  }else openWindow('Саруул',`<p>Ялсан дайсан: ${questKills16}/3</p>`);
}
document.querySelector('#townBtn').onclick=talk;document.querySelector('#bagBtn').onclick=showBag;document.querySelector('#shopBtn16').onclick=showShop16;
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyE')talk();if(e.code==='KeyI')showBag();if(e.code==='KeyH')usePotion16();if(e.code==='Escape')closeWindow()});
const enemies=[];let enemySerial19=0;function spawn(x,z){const g=new THREE.Group();g.position.set(x,0,z);const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.8,0),new THREE.MeshStandardMaterial({color:0x963d42,flatShading:true}));m.position.y=.95;m.castShadow=true;g.add(m);scene.add(g);{const variant=enemySerial19++%5;const elite=variant===4,fast=variant===2;const max=elite?220:fast?75:100;
 m.material.color.setHex(elite?0xd6a344:fast?0x4e9ba9:0x963d42);
 g.scale.setScalar(elite?1.35:fast?.85:1);
 enemies.push({g,m,hp:max,max,alive:true,cool:0,respawn:0,home:new THREE.Vector3(x,0,z),elite,fast,baseColor:elite?0xd6a344:fast?0x4e9ba9:0x963d42})}}
spawn(4,-7);spawn(-5,-10);spawn(10,1);spawn(-11,5);spawn(6,11);
// Improved enemy silhouette while keeping their original hitboxes.
const hornMat=new THREE.MeshStandardMaterial({color:0xe9d2b0,roughness:.8});
for(const e of enemies){for(const side of [-1,1]){const horn=artMesh(e.g,new THREE.ConeGeometry(.18,.52,5),hornMat,side*.43,1.65,.02);horn.rotation.z=-side*.42;artMesh(e.g,new THREE.SphereGeometry(.095,7,6),cyanGlow,side*.24,1.05,.68)}artMesh(e.g,new THREE.BoxGeometry(.7,.14,.2),ink,0,.48,.48)}

// Alpha 0.6: exploration content, using only local procedural geometry.
const exploration=new THREE.Group();scene.add(exploration);
const wood06=new THREE.MeshStandardMaterial({color:0x70503b,roughness:.9});
const gold06=new THREE.MeshStandardMaterial({color:0xd7b36a,metalness:.65,roughness:.35});
const rune06=new THREE.MeshStandardMaterial({color:0x66e7ff,emissive:0x118ab2,emissiveIntensity:.9});
function deco06(geo,mat,x,y,z,parent=exploration){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
// Ruined gate at the edge of the forest.
for(const x of [-2.1,2.1]){
  deco06(new THREE.BoxGeometry(1.2,5,1.3),steel,x,2.5,-32);
  deco06(new THREE.BoxGeometry(.6,.35,1.5),gold06,x,5.15,-32);
}
deco06(new THREE.BoxGeometry(5.5,1.1,1.5),steel,0,5.5,-32);
const portal06=deco06(new THREE.PlaneGeometry(3.1,4.3),new THREE.MeshBasicMaterial({color:0x4bd6ff,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}),0,2.45,-32);
const portalRing06=deco06(new THREE.TorusGeometry(1.6,.12,8,32),rune06,0,2.6,-31.9);
portalRing06.scale.y=1.25;
// A shrine that heals the player and three collectible caches.
const shrine06=deco06(new THREE.CylinderGeometry(.8,1.05,1.2,8),steel,-12,.6,-20);
const shrineCrystal06=deco06(new THREE.OctahedronGeometry(.7),rune06,-12,2,-20);
const caches06=[[-13,-10],[16,-19],[-20,8]].map(([x,z])=>{
  const g=new THREE.Group();g.position.set(x,0,z);exploration.add(g);
  deco06(new THREE.BoxGeometry(1.25,.75,.85),wood06,0,.43,0,g);
  deco06(new THREE.BoxGeometry(1.3,.16,.9),gold06,0,.84,0,g);
  deco06(new THREE.BoxGeometry(.13,.75,.9),gold06,0,.43,0,g);
  return {g,x,z,opened:false};
});
let collected06=0;
const interact06=document.createElement('button');interact06.id='interact06';interact06.textContent='✦ Судлах';
document.querySelector('#panel').appendChild(interact06);
const exploreHint06=document.createElement('div');exploreHint06.id='exploreHint06';
exploreHint06.textContent='✦ Ойн хаалга → Dungeon · 3 эрдэнэс · Талст';
document.querySelector('#app').appendChild(exploreHint06);
function interactWorld06(){
  const pos=player.position;
  if(pos.distanceTo(shrine06.position)<4){state.hp=state.max;msg('✦ HP бүрэн сэргэлээ');return}
  for(const c of caches06){
    if(!c.opened&&pos.distanceTo(c.g.position)<3.5){
      c.opened=true;c.g.visible=false;collected06++;gold+=35;gainXp(25);saveGame();
      msg('Эрдэнэс оллоо! +35 алт · +25 EXP');return;
    }
  }
  if(Math.hypot(pos.x,pos.z+32)<4){msg('Эртний хаалга — дараагийн бүлэгт нээгдэнэ');return}
  msg('Талст эсвэл авдарт ойртоорой');
}
interact06.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();interactWorld06()});
window.addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat)interactWorld06()});
// Alpha 0.7 — a separate dungeon arena and boss. All geometry is generated locally.
const dungeon07=new THREE.Group();scene.add(dungeon07);
const stone07=new THREE.MeshStandardMaterial({color:0x333d55,roughness:.9});
const edge07=new THREE.MeshStandardMaterial({color:0x7466aa,metalness:.35,roughness:.55});
const lava07=new THREE.MeshStandardMaterial({color:0x492c55,emissive:0x3b174d,emissiveIntensity:.4});
function part07(geo,mat,x,y,z,parent=dungeon07){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
part07(new THREE.CylinderGeometry(16,16,1,32),stone07,48,-.5,-48);
part07(new THREE.TorusGeometry(14.8,.45,8,48),edge07,48,.1,-48).rotation.x=Math.PI/2;
for(let i=0;i<8;i++){
 const a=i*Math.PI/4,x=48+Math.sin(a)*12,z=-48+Math.cos(a)*12;
 part07(new THREE.CylinderGeometry(.85,1.15,6,8),stone07,x,3,z);
 part07(new THREE.OctahedronGeometry(.65),rune06,x,6.5,z);
}
part07(new THREE.CylinderGeometry(3.1,3.5,.32,16),lava07,48,.18,-48);
const dungeonExit07=part07(new THREE.TorusGeometry(1.2,.17,8,24),rune06,48,2,-36);
dungeonExit07.scale.y=1.35;
const boss07group=new THREE.Group();boss07group.position.set(48,0,-51);scene.add(boss07group);
const boss07body=part07(new THREE.DodecahedronGeometry(1.6,1),new THREE.MeshStandardMaterial({color:0x682c79,metalness:.35,roughness:.45,emissive:0x220d33,emissiveIntensity:.4}),0,2,0,boss07group);
for(const side of [-1,1]){
 const horn=part07(new THREE.ConeGeometry(.43,1.6,6),edge07,side*1.1,3.55,0,boss07group);horn.rotation.z=-side*.35;
 part07(new THREE.SphereGeometry(.18,8,6),cyanGlow,side*.56,2.3,1.3,boss07group);
}
const boss07={g:boss07group,m:boss07body,hp:650,max:650,alive:true,cool:0,respawn:0,home:new THREE.Vector3(48,0,-51),boss:true};
enemies.push(boss07);
let inDungeon07=false,bossWins07=Number(saved.bossWins07)||0;
const bossHud07=document.createElement('div');bossHud07.id='bossHud07';bossHud07.innerHTML='<b>☠ Сүүдрийн хамгаалагч</b><div class="bossTrack07"><div id="bossFill07"></div></div><small id="bossText07">650 / 650 HP</small>';
document.querySelector('#app').appendChild(bossHud07);
function enterDungeon07(){inDungeon07=true;player.position.set(48,0,-38);state.target=null;msg('☠ Сүүдрийн хамгаалагчийн агуйд орлоо')}
function leaveDungeon07(){inDungeon07=false;player.position.set(0,0,-28);state.target=null;msg('✦ Ойн хаалганд буцлаа')}
const interactWorld06Original=interactWorld06;
interactWorld06=function(){
 if(inDungeon07){if(Math.hypot(player.position.x-48,player.position.z+36)<4){leaveDungeon07();return}msg('Буцах хаалганд ойртоорой');return}
 if(Math.hypot(player.position.x,player.position.z+32)<4){enterDungeon07();return}
 interactWorld06Original();
};

// Alpha 0.8 VISUAL PASS: additive scenery; existing quests/combat remain intact.
scene.background=new THREE.Color(0x8dbad5);
scene.fog=new THREE.FogExp2(0x9ac3cb,.0075);
renderer.toneMappingExposure=1.25;
const v08=new THREE.Group();scene.add(v08);
const mat08=(c,metalness=0,roughness=.85)=>new THREE.MeshStandardMaterial({color:c,metalness,roughness});
const pale08=mat08(0xc3b69c),dark08=mat08(0x4c5263),gold08=mat08(0xc9a269,.55,.35),blue08=mat08(0x355f7d),glow08=new THREE.MeshStandardMaterial({color:0x8deeff,emissive:0x38bce6,emissiveIntensity:1.3});
function visual08(geo,mat,x,y,z,parent=v08){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=true;parent.add(m);return m}
// Ornate stone lamps, warm shop lanterns, and village market stands.
for(const [x,z] of [[-4,3],[8,3],[-4,-7],[8,-7],[-4,13],[8,13]]){
 visual08(new THREE.CylinderGeometry(.12,.19,3.4,8),dark08,x,1.7,z);
 visual08(new THREE.BoxGeometry(.64,.16,.64),gold08,x,3.43,z);
 visual08(new THREE.OctahedronGeometry(.34),glow08,x,3.8,z);
 visual08(new THREE.ConeGeometry(.52,.55,4),dark08,x,4.23,z).rotation.y=Math.PI/4;
}
for(const [x,z] of [[-8,7],[11,6],[-8,-5]]){
 visual08(new THREE.BoxGeometry(3,.16,1.7),gold08,x,1.72,z);
 for(const dx of [-1.3,1.3])visual08(new THREE.BoxGeometry(.13,1.5,.13),dark08,x+dx,.83,z);
 const canopy=visual08(new THREE.BoxGeometry(3.6,.15,2.2),blue08,x,2.95,z);canopy.rotation.z=.08;
 for(let k=0;k<5;k++)visual08(new THREE.SphereGeometry(.15,6,5),bloomMats[k%4],x-1.15+k*.58,1.88,z+.35);
}
// A raised stair approach, engraved plaza tiles, and the fountain crown.
for(let i=0;i<28;i++){
 const a=i*Math.PI*2/28;
 const x=2+Math.sin(a)*6.2,z=7+Math.cos(a)*6.2;
 const tile=visual08(new THREE.BoxGeometry(1.22,.08,.53),i%3? pale08:gold08,x,.125,z);
 tile.rotation.y=a;
}
for(let i=0;i<8;i++){
 const a=i*Math.PI/4;
 visual08(new THREE.SphereGeometry(.19,8,6),gold08,2+Math.sin(a)*2.1,.72,4+Math.cos(a)*2.1);
}
visual08(new THREE.OctahedronGeometry(.55),glow08,2,3.08,4);
// Stylized adventurer silhouette: waist straps, arm guards, hood edge and sword hilt.
for(const side of [-1,1]){
 visual08(new THREE.BoxGeometry(.3,.26,.35),gold08,side*.57,1.32,.05,player);
 visual08(new THREE.BoxGeometry(.29,.18,.37),dark08,side*.24,.64,.05,player);
}
visual08(new THREE.BoxGeometry(.8,.1,.45),gold08,0,1.03,.04,player);
visual08(new THREE.TorusGeometry(.33,.055,6,12),gold08,0,2.37,0,player).rotation.x=Math.PI/2;
visual08(new THREE.BoxGeometry(.42,.1,.14),gold08,.62,.85,.12,player);
// Dungeon arches and glowing floor sigils, deliberately lightweight.
for(let i=0;i<8;i++){
 const a=i*Math.PI/4,x=48+Math.sin(a)*12,z=-48+Math.cos(a)*12;
 visual08(new THREE.BoxGeometry(1.5,.42,1.5),gold08,x,5.9,z,dungeon07);
 const gem=visual08(new THREE.OctahedronGeometry(.4),glow08,x,7,z,dungeon07);gem.rotation.y=a;
}
for(let i=0;i<3;i++){
 const ring=visual08(new THREE.TorusGeometry(4+i*2,.065,6,48),i===1?gold08:edge07,48,.21+i*.01,-48,dungeon07);
 ring.rotation.x=Math.PI/2;
}
const visualVersion08=document.querySelector('#hud small');if(visualVersion08)visualVersion08.textContent='ALPHA 1.6';
versionLabel.textContent='✦ ЭХЛЭЛ ХОТ · SYSTEMS 1.6';


// Alpha 1.0: refine the player silhouette and helmet.
body.scale.set(.88,1,.84);
head.scale.set(.94,1.03,.92);
const armorHighlight10=new THREE.MeshStandardMaterial({color:0x99b7c7,metalness:.8,roughness:.27});
for(const side of [-1,1]){
  const plate=new THREE.Mesh(new THREE.BoxGeometry(.21,.56,.13),armorHighlight10);
  plate.position.set(side*.31,1.57,.43);plate.rotation.z=side*.18;player.add(plate);
  const greave=new THREE.Mesh(new THREE.BoxGeometry(.23,.42,.36),steel);
  greave.position.set(side*.24,.45,.13);player.add(greave);
}
const beltGem10=new THREE.Mesh(new THREE.OctahedronGeometry(.14),cyanGlow);
beltGem10.position.set(0,1.03,.34);player.add(beltGem10);

// Alpha 1.1 — actual optimized GLB character meshes, local assets, no external CDN.
// Preserve original models until GLB loads; keep gameplay, equipment, and save state.
const modelLoader11=new GLTFLoader();
let heroModel11=null,saruulModel11=null;
function loadCharacter11(url,root,isHero){
  modelLoader11.load(url,gltf=>{
    const model=gltf.scene;
    model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;}});
    // Model coordinates match the existing game character height (~2.5 units).
    if(isHero){
      for(const child of [...root.children]){
        if(child!==blade&&child!==bow)child.visible=false;
      }
      heroModel11=model;
    }else{
      for(const child of [...root.children])child.visible=false;
      saruulModel11=model;
    }
    root.add(model);
    setupJoints12(model,isHero);
  },undefined,error=>{
    console.warn('Character model unavailable; original character retained:',url,error);
  });
}
loadCharacter11('/models/hero.glb',player,true);
loadCharacter11('/models/saruul.glb',npc,false);

// Alpha 1.3 — lightweight procedural joints for existing local GLB assets.
// GLB meshes are authored with baked vertex positions, so group pivots are
// created at anatomical joints without adding bones or extra draw calls.
const joints12={hero:null,saruul:null};
function makePivot12(model,label,pivot,parts){
  const group=new THREE.Group();group.name='joint12_'+label;
  group.position.set(...pivot);model.add(group);
  for(const name of parts){
    const mesh=model.getObjectByName(name);
    if(!mesh)continue;
    // The authored GLBs use identity mesh transforms and baked geometry.
    group.attach(mesh);
  }
  if(label==='head'){
    const extras=[];
    model.traverse(obj=>{if(obj.isMesh && obj.name.startsWith('anime_')) extras.push(obj);});
    for(const mesh of extras)group.attach(mesh);
  }
  return group;
}
function setupJoints12(model,isHero){
  if(isHero){
    joints12.hero={
      leftLeg:makePivot12(model,'leftLeg',[-.25,.96,0],['leg0','boot0']),
      rightLeg:makePivot12(model,'rightLeg',[.25,.96,0],['leg1','boot1']),
      leftArm:makePivot12(model,'leftArm',[-.56,1.65,0],['arm0','gauntlet0','shoulder0']),
      rightArm:makePivot12(model,'rightArm',[.56,1.65,0],['arm1','gauntlet1','shoulder1']),
      head:makePivot12(model,'head',[0,1.94,0],['face','neck','hair','fringe','fringe2','eye0','eye1']),
      cape:makePivot12(model,'cape',[0,1.82,-.27],['cape'])
    };
  }else{
    joints12.saruul={
      leftArm:makePivot12(model,'leftArm',[-.44,1.61,0],['sleeve0','hand0']),
      rightArm:makePivot12(model,'rightArm',[.44,1.61,0],['sleeve1','hand1']),
      head:makePivot12(model,'head',[0,1.92,0],['face','neck','hair_cap','hair_back','hair_tail','bang_left','bang_right','eye0','eye1']),
      leftFoot:makePivot12(model,'leftFoot',[-.18,.22,0],['shoe0']),
      rightFoot:makePivot12(model,'rightFoot',[.18,.22,0],['shoe1'])
    };
  }
}
function animateCharacters12(now,dt,walking){
  const t=now*.001;
  const h=joints12.hero;
  if(h&&heroModel11){
    const speed=state.dodge>0?2.0:1;
    const stride=walking?Math.sin(t*10*speed):0;
    const swing=state.attacking>0?Math.sin((.24-state.attacking)/.24*Math.PI):0;
    const blend=Math.min(1,dt*16);
    const ease=(joint,axis,value)=>{joint.rotation[axis]+=(value-joint.rotation[axis])*blend;};
    ease(h.leftLeg,'x',stride*.58);
    ease(h.rightLeg,'x',-stride*.58);
    ease(h.leftArm,'x',-stride*.32);
    ease(h.rightArm,'x',stride*.32-swing*1.45);
    ease(h.rightArm,'z',-swing*.35);
    ease(h.head,'y',Math.sin(t*1.3)*.045);
    ease(h.cape,'x',-.08-(walking?.16:0)+Math.sin(t*3)*.045);
    heroModel11.position.y=walking?Math.abs(Math.sin(t*10*speed))*.045:Math.sin(t*2)*.015;
  }
  const n=joints12.saruul;
  if(n&&saruulModel11){
    n.leftArm.rotation.z=-.08+Math.sin(t*1.4)*.075;
    n.rightArm.rotation.z=.08-Math.sin(t*1.4)*.075;
    n.head.rotation.y=Math.sin(t*.85)*.11;
    n.head.rotation.z=Math.sin(t*.7)*.025;
    n.leftFoot.rotation.x=Math.sin(t*.8)*.02;
    n.rightFoot.rotation.x=-Math.sin(t*.8)*.02;
    saruulModel11.position.y=Math.sin(t*1.7)*.013;
  }
}

// Alpha 0.9 FIX: solid building collisions and enterable interiors.
const houses09=[
  [-9,10],[-3,14],[5,14],[12,9],[-11,1],[14,0],[-7,-12],[8,-14]
];
const houseNames09=['Зэвсгийн дэлгүүр','Дэн буудал','Эд зүйлсийн дэлгүүр'];
let inside09=-1;
const interior09=new THREE.Group();
scene.add(interior09);
const interiorOrigin09=new THREE.Vector3(-48,0,47);
const interiorFloor09=new THREE.MeshStandardMaterial({color:0x9a7651,roughness:.92});
const interiorWall09=new THREE.MeshStandardMaterial({color:0xcbb79b,roughness:1});
const interiorWood09=new THREE.MeshStandardMaterial({color:0x59412f,roughness:.9});
function furniture09(w,h,d,mat,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;
  interior09.add(mesh);return mesh;
}
// The interior is a separate, compact room in the same 3D scene.
interior09.position.copy(interiorOrigin09);
furniture09(9,.2,9,interiorFloor09,0,-.08,0);
furniture09(.3,4,9,interiorWall09,-4.5,2,0);
furniture09(.3,4,9,interiorWall09,4.5,2,0);
furniture09(9,4,.3,interiorWall09,0,2,-4.5);
const ceiling09=furniture09(9,.25,9,interiorWood09,0,4.1,0);
ceiling09.visible=false; // top-down third-person camera must see the room
furniture09(3,1,1.15,interiorWood09,0,.5,-2.8);
furniture09(1.6,.14,1.6,interiorWood09,-2,.9,0);
furniture09(.25,.85,.25,interiorWood09,-2,.45,0);
furniture09(1.7,.6,2.5,interiorWood09,2.6,.3,-1.7);
furniture09(1.6,.12,2.3,blue08,2.6,.68,-1.7);
const roomLamp09=new THREE.PointLight(0xffd59a,2.2,12);
roomLamp09.position.set(0,3.4,0);
interior09.add(roomLamp09);
interior09.visible=false;
const roomTitle09=document.createElement('div');
roomTitle09.style.cssText='position:absolute;left:50%;top:12%;transform:translateX(-50%);z-index:6;color:#ffe1a4;background:#172333cc;padding:8px 12px;border-radius:9px;pointer-events:none;display:none;font-size:13px';
document.querySelector('#app').appendChild(roomTitle09);
function nearDoor09(){
  const px=player.position.x,pz=player.position.z;
  return houses09.findIndex(([x,z])=>Math.abs(px-x)<1.25&&Math.abs(pz-(z+3.2))<2);
}
function enterHouse09(index){
  inside09=index;
  interior09.visible=true;
  player.position.set(interiorOrigin09.x,0,interiorOrigin09.z+2.6);
  state.target=null;
  roomTitle09.style.display='block';
  roomTitle09.textContent='⌂ '+houseNames09[index%3]+' · Гарах: ✦ Судлах';
  msg('Байшинд орлоо');
}
function exitHouse09(){
  const [x,z]=houses09[inside09];
  inside09=-1;
  interior09.visible=false;
  roomTitle09.style.display='none';
  player.position.set(x,0,z+4.7);
  state.target=null;
  msg('Хотоос гарлаа');
}
const previousInteract09=interactWorld06;
interactWorld06=function(){
  if(inside09>=0){exitHouse09();return;}
  if(!inDungeon07){
    const door=nearDoor09();
    if(door>=0){enterHouse09(door);return;}
  }
  previousInteract09();
};
function blocked09(x,z){
  const radius=.42;
  if(inside09>=0){
    const lx=x-interiorOrigin09.x,lz=z-interiorOrigin09.z;
    return Math.abs(lx)>4.05-radius||Math.abs(lz)>4.05-radius;
  }
  if(inDungeon07){return Math.hypot(x-48,z+48)>14-radius;}
  for(const [hx,hz] of houses09){
    // Buildings are solid; entering uses the actual door interaction.
    if(Math.abs(x-hx)<2.4+radius&&Math.abs(z-hz)<2.25+radius)return true;
  }
  return false;
}
function moveSafely09(dx,dz){
  const p=player.position;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.18));
  dx/=steps;dz/=steps;
  for(let i=0;i<steps;i++){
    if(!blocked09(p.x+dx,p.z))p.x+=dx;
    if(!blocked09(p.x,p.z+dz))p.z+=dz;
  }
}

// Alpha 1.3 — clearly visible, pooled lightweight combat feedback.
const fx13=[];
const fxArcMat13=new THREE.MeshBasicMaterial({color:0x92f3ff,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
const fxGoldMat13=new THREE.MeshBasicMaterial({color:0xffd487,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
const arcGeo13=new THREE.RingGeometry(1.25,1.48,32,1,-Math.PI*.25,Math.PI*1.05);
function slashFx13(power=0){
  if(inside09>=0)return;
  const mesh=new THREE.Mesh(arcGeo13,power?fxGoldMat13.clone():fxArcMat13.clone());
  mesh.position.copy(player.position).add(new THREE.Vector3(Math.sin(player.rotation.y)*1.05,1.35,Math.cos(player.rotation.y)*1.05));
  mesh.rotation.set(-.25,player.rotation.y,Math.PI*.2);
  mesh.scale.setScalar(power?1.35:1);
  scene.add(mesh);fx13.push({mesh,age:0,life:.27,kind:'slash'});
}
const sparkGeo13=new THREE.OctahedronGeometry(.095,0);
function impactFx13(position,damage){
  for(let i=0;i<7;i++){
    const mesh=new THREE.Mesh(sparkGeo13,i%2?fxGoldMat13.clone():fxArcMat13.clone());
    mesh.position.copy(position).add(new THREE.Vector3(0,1.4,0));
    scene.add(mesh);
    const a=i*Math.PI*2/7;
    fx13.push({mesh,age:0,life:.4,kind:'spark',velocity:new THREE.Vector3(Math.cos(a)*2.8,1.5+(i%3),Math.sin(a)*2.8)});
  }
  const label=document.createElement('div');
  label.className='damage-number13';label.textContent='−'+damage;
  document.querySelector('#app').appendChild(label);
  fx13.push({label,world:position.clone().add(new THREE.Vector3(0,2.4,0)),age:0,life:.75,kind:'number'});
}
function updateFx13(dt){
  for(let i=fx13.length-1;i>=0;i--){
    const f=fx13[i];f.age+=dt;
    if(f.age>=f.life){if(f.mesh){scene.remove(f.mesh);f.mesh.material.dispose()}if(f.label)f.label.remove();fx13.splice(i,1);continue;}
    const k=1-f.age/f.life;
    if(f.mesh){f.mesh.material.opacity=k*.92;
      if(f.kind==='slash'){f.mesh.rotation.z+=dt*5;f.mesh.scale.multiplyScalar(1+dt*.9)}
      else {f.mesh.position.addScaledVector(f.velocity,dt);f.velocity.y-=dt*8;f.mesh.scale.setScalar(Math.max(.1,k));}
    }
    if(f.label){const projected=f.world.clone().add(new THREE.Vector3(0,f.age*1.1,0)).project(camera);
      f.label.style.left=`${(projected.x*.5+.5)*100}%`;
      f.label.style.top=`${(-projected.y*.5+.5)*100}%`;
      f.label.style.opacity=projected.z<1?String(k):'0';}
  }
}
const state={hp:100+Math.max(0,level-1)*10+armorRank18*8+talents19[2]*12,max:100+Math.max(0,level-1)*10+armorRank18*8+talents19[2]*12,weapon:0,angle:0,pitch:.3,target:null,attacking:0,cool:0,dodge:0,skillCool:[0,0,0]};const keys=new Set();let move={x:0,y:0},lookPointer=null,lastLook=null;
// Alpha 1.7 — mobile quality-of-life: quick heal, quest journal, achievements, town return.
const quick17=document.createElement('button');quick17.id='quickPotion17';quick17.textContent='❤️ Эм';
document.querySelector('#app').appendChild(quick17);
quick17.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();usePotion16()});
const journal17=document.createElement('button');journal17.id='journal17';journal17.textContent='📜 Quest';
document.querySelector('#panel').appendChild(journal17);
const return17=document.createElement('button');return17.id='return17';return17.textContent='⌂ Хот';
document.querySelector('#panel').appendChild(return17);
function showJournal17(){
 const progress=questComplete?'Биелсэн':questAccepted?`${Math.min(questKills16,3)}/3 мангас`:'Аваагүй';
 const rows=[['Анхны анчин',totalKills>=1],['10 мангас ялсан',totalKills>=10],['Boss ялсан',bossWins07>=1],['5-р түвшинд хүрсэн',level>=5]];
 openWindow('📜 Даалгавар ба амжилт',`<p><b>Саруулын даалгавар:</b> ${progress}</p><p><b>Нийт ялалт:</b> ${totalKills} · <b>Boss:</b> ${bossWins07} · <b>Level:</b> ${level}</p><h3>🏆 Амжилтууд</h3>${rows.map(([name,done])=>`<p>${done?'✅':'🔒'} ${name}</p>`).join('')}<small>Амжилт бүрийг анх биелүүлэхэд 40 алт өгнө.</small>`);
}
function returnTown17(){
 if(inside09>=0){msg('Эхлээд байшингаас гараарай');return}
 if(inDungeon07){msg('Dungeon-оос гарах хаалгаар буцна');return}
 if(player.position.distanceTo(npc.position)<9){msg('Аль хэдийн хотод байна');return}
 player.position.set(2,0,4);state.target=null;msg('⌂ Эхлэл хотод ирлээ');
}
function checkAchievements17(){
 const rules=[['hunter',totalKills>=1],['slayer',totalKills>=10],['boss',bossWins07>=1],['level5',level>=5]];
 for(const [id,met] of rules){if(met&&!achievements17.includes(id)){achievements17.push(id);gold+=40;saveGame();msg('🏆 Амжилт нээгдлээ! +40 алт')}}
}
journal17.addEventListener('click',showJournal17);
return17.addEventListener('click',returnTown17);
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyJ')showJournal17();if(e.code==='KeyT')returnTown17()});
// Alpha 1.9 Skill Tree — upgrades persist in the same existing save slot.
const skillTreeBtn19=document.createElement('button');skillTreeBtn19.id='skillTree19';skillTreeBtn19.textContent='🌟 Skills';panel.appendChild(skillTreeBtn19);
function showSkillTree19(){
 openWindow('🌟 Skill Tree',`<p>Чөлөөт оноо: <b>${talentPoints19}</b> · Түвшин ${level}</p><small>Түвшин ахих бүрд 1 оноо авна. Нэг чадвар дээд тал нь 5 түвшинтэй.</small>${talentNames19.map((name,i)=>`<p><b>${name}</b> ${talents19[i]}/5<br><small>${['Илдний damage +4','Нумны damage +4','Max HP +12','Skill damage +6'][i]} / түвшин</small> <button data-talent19="${i}" ${talentPoints19<1||talents19[i]>=5?'disabled':''}>+1</button></p>`).join('')}`);
 win.querySelectorAll('[data-talent19]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.talent19);if(talentPoints19<1||talents19[i]>=5)return;talentPoints19--;talents19[i]++;if(i===2){state.max+=12;state.hp+=12}saveGame();msg('🌟 Ур чадвар нэмэгдлээ');showSkillTree19()});
}
skillTreeBtn19.addEventListener('click',showSkillTree19);
window.addEventListener('keydown',e=>{if(e.code==='KeyK'&&!e.repeat)showSkillTree19()});
// Equipment forge: rank upgrades cost both gold and enemy loot; no external services.
const forge18=document.createElement('button');forge18.id='forge18';forge18.textContent='⚒️ Forge';panel.appendChild(forge18);
const bountyBtn18=document.createElement('button');bountyBtn18.id='bounty18';bountyBtn18.textContent='🎯 Bounty';panel.appendChild(bountyBtn18);
const logBtn18=document.createElement('button');logBtn18.id='log18';logBtn18.textContent='📋 Log';panel.appendChild(logBtn18);
function showForge18(){
 const ranks=[swordRank18,bowRank18,armorRank18],names=['⚔️ Илд','🏹 Нум','🛡️ Хуяг'];
 openWindow('⚒️ Дархны газар',`<p>🪙 ${gold} алт · ⛏️ ${ore18} хүдэр · 💎 ${crystal18} кристалл</p><small>Сайжруулалт 10 хүртэл. Илд/нумын гэмтэл +5, хуягны HP +8.</small>${names.map((n,i)=>{const r=ranks[i],price=50+(r*35),metal=2+r,gem=r>=3?1+Math.floor((r-3)/3):0;return `<p>${n} +${r} ${r>=10?'(MAX)':`<button data-upgrade18="${i}">+1 · ${price} алт, ${metal} хүдэр${gem?', '+gem+' кристалл':''}</button>`}</p>`}).join('')}`);
 win.querySelectorAll('[data-upgrade18]').forEach(btn=>btn.onclick=()=>upgrade18(Number(btn.dataset.upgrade18)));
}
function upgrade18(i){
 const rank=[swordRank18,bowRank18,armorRank18][i];if(rank>=10){msg('Хамгийн дээд түвшин');return}
 const price=50+rank*35,metal=2+rank,gem=rank>=3?1+Math.floor((rank-3)/3):0;
 if(gold<price||ore18<metal||crystal18<gem){msg('Алт эсвэл материал хүрэлцэхгүй');return}
 gold-=price;ore18-=metal;crystal18-=gem;
 if(i===0)swordRank18++;else if(i===1)bowRank18++;else{armorRank18++;state.max+=8;state.hp+=8}
 saveGame();logBattle18('⚒️ Тоноглол сайжруулав');msg('⚒️ Сайжруулалт амжилттай');showForge18();
}
function showBounty18(){
 const target=5,ready=bounty18>=target;
 openWindow('🎯 Анчдын гэрээ',`<p>Энгийн дайснаас ${target} ялалт байгуул.</p><p>Явц: <b>${Math.min(target,bounty18)}/${target}</b></p><p>Шагнал: 🪙 150 алт · ⛏️ 4 хүдэр · 💎 1 кристалл · 90 EXP</p><p>Гүйцэтгэсэн гэрээ: ${bountyClaims18}</p><button id="claimBounty18" ${ready?'':'disabled'}>🎁 Шагнал авах</button>`);
 document.querySelector('#claimBounty18').onclick=()=>{if(bounty18<5)return;bounty18-=5;bountyClaims18++;gold+=150;ore18+=4;crystal18++;gainXp(90);saveGame();msg('🎯 Гэрээний шагнал авлаа');showBounty18()};
}
function showLog18(){openWindow('📋 Тулааны тэмдэглэл',battleLog18.length?battleLog18.map(t=>`<p>• ${t}</p>`).join(''):'<p>Одоохондоо тулаан хийгээгүй.</p>')}
forge18.addEventListener('click',showForge18);bountyBtn18.addEventListener('click',showBounty18);logBtn18.addEventListener('click',showLog18);
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyG')showForge18();if(e.code==='KeyB')showBounty18()});
const toast=document.querySelector('#toast');let toastUntil=0;function msg(t){toast.textContent=t;toast.style.opacity=1;toastUntil=performance.now()+1400}
function closest(){if(inside09>=0)return null;let best=null,dist=Infinity;for(const e of enemies){if(!e.alive||(e.boss&&!inDungeon07))continue;const d=e.g.position.distanceTo(player.position);if(d<dist){best=e;dist=d}}return best}
function lock(){state.target=state.target?.alive?null:closest();msg(state.target?'Дайсан сонголоо':'Бай цуцаллаа')}
function swap(){state.weapon=1-state.weapon;blade.visible=!state.weapon;bow.visible=!!state.weapon;msg(state.weapon?'Нум':'Хоёр гарын илд')}
function hit(damage=25,range=2.8){if(state.hp<=0)return;damage+=(state.weapon?bowRank18*5+talents19[1]*4:swordRank18*5+talents19[0]*4);state.attacking=.24;state.cool=.4;const e=state.target?.alive?state.target:closest();if(!e)return;const dist=e.g.position.distanceTo(player.position);if(dist>range){msg('Дайсан хэт хол байна');return}const to=e.g.position.clone().sub(player.position);const facing=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));if(to.normalize().dot(facing)<-.2&&!state.target){msg('Дайсан ард байна');return}impactFx13(e.g.position,damage);e.hp=Math.max(0,e.hp-damage);e.m.material.color.setHex(0xff8e65);setTimeout(()=>{if(e.alive)e.m.material.color.setHex(e.baseColor||0x963d42)},130);if(e.hp<=0){e.alive=false;e.g.visible=false;e.respawn=e.boss?999999:12;state.target=null;if(e.boss){ore18+=8;crystal18+=3;logBattle18('☠ Boss: +8 хүдэр, +3 кристалл');bossWins07++;gold+=250;gainXp(220);inventory.push('Сүүдрийн хамгаалагчийн тэмдэг');saveGame();msg('☠ BOSS яллаа! +250 алт · +220 EXP');}else{ore18+=(e.elite?4:1)+(totalKills%3===0?1:0);if(totalKills%5===4)crystal18++;bounty18++;logBattle18('⚔️ Дайсан: +10 алт, +35 EXP, +хүдэр');questKills16+=questAccepted&&!questComplete?1:0;totalKills++;gold+=e.elite?45:e.fast?15:10;gainXp(e.elite?90:e.fast?45:35);}if(!e.boss&&questAccepted&&!questComplete&&questKills16>=3){questComplete=true;gold+=100;if(!inventory.includes('Ойн хамгаалагчийн сахиус'))inventory.push('Ойн хамгаалагчийн сахиус');saveGame();msg('Даалгавар биеллээ! +100 алт')}else if(!e.boss){saveGame();msg('Дайсныг яллаа! +10 алт · +35 EXP')}}else msg(`-${damage} HP`)}
function attack(){if(state.cool>0)return;slashFx13(0);const e=state.target?.alive?state.target:closest();if(e){const to=e.g.position.clone().sub(player.position);if(to.length()>0.01)player.rotation.y=Math.atan2(to.x,to.z)}hit(state.weapon?18:28,state.weapon?17:3)}
function dodge(){if(state.dodge>0)return;slashFx13(1);state.dodge=.42;msg('Бултлаа')}
function skill(i){if(state.skillCool[i]>0)return;state.skillCool[i]=[3,6,10][i];slashFx13(1);const dmg=[35,48,70][i]+talents19[3]*6;const range=state.weapon?17:4;hit(dmg,range)}
window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyX')swap();if(e.code==='Space')dodge();if(e.code==='Tab')lock();if(e.code==='Digit1')skill(0);if(e.code==='Digit2')skill(1);if(e.code==='Digit3')skill(2)});window.addEventListener('keyup',e=>keys.delete(e.code));
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)attack();lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;state.angle-=(e.clientX-lastLook.x)*.006;state.pitch=THREE.MathUtils.clamp(state.pitch+(e.clientY-lastLook.y)*.004,-.2,.85);lastLook={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null}});
const pad=document.querySelector('#pad'),stick=document.querySelector('#stick');let padId=null;function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>48){dx*=48/len;dy*=48/len}move={x:dx/48,y:-dy/48};stick.style.transform=`translate(${dx}px,${dy}px)`}pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e)});function stopPad(){padId=null;move={x:0,y:0};stick.style.transform='translate(0,0)'}pad.addEventListener('pointerup',stopPad);pad.addEventListener('pointercancel',stopPad);
for(const [id,fn] of Object.entries({attack,dodge,switch:swap,lock,skill1:()=>skill(0),skill2:()=>skill(1),skill3:()=>skill(2)}))document.querySelector('#'+id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});
// Alpha 2.1 — distinctive skill icons with accessible names and cooldown labels.
const skillVisual21=[['✦','Цохилтын давалгаа','slash'],['⚡','Шуурхай дайралт','rush'],['✹','Хүчтэй цохилт','burst']];
skillVisual21.forEach(([glyph,label,style],i)=>{const b=document.getElementById('skill'+(i+1));b.classList.add('skill21','skill-'+style+'21');b.title=label;b.setAttribute('aria-label',label);b.innerHTML='<span class="skillGlyph21">'+glyph+'</span><span class="skillIndex21">'+(i+1)+'</span><span class="skillCooldown21"></span>';});
function updateSkills21(){skillVisual21.forEach((_,i)=>{const b=document.getElementById('skill'+(i+1));const remain=state.skillCool[i];b.classList.toggle('cooling21',remain>.05);b.querySelector('.skillCooldown21').textContent=remain>.05?Math.ceil(remain)+'s':'';b.style.setProperty('--cool21',String(Math.min(100,remain/[3,6,10][i]*100))+'%');});}

// Alpha 2.2 Living World: additive systems. Existing character/animation code untouched.
const living22=new THREE.Group();scene.add(living22);
const mat22=(c,emissive=0)=>new THREE.MeshStandardMaterial({color:c,roughness:.82,emissive,emissiveIntensity:emissive?.28:0});
const wood22=mat22(0x6e4932),stone22=mat22(0x77847c),leaf22=mat22(0x327e60),magic22=mat22(0x68d6d0,0x236f78);
function piece22(parent,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
// Mobile-friendly moving townsfolk; do not modify hero rig or animation.
const citizens22=[
 {name:'Болд · Дархан',x:-8,z:4,color:0xa67a58,axis:0,range:3},
 {name:'Номин · Худалдаачин',x:8,z:6,color:0x6d9eb9,axis:1,range:3},
 {name:'Тэмүүлэн · Судлаач',x:0,z:-6,color:0x9a83c8,axis:0,range:5},
 {name:'Энхээ · Аялагч',x:12,z:-8,color:0xb5a064,axis:1,range:4}
].map((c,i)=>{const g=new THREE.Group();g.position.set(c.x,0,c.z);living22.add(g);piece22(g,new THREE.CylinderGeometry(.32,.42,1.15,8),mat22(c.color),0,.85,0);piece22(g,new THREE.SphereGeometry(.29,10,8),mat22(0xe9c5a6),0,1.65,0);piece22(g,new THREE.ConeGeometry(.4,.33,8),mat22(0x443d43),0,1.98,0);return {...c,g,phase:i*1.8};});
// New walkable outdoor regions (existing scene ground and navigation retained).
const grove22=new THREE.Group();grove22.position.set(-36,0,-43);living22.add(grove22);
for(let i=0;i<11;i++){const a=i*2.399,r=4+(i%4)*2.3,x=Math.cos(a)*r,z=Math.sin(a)*r;piece22(grove22,new THREE.CylinderGeometry(.17,.26,3,6),wood22,x,1.5,z);piece22(grove22,new THREE.ConeGeometry(1.15,3.2,7),leaf22,x,4,z)}
const groveStone22=piece22(grove22,new THREE.OctahedronGeometry(1.25),magic22,0,1.65,0);
piece22(grove22,new THREE.CylinderGeometry(3.1,3.4,.2,12),stone22,0,.05,0);
const ruins22=new THREE.Group();ruins22.position.set(36,0,-44);living22.add(ruins22);
for(let i=0;i<6;i++){const a=i*Math.PI/3;piece22(ruins22,new THREE.CylinderGeometry(.4,.5,3.5,7),stone22,Math.cos(a)*4,1.75,Math.sin(a)*4)}
piece22(ruins22,new THREE.TorusGeometry(2.1,.18,8,24),magic22,0,2.9,-1).rotation.y=Math.PI/2;
const ruinsRelic22=piece22(ruins22,new THREE.DodecahedronGeometry(.72),mat22(0xe0b15b,0x6b4318),0,1.15,0);
// Distinct interior dressing, activated only in the matching house.
const rooms22=[new THREE.Group(),new THREE.Group(),new THREE.Group()];
rooms22.forEach(g=>interior09.add(g));
// Armory: anvil, weapon racks.
piece22(rooms22[0],new THREE.BoxGeometry(1.6,.65,.9),stone22,0,.65,-2.1);
for(const x of [-2.8,2.8]){piece22(rooms22[0],new THREE.BoxGeometry(.25,2.4,.3),wood22,x,1.3,-3.2);piece22(rooms22[0],new THREE.BoxGeometry(1.1,.12,.15),magic22,x,2.1,-3)}
// Inn: bed, fireplace and table.
for(const x of [-2.8,2.8]){piece22(rooms22[1],new THREE.BoxGeometry(1.5,.4,2.2),wood22,x,.4,-1.4);piece22(rooms22[1],new THREE.BoxGeometry(1.3,.17,.55),mat22(0xe6d5a4),x,.7,-2.1)}
piece22(rooms22[1],new THREE.BoxGeometry(1.1,1.5,.5),mat22(0x8d5338,0x4c2410),0,.85,-4);
// General store: shelves and supply crates.
for(const x of [-3.2,3.2])for(let y=.8;y<3;y+=.8){piece22(rooms22[2],new THREE.BoxGeometry(1.6,.15,.7),wood22,x,y,-2.6);piece22(rooms22[2],new THREE.BoxGeometry(.45,.42,.45),mat22(0xb68c57),x,y+.3,-2.6)}
function refreshRoom22(){rooms22.forEach((g,i)=>g.visible=inside09>=0&&inside09%3===i)}
const oldEnter22=enterHouse09;enterHouse09=function(i){oldEnter22(i);refreshRoom22();msg(['⚒ Дархны газар','🛏 Дэн буудал','🛒 Худалдааны газар'][i%3])};
const oldExit22=exitHouse09;exitHouse09=function(){oldExit22();refreshRoom22()};
let story22=Number(saved.story22)||0,storyReward22=!!saved.storyReward22,groveFound22=!!saved.groveFound22,ruinFound22=!!saved.ruinFound22;
let mp22=Math.min(100,Math.max(0,Number(saved.mp22??100))),mpMax22=100;
const saveOriginal22=saveGame;saveGame=function(){saveOriginal22();try{const d=JSON.parse(localStorage.getItem(saveKey)||'{}');Object.assign(d,{story22,storyReward22,groveFound22,ruinFound22,mp22});localStorage.setItem(saveKey,JSON.stringify(d))}catch{}};
const storyButton22=document.createElement('button');storyButton22.id='story22';storyButton22.textContent='📖 Түүх';panel.appendChild(storyButton22);
const mapButton22=document.createElement('button');mapButton22.id='map22';mapButton22.textContent='🧭 Газрын зураг';panel.appendChild(mapButton22);
const mpHud22=document.createElement('div');mpHud22.id='mpHud22';mpHud22.innerHTML='<div id="mpFill22"></div><span id="mpText22">MP 100/100</span>';document.getElementById('hud').appendChild(mpHud22);
const worldHint22=document.createElement('div');worldHint22.id='worldHint22';app.appendChild(worldHint22);
function storyWindow22(){const stage=[
 'Саруул хотын ойролцоо нууцлаг талстын гэрэл үзэгдсэн тухай ярив. Шидэт ойд очиж талстыг судал.',
 'Шидэт ойн талстыг оллоо. Одоо зүүн талын Эртний балгас руу очиж дурсгалыг судал.',
 'Балгасын дурсгал олдлоо. Хотод буцаж Саруулд мэдээ хүргэ.',
 'Эхний бүлэг дууссан. Дараагийн адал явдалд бэлэн!'
 ];openWindow('📖 Саруулын түүх · I бүлэг',`<p>${stage[Math.min(3,story22)]}</p><p>Шидэт ой: (-36, -43)<br>Эртний балгас: (36, -44)</p><p>Шагнал: 250 алт, 150 EXP, 2 кристалл</p>${story22===0?'<button id="startStory22">Адал явдал эхлүүлэх</button>':''}`);
 const b=document.getElementById('startStory22');if(b)b.onclick=()=>{story22=1;saveGame();closeWindow();msg('📖 I бүлэг эхэллээ')};}
storyButton22.onclick=storyWindow22;
mapButton22.onclick=()=>openWindow('🧭 Аяллын газрын зураг',`<p>🏘 Эхлэл хот: (0, 0)</p><p>🌲 Шидэт ой: (-36, -43) · Талст</p><p>🏛 Эртний балгас: (36, -44) · Дурсгал</p><p>☠ Dungeon: (48, -38)</p><p>Тоглогч: (${Math.round(player.position.x)}, ${Math.round(player.position.z)})</p>`);
const oldTalk22=talk;talk=function(){if(player.position.distanceTo(npc.position)<6&&story22===3&&!storyReward22){storyReward22=true;story22=4;gold+=250;crystal18+=2;gainXp(150);saveGame();msg('📖 Түүх дууслаа! +250 алт +150 EXP +2 талст');storyWindow22();return}oldTalk22()};
const oldInteract22=interactWorld06;interactWorld06=function(){
 if(inside09>=0){const r=inside09%3;openWindow(['⚒ Дархны газар','🛏 Дэн буудал','🛒 Худалдааны газар'][r],'<p>Үйлчилгээ сонгоно уу.</p><button id="service22">Үйлчилгээ авах</button><button id="leave22">🚪 Гарах</button>');document.getElementById('leave22').onclick=()=>{closeWindow();exitHouse09()};document.getElementById('service22').onclick=()=>{closeWindow();if(r===0)showForge18();else if(r===1){state.hp=state.max;mp22=mpMax22;saveGame();msg('🛏 HP/MP сэргэлээ')}else showShop16()};return}
 if(!inDungeon07){const citizen=citizens22.find(c=>c.g.position.distanceTo(player.position)<3.5);if(citizen){openWindow(citizen.name,`<p>${citizen.name.includes('Дархан')?'Сайн зэвсэг хүсвэл дархны газраар ороорой.':citizen.name.includes('Худалдаачин')?'Худалдааны газар эдгээх эм зардаг.':citizen.name.includes('Судлаач')?'Шидэт ойд талст, балгасанд эртний дурсгал бий.':'Адал явдалд гарахын өмнө дэн буудалд амраарай.'}</p>`);return}
 if(player.position.distanceTo(grove22.position)<4){groveFound22=true;if(story22===1)story22=2;mp22=mpMax22;saveGame();msg('🌲 Шидэт талст оллоо · MP сэргэлээ');return}
 if(player.position.distanceTo(ruins22.position)<4){ruinFound22=true;if(story22===2)story22=3;saveGame();msg('🏛 Дурсгал оллоо · Саруулд буц!');return}}
 oldInteract22();};
const oldSkill22=skill;const skillCosts22=[12,20,32];skill=function(i){if(state.skillCool[i]>0)return;if(mp22<skillCosts22[i]){msg('MP хүрэлцэхгүй · '+skillCosts22[i]+' хэрэгтэй');return}mp22-=skillCosts22[i];oldSkill22(i);saveGame()};
function updateLiving22(now,dt){
 citizens22.forEach(c=>{const t=now*.00032+c.phase,v=Math.sin(t)*c.range;c.g.position.set(c.x+(c.axis===0?v:0),0,c.z+(c.axis===1?v:0));c.g.rotation.y=Math.cos(t)>0?0:Math.PI;});
 groveStone22.rotation.y+=dt*.6;groveStone22.position.y=1.65+Math.sin(now*.002)*.14;
 ruinsRelic22.rotation.y+=dt*.5;mp22=Math.min(mpMax22,mp22+dt*3);
 document.getElementById('mpFill22').style.width=(mp22/mpMax22*100)+'%';document.getElementById('mpText22').textContent='MP '+Math.floor(mp22)+'/'+mpMax22;
 const nearby=inside09>=0?'✦ Судлах: барилгын үйлчилгээ':citizens22.find(c=>c.g.position.distanceTo(player.position)<4)?.name|| (player.position.distanceTo(grove22.position)<5?'🌲 Шидэт ой · ✦ Судлах':player.position.distanceTo(ruins22.position)<5?'🏛 Балгас · ✦ Судлах':'');
 worldHint22.textContent=nearby;
}
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyM')mapButton22.click();if(e.code==='KeyQ')storyButton22.click()});

let prev=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.05);prev=now;updateFx13(dt);checkAchievements17();updateLiving22(now,dt);
state.cool=Math.max(0,state.cool-dt);state.attacking=Math.max(0,state.attacking-dt);state.dodge=Math.max(0,state.dodge-dt);state.skillCool=state.skillCool.map(v=>Math.max(0,v-dt));updateSkills21();
let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+move.x;let z=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+move.y;const len=Math.hypot(x,z);if(len>.1){x/=Math.max(1,len);z/=Math.max(1,len);const dir=new THREE.Vector3(-Math.cos(state.angle)*x+Math.sin(state.angle)*z,0,Math.sin(state.angle)*x+Math.cos(state.angle)*z);moveSafely09(dir.x*dt*(state.dodge>0?13:5),dir.z*dt*(state.dodge>0?13:5));player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-70,70);player.position.z=THREE.MathUtils.clamp(player.position.z,-70,70)}
const walking=len>.1;const stride=walking?Math.sin(now*.012)*.48:0;
animateCharacters12(now,dt,walking);
shrineCrystal06.rotation.y+=dt*.6;shrineCrystal06.position.y=2+Math.sin(now*.002)*.2;portal06.material.opacity=.23+Math.sin(now*.002)*.09;questGem.position.y=3.02+Math.sin(now*.003)*.16;cape.rotation.x=-.12+Math.sin(now*.005)*.05+(walking?-.12:0);leftLeg.rotation.x=stride;rightLeg.rotation.x=-stride;
leftArm.rotation.x=-stride*.7;rightArm.rotation.x=stride*.7-(state.attacking>0?Math.sin(state.attacking*13)*1.15:0);
blade.rotation.z=-.3+Math.sin(state.attacking*19)*1.15;blade.rotation.x=state.attacking>0?Math.sin(state.attacking*20)*.55:0;body.rotation.z=len>.1?Math.sin(now*.012)*.035:0;head.position.y=2.13+(len>.1?Math.sin(now*.016)*.035:0);for(const e of enemies){if(inside09>=0||(e.boss&&!inDungeon07)||(!e.boss&&inDungeon07))continue;if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.hp=e.max;e.g.position.copy(e.home);e.g.visible=true;e.m.material.color.setHex(e.baseColor||0x963d42)}continue}e.cool-=dt;const diff=player.position.clone().sub(e.g.position);const d=diff.length();if(d<9&&d>1.7&&e.g.position.distanceTo(npc.position)>4)e.g.position.addScaledVector(diff.normalize(),dt*(e.boss?(e.hp<e.max*.5?1.9:1.25):e.fast?2.3:e.elite?.95:1.2));e.m.rotation.y+=dt*.5;if(d<(e.boss?3:1.9)&&e.cool<=0&&state.dodge<=0&&(e.boss||Math.hypot(player.position.x,player.position.z)>19)){state.hp=Math.max(0,state.hp-Math.max(1,(e.boss?(e.hp<e.max*.5?32:20):e.elite?17:e.fast?7:9)-armorRank18*2));e.cool=e.boss&&e.hp<e.max*.5?.9:e.fast?1.05:1.5;if(state.hp===0){msg('Та ялагдлаа — дахин эхэлж байна');state.hp=state.max;player.position.set(inDungeon07?48:0,0,inDungeon07?-38:0)}}}
const camTarget=player.position.clone().add(new THREE.Vector3(0,1.55,0));
const cameraDistance10=inside09>=0?3.4:6.8;
const cameraHeight10=inside09>=0?1.05:2.4;
const desiredCamera10=camTarget.clone().add(new THREE.Vector3(
  -Math.sin(state.angle)*cameraDistance10,
  cameraHeight10+state.pitch*(inside09>=0?1.2:4),
  -Math.cos(state.angle)*cameraDistance10
));
if(inside09>=0){
  // Keep the camera INSIDE the room, not inside its side or rear walls.
  desiredCamera10.x=THREE.MathUtils.clamp(desiredCamera10.x,interiorOrigin09.x-3.85,interiorOrigin09.x+3.85);
  desiredCamera10.z=THREE.MathUtils.clamp(desiredCamera10.z,interiorOrigin09.z-3.85,interiorOrigin09.z+3.85);
  desiredCamera10.y=THREE.MathUtils.clamp(desiredCamera10.y,1.55,3.65);
}else if(!inDungeon07){
  // Move camera forward when a house occludes the view.
  const direction10=desiredCamera10.clone().sub(camTarget);
  const distance10=direction10.length();
  const ray10=new THREE.Raycaster(camTarget,direction10.normalize(),.12,distance10);
  const hits10=ray10.intersectObjects(town.children,true);
  if(hits10.length){desiredCamera10.copy(camTarget).addScaledVector(direction10,Math.max(.65,hits10[0].distance-.35));}
}
camera.position.lerp(desiredCamera10,Math.min(1,dt*13));
if(inside09>=0){
  camera.position.x=THREE.MathUtils.clamp(camera.position.x,interiorOrigin09.x-3.85,interiorOrigin09.x+3.85);
  camera.position.z=THREE.MathUtils.clamp(camera.position.z,interiorOrigin09.z-3.85,interiorOrigin09.z+3.85);
  camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.55,3.65);
}
camera.lookAt(camTarget);
bossHud07.style.display=(inDungeon07&&boss07.alive)?'block':'none';document.querySelector('#bossFill07').style.width=`${Math.max(0,boss07.hp/boss07.max*100)}%`;document.querySelector('#bossText07').textContent=boss07.alive?`${boss07.hp} / ${boss07.max} HP · ${boss07.hp<boss07.max*.5?'II үе: Уур хилэн':'I үе'}`:'BOSS ЯЛАГДСАН';document.querySelector('#hpbar').style.width=`${state.hp/state.max*100}%`;document.querySelector('#expfill').style.width=`${xp/(level*80)*100}%`;document.querySelector('#questtext').textContent=!questAccepted?'Саруултай ярилцах':questComplete?'Даалгавар биелсэн — Саруул дээр оч':`Ойн мангас устгах (${Math.min(questKills16,3)}/3)`;document.querySelector('#maparrow').style.transform=`translate(-50%,-50%) rotate(${player.rotation.y}rad)`;document.querySelector('#stats').textContent=`HP ${state.hp}/${state.max} · Lv.${level} (${xp}/${level*80} EXP) · 🪙 ${gold} · ❤️ ${potions16} · ⛏️ ${ore18} · ${state.weapon?'Нум':'Илд'} +${state.weapon?bowRank18:swordRank18}`;document.querySelector('#target').textContent=state.target?.alive?`Бай: ${state.target.hp}/${state.target.max} HP`:'Бай: байхгүй';if(now>toastUntil)toast.style.opacity=0;renderer.render(scene,camera)}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

// Alpha 2.0: landscape-first mobile experience. Orientation lock is best-effort.
const rotateUI = document.createElement('div');
rotateUI.id='rotatePrompt20';
rotateUI.innerHTML='<div class="rotateIcon20">↻</div><h2>ASTRAL RIFT</h2><p>Тоглохын тулд утсаа хэвтүүлээрэй</p><button id="fullscreen20" type="button">⛶ Бүтэн дэлгэцээр тоглох</button><small>Дэлгэц автоматаар эргэхгүй бол утасны Auto-rotate тохиргоог асаана уу.</small>';
document.body.appendChild(rotateUI);
const fullBtn=document.createElement('button');
fullBtn.id='landscapeFullscreen20';fullBtn.type='button';fullBtn.textContent='⛶';fullBtn.title='Бүтэн дэлгэц';fullBtn.setAttribute('aria-label','Бүтэн дэлгэц');
document.body.appendChild(fullBtn);
async function enterLandscape20(){
 try{if(!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();}catch(e){}
 try{if(screen.orientation?.lock) await screen.orientation.lock('landscape');}catch(e){}
 updateLandscape20();
}
function updateLandscape20(){
 const portrait=window.innerHeight>window.innerWidth && matchMedia('(pointer: coarse)').matches;
 rotateUI.classList.toggle('show',portrait);
 fullBtn.style.display=portrait?'none':'block';
}
document.getElementById('fullscreen20').addEventListener('click',enterLandscape20);
fullBtn.addEventListener('click',enterLandscape20);
window.addEventListener('resize',updateLandscape20);
window.addEventListener('orientationchange',updateLandscape20);
updateLandscape20();
