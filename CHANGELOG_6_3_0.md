# Astral Rift Alpha 6.3.0 — Crafting & Equipment

Base: merged Codex review of Alpha 6.2.13 on main. This feature lives in a separate branch. No GLB/texture assets changed.

## New
- Bolt/Болд's forge offers three **real recipes** using existing stackable loot from `src/adventure6213.js`:
  - Hunter field kit: 2 wolf fangs + 1 goblin insignia + 20 gold → 2 healing potions.
  - Astral Amulet: 4 fangs + 2 insignias + 1 alloy + 140 gold → the existing Astral Amulet equipment.
  - Dark Katana: 3 insignias + 2 alloy + 1 shadow fragment + 240 gold → the existing Dark Katana equipment.
- The forge lets players sell a single fang, insignia, alloy or shadow fragment for gold.
- Craft/sell buttons only work close to **Болд** (7 world units); existing legacy forge upgrades are unchanged.
- Crafted gear enters the existing Equipment UI; it must be equipped manually. Existing Meshy character/weapon model files remain unchanged.
- Loot spending is all-or-nothing and saved in the preexisting Adventure storage; gold and equipment use the preexisting game-save storage.
- Failed recipes, missing resources and duplicate crafted equipment consume nothing.

## Verification
- New `tests/crafting630-smoke.mjs`: recipe gates, atomic material costs, duplicate ownership, persistence, equipment bonus integration, sales UI and proximity.
- Existing smoke and asset scripts are retained. Version assertions were updated to 6.3.0.
- A real Vite / Chromium build and physical Android FPS require external validation; do not claim an unverified runtime pass.

## Installation
Review the GitHub feature branch and Draft PR before merging. Merge only after build/status checks. Vercel will deploy after merge to main.

## Limits
The player still has one local/browser save (not server-authoritative multiplayer inventory). This feature does **not** add new GLB appearances or separate Meshy clothing meshes.
