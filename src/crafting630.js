/** Astral Rift 6.3: crafting recipes using existing loot and equipment. */
export const RECIPES630=Object.freeze([
  {id:'field-kit',title:'❤️ Анчны эмийн багц ×2',gold:20,loot:{fang:2,insignia:1},product:{type:'potion',count:2},detail:'HP сэргээх хоёр эм'},
  {id:'astral-amulet',title:'💎 Astral Amulet',gold:140,loot:{fang:4,insignia:2,alloy:1},product:{type:'equipment',id:'astral-amulet'},detail:'Equipment · HP +20, Stamina +15'},
  {id:'dark-katana',title:'🌙 Dark Katana',gold:240,loot:{insignia:3,alloy:2,shadow:1},product:{type:'equipment',id:'dark-katana'},detail:'Equipment · Attack +12, Stamina +10'}
]);
export const SELL_PRICES630=Object.freeze({fang:12,insignia:16,alloy:45,shadow:90});
export const LOOT_LABELS630=Object.freeze({fang:'🐺 Чонын соёо',insignia:'⚔ Goblin-ийн тэмдэг',alloy:'⛏ Төмрийн хэлтэрхий',shadow:'✧ Сүүдрийн хэлтэрхий'});
const qty=x=>Number.isSafeInteger(x)&&x>=0?x:0;
export function craftStatus630(id,{gold=0,loot={},owned=[]}={}){
 const recipe=RECIPES630.find(r=>r.id===id);
 if(!recipe)return {ok:false,reason:'unknown-recipe'};
 if(recipe.product.type==='equipment'&&(owned instanceof Set?owned.has(recipe.product.id):owned.includes?.(recipe.product.id)))return {ok:false,reason:'already-owned',recipe};
 if(qty(gold)<recipe.gold)return {ok:false,reason:'not-enough-gold',recipe};
 for(const [id,n] of Object.entries(recipe.loot))if(qty(loot[id])<n)return {ok:false,reason:'not-enough-loot',recipe};
 return {ok:true,recipe};
}
export function sellStatus630(id,loot={}){
 if(!Object.hasOwn(SELL_PRICES630,id))return {ok:false,reason:'unknown-material'};
 if(qty(loot[id])<1)return {ok:false,reason:'not-enough-loot'};
 return {ok:true,price:SELL_PRICES630[id]};
}
export function craftingHtml630({gold=0,loot={},owned=[],near=false}={}){
 const materials=Object.entries(LOOT_LABELS630).map(([id,label])=>label+' <b>'+qty(loot[id])+'</b>').join(' · ');
 const recipes=RECIPES630.map(r=>{
  const status=craftStatus630(r.id,{gold,loot,owned});
  const cost=Object.entries(r.loot).map(([id,n])=>LOOT_LABELS630[id]+' ×'+n).join(' · ');
  return '<div class="ar-craft-row"><b>'+r.title+'</b><br><small>'+r.detail+'<br>🪙 '+r.gold+' · '+cost+'</small><br><button type="button" data-craft630="'+r.id+'" '+(!near||!status.ok?'disabled':'')+'>'+(status.reason==='already-owned'?'Өмнө нь авсан':'⚒ Урлах')+'</button></div>';
 }).join('');
 const sale=Object.entries(SELL_PRICES630).map(([id,price])=>'<button type="button" data-sell630="'+id+'" '+(!near||qty(loot[id])<1?'disabled':'')+'>'+LOOT_LABELS630[id]+' −1 → '+price+' 🪙</button>').join(' ');
 return '<hr><h3>⚒ Alpha 6.3 · Урлал ба худалдаа</h3><p><small>'+materials+'</small></p><small>'+(near?'Болд дарханд урлаж, материалаа зарна.':'⚠ Урлах, зарахын тулд Болд дарханд ойртоорой.')+'</small>'+recipes+'<h4>🪙 Материал зарах</h4><div class="ar-craft-sales">'+sale+'</div>';
}
