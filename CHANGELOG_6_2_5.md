# Alpha 6.2.5 — Four REAL user-supplied NPC models

## Bundled (no runtime network or build-time download)
- Bold (Болд) → `public/models/npc625/blacksmith-mobile.glb` (source `blacksmith.glb`, 104.5 MB reduced to 8.84 MB; 69,112 triangles, **not rigged, no animations**).
- Nomin (Номин) → `public/models/npc625/elf-woman-mobile.glb` (from `rigged-elf-woman.zip` → `source/arrowgirl.glb`, 18 MB reduced to 5.96 MB; two skins, **no animation clips**).
- Temuulen (Тэмүүлэн) → `public/models/npc625/inquisitor-v2.glb` (3.21 MB, 24 bones, 10 animation clips including Idle and Talk).
- Saruul (Саруул) → `public/models/npc625/witch-girl.glb` (4.01 MB, 83 bones; old unsupported KHR_materials_pbrSpecularGlossiness materials converted to metallic/roughness, **no animation clips**). Existing quest, shop and interaction logic remains at same location.
- Both city guards remain `public/models/npc623/guard-captain.glb` (3.93 MB, 24 bones, 10 animation clips), already from previous version.
- Enkhee stays old NPC until a separate model is provided.
- Role mappings, GLB loading, scale/ground placement, animation clips where actually present, narrower name labels and offline build verification updated.
- Added CC BY credits inside the Settings panel and the `CREDITS_NPC_6_2_5.md` file.
- Bundled assets do not require CDN connections. If any GLB cannot load, previous Saruul/other fallback models remain where possible.

## Verification limits
- 5 bundled GLB containers, images, skeletons and animation counts verified. Smoke tests and Vite compile need separate results.
- Character proportions/orientation and in-browser WebGL animation have **not** been visually confirmed; screenshots after real-device deployment needed.
- CC BY credits are required: see `CREDITS_NPC_6_2_5.md`.

- Witch Girl geometry originally lies along negative Z; applied +90° X rotation before size/ground normalization to stand upright.
