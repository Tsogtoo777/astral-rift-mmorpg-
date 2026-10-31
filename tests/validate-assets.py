#!/usr/bin/env python3
"""Checks the packaged authored 3D assets and unmodified original character GLBs."""
import json,os,hashlib,sys
from pathlib import Path
root=Path(__file__).resolve().parent.parent
asset=root/'public/architecture/medieval'
files=sorted(asset.glob('*.gltf'))
assert len(files)==22,f'Expected 22 glTF files, found {len(files)}'
refs=set()
for file in files:
 data=json.loads(file.read_text())
 assert data['asset']['version']=='2.0',(file,'glTF version')
 assert data.get('meshes'),(file,'no meshes')
 for entry in data.get('buffers',[]):
  uri=entry['uri'];p=asset/uri
  assert uri==os.path.basename(uri) and p.is_file(),(file,'missing buffer',uri)
  assert p.stat().st_size>=entry['byteLength'],(file,'buffer truncated')
  refs.add(uri)
 for entry in data.get('images',[]):
  uri=entry['uri'];p=asset/uri
  assert uri==os.path.basename(uri) and p.is_file(),(file,'missing image',uri)
  refs.add(uri)
assert (asset/'LICENSE_Quaternius_CC0.txt').is_file()
print('PASS: 22 glTF models, all buffers/textures present, glTF 2.0, CC0 license included')
for name in ('hero.glb','saruul.glb'):
 a=root/'public/models'/name
 original=Path('/mnt/data/ar401/public/models')/name
 assert a.read_bytes()==original.read_bytes(),f'{name} was modified'
 print('PASS: original',name,'SHA256',hashlib.sha256(a.read_bytes()).hexdigest())
