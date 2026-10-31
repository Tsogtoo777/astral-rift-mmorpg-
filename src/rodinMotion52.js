// Astral Rift 5.2 — Procedural humanoid skin rig for the supplied static Rodin GLB.
// The source GLB has no skin, skeleton or animation clips. This system assigns
// approximate influences to its ORIGINAL 20k vertices, then drives real bones.
// That makes feet/arms move without replacing the original model with LEGO geometry.
// It is heuristic rigging, not a substitute for an artist-rigged production model.
const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = (a,b,v) => { const t=clamp01((v-a)/(b-a));return t*t*(3-2*t); };

// Mesh bounds of rodin-warrior.glb: X [-.50,.50], Y [0,1.69], Z [-.29,.28].
// Keep most back-facing cape cloth bound to pelvis instead of legs.
// indices: 0 pelvis, 1 spine, 2 head, 3 L shoulder, 4 L elbow,
//          5 R shoulder, 6 R elbow, 7 L hip, 8 L knee, 9 L foot,
//          10 R hip, 11 R knee, 12 R foot.
export function rodinVertexWeights52(x,y,z){
  const ax=Math.abs(x), side=x<0?0:1;
  const bones=[], weights=[];
  const put=(i,w)=>{if(w>0.0001){bones.push(i);weights.push(w);}};
  const head=smooth(1.37,1.53,y);
  let arm=smooth(.20,.34,ax)*smooth(.74,.93,y)*(1-smooth(1.21,1.40,y));
  // Behind the hero, leave hanging fabric/cape largely rigid instead of moving as hands.
  arm*= .65+.35*smooth(-.22,-.04,z);
  const leg=smooth(.065,.16,ax)*(1-smooth(.69,.83,y))*smooth(-.25,-.06,z);
  if(head>.01){put(2,head);put(1,1-head);}
  else if(arm>.01){
    const lower=1-smooth(.91,1.09,y);
    const index=side===0?3:5;
    put(index,arm*(1-lower));put(index+1,arm*lower);
    put(1,1-arm);
  }else if(leg>.01){
    const knee=1-smooth(.30,.48,y);
    const foot=1-smooth(.09,.18,y);
    const index=side===0?7:10;
    put(index,leg*(1-knee));put(index+1,leg*knee*(1-foot));put(index+2,leg*knee*foot);
    put(0,1-leg);
  }else{
    const torso=smooth(.71,1.02,y);
    put(1,torso);put(0,1-torso);
  }
  // Four GPU influences, normalized, required by SkinnedMesh.
  const entries=bones.map((id,i)=>({id,w:weights[i]})).sort((a,b)=>b.w-a.w).slice(0,4);
  const sum=entries.reduce((s,v)=>s+v.w,0)||1;
  const idx=[0,0,0,0],w=[0,0,0,0];
  entries.forEach((v,i)=>{idx[i]=v.id;w[i]=v.w/sum;});
  return {indices:idx,weights:w};
}

function createBlade52(THREE,hand){
  const weapon=new THREE.Group();weapon.name='RodinSword52';
  hand.add(weapon);weapon.position.set(0,-.22,.02);weapon.rotation.x=-.7;
  const metal=new THREE.MeshStandardMaterial({color:0xc1d9e8,metalness:.88,roughness:.22,side:THREE.DoubleSide});
  const gold=new THREE.MeshStandardMaterial({color:0xc9a267,metalness:.8,roughness:.28});
  const leather=new THREE.MeshStandardMaterial({color:0x29334b,metalness:.15,roughness:.78});
  const hilt=new THREE.Mesh(new THREE.CylinderGeometry(.037,.043,.23,8),leather);
  hilt.position.y=-.035;weapon.add(hilt);
  const guard=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,.30,8),gold);
  guard.rotation.z=Math.PI/2;guard.position.y=-.17;weapon.add(guard);
  const pommel=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,0),gold);
  pommel.position.y=.095;weapon.add(pommel);
  // Tapered triangular blade, not a box sword.
  const width=.075,depth=.022,length=.89;
  const v=[-width,-.2,depth, width,-.2,depth, .045,-.89,depth, 0,-1.10,0,
           -width,-.2,-depth, width,-.2,-depth, .045,-.89,-depth];
  const faces=[0,1,2,0,2,3, 5,4,3,5,3,6, 4,0,3,5,6,3, 1,5,6,1,6,2,
               0,4,5,0,5,1, 2,6,3];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(faces);geo.computeVertexNormals();
  const blade=new THREE.Mesh(geo,metal);weapon.add(blade);
  weapon.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return weapon;
}

export function createRodinMotion52(THREE,model){
  const source=[];
  model.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh)source.push(o);});
  if(source.length!==1 || !source[0].geometry?.attributes?.position){
    throw new Error('Rodin requires one static mesh with POSITION. Found '+source.length);
  }
  const original=source[0],geo=original.geometry.clone();
  const positions=geo.attributes.position;
  const si=new Uint16Array(positions.count*4),sw=new Float32Array(positions.count*4);
  for(let i=0;i<positions.count;i++){
    const a=rodinVertexWeights52(positions.getX(i),positions.getY(i),positions.getZ(i));
    for(let j=0;j<4;j++){si[i*4+j]=a.indices[j];sw[i*4+j]=a.weights[j];}
  }
  geo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));
  geo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));
  const mesh=new THREE.SkinnedMesh(geo,original.material);
  mesh.name='RodinAnimatedSkinned52';mesh.castShadow=true;mesh.receiveShadow=false;
  mesh.frustumCulled=false; // free-motion legs may extend outside the rest-pose sphere.
  mesh.position.copy(original.position);mesh.rotation.copy(original.rotation);mesh.scale.copy(original.scale);
  const bone=(name,parent,x,y,z)=>{const b=new THREE.Bone();b.name=name;b.position.set(x,y,z);parent.add(b);return b;};
  const pelvis=new THREE.Bone();pelvis.name='RodinPelvis';pelvis.position.set(0,0,0);
  const spine=bone('RodinSpine',pelvis,0,.83,0);
  const head=bone('RodinHead',spine,0,.60,0);
  const lArm=bone('RodinLShoulder',spine,-.30,.44,0);
  const lElbow=bone('RodinLElbow',lArm,-.03,-.30,0);
  const rArm=bone('RodinRShoulder',spine,.30,.44,0);
  const rElbow=bone('RodinRElbow',rArm,.03,-.30,0);
  const lThigh=bone('RodinLHip',pelvis,-.16,.76,0);
  const lKnee=bone('RodinLKnee',lThigh,0,-.36,0);
  const lFoot=bone('RodinLFoot',lKnee,0,-.32,.04);
  const rThigh=bone('RodinRHip',pelvis,.16,.76,0);
  const rKnee=bone('RodinRKnee',rThigh,0,-.36,0);
  const rFoot=bone('RodinRFoot',rKnee,0,-.32,.04);
  const bones=[pelvis,spine,head,lArm,lElbow,rArm,rElbow,lThigh,lKnee,lFoot,rThigh,rKnee,rFoot];
  const parent=original.parent;
  parent.remove(original);parent.add(mesh);parent.add(pelvis);
  parent.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  const sword=createBlade52(THREE,rElbow);
  const updateRotation=(b,axis,wanted,dt,speed=13)=>{b.rotation[axis]+=(wanted-b.rotation[axis])*(1-Math.exp(-speed*dt));};
  const animation={phase:0,move:0,attack:0,attackTotal:.38,combo:0,lastComboStart:-20,
    time:0, sword, mesh, bones,
    triggerAttack(){
      if(this.time-this.lastComboStart>1.4)this.combo=0;
      else this.combo=(this.combo+1)%3;
      this.lastComboStart=this.time;
      this.attack=this.attackTotal;
    },
    update({dt=1/60,moving=false,sprinting=false,blocking=false,dodging=false,weapon=0}={}){
      dt=Math.max(0,Math.min(dt,.05));this.time+=dt;
      this.move+=(Number(!!moving)-this.move)*(1-Math.exp(-dt*11));
      const movingBlend=this.move;const freq=sprinting?15:11.5;
      this.phase+=dt*freq;
      const wave=Math.sin(this.phase),swing=movingBlend*wave;
      this.attack=Math.max(0,this.attack-dt);
      const progress=1-this.attack/this.attackTotal;
      const combat=this.attack>0?Math.sin(Math.PI*progress)**1.15:0;
      const dodge=dodging?1:0;
      const waveKnee=(v)=>Math.max(0,v);
      const blend=1-Math.exp(-dt*15);
      pelvis.position.y+=(movingBlend*.018*Math.cos(this.phase*2)-pelvis.position.y)*blend;
      updateRotation(pelvis,'z',.045*swing+combat*(this.combo===1?.12:-.08),dt);
      updateRotation(spine,'x',-.025*movingBlend+combat*.22+dodge*.38,dt);
      updateRotation(spine,'y',.06*swing+combat*(this.combo===1?-.55:.38),dt);
      updateRotation(head,'x',.02*Math.sin(this.time*2.3)-combat*.09,dt);
      updateRotation(lThigh,'x',-.55*swing+dodge*.65,dt);
      updateRotation(rThigh,'x',.55*swing-dodge*.35,dt);
      updateRotation(lKnee,'x',movingBlend*.60*waveKnee(wave)+dodge*.42,dt);
      updateRotation(rKnee,'x',movingBlend*.60*waveKnee(-wave)+dodge*.3,dt);
      updateRotation(lFoot,'x',-.25*movingBlend*waveKnee(wave),dt);
      updateRotation(rFoot,'x',-.25*movingBlend*waveKnee(-wave),dt);
      const baseL=-.28*swing,baseR=.28*swing;
      const atkR=this.combo===2?-2.0:this.combo===1?-.65:-1.65;
      updateRotation(lArm,'x',baseL+combat*(-.55)+(blocking?-.55:0),dt,18);
      updateRotation(rArm,'x',baseR+combat*atkR+(blocking?-.4:0),dt,18);
      updateRotation(lArm,'z',-.12+(blocking?-.25:0)+combat*.32,dt);
      updateRotation(rArm,'z',.12+combat*(this.combo===1?-.95:.42),dt);
      updateRotation(lElbow,'x',-.15-movingBlend*.07-(blocking?.65:0),dt);
      updateRotation(rElbow,'x',-.24+combat*(this.combo===2?1.6:1.1),dt,18);
      updateRotation(rElbow,'z',combat*(this.combo===1?.8:-.26),dt,16);
      sword.visible=weapon===0;
      // The sword lives on the forearm, therefore it follows the attack arc.
    }
  };
  return animation;
}
