/** Alpha 6.5.1: deterministic melee combo, preserving existing attack release timing. */
export function createSwordCombo651({windowMs=1100}={}){
 let step=0,last=-Infinity;
 return {
  next(now,weapon=0){
   if(weapon!==0){step=0;last=-Infinity;return {step:0,multiplier:1,label:'BOW'};}
   const time=Number(now);
   if(!Number.isFinite(time))return {step:0,multiplier:1,label:'READY'};
   step=time-last<=windowMs?step%3+1:1;
   last=time;
   return {step,multiplier:[1,1.12,1.3][step-1],label:'COMBO '+step+'/3'};
  },
  reset(){step=0;last=-Infinity;},
  current(now){return Number(now)-last>windowMs?0:step;}
 };
}
