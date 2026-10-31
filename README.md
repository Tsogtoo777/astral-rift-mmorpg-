# Astral Rift Alpha 4.0 — World Reborn (playtest build)

This is a **real source-code update** built on the provided Alpha 2.5.1. It is not a finished MMO, and does not include networking or multiplayer. It retains the existing local GLB files, rig setup, animation function and older save keys.

## Implemented in this package

- Two new **walk-in districts** (adventurers' guild and arcane library) with distinct exteriors, furniture and solid walls with open doorways; marketplace and training square.
- Improved **royal hall**: roof, front entry opening, banners, pillars, royal NPC and guards, throne steps and physical throne exclusion. Existing throne hall/teleport entry is preserved.
- **NPC interaction** for guildmaster, librarian, trainer, castle guards and royal NPC; scheduled guard patrols. Patrols follow fixed routes, **not navmesh pathfinding**.
- **Quest chain**: guildmaster → defeat three non-boss enemies → explore the ruins relic → return for 350 gold, 4 ore, 2 crystals, 250 EXP. Quest state persists under `astral-rift-alpha40-save`.
- **Large world map** (M key or menu button), POIs and player marker. Existing minimap retained.
- **Combat**: timed block parry window (R/🛡), existing stamina, skills, weapons, boss and loot preserved. Enemies check existing solid collision when chasing.
- **Dungeon visual pass**: additional columns, altar and runes, preserving the existing boss arena, entry and exit.
- **Mobile UI**: compact quest tracker, dedicated map, fewer overlapping labels, pointer-friendly buttons.
- **Performance fallback**: capped initial pixel ratio and reduces resolution/disables shadows if measured FPS is consistently low.
- **Saves**: existing `astral-rift-alpha03-save` and `astralRift25` are not reset; Alpha 4.0 quest is additive.

## Installation

1. Extract the ZIP at the repository root. Do not upload the ZIP itself to the source directory.
2. `npm install`
3. `npm run dev` for testing, `npm run build` for deployment. Vercel build: `npm run build`; output directory: `dist`.
4. Test on mobile landscape and desktop. Keyboard: WASD movement, F interact, M map, R block/parry, X weapon switch, Space dodge, 1–3 skills. Mobile: joystick and on-screen buttons.

## Verification and limitations

- Both JS source files pass `node --check`. The standalone `npm run test:smoke` passes a mocked world initialization, wall/door collision, guild quest, reward, royal NPC and map interaction. This does **not** prove real 3D browser rendering. Archive integrity is verified when packaging.
- `npm install` and Vite build could **not** be run in the isolated environment: npm registry DNS resolution failed and the dependencies are not cached. This is **not** a successful browser or device gameplay verification.
- The old 2.5.1 core is a monolithic file with multiple overlapping historical systems; integration is additive rather than a clean engine rewrite. The redundant old town meshes and guard figures are hidden, but the existing game systems and GLBs are preserved. A complete device playtest and collision walkthrough are still required.
- The game remains a single-player prototype. No real server, persistence sync, economy, matchmaking or MMO infrastructure has been added.
- GLB asset bytes and original animation logic are unchanged. New procedural NPCs do not use those GLBs.

## Priority playtest route

1. Enter the castle and verify door exit, throne stairs and camera.
2. From town, visit guildmaster at (23, 7), accept quest; defeat three enemies.
3. Go to ruins at (36, -44), interact near the glowing relic, return to guildmaster for the reward.
4. Visit library at (-23, 7), training dummy at (18, -14), and open map with M.
5. Check phone landscape joystick + attack + block at the same time; verify old save level, gold and equipment.

## Files

`src/main.js` — original systems + minimal Alpha 4.0 integration hooks.
`src/alpha40.js` — new Alpha 4.0 world, collision, NPC, quest, map, performance logic.
`src/style.css` — existing styles + responsive Alpha 4.0 overrides.
`public/models/*.glb` — **unchanged** original assets.
