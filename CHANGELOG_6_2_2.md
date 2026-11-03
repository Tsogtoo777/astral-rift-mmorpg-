# Astral Rift Alpha 6.2.2 — Natural Forest & Living NPCs

## Added
- `src/forest622.js`: deterministic, locally-generated three-species forest: branch/trunk meshes, individually-shaped flat leaf/needle cards, grass-colored ground texture, mobile-friendly 6 InstancedMesh draws, tree-trunk collision; no external model download is needed for these trees.
- Existing spherical/conical placeholder trees hidden when new forest is enabled, including the magic-grove cones; altar preserved.
- `src/npc622.js`: replaces four legacy citizen capsule NPCs with recolored clones of **existing** `public/models/saruul.glb` (the silhouettes are intentionally not unique new human scans); replaces two blocky guards with clones of existing `meshy-warrior-nocape.glb`.
- Different NPC interaction roles: blacksmith opens existing forging UI, merchant sells +50 HP potion for 30 gold, researcher gives exploration advice, traveler gives travel tips, guards give quest board directions.
- Same NPC dialogue on mobile NPC button, PC F and PC E when nearby; existing Saruul quest prioritized when closest; floating NPC name labels.
- Existing town, wolf, goblin, equipment, combat, save, portal and dungeon code preserved.
- `?forest=old` uses legacy tree shapes; `?worldassets=off` disables CDN medieval models but does not disable locally generated trees.

## Important limitations
- These trees are **original procedural geometry**, not downloaded photogrammetry/realistic GLB. High-detail scanned trees from Poly Haven and Polyy.AI were researched but downloads were unavailable in this runtime, so no such external assets are in the ZIP.
- Citizen appearances reuse the existing Saruul mesh with outfit color variants. Individual human character models and unique walk/talk animations are **not** included.
- Visual/WebGL, on-device FPS and interaction behavior were not runtime-verified; 20 static integration smoke scripts and asset checks passed.
- Existing 6.2.1 CDN medieval building sources remain optional. They can fail gracefully offline.
