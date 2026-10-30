import * as THREE from 'three';
import './style.css';
const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><strong>✦ ASTRAL RIFT <small>ALPHA 0.6</small></strong><div class="bar"><div id="hpbar"></div></div><div class="expbar"><div id="expfill"></div></div><div id="stats"></div><div id="target">Бай: байхгүй</div><div id="hint">WASD хөдөлгөөн • хулганаар камер • click довтлох • X зэвсэг солих • Space бултах • Tab бай сонгох • 1–3 чадвар</div></div><div id="questbox">✦ <b>Саруулын даалгавар</b><div id="questtext">Саруултай уулзаарай</div></div><div id="minimap"><div id="maparrow">▲</div><span>Эхлэл хот</span></div><div id="cross">✧</div><div id="mobile"><div id="pad"><div id="stick"></div></div><div id="actions"><button id="attack">⚔</button><button id="dodge">↝</button><button id="switch">⇄</button><button id="lock">◎</button><button id="skill1">1</button><button id="skill2">2</button><button id="skill3">3</button></div></div><div id="toast"></div>`;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x99cde4);scene.fog=new THREE.FogExp2(0xb6d8db,.009);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;app.prepend(renderer.domElement);
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
const versionLabel=document.createElement('div');versionLabel.id='zoneLabel';versionLabel.textContent='✦ ЭХЛЭЛ ХОТ · Forest Ruins';document.querySelector('#app').appendChild(versionLabel);
const saveKey='astral-rift-alpha03-save';let saved={};try{saved=JSON.parse(localStorage.getItem(saveKey)||'{}')}catch{}
let questAccepted=!!saved.questAccepted,questComplete=!!saved.questComplete,gold=Number(saved.gold)||0,inventory=Array.isArray(saved.inventory)?saved.inventory:['Хоёр гарын илд','Нум'];
let level=Math.max(1,Number(saved.level)||1),xp=Math.max(0,Number(saved.xp)||0),totalKills=Number(saved.totalKills)||0;
function saveGame(){try{localStorage.setItem(saveKey,JSON.stringify({questAccepted,questComplete,gold,inventory,level,xp,totalKills}))}catch{}}
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
exploreHint06.textContent='✦ Ойн хаалга · 3 эрдэнэс · Эдгээх талст';
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
const state={hp:100+Math.max(0,level-1)*10,max:100+Math.max(0,level-1)*10,weapon:0,angle:0,pitch:.3,target:null,attacking:0,cool:0,dodge:0,skillCool:[0,0,0]};const keys=new Set();let move={x:0,y:0},lookPointer=null,lastLook=null;
const toast=document.querySelector('#toast');let toastUntil=0;function msg(t){toast.textContent=t;toast.style.opacity=1;toastUntil=performance.now()+1400}
function closest(){let best=null,dist=Infinity;for(const e of enemies){if(!e.alive)continue;const d=e.g.position.distanceTo(player.position);if(d<dist){best=e;dist=d}}return best}
function lock(){state.target=state.target?.alive?null:closest();msg(state.target?'Дайсан сонголоо':'Бай цуцаллаа')}
function swap(){state.weapon=1-state.weapon;blade.visible=!state.weapon;bow.visible=!!state.weapon;msg(state.weapon?'Нум':'Хоёр гарын илд')}
function hit(damage=25,range=2.8){if(state.hp<=0)return;state.attacking=.24;state.cool=.4;const e=state.target?.alive?state.target:closest();if(!e)return;const dist=e.g.position.distanceTo(player.position);if(dist>range){msg('Дайсан хэт хол байна');return}const to=e.g.position.clone().sub(player.position);const facing=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));if(to.normalize().dot(facing)<-.2&&!state.target){msg('Дайсан ард байна');return}e.hp=Math.max(0,e.hp-damage);e.m.material.color.setHex(0xff8e65);setTimeout(()=>{if(e.alive)e.m.material.color.setHex(0x963d42)},130);if(e.hp<=0){e.alive=false;e.g.visible=false;e.respawn=12;state.target=null;killCount++;totalKills++;gold+=10;gainXp(35);if(questAccepted&&!questComplete&&killCount>=3){questComplete=true;gold+=100;if(!inventory.includes('Ойн хамгаалагчийн сахиус'))inventory.push('Ойн хамгаалагчийн сахиус');saveGame();msg('Даалгавар биеллээ! +100 алт')}else {saveGame();msg('Дайсныг яллаа! +10 алт · +35 EXP')}}else msg(`-${damage} HP`)}
function attack(){if(state.cool>0)return;const e=state.target?.alive?state.target:closest();if(e){const to=e.g.position.clone().sub(player.position);if(to.length()>0.01)player.rotation.y=Math.atan2(to.x,to.z)}hit(state.weapon?18:28,state.weapon?17:3)}
function dodge(){if(state.dodge>0)return;state.dodge=.42;msg('Бултлаа')}
function skill(i){if(state.skillCool[i]>0)return;state.skillCool[i]=[3,6,10][i];const dmg=[35,48,70][i];const range=state.weapon?17:4;hit(dmg,range)}
window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyX')swap();if(e.code==='Space')dodge();if(e.code==='Tab')lock();if(e.code==='Digit1')skill(0);if(e.code==='Digit2')skill(1);if(e.code==='Digit3')skill(2)});window.addEventListener('keyup',e=>keys.delete(e.code));
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)attack();lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;state.angle-=(e.clientX-lastLook.x)*.006;state.pitch=THREE.MathUtils.clamp(state.pitch+(e.clientY-lastLook.y)*.004,-.2,.85);lastLook={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null}});
const pad=document.querySelector('#pad'),stick=document.querySelector('#stick');let padId=null;function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>48){dx*=48/len;dy*=48/len}move={x:dx/48,y:-dy/48};stick.style.transform=`translate(${dx}px,${dy}px)`}pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e)});function stopPad(){padId=null;move={x:0,y:0};stick.style.transform='translate(0,0)'}pad.addEventListener('pointerup',stopPad);pad.addEventListener('pointercancel',stopPad);
for(const [id,fn] of Object.entries({attack,dodge,switch:swap,lock,skill1:()=>skill(0),skill2:()=>skill(1),skill3:()=>skill(2)}))document.querySelector('#'+id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});
let prev=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.05);prev=now;state.cool=Math.max(0,state.cool-dt);state.attacking=Math.max(0,state.attacking-dt);state.dodge=Math.max(0,state.dodge-dt);state.skillCool=state.skillCool.map(v=>Math.max(0,v-dt));
let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+move.x;let z=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+move.y;const len=Math.hypot(x,z);if(len>.1){x/=Math.max(1,len);z/=Math.max(1,len);const dir=new THREE.Vector3(-Math.cos(state.angle)*x+Math.sin(state.angle)*z,0,Math.sin(state.angle)*x+Math.cos(state.angle)*z);player.position.addScaledVector(dir,dt*(state.dodge>0?13:5));player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-70,70);player.position.z=THREE.MathUtils.clamp(player.position.z,-70,70)}
const walking=len>.1;const stride=walking?Math.sin(now*.012)*.48:0;
shrineCrystal06.rotation.y+=dt*.6;shrineCrystal06.position.y=2+Math.sin(now*.002)*.2;portal06.material.opacity=.23+Math.sin(now*.002)*.09;questGem.position.y=3.02+Math.sin(now*.003)*.16;cape.rotation.x=-.12+Math.sin(now*.005)*.05+(walking?-.12:0);leftLeg.rotation.x=stride;rightLeg.rotation.x=-stride;
leftArm.rotation.x=-stride*.7;rightArm.rotation.x=stride*.7-(state.attacking>0?Math.sin(state.attacking*13)*1.15:0);
blade.rotation.z=-.3+Math.sin(state.attacking*19)*1.15;blade.rotation.x=state.attacking>0?Math.sin(state.attacking*20)*.55:0;body.rotation.z=len>.1?Math.sin(now*.012)*.035:0;head.position.y=2.13+(len>.1?Math.sin(now*.016)*.035:0);for(const e of enemies){if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.hp=e.max;e.g.position.copy(e.home);e.g.visible=true;e.m.material.color.setHex(0x963d42)}continue}e.cool-=dt;const diff=player.position.clone().sub(e.g.position);const d=diff.length();if(d<9&&d>1.7&&e.g.position.distanceTo(npc.position)>4)e.g.position.addScaledVector(diff.normalize(),dt*1.2);e.m.rotation.y+=dt*.5;if(d<1.9&&e.cool<=0&&state.dodge<=0){state.hp=Math.max(0,state.hp-9);e.cool=1.5;if(state.hp===0){msg('Та ялагдлаа — дахин эхэлж байна');state.hp=state.max;player.position.set(0,0,0)}}}
const camTarget=player.position.clone().add(new THREE.Vector3(0,1.55,0));const offset=new THREE.Vector3(Math.sin(state.angle)*(-6),2.4+state.pitch*5,Math.cos(state.angle)*(-6));camera.position.lerp(camTarget.clone().add(offset),Math.min(1,dt*9));camera.lookAt(camTarget);
document.querySelector('#hpbar').style.width=`${state.hp/state.max*100}%`;document.querySelector('#expfill').style.width=`${xp/(level*80)*100}%`;document.querySelector('#questtext').textContent=!questAccepted?'Саруултай ярилцах':questComplete?'Даалгавар биелсэн — Саруул дээр оч':`Ойн мангас устгах (${Math.min(killCount,3)}/3)`;document.querySelector('#maparrow').style.transform=`translate(-50%,-50%) rotate(${player.rotation.y}rad)`;document.querySelector('#stats').textContent=`HP ${state.hp}/${state.max} · Lv.${level} (${xp}/${level*80} EXP) · ${state.weapon?'Нум':'Илд'} · Дайсан ${enemies.filter(e=>e.alive).length}`;document.querySelector('#target').textContent=state.target?.alive?`Бай: ${state.target.hp}/${state.target.max} HP`:'Бай: байхгүй';if(now>toastUntil)toast.style.opacity=0;renderer.render(scene,camera)}requestAnimationFrame(loop);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
