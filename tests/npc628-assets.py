from pathlib import Path
import struct,json,trimesh
for file in ['merchant-witch-static628.glb','saruul-witch-static628.glb']:
 p=Path('public/models/npc625')/file;b=p.read_bytes()
 assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b)
 n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n])
 assert len(j.get('skins',[]))==0, 'Skinned meshes must be eliminated'
 assert len(j.get('animations',[]))==0
 assert len(j.get('images',[]))>=8
 s=trimesh.load(p,force='scene');x,y,z=s.extents
 assert y>1.6 and y>z*2.5,(file,s.extents)
 print('NPC628',file,'OK; skinned=0; body=',[round(i,3) for i in s.extents], 'textures=',len(j.get('images',[])))
assert Path('public/models/npc625/inquisitor-v2.glb').exists()
print('NPC628 assets PASS')
