# Astral Rift Alpha 1.1 — Anime 3D Models

Based on the working Alpha 1.0 FIXED code. Two original low-poly stylized GLB models are included at `public/models/hero.glb` and `public/models/saruul.glb`. These are local game assets, not external downloads.

## Install
Upload all project files and the `public/models/` directory to the repository. Vercel must serve `/models/hero.glb` and `/models/saruul.glb`. Do not upload only `main.js` or the new models will not load.

## Changes
- GLTFLoader loads both character models and keeps original models as a fallback on load errors.
- Small idle movement for characters.
- Pixel ratio cap 1.4 for mobile GPU load.
- Existing quests, dungeon, boss, combat, save key, and interiors retained from Alpha 1.0 FIXED.

## Verification
`node --check src/main.js` passed; both GLB files parsed with trimesh. Full Vite build could not be run because npm registry access was unavailable in the build environment. Browser/phone rendering is not verified. Models are stylized low-poly 3D and not rigged/skinned professional anime character assets.
