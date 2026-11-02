# Astral Rift Alpha 5.9.1 — User 3D Equipment Preview

## New
- User-supplied purple katana model attaches to the existing RightHand sword mount when Dark Katana is equipped.
- User-supplied teal cape model rigidly attaches to the Spine2 back bone; toggles with cloak equipment.
- User-supplied armored greaves + boots GLB split into two static pieces, following the LeftLeg and RightLeg bones; toggles with boots equipment.
- Large source models optimized offline for mobile: boots 501,330 triangles -> 130,368 triangles total; cape 468,116 -> 78,783; katana 46,512 unchanged. Embedded JPEG textures preserved.
- Models load sequentially only when equipped; failure keeps Rodin gameplay and procedural sword intact.

## Known limitations
- Boots and cape do NOT have cloth physics or skin weights. They follow a single bone per piece, may clip or rotate unnaturally when running, and may overlap Rodin's original baked-in gray cape/boots.
- Material colors and exact orientation/scale must be evaluated in the real mobile WebGL scene; no runtime rendering was available here.
- Other equipment slots (head, chest, gloves, pants, accessory) remain stat-only until appropriate rigged models exist.
- No guarantee this optimization is artist-quality topology; original uploaded GLBs remain untouched in conversation.

## Verification
- JavaScript syntax and all unit/mock smoke tests passed, including simulated lazy load, equipment toggles, katana attachment, and two-leg mount.
- Original Rodin asset, 7 FBX clips, 22 medieval building assets and game systems kept.
- All 3 game GLBs parse as glTF 2.0 with original PBR material + embedded textures.
- npm run build was attempted but Vite is not installed in this isolated environment; real device rendering not tested.
