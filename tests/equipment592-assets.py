#!/usr/bin/env python3
"""Verify vertex-weighted GLBs and source rig are glTF 2.0 compatible."""
from pathlib import Path
import json,struct
root=Path(__file__).resolve().parents[1]

def glb(p):
 b=p.read_bytes();mag,v,l=struct.unpack_from('<III',b,0)
 assert mag==0x46546c67 and v==2 and l==len(b),p
 jn,jt=struct.unpack_from('<II',b,12)
 assert jt==0x4e4f534a
 doc=json.loads(b[20:20+jn]);bn,bt=struct.unpack_from('<II',b,20+jn)
 assert bt==0x004e4942 and bn+jn+28==len(b)
 return doc,b[28+jn:]

rig,rb=glb(root/'public/models/rodin-rigged.glb')
names=[rig['nodes'][j]['name'] for j in rig['skins'][0]['joints']]
assert len(names)==27
for fname,parts in [('rodin-greaves-skinned.glb',['LeftGreave','RightGreave']),('rodin-teal-cape-skinned.glb',['TealCape'])]:
 d,b=glb(root/'public/equipment'/fname)
 assert d['extras']['rodinSkinOrder592']==names
 assert [x['name'] for x in d['meshes']]==parts
 total=0
 for mesh in d['meshes']:
  p=mesh['primitives'][0];a=p['attributes'];n=d['accessors'][a['POSITION']]['count'];total+=n
  for label in ['JOINTS_0','WEIGHTS_0']:
   acc=d['accessors'][a[label]]
   assert acc['count']==n and acc['type']=='VEC4' and acc['componentType']==5121
  assert d['accessors'][a['WEIGHTS_0']]['normalized'] is True
  for label in ['JOINTS_0','WEIGHTS_0']:
   acc=d['accessors'][a[label]];view=d['bufferViews'][acc['bufferView']];off=view.get('byteOffset',0)+acc.get('byteOffset',0)
   raw=b[off:off+n*4]
   if label=='JOINTS_0':assert all(v<len(names) for v in raw)
   else:assert all(sum(raw[i:i+4])==255 for i in range(0,len(raw),4))
 print('PASS',fname,'vertices',total,'live bones',len(names),'embedded skin attrs normalized')
assert (root/'public/equipment/rodin-dark-katana.glb').exists()
