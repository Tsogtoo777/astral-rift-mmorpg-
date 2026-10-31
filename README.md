# Astral Rift Alpha 2.2 — Living World

Based on Alpha 2.1. Existing character models, animations, combat, joystick, dungeon, forge, and save key preserved.

## New
- Four walking NPCs in town, with interactions using ✦ Судлах / F
- Three distinct building interiors: forge, inn (HP/MP recovery), shop
- Story Quest chapter: Saruul → magical grove (-36,-43) → ancient ruins (36,-44) → Saruul
- Two outdoor regions: magical grove and ancient ruins, with collectible story interactions
- Skill 2.0: MP bar, costs 12/20/32, passive MP regeneration (3/s), existing cooldowns retained
- World map and story journal buttons, keyboard M/Q
- Story and MP persistence using the existing localStorage save key

## Mobile GitHub / Vercel
Upload all extracted project files to a NEW branch or repo, keeping src/ and public/models/ structure. Vercel framework: Vite; Build: npm run build; Output: dist.

**Note:** Browser orientation lock is best effort. Landscape UI remains from Alpha 2.0. This build does not change any hero animation code.
