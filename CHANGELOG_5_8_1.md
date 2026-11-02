# Astral Rift Alpha 5.8.1 — Sword Stability Hotfix

## Addressed from the user-provided 22-second mobile video
- Combat FBX clips unexpectedly rolled/tilted the whole Rodin body.
- Huge animation rotations pulled the sword arm into unnatural positions.
- The warning "Дайсан хэт хол байна" in the city is a normal out-of-range message, not this bug.

## Code changes
- Imported Mixamo FBX clips no longer animate Hips, root, legs, feet, neck or head.
- Arm, shoulder and upper-spine quaternion channels are converted to bounded **first-frame-relative** motion.
- Converted clips use Three.js **additive animation blending** on top of the real Idle/Walk/Run clips; the base movement never fades away during imported combat.
- Sword attacks fade in/out safely, while Block keeps its guard pose.
- A modest procedural guard overlay is kept as fallback.
- No changes to authored Rodin GLB or 7 FBX animation assets.

## Limitations
- Spin and jump attacks are constrained to the upper body for now to avoid flips. Authentic full-body jumps/spins require rig-specific retargeting, feet constraints and tested root motion.
- The 7 FBX motions still use a source/target skeleton mapping: some hand orientation differences may remain.
- Syntax, smoke tests and asset checks passed. Vite production build and actual phone WebGL rendering were not verified because npm registry DNS failed.
