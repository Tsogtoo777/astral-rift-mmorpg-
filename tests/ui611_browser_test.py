from pathlib import Path
from playwright.sync_api import sync_playwright
src=Path('/mnt/data/astral611/src/main.js').read_text()
segment=src[src.index('function showEquipment59(){'):src.index('\nfunction finishEquipment59(')]
script=r'''
let gold=100, saved=0, details=0;
const win=document.getElementById('window');
let state={weapon:'iron',head:false};
const equipment59={
 render(){return `<div class="eq59-root"><span id="current-gear">${state.weapon}</span><button data-equip59="katana">Equip</button><button data-unequip59="head">Unequip</button><button data-buy59="head">Buy</button></div>`;},
 equip(id){state.weapon=id;return true;},
 unequip(id){state.head=false;return true;},
 buy(id,budget){state.head=true;return {ok:true,price:12};},
 bonuses(){return {hp:10};}
};
function saveGame(){saved++}
function msg(t){}
function finishEquipment59(oldHp){details++}
function openWindow(title,html){win.innerHTML=`<h2>${title}</h2>`+html;win.style.display='block'}
'''+segment+'''
showEquipment59();
const mount=win.querySelector('#arViewer61');
const canvas=document.createElement('canvas');canvas.id='actual-webgl';mount.append(canvas);
mount.dataset.yaw='1.75';
win.querySelector('[data-equip59]').click();
const afterEquip=win.querySelector('#actual-webgl')===canvas && mount===win.querySelector('#arViewer61') && mount.dataset.yaw==='1.75' && state.weapon==='katana';
win.querySelector('[data-unequip59]').click();
const afterUnequip=win.querySelector('#actual-webgl')===canvas;
win.querySelector('[data-buy59]').click();
const afterBuy=win.querySelector('#actual-webgl')===canvas && gold===88 && saved===3 && details===2;
window.browserTest611={afterEquip,afterUnequip,afterBuy};
'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page()
 page.set_content('<div id="window"></div>')
 page.add_script_tag(content=script)
 result=page.evaluate('window.browserTest611')
 assert all(result.values()),result
 print('PASS browser: DOM and WebGL canvas stay intact through equip, unequip, buy:',result)
 browser.close()
