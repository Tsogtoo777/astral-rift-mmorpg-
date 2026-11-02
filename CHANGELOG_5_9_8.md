# Astral Rift Alpha 5.9.8 — Meshy Warrior ONLY

## Change requested
- Removed legacy Rodin playable character, visible avatar switch UI, and Rodin load/fallback.
- Meshy SmartRig character is the only playable avatar in all gameplay scenes.
- Kept latest game world, combat, camera, quests, shop, save progress and mobile controls.
- Retained actual supplied Running / Walking clips from the 62-joint Meshy GLB.
- Added a static Idle pose sampled from the Walking source clip. **Not** a newly imported Idle animation.
- Added restrained procedural attack, block and dodge overlays. **Not** imported sword-attack animations.
- Attached the user's purple katana GLB to the new Meshy RightHand bone.
- Updated equipment style API so the inventory still affects sword styling and stats.
- Mobile GLB retains animations and skin, with source textures downscaled to 2048 (not geometry-deleted); total model file ~5.8 MB.
- No old Rodin mesh or skinned equipment GLB remains in the FULL package. Older historic changelogs and obsolete test scripts may still mention Rodin, but are not executed.

## Known limitations
- The garment/cape is baked into a single skinned mesh, so cloak/boots equipment swaps currently change stats but not the character mesh.
- The long coat may intersect legs while running; it needs new weight painting/cloth simulation in a later update.
- User-supplied GLB includes Walking and Running only. Idle is generated; attacks are procedural approximations.
- Real Chrome/RedMagic WebGL render and Vite production build not tested in this offline runtime; script/asset checks passed.

## Install
1. For a clean install, use `Astral_Rift_Alpha_5_9_8_Meshy_Only_FULL.zip` as entire project.
2. For an existing Alpha 5.9.6 project, overwrite with the contents of the PATCH zip, then DELETE the old files:
   `public/models/rodin-rigged.glb`, `src/rodin54.js`, `src/greatSword58.js`, `src/greatSwordMap58.js`, `src/equipmentVisual591.js`, `public/equipment/rodin-*.glb`, `public/animations/great-sword/`.
3. Run npm install (if needed), npm run dev / npm run build.
4. In game, only Meshy is playable; no avatar switch button remains.
