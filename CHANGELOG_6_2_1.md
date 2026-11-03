# Astral Rift Alpha 6.2.1 — CC0 World Assets

## What changed

- Optional, actual *published* free GLB models from 3DAssets.dev are now loaded with GLTFLoader from their permanent CDN URLs. Each GLB has independent CC0 1.0 licensing.
- New village appearance: replace 8 basic placeholder houses **only after** a corresponding GLB has loaded successfully. Medieval houses, cottage, tavern, and smithy.
- Forest: 3 distinct tree species (oak, silver birch, Scots pine) + mossy boulders in deterministic, staggered positions. Old instanced cones are hidden only when sufficient replacement trees have loaded. Town outskirts use the same species.
- Goblin Camp: 3 watchtowers. Ancient Ruins: 4 stone arcade sections.
- Model fetches are deduplicated per URL, while the instances share static geometry and materials. No changes to Meshy player, wolf, goblin, quests or enemy AI.
- 6.2.1 adds `/src/world621.js` and no additional npm packages.
- `?worldassets=off` = disable model replacement; fallback geometry remains.
- `?worldassets=local` = use self-hosted GLBs after optional local download.

## Important limitations

**CDN-linked edition**: This ZIP does NOT contain the third-party binary GLBs; the website downloads them at runtime. The current execution environment could inspect asset pages/licenses but could not download the binary files. When offline or if CDN/CORS fails, the game keeps existing 6.2 placeholders. To bundle the asset binaries later, on an internet-connected PC run `python tools/download_world621_assets.py` and deploy the new `/public/world621/*.glb` files; add `?worldassets=local` to the game URL.

The third-party models are primarily **low-poly, not photorealistic**, but include more complex silhouettes than the procedural placeholder meshes. No runtime WebGL, mobile frame-rate, network success or collision testing has been performed. New scenery is visual only; physical collision needs a separate authored pass.

## Install (GitHub)

Extract PATCH onto existing Alpha 6.2. Keep existing player and monster GLBs intact. Upload all changed files while preserving paths, especially `src/world621.js`, `src/main.js`, `src/world62.js`, `package.json` and `index.html`. When Vercel deploys, title will read `ALPHA 6.2 · WORLD EXPANSION · 6.2.1 ASSETS`. A temporary overlay shows how many models/placements completed.

## Sources/licensing

See `FREE_ASSET_SOURCES_6_2_1.md`. All models listed there are 3DAssets.dev CC0 1.0 Universal. No Sketchfab CC BY assets or external Poly Haven texture downloads are embedded in this build.
