/** Astral Rift Alpha 5.9 — independent equipment inventory, safe saves and stats.
 * Pure data model: no fake meshes or promises of skinned clothing assets.
 * Later GLB files can be attached to matching equipment IDs.
 */
export const EQUIPMENT_59 = Object.freeze([
  {id:'iron-longsword',slot:'weapon',name:'Iron Longsword',icon:'⚔️',rarity:'Common',price:0,attack:4,visual:'iron',desc:'Тэнцвэртэй нэг гарын илд'},
  {id:'wanderer-greatsword',slot:'weapon',name:'Wanderer Great Sword',icon:'🗡️',rarity:'Rare',price:400,attack:16,visual:'great',desc:'Хүчтэй хоёр гарын илд'},
  {id:'dark-katana',slot:'weapon',name:'Dark Katana',icon:'🌙',rarity:'Epic',price:600,attack:12,stamina:10,visual:'katana',desc:'Хурдан, хөнгөн харанхуйн катана'},
  {id:'wanderer-hood',slot:'head',name:'Wanderer Hood',icon:'🪖',rarity:'Common',price:120,defense:2,desc:'Аялагчийн малгай'},
  {id:'wanderer-coat',slot:'chest',name:'Wanderer Coat',icon:'🥋',rarity:'Rare',price:0,defense:6,hp:12,desc:'Хөнгөн ган хуяг бүхий цамц'},
  {id:'wanderer-gloves',slot:'gloves',name:'Wanderer Gloves',icon:'🧤',rarity:'Common',price:0,defense:2,desc:'Гарын хамгаалалт'},
  {id:'wanderer-pants',slot:'legs',name:'Wanderer Pants',icon:'👖',rarity:'Common',price:0,defense:2,desc:'Хөдөлгөөнд саадгүй өмд'},
  {id:'wanderer-boots',slot:'boots',name:'Wanderer Boots',icon:'🥾',rarity:'Common',price:0,defense:2,stamina:10,desc:'Хөнгөн хамгаалалттай гутал'},
  {id:'teal-cape',slot:'cloak',name:'Astral Teal Cape',icon:'🧥',rarity:'Rare',price:0,defense:2,hp:8,desc:'Салхинд элэгдсэн нөмрөг'},
  {id:'astral-amulet',slot:'accessory',name:'Astral Amulet',icon:'💎',rarity:'Epic',price:350,hp:20,stamina:15,desc:'Энерги нэмдэг сахиус'}
]);
export const SLOTS_59=Object.freeze([
  {id:'weapon',label:'Зэвсэг'}, {id:'head',label:'Толгой'},
  {id:'chest',label:'Цээж'}, {id:'gloves',label:'Бээлий'},
  {id:'legs',label:'Өмд'}, {id:'boots',label:'Гутал'},
  {id:'cloak',label:'Нөмрөг'}, {id:'accessory',label:'Сахиус'}
]);
const ITEMS=new Map(EQUIPMENT_59.map(item=>[item.id,item]));
const DEFAULT_EQUIPPED={weapon:'iron-longsword',head:null,chest:'wanderer-coat',gloves:'wanderer-gloves',legs:'wanderer-pants',boots:'wanderer-boots',cloak:'teal-cape',accessory:null};
const DEFAULT_OWNED=['iron-longsword','wanderer-coat','wanderer-gloves','wanderer-pants','wanderer-boots','teal-cape'];
export function createEquipment59(previous={}) {
  const old=previous && typeof previous==='object' ? previous : {};
  const owned=new Set(DEFAULT_OWNED);
  if(Array.isArray(old.owned))for(const id of old.owned)if(ITEMS.has(id))owned.add(id);
  const equipped={...DEFAULT_EQUIPPED};
  if(old.equipped && typeof old.equipped==='object')for(const slot of SLOTS_59){
    const id=old.equipped[slot.id];
    if(id===null){equipped[slot.id]=null;continue;}
    if(typeof id==='string'&&owned.has(id)&&ITEMS.get(id)?.slot===slot.id)equipped[slot.id]=id;
  }
  function snapshot(){return {version:1,owned:[...owned],equipped:{...equipped}};}
  function bonuses(){const totals={attack:0,defense:0,hp:0,stamina:0};for(const id of Object.values(equipped)){
    const item=ITEMS.get(id);if(!item)continue;
    for(const key of Object.keys(totals))totals[key]+=Number(item[key])||0;
  }return totals;}
  function equip(id){const item=ITEMS.get(id);if(!item||!owned.has(id))return false;equipped[item.slot]=id;return true;}
  function unequip(slot){if(slot==='weapon'||!SLOTS_59.some(s=>s.id===slot))return false;equipped[slot]=null;return true;}
  function buy(id,budget){const item=ITEMS.get(id);const price=item?.price??Infinity;
    if(!item||owned.has(id)||!Number.isFinite(budget)||budget<price)return {ok:false,price:0};
    owned.add(id);return {ok:true,price};
  }
  function get(slot){return ITEMS.get(equipped[slot])||null;}
  function render(gold=0){const b=bonuses();const fmt=(item)=>item?`<span class="eq59-name ${item.rarity.toLowerCase()}">${item.icon} ${item.name}</span>`:'<span class="eq59-empty">Хоосон</span>';
    const slots=SLOTS_59.map(s=>`<div class="eq59-slot"><span>${s.label}</span>${fmt(get(s.id))}<span>${get(s.id)&&s.id!=='weapon'?`<button type="button" data-unequip59="${s.id}" aria-label="Тайлах">Тайлах</button>`:''}</span></div>`).join('');
    const items=EQUIPMENT_59.map(item=>{const has=owned.has(item.id),active=equipped[item.slot]===item.id;
      const stats=[item.attack&&`⚔ +${item.attack}`,item.defense&&`🛡 +${item.defense}`,item.hp&&`❤️ +${item.hp}`,item.stamina&&`⚡ +${item.stamina}`].filter(Boolean).join(' · ');
      const button=active?'<span class="eq59-owned">Өмссөн</span>':has?`<button type="button" data-equip59="${item.id}">Өмсөх</button>`:`<button type="button" data-buy59="${item.id}" ${gold<item.price?'disabled':''}>${item.price} 🪙 авах</button>`;
      return `<div class="eq59-item"><div>${fmt(item)}<small>${item.desc}<br>${stats||'Гоёл'}</small></div>${button}</div>`;
    }).join('');
    return `<div class="eq59-root"><div class="eq59-summary">🪙 ${Math.max(0,Math.floor(gold))} · ⚔ +${b.attack} · 🛡 +${b.defense} · ❤️ +${b.hp} · ⚡ +${b.stamina}</div><h3>Өмссөн тоноглол</h3><div class="eq59-slots">${slots}</div><h3>Хувцас ба зэвсэг</h3><div class="eq59-items">${items}</div><p class="eq59-note">3D: Катана, хөлийн хуягийн модель ашиглана. Нөмрөг өмсөхөд Rodin-ийн анхны биедээ таарсан нөмрөг цэнхэр-ногоон өнгөтэй болно, тайлахад анхны өнгө нь буцна. Тусдаа хийсэн нөмрөгийн GLB одоогоор таарахгүй тул дүрслэхгүй. Бусад тоноглол stat-аар ажиллана.</p></div>`;
  }
  return {owned,equipped,get,snapshot,bonuses,equip,unequip,buy,render};
}
