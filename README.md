# Astral Rift Alpha 4.2 — Medieval GLTF Playtest

This is an **integrated, source-code playtest package**, not a verified final release. It is built on the user's available Alpha 4.1/4.0 integrated files (with Alpha 2.5.1 game systems) and the user's uploaded *Medieval Village MegaKit [Standard]*. The original hero and Saruul GLB assets and their rig/animation code remain unchanged.

## What's included

The prior 4.0 systems are retained: city/castle/hall, walk-in guild/library, NPC dialogue and patrols, guild quest and persistent rewards, large map, dungeon boss, combat/skills/equipment, physical collision, mobile landscape controls and local save. **Alpha 4.2 adds real textured glTF architecture** to eight original houses and two public halls, plus dungeon floor tiles, wagons/crates and a camera collision adjustment. This is a real asset integration, not merely more BoxGeometry decorations.

The authored model/texture files live in `public/architecture/medieval/`. License: Quaternius CC0 1.0, with the original license included as `LICENSE_Quaternius_CC0.txt`. Source textures were resized to at most 1024px for mobile. Only selected assets from the Standard kit are included, not the entire 154 MB source archive.

## Deploy

1. Make a **new GitHub branch** or backup the existing main branch.
2. Extract all ZIP contents at the repository root; ensure `src/architecture42.js` and `public/architecture/medieval/*.gltf` are committed along with their `.bin` and `.png` dependencies.
3. On a machine with network access run `npm install`, `npm run test:smoke`, `npm run test:assets` (optional Python/Pillow not needed for this validation), and `npm run build`.
4. Deploy with Vercel: build command `npm run build`, output directory `dist`.
5. Test on phone in landscape. Allow a few seconds for textured architecture to load; old houses remain visible until the essential assets finish loading. Look for the toast `8 байшинг бодит glTF модульд шилжүүллээ`.

## Suggested playtest route

1. Check all eight houses from spawn, especially doors at `house.z + 3.2`; use **F / ✦ Судлах** to enter, then exit. Verify no wall/camera clipping.
2. Walk into the guild at `(27,15)` and library at `(-27,15)`; roofs should hide when inside and reappear when outside. Interact with the guildmaster near `(23,7)`.
3. Accept the guild quest, defeat three enemies, inspect the ruins relic `(36,-44)`, return for the reward. Reload and ensure the reward cannot be claimed twice.
4. Use **M** for the large map; test sword/bow switch **X**, parry **R**, dodge **Space**, and 1–3 skills.
5. Enter the dungeon and check the brick floor and boss. Verify minimap, save, mobile joystick + simultaneous attack/skill, and stable FPS on RedMagic 9 Pro.
6. If models do not appear, inspect browser Network/Console for missing `/architecture/medieval/*.gltf`, `.bin`, or `.png` files. Do not change relative paths inside glTF files.

## Verification and limitations

Local JS syntax checks, two **mocked** Node smoke tests, the glTF dependency check, original GLB SHA256 checks, and sample glTF parsing passed. **No Vite production build or actual WebGL/phone playtest has passed here**: npm registry DNS failed and Vite was not installed. See `CHANGELOG_4_2.md` for exact test status.

Remaining work for a full high-quality visual replacement: detailed castle and town street meshes; animated humanoid NPC/enemy rigs; improved terrain/trees/vegetation; professionally designed interiors; consistent lighting and materials; mobile profiling/LOD; comprehensive combat/equipment regression tests; server-side persistence/multiplayer if desired. Existing procedural assets have not all been removed. Do not describe this package as an AAA or complete MMO release.
