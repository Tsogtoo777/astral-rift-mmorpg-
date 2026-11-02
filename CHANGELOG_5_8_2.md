# Alpha 5.8.2 — Combat control hotfix

Based on the user’s Alpha 5.8.1 phone video (29.96 s).

- Rodin no longer visibly topples during attacks in the video; this fix does not rewrite the locomotion skeleton.
- Reduce retargeted Mixamo shoulder / upper arm / elbow / wrist / spine rotation limits to avoid the full sideways T-pose swing.
- Reduce secondary sword wrist twist: more of the sword arc now follows the authored right-arm animation.
- Adjust melee reach to account for the enemy body radius rather than treating enemies as dimensionless origin points. Still forbids wall penetration and out-of-range attacks; bows unchanged.
- No GLB or FBX model modifications; all original materials, city, quests, and NPCs retained.

## Limits

These are conservative code-level adjustments, not a re-rig or professional two-handed IK solver. Full mobile browser, Vite build, and visual quality not certified. Users should be told that these are hypotheses tested with code-level assertions, not claims of perfection.
