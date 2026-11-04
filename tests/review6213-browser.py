"""Integration regression: run Vite first; requires playwright + Chromium.
Uses response-only instrumentation so production exposes no debug API.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASTRAL_TEST_URL', 'http://127.0.0.1:5173')
ROOT = Path(__file__).resolve().parents[1]
PROBE = r'''
window.__review6213={
 inspect:()=>({npc:npc622.entries.map(e=>({name:e.name,height:new THREE.Box3().setFromObject(e.model).getSize(new THREE.Vector3()).y,animated:!!e.motions})),wolfSource:wolfEnemy615.visual615.source,wolfTracks:[...wolfEnemy615.visual615.clips].map(([name,c])=>({name,tracks:c.tracks.length,finite:c.tracks.every(t=>Array.from(t.values).every(Number.isFinite))})),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,forestBatches:forest622.instances.length,forestTrees:forest622.trees}),
 testLoot:()=>{
   adventure6213.start();
   const enemy=wolfEnemy615;
   state.weapon=0;player.rotation.y=0;player.position.set(-30,0,-24);enemy.g.position.set(-30,0,-23);enemy.hp=1;enemy.alive=true;state.target=enemy;
   const before=adventure6213.snapshot();hit(10000,3);const after=adventure6213.snapshot();
   const gear=createEquipment59();gear.buy('dark-katana',600);gear.equip('dark-katana');
   return {before,after,enemyAlive:enemy.alive,gear:gear.snapshot(),restored:createEquipment59(gear.snapshot()).snapshot()};
 },
 testWallSkill:()=>{
   const enemy=goblinEnemy614;
   player.position.set(8,0,-10);player.rotation.y=Math.PI;
   enemy.g.position.set(8,0,-14);enemy.hp=enemy.max;enemy.alive=true;
   state.target=enemy;state.weapon=1;state.skillCool[0]=0;mp22=100;
   const before=enemy.hp;skill(0);return {before,after:enemy.hp};
 },
 bag:showBag
};
'''
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':640,'height':360},is_mobile=True,has_touch=True)
    errors=[]; texture_errors=[]; missing=[]
    page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR:',str(e),flush=True)))
    page.on('console',lambda m:texture_errors.append(m.text) if "Couldn't load texture" in m.text else None)
    page.on('response',lambda r:missing.append([r.status,r.url]) if r.status>=400 else None)
    def main_route(route):
        response=route.fetch()
        route.fulfill(response=response,body=response.text()+'\n'+PROBE)
    page.route('**/src/main.js*',main_route)
    page.add_init_script("""for(const key of ['astral-rift-alpha03-save','astral-rift-alpha40-save','astralRift25','astralRiftUi60'])localStorage.setItem(key,'null');localStorage.setItem('astralRiftGraphics6210','smooth');""")
    page.goto(BASE+'/?worldassets=off&npcdebug=1',wait_until='domcontentloaded')
    page.wait_for_function("window.__review6213 && document.querySelector('#npc627-debug')?.textContent.split('OK').length===7 && document.querySelector('#saruul628-debug')?.textContent.includes('OK')",timeout=90000)
    page.wait_for_function("window.__review6213.inspect().wolfTracks.length===7",timeout=90000)
    page.wait_for_timeout(1500)
    metrics=page.evaluate('window.__review6213.inspect()')
    assert len(metrics['npc'])==6 and all(1.4<n['height']<2.5 for n in metrics['npc']),metrics
    assert all(c['finite'] for c in metrics['wolfTracks']),metrics
    assert metrics['forestBatches']==6
    wall=page.evaluate('window.__review6213.testWallSkill()')
    assert wall['before']==wall['after'],wall
    page.evaluate('window.__review6213.bag()')
    loot=page.evaluate('window.__review6213.testLoot()')
    assert not loot['enemyAlive']
    assert loot['after']['total']==loot['before']['total']+1,loot
    assert loot['after']['loot']['fang']==loot['before']['loot']['fang']+1,loot
    assert loot['after']['progress']==loot['before']['progress']+1,loot
    assert loot['gear']==loot['restored'],loot
    page.evaluate('window.__review6213.bag()')
    assert page.locator('#window').inner_text().find('Анчны олз')>=0
    assert not errors,errors
    assert not texture_errors,texture_errors
    assert not missing,missing
    print(json.dumps({'result':'PASS','viewport':'640x360 touch','errors':errors,'missing':missing,'metrics':metrics,'loot':loot},ensure_ascii=False,indent=2))
    browser.close()
