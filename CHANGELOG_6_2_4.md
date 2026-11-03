# Astral Rift Alpha 6.2.4 — Captain Guard (real bundled GLB)

## Confirmed changes
- **User-uploaded** `captain_v2.glb` copied unchanged into `public/models/npc623/guard-captain.glb` (3,934,364 bytes). This is a REAL included asset, not just a link or download script.
- GLB metadata: 24 rig joints; 10 animation clips, including `Idle_02`, `Talk_Passionately`, `Agree_Gesture`, `Formal_Bow`; 3 embedded JPEG textures. **No Walk clip**.
- Two city gate guards (positions x = -5, +5, z = 20) load skeleton-independent clones of the new model with separate animation mixers; stand guard and play gestures during NPC conversation.
- Critical visibility fix: legacy Alpha 4.0 hid both guard groups; these become visible after a 3D model loads. Old primitive placeholder children stay hidden.
- Talk animation selection now prioritizes actual `Talk` clips over `Agree` gestures.
- Vercel `prebuild` now validates the local GLB instead of fetching unreliable third-party URLs. Other unbundled NPC models (Nomin, Bold, etc.) **have not** been replaced. Existing NPC interaction/quest functions remain.
- UI version set to Alpha 6.2.4.

## Verification and limitations
- ZIP CRC / required archive members, GLB container, clip names, embedded image references, JavaScript syntax and static smoke tests verified by scripts.
- **Not yet validated visually on the user's actual phone or in a live Vite WebGL session.** Height/orientation/animation quality still needs real-device confirmation.
- Asset was supplied by the user; verify the asset's redistribution rights from the original source before publishing commercially.
