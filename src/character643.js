/** Alpha 6.4.3 — read-only character sheet based on current hero/equipment state. */
const safe=n=>Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
export function characterStatsHtml643({level=1,xp=0,hp=0,maxHp=100,gold=0,kills=0,bosses=0,bonuses={},sword=0,bow=0,armor=0}={}){
 const stats=[['❤️ HP',safe(hp)+' / '+safe(maxHp)],['⚔ Attack bonus','+'+safe(bonuses.attack)],['🛡 Defense bonus','+'+safe(bonuses.defense)],['⚡ Stamina bonus','+'+safe(bonuses.stamina)],['🗡 Sword rank','+'+safe(sword)],['🏹 Bow rank','+'+safe(bow)],['🥋 Armor rank','+'+safe(armor)],['🪙 Gold',safe(gold)],['☠ Boss',safe(bosses)],['⚔ Kills',safe(kills)]];
 const goal=Math.max(1,safe(level)*80),percent=Math.min(100,Math.round(safe(xp)/goal*100));
 return '<section class="ar643-sheet"><div class="ar643-level"><strong>✦ Level '+safe(level)+'</strong><span>'+safe(xp)+' / '+goal+' XP</span></div><div class="ar643-xp" role="progressbar" aria-label="Experience" aria-valuenow="'+Math.min(safe(xp),goal)+'" aria-valuemax="'+goal+'"><div style="width:'+percent+'%"></div></div><div class="ar643-stats">'+stats.map(([label,value])=>'<div><span>'+label+'</span><strong>'+value+'</strong></div>').join('')+'</div><small>Үзүүлэлтүүд одоогийн equipment болон save-ээс уншигдана. 3D хувцасны mesh өөрчлөгдөхгүй.</small></section>';
}
