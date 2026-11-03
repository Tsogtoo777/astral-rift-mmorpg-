# Astral Rift Alpha 6.2.12 — NJ-MMO Navigation Integration

Based on Alpha 6.2.11 World Cleanup & Collision.

## Integrated code, not art

1. **A* enemy routing** (`src/pathfinding6212.js`): when a building, tent,
   wall, rock, or tree collider blocks a direct chase, nearby enemies seek a
   short, obstacle-aware waypoint path instead of endlessly walking at the wall.
   Eight directions, no cutting diagonal corners; sampled collision along
   segment and simple line-of-sight smoothing.
2. **Safety and mobile performance**: bounded search (700 expansions max),
   per-enemy waypoints cached, paths refreshed at most roughly once per second
   unless goal changes substantially. If search fails, old sliding AI is used.
3. **Attack line-of-sight**: a melee enemy cannot begin a strike through an
   obstacle when the new navigation layer reports that the line is blocked.
4. **Nearby-enemy spatial index** (`src/spatial6212.js`): the 19 additional
   open-world monsters are indexed in a 20m grid and queried within 43m of
   the player; retain the existing cap of 7 active new skinned enemies.
5. Existing 6.2.11 collision geometry, NPCs, quests, inventory, combat,
   no-cape Meshy player, Meshy Wolf and Goblin remain unchanged.

The two systems are ports/adaptations from NJ-MMO's permissively licensed
source algorithms; see `THIRD_PARTY_LICENSES_NJ.md`. No NJ-MMO 3D models,
textures, game data, or server was copied into this build.

## Verification

- JavaScript syntax + existing smoke tests.
- New tests for blocked paths, corners, A* obstacle chase, waypoint cache,
  no hits through walls, spatial grid queries, respawn/backward compatibility.
- Original GLB content hashes compared with the 6.2.11 full archive.
- WebGL on the user's phone **not tested here**; routing should be field-tested
  near the camp palisades, town outer walls and ruins.

## Deployment

Copy the PATCH files into the GitHub project root preserving directory paths;
Vercel should rebuild. No new GLB assets are required. Existing 6.2.11 FULL is
also integrated into 6.2.12 FULL for clean deployment.
