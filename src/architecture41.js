import * as THREE from 'three';
// Alpha 4.1: additive architectural details. No hero rig, animation, movement or collision changes.
export function installArchitecture41(scene){
 const root=new THREE.Group();root.name='Architecture41';scene.add(root);
 const materials={wood:new THREE.MeshStandardMaterial({color:0x473629,roughness:.93}),stone:new THREE.MeshStandardMaterial({color:0x988d7d,roughness:1}),trim:new THREE.MeshStandardMaterial({color:0xbba57b,roughness:.85}),roof:new THREE.MeshStandardMaterial({color:0x3e5264,roughness:.9}),gold:new THREE.MeshStandardMaterial({color:0xc9a46b,metalness:.35,roughness:.5}),glass:new THREE.MeshStandardMaterial({color:0x6c9caa,emissive:0x173d4c,emissiveIntensity:.3,roughness:.4})};
 const box=(p,w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.receiveShadow=true;p.add(o);return o};
 const beam=(p,a,b,r,m)=>{const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),d=v2.clone().sub(v1);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),m);o.position.copy(v1).add(v2).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(o)};
 const homes=[[-9,10],[-3,14],[5,14],[12,9],[-11,1],[14,0],[-7,-12],[8,-14]];
 homes.forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  // Architectural facade layers attached to the existing house footprint.
  for(const side of [-1,1]){box(g,.16,3.15,.2,materials.wood,side*2.22,1.75,2.39);box(g,.8,.13,.45,materials.stone,side*1.25,1.47,2.56);box(g,.86,.12,.14,materials.trim,side*1.25,2.73,2.51);box(g,.13,1.02,.14,materials.wood,side*1.25,2.14,2.52)}
  for(const y of [.4,3.35])box(g,4.7,.14,.19,materials.wood,0,y,2.4);
  // Roof ridge ornaments and small gabled dormers, kept light for mobile.
  beam(g,[-2.45,4.52,0],[2.45,4.52,0],.09,materials.trim);
  if(i%2===0){box(g,1.1,.83,.12,materials.roof,0,4.14,2.13);box(g,.72,.56,.15,materials.glass,0,4.13,2.23);box(g,1.45,.12,.4,materials.trim,0,4.65,2.12)}
  // Hanging sign and entrance frame.
  box(g,.12,1.92,.2,materials.trim,-.67,1.02,2.5);box(g,.12,1.92,.2,materials.trim,.67,1.02,2.5);box(g,1.48,.16,.25,materials.trim,0,2.04,2.5);
  if(i%3===0){box(g,.09,.9,.09,materials.wood,1.86,2.85,2.72);box(g,.9,.55,.08,materials.gold,1.86,2.56,2.75)}
 });
 // Standalone civic landmark outside the dense original street footprint.
 const square=new THREE.Group();square.position.set(-23,0,-12);root.add(square);
 box(square,8,.28,8,materials.stone,0,.05,0);
 for(const x of [-3.3,3.3])for(const z of [-3.3,3.3]){box(square,.52,4.8,.52,materials.stone,x,2.4,z);box(square,.83,.22,.83,materials.trim,x,4.85,z)}
 box(square,7.7,.3,7.7,materials.roof,0,5.2,0);
 const spire=new THREE.Mesh(new THREE.ConeGeometry(2.3,3.2,8),materials.roof);spire.position.set(0,6.95,0);square.add(spire);
 const bell=new THREE.Mesh(new THREE.SphereGeometry(.45,10,8),materials.gold);bell.position.set(0,4.2,0);square.add(bell);
 // LOD-style simple geometry, no added real-time lights or dynamic shadows.
 return root;
}
