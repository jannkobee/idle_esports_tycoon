# Implementation status

Reviewed October 4, 2026.

## Verified baseline — living world, shop visits, branches, camera

The current working tree includes the branch network, shop-visit flow, and viewport camera controls. These features are part of the currently verified baseline and the project passes the repo's test suite and TypeScript/Vite production build.

- Branch definitions for Los Angeles, Seoul, and Berlin are present, with persisted branch state, open/upgrade actions, an Empire drawer section, and branch income contributing to online/offline calculations.
- Dynasty Mart and GG Boba break stations, a marked crosswalk corridor, district-tier gating, shop-visit selection, and the associated energy/tilt benefits are included in the current scene.
- The 3D view supports orbit, pan, zoom, and reset controls through the existing camera rig, with the default framing preserved.
- Verified baseline: `npm.cmd test -- --run` passes 71 tests and `npm.cmd run build` completes successfully on the current code. Mobile viewport checks (~390px) remain a manual validation step when visual tuning is being performed.

This section documents the active, confirmed state of the repository as it is today. Preserve schema-v1 save compatibility when making future live-world changes.

## Current prototype

Facilities, an automatic team room with visible generated players, persistent economy, instant stat training, genre-specific scouting, simplified best-of-three tournaments, five-second mock ads, offline rewards, sponsor drones, daily sponsor payouts, and the Esports Empire & Living World milestone.

## Esports Empire & Living World (implemented)

- Permanent vibrant Californian daylight replaces the player-facing day/night control; the house uses a cerulean sky and long, pale-blue distance fog.
- The 3D exterior now contains an attached glass garage with a three-tier fleet, crosswalk, Dynasty Mart, park/plaza, tech promenade, and fan walkers whose density responds to roster fans.
- The Empire mobile drawer provides district, fleet, and HQ evolution; a staff-designed five-block routine; autonomous player personalities and outdoor sports; 12-crest live branding and jersey colors; a staff recruitment market for coaches, managers, and nutritionists; the Spring → MSI → Summer → Worlds calendar; and a persisted VIP vanity inventory.

- Staff hiring now affects gameplay directly: discipline coaches choose match tactics and ban a map before each round; executive managers provide tiered discount bonuses on purchases and deals; nutritionists apply recovery, endurance, or focus boosts that improve morale, energy, and training efficiency.
- District tiers improve automatic income, sponsor potential, mood recovery, and visible fan density. All additions use defaults during schema-v1 save hydration.
- The Cosmetic Store lists 13 purchasable items across wallpaper, flooring, facade, and decorative-object categories. Energy Cans unlock them; owned house finishes can be equipped or reset to the free default. Wall, floor, facade, neon, arcade, pedestal, and vehicle-wrap purchases have corresponding 3D visuals but no gameplay bonuses. Old selected wallpapers are grandfathered during hydration. The cutaway's locked-room surfaces and front glass frames were lightened to remove opaque black patches.
- Android-only Google Play checkout is a prepared host bridge, not a live payment integration: the repository has no Android shell, Play Console catalog, or server-side purchase verification. The bridge must return a server-verified matching product entitlement before the app grants an item. A normal browser offers Energy Cans only.

## Player cards and scheduled circuit

- Players carry age, a role for their discipline (CS style AWP/Rifler/IGL and MOBA Top/Jungler/Mid/Bottom/Support), six card attributes, an overall rating, and an individual potential ceiling. Older saves derive missing card attributes from the original four stats.
- Cash card packs reveal a random card with disclosed 45/28/15/7/4/1 percent tier odds from Bronze through GOAT. A young Scaling Prodigy can have a higher ceiling than their card tier normally permits. Manual and ambient training respect the individual cap.
- The Tournament view offers a single persisted eight-team bracket per event, including four rival fixtures, coach-led map veto and tactic, and individual map/game scores. Map outcomes use role-weighted lineup attributes against ranked opponents. The format is BO3 for the first two rounds and BO5 for the final; results, elimination, and championship rewards persist. The old scripted/ad-driven match flow is removed.
- Duplicate bench cards convert to development points; points raise one of six attributes up to that card's individual potential. Age and remaining potential gap affect simulated development speed.
- Coaches select eligible starters per discipline using role fit, card ratings, form, and style. The roster and Tournament screens report their selection; players no longer assign slots or pick match tactics. Old manual lineup data can remain in schema-v1 saves but no longer drives matches.

## Autonomy and facility-progression invariants

- The player controls recruitment, card development, and purchases—not starting lineups, match strategy, or the routine. Coach/operations hires recompute the roster's five-block plan. Simulated pros use that plan as weighted guidance, can rest when tired, and may walk to the backyard basketball court or football pitch according to their preference.
- Every room, including the scrim lab and cafeteria, starts locked on a new save. The organization retains baseline income before unlocking a room, so play cannot deadlock. Cash/hype unlocks and completed room-funding ads are alternative paths; four completed ads fully fund a room, while skipped ads contribute nothing.
- Save key and version remain `esports_dynasty_save_v1` / 1. Hydration supplies missing room, funding, staff, sports, and managed-schedule fields without revoking rooms that an older save already unlocked.

## Player-first idle direction

The cash-tapping mechanic has been removed from the UI and store. Headquarters is now a fully simulated, living React Three Fiber headquarters: scrim lab, streaming studio, analyst room, gym, merch shop, outdoor patio, attached garage, and across-street district, with detailed 3D furniture, monitors rendering real in-game FPS HUDs, gym gear, exterior street life, cars, and permanent Californian daylight.

Characters follow real activity schedules (practice, streaming, tactical review, fitness, patio breaks) with collision-avoiding A* navigation across unlocked rooms. Activities deliver tangible gameplay stat progression (Aim, Macro, Comms, Tilt Resistance, Energy) that feeds directly into tournament performance.

The simulation incorporates realistic player lifecycle systems:
- Player status: Personal fans count, clutch prodigy factor, sleep quality and fatigue, and renewable match contracts.
- Coaching staff: Specialist coaches for FPS, MOBA, BR, and sports psychology that buff tournament combat power when team prerequisites are met.
- Interior upgrades: Customizable wall themes (Pro Modern, Neon Cyberpunk, Carbon Stealth, Scandinavian) and an upgradable 3-tier Team Lounge TV entertainment wall boosting roster mood and sleep.
- Global Tournaments: Global power rankings with 12 world orgs. The current tournament flow is the persisted bracket described above; the older halftime crisis flow is no longer player-facing.

Up to eight actual roster members live and train in the house simultaneously, matched to their portrait appearance and jersey uniforms. Income is credited by the existing economy tick. Pause and camera controls (pan, zoom, reset) remain available; daylight is fixed.

Scouts receive unused appearances until all six are represented, with Diamond and Gold tier recruits granting large fan surges and clutch factor traits. Saves remain backwards compatible with `esports_dynasty_save_v1` without losing progress.

Daily payouts match the Sponsors UI: 1 ad grants 5 Energy Cans; 3 ads grant $5,000 and two extra boost hours; 5 ads grant $50,000. Payouts are automatic and reset at midnight UTC.

Income retains fractional cash and accounts for partial boost expiry. Hidden tabs pause ticking and calculate catch-up on return. Each offline interval is capped at eight hours; a popup requires at least 15 seconds away and more than $10 earned. Unclaimed rewards persist.

The store is unified with Zustand persistence. Ads are store-driven; IAdService is an interface with mock providers.

## Review fixes

- Fixed missing discipline metadata, fighting-game types, and an unused import blocking builds.
- Fixed fractional income loss, offline boost expiry, ad-dialog stacking, and stale persisted ad state.
- Prevented duplicate ad completion and overlapping requests; implemented daily milestone payouts.
- Added scouting for the selected genre and blocked tournaments without matching players.
- Prevented maxed-training charges and assigned unique recruit IDs.
- Added ignored-drone expiry; opened offers remain available during ads.
- Brightened outdoor scene with lush grounds, flowers, street life, and dynamic day/sunset/night skybox.
- Implemented coach hiring conditions based on roster disciplines and facility levels.
- Added a staff recruitment market where coaches, managers, and nutritionists can be hired to replace slot-based incumbents and stack their bonuses.
- Added Halftime Crisis clutch hero play and tactical timeouts.
- Added interior wallpaper switching and lounge TV morale upgrades.

## Prioritized remaining work

1. Add a richer visual eight-team bracket tree, rival match score simulation, event history, and more distinct discipline-specific match formats. The current bracket persists active/results state but archives only the latest event.
2. Add x10/Max facility purchases and automated training speedups.
3. Complete native Capacitor packaging and AdMob test suites for mobile deployment.
4. Complete prestige UI and trophy benefits; PWA installation/offline service worker.

## Verification

`npm.cmd test -- --run` passes 71 tests covering formulas, store transitions, cosmetic ownership and Android billing gating, save compatibility, coach lineup and routine choices, sports autonomy, room/ad funding, card development, and tournament brackets. `npm.cmd run build` verifies strict TypeScript compilation and production bundling. Mobile viewport and 3D appearance checks (~390px) remain manual verification tasks; no browser automation is configured here.

Suggested browser checks: claim offline rewards through an ad; skip and retry scouting; recruit each genre; resume after boost expiry; reload an unclaimed offline reward; watch five sponsor clips to inspect payouts.

The architecture, design, roadmap, and monetization documents are target plans, not descriptions of completed features. Their engagement percentages and eCPM figures are unverified planning assumptions, not measured project results or validated market benchmarks.
