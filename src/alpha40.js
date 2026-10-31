// Astral Rift 4.0 — additive world systems. No character mesh/rig/animation mutations.
import * as THREE from 'three';
import { installArchitecture41 } from './architecture41.js';

export function createAlpha40(api) {
  const {scene,player,renderer,camera,castleHall25,hallOrigin25,interior09,rooms22,openWindow,closeWindow,msg,saveGame,gainXp,teleport25,app}=api;
  const root=new THREE.Group();root.name='AstralRift40World';scene.add(root);
  installArchitecture41(scene);
  const solid=[];const cameraSolids=[];const interactables=[];const patrols=[];const pickupMeshes=[];
  const mat={
    stone:new THREE.MeshStandardMaterial({color:0x86949a,roughness:.9}),
    limestone:new THREE.MeshStandardMaterial({color:0xd5c4a3,roughness:.94}),
    dark:new THREE.MeshStandardMaterial({color:0x304b62,roughness:.77}),
    timber:new THREE.MeshStandardMaterial({color:0x684a37,roughness:.92}),
    bronze:new THREE.MeshStandardMaterial({color:0xcda765,metalness:.48,roughness:.4}),
    burgundy:new THREE.MeshStandardMaterial({color:0x8b3e54,roughness:.92,side:THREE.DoubleSide}),
    teal:new THREE.MeshStandardMaterial({color:0x388c9b,roughness:.85,side:THREE.DoubleSide}),
    leaf:new THREE.MeshStandardMaterial({color:0x42735c,roughness:1}),
    glow:new THREE.MeshStandardMaterial({color:0x74e8f5,emissive:0x1d7f9b,emissiveIntensity:1.4}),
    rug:new THREE.MeshStandardMaterial({color:0x933f52,roughness:1}),
    roof:new THREE.MeshStandardMaterial({color:0x3d5777,roughness:.8}),
    glass:new THREE.MeshStandardMaterial({color:0x90c9da,emissive:0x20495d,emissiveIntensity:.3,roughness:.25})
  };
  function mesh(parent,geo,material,x,y,z,shadow=false){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o}
  function block(parent,w,h,d,material,x,y,z,collision=false){const o=mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z,true);if(collision){const world=new THREE.Vector3();o.getWorldPosition(world);solid.push({x:world.x,z:world.z,w,d,mesh:o});cameraSolids.push(o)}return o}
  function worldBlock(parent,w,h,d,material,x,y,z){const o=block(parent,w,h,d,material,x,y,z);return o}
  function addSolid(x,z,w,d){solid.push({x,z,w,d})}
  function groundTile(x,z,w,d,material=mat.stone){mesh(root,new THREE.BoxGeometry(w,.09,d),material,x,.015,z)}
  function label(text,x,y,z,parent=root){const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.fillStyle='#152c3d';c.fillRect(0,0,512,128);c.strokeStyle='#d8b875';c.lineWidth=8;c.strokeRect(6,6,500,116);c.font='bold 38px sans-serif';c.fillStyle='#fff1c9';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,66);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const o=mesh(parent,new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}),x,y,z);return o}
  function pillar(parent,x,z,h=4){mesh(parent,new THREE.CylinderGeometry(.33,.43,h,8),mat.limestone,x,h/2,z,true);mesh(parent,new THREE.BoxGeometry(.92,.22,.92),mat.bronze,x,h+.08,z)}
  function banner(parent,x,y,z,color=mat.burgundy){mesh(parent,new THREE.PlaneGeometry(1.35,2.6),color,x,y,z)}
  function lantern(parent,x,y,z){mesh(parent,new THREE.CylinderGeometry(.09,.12,2.4,6),mat.timber,x,y-1.1,z);mesh(parent,new THREE.OctahedronGeometry(.32),mat.glow,x,y+.2,z)}
  // Wider, intentionally traversable town: two distinct functional districts.
  for(const [x,z,w,d] of [[-21,8,13,3],[21,8,13,3],[-22,0,12,2.5],[22,0,12,2.5]])groundTile(x,z,w,d,mat.limestone);
  function openHall(cx,cz,side){
    const g=new THREE.Group();g.position.set(cx,0,cz);root.add(g);
    const front=side===0?-4.5:4.5;
    block(g,10,.25,10,mat.stone,0,.02,0);
    block(g,.5,5.5,10,mat.limestone,-5,2.75,0);
    block(g,.5,5.5,10,mat.limestone,5,2.75,0);
    block(g,10,5.5,.5,mat.limestone,0,2.75,-front);
    // Entrance on the city-facing side; two wall sections leave a 3m gap.
    for(const dx of [-3.35,3.35])block(g,3.3,5.5,.5,mat.limestone,dx,2.75,front);
    const roof=block(g,10.8,.42,10.8,mat.roof,0,5.65,0);
    // Hide the roof only while the player is inside this hall, preserving its exterior silhouette.
    roof.userData.interiorRoof40={cx,cz};
    for(const dx of [-4.6,4.6])for(const dz of [-4.1,4.1])pillar(g,dx,dz,5.5);
    for(const dx of [-2.4,2.4])mesh(g,new THREE.BoxGeometry(1.3,1.5,.14),mat.glass,dx,3.3,-front);
    // Walls are physical; entrance is open and has no teleport screen.
    addSolid(cx-5,cz,.5,10);addSolid(cx+5,cz,.5,10);addSolid(cx,cz-front,10,.5);
    for(const dx of [-3.35,3.35])addSolid(cx+dx,cz+front,3.3,.5);
    return g;
  }
  const guild=openHall(27,15,0);
  label('⚔ АЯЛАГЧДЫН ГИЛЬД',0,4.6,-4.78,guild);
  mesh(guild,new THREE.BoxGeometry(2.3,.14,7),mat.rug,0,.13,-.3);
  for(const x of [-3.1,3.1]){
    worldBlock(guild,2,.7,1.1,mat.timber,x,.5,1.6);
    worldBlock(guild,1.7,1.7,.35,mat.bronze,x,1.4,3.9);
    mesh(guild,new THREE.TorusGeometry(.65,.1,8,24),mat.glow,x,3,3.65);
  }
  const library=openHall(-27,15,0);
  label('✧ ИД ШИДИЙН НОМЫН САН',0,4.6,-4.78,library);
  for(const x of [-3.6,3.6])for(const z of [-2,0,2]){
    worldBlock(library,1.3,2.8,.8,mat.timber,x,1.45,z);
    for(let i=0;i<4;i++)worldBlock(library,.2,.5,.4,i%2?mat.burgundy:mat.teal,x-.4+i*.26,1.2,z+.44);
  }
  mesh(library,new THREE.CylinderGeometry(1.1,1.3,.8,10),mat.bronze,0,.45,2);
  mesh(library,new THREE.OctahedronGeometry(.58),mat.glow,0,1.55,2);
  // Market street, training area and a gatehouse that looks unlike the old repeated houses.
  for(const [x,z] of [[-19,-5],[-24,-6],[19,-5],[24,-6]]){
    const canopy=mesh(root,new THREE.ConeGeometry(2.25,1.4,4),x<0?mat.teal:mat.burgundy,x,3.3,z);canopy.rotation.y=Math.PI/4;
    for(const dx of [-1.3,1.3])for(const dz of [-.9,.9])mesh(root,new THREE.CylinderGeometry(.08,.1,2.6,6),mat.timber,x+dx,1.3,z+dz);
    worldBlock(root,2.5,.22,1.5,mat.timber,x,1.25,z);
  }
  const dummy=new THREE.Group();dummy.position.set(18,0,-14);root.add(dummy);
  mesh(dummy,new THREE.CylinderGeometry(.2,.24,2.2,8),mat.timber,0,1.1,0);
  mesh(dummy,new THREE.CylinderGeometry(.55,.5,.95,8),mat.burgundy,0,1.6,0);
  mesh(dummy,new THREE.BoxGeometry(1.9,.18,.2),mat.timber,0,1.85,0);
  mesh(dummy,new THREE.SphereGeometry(.37,10,8),mat.limestone,0,2.42,0);
  addSolid(18,-14,1.2,1.2);groundTile(18,-14,5.5,5.5,mat.limestone);
  label('⚔ БЭЛТГЭЛ',18,3.65,-14.1);
  for(const [x,z] of [[-17,9],[17,9],[-19,-12],[19,-12],[-27,4],[27,4]])lantern(root,x,3.1,z);
  // Castle hall: actual ceiling, entry wall, throne, guards and physical furniture.
  const hx=hallOrigin25.x,hz=hallOrigin25.z;
  block(castleHall25,16,.35,18,mat.dark,hx,6.25,hz);
  for(const dx of [-5.35,5.35])block(castleHall25,5.3,6,.36,mat.stone,hx+dx,3,hz+9);
  block(castleHall25,5.4,2,.36,mat.bronze,hx,5,hz+9);
  for(const dx of [-7.7,7.7])for(const dz of [-5.5,0,5.5]){
    pillar(castleHall25,hx+dx,hz+dz,5.5);
    banner(castleHall25,hx+dx*.98,3.9,hz+dz,mat.burgundy);
  }
  for(const dx of [-5.2,5.2]){
    mesh(castleHall25,new THREE.CylinderGeometry(.35,.35,2,8),mat.dark,hx+dx,1,hz-4.2);
    mesh(castleHall25,new THREE.OctahedronGeometry(.38),mat.glow,hx+dx,2.35,hz-4.2);
  }
  // 3 low steps connect the carpet to the raised throne platform.
  for(let i=0;i<3;i++)block(castleHall25,2.9,.13*(i+1),.45,mat.bronze,hx,.065*(i+1),hz-3.65-i*.48);
  const throneSolids=[{x:hx,z:hz-7.2,w:2.8,d:1.6},{x:hx-3.6,z:hz-6.6,w:1,d:1.2},{x:hx+3.6,z:hz-6.6,w:1,d:1.2}];
  // Royal NPCs are decorative meshes with contextual dialogue, not character-rig changes.
  function person(x,z,shirt,role){
    const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
    mesh(g,new THREE.CylinderGeometry(.36,.48,1.2,9),new THREE.MeshStandardMaterial({color:shirt}),0,.9,0,true);
    mesh(g,new THREE.SphereGeometry(.29,12,9),mat.limestone,0,1.72,0);
    mesh(g,new THREE.ConeGeometry(.42,.34,8),mat.dark,0,2.02,0);
    return {g,role};
  }
  const guildmaster=person(23,7,0x426d8a,'guild');
  const librarian=person(-23,7,0x794d8b,'library');
  const trainer=person(19,-11,0x9a593b,'trainer');
  const guards=[person(-4.2,19,0x405b7c,'guard'),person(4.2,19,0x405b7c,'guard')];
  const royal=new THREE.Group();royal.position.set(hx,0,hz-5.45);castleHall25.add(royal);
  mesh(royal,new THREE.CylinderGeometry(.38,.55,1.2,10),mat.burgundy,0,1.15,0);
  mesh(royal,new THREE.SphereGeometry(.28,10,8),mat.limestone,0,2.0,0);
  mesh(royal,new THREE.ConeGeometry(.44,.5,7),mat.bronze,0,2.48,0);
  for(const dx of [-3.8,3.8]){
    const g=new THREE.Group();g.position.set(hx+dx,0,hz-3.8);castleHall25.add(g);
    mesh(g,new THREE.CylinderGeometry(.38,.45,1.5,8),mat.dark,0,.85,0);
    mesh(g,new THREE.SphereGeometry(.3,8,8),mat.bronze,0,1.85,0);
  }
  // Dungeon: stronger visual identity, but preserve the existing boss logic and exit.
  const dungeon=new THREE.Group();scene.add(dungeon);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6,r=13.2,x=48+Math.sin(a)*r,z=-48+Math.cos(a)*r;
    mesh(dungeon,new THREE.BoxGeometry(1.6,.45,1.6),mat.stone,x,.2,z);
    mesh(dungeon,new THREE.CylinderGeometry(.3,.42,4.4,7),mat.dark,x,2.4,z);
    mesh(dungeon,new THREE.OctahedronGeometry(.28),mat.glow,x,4.85,z);
  }
  const altar=mesh(dungeon,new THREE.CylinderGeometry(2.2,2.4,.3,12),mat.burgundy,48,.17,-51);
  for(const dz of [-41,-46,-51])for(const dx of [-3.5,3.5]){
    const o=mesh(dungeon,new THREE.TorusGeometry(.7,.07,8,20),mat.glow,48+dx,2.6,dz);
    o.rotation.y=Math.PI/2;
  }
  // Additional visual POIs: no decorative collision across main roads.
  for(const [x,z] of [[-47,13],[47,13],[-45,-14],[45,-14]]){
    mesh(root,new THREE.CylinderGeometry(2.3,2.5,.22,12),mat.stone,x,.11,z);
    for(let i=0;i<5;i++){
      const a=i*2*Math.PI/5;
      mesh(root,new THREE.CylinderGeometry(.24,.33,3.2,7),mat.limestone,x+Math.cos(a)*1.7,1.65,z+Math.sin(a)*1.7);
    }
    mesh(root,new THREE.OctahedronGeometry(.8),mat.glow,x,3.3,z);
  }
  // Separate save key: existing 2.5.1 save remains readable and unmodified.
  const key='astral-rift-alpha40-save';let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  const state={stage:Math.min(4,Math.max(0,Number(stored.stage)||0)),kills:Math.max(0,Number(stored.kills)||0),relic:!!stored.relic,claimed:!!stored.claimed,discoveries:Array.isArray(stored.discoveries)?stored.discoveries:[],tutorial:!!stored.tutorial};
  function persist(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
  function reward(){api.addResources({gold:350,ore:4,crystal:2});gainXp(250);saveGame();persist()}
  function guildTalk(){
    if(state.stage===0){openWindow('⚔ Аялагчдын гильд','<p>Эртний балгас дахь ид шидийн тэмдэг алга болжээ. Эхлээд 3 мангас ялж замаа аюулгүй болго.</p><button id="guildStart40">Даалгавар авах</button>');document.getElementById('guildStart40').onclick=()=>{state.stage=1;state.kills=0;persist();closeWindow();msg('⚔ 3 мангас ялж, балгас руу яв')};return}
    if(state.stage===1){openWindow('⚔ Гильдийн даалгавар',`<p>Дайсан: ${Math.min(3,state.kills)}/3. Дайснаа ялсны дараа Эртний балгасын гэрэлт чулуунд оч.</p>`);return}
    if(state.stage===2){openWindow('⚔ Гильдийн даалгавар','<p>Одоо Эртний балгас (x=36, z=-44) дахь гэрэлт чулуунд очоод ✦ Судлах дар.</p>');return}
    if(state.stage===3&&!state.claimed){openWindow('⚔ Гильдийн шагнал','<p>Балгасын тэмдгийг оллоо! Шагнал: 350 алт, 4 хүдэр, 2 талст, 250 EXP.</p><button id="guildClaim40">Шагнал авах</button>');document.getElementById('guildClaim40').onclick=()=>{state.claimed=true;state.stage=4;reward();closeWindow();msg('🏆 Гильдийн даалгавар биеллээ')};return}
    openWindow('⚔ Аялагчдын гильд','<p>Чи хотын нэр хүндтэй хамгаалагч боллоо. Шинэ даалгаврууд дараагийн шинэчлэлтэд нэмэгдэнэ.</p>');
  }
  function libraryTalk(){openWindow('✧ Номын сан',`<p>Шидэт ойд эртний талст, балгасад алдагдсан тэмдэг бий.</p><p>Гильдийн даалгавар: ${['Аваагүй','3 дайсан ял','Балгас судал','Шагнал ав','Биелсэн'][state.stage]}</p><button id="libraryMap40">🗺 Газрын зураг</button>`);document.getElementById('libraryMap40').onclick=()=>{closeWindow();showMap()}}
  function trainerTalk(){openWindow('⚔ Бэлтгэлийн талбай','<p>Илд: 1–3 чадвар. R товчийг яг дайсны цохилтын өмнө дарж parry хийнэ. Space: dodge, X: зэвсэг солих.</p><button id="training40">Сургалт дуусгах</button>');document.getElementById('training40').onclick=()=>{if(!state.tutorial){state.tutorial=true;api.addResources({gold:50});saveGame();persist();msg('⚔ Сургалт +50 алт')}closeWindow()}}
  function guardTalk(){openWindow('🛡 Харуулын эргүүл','<p>Цайзын хаалга нээлттэй. Гильд зүүн талд, номын сан баруун биш, баруун/зүүн тийшээ харсан чиглэлээс хамаарч өөрчлөгдөнө. Газрын зураг дээр байрлалыг шалгаарай.</p>')}
  function royalTalk(){openWindow('👑 Хааны зөвлөл','<p>Хаант улсыг хамгаалж буйд баярлалаа. Гильдийн даалгаврыг биелүүлж, ой ба балгасыг судал.</p><button id="royalQuest40">Даалгаврын явц</button>');document.getElementById('royalQuest40').onclick=()=>{closeWindow();guildTalk()}}
  function interact(){
    const p=player.position;const inHall=api.isCastle();
    if(inHall){if(Math.hypot(p.x-hx,p.z-(hz-5.45))<3.4){royalTalk();return true}return false}
    if(api.isInterior()||api.isDungeon())return false;
    for(const item of [{obj:guildmaster,fn:guildTalk},{obj:librarian,fn:libraryTalk},{obj:trainer,fn:trainerTalk},...guards.map(obj=>({obj,fn:guardTalk}))]){
      if(p.distanceTo(item.obj.g.position)<3.6){item.fn();return true}
    }
    if(Math.hypot(p.x-18,p.z+14)<3.2){trainerTalk();return true}
    if(Math.hypot(p.x-36,p.z+44)<4.2&&state.stage===2){state.stage=3;state.relic=true;persist();msg('✧ Эртний тэмдэг оллоо. Гильд рүү буц!');return true}
    return false;
  }
  function recordKill(enemy){if(enemy?.boss)return;if(state.stage===1){state.kills++;if(state.kills>=3){state.stage=2;msg('⚔ Одоо Эртний балгас дахь гэрэлт чулууг судал')}persist()}}
  function blocked(x,z){
    if(api.isCastle()){
      if(Math.abs(x-hx)>7.25||Math.abs(z-hz)>8.1)return true;
      for(const b of throneSolids)if(Math.abs(x-b.x)<b.w/2+.36&&Math.abs(z-b.z)<b.d/2+.36)return true;
      // The dais is accessible only from the central steps, not its sides.
      if(z<hz-4.8&&z>hz-8.35&&Math.abs(x-hx)<2.9){
        const onSteps=Math.abs(x-hx)<1.4;
        if(!onSteps)return true;
      }
      return false;
    }
    if(api.isInterior()||api.isDungeon())return false;
    return solid.some(b=>Math.abs(x-b.x)<b.w/2+.39&&Math.abs(z-b.z)<b.d/2+.39);
  }
  function groundHeight(){
    if(!api.isCastle())return 0;
    const x=player.position.x-hx,z=player.position.z-hz;
    if(Math.abs(x)>1.45)return 0;
    if(z<=-4.7&&z>=-8.35)return .36;
    if(z<=-4.1&&z>-4.7)return .26;
    if(z<=-3.65&&z>-4.1)return .16;
    if(z<=-3.2&&z>-3.65)return .08;
    return 0;
  }
  const ray=new THREE.Raycaster();
  function cameraCollision(target,desired){
    if(!api.isCastle()&&!api.isInterior()&&!api.isDungeon()){
      const v=desired.clone().sub(target);const dist=v.length();if(dist>.2){ray.set(target,v.normalize());ray.near=.1;ray.far=dist;const hits=ray.intersectObjects(cameraSolids,false);if(hits.length)desired.copy(target).addScaledVector(v.normalize(),Math.max(.6,hits[0].distance-.35))}
    }
    if(api.isCastle()){
      desired.x=THREE.MathUtils.clamp(desired.x,hx-6.8,hx+6.8);
      desired.z=THREE.MathUtils.clamp(desired.z,hz-8,hz+8);
      desired.y=THREE.MathUtils.clamp(desired.y,1.45,5.65);
    }
  }
  const mapUI=document.createElement('div');mapUI.id='worldMap40';mapUI.setAttribute('role','dialog');mapUI.setAttribute('aria-label','Ертөнцийн газрын зураг');
  mapUI.innerHTML='<div class="mapTop40"><strong>🗺 ASTRAL RIFT · ЕРТӨНЦ</strong><button id="closeMap40">✕</button></div><canvas id="mapLarge40" width="640" height="430"></canvas><div class="mapBottom40">Хот · Гильд · Номын сан · Ой · Балгас · Dungeon · Цайз</div>';
  app.appendChild(mapUI);mapUI.querySelector('#closeMap40').onclick=hideMap;
  const mapButton=document.createElement('button');mapButton.id='worldMapButton40';mapButton.textContent='🗺 Газрын зураг';api.panel.appendChild(mapButton);
  mapButton.onclick=showMap;
  const mapCanvas=mapUI.querySelector('canvas');const ctx=mapCanvas.getContext('2d');
  const pois=[['Хот',0,5,'#e6c78d'],['Цайз',0,32,'#f2b972'],['Гильд',27,15,'#9ce6e5'],['Номын сан',-27,15,'#bfa4f6'],['Ой',-36,-43,'#91d7a5'],['Балгас',36,-44,'#f1ad87'],['Dungeon',0,-32,'#e79ee1'],['Бэлтгэл',18,-14,'#f2d08e']];
  function drawLargeMap(){
    const w=640,h=430;ctx.fillStyle='#112a34';ctx.fillRect(0,0,w,h);
    const pt=(x,z)=>[w/2+x*4.0,h/2-z*3.0];
    ctx.strokeStyle='#42616a';ctx.lineWidth=1;for(let x=-70;x<=70;x+=10){const a=pt(x,-70),b=pt(x,70);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
    for(let z=-70;z<=70;z+=10){const a=pt(-70,z),b=pt(70,z);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
    ctx.strokeStyle='#bda781';ctx.lineWidth=7;ctx.lineCap='round';const road=[[-36,-43],[0,-17],[0,5],[0,32]];ctx.beginPath();road.forEach(([x,z],i)=>{const p=pt(x,z);if(i===0)ctx.moveTo(...p);else ctx.lineTo(...p)});ctx.stroke();
    for(const [name,x,z,color] of pois){const [px,py]=pt(x,z);ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.font='bold 15px sans-serif';ctx.fillStyle='#f4e7c9';ctx.fillText(name,px+10,py-7)}
    const [px,py]=pt(player.position.x,player.position.z);ctx.fillStyle='#fffcf3';ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffef8e';ctx.lineWidth=2;ctx.stroke();
  }
  function showMap(){drawLargeMap();mapUI.classList.add('open40')}
  function hideMap(){mapUI.classList.remove('open40')}
  window.addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat){e.preventDefault();mapUI.classList.contains('open40')?hideMap():showMap()}if(e.code==='Escape')hideMap()});
  const quest=document.createElement('div');quest.id='quest40';app.appendChild(quest);
  const zone=document.createElement('div');zone.id='zone40';app.appendChild(zone);
  let lastUi=0,lastNpc=0,qualityClock=0,qualityFrames=0,lowQuality=false;
  let lastZone='';
  function update(now,dt){
    const inHall=api.isCastle(),inDungeon=api.isDungeon();
    root.traverse(o=>{if(o.userData.interiorRoof40){const {cx,cz}=o.userData.interiorRoof40;o.visible=!(Math.abs(player.position.x-cx)<4.7&&Math.abs(player.position.z-cz)<4.7)}});
    dungeon.visible=inDungeon;royal.visible=inHall;
    const y=groundHeight();player.position.y+=(y-player.position.y)*Math.min(1,dt*12);
    if(now-lastNpc>90){lastNpc=now;
      const night=api.getHour()<6||api.getHour()>21;
      guards.forEach((obj,i)=>{const t=now*.00045+i*2.4;obj.g.position.z=night?19:19+Math.sin(t)*2.5;obj.g.rotation.y=night?0:Math.cos(t)>0?0:Math.PI});
      guildmaster.g.rotation.y=Math.sin(now*.0006)*.22;
      librarian.g.rotation.y=Math.sin(now*.0004)*.18;
      const p=player.position;
      const name=inHall?'Хааны танхим':inDungeon?'Сүүдрийн Dungeon':api.isInterior()?'Барилгын дотоод орчин':Math.hypot(p.x+36,p.z+43)<13?'Шидэт ой':Math.hypot(p.x-36,p.z+44)<13?'Эртний балгас':Math.abs(p.x)>18&&p.z>3?'Хотын шинэ дүүрэг':Math.hypot(p.x,p.z-32)<16?'Хааны цайз':'Эхлэл хот';
      if(name!==lastZone){lastZone=name;zone.textContent='✦ '+name}
    }
    if(now-lastUi>250){lastUi=now;quest.textContent=['⚔ Гильдээс даалгавар ав',`⚔ Дайсан ${Math.min(3,state.kills)}/3`,'✧ Балгасын тэмдгийг ол','⚔ Гильд рүү буц','✓ Гильдийн даалгавар биелсэн'][state.stage];if(mapUI.classList.contains('open40'))drawLargeMap()}
    qualityClock+=dt;qualityFrames++;
    if(qualityClock>6){const fps=qualityFrames/qualityClock;qualityClock=0;qualityFrames=0;if(fps<37&&!lowQuality){lowQuality=true;renderer.setPixelRatio(Math.min(devicePixelRatio,.95));renderer.shadowMap.enabled=false;renderer.setSize(innerWidth,innerHeight);msg('⚙ FPS хамгаалах горим идэвхжив')}}
  }
  return {update,interact,recordKill,blocked,cameraCollision,showMap,hideMap,getQuest:()=>({...state})};
}
