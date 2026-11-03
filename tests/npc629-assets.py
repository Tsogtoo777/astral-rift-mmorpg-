from pathlib import Path
import struct,json,hashlib
files={
 'public/models/npc625/merchant-witch-static628.glb':(0,0),
 'public/models/npc625/saruul-witch-static628.glb':(0,0),
 'public/models/npc625/inquisitor-v2.glb':(1,10),
 'public/models/npc623/guard-captain.glb':(1,10),
 'public/models/npc625/blacksmith-mobile.glb':(0,0)
}
for f,(skins,anims) in files.items():
 p=Path(f);b=p.read_bytes();assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b),f
 n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);assert len(j.get('skins',[]))>=skins,f;assert len(j.get('animations',[]))>=anims,f
 assert any(j.get('images',[])),f
 reference_sha={
  'public/models/npc623/guard-captain.glb':'cdd7a5918ec3f054e6d5288cc956f3e1c6d8f12bafa8cb1fcee45e6de12e6f5f',
  'public/models/npc625/blacksmith-mobile.glb':'2e41c5578528cac49494c523a734577644da255459d37dda1f916d3e1117f6ee',
  'public/models/npc625/inquisitor-v2.glb':'007e12ccb3ff66f7fe99c4b9051bbef054c812617fdf5e76f8d2b14c2376a341',
  'public/models/npc625/merchant-witch-static628.glb':'2b953376df5a7ca06acf023b7e191349799c39f10373b847ce7d3e8b0d60b461',
  'public/models/npc625/saruul-witch-static628.glb':'bf9758375945c8a47eff7d723f7d8370f994854d2dada3e9535b98d300562175',
 }
 assert hashlib.sha256(b).hexdigest()==reference_sha[f],f+' changed from Alpha 6.2.11 baseline'
 print('NPC629 BASELINE SHA256, VALID',f, len(b),'bytes')
print('NPC629 GLB regression/identity checks PASS')
