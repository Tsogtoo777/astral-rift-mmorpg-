# Alpha 6.2.7 — NPC Visual Fix

**Actual screenshot regressions corrected in code/assets:**
- **Nomin:** Original Elf Woman's base color texture is nearly black, making her an unreadable black silhouette. Replaced with an alternate color-treated version of the user's uploaded `Medieval Witch Girl` rig, dressed in teal/brown. The model is independent `merchant-witch.glb` (with embedded colors, geometry and bones), not a CDN promise. Retained the old Elf GLB in the full build for future uses.
- **Saruul:** New 6.2.6 `witch-girl-upright.glb` sometimes unavailable in user GitHub upload; 6.2.7 tries both new and previously uploaded original `witch-girl.glb` (rotating the latter +90 degrees to cancel Sketchfab root). No longer immediately falls back to 2D/cartoony Saruul model.
- **Extra cylindrical guard:** `alpha40.js` independently spawned 2 primitive guards in addition to the Captain-equipped `guards24`. On first verified Captain load, the old geometric duplicates are hidden, and their invisible interaction zones are disabled.
- **Diagnostics:** append `?npcdebug=1` to Vercel URL to see per-NPC asset-load statuses on mobile.
- **Unchanged:** Bold blacksmith, Temuulen/Inquisitor, Captain rig, gameplay, quest/shop, monsters.

New Witch merchant and Saruul models share a common underlying mesh; distinct licensed humanoid merchant model is still desired in the future. Neither true WebGL runtime nor RedMagic rendering is verified.
