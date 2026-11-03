import json,struct,pathlib,io
from PIL import Image
models={
 'public/models/npc623/guard-captain.glb':(24,10),
 'public/models/npc625/blacksmith-mobile.glb':(0,0),
 'public/models/npc625/inquisitor-v2.glb':(24,10),
 'public/models/npc625/witch-girl.glb':(83,0),
 'public/models/npc625/elf-woman-mobile.glb':(117,0),
}
for filename,(bones,clips) in models.items():
 b=pathlib.Path(filename).read_bytes(); assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b)
 jlen=struct.unpack_from('<I',b,12)[0]; j=json.loads(b[20:20+jlen]);bin_off=20+jlen+8
 assert max([len(s['joints']) for s in j.get('skins',[])]+[0])>=bones
 assert len(j.get('animations',[]))>=clips
 assert 'KHR_materials_pbrSpecularGlossiness' not in j.get('extensionsRequired',[])
 for img in j.get('images',[]):
  assert 'bufferView' in img
  v=j['bufferViews'][img['bufferView']];data=b[bin_off+v.get('byteOffset',0):bin_off+v.get('byteOffset',0)+v['byteLength']]
  im=Image.open(io.BytesIO(data));im.verify()
  assert len(data)==v['byteLength']
 if 'npc625/blacksmith' in filename:assert b.__len__()<10_000_000
 print('NPC625 asset PASS',filename,len(b),'bones',bones,'animations',len(j.get('animations',[])))
