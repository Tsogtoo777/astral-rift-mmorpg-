/** Astral Rift Alpha 5.6 — timed hit resolution and restrained enemy reactions.
 * Keeps the existing quest/reward/level-up hit() pipeline authoritative.
 * The attack poses remain procedural; this module does not invent mocap clips.
 */
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));

/** Body-contact margin for melee. The old code measured from enemy origin
 * to player origin (both mesh centers), making a visibly touching sword miss.
 * Bow still checks its original range with no bonus.
 */
export function effectiveStrikeRange56(enemy, range, weapon) {
  if (weapon) return range;
  const scale = Number(enemy?.g?.scale?.x);
  const normalizedScale = Number.isFinite(scale) ? clamp(scale,.85,1.35) : 1;
  return range + .42*normalizedScale;
}

/** Geometry-only strike check; ignores vertical distance for terrain variations. */
export function strikeCheck56(player, enemy, range, weapon, blocked = () => false) {
  if (!enemy?.alive || !player?.position || !enemy.g?.position) return {ok:false,reason:'no-target'};
  const a=player.position,b=enemy.g.position;
  const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz);
  if (!Number.isFinite(dist) || dist>effectiveStrikeRange56(enemy,range,weapon)+.12) return {ok:false,reason:'range'};
  if (dist>.25) {
    const facingX=Math.sin(player.rotation.y),facingZ=Math.cos(player.rotation.y);
    // The click auto-turn faces the selected enemy. Crossing behind after wind-up must miss.
    if ((facingX*dx+facingZ*dz)/dist < (weapon?.35:.20)) return {ok:false,reason:'angle'};
  }
  // Fast, discrete line-of-sight test for melee and arrows; never ray through houses.
  // Skip both character capsules; they can overlap a wall-edge without blocking an attack.
  if (dist>2) {
    const stepCount=Math.min(28,Math.floor((dist-1.4)/.65));
    for(let i=1;i<=stepCount;i++) {
      const t=(.7+i*(dist-1.4)/(stepCount+1))/dist;
      if(blocked(a.x+dx*t,a.z+dz*t))return {ok:false,reason:'obstructed'};
    }
  }
  return {ok:true,reason:'hit'};
}

export function createCombat56({player,enemies,isBlocked,onStrike,onMiss,onLaunch}) {
  let pending=null;
  let resolving=false;
  const stats={strikes:0,misses:0};
  function queue({weapon,target,damage,range}) {
    if(pending)return false;
    pending={weapon, target, damage, range, age:0, released:false,
      windup:weapon?.27:.20, travel:weapon?.20:0};
    return true;
  }
  function react(enemy,damage) {
    if(!enemy||!enemy.alive)return;
    enemy.stun56=enemy.boss?.11:enemy.elite?.17:.23;
    enemy.reaction56=.27;
    const a=player.position,b=enemy.g.position;
    const dist=Math.hypot(b.x-a.x,b.z-a.z)||1;
    enemy.pushX56=(b.x-a.x)/dist;
    enemy.pushZ56=(b.z-a.z)/dist;
    enemy.pushSpeed56=Math.min(2.4,1.1+damage/65)*(enemy.boss?.3:1);
  }
  function updateEnemy(enemy,dt) {
    if(!enemy?.alive)return;
    if(enemy.stun56>0)enemy.stun56=Math.max(0,enemy.stun56-dt);
    if(enemy.reaction56>0) {
      enemy.reaction56=Math.max(0,enemy.reaction56-dt);
      const d=enemy.pushSpeed56*dt*(enemy.reaction56/.27);
      const b=enemy.g.position,x=b.x+enemy.pushX56*d,z=b.z+enemy.pushZ56*d;
      if(!isBlocked(x,z))b.set(x,b.y,z);
      enemy.m.rotation.z=Math.sin((.27-enemy.reaction56)*18)*.16;
      enemy.m.scale.setScalar(1+Math.sin(Math.PI*enemy.reaction56/.27)*.12);
    } else {
      enemy.m.rotation.z=0;
      enemy.m.scale.setScalar(1);
    }
  }
  function update(dt,currentWeapon) {
    if(!pending)return;
    const p=pending;
    if(p.weapon!==currentWeapon){pending=null;return;}
    p.age+=clamp(dt,0,.06);
    if(!p.released && p.age>=p.windup){
      p.released=true;
      onLaunch(p.weapon,p.target);
    }
    if(p.age < p.windup+p.travel)return;
    pending=null;
    const enemy=p.target?.alive?p.target:null;
    const result=strikeCheck56(player,enemy,p.range,p.weapon,isBlocked);
    if(!result.ok){stats.misses++;onMiss(result.reason);return;}
    resolving=true;
    try{onStrike(enemy,p.damage,p.range)}finally{resolving=false;}
    stats.strikes++;
  }
  return {queue,update,react,updateEnemy,stats,get resolving(){return resolving;},get pending(){return pending;}};
}
