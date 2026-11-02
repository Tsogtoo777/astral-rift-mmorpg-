// Astral Rift 6.0 HUD layer. Existing combat, movement, save data and UI handlers are untouched.
// Only DOM decoration, accessible shortcuts, modal navigation and cosmetic preferences live here.
export function installAstralUI60({ app, panel, win, openBag, openEquipment, openJournal, openSkills, openMap }) {
  const hud = app.querySelector('#hud');
  const hp = hud.querySelector('.bar');
  const exp = hud.querySelector('.expbar');
  const mp = app.querySelector('#mpHud22');
  const stamina = app.querySelector('#status25');
  const minimap = app.querySelector('#minimap');
  if (!hud || !hp || !exp || !mp || !stamina || !minimap) return () => {};

  const crest = document.createElement('div');
  crest.className = 'ar-crest60'; crest.setAttribute('aria-hidden', 'true');
  crest.innerHTML = '<span>✦</span>';
  hud.prepend(crest);
  hp.classList.add('ar-hp-track60');
  hp.insertAdjacentHTML('beforeend', '<span class="ar-track-label60">HP</span><span id="arHpValue60" class="ar-track-value60">—</span>');
  mp.classList.add('ar-mp-track60');
  mp.insertAdjacentHTML('afterbegin', '<span class="ar-track-label60">MP</span>');
  // Match the common HUD order: HP → MP → stamina → EXP.
  hud.insertBefore(mp, exp);
  hud.insertBefore(stamina, exp);
  exp.insertAdjacentHTML('beforeend', '<span class="ar-exp-name60">EXP</span><span id="arExpValue60" class="ar-exp-value60">—</span>');
  const extra = document.createElement('div');
  extra.id = 'arResources60'; extra.innerHTML = '<span id="arLevel60">LV. 1</span><span id="arWeapon60">⚔ Илд</span><span id="arGold60">◈ 0</span><span id="arPotion60">♥ 0</span>';
  hud.insertBefore(extra, hp);

  const quest = document.createElement('button');
  quest.id = 'arQuest60'; quest.type = 'button'; quest.title = 'Даалгавар / J';
  quest.innerHTML = '<span class="ar-quest-icon60">✧</span><span class="ar-quest-copy60"><b>ИДЭВХТЭЙ ДААЛГАВАР</b><span id="arQuestText60">Саруултай ярилцах</span><small id="arGuildText60"></small></span><span class="ar-quest-chevron60">›</span>';
  app.appendChild(quest);
  quest.addEventListener('click', openJournal);

  const shortcut = document.createElement('div');
  shortcut.id = 'arShortcuts60'; shortcut.setAttribute('aria-label','Хурдан цэс');
  shortcut.innerHTML = `
   <button type="button" data-ar-short="bag" title="Inventory / I" aria-label="Хэрэгсэл">▣</button>
   <button type="button" data-ar-short="quest" title="Даалгавар / J" aria-label="Даалгавар">♧</button>
   <button type="button" data-ar-short="map" title="Газрын зураг / M" aria-label="Газрын зураг">⌖</button>
   <button type="button" data-ar-short="settings" title="UI тохиргоо" aria-label="UI тохиргоо">⚙</button>`;
  app.appendChild(shortcut);
  const shortcuts = {bag:openBag,quest:openJournal,map:openMap,settings:()=>setSettingsOpen(true)};
  shortcut.addEventListener('click',e=>{const id=e.target.closest('[data-ar-short]')?.dataset.arShort; if(shortcuts[id])shortcuts[id]()});
  minimap.setAttribute('role','button'); minimap.setAttribute('tabindex','0');
  minimap.setAttribute('aria-label','Том газрын зураг нээх');
  minimap.addEventListener('click',openMap);
  minimap.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openMap()}});

  // Original panel remains fully wired (NPC, forge, map, store, skill tree, equipment).
  panel.classList.add('collapsed23');
  const menuToggle = app.querySelector('#menuToggle23');
  if (menuToggle) {menuToggle.textContent='☰ Бусад'; menuToggle.setAttribute('aria-expanded','false')}
  // Keep the original click handler authoritative; only synchronize label after it fires.
  menuToggle?.addEventListener('click',()=>{menuToggle.textContent=panel.classList.contains('collapsed23')?'☰ Бусад':'✕ Хаах'});

  for(const [id,symbol,label] of [
    ['attack','⚔','Үндсэн цохилт'],['dodge','↝','Бултах'],['switch','⇄','Зэвсэг солих'],['lock','◎','Бай түгжих']
  ]) {const el=app.querySelector('#'+id);if(el){el.textContent=symbol;el.title=label;el.setAttribute('aria-label',label)}}
  const actions=app.querySelector('#actions');if(actions)actions.setAttribute('aria-label','Тулааны удирдлага');
  const heal=app.querySelector('#quickPotion17');if(heal){heal.textContent='♥ Эм';heal.title='HP сэргээх / H';heal.setAttribute('aria-label','Эдгээх эм хэрэглэх')}

  // Current dialog rendering is preserved. The delegated navigation works after every innerHTML refresh.
  const nav=document.createElement('div');nav.id='arModalNavigation60';
  nav.innerHTML='<button type="button" data-ar-tab="bag">▣ Хэрэгсэл</button><button type="button" data-ar-tab="equip">◈ Тоноглол</button><button type="button" data-ar-tab="skill">✧ Чадвар</button><button type="button" data-ar-tab="quest">♧ Даалгавар</button>';
  const overlayWindow=()=>{
    if(win.style.display!=='none' && !win.querySelector('#arModalNavigation60')) win.prepend(nav);
  };
  // Dialog content is re-rendered from the existing code. Observe only direct content replacement.
  const observer=new MutationObserver(overlayWindow);
  observer.observe(win,{childList:true});
  overlayWindow();
  win.addEventListener('click',e=>{
    const tab=e.target.closest('[data-ar-tab]')?.dataset.arTab;
    if(!tab)return;
    ({bag:openBag,equip:openEquipment,skill:openSkills,quest:openJournal})[tab]?.();
  });
  const settings = document.createElement('div');settings.id='arSettings60';settings.setAttribute('role','dialog');settings.setAttribute('aria-modal','true');settings.setAttribute('aria-label','UI тохиргоо');
  settings.innerHTML=`<div class="ar-settings-card60"><header><div><small>ASTRAL RIFT • ALPHA 6.0</small><h2>⚙ UI тохиргоо</h2></div><button id="arSettingsClose60" type="button" aria-label="Хаах">✕</button></header>
   <label>Товчны хэмжээ <output id="arScaleValue60">100%</output><input type="range" id="arScale60" min="85" max="125" step="5" value="100"/></label>
   <label>Удирдлагын тунгалаг байдал <output id="arOpacityValue60">90%</output><input type="range" id="arOpacity60" min="45" max="100" step="5" value="90"/></label>
   <label class="ar-check-row60"><input type="checkbox" id="arCompact60"/> Бага мэдээлэлтэй HUD</label>
   <p>Эдгээр нь зөвхөн дэлгэцийн харагдах байдлыг өөрчилнө. Тулааны механик болон хадгалсан тоглолтыг өөрчлөхгүй.</p>
   <button id="arReset60" type="button">Анхны тохиргоо</button></div>`;
  document.body.appendChild(settings);
  const scaleEl=settings.querySelector('#arScale60');const opacityEl=settings.querySelector('#arOpacity60');const compactEl=settings.querySelector('#arCompact60');
  const readPrefs=()=>{try{return JSON.parse(localStorage.getItem('astralRiftUi60')||'{}')}catch{return {}}};
  let preferences={scale:100,opacity:90,compact:false,...readPrefs()};
  const apply=()=>{
    const scale=Math.min(125,Math.max(85,Number(preferences.scale)||100));
    const opacity=Math.min(100,Math.max(45,Number(preferences.opacity)||90));
    app.style.setProperty('--ar-control-scale60',String(scale/100));
    app.style.setProperty('--ar-control-opacity60',String(opacity/100));
    app.classList.toggle('ar-compact60',!!preferences.compact);
    scaleEl.value=String(scale);opacityEl.value=String(opacity);compactEl.checked=!!preferences.compact;
    settings.querySelector('#arScaleValue60').textContent=scale+'%';settings.querySelector('#arOpacityValue60').textContent=opacity+'%';
    try{localStorage.setItem('astralRiftUi60',JSON.stringify({scale,opacity,compact:!!preferences.compact}))}catch{}
  };
  const setSettingsOpen=(open)=>{settings.classList.toggle('ar-settings-open60',open);if(open)settings.querySelector('#arSettingsClose60').focus()};
  settings.querySelector('#arSettingsClose60').addEventListener('click',()=>setSettingsOpen(false));
  settings.addEventListener('click',e=>{if(e.target===settings)setSettingsOpen(false)});
  settings.querySelector('#arReset60').addEventListener('click',()=>{preferences={scale:100,opacity:90,compact:false};apply()});
  scaleEl.addEventListener('input',e=>{preferences.scale=Number(e.target.value);apply()});
  opacityEl.addEventListener('input',e=>{preferences.opacity=Number(e.target.value);apply()});
  compactEl.addEventListener('change',e=>{preferences.compact=e.target.checked;apply()});
  window.addEventListener('keydown',e=>{if(e.code==='Escape'&&settings.classList.contains('ar-settings-open60'))setSettingsOpen(false)});
  apply();
  // Avoid repainting text 60 times/second on mobile.
  let last=-Infinity,lastHud='';
  const hpValue=hud.querySelector('#arHpValue60'),expValue=hud.querySelector('#arExpValue60');
  const levelValue=hud.querySelector('#arLevel60'),weaponValue=hud.querySelector('#arWeapon60'),goldValue=hud.querySelector('#arGold60'),potionValue=hud.querySelector('#arPotion60');
  const questText=quest.querySelector('#arQuestText60'),guildText=quest.querySelector('#arGuildText60');
  return function updateAstralUI60(now, game) {
    if(now-last<140)return;last=now;
    hpValue.textContent=`${Math.max(0,Math.round(game.hp))} / ${game.maxHp}`;
    expValue.textContent=`${Math.round(game.xp)} / ${game.xpMax}`;
    levelValue.textContent=`LV. ${game.level}`;
    weaponValue.textContent=game.bow?'➶ Нум':'⚔ Илд';
    goldValue.textContent=`◈ ${game.gold}`;
    potionValue.textContent=`♥ ${game.potions}`;
    const active=!!game.target;
    hud.querySelector('#target').classList.toggle('ar-target-active60',active);
    const currentQuest=app.querySelector('#questtext')?.textContent||'Саруултай ярилцах';
    const guildQuest=app.querySelector('#quest40')?.textContent||'';
    const label=currentQuest+'|'+guildQuest;
    if(label!==lastHud){questText.textContent=currentQuest;guildText.textContent=guildQuest;lastHud=label}
  };
}
