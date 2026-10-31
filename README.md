# Astral Rift Alpha 2.4 — Kingdom Reborn

Mobile landscape Three.js / Vite RPG. Based on Alpha 2.3; hero GLB, rig and animation loop are unchanged.

## Visible changes
- Rebuilt the eight existing town houses with different roofs, doors, windows, canopies and entrance paths. Original door coordinates and enter/exit interactions are preserved.
- New plaza lanterns, castle approach, four guard towers and two interactive castle guards.
- Citizens follow day/night station schedules; earlier dialogues and services remain.
- New city/castle solid collision volumes and camera raycast against new city geometry.
- Persistent visible `ALPHA 2.4 · KINGDOM REBORN` marker for deploy verification.

## GitHub/Vercel
Unzip and upload `src/`, `public/`, `index.html`, `package.json` and `README.md` into the repo root. Vercel: framework Vite; build `npm run build`; output `dist`. Deployments should show Ready before testing. Test in a private browser window if cache is stale.

## QA caveat
JavaScript syntax and ZIP integrity checked. Full Vite build and phone browser runtime not verified in this environment. Keep a backup of the prior deployed version. Existing save key and hero animations were not changed.
