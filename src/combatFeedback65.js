/** Alpha 6.5 combat feedback. Pure state-to-label conversion, no damage changes. */
export function combatFeedback65({cool=0,dodge=0,skillCool=[],weapon=0,target=false}={}){
 const ready=Number(cool)<=0;
 const skillReady=skillCool.filter(x=>Number(x)<=0).length;
 return {label:Number(dodge)>0?'↪ DODGE':!ready?'⚔ RECOVER':target?'🎯 TARGET LOCK':'⚔ READY',ready,skillReady,weaponLabel:weapon?'🏹 BOW':'⚔ SWORD'};
}
export function combatFeedbackHtml65(){
 return '<div id="arCombat65" aria-live="off"><span id="arCombatWeapon65">⚔ SWORD</span><span id="arCombatState65">⚔ READY</span><span id="arCombatSkills65">3 / 3 SKILLS</span></div>';
}
