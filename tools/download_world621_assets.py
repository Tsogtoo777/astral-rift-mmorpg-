#!/usr/bin/env python3
"""Cache 6.2.1's CC0 GLBs for self-hosting. Run on internet-connected PC.
After completion append ?worldassets=local to test the local files.
This is optional: normal game loads the original CDN GLBs directly.
"""
import re
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SRC=(ROOT/'src/world621.js').read_text(encoding='utf-8')
ASSETS=dict(re.findall(r"^  (\w+):\{id:'(\d+)'",SRC,re.M))
out=ROOT/'public/world621'
out.mkdir(parents=True, exist_ok=True)
print(f'{len(ASSETS)} CC0 models -> {out}')
errors=[]
for key,ident in ASSETS.items():
    path=out/f'{key}.glb'
    if path.exists() and path.read_bytes()[:4]==b'glTF':
        print('✓ cached',key)
        continue
    url=f'https://cdn.3dassets.dev/assets/{ident}/v1/model.glb'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'AstralRift/6.2.1 (CC0 asset cache)'})
        with urllib.request.urlopen(req,timeout=30) as response: data=response.read(24_000_000)
        if data[:4]!=b'glTF' or len(data)<100:raise ValueError('Not a valid GLB')
        path.write_bytes(data)
        print(f'✓ {key}: {len(data)//1024} KB')
    except Exception as exc:
        errors.append(key);print('✗',key,str(exc))
if errors:raise SystemExit('Failed: '+', '.join(errors))
print('All models downloaded! Set ?worldassets=local to load from /public/world621/')
