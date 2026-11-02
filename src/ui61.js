/** Astral Rift Alpha 6.1 — optional character viewport + mobile modal UX.
 * Keeps every item ID, quest action, keyboard binding and save file compatible.
 * 3D preview shares mesh/texture GPU resources with the in-game character;
 * the separate tiny WebGL context only exists while the player asks for preview.
 */
import * as THREE from 'three';
import { clone as cloneSkinnedModel } from 'three/addons/utils/SkeletonUtils.js';

export function installAstralUI61({app,win,panel,getMeshy}) {
  let preview=null;
  let rafId=0;
  let lastFrame=0;
  let rotation=0;
  let dragging=false;
  let oldX=0;
  let activeDialog='';

  function disposePreview(){
    if(rafId)cancelAnimationFrame(rafId);
    rafId=0;dragging=false;
    if(preview){preview.renderer.dispose();preview.renderer.forceContextLoss();preview=null;}
  }
  function runPreview(){
    const mount=win.querySelector('#arViewer61');
    if(!mount || getComputedStyle(win).display==='none'){disposePreview();return;}
    if(preview)return;
    const root=getMeshy()?.root;
    if(!root){mount.textContent='3D дүр ачаалагдаж байна. Тоглоомд орсны дараа дахин дарна уу.';return;}
    let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});}catch{mount.textContent='Энэ төхөөрөмж дээр нэмэлт 3D харагдац нээгдсэнгүй';return;}
    renderer.setPixelRatio(1);
    renderer.setSize(220,270,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.25;
    renderer.domElement.setAttribute('aria-label','Meshy дүрийн 3D үзүүлбэр');
    mount.replaceChildren(renderer.domElement);
    const scene=new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xf1f6ff,0x424354,2.1));
    const fill=new THREE.DirectionalLight(0xffdbad,2.3);fill.position.set(-2,5,4);scene.add(fill);
    const rim=new THREE.DirectionalLight(0x6ecddd,1.4);rim.position.set(3,3,-2);scene.add(rim);
    const model=cloneSkinnedModel(root);
    // Keep the preview in bind/idle pose; it does not drive the in-game animation mixer.
    model.traverse(obj=>{if(obj.isSkinnedMesh)obj.frustumCulled=false;});
    const holder=new THREE.Group();holder.add(model);scene.add(holder);
    const box=new THREE.Box3().setFromObject(model);
    const size=box.getSize(new THREE.Vector3());
    if(!Number.isFinite(size.y)||size.y<=0){renderer.dispose();mount.textContent='3D дүрийг харуулах боломжгүй';return;}
    const center=box.getCenter(new THREE.Vector3());
    // Transform the holder, not skeleton/mesh internals.
    holder.position.set(-center.x,-box.min.y,-center.z);
    const camera=new THREE.PerspectiveCamera(30,220/270,.1,50);
    camera.position.set(0,size.y*.66,Math.max(3.3,size.y*1.55));
    camera.lookAt(0,size.y*.54,0);
    preview={renderer,scene,holder,camera,mount};
    rotation=0;lastFrame=0;
    const onDown=e=>{dragging=true;oldX=e.clientX;renderer.domElement.setPointerCapture?.(e.pointerId);};
    const onMove=e=>{if(!dragging)return;rotation+=(e.clientX-oldX)*.009;oldX=e.clientX;};
    const onUp=()=>{dragging=false;};
    renderer.domElement.addEventListener('pointerdown',onDown);
    renderer.domElement.addEventListener('pointermove',onMove);
    renderer.domElement.addEventListener('pointerup',onUp);
    renderer.domElement.addEventListener('pointercancel',onUp);
    function animate(t){
      if(!preview||!win.querySelector('#arViewer61')||getComputedStyle(win).display==='none'){disposePreview();return;}
      rafId=requestAnimationFrame(animate);
      if(t-lastFrame<50)return;lastFrame=t;
      if(!dragging)rotation+=.003;
      holder.rotation.y=rotation;
      try{renderer.render(scene,camera);}catch{mount.textContent='3D харагдац зогссон';disposePreview();}
    }
    rafId=requestAnimationFrame(animate);
  }

  function syncDialog(){
    const visible=getComputedStyle(win).display!=='none';
    const equipment=!!win.querySelector('.arEquipLayout61');
    if(!visible||!equipment){if(preview)disposePreview();}
    const title=win.querySelector('h2')?.textContent||'';
    const tab=equipment?'equip':/Inventory|Хэрэгсэл/.test(title)?'bag':/Skill|Чадвар/.test(title)?'skill':/Даалгавар/.test(title)?'quest':'';
    activeDialog=tab;win.querySelectorAll('[data-ar-tab]').forEach(b=>{b.classList.toggle('ar-tab-active61',b.dataset.arTab===tab);b.setAttribute('aria-current',String(b.dataset.arTab===tab));});
  }
  const observer=new MutationObserver(syncDialog);
  observer.observe(win,{childList:true,subtree:false,attributes:true,attributeFilter:['style']});
  win.addEventListener('click',e=>{
    if(e.target.closest('#arStartViewer61'))runPreview();
  });
  syncDialog();
  // Prevent a large, newly opened quick menu from remaining over the landscape.
  panel.addEventListener('click',e=>{if(e.target.closest('button')){
    panel.classList.add('collapsed23');
    const toggle=app.querySelector('#menuToggle23');
    if(toggle){toggle.textContent='☰ Бусад';toggle.setAttribute('aria-expanded','false');}
  }});
  document.addEventListener('pointerdown',e=>{
    if(panel.classList.contains('collapsed23'))return;
    if(panel.contains(e.target)||app.querySelector('#menuToggle23')?.contains(e.target))return;
    panel.classList.add('collapsed23');
    const toggle=app.querySelector('#menuToggle23');
    if(toggle){toggle.textContent='☰ Бусад';toggle.setAttribute('aria-expanded','false');}
  },{passive:true});
  // Optional preference, separate from the 6.0 settings to preserve saved values.
  const settingCard=document.querySelector('#arSettings60 .ar-settings-card60');
  if(settingCard){
    settingCard.querySelector('header small').textContent='ASTRAL RIFT • ALPHA 6.1';
    const opt=document.createElement('label');
    opt.className='ar-check-row60 ar-quest-toggle61';
    opt.innerHTML='<input type="checkbox" id="arHideQuest61"/> Даалгаврын самбарыг нуух';
    const after=settingCard.querySelector('.ar-check-row60');
    after?.insertAdjacentElement('afterend',opt);
    const box=opt.querySelector('input');
    try{box.checked=localStorage.getItem('astralRiftHideQuest61')==='1'}catch{}
    const sync=()=>{app.classList.toggle('ar-hide-quest61',box.checked);try{localStorage.setItem('astralRiftHideQuest61',box.checked?'1':'0')}catch{}};
    box.addEventListener('change',sync);sync();
    settingCard.querySelector('#arReset60')?.addEventListener('click',()=>{box.checked=false;sync()});
  }
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(getComputedStyle(win).display!=='none')win.querySelector('#closeWindowTop61')?.click();
    }
  });
  return {disposePreview};
}
