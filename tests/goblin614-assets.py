import json,struct,pathlib
p=pathlib.Path('public/monsters/goblin_raider.glb')
b=p.read_bytes()
assert b[:4]==b'glTF'
version, size=struct.unpack_from('<II',b,4)
assert version==2 and size==len(b)
json_length,tag=struct.unpack_from('<I4s',b,12)
assert tag==b'JSON'
g=json.loads(b[20:20+json_length])
assert len(g['skins'])==1
assert len(g['skins'][0]['joints'])==75
names={a['name'] for a in g['animations']}
assert {'Idle','Walking','Running','Attack','Dead'}.issubset(names)
assert len(g['meshes'])>=1
for a in g['accessors']:
    assert a['count']>=0
print('PASS Goblin asset: GLB v2, 75 joints, animations Idle/Walk/Run/Attack/Dead,',round(len(b)/1e6,2),'MB')
