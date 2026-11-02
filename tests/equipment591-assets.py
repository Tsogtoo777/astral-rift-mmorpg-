"""Check actual source-preserving user-gear assets packed for Alpha 5.9.1."""
from pathlib import Path
import struct,json,hashlib
root=Path(__file__).resolve().parents[1]
path=root/'public/equipment'
files={'rodin-greaves-lite.glb':2,'rodin-teal-cape-lite.glb':1,'rodin-dark-katana.glb':1}
for filename,meshes in files.items():
 f=path/filename
 assert f.is_file() and f.stat().st_size>100_000,f
 with f.open('rb') as h:
  magic,version,length=struct.unpack('<III',h.read(12))
  assert magic==0x46546c67 and version==2 and length==f.stat().st_size
  n,kind=struct.unpack('<II',h.read(8));assert kind==0x4e4f534a
  data=json.loads(h.read(n))
 assert len(data.get('meshes',[]))==meshes
 assert len(data.get('images',[]))==3 and len(data.get('materials',[]))>=1
 assert not data.get('skins') and not data.get('animations'),'Static accessories are not skinned animations'
 triangles=sum(data['accessors'][p['indices']]['count']//3 for m in data['meshes'] for p in m['primitives'])
 assert triangles < 160_000,(filename,triangles)
 print('PASS',filename,'meshes',meshes,'triangles',triangles,'MB',round(f.stat().st_size/1e6,2),'sha256',hashlib.sha256(f.read_bytes()).hexdigest()[:12])
assert (root/'public/models/rodin-rigged.glb').is_file()
