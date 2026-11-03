import json,struct,trimesh,os
for p in ['public/models/npc625/merchant-witch.glb','public/models/npc625/witch-girl-upright.glb','public/models/npc625/witch-girl.glb']:
 b=open(p,'rb').read();assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b)
 n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);assert len(j.get('skins',[]))>=1;assert len(j.get('images',[]))>=8
 if 'upright' in p or 'merchant' in p:
  scene=trimesh.load(p,force='scene');assert scene.extents[1]>1.4 and scene.extents[1]>scene.extents[2]*2,(p,scene.extents)
 print('VALID',p,len(b))
print('NPC627 asset PASS')
