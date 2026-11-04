# Astral Rift Alpha 6.2.13 review

Base: `main` at `d8c397310ee9100c02c7e11d98c8a73a1803960c`.
Review branch: `review/alpha-6.2.13-bugfixes`. No merge or direct main changes.

## Reproduced defects and fixes

| Defect | Evidence and correction |
| --- | --- |
| Enemy diagonal movement enters solids | Baseline enemy at (0,0), chasing (5,5), enters a blocked corner at (0.05091,0.05091) in one 0.06s update. Probe Z after the accepted X movement so sliding remains collision-safe. |
| Forest trunks bypassed by AI/dodge | All 211 procedural trunks were checked only by the walking player's post-movement resolver. Register their footprints in the shared movement/navigation/camera collision layer. Also expel an exact-center overlap, which previously remained at the trunk center. Preserve six instanced render batches. |
| Skills damage through walls | Browser reproduction: a bow skill damaged a Goblin inside the house at (8,-14), from (8,-10): HP 140 → 105. Direct damage now checks the collision segment. Existing queued normal attacks retain their existing combat validation. Regression requires unchanged HP through the wall and still verifies a legitimate wolf kill. |
| Missing architecture textures | Chromium reported six load errors for absent `T_UnevenBrick` maps used by two modules. Resolve those names to the bundled `T_Brick` base-color/normal/roughness maps through a dedicated loading manager. No asset files changed. |
| Duplicate NPC GLB decode | Scholar and traveler use the same Inquisitor URL but cached by different role keys. Cache by URL; regression requests both roles and requires one loader call. Skeletons and animation mixers remain independent per NPC. |
| Missing citizen fallback | `/models/saruul.glb` is absent. Use the bundled static upright Saruul GLB when the primary citizen load fails. |
| Null save crashes | JSON `null` bypasses JSON parse error handling and crashes property access in legacy, board, guild, and HUD preference readers. Default null to empty state; guard access to browser storage before creating the contracts system. Browser test initializes all four save keys to `null`. |
| Stale tests | Nine documented scripts referenced absent legacy player/Saruul files. Point them at the active bundled models. Keep rig, animation, geometry, skin-weight, equipment, and wolf assertions. Do not manufacture missing GLBs or remove gameplay assertions. |

## Exact validation

Environment: Node 24.22.1, npm 11.9.0, Python 3.12.14; installed Three.js 0.170.0 and Vite 6.4.5. Python validation uses numpy 2.5.4, trimesh 5.2.0, Pillow 13.0.0; browser runner uses Playwright 1.62.0 and system Chromium.

- `npm install --package-lock=false --no-audit --no-fund --cache /workspace/.npm-cache`: exit 0; 14 packages installed. The repository has no lockfile; dependency ranges were not changed and no lockfile was fabricated.
- `npm run build`: exit 0, including all six NPC prebuild validations; 41 modules transformed. JS 969.92 kB / gzip 279.18 kB; CSS 48.90 kB / gzip 11.22 kB. Vite retains its >500 kB chunk warning.
- `npm run test:smoke`: exit 0; all 33 script entries executed, including the new review regression. These are script counts, not assertion counts.
- `PATH=/workspace/astral-review-venv/bin:$PATH npm run test:assets`: exit 0; all 14 scripts executed. Requires numpy/trimesh/Pillow, which were absent from the initial Python environment.
- With Vite running, `PATH=/workspace/astral-review-venv/bin:$PATH npm run test:browser`: exit 0. Chromium 640×360 touch viewport, bundled assets, `?worldassets=off&npcdebug=1`. Zero uncaught page errors, missing HTTP resources, or texture load errors. Tests null-save startup, six NPC heights, finite wolf tracks, blocked skill damage, one real defeat → one contract increment/one fang, equipment snapshot restoration, and bag rendering.
- `git diff --check`: passed. All 13 tracked GLBs verified byte-identical to their original Git blobs. No public assets changed.

Initial baseline: build passed; the aggregate smoke command stopped at the sixth script and the aggregate asset command stopped at the first script. Running all 46 constituent scripts independently produced 34 passes / 12 failures: nine absent legacy-asset references and three missing trimesh imports. Installing the Python dependencies resolved the environment failures; correcting active-asset references resolved the stale tests. Regression assertions were retained.

## Investigation coverage and limitations

- **Imports/startup:** Vite resolves the application import graph; mobile browser starts without uncaught errors. No reproducible missing JavaScript import was found.
- **NPC presentation:** All four citizens and two guards load. Measured animated-frame heights: blacksmith 1.801 m, merchant 1.702 m, scholar/traveler 1.780 m, guards 1.900 m. Static Saruul and merchant GLBs pass upright bounds, zero-skin/zero-animation, embedded texture checks. Blacksmith/merchant remain static; scholar/traveler/guards retain available authored animations. Materials and GLB contents are preserved.
- **Geometry/collision:** Existing architecture tests verify atomic replacement of eight primitive houses, optional CDN house exclusion, wagon footprints and visibility; world tests cover old placeholder cleanup and camera/movement collision. No speculative geometry removal was performed. Added forest and diagonal collision regressions.
- **Pathfinding:** Existing A* obstacle route, diagonal-corner, sealed-wall, cached waypoint, pursuit and line-of-sight regressions pass. Shared tree footprints now participate in these collision callbacks.
- **Wolf:** Original 27-bone GLB remains the visible model. Browser loads FBX-derived Walk/Run with 23 finite quaternion tracks each; all seven clips remain present. Existing asset tests verify seamless locomotion and removed root translation. Android motion quality remains a manual device check.
- **Quests/loot/inventory:** Existing tests cover all three sequential contracts, wrong enemy types, reload persistence, claim-once rewards, potion cadence, equipment purchases/equipping and saves. Browser additionally exercises the real wrapped damage/defeat/contract/loot pipeline and inventory rendering. Existing reward systems are retained.
- **Mobile performance:** One software-rendered town frame before the wall-skill probe recorded 514 draw calls, 969,548 triangles, 908 geometries, 57 textures, and six batches for 211 procedural trees. These are a scene sample, not phone FPS or a benchmark. Existing seven-regional-mob budget and adaptive resolution remain. Real Android GPU/thermal profiling, visual motion assessment, and production-network optional CDN scenery were not validated. No speculative quality reduction or code-splitting rewrite was made.

## Reuse

Use the existing isolated checkout; do not create a worktree unless requested. Reusable install and startup instructions are saved in the environment draft. Start `npm run dev -- --port 5173 --strictPort` from this repository; processes must restart in future tasks. Activate `/workspace/astral-review-venv/bin` on PATH for Python checks. No backend or secrets are required for local playtesting.

Git reads use the platform HTTPS proxy. GitHub API access for PR creation currently returns `Forbidden`; `api.github.com` was added to the saved network draft. Saving the draft does not apply or publish it. Review/save environment settings and publish the prepared environment to activate the reusable configuration. PR publication remains subject to working API access; no automatic merge is authorized.
