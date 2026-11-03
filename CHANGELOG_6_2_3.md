# Astral Rift Alpha 6.2.3 — Fantasy NPC Import

- Adds `tools/download-npc623.mjs` called automatically by the Vercel/npm `prebuild` step: fetches three CC0 medieval rigged and animated character GLBs plus one female fantasy warrior licensed for game use, validates GLB magic/declared size and published checksum for Vale.
- `src/npc622.js`: updates all six town NPCs with character-specific skeleton clones, scale-to-height alignment, animation mixer idle/walk when available. Keeps their original interaction logic and the original characters as a fallback if download or load fails.
- NPC labels reduced from 2.9×0.53 to 1.85×0.35 metres and visible only within 7.5 units.
- Preserves Saruul quest NPC, hero Meshy, wolf, goblin, map, combat, city layout, saves.
- **No external GLB was downloaded during packaging** (work environment has no outbound binary internet). Models download when Vercel runs npm build. Verify `NPC623 Imported` in build logs. If blocked, original models remain in game.
- Sources, licenses, caveats: `LICENSE_NPC623.md`.
