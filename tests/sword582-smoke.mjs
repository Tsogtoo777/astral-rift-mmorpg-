import assert from 'node:assert/strict';
import fs from 'node:fs';
import {effectiveStrikeRange56,strikeCheck56} from '../src/combat56.js';
import {safeCombatBone581} from '../src/greatSwordMap58.js';
const pos=(z)=>({x:0,y:0,z});
const player={position:pos(0),rotation:{y:0}};
const mob=(z,scale=1)=>({alive:true,g:{position:pos(z),scale:{x:scale}}});
assert.equal(effectiveStrikeRange56(mob(0),3,1),3,'bow must not get melee allowance');
assert.ok(effectiveStrikeRange56(mob(0),3,0)>3.4);
assert.equal(strikeCheck56(player,mob(3.38),3,0).ok,true,'blade should reach enemy body within contact margin');
assert.equal(strikeCheck56(player,mob(3.8),3,0).reason,'range','distant mobs must still be out of range');
assert.equal(strikeCheck56(player,mob(3.38),3,0,(_,z)=>z>1&&z<2).reason,'obstructed','body margin must not allow wall hits');
assert.equal(strikeCheck56(player,mob(3.38),3,1).reason,'range','bow unchanged');
for(const b of ['LeftArm','RightArm','LeftForeArm','RightForeArm','LeftShoulder','RightShoulder']){
  assert.ok(safeCombatBone581(b)<=.65,b+' excessive retarget rotation');
}
for(const b of ['Hips','LeftUpLeg','RightUpLeg','Root'])assert.equal(safeCombatBone581(b),null);
const ctl=fs.readFileSync(new URL('../src/rodin54.js',import.meta.url),'utf8');
assert.ok(ctl.includes("version:'5.8.2'"));
assert.ok(ctl.includes('sword.rotation.set(-.30-currentSwing*.09'));
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(main.includes('effectiveStrikeRange56(e,range,state.weapon)'),'onStrike and direct-hit range must agree');
assert.ok(main.includes('ALPHA 5.8.2 · COMBAT CONTROL'));
console.log('PASS 5.8.2: constrained upper arms, kept grounded locomotion, melee body margin with wall protection, bow unchanged');
