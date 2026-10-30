import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import './style.css';
const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><strong>✦ ASTRAL RIFT <small>ALPHA 0.7</small></strong><div class="bar"><div id="hpbar"></div></div><div class="expbar"><div id="expfill"></div></div><div id="stats"></div><div id="target">Бай: байхгүй</div><div id="hint">WASD хөдөлгөөн • хулганаар камер • click довтлох • X зэвсэг солих • Space бултах • Tab бай сонгох • 1–3 чадвар</div></div><div id="questbox">✦ <b>Саруулын даалгавар</b><div id="questtext">Саруултай уулзаарай</div></div><div id="minimap"><div id="maparrow">▲</div><span>Эхлэл хот</span></div><div id="cross">✧</div><div id="mobile"><div id="pad"><div id="stick"></div></div><div id="actions"><button id="attack">⚔</button><button id="dodge">↝</button><button id="switch">⇄</button><button id="lock">◎</button><button id="skill1">1</button><button id="skill2">2</button><button id="skill3">3</button></div></div><div id="toast"></div>`;
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
const versionLabel=document.createElement('div');versionLabel.id='zoneLabel';versionLabel.textContent='✦ ЭХЛЭЛ ХОТ · Dungeon & Boss';document.querySelector('#app').appendChild(versionLabel);
const saveKey='astral-rift-alpha03-save';let saved={};try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}')}catch{}
let questAccepted=!!saved.questAccepted,questComplete=!!saved.questComplete,gold=Number(saved.gold)||0,inventory=Array.isArray(saved.inventory)?saved.inventory:['Хоёр гарын илд','Нум'];
let level=Math.max(1,Number(saved.level)||1),xp=Math.max(0,Number(saved.xp)||0),totalKills=Number(saved.totalKills)||0;
function saveGame(){try{localStorage.setItem(saveKey,JSON.stringify({questAccepted,questComplete,gold,inventory,level,xp,totalKills,bossWins07}))}catch{}}
function gainXp(amount){xp+=amount;while(xp>=level*80){xp-=level*80;level++;state.max+=10;state.hp=state.max;msg('LEVEL UP! '+level)}saveGame()}

const panel=document.createElement('div');panel.id='panel';panel.innerHTML='<button id="townBtn">NPC / E</button><button id="bagBtn">🎒 Bag / I</button>';document.querySelector('#app').appendChild(panel);
const win=document.createElement('div');win.id='window';document.querySelector('#app').appendChild(win);
function closeWindow(){win.style.display='none'}
function openWindow(title,content){win.innerHTML='<h2>'+title+'</h2>'+content+'<p><button id="closeWindow">Хаах</button></p>';win.style.display='block';document.querySelector('#closeWindow').onclick=closeWindow}
function showBag(){openWindow('🎒 Inventory','<p>'+inventory.join('<br>')+'</p><p>🪙 Алт: '+gold+'</p><p>Зэвсэг солих: ⇄ эсвэл X</p>')}
function talk(){if(player.position.distanceTo(npc.position)>6){msg('NPC-д ойртоорой (хот: x=1, z=7)');return}if(!questAccepted){openWindow('Саруул — Аялагч','<p>Ойн мангасуудаас 3-ыг ялж, хотыг хамгаалаарай.</p><button id="acceptQuest">Даалгавар авах</button>');document.querySelector('#acceptQuest').onclick=()=>{questAccepted=true;killCount=0;saveGame();closeWindow();msg('Даалгавар эхэллээ!')}}else if(questComplete){openWindow('Саруул','<p>Сайн ажиллалаа! Дараагийн 3 мангасыг ялж дахин шагнал аваарай.</p><button id="repeatQuest">Шинэ даалгавар</button>');document.querySelector('#repeatQuest').onclick=()=>{questComplete=false;killCount=0;saveGame();closeWindow();msg('Шинэ даалгавар эхэллээ')}}else{openWindow('Саруул','<p>Ялсан дайсан: '+killCount+'/3</p>')}}
let killCount=0;
document.querySelector('#townBtn').onclick=talk;document.querySelector('#bagBtn').onclick=showBag;
window.addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='KeyE')talk();if(e.code==='KeyI')showBag();if(e.code==='Escape')closeWindow()});
const enemies=[];function spawn(x,z){const g=new THREE.Group();g.position.set(x,0,z);const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.8,0),new THREE.MeshStandardMaterial({color:0x963d42,flatShading:true}));m.position.y=.95;m.castShadow=true;g.add(m);scene.add(g);enemies.push({g,m,hp:100,max:100,alive:true,cool:0,respawn:0,home:new THREE.Vector3(x,0,z)})}
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
const visualVersion08=document.querySelector('#hud small');if(visualVersion08)visualVersion08.textContent='ALPHA 1.1';
versionLabel.textContent='✦ ЭХЛЭЛ ХОТ · ANIME 3D MODELS';


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
  },undefined,error=>{
    console.warn('Character model unavailable; original character retained:',url,error);
  });
}
loadCharacter11('/models/hero.glb',player,true);
loadCharacter11('/models/saruul.glb',npc,false);

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

const state={hp:100+Math.max(0,level-1)*10,max:100+Math.max(0,level-1)*10,weapon:0,angle:0,pitch:.3,target:null,attacking:0,cool:0,dodge:0,skillCool:[0,0,0]};const keys=new Set();let move={x:0,y:0},lookPointer=null,lastLook=null;
const toast=document.querySelector('#toast');let toastUntil=0;function msg(t){toast.textContent=t;toast.style.opacity=1;toastUntil=performance.now()+1400}
function closest(){if(inside09>=0)return null;let best=null,dist=Infinity;for(const e of enemies){if(!e.alive||(e.boss&&!inDungeon07))continue;const d=e.g.position.distanceTo(player.position);if(d<dist){best=e;dist=d}}return best}
function lock(){state.target=state.target?.alive?null:closest();msg(state.target?'Дайсан сонголоо':'Бай цуцаллаа')}
function swap(){state.weapon=1-state.weapon;blade.visible=!state.weapon;bow.visible=!!state.weapon;msg(state.weapon?'Нум':'Хоёр гарын илд')}
function hit(damage=25,range=2.8){if(state.hp<=0)return;state.attacking=.24;state.cool=.4;const e=state.target?.alive?state.target:closest();if(!e)return;const dist=e.g.position.distanceTo(player.position);if(dist>range){msg('Дайсан хэт хол байна');return}const to=e.g.position.clone().sub(player.position);const facing=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));if(to.normalize().dot(facing)<-.2&&!state.target){msg('Дайсан ард байна');return}e.hp=Math.max(0,e.hp-damage);e.m.material.color.setHex(0xff8e65);setTimeout(()=>{if(e.alive)e.m.material.color.setHex(0x963d42)},130);if(e.hp<=0){e.alive=false;e.g.visible=false;e.respawn=e.boss?999999:12;state.target=null;if(e.boss){bossWins07++;gold+=250;gainXp(220);inventory.push('Сүүдрийн хамгаалагчийн тэмдэг');saveGame();msg('☠ BOSS яллаа! +250 алт · +220 EXP');}else{killCount++;totalKills++;gold+=10;gainXp(35);}if(!e.boss&&questAccepted&&!questComplete&&killCount>=3){questComplete=true;gold+=100;if(!inventory.includes('Ойн хамгаалагчийн сахиус'))inventory.push('Ойн хамгаалагчийн сахиус');saveGame();msg('Даалгавар биеллээ! +100 алт')}else if(!e.boss){saveGame();msg('Дайсныг яллаа! +10 алт · +35 EXP')}}else msg(`-${damage} HP`)}
function attack(){if(state.cool>0)return;const e=state.target?.alive?state.target:closest();if(e){const to=e.g.position.clone().sub(player.position);if(to.length()>0.01)player.rotation.y=Math.atan2(to.x,to.z)}hit(state.weapon?18:28,state.weapon?17:3)}
function dodge(){if(state.dodge>0)return;state.dodge=.42;msg('Бултлаа')}
function skill(i){if(state.skillCool[i]>0)return;state.skillCool[i]=[3,6,10][i];const dmg=[35,48,70][i];const range=state.weapon?17:4;hit(dmg,range)}
window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyX')swap();if(e.code==='Space')dodge();if(e.code==='Tab')lock();if(e.code==='Digit1')skill(0);if(e.code==='Digit2')skill(1);if(e.code==='Digit3')skill(2)});window.addEventListener('keyup',e=>keys.delete(e.code));
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)attack();lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;state.angle-=(e.clientX-lastLook.x)*.006;state.pitch=THREE.MathUtils.clamp(state.pitch+(e.clientY-lastLook.y)*.004,-.2,.85);lastLook={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null}});
const pad=document.querySelector('#pad'),stick=document.querySelector('#stick');let padId=null;function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>48){dx*=48/len;dy*=48/len}move={x:dx/48,y:-dy/48};stick.style.transform=`translate(${dx}px,${dy}px)`}pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e)});function stopPad(){padId=null;move={x:0,y:0};stick.style.transform='translate(0,0)'}pad.addEventListener('pointerup',stopPad);pad.addEventListener('pointercancel',stopPad);
for(const [id,fn] of Object.entries({attack,dodge,switch:swap,lock,skill1:()=>skill(0),skill2:()=>skill(1),skill3:()=>skill(2)}))document.querySelector('#'+id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});
let prev=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.05);prev=now;
if(heroModel11)heroModel11.position.y=Math.sin(now*.007)*.025;
if(saruulModel11){saruulModel11.rotation.y=Math.sin(now*.0007)*.12;saruulModel11.position.y=Math.sin(now*.0016)*.015;}state.cool=Math.max(0,state.cool-dt);state.attacking=Math.max(0,state.attacking-dt);state.dodge=Math.max(0,state.dodge-dt);state.skillCool=state.skillCool.map(v=>Math.max(0,v-dt));
let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+move.x;let z=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+move.y;const len=Math.hypot(x,z);if(len>.1){x/=Math.max(1,len);z/=Math.max(1,len);const dir=new THREE.Vector3(-Math.cos(state.angle)*x+Math.sin(state.angle)*z,0,Math.sin(state.angle)*x+Math.cos(state.angle)*z);moveSafely09(dir.x*dt*(state.dodge>0?13:5),dir.z*dt*(state.dodge>0?13:5));player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-70,70);player.position.z=THREE.MathUtils.clamp(player.position.z,-70,70)}
const walking=len>.1;const stride=walking?Math.sin(now*.012)*.48:0;
shrineCrystal06.rotation.y+=dt*.6;shrineCrystal06.position.y=2+Math.sin(now*.002)*.2;portal06.material.opacity=.23+Math.sin(now*.002)*.09;questGem.position.y=3.02+Math.sin(now*.003)*.16;cape.rotation.x=-.12+Math.sin(now*.005)*.05+(walking?-.12:0);leftLeg.rotation.x=stride;rightLeg.rotation.x=-stride;
leftArm.rotation.x=-stride*.7;rightArm.rotation.x=stride*.7-(state.attacking>0?Math.sin(state.attacking*13)*1.15:0);
blade.rotation.z=-.3+Math.sin(state.attacking*19)*1.15;blade.rotation.x=state.attacking>0?Math.sin(state.attacking*20)*.55:0;body.rotation.z=len>.1?Math.sin(now*.012)*.035:0;head.position.y=2.13+(len>.1?Math.sin(now*.016)*.035:0);for(const e of enemies){if(inside09>=0||(e.boss&&!inDungeon07)||(!e.boss&&inDungeon07))continue;if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.hp=e.max;e.g.position.copy(e.home);e.g.visible=true;e.m.material.color.setHex(0x963d42)}continue}e.cool-=dt;const diff=player.position.clone().sub(e.g.position);const d=diff.length();if(d<9&&d>1.7&&e.g.position.distanceTo(npc.position)>4)e.g.position.addScaledVector(diff.normalize(),dt*1.2);e.m.rotation.y+=dt*.5;if(d<(e.boss?3:1.9)&&e.cool<=0&&state.dodge<=0&&(e.boss||Math.hypot(player.position.x,player.position.z)>19)){state.hp=Math.max(0,state.hp-(e.boss?20:9));e.cool=1.5;if(state.hp===0){msg('Та ялагдлаа — дахин эхэлж байна');state.hp=state.max;player.position.set(inDungeon07?48:0,0,inDungeon07?-38:0)}}}
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
bossHud07.style.display=(inDungeon07&&boss07.alive)?'block':'none';document.querySelector('#bossFill07').style.width=`${Math.max(0,boss07.hp/boss07.max*100)}%`;document.querySelector('#bossText07').textContent=boss07.alive?`${boss07.hp} / ${boss07.max} HP`:'BOSS ЯЛАГДСАН';document.querySelector('#hpbar').style.width=`${state.hp/state.max*100}%`;document.querySelector('#expfill').style.width=`${xp/(level*80)*100}%`;document.querySelector('#questtext').textContent=!questAccepted?'Саруултай ярилцах':questComplete?'Даалгавар биелсэн — Саруул дээр оч':`Ойн мангас устгах (${Math.min(killCount,3)}/3)`;document.querySelector('#maparrow').style.transform=`translate(-50%,-50%) rotate(${player.rotation.y}rad)`;document.querySelector('#stats').textContent=`HP ${state.hp}/${state.max} · Lv.${level} (${xp}/${level*80} EXP) · ${state.weapon?'Нум':'Илд'} · Дайсан ${enemies.filter(e=>e.alive).length}`;document.querySelector('#target').textContent=state.target?.alive?`Бай: ${state.target.hp}/${state.target.max} HP`:'Бай: байхгүй';if(now>toastUntil)toast.style.opacity=0;renderer.render(scene,camera)}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
