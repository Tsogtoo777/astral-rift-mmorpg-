/** Alpha 6.2.9 — deterministic NPC presentation math (no external dependencies). */
export const TALK_DURATION_629 = 3800;
export function wrapAngle629(a){ return Math.atan2(Math.sin(a),Math.cos(a)); }
export function easeAngle629(current,target,dt,speed=7){
  return current+wrapAngle629(target-current)*(1-Math.exp(-Math.max(0,dt)*speed));
}
export function facingAngle629(fromX,fromZ,toX,toZ,baseWorldYaw=0){
  return wrapAngle629(Math.atan2(toX-fromX,toZ-fromZ)-baseWorldYaw);
}
export function idlePose629(now, talking=false, phase=0){
  const t=now*.001+phase;
  return {lift:Math.sin(t*1.75)*.0045,lean:Math.sin(t*.79)*.0055,nod:talking?Math.sin(t*3.8)*.022:0};
}
export function bestClip629(clips,pattern){return (clips||[]).find(c=>pattern.test(c.name))||null;}
export function labelVisible629(distance,talking){return distance<(talking?4.7:3.6);}
