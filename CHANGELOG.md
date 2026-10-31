# Alpha 4.0 integration notes

- Based on Alpha 2.5.1 Polished Kingdom, not a fresh demo.
- Retains original local models and animation.
- Adds modular `src/alpha40.js` with guild, library, map, quest, castle decoration and dungeon decoration.
- Wraps movement collision and enemy chase, interaction, hit event, and camera collision in `src/main.js`.
- Adds a timed parry window to the existing block mechanic.
- Preserves older save keys and creates an independent Alpha 4.0 quest save.
- Responsive HUD override avoids repeating historical version badges.
- Runtime build and mobile QA are **not** confirmed; see README.
