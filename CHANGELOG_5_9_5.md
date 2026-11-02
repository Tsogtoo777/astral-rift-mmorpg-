# Astral Rift Alpha 5.9.5 — Fitted Cape Visual Stabilization

## Why this exists
Actual mobile screenshots of 5.9.4 showed a detached turquoise cape and white hanging cloth. The external AI-generated teal cape has different dimensions from the original Rodin cloak, even though its skin weights are valid. Skeleton compatibility alone did not make the accessory properly fitted.

## Changes
- Stop loading/rendering the improperly fitted external `rodin-teal-cape-skinned.glb` in the default gameplay.
- Use the *original* `RodinOriginalCape594` skinned mesh already cut out in 5.9.4, maintaining exact fitted alignment and original movement.
- When `teal-cape` is equipped, use a cloned teal-colored material on that original cape. Unequip restores its original white/gray material. This is a **color variation, not a fitted replacement of the supplied custom cape geometry**.
- Keep original Rodin 27-bone skeleton and animations, katana socket, greaves, combat, NPC and town.
- Update Equipment menu note to explain this accurately.
- Add revised equipment skin smoke test for the new cape-visibility contract.

## Limitations
- Does **not** implement the user's separate AI-generated teal cape as an accurately fitted garment.
- Does not remove all white coat panels attached to Rodin's *body* mesh. The original cape is its own skinned mesh, but its neighboring coat surfaces remain part of Rodin.
- No cloth physics. Actual Vite production build or mobile WebGL visual test was not available; the source/asset/smoke tests pass.
- If `RodinOriginalCape594` is absent from the GLB, no tint is applied; a warning is issued instead.
