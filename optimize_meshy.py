import struct,json,io,os
from PIL import Image
src='/mnt/data/Meshy_AI_textured_All_Animations.glb'
out='/mnt/data/astral597/public/models/meshy-warrior-mobile.glb'
with open(src,'rb') as f:
 magic,version,length=struct.unpack('<4sII',f.read(12))
 assert magic==b'glTF' and version==2
 jl,typ=struct.unpack('<II',f.read(8)); doc=json.loads(f.read(jl))
 bl,typ=struct.unpack('<II',f.read(8));binary=f.read(bl)
 assert len(binary)==bl
# Rebuild all buffer views in their original order, replacing image views with 2K equivalents.
replacements={}
for im in doc['images']:
 i=im['bufferView']; bv=doc['bufferViews'][i]
 raw=binary[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
 picture=Image.open(io.BytesIO(raw));picture.thumbnail((2048,2048),Image.Resampling.LANCZOS)
 stream=io.BytesIO()
 if im['mimeType']=='image/jpeg':picture.convert('RGB').save(stream,format='JPEG',quality=90,subsampling=0,optimize=True)
 else:picture.save(stream,format='PNG',optimize=True,compress_level=8)
 replacements[i]=stream.getvalue()
 print(im['mimeType'], 'from', len(raw),'to',len(replacements[i]),'image',picture.size)
new=bytearray()
for i,bv in enumerate(doc['bufferViews']):
 raw=replacements.get(i)
 if raw is None:raw=binary[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]
 new.extend(b'\0' * (-len(new)%4))
 bv['byteOffset']=len(new);bv['byteLength']=len(raw)
 new.extend(raw)
new.extend(b'\0' * (-len(new)%4))
doc['buffers'][0]['byteLength']=len(new)
doc.setdefault('asset',{}).setdefault('extras',{})['astralRiftMobileTexture']='4096 -> 2048 only; skinned geometry and animation preserved'
j=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf-8');j+=b' ' * (-len(j)%4)
total=12+8+len(j)+8+len(new)
with open(out,'wb') as f:
 f.write(struct.pack('<4sII',b'glTF',2,total));f.write(struct.pack('<I4s',len(j),b'JSON'));f.write(j);f.write(struct.pack('<I4s',len(new),b'BIN\x00'));f.write(new)
print('OUTPUT',out,os.stat(out).st_size)
