/** Astral Rift 6.2.2 — interactive NPC roles + available real GLB character assets.
 * Existing Saruul, hero, economy and combat are unchanged.
 * Citizens are recostumed from the existing Saruul GLB; guards use an existing
 * armoured Meshy character as a PLACEHOLDER until individual licensed rigs exist.
 */
import * as THREE from 'three';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
const NPC_ROLES622={
 'Болд':{role:'Дархан',coat:0x785846,face:0xefc09b,icon:'⚒'},
 'Номин':{role:'Худалдаачин',coat:0x3e7b83,face:0xf1c9a3,icon:'🛒'},
 'Тэмүүлэн':{role:'Судлаач',coat:0x695d96,face:0xdfb38c,icon:'📜'},
 'Энхээ':{role:'Аялагч',coat:0x8e7141,face:0xe7c09b,icon:'🧭'},
};
function titleTexture(text){
 const cv=document.createElement('canvas');cv.width=512;cv.height=96;
 const ctx=cv.getContext('2d');ctx.fillStyle='#142824ea';ctx.fillRect(0,2,512,92);
 ctx.strokeStyle='#c7ae77';ctx.lineWidth=4;ctx.strokeRect(3,4,506,88);
 ctx.font='bold 29px sans-serif';ctx.fillStyle='#f4e9d0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49,490);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function addName(group,name){
 const geo=new THREE.PlaneGeometry(2.9,.53);
 const mat=new THREE.MeshBasicMaterial({map:titleTexture(name),transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const label=new THREE.Mesh(geo,mat);label.position.set(0,2.8,0);label.renderOrder=8;group.add(label);return label;
}
export function installNPC622({GLTFLoader,scene,citizens22,guards24,player,openWindow,showForge18,saveGame,msg,potionPurchase,closeWindow,questBoard25,showBag}){
 const entries=[];
 const loader=new GLTFLoader();
 const stats={citizens:0,guards:0,failed:0};
 for(let i=0;i<citizens22.length;i++){
  const c=citizens22[i],name=c.name.split(' · ')[0],role=NPC_ROLES622[name];
  const entry={group:c.g,name,role:role?.role||'Иргэн',icon:role?.icon||'🗨',kind:'citizen',label:addName(c.g,`${role?.icon||'🗨'} ${c.name}`)};
  entries.push(entry);
 }
 for(let i=0;i<guards24.length;i++){
  const g=guards24[i];entries.push({group:g,name:i?'Өмнөд харуул':'Хойд харуул',role:'Хотын харуул',icon:'🛡',kind:'guard',label:addName(g,`🛡 Хотын харуул`)});
 }
 // Loading existing local files does NOT depend on any external CDN.
 loader.loadAsync('/models/saruul.glb').then(gltf=>{
  for(const e of entries.filter(e=>e.kind==='citizen')){
   const role=NPC_ROLES622[e.name];const m=gltf.scene.clone(true);
   // Recolor duplicate outfits to make professions distinguishable.
   m.traverse(o=>{if(!o.isMesh)return;
    const wasArray=Array.isArray(o.material),arr=wasArray?o.material:[o.material];
    const key=o.name.toLowerCase();
    const changed=arr.map(src=>{const mat=src.clone();if(mat.color){
     if(/dress|underskirt|bodice|sash|sleeve/.test(key))mat.color.setHex(role.coat);
     else if(/face|neck|hand/.test(key))mat.color.setHex(role.face);
    }mat.roughness=Math.max(.6,mat.roughness??.7);return mat;});
    o.material=wasArray?changed:changed[0];o.castShadow=false;
   });
   m.scale.setScalar(.78);m.name=`Citizen622_${e.name}`;
   e.group.children.filter(o=>o!==e.label).forEach(o=>o.visible=false);
   e.group.add(m);e.model=m;stats.citizens++;
  }
 }).catch(err=>{stats.failed++;console.warn('[NPC622] Citizen GLB failed',err)});
 loader.loadAsync('/models/meshy-warrior-nocape.glb').then(gltf=>{
  for(const e of entries.filter(e=>e.kind==='guard')){
   const m=cloneSkeleton(gltf.scene);m.name=`Guard622_${e.name}`;m.scale.setScalar(1.13);
   m.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
   e.group.children.filter(o=>o!==e.label).forEach(o=>o.visible=false);
   e.group.add(m);e.model=m;stats.guards++;
  }
 }).catch(err=>{stats.failed++;console.warn('[NPC622] Guard GLB failed',err)});
 function nearest(maxDist=3.6){let hit=null,dist=maxDist;
  for(const e of entries){const d=Math.hypot(e.group.position.x-player.position.x,e.group.position.z-player.position.z);
   if(d<dist){dist=d;hit=e;}}
  return hit;
 }
 function dialogue(){
  const e=nearest();if(!e)return false;
  const text=e.kind==='guard'?'<p>Хотоос гадна чоно, гоблин олширсон. Даалгаврын самбараа үзээрэй.</p><button id="npc622Board">📜 Даалгаврын самбар</button>':
  e.name==='Болд'?'<p>Би хуяг, илдийг чинь сайжруулж өгнө. Хүдэр болон алт цуглуулсан уу?</p><button id="npc622Forge">⚒ Дархны цэс</button>':
  e.name==='Номин'?'<p>Аянд гарахын өмнө эдгээх эм аваарай.</p><button id="npc622Buy">❤️ Эдгээх эм · 30 алт</button><button id="npc622Bag">🎒 Цүнх</button>':
  e.name==='Тэмүүлэн'?'<p>Шидэт ойн гүнд чоно, зүүн талын хуаранд гоблин, өмнө талын балгасанд эртний нууц бий.</p><p>🧭 Хотын шилжих хаалгаас бүсүүд рүү очиж болно.</p>':
  '<p>Эртний балгас руу очвол хамгаалалтаа сайжруулаарай. Хотод буцаж бэлтгэлээ базааж болно.</p>';
  openWindow(`${e.icon} ${e.name} — ${e.role}`,text);
  const byId=id=>document.getElementById(id);
  if(byId('npc622Forge'))byId('npc622Forge').onclick=()=>showForge18();
  if(byId('npc622Buy'))byId('npc622Buy').onclick=()=>{potionPurchase();dialogue()};
  if(byId('npc622Bag'))byId('npc622Bag').onclick=()=>showBag();
  if(byId('npc622Board'))byId('npc622Board').onclick=()=>{closeWindow();msg('📜 Хотын самбар нь төв замын хажууд бий');};
  return true;
 }
 function update(camera,now){for(const e of entries){
  const d=Math.hypot(e.group.position.x-player.position.x,e.group.position.z-player.position.z);
  e.label.visible=d<15;e.label.quaternion.copy(camera.quaternion);
  if(e.model&&e.kind==='citizen')e.model.position.y=Math.sin(now*.0018+e.group.position.x)*.022;
 }}
 return {dialogue,update,stats,nearest,entries};
}
