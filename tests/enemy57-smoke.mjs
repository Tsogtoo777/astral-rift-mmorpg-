import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createEnemyAI57} from '../src/enemyAI57.js';
import {createDodge57} from '../src/dodge57.js';

const vec=(x=0,z=0)=>({x,y:0,z,set(nx,ny,nz){this.x=nx;this.y=ny;this.z=nz;return this}});
function makeEnemy(x=0,z=0,attrs={}){return {
 alive:true,g:{position:vec(x,z),rotation:{y:0}},m:{rotation:{y:0}},
 home:vec(x,z),hp:100,max:100,cool:0,...attrs
};}
const player={position:vec(0,0),rotation:{y:0}};
const events=[];
const brain=createEnemyAI57({player,isBlocked:()=>false,onAttack:e=>events.push(e),isSafeZone:()=>false,
 onTelegraph:(e,on,p)=>{e.show=on;e.progress=p}});
const normal=makeEnemy(0,1.6);
brain.update(normal,.05);
assert.equal(brain.phase(normal),'windup','approach should initiate visible warning');
assert.equal(normal.show,true);
assert.equal(events.length,0,'windup should not deal instant damage');
for(let i=0;i<7;i++)brain.update(normal,.05);
assert.ok(normal.progress>.4,'warning progress advances');
assert.equal(events.length,0);
for(let i=0;i<8;i++)brain.update(normal,.05);
assert.equal(events.length,1,'enemy strikes exactly once after telegraph');
assert.equal(normal.show,false,'warning hides after strike');
for(let i=0;i<8;i++)brain.update(normal,.05);
assert.equal(events.length,1,'enemy must recover before repeating');
// Dodge / out-of-range during windup must cancel collision and warning.
normal.cool=0;
brain.update(normal,.05);
assert.equal(brain.phase(normal),'windup');
player.position.z=7;
brain.update(normal,.05);
assert.equal(normal.show,false);
assert.equal(brain.phase(normal),'idle');
assert.equal(events.length,1,'moving away cancels pending enemy hit');
// Stagger during telegraph cancels attack.
player.position.z=0;
normal.cool=0;
brain.update(normal,.05);
assert.equal(normal.show,true);
normal.stun56=.12;
brain.update(normal,.05);
assert.equal(normal.show,false);
assert.equal(brain.phase(normal),'idle');
// Safe town must never begin an attack.
const safeEnemy=makeEnemy(0,1.4),safe=createEnemyAI57({player,onAttack:()=>{throw Error('attacked inside safe zone')},
 isBlocked:()=>false,isSafeZone:()=>true});
for(let i=0;i<70;i++)safe.update(safeEnemy,.05);
assert.notEqual(safe.phase(safeEnemy),'windup');
// Line obstruction at strike time blocks hit even if telegraph completed.
const blockedEnemy=makeEnemy(0,1.4),blockedHits=[];
const blocked=createEnemyAI57({player,onAttack:e=>blockedHits.push(e),isSafeZone:()=>false,
 isBlocked:(x,z)=>z>.5&&z<1.0});
for(let i=0;i<22;i++)blocked.update(blockedEnemy,.05);
assert.equal(blockedHits.length,0);
// Chase into weapon range when outside safe zone.
const stalker=makeEnemy(0,5);
for(let i=0;i<25;i++)brain.update(stalker,.05);
assert.ok(stalker.g.position.z<5,'enemy moves toward player');
// Knockback during a charge interrupts attack and removes warning.
const elite=makeEnemy(0,2.4,{elite:true});
for(let i=0;i<12;i++)brain.update(elite,.05);
assert.equal(elite.show,true);
elite.stun56=.2;
brain.update(elite,.05);
assert.equal(elite.show,false);
// Dead/respawned enemy must not retain the old attack state.
const dead=makeEnemy(0,1.4);
brain.update(dead,.05);
dead.alive=false;brain.update(dead,.05);
assert.equal(dead.show,false);
dead.alive=true;dead.cool=0;brain.update(dead,.05);
assert.equal(brain.phase(dead),'windup');
// Dodge should always travel same total distance, regardless of frame step.
function roll(step){let x=0,z=0;const d=createDodge57({onMove:(dx,dz)=>{x+=dx;z+=dz}});
 assert.equal(d.begin(0,2),true);assert.equal(d.begin(1,0),false,'no repeated dodge while active');
 for(let i=0;i<100&&d.active;i++)d.update(step);
 assert.equal(d.active,false);return {x,z};}
assert.ok(Math.abs(roll(.016).z-3.1)<1e-5);
assert.ok(Math.abs(roll(.05).z-3.1)<1e-5);
assert.ok(Math.abs(roll(.016).z-roll(.05).z)<1e-6);
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('ALPHA 5.8.2 · COMBAT CONTROL'));
assert.ok(main.includes('enemyAI57.update(e,dt)'));
assert.ok(main.includes('dodge57.update(dt)'));
assert.ok(main.includes("const speed55=state.dodge>0?0"),'prevent joystick + dodge double movement');
assert.ok(!main.includes('e.m.rotation.y+=dt*.5;if(!(e.stun56>0)'),'old instant enemy damage loop removed');
assert.ok(main.includes('parryWindow40=0;stamina25=Math.max(0,stamina25-9)'),'parry preserved');
assert.ok(main.includes('e.respawn-=dt'),'respawn preserved');
assert.ok(main.includes('world40.update(now,dt)'),'world integrations preserved');
console.log('PASS: telegraphed enemy attacks, stun/retreat/obstacle/safe-zone, respawn, parry and directional dodge');
