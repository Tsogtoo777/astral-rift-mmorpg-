#!/usr/bin/env python3
"""GLB regression: the 5.9.6 Wanderer outfit preserves original Rodin rig and cape."""
import json,struct,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
raw=(ROOT/'public/models/rodin-rigged.glb').read_bytes()
assert raw[:4]==b'glTF' and struct.unpack_from('<I',raw,4)[0]==2
jlen,t=struct.unpack_from('<II',raw,12)
assert t==0x4e4f534a
obj=json.loads(raw[20:20+jlen]);assert len(obj['buffers'])==1
body=obj['meshes'][0]['primitives'][0];cape=obj['meshes'][1]['primitives'][0]
assert obj['meshes'][0]['name']=='RodinBody594'
assert obj['meshes'][1]['name']=='RodinOriginalCape594Mesh'
assert 'COLOR_0' in body['attributes'] and 'COLOR_0' not in cape['attributes']
attrs=body['attributes'];color=obj['accessors'][attrs['COLOR_0']]
assert color['type']=='VEC4' and color['componentType']==5121 and color.get('normalized')
assert color['count']==obj['accessors'][attrs['POSITION']]['count']==20503
assert all(x in attrs for x in ('NORMAL','TEXCOORD_0','JOINTS_0','WEIGHTS_0'))
assert obj['meshes'][1]['primitives'][0]['indices']==172
assert len(obj['skins'][0]['joints'])==27
assert {a['name'] for a in obj['animations']}=={'Bind','Idle','Walk','Run','Wave'}
assert len(obj['materials'])==2 and obj['materials'][body['material']]['pbrMetallicRoughness']['baseColorFactor']==[1,1,1,1]
assert obj['extras']['outfit596']['originalCapeUnchanged'] is True
# Source coloring must not be tinted by the old runtime gray material override.
js=(ROOT/'src/rodin54.js').read_text()
assert "obj.geometry.getAttribute('color')" in js
assert "if (!obj.geometry.getAttribute('color'))" in js
# Ensure file package remains a complete and valid GLB.
off=20+jlen;blen,typ=struct.unpack_from('<II',raw,off)
assert typ==0x004e4942 and len(raw)==off+8+blen
assert obj['buffers'][0]['byteLength']==blen
print('PASS 5.9.6: 20,503 body vertex colors, unchanged cape geometry, 27 bones and 5 clips')
