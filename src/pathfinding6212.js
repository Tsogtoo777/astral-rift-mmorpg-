/**
 * Astral Rift 6.2.12 — bounded, obstacle-aware 2D navigation.
 * Adapted from the grid A* / diagonal corner-cutting ideas in NJ-MMO
 * (MIT, copyright 2026 Waldemar Neto). See THIRD_PARTY_LICENSES_NJ.md.
 *
 * Every probe uses Astral Rift's existing collision callback: we never
 * invent another building layout or replace the player's movement rules.
 */
const DIAGONALS_6212=[
  [1,0,1],[-1,0,1],[0,1,1],[0,-1,1],
  [1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]
];
const distance6212=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const heuristic6212=(x,z,gx,gz)=>{
  const dx=Math.abs(x-gx),dz=Math.abs(z-gz);
  return Math.max(dx,dz)+(Math.SQRT2-1)*Math.min(dx,dz);
};

/** Sample a movement segment, not just its destination. */
export function segmentBlocked6212(a,b,isBlocked,spacing=.3){
  const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz);
  const samples=Math.max(1,Math.ceil(dist/Math.max(.12,spacing)));
  for(let i=1;i<=samples;i++){
    const t=i/samples;
    if(isBlocked(a.x+dx*t,a.z+dz*t))return true;
  }
  return false;
}

class SmallHeap6212{
  constructor(){this.a=[];}
  push(v){const a=this.a;let i=a.length;a.push(v);while(i>0){const p=(i-1)>>1;if(a[p].f<=v.f)break;a[i]=a[p];i=p;}a[i]=v;}
  pop(){const a=this.a;if(!a.length)return null;const top=a[0],v=a.pop();if(a.length){let i=0;while(true){const l=2*i+1,r=l+1;if(l>=a.length)break;let j=(r<a.length&&a[r].f<a[l].f)?r:l;if(a[j].f>=v.f)break;a[i]=a[j];i=j;}a[i]=v;}return top;}
  get size(){return this.a.length;}
}

/** Bounded A*. Returns waypoints in world x/z, or [] if no legal route. */
export function findWalkPath6212(start,goal,isBlocked,{cellSize=.8,maxNodes=700,margin=5}={}){
  if(!start||!goal||typeof isBlocked!=='function')return [];
  if(![start.x,start.z,goal.x,goal.z].every(Number.isFinite))return [];
  const distance=distance6212(start,goal);
  if(distance<.15)return [];
  if(!segmentBlocked6212(start,goal,isBlocked))return [{x:goal.x,z:goal.z}];
  // Keep the search local; our active enemies have a short leash.
  if(distance>28)return [];
  const step=Math.max(.45,Math.min(1.5,cellSize));
  const gx=Math.round((goal.x-start.x)/step),gz=Math.round((goal.z-start.z)/step);
  const offsetX=goal.x-start.x-gx*step,offsetZ=goal.z-start.z-gz*step;
  const marginCells=Math.ceil(Math.max(2,margin)/step);
  const minX=Math.min(0,gx)-marginCells,maxX=Math.max(0,gx)+marginCells;
  const minZ=Math.min(0,gz)-marginCells,maxZ=Math.max(0,gz)+marginCells;
  const key=(x,z)=>`${x},${z}`;
  const walkCache=new Map();
  function walkable(x,z){
    if(x<minX||x>maxX||z<minZ||z>maxZ)return false;
    if((x===0&&z===0)||(x===gx&&z===gz))return true;
    const k=key(x,z);
    if(!walkCache.has(k))walkCache.set(k,!isBlocked(start.x+x*step,start.z+z*step));
    return walkCache.get(k);
  }
  const heap=new SmallHeap6212(),nodeMap=new Map(),closed=new Set();
  const origin={x:0,z:0,g:0,f:heuristic6212(0,0,gx,gz),parent:null};
  heap.push(origin);nodeMap.set(key(0,0),origin);
  let expanded=0,found=null;
  while(heap.size&&expanded<maxNodes){
    const cur=heap.pop(),ck=key(cur.x,cur.z);
    if(closed.has(ck)||cur!==nodeMap.get(ck))continue;
    if(cur.x===gx&&cur.z===gz){found=cur;break;}
    closed.add(ck);expanded++;
    for(const [dx,dz,cost] of DIAGONALS_6212){
      const nx=cur.x+dx,nz=cur.z+dz,nk=key(nx,nz);
      if(closed.has(nk)||!walkable(nx,nz))continue;
      // A diagonal cannot squeeze through the corner of two solid props.
      if(dx&&dz&&(!walkable(cur.x+dx,cur.z)||!walkable(cur.x,cur.z+dz)))continue;
      const g=cur.g+cost;
      if(g>=(nodeMap.get(nk)?.g??Infinity))continue;
      const next={x:nx,z:nz,g,f:g+heuristic6212(nx,nz,gx,gz),parent:cur};
      nodeMap.set(nk,next);heap.push(next);
    }
  }
  if(!found)return [];
  const reversed=[];
  for(let n=found;n&&n!==origin;n=n.parent){
    reversed.push({x:start.x+n.x*step,z:start.z+n.z*step});
  }
  reversed.reverse();
  if(!reversed.length)return [];
  // Only accept the true goal if the end segment is collision-free.
  // Snapping the goal to a grid cell otherwise may route into a wall.
  const finalCell=reversed[reversed.length-1];
  const trueGoal={x:goal.x,z:goal.z};
  if(Math.hypot(offsetX,offsetZ)<.001 || !segmentBlocked6212(finalCell,trueGoal,isBlocked)){
    reversed[reversed.length-1]=trueGoal;
  }
  // Line-of-sight smoothing removes jagged 45-degree stepping.
  const route=[],points=[{x:start.x,z:start.z},...reversed];
  let i=0;
  while(i<points.length-1){
    let next=i+1;
    for(let j=points.length-1;j>next;j--){
      if(!segmentBlocked6212(points[i],points[j],isBlocked)){
        next=j;break;
      }
    }
    if(segmentBlocked6212(points[i],points[next],isBlocked))return [];
    route.push(points[next]);i=next;
  }
  return route;
}

/** Per-enemy cached navigation. Only searches when a wall blocks a straight line. */
export function createEnemyNavigator6212({isBlocked,cellSize=.8,replanSeconds=.95}={}){
  if(typeof isBlocked!=='function')throw new TypeError('isBlocked callback required');
  const states=new WeakMap();
  const stats={searches:0,routes:0,fallbacks:0};
  function clear(enemy){states.delete(enemy);}
  function next(enemy,tx,tz,dt){
    const p=enemy?.g?.position;
    if(!p||![p.x,p.z,tx,tz].every(Number.isFinite))return {x:tx,z:tz};
    let state=states.get(enemy);
    if(!state){state={route:[],index:0,goal:{x:tx,z:tz},cooldown:0};states.set(enemy,state);}
    state.cooldown=Math.max(0,state.cooldown-Math.max(0,Math.min(.06,dt||0)));
    const here={x:p.x,z:p.z},goal={x:tx,z:tz};
    if(!segmentBlocked6212(here,goal,isBlocked)){
      state.route=[];state.index=0;state.goal=goal;return goal;
    }
    const changed=distance6212(state.goal,goal)>1.4;
    // Switching between chase and home must not reuse a stale enemy route.
    if(changed){state.route=[];state.index=0;state.cooldown=0;}
    if((changed||!state.route.length||state.index>=state.route.length)&&state.cooldown<=0){
      stats.searches++;
      state.route=findWalkPath6212(here,goal,isBlocked,{cellSize});
      state.index=0;state.goal=goal;
      state.cooldown=replanSeconds;
      if(state.route.length)stats.routes++;
      else stats.fallbacks++;
    }
    while(state.index<state.route.length && distance6212(here,state.route[state.index])<.43){state.index++;}
    let waypoint=state.route[state.index];
    // A newly spawned obstacle or moving target may invalidate a cached segment.
    if(waypoint&&segmentBlocked6212(here,waypoint,isBlocked)){
      state.route=[];state.index=0;state.cooldown=Math.min(state.cooldown,.16);
      waypoint=null;
    }
    return waypoint||goal; // old wall-slide behavior remains as safe fallback
  }
  return {next,clear,blockedLine:(a,b)=>segmentBlocked6212(a,b,isBlocked),stats};
}
