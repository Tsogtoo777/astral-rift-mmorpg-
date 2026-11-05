import assert from 'node:assert/strict';
import {createAdventure6213} from '../src/adventure6213.js';
import {createEquipment59} from '../src/equipment59.js';
import {RECIPES630, craftStatus630, sellStatus630, craftingHtml630} from '../src/crafting630.js';

// Regression: Alpha 6.3 recipes must not mutate player data when unaffordable.
const values = new Map();
const storage = {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
const adventure = createAdventure6213({storage,key:'regression631'});
const equipment = createEquipment59();
const initial = adventure.snapshot();
assert.equal(adventure.spendLoot({fang:1}),false);
assert.deepEqual(adventure.snapshot(),initial);
assert.equal(adventure.spendLoot({fang:0}),false);
assert.equal(adventure.spendLoot({fang:1.5}),false);
assert.equal(adventure.spendLoot({fang:1,invalid:1}),false);
assert.deepEqual(adventure.snapshot(),initial);
assert.equal(craftStatus630('field-kit',{gold:Infinity,loot:{fang:2,insignia:1}}).ok,false);
assert.equal(craftStatus630('field-kit',{gold:-20,loot:{fang:2,insignia:1}}).ok,false);
assert.equal(craftStatus630('field-kit',{gold:20,loot:{fang:-1,insignia:1}}).ok,false);
assert.equal(sellStatus630('__proto__',{__proto__:1}).ok,false);

// Existing equipment inventory must accept crafted rewards only once.
for(const id of ['astral-amulet','dark-katana']){
 const recipe=RECIPES630.find(r=>r.product.id===id);
 assert.ok(recipe);
 assert.equal(equipment.grant(id),true);
 assert.equal(equipment.grant(id),false);
 assert.equal(craftStatus630(recipe.id,{gold:1000,loot:{fang:99,insignia:99,alloy:99,shadow:99},owned:equipment.owned}).reason,'already-owned');
 assert.equal(equipment.equip(id),true);
}
const restored=createEquipment59(equipment.snapshot());
assert.ok(restored.owned.has('dark-katana'));
assert.ok(restored.owned.has('astral-amulet'));
assert.equal(restored.get('weapon').id,'dark-katana');
assert.equal(restored.get('accessory').id,'astral-amulet');
assert.ok(restored.bonuses().attack>=12);
assert.ok(restored.bonuses().hp>=20);

// Forge actions must be disabled while away from Bold.
const html=craftingHtml630({gold:1000,loot:{fang:99,insignia:99,alloy:99,shadow:99},near:false});
assert.match(html,/data-craft630="field-kit" disabled/);
assert.match(html,/data-sell630="fang" disabled/);
console.log('PASS Alpha 6.3.1 regression: atomic loot, invalid costs, unique crafted gear, persistence, forge proximity');
