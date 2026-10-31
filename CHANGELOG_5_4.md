# Astral Rift Alpha 5.4 — Rigged Rodin (October 31, 2026)

## Implemented
- New user-supplied `rigged-model (1).glb` stored unchanged as `public/models/rodin-rigged.glb` (SHA256 verified against upload).
- 27 bones, one skinned mesh, `Bind`, `Idle`, `Walk`, `Run`, `Wave` source clips verified.
- Added `src/rodin54.js`: `Idle` ⇄ `Walk` ⇄ `Run` animation cross-fade, right-hand sword, left-hand bow, procedural combat poses, GLB failure UI.
- Removed `src/samurai53.js`, `public/models/samurai-player.glb`, test modules specific to Samurai, and unused license-only Samurai directory.
- Retained city, NPCs, quests, town assets, joystick, combat, HP, inventory, camera and collision.
- Updated build version and HTML title.

## Limitations
- No authored sword combo, block or dodge animation is in the Rodin file; sword/dodge/block currently animate through small bone overlays, not real clips. Uploaded GLB may show deformation around cape / wrists / feet during gameplay.
- Game world, camera, enemy AI and network multiplayer are not substantially redesigned in this patch.
- Vite production build and device playback remain unverified because npm dependencies could not be fetched (DNS EAI_AGAIN).
