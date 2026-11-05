/** Deterministic loot roll, caller supplies a random value to allow repeatable tests. */
export const LOOT_TIERS67=Object.freeze(['common','uncommon','rare','epic']);
export function lootTier67(roll){const r=Math.min(.999999,Math.max(0,Number(roll)||0));return r<.65?'common':r<.9?'uncommon':r<.985?'rare':'epic';}
export function rollLoot67({roll=.5,elite=false,boss=false}={}){
 const tier=boss?'epic':elite&&roll>=.65?'rare':lootTier67(roll);
 const gold=boss?250:elite?45:10;
 return {tier,gold,materials:boss?3:elite?2:1};
}
