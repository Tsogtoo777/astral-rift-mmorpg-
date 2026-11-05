/** Alpha 6.4 inventory presentation. Reads existing save data; never mutates loot/equipment. */
import {EQUIPMENT_59} from './equipment59.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const materials=[['fang','🐺','Чонын соёо'],['insignia','⚔️','Goblin тэмдэг'],['alloy','⛏️','Төмрийн хэлтэрхий'],['shadow','✧','Сүүдрийн хэлтэрхий']];
export function inventoryCards64({inventory=[],loot={},owned=[],equipped={},gold=0,potions=0,ore=0,crystal=0}={}){
 const cards=[
  {id:'potion',icon:'❤️',name:'Эдгээх эм',count:potions,rarity:'common',detail:'HP +50 · Хэрэглэх боломжтой'},
  {id:'ore',icon:'⛏️',name:'Хүдэр',count:ore,rarity:'common',detail:'Дархны сайжруулалтын материал'},
  {id:'crystal',icon:'💎',name:'Кристалл',count:crystal,rarity:'rare',detail:'Ховор сайжруулалтын материал'},
  ...materials.map(([id,icon,name])=>({id,icon,name,count:loot[id]||0,rarity:id==='shadow'?'epic':id==='alloy'?'rare':'common',detail:'Crafting болон худалдааны материал'})),
  ...EQUIPMENT_59.filter(x=>owned.includes(x.id)).map(x=>({id:x.id,icon:x.icon,name:x.name,count:1,rarity:x.rarity.toLowerCase(),detail:x.desc,slot:x.slot,equipped:equipped[x.slot]===x.id})),
  ...inventory.map((name,i)=>({id:'legacy-'+i,icon:'📜',name:String(name),count:1,rarity:'common',detail:'Өмнөх хувилбараас хадгалсан эд зүйл'}))
 ];
 return cards.filter(x=>Number(x.count)>0);
}
export function inventoryHtml64(data={}){
 const cards=inventoryCards64(data);
 const tiles=cards.map((x,i)=>'<button type="button" class="ar64-item ar64-'+x.rarity+'" data-item64="'+i+'" aria-label="'+esc(x.name)+'"><span class="ar64-icon">'+esc(x.icon)+'</span><span class="ar64-count">'+x.count+'</span><span class="ar64-name">'+esc(x.name)+'</span>'+(x.equipped?'<span class="ar64-equipped">Өмссөн</span>':'')+'</button>').join('');
 return '<section class="ar64-inventory"><div class="ar64-top"><span>🪙 '+Math.max(0,Math.floor(Number(data.gold)||0))+' алт</span><span>'+cards.length+' төрөл</span></div><div class="ar64-grid">'+(tiles||'<p>Одоогоор эд зүйл алга.</p>')+'</div><div class="ar64-detail" id="ar64-detail" aria-live="polite">Эд зүйл дээр дарж дэлгэрэнгүй мэдээлэл харна уу.</div></section>';
}
export function bindInventory64(root,data={}){
 const cards=inventoryCards64(data);
 root.querySelectorAll('[data-item64]').forEach(button=>button.addEventListener('click',()=>{
  const item=cards[Number(button.dataset.item64)];if(!item)return;
  root.querySelectorAll('[data-item64]').forEach(b=>b.classList.toggle('ar64-selected',b===button));
  const detail=root.querySelector('#ar64-detail');
  if(detail)detail.innerHTML='<strong>'+esc(item.icon)+' '+esc(item.name)+'</strong><p>'+esc(item.detail)+'</p><small>Тоо: '+item.count+(item.slot?' · Slot: '+esc(item.slot):'')+(item.equipped?' · Өмссөн':'')+'</small>';
 }));
}
