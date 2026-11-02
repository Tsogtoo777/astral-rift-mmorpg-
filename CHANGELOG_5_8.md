# Astral Rift Alpha 5.8 — Great Sword combat animations

## Integrated assets (from the user's `Great Sword Pack.zip`)

Seven original animation-only binary FBX clips are placed in `public/animations/great-sword/`:

| Game action | Source animation |
| --- | --- |
| Combo 1 | `great sword slash.fbx` |
| Combo 2 | `great sword slash (2).fbx` |
| Combo 3 | `great sword slash (3).fbx` |
| Block | `great sword blocking.fbx` |
| Player hit reaction | `great sword impact.fbx` |
| Skill 2 / Jump attack | `great sword jump attack.fbx` |
| Skill 3 / Spin attack | `great sword high spin attack.fbx` |

The author's FBX files are unmodified. The large `Maria WProp J J Ong.fbx` avatar was deliberately **not** added, to preserve the user's custom rigged Rodin player and keep download sizes reasonable.

## Code integration

- New `src/greatSwordMap58.js`: versioned manifest, FBX namespace / bone-name mapping.
- New `src/greatSword58.js`: serial `FBXLoader` downloads; `SkeletonUtils.retargetClip` maps the available Mixamo skeleton joints to the existing Rodin 27-joint skin. Target clips are sampled at 24 fps, converted to local named-bone quaternion tracks, and have root-motion tracks stripped (the game drives player movement and collision).
- `src/rodin54.js` uses the existing `AnimationMixer` to crossfade the newly loaded FBX-derived actions with original Idle/Walk/Run. Combat falls back to the existing procedural poses when FBX parsing / retargeting / loading fails.
- `src/main.js` starts background loading after Rodin is ready; main gameplay does not wait for the entire pack. It also triggers player hit reaction and skill animations where available.
- Enlarged the simple code-built sword silhouette to better match great-sword motions. No claim is made for a professional weapon model or guaranteed two-hand IK.
- Kept city, medieval assets, Saruul, quests, UI, mobile joystick, timed hit resolution, enemy AI, dodge, bow, armor, local save, all existing gameplay unchanged.

## Validation

Passed locally: code syntax, all existing Node smoke tests, Great Sword manifest and FBX fingerprint tests, 22 medieval glTF dependency checks, Rodin 27-bone GLB checks and ZIP integrity.

**Not verified:** runtime `FBXLoader`/`SkeletonUtils.retargetClip` operation in a real Three.js browser scene, 3D grip/limb quality, production Vite build, real Android browser FPS. The animation retarget may need manual pose corrections; runtime failure leaves the original 5.7 procedural sword behavior in place.

## Asset rights

The uploaded ZIP contains no license file. The user indicated it was a free pack. Free download **does not by itself prove** public redistribution permission. Confirm its source license before publishing raw `.fbx` files to a public GitHub repository or Vercel website. Keep them private until confirmed.
