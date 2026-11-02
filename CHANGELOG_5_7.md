# Astral Rift Alpha 5.7 — Enemy AI & Directional Dodge

## Gameplay improvements

- Added `src/enemyAI57.js`, a lightweight deterministic enemy brain with **detect → chase → telegraph → hit → recover** states. Enemies display a ground warning ring and overhead symbol during windup; their target marker also warns the player.
- Enemy strikes now resolve **after a ~0.47–0.70 s warning window**, not immediately upon entering attack range. The existing HP, armor, parry, knockback and respawn systems remain authoritative.
- A successful **parry** cancels the strike and staggers the attacking enemy. A dodge avoids contact only while its existing invulnerability window is active. Incoming attacks cancel when their target moves out of range, the enemy is stunned, or combat is out of bounds.
- Enemy movement uses simple collision-checked chase / retreat and leashes to the spawn area. Enemies will not attack in the town safe zone; bosses use an independent shorter, stronger cadence in their second phase.
- Added `src/dodge57.js`: directional dodge moves the character about 3.1 world units with easing over 0.42s, even with no joystick input. The existing 22 stamina cost is retained, and the old speed bonus during dodge was removed to prevent doubled movement.
- Added `tests/enemy57-smoke.mjs`: verifies warning timeline, delay, range cancellation, stun/parry cancellation, safe zone, obstacle safety, respawn and frame-rate independent dodges.

## Integration / deployment

- `src/main.js` integrates both new modules with the existing 5.6 combat and camera systems.
- The **universal PATCH** includes `main.js` plus five supporting modules (`combat56.js`, `camera56.js`, `projectile56.js`, `enemyAI57.js`, `dodge57.js`) so it works on a 5.5 code base as well as 5.6; if 5.6 was installed, the first three supporting modules can be left unchanged.
- Rigged Rodin 27-bone GLB, Idle/Walk/Run/Wave clips, medieval glTF assets, Saruul, town, interiors, dungeon, quests, bows, lock-on and mobile buttons remain in the full ZIP.

## Verification and limitations

- JavaScript syntax, all legacy Node smoke tests, new 5.7 logic test, Python 3D-asset validation and ZIP integrity check passed.
- **Not verified:** actual Vite/WebGL device build. `npm install` failed with `EAI_AGAIN` (unreachable npm registry). No claim is made for mobile 60fps, authored sword animations, intelligent global navigation or multiplayer services.
- AI uses local steering and sampled collision. It is not a NavMesh pathfinder, and some tight corners may still trap enemies.
