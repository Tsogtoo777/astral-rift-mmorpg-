# Astral Rift Alpha 5.9.4 — Original Cape Separation & Equipment Swap

## Verified technical changes
- The actual user-provided rigged Rodin GLB originally contained ONE skinned mesh with connected cloak, long coat tail, and back garment sections.
- Identified and separated 11,147 cloak/long-tail triangles from the original 35,602-triangle mesh via face-connectivity analysis. The remaining 24,455 body/armor triangles are a separate mesh.
- The new Rodin GLB has **two individually visible SkinnedMeshes** (`RodinBody594`, `RodinOriginalCape594`), both bound to the original **27 bones**.
- Preserved all five original GLB clips (`Bind`, `Idle`, `Walk`, `Run`, `Wave`), animation samplers, inverse bind matrices and materials. No new rigging or source model creation.
- `src/equipmentVisual591.js` automatically hides the original cape **only once** the user's teal cape GLB has loaded and is equipped. Unequipping restores the original. Failed asset loading leaves the original cape visible.
- Equipment changes continue to use the existing inventory, stats and save format; greaves, katana, 7 FBX sword clips, medieval town, NPCs and missions are untouched.
- UI status reporting added for a missing split-capable Rodin GLB or failed teal cape loading.

## Limitations
- The replacement teal cape retains the existing Alpha 5.9.2 skin-weight system (NOT physical cloth simulation). The new cape geometry is short and may still need fine fitting, especially when running or attacking.
- Mesh-component selection was verified in front/back geometry projections and by structural GLB checks, **not by a real Three.js WebGL render**.
- Vite production build and actual mobile device render have not been verified here because Three/Vite npm packages were not available offline.
- This patch is specifically based on the user's original 1,441,888-byte Rodin GLB. A different character GLB requires a new mesh separation.
