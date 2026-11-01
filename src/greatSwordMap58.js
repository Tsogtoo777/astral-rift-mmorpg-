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
