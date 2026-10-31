# Astral Rift Alpha 5.1.2 — Rodin Only

## Code changes
- The player never loads `hero.glb`; its older asynchronous loader was removed.
- Procedural LEGO player meshes are removed from the live `player` scene group. Their variables remain for compatibility with old update code, but they cannot render.
- `rodin-warrior.glb` is the only player visual. The separate NPC `saruul.glb` still loads.
- Legacy avatar toggle removed and load status/errors shown on screen.
- Rodin root motion is moved to a dedicated parent group so centering and ground position are preserved.
- Legacy box sword/bow visuals no longer reactivate on weapon swap; combat hit detection and 5.0 effects stay intact.

## Verified limitation
- The supplied `rodin-warrior.glb` contains one mesh, zero skins, zero animation clips: **no skeletal arm/leg motion** is available.
- This change fixes which model is used; it is not an advanced animation or rig replacement.
- A browser/phone runtime playtest is required to confirm the on-screen result.

## GitHub deployment
Only replace `src/main.js` and `package.json` from this ZIP. All other existing files stay unchanged, and `public/models/rodin-warrior.glb` must be present.
