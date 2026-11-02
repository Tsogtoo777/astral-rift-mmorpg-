# Astral Rift Alpha 5.9.6 — Wanderer Outfit Colors

## Actual modifications
- Recolor the **existing Rodin Body** mesh with authored, topology-based COLOR_0 vertex colors: dark navy base clothing, teal vest/tabard, ivory sleeves, silver arm/leg guards, dark gloves/boots, leather belts, restrained gold accents, and skin/hair tones.
- The original fitted cape geometry, its equip/unequip teal toggle, the 27-bone skin and all five animations are unchanged.
- `src/rodin54.js` now preserves glTF vertex-color materials rather than tinting the outfit gray at runtime. Legacy uncolored GLBs still use the previous fallback material.
- Update visible version title to 5.9.6. No equipment stats, combat, city, or save-format changes.

## Installation (from 5.9.5)
Required for visible change: `public/models/rodin-rigged.glb` and `src/rodin54.js`.
To update the version label, also replace `src/main.js` (and optionally `index.html`, `package.json`).
No new gear files, skin or FBX uploads required.

## Limitations
- This is a **colored 3D asset**, not a newly modeled full clothing set or PBR texture set. Topology-based coloring is purposefully stylized.
- The separately AI-generated teal cape is still not worn; original fitted cape recolor is retained.
- Asset was preview-rendered offscreen using the actual geometry and palette. Final phone WebGL/animation rendering and production build were not verified here.
