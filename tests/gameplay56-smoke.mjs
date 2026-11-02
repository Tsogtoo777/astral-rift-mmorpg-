import assert from 'node:assert/strict';
import fs from 'node:fs';
import {strikeCheck56,createCombat56} from '../src/combat56.js';
import {createCameraGuard56} from '../src/camera56.js';
const pos=(x=0,z=0)=>({x,y:0,z,set(nx,ny,nz){this.x=nx;this.y=ny;this.z=nz;return this}});
const player={position:pos(),rotation:{y:0}};
function enemy(x=0,z=2){return {alive:true,hp:100,g:{position:pos(x,z)},m:{rotation:{z:0},scale:{setScalar(v){this.value=v}}}};}
const e=enemy();
assert.deepEqual(strikeCheck56(player,e,3,0),{ok:true,reason:'hit'});
assert.equal(strikeCheck56(player,enemy(0,4),3,0).reason,'range');
assert.equal(strikeCheck56(player,enemy(0,-2),3,0).reason,'angle');
assert.equal(strikeCheck56(player,enemy(0,4),17,1,(x,z)=>z>2&&z<3).reason,'obstructed');
assert.equal(strikeCheck56(player,enemy(0,4),17,1).ok,true);
assert.equal(strikeCheck56(player,null,3,0).reason,'no-target');
const events=[];
const combat=createCombat56({player,enemies:[e],isBlocked:()=>false,
 onStrike:(target,damage)=>{target.hp-=damage;combat.react(target,damage);events.push('impact')},
 onLaunch:weapon=>events.push('release-'+weapon),onMiss:reason=>events.push('miss-'+reason)});
assert.equal(combat.queue({weapon:0,target:e,damage:28,range:3}),true);
assert.equal(combat.queue({weapon:0,target:e,damage:28,range:3}),false,'cannot queue another swing before contact');
for(let i=0;i<3;i++)combat.update(.05,0);
assert.equal(e.hp,100,'no damage during wind-up');
assert.equal(events.length,0,'no VFX before strike frame');
combat.update(.05,0);
assert.deepEqual(events,['release-0','impact']);
assert.equal(e.hp,72);
assert.ok(e.stun56>.1);
const before=e.g.position.z;
combat.updateEnemy(e,.04);
assert.ok(e.g.position.z>before,'hit knockback actually moves enemy');
assert.ok(e.m.scale.value>1,'hit reaction has visual squash/stretch');
for(let i=0;i<15;i++)combat.updateEnemy(e,.04);
assert.equal(e.m.rotation.z,0,'reaction resets to stable pose');
assert.equal(e.m.scale.value,1,'reaction restores original mesh scale');
assert.equal(e.stun56,0);
const bow=enemy(0,6);events.length=0;
combat.queue({weapon:1,target:bow,damage:18,range:17});
for(let i=0;i<6;i++)combat.update(.05,1);
assert.deepEqual(events,['release-1'],'bow should launch before the projectile reaches its target');
assert.equal(bow.hp,100);
for(let i=0;i<5;i++)combat.update(.05,1);
assert.deepEqual(events,['release-1','impact']);
assert.equal(bow.hp,82);
const wall=enemy(0,4);const eventsBlocked=[];
const blockedCombat=createCombat56({player,enemies:[wall],isBlocked:(_,z)=>z>2&&z<3,
 onStrike:()=>eventsBlocked.push('hit'),onLaunch:()=>{},onMiss:reason=>eventsBlocked.push(reason)});
blockedCombat.queue({weapon:1,target:wall,damage:18,range:17});
for(let i=0;i<12;i++)blockedCombat.update(.05,1);
assert.deepEqual(eventsBlocked,['obstructed'],'no damage through solid wall');
blockedCombat.queue({weapon:1,target:wall,damage:18,range:17});
blockedCombat.update(.05,0);
assert.equal(blockedCombat.pending,null,'weapon swap cancels stale queued shot');
class Vec3 {
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
 copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
 sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
 length(){return Math.hypot(this.x,this.y,this.z)}
 multiplyScalar(n){this.x*=n;this.y*=n;this.z*=n;return this}
 addScaledVector(v,n){this.x+=v.x*n;this.y+=v.y*n;this.z+=v.z*n;return this}
}
class Raycaster{
 set(from,dir){this.dir=dir;this.from=from}
 intersectObjects(objects){return objects.length?[{distance:2}]:[]}
}
const guard=createCameraGuard56({Vector3:Vec3,Raycaster},[{visible:true,material:{transparent:false}}]);
const cam=new Vec3(0,0,4);assert.equal(guard.resolve(new Vec3(),cam),true);
assert.ok(Math.abs(cam.z-1.6)<.001,'camera radius remains on safe side of wall');
const guardHidden=createCameraGuard56({Vector3:Vec3,Raycaster},[{visible:false}]);
assert.equal(guardHidden.resolve(new Vec3(),new Vec3(0,0,4)),false);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('ALPHA 5.8.2 · COMBAT CONTROL'));
assert.ok(main.includes('combat56.update(dt,state.weapon)'));
assert.ok(main.includes('combat56.updateEnemy(e,dt)'));
assert.ok(main.includes('cameraGuard56.resolve(camTarget,camera.position)'));
assert.ok(!main.includes('for(let i=0;i<9;i++)box(1.8,1.5,1.8,0x727c83'));
assert.ok(main.includes('projectile56.fire(target.g.position)'));
assert.ok(!main.slice(main.indexOf('function attack(){'),main.indexOf('function dodge(){')).includes('hit('),'button press should schedule a timed strike, not apply HP damage');
console.log('PASS: timed wind-up/contact, combo gating, bow travel, walls, recoil, and post-smoothing camera safety');
