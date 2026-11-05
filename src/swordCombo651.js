/** Alpha 6.5.2: three-hit sword combo with queue-safe commit. */
export function createSwordCombo651({windowMs=1100}={}){
 let step=0,last=-Infinity;
 function preview(now){
  const time=Number(now);
  if(!Number.isFinite(time))return {step:0,multiplier:1,label:'READY'};
  const next=time-last<=windowMs?step%3+1:1;
  return {step:next,multiplier:[1,1.12,1.3][next-1],label:'COMBO '+next+'/3'};
 }
 return {
  preview,
  commit(now){const result=preview(now);if(result.step){step=result.step;last=Number(now)}return result;},
  next(now,weapon=0){if(weapon!==0){step=0;last=-Infinity;return {step:0,multiplier:1,label:'BOW'}}return this.commit(now);},
  reset(){step=0;last=-Infinity;},
  current(now){return Number(now)-last>windowMs?0:step;}
 };
}
