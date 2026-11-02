import assert from 'node:assert/strict';
import fs from 'node:fs';
import {safeCombatBone581,swordEnvelope581,canonicalBone58} from '../src/greatSwordMap58.js';

// Allow only safely limited arm, shoulder and upper-spine rotations.
for(const name of ['Hips','Root','mixamorig:Hips','LeftLeg','RightLeg','LeftUpLeg','RightUpLeg',
                   'LeftFoot','RightFoot','LeftToeBase','Head','Neck','Pelvis']) {
  assert.equal(safeCombatBone581(name),null,`full-body rotation leaked: ${name}`);
}
for(const name of ['LeftArm','RightArm','LeftForeArm','RightForeArm','LeftShoulder','RightShoulder','LeftHand','RightHand']) {
  const angle=safeCombatBone581(name);
  assert.ok(angle>0 && angle<1.1,`unsafe imported arm limit: ${name}`);
}
assert.ok(safeCombatBone581('Spine2')<=.25);
assert.equal(canonicalBone58('mixamorig:RightArm'),'rightarm');
assert.equal(swordEnvelope581(0,1),0);
assert.equal(swordEnvelope581(1,1),0);
assert.equal(swordEnvelope581(.5,1),1);
assert.equal(swordEnvelope581(1,1,true),1,'blocking must hold final guard frame');
assert.ok(swordEnvelope581(.02,1)<.4);
const loader=fs.readFileSync(new URL('../src/greatSword58.js',import.meta.url),'utf8');
assert.ok(loader.includes('safeCombatBone581(m[1])'));
assert.ok(loader.includes('AdditiveAnimationBlendMode'));
assert.ok(loader.includes("m[2]!=='quaternion'"));
assert.ok(loader.includes('swordEnvelope581('));
const ctl=fs.readFileSync(new URL('../src/rodin54.js',import.meta.url),'utf8');
assert.ok(ctl.includes('clip.blendMode===THREE.AdditiveAnimationBlendMode'));
console.log('PASS: foreign FBX pelvis/legs/root rejected, upper-body bounded, additive layering and smooth sword fade/guard hold');
