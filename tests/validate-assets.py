#!/usr/bin/env python3
"""Checks the packaged authored 3D assets and unmodified original character GLBs."""
import json,os,hashlib,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
asset=root/'public/architecture/medieval'
files=sorted(asset.glob('*.gltf'))
assert len(files)==22,f'Expected 22 glTF files, found {len(files)}'
refs=set()
for file in files:
 data=json.loads(file.read_text())
 assert data['asset']['version']=='2.0',(file,'glTF version')
 assert data.get('meshes'),(file,'no meshes')
 for entry in data.get('buffers',[]):
  uri=entry['uri'];p=asset/uri
  assert uri==os.path.basename(uri) and p.is_file(),(file,'missing buffer',uri)
  assert p.stat().st_size>=entry['byteLength'],(file,'buffer truncated')
  refs.add(uri)
 for entry in data.get('images',[]):
  uri=entry['uri'];p=asset/uri
  assert uri==os.path.basename(uri) and p.is_file(),(file,'missing image',uri)
  refs.add(uri)
assert (asset/'LICENSE_Quaternius_CC0.txt').is_file()
print('PASS: 22 glTF models, all buffers/textures present, glTF 2.0, CC0 license included')
# Alpha 5.4: inspect actual user-rigged Rodin GLB rather than old Samurai.
import struct
for name in ('rodin-rigged.glb','saruul.glb'):
 a=root/'public/models'/name
 assert a.is_file(),f'Missing {name}'
 assert a.read_bytes()[:4]==b'glTF',f'Bad GLB: {name}'
 print('PASS: asset',name,'size',a.stat().st_size)
blob=(root/'public/models/rodin-rigged.glb').read_bytes()
assert struct.unpack_from('<I',blob,8)[0] == len(blob), 'GLB byteLength does not match'
size,typ=struct.unpack_from('<I4s',blob,12)
assert typ==b'JSON'
model=json.loads(blob[20:20+size])
assert model['asset']['version']=='2.0'
assert len(model.get('skins',[]))==1
assert len(model['skins'][0]['joints'])==27
assert {'JOINTS_0','WEIGHTS_0'} <= set(model['meshes'][0]['primitives'][0]['attributes'])
animations={a.get('name') for a in model.get('animations',[])}
assert {'Bind','Idle','Walk','Run','Wave'} <= animations,animations
print('PASS: Rodin GLB 27 bones, skin weights + original Idle/Walk/Run/Wave clips')
assert not (root/'public/models/samurai-player.glb').exists()
assert not (root/'src/samurai53.js').exists()

# Alpha 5.8: seven original Mixamo-style FBX clips are installed as animation
# sources; runtime retargeting produces Rodin-specific quaternion clips.
from pathlib import Path
fbx_dir=root/'public/animations/great-sword'
fbx_files=['great sword slash.fbx','great sword slash (2).fbx',
 'great sword slash (3).fbx','great sword blocking.fbx',
 'great sword impact.fbx','great sword jump attack.fbx',
 'great sword high spin attack.fbx']
for f in fbx_files:
 data=(fbx_dir/f).read_bytes()
 assert data.startswith(b'Kaydara FBX Binary'), f
 assert b'mixamorig:Hips' in data and b'mixamorig:RightArm' in data, f
 assert b'AnimationCurve' in data and len(data)>100_000,f
print('PASS: Great Sword Pack 7 animated FBX clips with Mixamo skeleton data')
