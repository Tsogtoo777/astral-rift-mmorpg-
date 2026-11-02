from pathlib import Path
import struct, json, hashlib
root=Path(__file__).resolve().parents[1]
p=root/'public/models/meshy-warrior-mobile.glb'
def read_glb(path):
    with open(path,'rb') as f:
        magic,vers,size=struct.unpack('<4sII',f.read(12)); assert magic==b'glTF' and vers==2 and size==path.stat().st_size
        chunks={}
        while f.tell()<size:
            length,typ=struct.unpack('<I4s',f.read(8)); chunks[typ]=f.read(length)
        doc=json.loads(chunks[b'JSON']); assert len(chunks[b'BIN\x00'])==doc['buffers'][0]['byteLength']
        for bv in doc['bufferViews']:
            assert bv.get('byteOffset',0)+bv['byteLength']<=len(chunks[b'BIN\x00'])
        return doc
j=read_glb(p)
assert len(j.get('skins',[]))==1
assert len(j['skins'][0]['joints'])==62
assert {'Walking','Running'} <= {a['name'] for a in j.get('animations',[])}
names={x.get('name') for x in j['nodes']}
assert {'mixamorig:RightHand','mixamorig:LeftHand','mixamorig:RightArm','mixamorig:LeftArm'} <= names
assert len(j.get('meshes',[]))==1
assert len(j.get('images',[]))==2
assert not (root/'public/models/rodin-rigged.glb').exists()
assert (root/'public/equipment/meshy-dark-katana.glb').exists()
read_glb(root/'public/equipment/meshy-dark-katana.glb')
print('PASS Meshy 5.9.8 GLB structure, skin, clips, sword, no legacy model')
