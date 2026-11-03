/** Astral Rift 6.2.3: licensed fantasy NPC loader, animated when available.
 * Models are fetched to public/models/npc623 at build time by the included
 * downloader. Older NPCs remain visible if a new model is absent or invalid.
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
 ctx.font='bold 30px sans-serif';ctx.fillStyle='#f4e9d0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49,490);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
function addName(group,name){
 const geo=new THREE.PlaneGeometry(1.40,.27);
 const mat=new THREE.MeshBasicMaterial({map:titleTexture(name),transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const label=new THREE.Mesh(geo,mat);label.position.set(0,2.4,0);label.renderOrder=8;group.add(label);return label;
}
export function installNPC622({GLTFLoader,scene,citizens22,guards24,player,openWindow,showForge18,saveGame,msg,potionPurchase,closeWindow,questBoard25,showBag,onGuardModelReady}){
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
 // Loads only once per distinct source; each NPC gets an independent skeleton
 // and animation mixer. Failure returns to the existing local Saruul/Meshy meshes.
 const qs=typeof location!=='undefined'?new URLSearchParams(location.search):new URLSearchParams();
 const mode=qs.get('npcmodels')||'local';
 const NPC_SOURCES623={
  peasant:{local:'/models/npc625/inquisitor-v2.glb',remote:'https://vibeassets.io/download/k6bdm27lba'},
  traveler:{local:'/models/npc625/inquisitor-v2.glb',remote:'https://vibeassets.io/download/k6bdm27lba'},
  blacksmith:{local:'/models/npc625/blacksmith-mobile.glb',remote:'https://vibeassets.io/download/fbd1hbd0su'},
  scholar:{local:'/models/npc625/inquisitor-v2.glb',remote:'https://vibeassets.io/download/k6bdm27lba'},
  guard:{local:'/models/npc623/guard-captain.glb',remote:'https://vibeassets.io/download/9h7odik5fl'},
  female:{local:'/models/npc625/merchant-witch-static628.glb',remote:'https://assetyard.dev/pack/files/vale-shieldmaiden.glb'},
 };
 const fallback={citizen:'/models/saruul.glb',guard:'/models/meshy-warrior-nocape.glb'};
 const typeFor=e=>e.kind==='guard'?'guard':e.name==='Номин'?'female':e.name==='Тэмүүлэн'?'scholar':e.name==='Болд'?'blacksmith':e.name==='Энхээ'?'traveler':'peasant';
 const debugEnabled=qs.get('npcdebug')==='1';
 const statuses=new Map();
 const debugEl=debugEnabled?document.createElement('div'):null;
 if(debugEl){debugEl.id='npc627-debug';Object.assign(debugEl.style,{position:'fixed',left:'8px',bottom:'11%',zIndex:'9000',maxWidth:'60vw',padding:'8px',borderRadius:'8px',background:'rgba(0,0,0,.82)',color:'#fff',fontSize:'11px',pointerEvents:'none',whiteSpace:'pre-wrap'});document.body.appendChild(debugEl);}
 const status=(name,value)=>{statuses.set(name,value);if(debugEl)debugEl.textContent=[...statuses].map(([a,b])=>a+': '+b).join('\n')};
 const modelCache=new Map();
 const animationsFor=(gltf,m)=>{
  if(!gltf.animations?.length)return null;
  const mixer=new THREE.AnimationMixer(m);
  const find=(rx)=>gltf.animations.find(a=>rx.test(a.name))||null;
  const idle=find(/(^|_)idle|stand.*idle/i)||gltf.animations[0];
  const walk=find(/walk|stroll|run_forward/i);
  const talk=find(/talk/i)||find(/hand.*hip|gesture|wave|agree/i);
  const idleA=mixer.clipAction(idle);idleA.play();
  const walkA=walk&&walk!==idle?mixer.clipAction(walk):null;
  const talkA=talk&&talk!==idle?mixer.clipAction(talk):null;
  return {mixer,idleA,walkA,talkA,active:idleA};
 };
 // 6.2.6: imported GLBs have wildly different authoring scales and may
 // contain weapons extending well above the body. Measure only the visible
 // *body* meshes in world space, including their actual bind/skinned poses.
 function bodyBounds626(m,kind){
  m.updateMatrixWorld(true);
  const out=new THREE.Box3();
  let count=0;
  const b=new THREE.Box3();
  m.traverse(o=>{
   if(!o.isMesh)return;
   if(kind==='female' && /weapon|sword|bow|arrow|shield/i.test(o.name)){
     o.visible=false; // Nomin is a merchant, not an armed archer.
     return;
   }
   const geo=o.geometry;
   if(!geo)return;
   if(o.isSkinnedMesh){
    o.computeBoundingBox();
    b.copy(o.boundingBox);
   }else{
    if(!geo.boundingBox)geo.computeBoundingBox();
    b.copy(geo.boundingBox);
   }
   if(!b.isEmpty()){
    b.applyMatrix4(o.matrixWorld);
    if(Number.isFinite(b.min.y)&&Number.isFinite(b.max.y)){out.union(b);count++;}
   }
  });
  if(!count||out.isEmpty())throw Error('NPC body geometry unavailable: '+kind);
  return out;
 }
 function placeModel(e,gltf){
  const kind=typeFor(e);
  const m=cloneSkeleton(gltf.scene);m.name=`NPC628_${e.name}`;
  if(kind==='female'&&m.getObjectByProperty('isSkinnedMesh',true))throw Error('Merchant must use static628 non-skinned GLB');
  m.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;
   if(kind==='traveler' && o.material){
    // Make Enkhee's outfit warmer than Temuulen without changing the cached source.
    const tint=mat=>{const c=mat.clone();if(c.color)c.color.multiply(new THREE.Color(1.15,.91,.76));return c;};
    o.material=Array.isArray(o.material)?o.material.map(tint):tint(o.material);
   }
  }});
  const bounds=bodyBounds626(m,kind),size=new THREE.Vector3();bounds.getSize(size);
  // Some FBX exports use a 0.01 scale on the root: valid heights can be 0.019m.
  // The old 0.4m minimum wrongly rejected Captain and Inquisitor even though
  // they contain actual rigged geometry.
  if(!(size.y>.0001&&Number.isFinite(size.y)))throw Error('NPC size invalid: '+e.name);
  const height=e.kind==='guard'?1.9:kind==='female'?1.7:kind==='blacksmith'?1.8:1.78;
  const scale=height/size.y;
  if(!Number.isFinite(scale)||scale<.001||scale>1500)throw Error('NPC scale unsafe: '+e.name+' '+scale);
  m.scale.setScalar(scale);
  m.position.set(-(bounds.min.x+bounds.max.x)*.5*scale,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*.5*scale);
  m.rotation.y=0;
  // Re-check after normalization so an upside-down/sideways export cannot
  // silently replace the placeholder (Witch is normalized separately).
  e.group.add(m);
  m.updateMatrixWorld(true);
  const check=bodyBounds626(m,kind),dims=new THREE.Vector3();check.getSize(dims);
  if(!(dims.y>1.4&&dims.y<2.5)){
    e.group.remove(m);throw Error('NPC normalized height invalid: '+e.name+' '+dims.y);
  }
  for(const old of [...e.group.children])if(old!==e.label&&old!==m)old.visible=false;
  if(e.kind==='guard')e.group.visible=true;
  e.model=m;e.motions=animationsFor(gltf,m);e.lastPos=e.group.position.clone();
  e.label.position.y=height+.32;
  console.info('[NPC626] Ready',e.name, 'source=',kind,'height=',dims.y.toFixed(2));
  if(e.kind==='guard'){stats.guards++;onGuardModelReady?.();}else stats.citizens++;
 }

 function modelFor(e){
  const kind=typeFor(e),src=NPC_SOURCES623[kind];
  if(mode==='old')return {key:'fallback_'+e.kind,url:fallback[e.kind]};
  return {key:kind,url:mode==='cdn'?src.remote:src.local};
 }
 async function fetchCached(key,url){
  if(!modelCache.has(key))modelCache.set(key,loader.loadAsync(url));
  return modelCache.get(key);
 }
 for(const e of entries){
  const source=modelFor(e);
  (async()=>{
   try{placeModel(e,await fetchCached(source.key,source.url));status(e.name,'OK · '+source.key);}
   catch(err){
    console.warn('[NPC623] Licensed model failed; using existing character',e.name,err);
    stats.failed++;status(e.name,'FAIL · '+source.key+' · '+String(err.message||err).slice(0,55));
    try{placeModel(e,await fetchCached('fallback_'+e.kind,fallback[e.kind]));}
    catch(fail){console.warn('[NPC623] Even fallback failed',e.name,fail);}
   }
  })();
 }
 function nearest(maxDist=3.6){let hit=null,dist=maxDist;
  for(const e of entries){const d=Math.hypot(e.group.position.x-player.position.x,e.group.position.z-player.position.z);
   if(d<dist){dist=d;hit=e;}}
  return hit;
 }
 function dialogue(){
  const e=nearest();if(!e)return false;
  if(e.motions?.talkA)e.talkUntil=performance.now()+3600;
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
  e.label.visible=d<5.8;e.label.quaternion.copy(camera.quaternion);
  if(e.motions&&e.lastPos){
   const delta=e.group.position.distanceToSquared(e.lastPos);e.lastPos.copy(e.group.position);
   const desired=e.talkUntil>now&&e.motions.talkA?e.motions.talkA:(e.motions.walkA&&delta>.000006?e.motions.walkA:e.motions.idleA);
   if(desired!==e.motions.active){e.motions.active.fadeOut(.22);desired.reset().fadeIn(.22).play();e.motions.active=desired;}
   if(d<27&&e.lastTick!==undefined)e.motions.mixer.update(Math.min(.05,(now-e.lastTick)*.001));
   e.lastTick=now;
  }
 }}
 return {dialogue,update,stats,nearest,entries};
}
