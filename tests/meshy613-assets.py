import struct,json
from pathlib import Path
src=Path('public/models/meshy-warrior-nocape.glb').read_bytes()
assert src[:4]==b'glTF' and struct.unpack_from('<I',src,8)[0]==len(src)
length=struct.unpack_from('<I',src,12)[0];j=json.loads(src[20:20+length]);ind=j['accessors'][j['meshes'][0]['primitives'][0]['indices']]
assert len(j['skins'][0]['joints'])==62
assert sorted(a['name'] for a in j['animations'])==['Running','Walking']
assert 18000<ind["count"]//3<20000
assert j['asset']['extras']['noCapeExperimental']
assert Path('public/models/meshy-warrior-mobile.glb').exists() # safe rollback
print('PASS 6.1.3: valid no-cape GLB, skin=62, two clips, 18.9k faces, original retained')
