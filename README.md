# Astral Rift Alpha 2.5 — Living Kingdom + Combat

Based on Alpha 2.4, preserving hero GLB files and character animation code.

## New in 2.5
- Open castle entrance and explorable throne room (approach the castle gate and tap ✦ Судлах; tap again near exit).
- Visible town quest board at (-4, -19): accept, defeat 5 enemies, return to claim rewards.
- Visible blue portal at (9, -21) with destinations: forest, ruins, town.
- Stamina gauge and hold-to-block control (keyboard R). Dodge consumes stamina.
- Quest-board progress stored separately in localStorage; previous save key untouched.
- Version text unified to Alpha 2.5.
- Original shops, inn, blacksmith, NPC patrols, minimap, skill, day/night and equipment preserved.

## Deploy
Unzip into GitHub repository root, preserve public/models. Vercel framework Vite, build `npm run build`, output `dist`.

## Notes
This is an incremental feature pack. Full combat overhaul, NPC pathfinding and unique 3D interiors for every building are not claimed. Test on device before replacing production.
