import assert from 'node:assert/strict';
import {findWalkPath6212,segmentBlocked6212,createEnemyNavigator6212} from '../src/pathfinding6212.js';
import {createEnemyAI57} from '../src/enemyAI57.js';

const noObstacle=()=>false;
assert.deepEqual(findWalkPath6212({x:0,z:0},{x:5,z:0},noObstacle),[{x:5,z:0}]);
assert.equal(segmentBlocked6212({x:0,z:0},{x:5,z:0},noObstacle),false);
const centralBox=(x,z)=>x>1.2&&x<3.8&&z>-1.2&&z<1.2;
const from={x:0,z:0},to={x:5,z:0};
assert.equal(segmentBlocked6212(from,to,centralBox),true);
const path=findWalkPath6212(from,to,centralBox);
assert.ok(path.length>=2,'A* should route around a blocked rectangular wall');
let prev=from;
for(const p of path){
  assert.equal(segmentBlocked6212(prev,p,centralBox),false,`illegal segment ${JSON.stringify(prev)} -> ${JSON.stringify(p)}`);
  prev=p;
}
assert.deepEqual(path.at(-1),to,'path should reach target, not stop in wall');
const sealed=(x,z)=> x>1&&x<4;
assert.deepEqual(findWalkPath6212(from,to,sealed,{maxNodes:350}),[],'unbounded wall cannot be crossed');
// No diagonal corner-cutting through two blocked cells.
const corner=(x,z)=>(x>.35&&x<1.2&&z>-.45&&z<.45)||(z>.35&&z<1.2&&x>-.45&&x<.45);
const cornerPath=findWalkPath6212({x:0,z:0},{x:2,z:2},corner,{cellSize:.7});
prev={x:0,z:0};
for(const p of cornerPath){assert.equal(segmentBlocked6212(prev,p,corner),false);prev=p;}

const nav=createEnemyNavigator6212({isBlocked:centralBox,replanSeconds:.8});
const e={alive:true,g:{position:{x:0,y:0,z:0},rotation:{y:0}},home:{x:0,y:0,z:0},hp:100,max:100,cool:0};
let wp=nav.next(e,5,0,.04);
assert.ok(wp&&wp.z!==0,'navigator steers around box');
const n=nav.stats.searches;
for(let i=0;i<8;i++)nav.next(e,5,0,.05);
assert.equal(nav.stats.searches,n,'cached route avoids search every frame');
nav.clear(e);
const events=[];
const player={position:{x:5,y:0,z:0}};
const brain=createEnemyAI57({player,isBlocked:centralBox,navigation:nav,onAttack:entity=>events.push(entity),isSafeZone:()=>false});
for(let i=0;i<160;i++)brain.update(e,.05);
assert.ok(e.g.position.x>1.2,`enemy should chase around obstacle, got ${e.g.position.x},${e.g.position.z}`);
assert.equal(centralBox(e.g.position.x,e.g.position.z),false,'enemy must never enter collider');
assert.equal(brain.phase(e)!=='windup'||Math.hypot(e.g.position.x-5,e.g.position.z)<3,true);
// Out of line-of-sight: never damage player through a wall.
const still={alive:true,g:{position:{x:0,y:0,z:0},rotation:{y:0}},home:{x:0,y:0,z:0},hp:100,max:100,cool:0};
const thinWall=(x,z)=>x>.52&&x<.92&&Math.abs(z)<2;
const strikes=[],p2={position:{x:1.45,y:0,z:0}};
const brain2=createEnemyAI57({player:p2,isBlocked:thinWall,onAttack:e=>strikes.push(e),isSafeZone:()=>false});
for(let i=0;i<40;i++)brain2.update(still,.05);
assert.equal(strikes.length,0,'no melee attack through a building');
const code=await import('node:fs/promises');
const main=await code.readFile(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('createEnemyNavigator6212'));
assert.ok(main.includes('navigation:enemyNavigation6212'));
console.log('PASS: NJ-MMO inspired A* pathfinding, safe diagonal steps, obstacle chase, line-of-sight, cached waypoints');
