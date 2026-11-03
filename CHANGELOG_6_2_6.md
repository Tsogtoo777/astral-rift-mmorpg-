# Alpha 6.2.6 — NPC Placement and Size Fix

## Fixed
- Scholar & guards: the old GLB loader rejected models shorter than 0.4 units *before scaling*. Guard/Inquisitor assets use 0.01 authoring units, causing fallback cubes. Now accepts valid 0.019-unit rigs and scales them to a 1.78/1.90m target.
- Nomin: merchant elf's weapons inflate total bounding box; hide weapons and normalize only body mesh to 1.70m.
- Bold: moved 1.8 units away from original crate/counter overlapping his spawn point.
- Saruul: original Witch Girl GLB contains a -90deg X Sketchfab root transform. Create `witch-girl-upright.glb` with that scene-root transform removed; do not rotate a skinned model after loading. Validate Y-up height vs depth; if invalid, fall back to original Saruul.
- Preserve existing quest, shop, blacksmith, monster and world behaviors.

## Verification
- Node syntax and smoke, glTF world bounds of new upright Witch, exact ZIP members.
- Real-device/WebGL rendering *still needs user verification*.
