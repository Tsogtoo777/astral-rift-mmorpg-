# Alpha 6.2.5 — Verified checks

- `npm run test:smoke`: PASS (23 smoke tests, including NPC role mapping and Saruul quest retention). The earlier world621 offline tests intentionally exercise network fallback and print warnings.
- `npm run test:assets`: PASS (existing player, monster, captain and all four new NPC files; material references/images decoded).
- `npm run prebuild`: PASS (five local GLBs present; no network downloads).
- `node --check` for `src/main.js`, `src/npc622.js`, and `src/ui60.js`: PASS.
- Witch Girl material format converted from deprecated KHR_materials_pbrSpecularGlossiness to metallic/roughness; orientation +90° X applied in code to stand upright.
- Blacksmith 104.5 MB input optimized to 8.84 MB and elf 18 MB to 5.96 MB (texture resize / transcode; no bone/geometry editing).
- Archive SHA/CRC and exact GLB bytes verified after packaging.
- **Not tested:** Vite build (node_modules/Vite missing in this container), real browser WebGL render, gameplay FPS on RedMagic, model-facing directions, Live NPC Talk/F controls. The static checks do not establish these as working.
