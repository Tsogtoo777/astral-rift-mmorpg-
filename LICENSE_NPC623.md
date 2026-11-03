# Alpha 6.2.3 — third-party NPC models and licensing

Build step `npm run assets:npc` downloads these models into `public/models/npc623`. They are NOT included in the source ZIP until the build step succeeds.

| NPC | Download URL | Published terms |
| --- | --- | --- |
| Tavern peasant | https://vibeassets.io/download/fbd1hbd0su | CC0 (VibeAssets, 2026-11-02) |
| Hooded scholar/inquisitor | https://vibeassets.io/download/k6bdm27lba | CC0 (VibeAssets, 2026-11-02) |
| Guard captain | https://vibeassets.io/download/9h7odik5fl | CC0 (VibeAssets, 2026-11-02) |
| Vale shieldmaiden | https://assetyard.dev/pack/files/vale-shieldmaiden.glb | Asset Yard Hollowreach free for game use; provider terms may differ; review before release |

Original pages: https://vibeassets.io/ and https://assetyard.dev/pack/.

**Important:** A successful `node --check` does NOT verify rendered models. Vercel build logs must show `[NPC623] Imported` and on-device graphics must still be checked. If a download fails, the game shows original 6.2.2 Saruul/Meshy fallback NPCs. Use `?npcmodels=old` to force fallback or `?npcmodels=cdn` for a CORS-dependent remote experiment.
