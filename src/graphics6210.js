/**
 * Astral Rift Alpha 6.2.10 — user-controlled render resolution.
 * Only the main game canvas is affected; CSS/UI fonts are intentionally unchanged.
 * Graphics quality is independent of HUD preferences and does not affect saves.
 */
export const GRAPHICS_PRESETS_6210 = Object.freeze({
  auto: { label: 'Автомат (санал болгох)', ratio: 1.70 },
  smooth: { label: 'Хурд / FPS', ratio: 1.00 },
  balanced: { label: 'Тэнцвэртэй', ratio: 1.40 },
  sharp: { label: 'Тод', ratio: 1.80 },
  ultra: { label: 'Маш тод', ratio: 2.20 },
});
export const GRAPHICS_KEY_6210 = 'astralRiftGraphics6210';
export const GRAPHICS_PIXEL_BUDGET_6210 = 3_400_000;
export function normalizeGraphicsMode6210(mode) {
  return Object.hasOwn(GRAPHICS_PRESETS_6210,mode) ? mode : 'auto';
}
// A pixel budget is more reliable than an unconditional high devicePixelRatio:
// very large CSS viewports do not allocate massive render targets at 2.2x.
export function renderRatio6210(target,width,height,maxPixels=GRAPHICS_PIXEL_BUDGET_6210) {
  const w=Math.max(1, Number(width)||1), h=Math.max(1, Number(height)||1);
  const budgetRatio=Math.sqrt(maxPixels/(w*h));
  return Math.max(.75, Math.min(2.2,Math.max(.75,Number(target)||1),budgetRatio));
}
export function adjustedAutoRatio6210(current,fps,stableHighSamples=0) {
  if(fps<34) return Math.max(1,Math.round((current-.15)*100)/100);
  if(fps>55&&stableHighSamples>=2) return Math.min(1.7,Math.round((current+.10)*100)/100);
  return current;
}
export function installGraphics6210({ renderer, viewport=()=>({width:window.innerWidth,height:window.innerHeight}) }) {
  const modes=GRAPHICS_PRESETS_6210;
  let mode='auto';
  try{mode=normalizeGraphicsMode6210(window.localStorage.getItem(GRAPHICS_KEY_6210));}catch{}
  let autoRatio=1.70,currentRatio=0,lastStart=0,sampleFrames=0,fps=0,goodSamples=0,lastMeasure=0;
  let ratioLabel=null, fpsLabel=null, modeSelect=null;
  function target(){return mode==='auto'?autoRatio:modes[mode].ratio;}
  function apply(force=false){
    const {width,height}=viewport();
    const ratio=renderRatio6210(target(),width,height);
    if(force||Math.abs(currentRatio-ratio)>.015){renderer.setPixelRatio(ratio);currentRatio=ratio;}
    updateLabels();
    return currentRatio;
  }
  function updateLabels(){
    if(modeSelect)modeSelect.value=mode;
    if(ratioLabel)ratioLabel.textContent=`3D ${currentRatio.toFixed(2)}× · ${Math.round(fps)||'–'} FPS`;
    if(fpsLabel)fpsLabel.textContent=mode==='auto'?'FPS буурвал нягтшлыг аажмаар тохируулна.':'Гараар сонгосон. FPS буурвал Тэнцвэртэй эсвэл Автомат сонгоорой.';
  }
  function setMode(value){
    mode=normalizeGraphicsMode6210(value);
    if(mode==='auto'){autoRatio=1.70;goodSamples=0;lastMeasure=0;}
    try{window.localStorage.setItem(GRAPHICS_KEY_6210,mode);}catch{}
    apply();
    return mode;
  }
  function mountSettings(settings=document.getElementById('arSettings60')) {
    if(!settings||settings.querySelector('#arGraphics6210'))return false;
    const section=document.createElement('div');section.id='arGraphics6210';
    section.style.cssText='border-top:1px solid #e1c5953d;padding-top:9px;margin-top:12px;';
    section.innerHTML=`<label for="arGraphicsMode6210">🎮 3D дүрсний нягтшил
      <select id="arGraphicsMode6210" style="display:block;width:100%;margin-top:8px;min-height:40px;padding:8px;border:1px solid #a5bac6;border-radius:10px;background:#22394f;color:#f9e9d0;font:600 13px system-ui">
        ${Object.entries(modes).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}
      </select></label>
      <div style="font-size:12px;color:#e9ce94;font-weight:700" id="arGraphicsStats6210" aria-live="off"></div>
      <p id="arGraphicsHint6210" style="margin:6px 0 10px">3D дүрслэлийн тодролыг өөрчилнө. UI бичиг, NPC загвар, texture-ийн чанар өөрчлөгдөхгүй.</p>`;
    const reset=settings.querySelector('#arReset60');if(reset)reset.before(section);else settings.querySelector('.ar-settings-card60')?.appendChild(section);
    modeSelect=section.querySelector('#arGraphicsMode6210');ratioLabel=section.querySelector('#arGraphicsStats6210');fpsLabel=section.querySelector('#arGraphicsHint6210');
    modeSelect.addEventListener('change',event=>setMode(event.target.value));
    reset?.addEventListener('click',()=>setMode('auto'));
    updateLabels();
    return true;
  }
  function update(now){
    if(!Number.isFinite(now))return;
    if(!lastStart){lastStart=now;lastMeasure=now;return;}
    sampleFrames++;
    const elapsed=now-lastMeasure;
    if(elapsed<4000)return;
    fps=sampleFrames*1000/elapsed;sampleFrames=0;lastMeasure=now;
    if(mode==='auto' && now-lastStart>6500){
      goodSamples=fps>55?goodSamples+1:0;
      autoRatio=adjustedAutoRatio6210(autoRatio,fps,goodSamples);
      if(goodSamples>=2)goodSamples=0;
      apply();
    } else updateLabels();
  }
  window.addEventListener('resize',()=>apply());
  apply(true);
  return {setMode,getMode:()=>mode,getRatio:()=>currentRatio,update,mountSettings,apply};
}
