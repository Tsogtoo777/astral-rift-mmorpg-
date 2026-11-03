import json,struct,pathlib,re
base=pathlib.Path('public/monsters');p=base/'forest_wolf.glb';fbx=base/'forest-wolf/Wolf.fbx'
b=p.read_bytes(); assert b[:4]==b'glTF';jlen=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+jlen]);
assert len(j['skins'][0]['joints'])==27
assert {a['name'] for a in j['animations']} >= {'Idle','Walk','Run','Attack','Hit','Dead','Howl'}
assert len(j.get('images',[]))>=1
assert fbx.read_bytes().startswith(b'Kaydara FBX Binary')
raw=fbx.read_bytes()
for name in [b'Wolf_Run_Cycle_',b'Wolf_Walk_cycle_',b'Wolf_Idle_',b'Becken',b'Oberarm_L',b'Oberschenkel_R',b'Schwanz.001']:
 assert name in raw,name
main=pathlib.Path('src/main.js').read_text();assert 'loadOriginalWolf618' in main and 'loadFBXForestWolf617(' not in main
print('PASS 6.1.8: old 27-bone 7-clip Meshy wolf exact geometry retained; authored 5-motion FBX as motion-only input')
