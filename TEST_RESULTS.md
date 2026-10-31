# Local verification (2026-10-31)

- PASS: `node --check` on `src/main.js`, `src/alpha40.js`, `src/architecture42.js`, `src/architecture41.js`.
- PASS: `npm run test:smoke` — two Node mocked tests; guild quest, save, reward, castle collision, world map, architecture load/fallback, visibility, camera clipping.
- PASS: `npm run test:assets` — 22 glTF 2.0 files, all required `.bin` and PNG files, included CC0 license; original hero/Saruul GLBs byte-identical.
- PASS: sample glTF scene parse using trimesh (wall, roof, wagon).
- BLOCKED: `npm install` — `EAI_AGAIN` DNS resolving `registry.npmjs.org`.
- BLOCKED: `npm run build` — `vite: not found` (dependencies unavailable).
- NOT TESTED: real browser/WebGL render, Vercel deploy, phone FPS, full gameplay/camera/quest walkthrough.

The package is **playtest-only** until a networked Vite build and real device verification succeed.
