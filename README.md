# Astral Rift Alpha 6.2 — World Expansion

Full project based on Alpha 6.1.8 with an extended outdoor world and 19 additional lazily loaded rigged enemy spawns. The original Meshy wolf, Goblin, Meshy player, town, combat and UI remain. See `CHANGELOG_6_2.md` and `INSTALL_6_2_MN.txt`.

# Astral Rift Alpha 6.1.8 — Original Meshy Wolf / Updated Motion

This build deliberately keeps the **original 27-bone Meshy Wolf** at `public/monsters/forest_wolf.glb` as the only visible wolf. It never displays the alternative FBX wolf.

`src/wolf618.js` optionally samples the provided FBX Walk / Run motion and retargets rotations to the Meshy skeleton. The original wolf's Idle, Attack, Hit, Dead and Howl animations remain unchanged. If an FBX load or animation transfer fails, the original Wolf animation clips run automatically.

**Disable experimental retargeting:** append `?wolfmotion=original` to the game URL.

Install: unzip the PATCH at the GitHub repository root preserving `src/`, `public/` and file names, or use the FULL ZIP for a clean project.

Commands: `npm install`, `npm run test:smoke`, `npm run test:assets`, `npm run build`, `npm run dev`.

Vercel: Vite, build `npm run build`, output `dist`.

Important: because the two wolf skeletons differ, the retargeted motion needs visual testing on Android. The code/asset structural tests pass; actual Three.js/WebGL motion quality is not claimed as verified.


## Alpha 6.2.5 real NPCs
Four user-uploaded model files bundled; offline build validation. Install ZIP instructions: `INSTALL_6_2_5_MN.txt`. Mandatory Sketchfab CC BY credits: `CREDITS_NPC_6_2_5.md`.
