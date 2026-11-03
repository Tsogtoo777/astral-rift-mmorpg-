import json,struct,pathlib,hashlib
p=pathlib.Path('public/models/npc623/guard-captain.glb')
b=p.read_bytes()
assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b)
n=struct.unpack_from('<I',b,12)[0]; j=json.loads(b[20:20+n]);
assert len(j['skins'])==1 and len(j['skins'][0]['joints'])==24
assert len(j['animations'])==10
assert {'Idle_02','Talk_Passionately','Agree_Gesture','Formal_Bow'}.issubset(a['name'] for a in j['animations'])
assert len(j['images'])==3 and all('bufferView' in img for img in j['images'])
print(f'NPC624 asset: PASS ({len(b)} bytes; 24 bones; 10 clips; 3 embedded images; sha256 {hashlib.sha256(b).hexdigest()[:16]}...)')
