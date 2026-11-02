# Astral Rift Alpha 5.2 — Animated Rodin

### Implemented
- GPU-skinned Rodin mesh: builds a 13-bone procedural rig at runtime from the ORIGINAL static GLB vertices (no model replacement).
- Independent hip, knee, feet, shoulder, elbow, head and spine animation for idle, walking, Shift+run, dodge, block and 3-stage sword attack.
- Weapon attached to the right forearm, animated by the bones; old LEGO sword stays removed.
- Attack animation triggers from the existing attack and skill calls; existing hit detection and FX unchanged.
- Display version labels and browser title updated to 5.2.
- Added pure weight-influence test on source GLB vertex positions.

### Known limitations
- The original GLB has no skeleton. Generated skin weights are approximate; some cloth/armor may deform unnaturally. This is not professionally authored retargeted animation.
- New hand blade is procedural, not a custom sword asset.
- Browser and RedMagic phone playtest still needed; npm registry is unreachable here, so full Vite build was not possible.

### GitHub
Replace `src/main.js`, `package.json`, and `index.html`; ADD new `src/rodinMotion52.js`. Keep all other assets and files untouched.
