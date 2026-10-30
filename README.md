# Astral Rift Alpha 0.3 — Solo Adventure

Three.js / Vite single-player prototype. Works in mobile and desktop browsers.

## Added
- Articulated arms and legs with simple walk / sword animation
- Enemies respawn 12 seconds after defeat
- Level and EXP (35 XP per kill, 80 × level for next level)
- Repeatable quest from Saruul NPC
- Local browser save for gold, inventory, level and quest state
- Keeps camera-relative joystick directions and simultaneous touch controls

## Deploy
Replace index.html, package.json, README.md, src/main.js, src/style.css in the existing repository. Keep src files in src/. Vercel preset Vite, build npm run build, output dist.

## Note
This is an experimental single-player prototype, not a multiplayer MMO. Browser storage can be cleared; save is device/browser-local. Test controls and combat on a phone after deploying.
