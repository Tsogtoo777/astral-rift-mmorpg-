# Astral Rift Alpha 5.6 — World & Combat

## Added
- `src/combat56.js`: delayed melee/bow contact, range+facing+geometry samples, enemy stagger and knockback.
- `src/camera56.js`: second-stage camera wall guard after interpolation, including ancestor visibility.
- `src/projectile56.js`: four pooled bow arrows.
- On-screen lock-on enemy HP marker (one reused element, scoped CSS in JS).
- `tests/gameplay56-smoke.mjs`: attack timing, wall obstruction, bow travel, stun/recoil, cancellation and camera tests.

## Changed
- Basic sword attacks no longer deduct HP on button press; contact occurs at release. Previous kill/quest/reward functions remain authoritative.
- Bow has separate windup+travel timing and a visible arrow. Actual projectile physics and collision geometry are approximated by target+LOS validation.
- Post-smoothing camera clipping check; deleted a legacy no-op camera Raycaster allocated on every frame.
- Removed nine obsolete gray cube obstacles on the street. Medieval assets and all other game content remain.
- `package.json` version 5.6.0-alpha; `index.html` and HUD headings updated; tests and README synced.

## Retained and verified
- Same Rodin rigged GLB (27 bones; Bind, Idle, Walk, Run, Wave); `rodin54.js` unchanged.
- Existing town/castle/interiors, quests, dungeon, NPCs, controls, collision, EXP/loot and equipment upgrades.
- All `node --check` checks and Node smoke/asset tests passed.

## Not verified
- Real phone/WebGL visual quality or Vercel production build. This runtime cannot install npm dependencies from the offline cache.
- Professional sword clips; 3 sword combos still JS pose offsets.
