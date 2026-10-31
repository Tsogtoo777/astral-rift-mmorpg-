import * as THREE from 'three';
// Pooled GPU-friendly combat visuals: no geometry/material allocations per hit.
export function createAdvancedFX50(scene, player, camera, renderer) {
  const capacity=160;
  const positions=new Float32Array(capacity*3);
  const colors=new Float32Array(capacity*3);
  const particles=Array.from({length:capacity},()=>({life:0,max:1,vx:0,vy:0,vz:0}));
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.PointsMaterial({size:.12,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
  const cloud=new THREE.Points(geometry,material);cloud.frustumCulled=false;scene.add(cloud);
  const slashMaterial=new THREE.MeshBasicMaterial({color:0x8cefff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
  const slash=new THREE.Mesh(new THREE.TorusGeometry(1.18,.035,5,44,Math.PI*.82),slashMaterial);
  slash.rotation.set(.2,0,.45);slash.visible=false;scene.add(slash);
  let cursor=0,slashLife=0,lastAttack=false,stepTimer=0,quality='high';
  const gold=new THREE.Color(0xffd27c),cyan=new THREE.Color(0x7ceaff);
  function emit(x,y,z,count,kind='spark'){
    for(let i=0;i<count;i++){
      const idx=cursor++%capacity,p=particles[idx],j=idx*3;
      positions[j]=x;positions[j+1]=y;positions[j+2]=z;
      const col=(kind==='dust'?gold:cyan);colors[j]=col.r;colors[j+1]=col.g;colors[j+2]=col.b;
      const angle=Math.random()*Math.PI*2,speed=(kind==='dust'?.3:2)+Math.random()*(kind==='dust'?.7:2.5);
      p.vx=Math.cos(angle)*speed;p.vz=Math.sin(angle)*speed;p.vy=kind==='dust'?.25+Math.random()*.4:1+Math.random()*2;
      p.life=p.max=kind==='dust'?.35:.28+Math.random()*.25;
    }
  }
  function update(dt,walking,attacking){
    const active=attacking>.02;
    if(active&&!lastAttack){
      slashLife=.23;slash.visible=true;
      const dir=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));
      emit(player.position.x+dir.x*1.25,1.25,player.position.z+dir.z*1.25,quality==='high'?28:12);
    }
    lastAttack=active;
    if(walking){stepTimer-=dt;if(stepTimer<=0){stepTimer=.18;emit(player.position.x,.08,player.position.z,quality==='high'?4:2,'dust');}}
    else stepTimer=0;
    if(slashLife>0){slashLife=Math.max(0,slashLife-dt);slash.visible=slashLife>0;slash.position.copy(player.position).add(new THREE.Vector3(Math.sin(player.rotation.y)*1.05,1.3,Math.cos(player.rotation.y)*1.05));slash.rotation.y=player.rotation.y;slashMaterial.opacity=slashLife/.23*.8;slash.scale.setScalar(1+(1-slashLife/.23)*.32);}
    let alive=0;
    for(let i=0;i<capacity;i++){
      const p=particles[i],j=i*3;
      if(p.life<=0){positions[j+1]=-999;continue;}
      p.life=Math.max(0,p.life-dt);p.vy-=dt*4;
      positions[j]+=p.vx*dt;positions[j+1]+=p.vy*dt;positions[j+2]+=p.vz*dt;
      const fade=p.life/p.max;colors[j]*=Math.max(.01,1-dt*2);colors[j+1]*=Math.max(.01,1-dt*2);colors[j+2]*=Math.max(.01,1-dt*2);
      if(!p.life)positions[j+1]=-999;else alive++;
    }
    geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
    cloud.visible=alive>0;
  }
  function setQuality(next){quality=next;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,next==='high'?1.75:1.15));}
  setQuality((navigator.hardwareConcurrency||4)<=4?'low':'high');
  return {update,setQuality,dispose(){geometry.dispose();material.dispose();slash.geometry.dispose();slashMaterial.dispose();scene.remove(cloud,slash);}};
}
