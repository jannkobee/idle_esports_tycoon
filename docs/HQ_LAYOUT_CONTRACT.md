# HQ layout and equipment regression contract

Updated October 5, 2026.

## Physical layout

- `core/house/campusLayout.ts` defines the arena, Merch, dining, connecting halls, garage, exterior walls, and dining obstacles. `HouseLayout.ts` consumes the same Merch/dining footprints.
- One usable location per facility. Do not add a second decorative copy in the backyard. The arena is an additional practice room gated by **unlocked scrim lab + level 6**.
- Keep the backyard for sports. Keep the garage clear of Merch and arena entrances.
- When moving furniture, update its visual position, obstacle footprint, seat, approach, and any decorative staff using that position together. Never enlarge a room mesh without updating navigation.
- Door leaves must remain outside the open walking passage. Core and campus walls block navigation; locked rooms cannot be entered. A* failure means wait/retry, not a straight route through a wall.
- Rendering is not authoritative for activity gains, schedules, room purchases, or simulation movement. The upstairs is currently scenery only; do not imply that pros use its beds or stairs.

## Equipment evolution

| Facility level | Model tier | PC silhouette |
| --- | --- | --- |
| 1–9 | Starter | Single screen, basic tower, wood finish |
| 10–24 | Competitive | Dual displays, RGB desk/tower |
| 25–49 | Professional | Ultrawide monitor, upgraded chair |
| 50–99 | Elite | Triple displays, purple finish |
| 100–249 | World Class | Angled panoramic displays, white liquid-cooled tower |
| 250+ | Dynasty | Gold trim, championship crest and canopy |

`core/facilities/equipmentProgression.ts` owns thresholds and player-facing names. `EquipmentModels3D.tsx` owns geometry. Do not create a second set of thresholds in UI or persistence. Standard rigs retain a 1.44 × 0.94 desk footprint; compact arena rigs retain 0.85 × 0.58. Seats remain fixed across tiers.

Other rooms receive facility-specific equipment attachments, not a complete replacement of every decorative prop. The final tier caps mesh count and physical footprint. Income upgrades continue beyond it. Equipment visuals derive from existing saved levels; the save key/version stay `esports_dynasty_save_v1` / 1.

## Verification

Run `npm.cmd test -- --run` and `npm.cmd run build`.

For the Windows/Edge visual smoke check, start `npm.cmd run dev -- --host 127.0.0.1 --port 5179`, then run `node scripts/verify-hq.mjs`. It uses a temporary browser profile and synthetic saves, never the player's browser profile. Screenshots go to ignored `.tmp/hq-review/`. The disposable profile stays in the OS temporary directory for normal OS cleanup.

The script checks locked rooms, all six equipment milestones, 18 pros at the maximum tier, both floor/roof states, zoom/reset, uncaught runtime errors, and off-screen controls at 390×844 and 844×390. It resolves the live Vite store module and asserts the requested level reached the UI; merely changing a second imported store is not a valid visual test. In short landscape windows, the page scrolls vertically to retain usable room controls.

Inspect the screenshots too: automated route tests cannot establish visual quality. Check the roof hides overhead content, door passages are clear, no desks overlap, chairs align with seated pros, no objects float outside their room, and upgrades visibly change equipment. Physical-device gestures and frame-rate profiling remain required before mobile release.
