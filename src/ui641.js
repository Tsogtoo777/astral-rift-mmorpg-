/** Alpha 6.4.1 — read-only RPG UI presentations; no save or combat mutations. */
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function journalUi641({progress='Аваагүй',kills=0,bosses=0,level=1,achievements=[],summaryHtml=''}={}){
 const milestones=[['Анхны анчин',kills>=1],['10 мангас ялсан',kills>=10],['Boss ялсан',bosses>=1],['5-р түвшинд хүрсэн',level>=5]];
 return '<section class="ar641"><div class="ar641-stats"><div>⚔ Ялалт <strong>'+kills+'</strong></div><div>☠ Boss <strong>'+bosses+'</strong></div><div>✦ Level <strong>'+level+'</strong></div></div><div class="ar641-panel"><h3>📜 Саруулын даалгавар</h3><p>'+esc(progress)+'</p>'+summaryHtml+'<button id="openContractsFromJournal6213">📜 Шинэ гэрээ</button></div><div class="ar641-panel"><h3>🏆 Амжилтууд</h3><div class="ar641-achievements">'+milestones.map(([name,done])=>'<div class="'+(done?'done':'locked')+'">'+(done?'✓':'🔒')+' '+esc(name)+'</div>').join('')+'</div><small>Амжилт бүрийг анх биелүүлэхэд 40 алт өгнө.</small></div></section>';
}
export function skillUi641({names=[],levels=[],points=0,level=1}={}){
 const descriptions=['Илдний damage +4','Нумны damage +4','Max HP +12','Skill damage +6'];
 return '<section class="ar641"><div class="ar641-stats"><div>✦ Түвшин <strong>'+level+'</strong></div><div>🌟 Чөлөөт оноо <strong>'+points+'</strong></div></div><div class="ar641-skills">'+names.map((name,i)=>{const rank=Number(levels[i])||0;return '<div class="ar641-skill"><div><strong>'+esc(name)+'</strong><small>'+esc(descriptions[i]||'Ур чадвар')+'</small><div class="ar641-pips">'+Array.from({length:5},(_,n)=>'<span class="'+(n<rank?'filled':'')+'"></span>').join('')+'</div></div><button data-talent19="'+i+'" '+(points<1||rank>=5?'disabled':'')+' aria-label="'+esc(name)+' сайжруулах">+1</button></div>'}).join('')+'</div><small>Түвшин ахих бүрд 1 оноо авна. Чадварын дээд түвшин 5.</small></section>';
}
