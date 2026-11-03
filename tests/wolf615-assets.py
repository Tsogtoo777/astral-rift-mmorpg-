import json,struct,pathlib
p=pathlib.Path('public/monsters/forest_wolf.glb')
d=p.read_bytes()
assert d[:4]==b'glTF'
assert struct.unpack_from('<I',d,8)[0]==len(d)
size=struct.unpack_from('<I',d,12)[0]
a=json.loads(d[20:20+size])
assert set(x.get('name') for x in a.get('animations',[]))=={'Walk','Run','Idle','Attack','Dead','Hit','Howl'}
assert len(a['skins'])==1 and len(a['skins'][0]['joints'])==27
assert len(a['meshes'])==1
assert len(d)<4_000_000
assert abs(a['nodes'][a['scenes'][0]['nodes'][0]]['scale'][0]-.01)<1e-4
print('PASS 6.1.5 wolf GLB: 27 joints, 7 animations, mobile texture, retained armature transform')
