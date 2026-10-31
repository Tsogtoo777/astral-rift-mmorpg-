# Astral Rift Alpha 1.7 — Mobile Systems

Based on Alpha 1.6. Preserves the original 3D town, hero and Saruul GLB assets, dungeon, boss, combat, joystick, inventory, shop, quests and local save.

New in 1.7:
- Quick heal touch button (❤️ Эм), also H on keyboard
- Quest and achievements journal (📜 Quest), also J
- Four one-time achievements, 40 gold each, saved in localStorage
- Return to town shortcut (⌂ Хот), also T; unavailable inside buildings or dungeon
- Existing saved games remain compatible (same storage key)

Deployment: upload this project to a GitHub repository, connect that repository to Vercel. Framework Vite, build command npm run build, output dist. Keep both public/models/*.glb paths.

This is a source project, not a directly runnable local HTML file.

## Alpha 1.9 updates
- Skill Tree: four talents, five ranks each, points awarded at level-up. Keyboard K / mobile Skills.
- Enemy variety: standard, fast, and elite monsters, with distinct HP, speed, reward and colors.
- Boss phase II below 50% HP: faster attacks and more damage.
- Save migration: same localStorage key as Alpha 1.8; old saves retained.
- The 3D characters and animations are unchanged.
