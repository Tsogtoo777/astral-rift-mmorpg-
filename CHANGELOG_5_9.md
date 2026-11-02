# Astral Rift Alpha 5.9 — Equipment, Stats and Weapon Variants

- Add `src/equipment59.js`: 8 slots (weapon, head, chest, gloves, legs, boots,
  cloak, accessory) and 10 sample equipment entries.
- Save owned items and active equipped slots to existing local save state;
  invalid/unknown saved entries are ignored safely.
- Equip/unequip and purchase with gold using the existing collapsible menu
  and modal; previous Bag and Smith/forge systems remain available.
- Equipment bonuses affect HP max, enemy damage mitigation, sword attack and
  stamina cap (stamina bar normalized to its new maximum).
- 3 sword variants (Iron Longsword, Wanderer Great Sword, Dark Katana) change
  the size/tint of the existing procedural sword mesh; no external 3D outfit
  or weapon models are bundled by this update.
- No changes to the user-supplied `rodin-rigged.glb`, the 7 original FBX files,
  town GLTF, gameplay 5.6/5.7, or existing NPC/quest systems.
- JS smoke tests and asset integrity tests passed. `vite build` was unavailable
  (`vite: not found`) because npm dependencies are not installed in this runtime.
- Live mobile WebGL animation and UI performance remain unverified.
