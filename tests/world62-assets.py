from pathlib import Path
assert Path('public/monsters/goblin_raider.glb').stat().st_size>100000
assert Path('public/monsters/forest_wolf.glb').stat().st_size>100000
assert Path('public/models/meshy-warrior-nocape.glb').stat().st_size>100000
print('PASS 6.2: retained original Meshy, goblin and wolf assets')
