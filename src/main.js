import { createSamurai53 } from './samurai53.js';
import { createAdvancedFX50 } from './advanced50.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import './style.css';
import { createAlpha40 } from './alpha40.js';
const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><strong>✦ ASTRAL RIFT <small>ALPHA 5.3 · SAMURAI</small></strong><div class="bar"><div id="hpbar"></div></div><div class="expbar"><div id="expfill"></div></div><div id="stats"></div><div id="target">Бай: байхгүй</div><div id="hint">WASD хөдөлгөөн • хулганаар камер • click довтлох • X зэвсэг солих • Space бултах • Tab бай сонгох • 1–3 чадвар</div></div><div id="questbox">✦ <b>Саруулын даалгавар</b><div id="questtext">Саруултай уулзаарай</div></div><div id="minimap"><div id="maparrow">▲</div><span>Эхлэл хот</span></div><div id="cross">✧</div><div id="mobile"><div id="pad"><div id="stick"></div></div><div id="actions"><button id="attack">⚔</button><button id="dodge">↝</button><button id="switch">⇄</button><button id="lock">◎</button><button id="skill1">1</button><button id="skill2">2</button><button id="skill3">3</button></div></div><div id="toast"></div>`;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x99cde4);scene.fog=new THREE.FogExp2(0xb6d8db,.009);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,150);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;app.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdcecff,0x6a5845,2.4));const sun=new THREE.DirectionalLight(0xffe5b0,2);sun.position.set(-22,36,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;scene.add(sun);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshStandardMaterial({color:0x6a895b,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function trunk(x,z){const t=new THREE.Mesh(new THREE.CylinderGeometry(.27,.4,3,7),new THREE.MeshStandardMaterial({color:0x60452f}));t.position.set(x,1.5,z);t.castShadow=true;scene.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(1.7,4.5,8),new THREE.MeshStandardMaterial({color:0x254f3c}));c.position.set(x,4.6,z);c.castShadow=true;scene.add(c)}
for(let i=0;i<65;i++){const a=i*2.399,r=24+(i%9)*4;trunk(Math.cos(a)*r,Math.sin(a)*r)}
for(let i=0;i<9;i++)box(1.8,1.5,1.8,0x727c83,-16+i*4,.75,-17);
const player=new THREE.Group();scene.add(player);
// Alpha 5.3: There is exactly one player visual, a genuine rigged Samurai GLB.
// Preserve world material palette; do not allocate old LEGO body, sword, or bow.
const steel=new THREE.MeshStandardMaterial({color:0x8e9dab,metalness:.8,roughness:.26});
const trim=new THREE.MeshStandardMaterial({color:0x99784b,metalness:.65,roughness:.35});
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
const cyanGlow=new THREE.MeshStandardMaterial({color:0x65e9ff,emissive:0x1e8cb5,emissiveIntensity:1.3,roughness:.3});
function artMesh(parent,geometry,mat,x,y,z,rotY=0){const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);o.rotation.y=rotY;o.castShadow=true;parent.add(o);return o}
// Player appearance is entirely provided by the Samurai GLB.
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
const versionLabel=document.createElement('div');versionLabel.id='zoneLabel';versionLabel.textContent='✦ ЭХЛЭЛ ХОТ';document.querySelector('#app').appendChild(versionLabel);
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
// Character decorations are authored into the Samurai model rather than duplicated.
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
const visualVersion08=document.querySelector('#hud small');if(visualVersion08)visualVersion08.textContent='ALPHA 5.3 · SAMURAI';
versionLabel.textContent='✦ ЭХЛЭЛ ХОТ';


// Alpha 5.3 — Single permanent Samurai avatar, real GLTF skin/animation.
const modelLoader11=new GLTFLoader();
let saruulModel11=null;
let samurai53=null;
const samuraiRoot53=new THREE.Group();
samuraiRoot53.name='SamuraiPlayer53';
player.add(samuraiRoot53);
modelLoader11.load('/models/saruul.glb',gltf=>{
  const model=gltf.scene;
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;}});
  for(const child of [...npc.children]) child.visible=false;
  saruulModel11=model;
  npc.add(model);
  setupJoints12(model);
},undefined,error=>console.warn('Saruul NPC asset unavailable:',error));

const avatarStatus53=document.createElement('div');
avatarStatus53.id='avatar-status-53';
avatarStatus53.setAttribute('role','status');
avatarStatus53.textContent='Samurai дүр ачаалж байна…';
Object.assign(avatarStatus53.style,{position:'fixed',left:'50%',bottom:'12%',transform:'translateX(-50%)',zIndex:'1000',padding:'8px 14px',border:'1px solid #80a7c7',borderRadius:'12px',background:'rgba(12,27,42,.9)',color:'#fff',fontSize:'13px',maxWidth:'80vw',textAlign:'center',pointerEvents:'none'});
document.body.appendChild(avatarStatus53);

modelLoader11.load('/models/samurai-player.glb',gltf=>{
  try{
    samurai53=createSamurai53(THREE,gltf,samuraiRoot53);
    samurai53.setWeapon(state.weapon);
    avatarStatus53.remove();
  }catch(error){
    console.error('Samurai avatar initialization failed',error);
    avatarStatus53.textContent='Samurai animation холбох үед алдаа гарлаа';
  }
},undefined,error=>{
  console.error('Samurai GLB failed to load',error);
  avatarStatus53.textContent='Samurai GLB ачаалсангүй — /models/samurai-player.glb шалгана уу';
});

function updateSamurai53(now,dt,walking){
  if(!samurai53)return;
  const sprint=walking&&(keys.has('ShiftLeft')||keys.has('ShiftRight'));
  samurai53.update({dt,moving:walking,sprinting:sprint,blocking:blocking25,dodging:state.dodge>0,weapon:state.weapon});
}

// Alpha 1.3 — lightweight procedural joints for existing local GLB assets.
// GLB meshes are authored with baked vertex positions, so group pivots are
// created at anatomical joints without adding bones or extra draw calls.
const joints12={saruul:null};
function makePivot12(model,label,pivot,parts){
  const group=new THREE.Group();group.name='joint12_'+label;
  group.position.set(...pivot);model.add(group);
  for(const name of parts){const mesh=model.getObjectByName(name);if(mesh)group.attach(mesh);}
  return group;
}
function setupJoints12(model){
  joints12.saruul={
    leftArm:makePivot12(model,'leftArm',[-.44,1.61,0],['sleeve0','hand0']),
    rightArm:makePivot12(model,'rightArm',[.44,1.61,0],['sleeve1','hand1']),
    head:makePivot12(model,'head',[0,1.92,0],['face','neck','hair_cap','hair_back','hair_tail','bang_left','bang_right','eye0','eye1']),
    leftFoot:makePivot12(model,'leftFoot',[-.18,.22,0],['shoe0']),
    rightFoot:makePivot12(model,'rightFoot',[.18,.22,0],['shoe1'])
  };
}
function animateCharacters12(now,dt,walking){
  const t=now*.001;
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
const state={hp:100+Math.max(0,level-1)*10+armorRank18*8+talents19[2]*12,max:100+Math.max(0,level-1)*10+armorRank18*8+talents19[2]*12,weapon:0,angle:0,pitch:.1,target:null,attacking:0,cool:0,dodge:0,skillCool:[0,0,0]};const keys=new Set();let move={x:0,y:0},lookPointer=null,lastLook=null;
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
function swap(){state.weapon=1-state.weapon;samurai53?.setWeapon(state.weapon);msg(state.weapon?'Нум':'Самурайн илд')}
function hit(damage=25,range=2.8){if(state.hp<=0)return;samurai53?.triggerAttack();damage+=(state.weapon?bowRank18*5+talents19[1]*4:swordRank18*5+talents19[0]*4);state.attacking=.24;state.cool=.4;const e=state.target?.alive?state.target:closest();if(!e)return;const dist=e.g.position.distanceTo(player.position);if(dist>range){msg('Дайсан хэт хол байна');return}const to=e.g.position.clone().sub(player.position);const facing=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));if(to.normalize().dot(facing)<-.2&&!state.target){msg('Дайсан ард байна');return}impactFx13(e.g.position,damage);e.hp=Math.max(0,e.hp-damage);e.m.material.color.setHex(0xff8e65);setTimeout(()=>{if(e.alive)e.m.material.color.setHex(e.baseColor||0x963d42)},130);if(e.hp<=0){e.alive=false;e.g.visible=false;e.respawn=e.boss?999999:12;state.target=null;if(e.boss){ore18+=8;crystal18+=3;logBattle18('☠ Boss: +8 хүдэр, +3 кристалл');bossWins07++;gold+=250;gainXp(220);inventory.push('Сүүдрийн хамгаалагчийн тэмдэг');saveGame();msg('☠ BOSS яллаа! +250 алт · +220 EXP');}else{ore18+=(e.elite?4:1)+(totalKills%3===0?1:0);if(totalKills%5===4)crystal18++;bounty18++;logBattle18('⚔️ Дайсан: +10 алт, +35 EXP, +хүдэр');questKills16+=questAccepted&&!questComplete?1:0;totalKills++;gold+=e.elite?45:e.fast?15:10;gainXp(e.elite?90:e.fast?45:35);}if(!e.boss&&questAccepted&&!questComplete&&questKills16>=3){questComplete=true;gold+=100;if(!inventory.includes('Ойн хамгаалагчийн сахиус'))inventory.push('Ойн хамгаалагчийн сахиус');saveGame();msg('Даалгавар биеллээ! +100 алт')}else if(!e.boss){saveGame();msg('Дайсныг яллаа! +10 алт · +35 EXP')}}else msg(`-${damage} HP`)}
function attack(){if(state.cool>0)return;slashFx13(0);const e=state.target?.alive?state.target:closest();if(e){const to=e.g.position.clone().sub(player.position);if(to.length()>0.01)player.rotation.y=Math.atan2(to.x,to.z)}hit(state.weapon?18:28,state.weapon?17:3)}
function dodge(){if(state.dodge>0)return;slashFx13(1);state.dodge=.42;msg('Бултлаа')}
function skill(i){if(state.skillCool[i]>0)return;state.skillCool[i]=[3,6,10][i];slashFx13(1);const dmg=[35,48,70][i]+talents19[3]*6;const range=state.weapon?17:4;hit(dmg,range)}
window.addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='KeyX')swap();if(e.code==='Space')dodge();if(e.code==='Tab')lock();if(e.code==='Digit1')skill(0);if(e.code==='Digit2')skill(1);if(e.code==='Digit3')skill(2)});window.addEventListener('keyup',e=>keys.delete(e.code));
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)attack();lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;state.angle-=(e.clientX-lastLook.x)*.006;state.pitch=THREE.MathUtils.clamp(state.pitch+(e.clientY-lastLook.y)*.004,-.2,.85);lastLook={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null}});
const pad=document.querySelector('#pad'),stick=document.querySelector('#stick');let padId=null;function padMove(e){const r=pad.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy);if(len>48){dx*=48/len;dy*=48/len}move={x:dx/48,y:-dy/48};stick.style.transform=`translate(${dx}px,${dy}px)`}pad.addEventListener('pointerdown',e=>{padId=e.pointerId;pad.setPointerCapture(e.pointerId);padMove(e)});pad.addEventListener('pointermove',e=>{if(e.pointerId===padId)padMove(e)});function stopPad(e){if(e&&e.pointerId!==padId)return;padId=null;move={x:0,y:0};stick.style.transform='translate(0,0)'}pad.addEventListener('pointerup',stopPad);pad.addEventListener('pointercancel',stopPad);
for(const [id,fn] of Object.entries({attack,dodge,switch:swap,lock,skill1:()=>skill(0),skill2:()=>skill(1),skill3:()=>skill(2)}))document.querySelector('#'+id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fn()});
// Alpha 2.1 — distinctive skill icons with accessible names and cooldown labels.
const skillVisual21=[['✦','Цохилтын давалгаа','slash'],['⚡','Шуурхай дайралт','rush'],['✹','Хүчтэй цохилт','burst']];
skillVisual21.forEach(([glyph,label,style],i)=>{const b=document.getElementById('skill'+(i+1));b.classList.add('skill21','skill-'+style+'21');b.title=label;b.setAttribute('aria-label',label);b.innerHTML='<span class="skillGlyph21">'+glyph+'</span><span class="skillIndex21">'+(i+1)+'</span><span class="skillCooldown21"></span>';});
function updateSkills21(){skillVisual21.forEach((_,i)=>{const b=document.getElementById('skill'+(i+1));const remain=state.skillCool[i];b.classList.toggle('cooling21',remain>.05);b.querySelector('.skillCooldown21').textContent=remain>.05?Math.ceil(remain)+'s':'';b.style.setProperty('--cool21',String(Math.min(100,remain/[3,6,10][i]*100))+'%');});}

// Alpha 2.2 Living World: additive systems. Existing character/animation code untouched.
const living22=new THREE.Group();scene.add(living22);
// Visible town upgrade: festival lantern arches at the main square.
const townArch22=new THREE.Group();living22.add(townArch22);
for(const x of [-11,11]){
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.16,.21,6,8),new THREE.MeshStandardMaterial({color:0x69452d}));pole.position.set(x,3,-11);townArch22.add(pole);
 const lantern=new THREE.Mesh(new THREE.OctahedronGeometry(.52),new THREE.MeshStandardMaterial({color:0xffca67,emissive:0x99511c,emissiveIntensity:.65}));lantern.position.set(x,5.5,-11);townArch22.add(lantern);
}
const archBeam22=new THREE.Mesh(new THREE.BoxGeometry(22,.3,.3),new THREE.MeshStandardMaterial({color:0x69452d}));archBeam22.position.set(0,5.9,-11);townArch22.add(archBeam22);
for(let i=0;i<9;i++){const banner=new THREE.Mesh(new THREE.ConeGeometry(.43,1.35,3),new THREE.MeshStandardMaterial({color:i%2?0x3db9ba:0xe4b35c,side:THREE.DoubleSide}));banner.position.set(-9+i*2.25,5.05,-11);banner.rotation.z=Math.PI;townArch22.add(banner)}
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


// === Alpha 2.3 Kingdom Expansion: additive world systems. Hero rig and animation untouched. ===
const kingdom23=new THREE.Group();scene.add(kingdom23);
const mat23=(c,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:.78,metalness:metal});
const stone23=mat23(0x9c9d98),dark23=mat23(0x52616b),roof23=mat23(0x335c85),gold23=mat23(0xd7ae60,.35),wood23=mat23(0x624534),green23=mat23(0x33755b);
function k23(geo,mat,x,y,z,parent=kingdom23){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o}
// Distinct skyline: a large keep, four towers, crenellations, a front gate, and a bridge.
const castle23=new THREE.Group();castle23.position.set(0,0,32);kingdom23.add(castle23);
k23(new THREE.BoxGeometry(8.2,9,13),stone23,-6.4,4.5,0,castle23);k23(new THREE.BoxGeometry(8.2,9,13),stone23,6.4,4.5,0,castle23);k23(new THREE.BoxGeometry(4.7,4,13),stone23,0,7,0,castle23);
k23(new THREE.BoxGeometry(14,3,10),dark23,0,10,0,castle23);
for(const x of [-11,11])for(const z of [-7,7]){k23(new THREE.CylinderGeometry(2.4,2.7,13,8),stone23,x,6.5,z,castle23);k23(new THREE.ConeGeometry(3.15,4.5,8),roof23,x,15.1,z,castle23);for(let i=0;i<8;i++){const a=i*Math.PI/4;k23(new THREE.BoxGeometry(.9,1.2,.9),dark23,x+Math.cos(a)*2.3,13.3,z+Math.sin(a)*2.3,castle23)}}
for(let x=-9;x<=9;x+=2){k23(new THREE.BoxGeometry(1.1,1.4,1.2),dark23,x,9.7,-6.5,castle23)}
const gate23=k23(new THREE.BoxGeometry(4.2,5,.4),wood23,0,2.5,-6.7,castle23);gate23.visible=false; // Gate opened in Alpha 2.5
k23(new THREE.BoxGeometry(5,.6,1.5),gold23,0,5.2,-6.9,castle23);
for(let i=0;i<10;i++)k23(new THREE.BoxGeometry(3.2,.16,2.5),i%2?stone23:dark23,0,.12,14+i*1.9);
// New plaza architecture, bridges, gardens, colored stalls, and lanterns.
for(const [x,z] of [[-18,2],[19,3],[-18,-14],[19,-13]]){
 const g=new THREE.Group();g.position.set(x,0,z);kingdom23.add(g);
 k23(new THREE.BoxGeometry(7,4.6,6),stone23,0,2.3,0,g);k23(new THREE.ConeGeometry(5.2,3.6,4),roof23,0,6.25,0,g).rotation.y=Math.PI/4;
 k23(new THREE.BoxGeometry(1.3,2.5,.25),wood23,0,1.25,3.05,g);
 for(const dx of [-2.1,2.1])k23(new THREE.BoxGeometry(1,.95,.15),gold23,dx,2.7,3.08,g);
}
for(let i=0;i<12;i++){
 const x=-21+i*3.9,z=-23+(i%2)*1.1;
 k23(new THREE.CylinderGeometry(.15,.18,3.5,6),wood23,x,1.75,z);
 k23(new THREE.OctahedronGeometry(.45),gold23,x,3.7,z);
}
for(const x of [-24,24])for(let z=-17;z<17;z+=5){k23(new THREE.CylinderGeometry(.42,.55,1.1,8),stone23,x,.55,z);k23(new THREE.SphereGeometry(.9,9,7),green23,x,1.5,z)}
// Separate equipment overview (no mutation of hero model or animation).
const equip23=document.createElement('button');equip23.id='equipment23';equip23.textContent='🛡 Тоноглол';panel.appendChild(equip23);
equip23.onclick=()=>openWindow('🛡 Тоноглол',`<p>⚔ Илд: +${swordRank18} · 🏹 Нум: +${bowRank18}</p><p>🛡 Хуяг: +${armorRank18} · ❤️ ${state.hp}/${state.max} HP</p><p>✨ Ур чадварын оноо: ${talentPoints19}</p><p>⛏ Хүдэр: ${ore18} · 💎 Кристалл: ${crystal18}</p><button id="goForge23">⚒ Дарханд сайжруулах</button>`);
document.addEventListener('click',e=>{if(e.target?.id==='goForge23')showForge18()});
// Collapsible mobile menu, defaults closed on touch devices; preserves all existing button handlers.
const menuToggle23=document.createElement('button');menuToggle23.id='menuToggle23';menuToggle23.textContent='☰ Цэс';menuToggle23.setAttribute('aria-expanded','false');app.appendChild(menuToggle23);
const compact23=matchMedia('(pointer:coarse)').matches;
if(compact23)panel.classList.add('collapsed23');
menuToggle23.onclick=()=>{panel.classList.toggle('collapsed23');const opened=!panel.classList.contains('collapsed23');menuToggle23.textContent=opened?'✕ Хаах':'☰ Цэс';menuToggle23.setAttribute('aria-expanded',String(opened))};
// Live overhead minimap, world positions and compass direction. Canvas is kept lightweight.
const mapCanvas23=document.createElement('canvas');mapCanvas23.id='mapCanvas23';mapCanvas23.width=160;mapCanvas23.height=160;
const oldMini23=document.getElementById('minimap');oldMini23.appendChild(mapCanvas23);
const ctx23=mapCanvas23.getContext('2d');let mapTick23=0;
function drawMap23(now){if(now-mapTick23<180)return;mapTick23=now;const c=ctx23;c.clearRect(0,0,160,160);c.fillStyle='#153e39';c.fillRect(0,0,160,160);c.strokeStyle='#456b61';c.lineWidth=1;for(let i=0;i<=160;i+=20){c.beginPath();c.moveTo(i,0);c.lineTo(i,160);c.moveTo(0,i);c.lineTo(160,i);c.stroke()}
const pt=(x,z)=>[80+(x-player.position.x)*1.55,80+(z-player.position.z)*1.55];
for(const [x,z,col] of [[0,32,'#ffdf92'],[-36,-43,'#5ce0a0'],[36,-44,'#a9baff'],[48,-38,'#ff778b'],[0,0,'#ffffff']]){const [px,py]=pt(x,z);c.fillStyle=col;c.beginPath();c.arc(px,py,4,0,Math.PI*2);c.fill()}
for(const citizen of citizens22){const [px,py]=pt(citizen.g.position.x,citizen.g.position.z);c.fillStyle='#8bd9ff';c.fillRect(px-2,py-2,4,4)}
c.save();c.translate(80,80);c.rotate(-player.rotation.y);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-8);c.lineTo(-6,6);c.lineTo(6,6);c.closePath();c.fill();c.restore();}
// Day/night cycle; existing sun reused. No extra shadow maps.
const time23={hour:Math.min(24,Math.max(0,Number(saved.kingdomHour23??9))),cycle:true};
const clock23=document.createElement('div');clock23.id='clock23';app.appendChild(clock23);
// Three combat skill visuals and new field enemies. Existing hero animation remains unchanged.
const fxMat23=[new THREE.MeshBasicMaterial({color:0x5fe7ff,transparent:true,opacity:.8,depthWrite:false}),new THREE.MeshBasicMaterial({color:0x84f7b7,transparent:true,opacity:.8,depthWrite:false}),new THREE.MeshBasicMaterial({color:0xffb16c,transparent:true,opacity:.8,depthWrite:false})];
const bursts23=[];
const prevSkill23=skill;
skill=function(i){const before=state.skillCool[i],mpBefore=mp22;prevSkill23(i);if(before>0||mpBefore===mp22)return;
const b=new THREE.Mesh(new THREE.TorusGeometry(1.1+i*.45,.08+i*.03,7,32),fxMat23[i].clone());b.rotation.x=-Math.PI/2;b.position.copy(player.position);b.position.y=.35;scene.add(b);bursts23.push({b,t:.48});};
const extraEnemies23=[];
for(const [x,z,type] of [[-42,-39,0],[-29,-50,1],[31,-49,2],[42,-52,0],[-47,-53,1]]){
 const e=spawn(x,z); // spawn adds the enemy to the existing combat/loot/respawn system
 if(e)extraEnemies23.push(e);
}
// Persist new world clock without interfering with previous save fields.
const prevSave23=saveGame;saveGame=function(){prevSave23();try{const d=JSON.parse(localStorage.getItem(saveKey)||'{}');d.kingdomHour23=time23.hour;localStorage.setItem(saveKey,JSON.stringify(d))}catch{}};
function updateKingdom23(now,dt){
 time23.hour=(time23.hour+dt*.065)%24;const a=(time23.hour/24)*Math.PI*2;const day=Math.max(.08,Math.sin(a-Math.PI/2)*.5+.5);
 sun.intensity=.28+day*1.72;sun.position.set(Math.cos(a)*35,8+day*40,16);scene.background.setRGB(.035+day*.56,.06+day*.69,.14+day*.73);scene.fog.color.copy(scene.background);
 renderer.toneMappingExposure=.85+day*.5;clock23.textContent=`${day<.3?'🌙':'☀'} ${String(Math.floor(time23.hour)).padStart(2,'0')}:${String(Math.floor((time23.hour%1)*60)).padStart(2,'0')}`;
 for(let i=bursts23.length-1;i>=0;i--){const q=bursts23[i];q.t-=dt;q.b.scale.multiplyScalar(1+dt*2);q.b.material.opacity=Math.max(0,q.t/.48);if(q.t<=0){scene.remove(q.b);q.b.geometry.dispose();q.b.material.dispose();bursts23.splice(i,1)}}
 drawMap23(now);
}
// Visibly distinct named areas, with a landmark and navigation hint.
const castleSign23=sign21('♜ ХААНЫ ЦАЙЗ',0,25.05);
const gameTitle23=document.createElement('div');gameTitle23.id='kingdomTitle23';gameTitle23.textContent='' ;app.appendChild(gameTitle23);


// === Alpha 2.4 Kingdom Reborn: visible city rebuild, independent of hero animations ===
// Preserve the old houses' doorway coordinates and existing enter/exit services.
town.visible=false;
const city24=new THREE.Group();scene.add(city24);
const citySolid24=[];
const c24={wall:new THREE.MeshStandardMaterial({color:0xd8c8a5,roughness:.95}),beam:new THREE.MeshStandardMaterial({color:0x594332}),slate:new THREE.MeshStandardMaterial({color:0x304b66}),copper:new THREE.MeshStandardMaterial({color:0x94613c}),gold:new THREE.MeshStandardMaterial({color:0xf0ca78,metalness:.25}),blue:new THREE.MeshStandardMaterial({color:0x368fba,emissive:0x0a2736}),red:new THREE.MeshStandardMaterial({color:0xb45655}),green:new THREE.MeshStandardMaterial({color:0x427b65}),stone:new THREE.MeshStandardMaterial({color:0x8b9b9c}),glass:new THREE.MeshStandardMaterial({color:0x89d8e2,emissive:0x174b5d,transparent:true,opacity:.82})};
function block24(parent,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function tower24(parent,x,z){const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);const body=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.25,7.5,8),c24.stone);body.position.y=3.75;g.add(body);const cap=new THREE.Mesh(new THREE.ConeGeometry(1.65,3,8),c24.slate);cap.position.y=9;g.add(cap);citySolid24.push({x,z,w:2.2,d:2.2})}
const colors24=[c24.red,c24.blue,c24.green,c24.copper];
for(let i=0;i<houses09.length;i++){
 const [x,z]=houses09[i],g=new THREE.Group();g.position.set(x,0,z);city24.add(g);
 block24(g,5.2,3.5,4.8,c24.wall,0,1.75,0);
 for(const side of [-2.52,2.52])block24(g,.22,4,.22,c24.beam,side,2,0);
 for(const zz of [-2.35,2.35])block24(g,5.35,.2,.22,c24.beam,0,3.25,zz);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(4.1,3.05,4),colors24[i%4]);roof.position.y=5.1;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
 for(const side of [-1.55,1.55]){block24(g,.85,1.12,.1,c24.glass,side,2.12,2.47);block24(g,.12,1.3,.2,c24.beam,side,2.12,2.55)}
 block24(g,1.38,2.08,.16,c24.beam,0,1.04,2.49);block24(g,1.65,.23,.26,c24.gold,0,2.27,2.58);
 const canopy=block24(g,2.4,.2,1.35,colors24[i%4],0,2.7,3.1);canopy.rotation.x=-.15;
 for(const side of [-1,1])block24(g,.12,2.1,.12,c24.beam,side*1.1,1.45,3.65);
 // Each doorway remains at z+3.2 and uses the existing interact key.
 const plate=block24(g,2.1,.08,1.25,c24.stone,0,.04,3.05);
 const sign=block24(g,2.1,.42,.15,c24.slate,0,3.08,2.61);
 sign.material= i%3===0?c24.copper:i%3===1?c24.blue:c24.green;
}
// Distinct central landmark: layered plaza and arched entry, visible from spawn.
const plaza24=new THREE.Group();city24.add(plaza24);
const dais24=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.85,.32,24),c24.stone);dais24.position.set(0,.12,-1);plaza24.add(dais24);
for(let i=0;i<8;i++){const a=i*Math.PI/4;const x=Math.sin(a)*4.2,z=-1+Math.cos(a)*4.2;const lantern=block24(plaza24,.3,2.9,.3,c24.beam,x,1.5,z);const light=new THREE.Mesh(new THREE.OctahedronGeometry(.4),c24.gold);light.position.set(x,3.25,z);plaza24.add(light)}
// The castle gate and the bridge form a visible, recognizable northern destination.
for(let i=0;i<10;i++)block24(city24,2.3,.18,2.3,i%2?c24.stone:c24.wall,0,.08,16+i*1.65);
for(const x of [-7.6,7.6])for(const z of [22,28])tower24(city24,x,z);
// New solid props and castle footprint; original house footprints stay solid.
for(const [x,z,w,d] of [[0,32,21,13],[-7.6,22,2.2,2.2],[7.6,22,2.2,2.2],[-7.6,28,2.2,2.2],[7.6,28,2.2,2.2]])citySolid24.push({x,z,w,d});
const oldBlocked24=blocked09;
blocked09=function(x,z){if(oldBlocked24(x,z))return true;if(inside09>=0||inDungeon07)return false;return citySolid24.some(b=>{if(b.w>15&&Math.abs(x)<2.15&&z>24.5&&z<39.5)return false;return Math.abs(x-b.x)<b.w/2+.42&&Math.abs(z-b.z)<b.d/2+.42})};
// Citizen schedules: walking by day, return to fixed stations at night.
const cityCitizenStations24=citizens22.map(c=>({x:c.x,z:c.z}));
function updateCitizens24(now){const night=time23.hour<6||time23.hour>21;citizens22.forEach((c,i)=>{const base=cityCitizenStations24[i];if(night){c.g.position.x=base.x;c.g.position.z=base.z;c.g.rotation.y=Math.PI;}else{const t=now*.00024+i*1.7;c.g.position.x=base.x+(c.axis===0?Math.sin(t)*c.range:0);c.g.position.z=base.z+(c.axis===1?Math.sin(t)*c.range:0);c.g.rotation.y=Math.cos(t)>0?0:Math.PI;}})}
const prevLiving24=updateLiving22;updateLiving22=function(now,dt){prevLiving24(now,dt);updateCitizens24(now)};
// Interact with city guards, with a visible dialogue instead of silent decorative NPCs.
const guards24=[[-5,20],[5,20]].map(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);city24.add(g);block24(g,.72,1.4,.5,c24.slate,0,.9,0);const helm=new THREE.Mesh(new THREE.SphereGeometry(.4,9,7),c24.gold);helm.position.y=1.85;g.add(helm);return g});
const previousInteract24=interactWorld06;
interactWorld06=function(){if(inside09<0&&!inDungeon07){const guard=guards24.find(g=>g.position.distanceTo(player.position)<3.1);if(guard){openWindow('🏰 Хотын харуул','<p>Хааны цайзын үүдэнд тавтай морил. Хотын дэлгүүр, дэн буудал, дархны газрыг ашиглаж болно.</p>');return}}previousInteract24()};
// Camera raycast against actual new buildings and castle, with near-plane safety.
const cameraObstacles24=[];
for(const group of [city24,kingdom23])group.traverse(o=>{if(o.isMesh&&o.geometry?.type!=='PlaneGeometry')cameraObstacles24.push(o)});
const cameraRay24=new THREE.Raycaster();
let previousCameraZone401=null;
function resolveCamera24(target,desired){if(inside09>=0||inDungeon07)return;const v=desired.clone().sub(target),distance=v.length();if(distance<.01)return;cameraRay24.set(target,v.normalize());cameraRay24.near=.25;cameraRay24.far=distance;const visibleObstacles=cameraObstacles24.filter(o=>o.visible&&o.parent?.visible!==false);const hits=cameraRay24.intersectObjects(visibleObstacles,false);if(hits.length){const safe=Math.max(.7,hits[0].distance-.48);desired.copy(target).addScaledVector(v.normalize(),safe)}}
const version24=document.createElement('div');version24.id='version24';version24.textContent='✦ ALPHA 5.3 · SAMURAI' ;app.appendChild(version24);
// Do not alter the hero's GLB, rig, limbs, weapon, or animation update code.


// Alpha 2.5: visible living kingdom interactions and combat extensions.
// The character model, rig and animation update code are deliberately unchanged.
const features25=new THREE.Group();scene.add(features25);
const material25={wood:new THREE.MeshStandardMaterial({color:0x684831}),gold:new THREE.MeshStandardMaterial({color:0xf5c86b,metalness:.35}),stone:new THREE.MeshStandardMaterial({color:0x526a7a}),magic:new THREE.MeshStandardMaterial({color:0x52e4ef,emissive:0x0d7f9b,emissiveIntensity:1.1})};
function prop25(geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;features25.add(o);return o}
// The quest board and portal are placed beside the main road, rather than hidden in a menu.
prop25(new THREE.BoxGeometry(2.9,1.8,.25),material25.wood,-4,2.1,-19);
for(const x of [-5.15,-2.85])prop25(new THREE.BoxGeometry(.18,2.8,.2),material25.stone,x,1.4,-19);
prop25(new THREE.BoxGeometry(2.5,.2,.35),material25.gold,-4,3.1,-19);
const portal25=prop25(new THREE.TorusGeometry(1.5,.24,9,32),material25.magic,9,2.2,-21);
const portalBase25=prop25(new THREE.CylinderGeometry(1.8,2,.32,12),material25.stone,9,.16,-21);
const castleHall25=new THREE.Group();scene.add(castleHall25);
const hallOrigin25=new THREE.Vector3(56,0,51);
function hall25(w,h,d,mat,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(hallOrigin25.x+x,y,hallOrigin25.z+z);o.receiveShadow=true;castleHall25.add(o);return o}
hall25(16,.2,18,material25.stone,0,-.1,0);
for(const x of [-8,8])hall25(.35,6,18,material25.stone,x,3,0);
hall25(16,6,.35,material25.stone,0,3,-9);
hall25(5,.34,3,material25.gold,0,.17,-6);
hall25(2.3,2.6,1.3,material25.wood,0,2,-7.4);
for(const x of [-5,5]){hall25(.7,4,.7,material25.gold,x,2,-5);hall25(.8,.8,.8,material25.magic,x,4.4,-5)}
// 2.5.1: visible throne-room identity, all objects placed in hall local coordinates.
const carpet251=new THREE.MeshStandardMaterial({color:0x8c2941,roughness:.95});
const brass251=new THREE.MeshStandardMaterial({color:0xd9b86a,metalness:.38,roughness:.4});
const dark251=new THREE.MeshStandardMaterial({color:0x30445a,roughness:.8});
hall25(3.3,.035,13,carpet251,0,.04,-.5);
for(const x of [-1.7,1.7])hall25(.12,.04,13,brass251,x,.065,-.5);
// Raised dais and ornate royal seat.
hall25(5,.35,3.4,dark251,0,.18,-6.6);
hall25(2.2,.35,1.1,brass251,0,.72,-7.2);
hall25(2.2,2.4,.32,carpet251,0,2.0,-7.7);
for(const x of [-1.15,1.15]){hall25(.24,2.7,.32,brass251,x,2.05,-7.7);hall25(.3,.25,.9,brass251,x,1.3,-7.15)}
for(const x of [-6.8,6.8]){
 for(const z of [-6,-1,4]){hall25(.8,4,.8,dark251,x,2,z);hall25(1,.18,1,brass251,x,4.05,z)}
}
for(const x of [-7.6,7.6]){
 for(const z of [-4,2]){
  hall25(.1,2.7,1.3,carpet251,x,3,z);
  hall25(.12,.15,1.45,brass251,x,4.35,z);
 }
}
const hallGlow251=new THREE.PointLight(0xffd29a,2,17);hallGlow251.position.set(hallOrigin25.x,4,hallOrigin25.z-5);castleHall25.add(hallGlow251);
let inCastle25=false;
const saved25=(()=>{try{return JSON.parse(localStorage.getItem('astralRift25')||'{}')}catch{return {}}})();
let boardKills25=Number(saved25.boardKills||0),boardClaim25=!!saved25.boardClaim,boardActive25=!!saved25.boardActive;
let stamina25=100,blocking25=false;
const status25=document.createElement('div');status25.id='status25';status25.innerHTML='<span>⚡ ST <b id="stNum25">100</b></span><div id="stTrack25"><i id="stFill25"></i></div>';
app.appendChild(status25);
const control25=document.createElement('div');control25.id='control25';control25.innerHTML='<button id="block25" aria-label="Хамгаалах" title="Хамгаалах">🛡</button><button id="board25" aria-label="Даалгаврын самбар" title="Даалгаврын самбар">📜</button>';
app.appendChild(control25);
function saveExtra25(){try{localStorage.setItem('astralRift25',JSON.stringify({boardKills:boardKills25,boardClaim:boardClaim25,boardActive:boardActive25}))}catch{}}
function questBoard25(){
 if(!inCastle25 && inside09<0 && Math.hypot(player.position.x+4,player.position.z+19)>4.2){msg('📜 Даалгаврын самбарт ойртоорой');return}
 if(!boardActive25&&!boardClaim25){boardActive25=true;saveExtra25();msg('📜 Даалгавар: 5 дайсан ял');return}
 if(boardActive25&&boardKills25>=5&&!boardClaim25){boardClaim25=true;boardActive25=false;gold+=180;ore18+=3;gainXp(120);saveExtra25();saveGame();msg('📜 +180 алт, +3 хүдэр, +120 EXP');return}
 openWindow('📜 Хотын даалгаврын самбар',`<p>${boardClaim25?'Даалгавар биелсэн.':boardActive25?'Ялсан дайсан: '+boardKills25+'/5':'Самбарт ойртож даалгавар аваарай.'}</p>`);
}
function portalWindow25(){openWindow('🌀 Шилжих хаалга',`<p>Шилжих газраа сонго:</p><p><button id="forest25">🌲 Шидэт ой</button> <button id="ruins25">🏛 Эртний балгас</button> <button id="town25">🏰 Хот</button></p>`);document.querySelector('#forest25').onclick=()=>teleport25(-35,-38);document.querySelector('#ruins25').onclick=()=>teleport25(36,-39);document.querySelector('#town25').onclick=()=>teleport25(2,-17)}
function teleport25(x,z){closeWindow();if(inCastle25)exitCastle25();if(inside09>=0)exitHouse09();player.position.set(x,0,z);state.target=null;msg('🌀 Шилжлээ')}
function enterCastle25(){inCastle25=true;player.position.set(hallOrigin25.x,0,hallOrigin25.z+6);msg('🏰 Хааны танхимд орлоо')}
function exitCastle25(){inCastle25=false;player.position.set(0,0,22);msg('🏰 Цайзын гадна гарлаа')}
const oldInteract25=interactWorld06;
interactWorld06=function(){
 if(inCastle25){if(player.position.z>hallOrigin25.z+3){exitCastle25();return}openWindow('👑 Хааны танхим','<p>Хаант улсын хамгаалагчид алга болсон тухай цуурхал тархжээ. Хотын самбараас даалгавар ав.</p>');return}
 if(inside09<0&&!inDungeon07){
 if(Math.hypot(player.position.x+4,player.position.z+19)<3.6){questBoard25();return}
 if(Math.hypot(player.position.x-9,player.position.z+21)<3.8){portalWindow25();return}
 if(Math.abs(player.position.x)<2.4&&player.position.z>23&&player.position.z<28){enterCastle25();return}
 }
 oldInteract25();
};
document.getElementById('board25').onclick=questBoard25;
function setBlock25(v){blocking25=!!v&&stamina25>3;document.getElementById('block25').classList.toggle('active25',blocking25)}
const blockButton25=document.getElementById('block25');
blockButton25.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setBlock25(true)});
for(const ev of ['pointerup','pointercancel','pointerleave'])blockButton25.addEventListener(ev,()=>setBlock25(false));
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat)setBlock25(true)});
window.addEventListener('keyup',e=>{if(e.code==='KeyR')setBlock25(false)});
const prevDodge25=dodge;
dodge=function(){if(stamina25<22){msg('⚡ Stamina хүрэлцэхгүй');return}if(state.dodge<=0){stamina25-=22;prevDodge25()}};
const prevHit25=hit;
hit=function(damage=25,range=2.8){const e=state.target?.alive?state.target:closest();const wasAlive=!!e?.alive;prevHit25(damage,range);if(boardActive25&&wasAlive&&e&&!e.alive&&!e.boss){boardKills25++;saveExtra25();if(boardKills25===5)msg('📜 Самбар руу буцаж шагналаа ав!')}};
const prevBlocked25=blocked09;
blocked09=function(x,z){if(inCastle25){return Math.abs(x-hallOrigin25.x)>7.35||Math.abs(z-hallOrigin25.z)>8.2}return prevBlocked25(x,z)};
function update25(now,dt){
 stamina25=Math.max(0,Math.min(100,stamina25+(blocking25?-22:17)*dt));if(stamina25<1)setBlock25(false);
 document.getElementById('stNum25').textContent=Math.floor(stamina25);
 document.getElementById('stFill25').style.width=stamina25+'%';
 portal25.rotation.z=now*.0004;
 if(inCastle25){castleHall25.visible=true;roomTitle09.style.display='block';roomTitle09.textContent='🏰 ХААНЫ ТАНХИМ · Гарах: ✦ Судлах'}else{castleHall25.visible=false;if(inside09<0)roomTitle09.style.display='none'}
}


// Alpha 4.0 integration: world, physical hall props, guild quest, map, NPC patrols.
// Existing GLB loaders, joint rigging and the animation loop above remain unchanged.
// Remove obsolete overlapping houses/guards; retain the rebuilt 2.4 architecture.
town.visible=false;
guards24.forEach(g=>g.visible=false);
const world40=createAlpha40({
  scene,player,renderer,camera,castleHall25,hallOrigin25,interior09,rooms22,city24,houses09,
  openWindow,closeWindow,msg,saveGame,gainXp,teleport25,app,panel,
  isCastle:()=>inCastle25,isInterior:()=>inside09>=0,isDungeon:()=>inDungeon07,
  getHour:()=>time23.hour,
  addResources:({gold:g=0,ore:o=0,crystal:c=0})=>{gold+=g;ore18+=o;crystal18+=c;saveGame()}
});
const oldBlocked40=blocked09;
blocked09=function(x,z){if(inCastle25)return world40.blocked(x,z);if(world40.blocked(x,z))return true;return oldBlocked40(x,z)};
const oldInteract40=interactWorld06;
interactWorld06=function(){if(world40.interact())return;oldInteract40()};
const oldHit40=hit;
hit=function(damage=25,range=2.8){const enemy=state.target?.alive?state.target:closest();const wasAlive=!!enemy?.alive;oldHit40(damage,range);if(wasAlive&&enemy&&!enemy.alive)world40.recordKill(enemy)};
let parryWindow40=0;
const block40=document.getElementById('block25');
block40.addEventListener('pointerdown',()=>{if(stamina25>=12)parryWindow40=.23});
window.addEventListener('keydown',e=>{if(e.code==='KeyR'&&!e.repeat&&stamina25>=12)parryWindow40=.23});

const advancedFX50=createAdvancedFX50(scene,player,camera,renderer);
let prev=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-prev)/1000,.05);prev=now;updateFx13(dt);checkAchievements17();updateLiving22(now,dt);updateKingdom23(now,dt);update25(now,dt);world40.update(now,dt);parryWindow40=Math.max(0,parryWindow40-dt);
state.cool=Math.max(0,state.cool-dt);state.attacking=Math.max(0,state.attacking-dt);state.dodge=Math.max(0,state.dodge-dt);state.skillCool=state.skillCool.map(v=>Math.max(0,v-dt));updateSkills21();
let x=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+move.x;let z=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0)+move.y;const len=Math.hypot(x,z);if(len>.1){x/=Math.max(1,len);z/=Math.max(1,len);const dir=new THREE.Vector3(-Math.cos(state.angle)*x+Math.sin(state.angle)*z,0,Math.sin(state.angle)*x+Math.cos(state.angle)*z);moveSafely09(dir.x*dt*(state.dodge>0?13:(keys.has('ShiftLeft')||keys.has('ShiftRight')?7.3:5)),dir.z*dt*(state.dodge>0?13:(keys.has('ShiftLeft')||keys.has('ShiftRight')?7.3:5)));player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-70,70);player.position.z=THREE.MathUtils.clamp(player.position.z,-70,70)}
const walking=len>.1;
animateCharacters12(now,dt,walking);updateSamurai53(now,dt,walking);advancedFX50.update(dt,walking,state.attacking);
shrineCrystal06.rotation.y+=dt*.6;shrineCrystal06.position.y=2+Math.sin(now*.002)*.2;portal06.material.opacity=.23+Math.sin(now*.002)*.09;questGem.position.y=3.02+Math.sin(now*.003)*.16;for(const e of enemies){if(inside09>=0||(e.boss&&!inDungeon07)||(!e.boss&&inDungeon07))continue;if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.hp=e.max;e.g.position.copy(e.home);e.g.visible=true;e.m.material.color.setHex(e.baseColor||0x963d42)}continue}e.cool-=dt;const diff=player.position.clone().sub(e.g.position);const d=diff.length();if(d<9&&d>1.7&&e.g.position.distanceTo(npc.position)>4){const step=diff.normalize().multiplyScalar(dt*(e.boss?(e.hp<e.max*.5?1.9:1.25):e.fast?2.3:e.elite?.95:1.2));const nx=e.g.position.x+step.x,nz=e.g.position.z+step.z;if(!blocked09(nx,nz))e.g.position.set(nx,e.g.position.y,nz)};e.m.rotation.y+=dt*.5;if(d<(e.boss?3:1.9)&&e.cool<=0&&state.dodge<=0&&(e.boss||Math.hypot(player.position.x,player.position.z)>19)){if(blocking25&&parryWindow40>0){parryWindow40=0;stamina25=Math.max(0,stamina25-9);e.cool=1.8;msg('✦ PARRY · Цохилтыг буцаалаа')}else{state.hp=Math.max(0,state.hp-Math.max(1,(e.boss?(e.hp<e.max*.5?32:20):e.elite?17:e.fast?7:9)-armorRank18*2)*(blocking25&&stamina25>0?.3:1))}e.cool=e.boss&&e.hp<e.max*.5?.9:e.fast?1.05:1.5;if(state.hp===0){msg('Та ялагдлаа — дахин эхэлж байна');state.hp=state.max;player.position.set(inDungeon07?48:0,0,inDungeon07?-38:0)}}}
const camTarget=player.position.clone().add(new THREE.Vector3(0,1.55,0));
const cameraDistance10=(inside09>=0||inCastle25)?3.3:4.8;
const cameraHeight10=(inside09>=0||inCastle25)?1.05:1.25;
const desiredCamera10=camTarget.clone().add(new THREE.Vector3(
  -Math.sin(state.angle)*cameraDistance10,
  cameraHeight10+state.pitch*(inside09>=0?1.2:2.0),
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
  const hits10=[]; // Hidden legacy houses must not occlude the rebuilt town camera.
  if(hits10.length){desiredCamera10.copy(camTarget).addScaledVector(direction10,Math.max(.65,hits10[0].distance-.35));}
}
if(!inCastle25)resolveCamera24(camTarget,desiredCamera10);
world40.cameraCollision(camTarget,desiredCamera10);
// Teleport/room transitions need an immediate valid camera position;
// smoothing from the outdoor position can briefly place it inside a wall.
const cameraZone401=inside09>=0?`house-${inside09}`:inCastle25?'castle':inDungeon07?'dungeon':'outdoor';
if(cameraZone401!==previousCameraZone401){camera.position.copy(desiredCamera10);previousCameraZone401=cameraZone401;}
else camera.position.lerp(desiredCamera10,Math.min(1,dt*13));
if(inside09>=0){
  camera.position.x=THREE.MathUtils.clamp(camera.position.x,interiorOrigin09.x-3.85,interiorOrigin09.x+3.85);
  camera.position.z=THREE.MathUtils.clamp(camera.position.z,interiorOrigin09.z-3.85,interiorOrigin09.z+3.85);
  camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.55,3.65);
}
if(inCastle25){camera.position.x=THREE.MathUtils.clamp(camera.position.x,hallOrigin25.x-6.8,hallOrigin25.x+6.8);camera.position.z=THREE.MathUtils.clamp(camera.position.z,hallOrigin25.z-8,hallOrigin25.z+8);camera.position.y=THREE.MathUtils.clamp(camera.position.y,1.45,5.65)}
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

// 2.5.1 optional compact quest tracker. Tapping it does not trigger movement.
const questTracker251=document.getElementById('questbox');
questTracker251.setAttribute('role','button');questTracker251.setAttribute('tabindex','0');
questTracker251.setAttribute('aria-label','Даалгаврын мэдээллийг дэлгэх эсвэл хураах');
function toggleQuest251(){questTracker251.classList.toggle('quest-collapsed251')}
questTracker251.addEventListener('click',toggleQuest251);
questTracker251.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleQuest251()}});
