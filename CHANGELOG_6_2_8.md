# Astral Rift Alpha 6.2.8 — NPC Static Model Fix

Screenshot + `?npcdebug=1` proof from the actual 6.2.7 phone run:
- **Nomin = OK but sideways**. Assets can load even when a Skin's bind transforms render geometry in the wrong orientation. Fix: rebuild from user's actual Witch model into a new **static, Y-up, 0-skin glTF** with all mesh transforms baked and full textures embedded (`merchant-witch-static628.glb`). Nomin's merchant material remains teal; no unsupported animations are asserted.
- **Saruul** was still the old blue/cyan primitive. New, distinct static Y-up model (`saruul-witch-static628.glb`) is used via a single deterministic URL and only replaces the primitive after a successful load. `npcdebug=1` displays success/failure.
- **Enkhee FAIL peasant fetch** because previous path `/models/saruul.glb` was missing in deployed installation. Change Enkhee to use bundled, already verified Inquisitor rig (with warm-tinted material clone). Will look related to Temuulen; distinct traveler model is pending.
- Bold, Temuulen, Captain guards, quests, UI, world, wolf, goblin and combat remain unchanged.
- This is a static-mesh fix. The two Witch-based characters do **not** have animation clips, so they will not walk/talk yet.

Verification: model GLB export/import + independent offline render, Y-up bounds, no skins, texturing; code smoke and syntax. **Three.js WebGL on phone not verified yet**. Do not claim runtime success until user verifies.
