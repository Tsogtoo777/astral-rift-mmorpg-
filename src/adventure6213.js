// Astral Rift Alpha 6.2.13 — quest steps, persistent stack loot, claim-once rewards.
// Inspired by NJ-MMO's event-driven quest progress / reward separation (MIT).
// Independent of THREE; real combat damage/loot remains owned by src/main.js.
export const CONTRACTS6213 = Object.freeze([
  Object.freeze({id:'forest',name:'Ойн мөр',description:'Шидэт ойн чононоос 2-ыг ял.',kind:'wolf',count:2,reward:{gold:100,xp:70,ore:1,potions:1,crystal:0}}),
  Object.freeze({id:'goblins',name:'Хуарангийн аюул',description:'Goblin-ийн хуарангаас 3 дайсан ял.',kind:'goblin',count:3,reward:{gold:180,xp:120,ore:3,potions:0,crystal:0}}),
  Object.freeze({id:'elite',name:'Ахлагчийн тэмдэг',description:'Elite Goblin эсвэл Goblin Chief-ийг 1 удаа ял.',kind:'elite-goblin',count:1,reward:{gold:300,xp:200,ore:3,potions:1,crystal:2}}),
]);
const LOOT_NAMES6213=Object.freeze({fang:'🐺 Чонын соёо',insignia:'⚔ Гоблиний тэмдэг',alloy:'⛏ Ховор төмрийн хэлтэрхий',shadow:'✧ Сүүдрийн хэлтэрхий'});
const STORAGE_KEY6213='astralRift6213-v1';
const cappedInt=(value,max=999999)=>Math.max(0,Math.min(max,Math.floor(Number(value)||0)));
function safeRead(storage,key){try{return JSON.parse(storage?.getItem(key)||'{}')||{}}catch{return {}}}
export function createAdventure6213({storage=undefined,key=STORAGE_KEY6213}={}){
  const persisted=safeRead(storage,key);
  const state={
    stage:cappedInt(persisted.stage,CONTRACTS6213.length),
    active:!!persisted.active,
    progress:cappedInt(persisted.progress,1000),
    total:cappedInt(persisted.total),
    loot:Object.fromEntries(Object.keys(LOOT_NAMES6213).map(id=>[id,cappedInt(persisted.loot?.[id])])),
  };
  if(state.stage>=CONTRACTS6213.length){state.active=false;state.progress=0;}
  const current=()=>CONTRACTS6213[state.stage]||null;
  function persist(){try{storage?.setItem(key,JSON.stringify(state));return true}catch{return false}}
  function snapshot(){return JSON.parse(JSON.stringify(state))}
  function start(){const q=current();if(!q)return {ok:false,reason:'all-complete'};if(state.active)return {ok:false,reason:'already-active'};state.active=true;state.progress=0;persist();return {ok:true,quest:q}}
  function matches(q,{kind,elite,boss}){
    if(!q||boss)return false;
    if(q.kind==='wolf')return kind==='wolf';
    if(q.kind==='goblin')return kind==='goblin';
    return q.kind==='elite-goblin'&&kind==='goblin'&&!!elite;
  }
  function onKill({kind='other',elite=false,boss=false}={}){
    if(!['wolf','goblin','other'].includes(kind))kind='other';
    // Exactly one call for each *actual* defeat, never for a strike or respawn.
    state.total=cappedInt(state.total+1);
    const drops=[];
    function add(id,n=1){state.loot[id]=cappedInt(state.loot[id]+n);drops.push({id,name:LOOT_NAMES6213[id],count:n})}
    if(kind==='wolf')add('fang');
    else if(kind==='goblin'){add('insignia');if(elite)add('alloy')}
    if(boss)add('shadow');
    // Small guaranteed potion reward, deterministic and easy to reproduce/debug.
    const potion=state.total%6===0?1:0;
    const q=current();let progressed=false;
    if(state.active&&state.progress<(q?.count??0)&&matches(q,{kind,elite,boss})){
      state.progress++;progressed=true;
    }
    persist();
    return {drops,potions:potion,progressed,ready:!!q&&state.active&&state.progress>=q.count};
  }
  function claim(){const q=current();if(!q||!state.active||state.progress<q.count)return {ok:false,reason:'not-ready'};
    const reward={...q.reward};
    state.stage++;state.active=false;state.progress=0;persist();
    return {ok:true,quest:q,reward};
  }
  function describe(){const q=current();return q?{
    done:false,quest:q,stage:state.stage+1,totalStages:CONTRACTS6213.length,
    active:state.active,progress:Math.min(state.progress,q.count),ready:state.active&&state.progress>=q.count,
  }:{done:true,stage:CONTRACTS6213.length,totalStages:CONTRACTS6213.length,active:false,progress:0,ready:false};}
  function lootHtml(){return `<h4>🎒 Анчны олз</h4>${Object.entries(LOOT_NAMES6213).map(([id,label])=>`<p>${label}: <b>${state.loot[id]}</b></p>`).join('')}<small>6 мангас тутамд ❤️ 1 эм авна. Олз хадгалагдана.</small>`}
  function summaryHtml(){const d=describe();return d.done?'<p>✅ Гэрээний 3 бүлэг бүрэн дууссан.</p>':`<p>📜 ${d.stage}/${d.totalStages}: <b>${d.quest.name}</b> — ${!d.active?'Эхлүүлээгүй':d.ready?'Шагнал авахад бэлэн':`${d.progress}/${d.quest.count}`}</p>`}
  return {start,onKill,claim,current,describe,lootHtml,summaryHtml,snapshot,persist};
}
