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
 old=Path('/mnt/data/astral628')/f
 assert old.exists() and hashlib.sha256(b).digest()==hashlib.sha256(old.read_bytes()).digest(),f+' changed'
 print('NPC629 SAME SHA256, VALID',f, len(b),'bytes')
print('NPC629 GLB regression/identity checks PASS')
