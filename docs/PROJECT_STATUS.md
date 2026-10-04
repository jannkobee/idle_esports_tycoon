# Implementation status

Reviewed October 4, 2026.

## Current prototype

Facilities, an automatic team room with visible generated players, persistent economy, instant stat training, genre-specific scouting, simplified best-of-three tournaments, five-second mock ads, offline rewards, sponsor drones, daily sponsor payouts, and the Esports Empire & Living World milestone.

## Esports Empire & Living World (implemented)

- Permanent vibrant Californian daylight replaces the player-facing day/night control; the house uses a cerulean sky and long, pale-blue distance fog.
- The 3D exterior now contains an attached glass garage with a three-tier fleet, crosswalk, Dynasty Mart, park/plaza, tech promenade, and fan walkers whose density responds to roster fans.
- The Empire mobile drawer provides district, fleet, and HQ evolution; an editable five-block team routine; player personality display and outdoor Treat Runs with an Inspired buff; 12-crest live branding and jersey colors; CEO/GM/Ops/CMO hires; the Spring → MSI → Summer → Worlds calendar; and a persisted VIP vanity inventory.
- District tiers improve automatic income, sponsor potential, mood recovery, and visible fan density. All additions use defaults during schema-v1 save hydration.

## Player cards and scheduled circuit

- Players carry age, a role for their discipline (CS style AWP/Rifler/IGL and MOBA Top/Jungler/Mid/Bottom/Support), six card attributes, an overall rating, and an individual potential ceiling. Older saves derive missing card attributes from the original four stats.
- Cash card packs reveal a random card with disclosed 45/28/15/7/4/1 percent tier odds from Bronze through GOAT. A young Scaling Prodigy can have a higher ceiling than their card tier normally permits. Manual and ambient training respect the individual cap.
- The Tournament view offers a single persisted eight-team bracket per event, including four rival fixtures, map veto, selectable tactic, and individual map/game scores. Map outcomes use role-weighted lineup attributes against ranked opponents. The format is BO3 for the first two rounds and BO5 for the final; results, elimination, and championship rewards persist. The old scripted/ad-driven match flow is removed.
- Duplicate bench cards convert to development points; points raise one of six attributes up to that card's individual potential. Age and remaining potential gap affect simulated development speed.
- Each discipline now has a saved starting lineup. The roster screen supports slot assignment, benching, swaps, auto-fill, off-role penalties, and a live power preview. The Tournament screen shows the current lineup before entry. Older saves automatically field eligible cards until a lineup is edited.

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
- Added Halftime Crisis clutch hero play and tactical timeouts.
- Added interior wallpaper switching and lounge TV morale upgrades.

## Prioritized remaining work

1. Add a richer visual eight-team bracket tree, rival match score simulation, event history, and more distinct discipline-specific match formats. The current bracket persists active/results state but archives only the latest event.
2. Add x10/Max facility purchases and automated training speedups.
3. Complete native Capacitor packaging and AdMob test suites for mobile deployment.
4. Complete prestige UI and trophy benefits; PWA installation/offline service worker.

## Verification

`npm.cmd test -- --run` passes 58 tests covering formulas, store transitions, save compatibility, card development, tournament bracket mechanics, automatic income, portrait allocation, outdoor stations, and house simulation routes and gains. `npm.cmd run build` verifies strict TypeScript compilation and production asset bundling. Mobile viewport checks (~390px) remain a manual verification task.

Suggested browser checks: claim offline rewards through an ad; skip and retry scouting; recruit each genre; resume after boost expiry; reload an unclaimed offline reward; watch five sponsor clips to inspect payouts.

The architecture, design, roadmap, and monetization documents are target plans, not descriptions of completed features. Their engagement percentages and eCPM figures are unverified planning assumptions, not measured project results or validated market benchmarks.
