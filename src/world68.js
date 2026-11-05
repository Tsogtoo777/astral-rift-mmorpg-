/** World interaction data for future 3D integration. No external assets required. */
export const WORLD_POIS68=Object.freeze([
 {id:'town',name:'Эхлэл хот',type:'safe'},
 {id:'forge',name:'Дархны газар',type:'crafting'},
 {id:'market',name:'Худалдааны талбай',type:'shop'},
 {id:'dungeon',name:'Dungeon хаалга',type:'combat'}
]);
export function worldPoisHtml68(){
 return '<section class="ar68-world"><h3>🗺 World Guide</h3>'+WORLD_POIS68.map(p=>'<article><strong>'+p.name+'</strong><small>'+p.type+'</small></article>').join('')+'</section>';
}
