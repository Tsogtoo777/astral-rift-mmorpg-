/**
 * Astral Rift Alpha 5.7: deterministic, telegraphed enemy combat brain.
 * No dependencies on DOM/Three; individual warning meshes are injected by caller.
 * Important: HP, quests and drops remain owned by main.js.
 */
const clamp57=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
const dist57=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);

export function createEnemyAI57({player,isBlocked,onAttack,isSafeZone=()=>false,onTelegraph=()=>{}}){
  const brains=new WeakMap();
  const stats={started:0,landed:0,cancelled:0};
  function get(enemy){
    let b=brains.get(enemy);
    if(!b){b={phase:'idle',timer:0,duration:0};brains.set(enemy,b);}
    return b;
  }
  function indicate(e,b){
    const active=b.phase==='windup'&&e.alive;
    e.windup57=active;
    onTelegraph(e,active,active?clamp57(1-b.timer/b.duration,0,1):0);
  }
  function cancel(e,b){
    if(b.phase==='windup'){stats.cancelled++;e.cool=Math.max(e.cool||0,.4);}
    b.phase='idle';b.timer=0;indicate(e,b);
  }
  function reset(e){
    const b=get(e);b.phase='idle';b.timer=0;
    e.windup57=false;onTelegraph(e,false,0);
  }
  function stepToward(e,tx,tz,speed,dt){
    const p=e.g.position,dx=tx-p.x,dz=tz-p.z,len=Math.hypot(dx,dz);
    if(len<.11)return;
    const angle=Math.atan2(dx,dz),step=Math.min(len,Math.max(0,speed)*dt);
    const candidates=[0,.56,-.56,1.12,-1.12];
    for(const side of candidates){
      const a=angle+side,nx=p.x+Math.sin(a)*step,nz=p.z+Math.cos(a)*step;
      // Check X/Z separately to allow sliding along a wall without tunneling.
      const canX=!isBlocked(nx,p.z),canZ=!isBlocked(p.x,nz);
      if(canX&&canZ){p.x=nx;p.z=nz;return;}
      if(side===0&&(canX||canZ)){
        if(canX)p.x=nx;
        if(canZ)p.z=nz;
        return;
      }
    }
  }
  function update(e,delta){
    const b=get(e),dt=clamp57(Number(delta)||0,0,.06);
    if(!e.alive){reset(e);return;}
    e.cool=Math.max(0,(e.cool||0)-dt);
    const p=e.g.position,u=player.position;
    const d=dist57(p.x,p.z,u.x,u.z),home=dist57(p.x,p.z,e.home.x,e.home.z);
    const reach=e.boss?3:1.9;
    const aggro=e.boss?13:e.elite?11:e.fast?11:9;
    const leash=e.boss?25:17;
    const protectedZone=!e.boss&&isSafeZone(e,u);
    const stunned=(e.stun56||0)>0;
    const disengaged=protectedZone||d>aggro+3||home>leash;
    if(stunned||disengaged){
      cancel(e,b);
      if(!stunned&&home>.5)stepToward(e,e.home.x,e.home.z,e.boss?1.45:1.55,dt);
      return;
    }
    if(d>.01)e.g.rotation.y=Math.atan2(u.x-p.x,u.z-p.z);
    if(b.phase==='windup'){
      if(d>reach+1.15){cancel(e,b);return;}
      b.timer=Math.max(0,b.timer-dt);
      indicate(e,b);
      if(b.timer<=0){
        b.phase='recover';
        e.cool=(e.boss&&e.hp<e.max*.5)?1.1:e.fast?1.25:e.boss?1.65:1.85;
        indicate(e,b);
        if(d<=reach+.32 && !isBlocked((p.x+u.x)/2,(p.z+u.z)/2)){
          stats.landed++;onAttack(e);
        }
      }
      return;
    }
    if(b.phase==='recover'&&e.cool>0){indicate(e,b);return;}
    b.phase='chase';
    if(d<=reach+.25 && e.cool<=0){
      b.phase='windup';
      b.duration=(e.boss&&e.hp<e.max*.5)?.48:e.fast?.47:e.elite?.70:.62;
      b.timer=b.duration;
      stats.started++;
      indicate(e,b);
      return;
    }
    if(d>reach*.85&&d<=aggro&&home<leash){
      const speed=e.boss?(e.hp<e.max*.5?1.9:1.25):e.fast?2.3:e.elite?.95:1.2;
      stepToward(e,u.x,u.z,speed,dt);
    }else if(d>aggro&&home>.5){stepToward(e,e.home.x,e.home.z,1.4,dt);}
    indicate(e,b);
  }
  function hide(e){onTelegraph(e,false,0);}
  function phase(e){return get(e).phase;}
  return {update,reset,hide,phase,stats};
}
