/** Alpha 5.6: four reused arrow meshes. Cosmetic only; hit authority is combat56. */
export function createProjectile56(THREE,scene,player) {
  const pool=[];
  const steel=new THREE.MeshStandardMaterial({color:0xd8eaf2,metalness:.72,roughness:.35});
  const wood=new THREE.MeshStandardMaterial({color:0x624732,roughness:.8});
  const up=new THREE.Vector3(0,1,0),direction=new THREE.Vector3();
  for(let i=0;i<4;i++){
    const group=new THREE.Group();
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.56,5),wood);
    shaft.position.y=.10;group.add(shaft);
    const tip=new THREE.Mesh(new THREE.ConeGeometry(.07,.18,5),steel);
    tip.position.y=.47;group.add(tip);
    scene.add(group);group.visible=false;
    pool.push({group,age:1,life:.2,start:new THREE.Vector3(),end:new THREE.Vector3()});
  }
  let cursor=0;
  function fire(enemyPosition){
    if(!enemyPosition)return;
    const arrow=pool[cursor++%pool.length];
    arrow.start.copy(player.position).add(new THREE.Vector3(0,1.52,0));
    const heading=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));
    arrow.start.addScaledVector(heading,.78);
    arrow.end.copy(enemyPosition).add(new THREE.Vector3(0,1.05,0));
    direction.copy(arrow.end).sub(arrow.start);
    const dist=direction.length();
    if(dist<.1)return;
    arrow.life=Math.max(.10,Math.min(.20,dist/75));
    arrow.age=0;
    arrow.group.visible=true;
    arrow.group.position.copy(arrow.start);
    arrow.group.quaternion.setFromUnitVectors(up,direction.normalize());
  }
  function update(dt){
    for(const a of pool){
      if(!a.group.visible)continue;
      a.age+=Math.min(.06,Math.max(0,dt));
      const t=Math.min(1,a.age/a.life);
      a.group.position.lerpVectors(a.start,a.end,t);
      if(t>=1)a.group.visible=false;
    }
  }
  return {fire,update,dispose(){for(const a of pool){scene.remove(a.group);for(const m of a.group.children)m.geometry.dispose();}steel.dispose();wood.dispose();}};
}
