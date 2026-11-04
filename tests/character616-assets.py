import struct,json,numpy as np
from pathlib import Path

def glb(f):
 raw=Path(f).read_bytes();assert raw[:4]==b'glTF' and struct.unpack_from('<I',raw,8)[0]==len(raw)
 jl=struct.unpack_from('<I',raw,12)[0];j=json.loads(raw[20:20+jl]);start=20+jl;assert raw[start+4:start+8]==b'BIN\0';bin=raw[start+8:];
 assert all(v.get('byteOffset',0)+v['byteLength']<=len(bin) for v in j['bufferViews'])
 def a(i):
  ac=j['accessors'][i];v=j['bufferViews'][ac['bufferView']];n={'SCALAR':1,'VEC3':3,'VEC4':4,'VEC2':2,'MAT4':16}[ac['type']];d={5126:'<f4',5123:'<u2',5125:'<u4',5121:'u1'}[ac['componentType']];return np.frombuffer(bin,dtype=d,count=n*ac['count'],offset=v.get('byteOffset',0)+ac.get('byteOffset',0)).reshape(-1,n)
 return j,a

j,a=glb('public/models/meshy-warrior-nocape.glb');p=j['meshes'][0]['primitives'][0];tri=a(p['indices']).ravel().reshape(-1,3);pos=a(p['attributes']['POSITION']);w=a(p['attributes']['WEIGHTS_0']);ids=a(p['attributes']['JOINTS_0']);labels=[j['nodes'][k]['name'] for k in j['skins'][0]['joints']];badbones=[i for i,n in enumerate(labels) if n in ('mixamorig:RightHandMiddle3','mixamorig:LeftHandMiddle3')];assert len(badbones)==2
f=(w*np.isin(ids,badbones)).sum(1)[tri].mean(1);c=pos[tri].mean(1)
assert len(tri)==18888
assert not np.any((c[:,1]>.47)&(c[:,1]<.98)&(f>.23)&(np.abs(c[:,0])>.115)), 'Finger-driven cloth triangles remain'
assert len(j['skins'][0]['joints'])==62 and [a['name'] for a in j['animations']]==['Running','Walking']
assert j['asset']['extras']['capeCleanup616']

j,a=glb('public/monsters/forest_wolf.glb');assert len(j['skins'][0]['joints'])==27
anim={an['name']:an for an in j['animations']};assert len(anim)==7
ro=anim['Run'];wa=anim['Walk'];assert len(ro['channels'])>=28
rotations={j['nodes'][c['target']['node']]['name']:a(ro['samplers'][c['sampler']]['output']) for c in ro['channels'] if c['target']['path']=='rotation'}
assert np.max(np.abs(rotations['frontleg'][-1]-rotations['frontleg'][0])) <.001 # seamless loop
assert np.max(np.abs(rotations['frontleg']-rotations['frontleg'][0]))>.10 # not frozen
hips=[c for c in ro['channels'] if j['nodes'][c['target']['node']]['name']=='Hips' and c['target']['path']=='translation'][0]
t=a(ro['samplers'][hips['sampler']]['output']);assert np.max(np.abs(t-t[0]))<1e-8, 'wolf root motion should be removed'
print('PASS 6.1.6: 62 player bones, 18,888 triangles, finger cloth removed, 27 wolf bones, independent gallop Run, no root motion')
