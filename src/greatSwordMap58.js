/** Alpha 5.8: author-supplied Mixamo-style Great Sword Pack animation manifest.
 * The original FBX animation files are preserved; the app retargets them to Rodin at runtime.
 */
export const GREAT_SWORD_MOTIONS58 = Object.freeze([
  {key:'Combo1', file:'great sword slash.fbx', duration:0.56},
  {key:'Combo2', file:'great sword slash (2).fbx', duration:0.61},
  {key:'Combo3', file:'great sword slash (3).fbx', duration:0.73},
  {key:'Block', file:'great sword blocking.fbx', duration:0.75},
  {key:'Impact', file:'great sword impact.fbx', duration:0.47},
  {key:'JumpAttack', file:'great sword jump attack.fbx', duration:0.87},
  {key:'SpinAttack', file:'great sword high spin attack.fbx', duration:1.03}
]);

/** FBXLoader may sanitize punctuation and namespace separators. */
export function canonicalBone58(name) {
  return String(name||'').split('|').pop().replace(/^mixamorig[:_]?/i,'').replace(/[^A-Za-z0-9]/g,'').toLowerCase();
}

export function greatSwordNames58(targetBoneNames, sourceBoneNames) {
  const from = new Map();
  for (const s of sourceBoneNames) {
    const key = canonicalBone58(s);
    if (key && !from.has(key)) from.set(key, s);
  }
  const aliases = {spine2:['spine2','spine1','spine'], spine1:['spine1','spine'],
    headtopend:['headtopend','head'],lefttoeend:['lefttoebase'],righttoeend:['righttoebase']};
  const names = {};
  for (const bone of targetBoneNames) {
    const key = canonicalBone58(bone);
    const match = [key,...(aliases[key]||[])].map(n=>from.get(n)).find(Boolean);
    if(match) names[bone]=match;
  }
  return names;
}


/** Alpha 5.8.2 safety profile: never let foreign sword clips rotate the
 * character's Hips, root, pelvis or legs. The game itself owns orientation,
 * motion, dodge and grounding. Only bounded upper-body deltas are imported.
 */
const UPPER_LIMITS_581 = Object.freeze({
  leftshoulder:.18,rightshoulder:.18,
  leftarm:.64,rightarm:.64,
  leftforearm:.52,rightforearm:.52,
  lefthand:.28,righthand:.28,
  spine1:.10,spine2:.14,spine:.09
});
export function safeCombatBone581(name) {
  return UPPER_LIMITS_581[canonicalBone58(name)] || null;
}

/** A short ease-out is used for attacks so animation returns to Idle/Run.
 * A blocking clip holds its last guard frame instead.
 */
export function swordEnvelope581(time,duration,hold=false) {
  const d=Number(duration);
  if(!(d>0))return 0;
  const t=Math.max(0,Math.min(d,Number(time)||0));
  const edge=Math.min(.12,d*.24);
  const enter=Math.min(1,t/Math.max(.001,edge));
  const leave=hold?1:Math.min(1,(d-t)/Math.max(.001,edge));
  return Math.max(0,Math.min(enter,leave));
}
