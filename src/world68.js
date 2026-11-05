import {SETTLEMENTS69} from './loreWorld69.js';
/** World guide entries; locations mirror procedural settlements. */
export const WORLD_POIS68=Object.freeze([
 {id:'town',name:'Эхлэл хот',type:'safe'},
 {id:'forge',name:'Дархны газар',type:'crafting'},
 {id:'market',name:'Худалдааны талбай',type:'shop'},
 {id:'dungeon',name:'Dungeon хаалга',type:'combat'},
 ...SETTLEMENTS69.map(p=>({id:p.id,name:p.name,type:p.kind,description:p.lore,x:p.x,z:p.z}))
]);
export function worldPoisHtml68(){
 return '<section class="ar68-world"><h3>🗺 Astral Rift — World Guide</h3>'+WORLD_POIS68.map(p=>'<article><strong>'+p.name+'</strong><small>'+p.type+(Number.isFinite(p.x)?' · X:'+p.x+' Z:'+p.z:'')+'</small>'+(p.description?'<p>'+p.description+'</p>':'')+'</article>').join('')+'</section>';
}
