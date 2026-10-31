# Astral Rift Alpha 4.2 — Medieval GLTF (playtest)

2026-10-31. Built from the existing Alpha 4.1 / Alpha 4.0 integrated source, itself based on the earlier Alpha 2.5.1 code.

## Actually changed

- Integrated **22 real authored glTF 2.0 assets** from the user-provided *Medieval Village MegaKit [Standard]* by Quaternius (CC0 1.0). Each asset's `.gltf`, `.bin`, and texture dependencies are bundled locally. Texture resolution is capped at 1024px to reduce mobile download/GPU cost. Original source license is included.
- Assembled **eight modular medieval town buildings** using textured walls, window modules, corner beams, roof tiles, door frames, dormers, chimneys, floors, signs and entry stairs.
- The old eight procedural house groups are **hidden only after the essential glTF assets have loaded successfully**. If essential assets fail, the old houses remain visible. Existing house entry coordinates and solid footprints are preserved.
- Added textured facade modules and pitched tile roofs to **guild and library halls**, keeping their center entrances walkable; roofs hide when inside the matching hall.
- Added real brick tiles to the dungeon arena and authored wagons/crates to the outskirts of town.
- Added lightweight camera-to-house AABB clipping, wagon collision, zone-based architecture visibility, four-concurrent-asset loading, and PBR material deduplication by name.
- Corrected camera obstacle filtering so hidden old house groups no longer unnecessarily obstruct the camera.
- Updated in-game version label to **ALPHA 4.2 · MEDIEVAL GLTF**.
- Repaired the previous standalone Alpha 4.0 smoke test's unresolved relative import; added a second architecture integration test and an asset dependency/GLB identity check.

## Preserved

The original `public/models/hero.glb` and `public/models/saruul.glb` are byte-for-byte identical to Alpha 4.1. The main animation/rig code, combat, skill/equipment, NPC, quest, castle, minimap, dungeon boss, mobile controls, and save systems were **not rewritten**. They remain from Alpha 2.5.1–4.1, with the existing Alpha 4.0 world integration.

## Not yet verified or not yet implemented

- A real browser/WebGL/device playtest was not possible in the isolated build environment.
- `npm install` failed due to DNS (`EAI_AGAIN` at `registry.npmjs.org`); `npm run build` cannot execute because Vite is unavailable. **No successful production build is claimed.**
- The user-supplied Standard kit is stylized; some original castle, NPC, trees, furniture and environment meshes remain procedural/low-poly. This is **not** a complete 5.0 all-assets replacement or a finished MMO.
- Exact in-game module alignment, camera edge cases, textures and performance must be inspected in a real Vercel/browser deployment.

## Tests completed

- `node --check src/main.js src/alpha40.js src/architecture42.js` (individually): pass.
- `npm run test:smoke`: pass, two mocked tests (world quest/collision/save and real-asset module integration/fallback).
- `npm run test:assets`: pass (22 glTF models and referenced local `.bin`/`.png` files, license, original GLB checksums).
- `trimesh` glTF parsing for sample wall, roof and wagon: pass.
- `npm run build`: **not completed** (`vite: not found`, because `npm install` could not access the registry).

## Deployment

Extract ZIP at the **repository root**, retaining the full `public/architecture/medieval/` folder. Use `npm install && npm run build` in a networked environment; Vercel output directory `dist`. Do not upload the ZIP as a single file into `src/`.
