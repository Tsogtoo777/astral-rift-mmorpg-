/** Smooth directional dodge distance independent of frame rate. */
export function createDodge57({onMove,duration=.42,distance=3.1}){
 let remaining=0,dx=0,dz=1;
 function begin(x,z){
   if(remaining>0)return false;
   const len=Math.hypot(x,z);
   if(!Number.isFinite(len)||len<.01)return false;
   dx=x/len;dz=z/len;remaining=duration;
   return true;
 }
 function update(delta){
   if(remaining<=0)return 0;
   const dt=Math.min(Math.max(0,Number(delta)||0),remaining);
   const old=1-remaining/duration,newP=1-(remaining-dt)/duration;
   const curve=t=>1-(1-t)*(1-t);
   const step=distance*(curve(newP)-curve(old));
   if(step>0)onMove(dx*step,dz*step);
   remaining=Math.max(0,remaining-dt);
   return step;
 }
 return {begin,update,get active(){return remaining>0},get remaining(){return remaining}};
}
