import json,struct,os
p='public/models/npc625/witch-girl-upright.glb';b=open(p,'rb').read();assert b[:4]==b'glTF';j=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]]); assert j['nodes'][0]['matrix']==[1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.,0.,0.,0.,0.,1.]
import trimesh
s=trimesh.load(p,force='scene');assert 1.6<s.extents[1]<1.9 and s.extents[1]>2*s.extents[2],s.extents
for f in ['blacksmith-mobile.glb','elf-woman-mobile.glb','inquisitor-v2.glb','witch-girl.glb']:assert os.path.isfile('public/models/npc625/'+f)
print('NPC626 asset PASS, upright Y-axis and all existing GLBs retained:',s.extents)
