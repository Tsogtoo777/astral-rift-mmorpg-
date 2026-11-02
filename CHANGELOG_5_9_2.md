# Astral Rift Alpha 5.9.2 — Weighted Clothing Prototype

## Changes
- Replaced rigid cape/greaves bone-parenting with `THREE.SkinnedMesh` clothing.
- Transferred bind-pose vertex influences offline from the user's original 27-bone Rodin mesh to the supplied simplified 3D accessories; cape is constrained to hips/spine to avoid legs pulling the fabric, greaves to their matching legs/feet.
- Added `rodin-greaves-skinned.glb` and `rodin-teal-cape-skinned.glb` (skin indices and normalized vertex weights embedded). Rodin 3D model, original user-source GLBs, katana and original FBX clips unchanged.
- Kept sword handle attachment rigid, as expected for hard-surface gear.
- New gear shares Rodin's existing animation/skeleton and uses GPU skinning (no heavy CPU vertex deformations each frame).
- Equipment equip/unequip and cached GLB loading retained; if a processed model fails it is not shown and does not break the player.

## Limitations
- This is automatic skin-weight fitting, **not full cloth simulation**. The cape can stretch/overlap the armor during extreme poses. Pants/boots may still intersect the original mesh. No dedicated hand-authored garment rig.
- Models were fitted against the Rodin bind pose using the approximate mount transforms from 5.9.1; actual WebGL rendering and Android-device movement have NOT been verified.
- Mobile performance is unverified. New GLBs cost more disk/VRAM than the previous rigid low-detail ones.
- The prepared GLBs contain geometry and references to Rodin's skeleton order, but not a duplicate rig. Runtime module uses the existing Rodin skeleton.
