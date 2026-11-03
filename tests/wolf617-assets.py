import os,struct
p='public/monsters/forest-wolf/Wolf.fbx'
assert os.path.isfile(p)
with open(p,'rb') as f: b=f.read()
assert b.startswith(b'Kaydara FBX Binary  \0\x1a\0')
assert struct.unpack_from('<I',b,23)[0]==7400
for clip in [b'Wolf_Idle_',b'Wolf_Walk_cycle_',b'Wolf_Run_Cycle_',b'Wolf_creep_cycle',b'Wolf_seat_']:
    assert clip in b, f'Missing FBX clip {clip}'
assert b.count(b'AnimationStack')>=5
for name in ['Wolf_Body.jpg','Wolf_Fur.jpg','Wolf_Eyes_1.jpg','Wolf_Eyes_2.jpg']:
    q='public/monsters/forest-wolf/textures/'+name
    assert os.path.getsize(q)>2000,name
assert os.path.getsize('public/monsters/forest_wolf.glb')>100_000,'Missing GLB fallback'
print('PASS 6.1.7: binary FBX 7.4, five named motions, four textures, original GLB fallback present')
