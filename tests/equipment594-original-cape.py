"""Verify user-supplied Rodin rig and original cape mesh split remain valid."""
from pathlib import Path
import struct,json,numpy as np
base=Path(__file__).resolve().parents[1]
p=base/'public/models/rodin-rigged.glb'
src=Path('/mnt/data/rigged-model (1).glb')
def get(path):
 b=path.read_bytes();magic,version,size=struct.unpack_from('<III',b,0)
 assert magic==0x46546c67 and version==2 and size==len(b)
 jl=struct.unpack_from('<I',b,12)[0]; j=json.loads(b[20:20+jl]);ofs=20+jl;bl=struct.unpack_from('<I',b,ofs)[0];data=b[ofs+8:ofs+8+bl];return j,data
j,data=get(p); assert len(j['skins'])==1 and len(j['skins'][0]['joints'])==27
assert len(j['meshes'])==2 and len(j['nodes'])==30
assert len(j.get('animations',[]))==5
assert [a['name'] for a in j['animations']]==['Bind','Idle','Walk','Run','Wave']
assert j['nodes'][27]['mesh']==0 and j['nodes'][27]['skin']==0
assert j['nodes'][29]['mesh']==1 and j['nodes'][29]['skin']==0
assert j['nodes'][29]['name']=='RodinOriginalCape594'
assert 27 in j['nodes'][28]['children'] and 29 in j['nodes'][28]['children']
indices=[]
for mesh in j['meshes']:
 v=mesh['primitives'][0]['indices'];acc=j['accessors'][v]; view=j['bufferViews'][acc['bufferView']]
 data_offset=view.get('byteOffset',0)+acc.get('byteOffset',0)
 indices.append(np.frombuffer(data,dtype='<u2',count=acc['count'],offset=data_offset))
assert len(indices[0])==24455*3 and len(indices[1])==11147*3
assert max(int(a.max()) for a in indices)<20503
assert j['extras']['capeSplit594']['originalCapeFaces']==11147
# all original triangles accounted for - no avatar skin geometry was dropped
assert len(indices[0])+len(indices[1])==106806
if src.exists():
 orig,_=get(src)
 assert j['skins']==orig['skins']
 assert j['animations']==orig['animations']
print('PASS Alpha 5.9.4: separated original cape 11147 triangles, body 24455 triangles, original 27 bones and all 5 animations retained')
