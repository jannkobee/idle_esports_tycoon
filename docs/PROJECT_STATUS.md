# Implementation status

Reviewed October 5, 2026.

## Latest pass — all-roster practice rotations

- Every non-inactive pro now gets a live, rendered HQ agent; the former 8/18-player simulation cutoff is removed. When matching practice rigs are occupied, players rotate through available activities and retry their discipline's rigs instead of being omitted.
- Scrim rigs have discipline assignments and visible color accents. Individual coaches set tactic-based practice/VOD/gym routines per discipline; the Empire panel displays each rotation. Players without a discipline coach use the standard routine.
- Added regression coverage for rosters above 18, discipline-matched stations, discipline changes during simulation, and per-discipline coach schedules.
- `npm.cmd test -- --run --maxWorkers=1 --minWorkers=1` passes 102 tests; `npm.cmd run build` succeeds. Vite retains its existing large-chunk warning.

## Current pass — HQ cleanup and equipment evolution

- Removed the duplicate decorative campus buildings. Usable Merch/dining extensions and the level-6 arena connect to the main hall; the garage occupies a separate plot. Core exterior walls and extension walls now participate in navigation. A failed path no longer falls back to walking through walls.
- Sliding door leaves park beside their openings. Real window glazing replaces glass placed over opaque wall slabs. Merch rack/counter overlaps, cafeteria furniture collisions, strategy chairs, studio sofa/table placement, and the gym barbell footprint were corrected. Old outdoor-TV/car-seat stations now describe real garden/promenade activities; players no longer sit on absent props.
- Mobile controls fit at 390px. The scene has reserved space between HUD and inspector, and camera Reset fits the HQ while retaining manual orbit/pan/zoom. Floor switches preserve lateral framing; Reset respects the selected floor. The upper-floor roof now exists, its stair opening is genuinely cut out, and roof-on hides the upper TV label. Pause stops the simulation clock; ordinary idle income remains independent.
- Six bounded equipment model tiers: levels 1/10/25/50/100/250. Both starter and arena PCs change geometry, monitor configuration, tower cooling, chair, finish, and trim. Other facilities gain equipment attachments at these milestones. The inspector names the current/next model and announces milestone upgrades. Level 250 is the **visual** maximum, not a purchase/income cap. No new equipment save fields or gameplay multipliers were introduced.
- Room inspectors now show active versus total station capacity, currently occupied stations, and the next physical milestone. Previews name newly available stations or show the current-to-next equipment model; maxed visual tiers say remaining upgrades increase income only. These are live descriptions of existing room geometry and do not change gameplay or save data.
- Restored pre-existing missing sports-upgrade, catering-selection, and sound-toggle store actions that caused four baseline tests to fail. Missing optional catering/sound fields receive schema-v1 defaults. These hooks do not constitute a complete sports/catering/audio product rollout.
- Automated tests now cover all usable station approaches at each model tier, blocked-path handling, Pause, six distinct PC geometries, bounded desk sizes, and camera limits. See [HQ layout contract](HQ_LAYOUT_CONTRACT.md) before changing geometry.

Known boundaries: upstairs remains a visual inspection floor, not a simulated dorm system. Branches remain investments, not independent city/roster simulations. Real-device touch feel, GPU performance, and verified Android billing remain separate work.

## Latest progression pass — rewards and active sports

- The Empire drawer has a persisted, schema-v1-safe daily Reward Board. Its four objectives are driven by real gameplay actions: training/development, recruiting, completing a tournament match, and claiming HQ Pulse. Each reward can be claimed once and resets on the next UTC day.
- Basketball and football activity stations now use dedicated character animations: basketball cycles a dribble-to-shot motion and football performs a running ball-control drill. They remain visual-only and preserve the existing autonomous simulation rewards.
- Terminal tournament brackets are copied to a persisted Tournament Archive (last 12 events), showing the discipline, finishing round, championship/elimination result, and earned prize after the active bracket is gone.
- The Empire drawer previews the next district, fleet, and HQ outcome before a purchase and gives immediate success feedback for district/fleet upgrades. The oversized front patio/pergola was converted into a small entry garden with a bench, wayfinding sign, and ground lights.
- Facility growth uses connected usable rooms and shared navigation geometry. There is no separate level-3 decorative Pro Scrim building; the usable 12-rig arena opens at level 6.

## Latest visual correction — solid backyard and room doors

- Primary room transitions render open sliding glass-and-metal door models; their leaves do not cross the navigation openings.
- The rear sports area is built on a continuous landscaped base with grass edging, paths, planting beds, brighter finished basketball/turf surfaces, and solid painted field boundaries. It replaces the isolated near-black court and pitch slabs seen in the prior cutaway.

## HQ quality expansion — roof, rewards, multi-title capacity

The current working tree retains the branch network and shop-visit flow, while the HQ now has player-controlled camera/roof options, recurring visible rewards, and scalable multi-game practice capacity. The TypeScript/Vite build succeeds, and the automated suite covers the new reward and capacity rules. The isolated Edge smoke check exercises mobile layouts and model milestones; real-device touch/performance checks remain outstanding.

- Los Angeles, Seoul, and Berlin specialist branches have persisted open/upgrade state, an Empire drawer section, online/offline income, discipline-matched training bonuses, and visible tiered 3D campuses. These are investment campuses, not independent teams or city scenes; there is no per-branch roster yet.
- Dynasty Mart and GG Boba have open-front cutaway interiors. Players on breaks can walk along the marked crosswalk into their interior stations; the boba cafe requires district tier 2. Visits restore energy, develop tilt resistance, and grant a temporary energized buff. Additional NPC shoppers enter the storefronts.
- The camera never automatically frames shops or branches. Free orbit, pan, zoom, and floor-aware Reset remain available; the roof button toggles the selected floor's roof (plus wings on the ground floor) and garage canopy.
- At PC Scrim Lab level 6, a visible Multi-Title Arena Wing adds 12 dedicated rigs to the existing six. All non-inactive roster members are simulated/rendered, regardless of station count. Practice stations are discipline-specific; when matching stations are occupied, pros rotate through available house activities and retry practice instead of being dropped. Each discipline's coach assigns a tactic-based practice/VOD/gym routine.
- HQ Pulse is a repeatable, player-facing reward available every 90 seconds. It pays cash based on active pros and hype plus one Energy Can; every fifth consecutive claim pays three cans. It is persisted and cooldown-gated.
- The verified suite now passes 102 tests and the production build succeeds. Automated tests cover the crosswalk path, district-tier gate, arena stations, HQ Pulse cooldown, daily objective claims, automatic Inspired recovery, World Championship archive, and room expansion summaries/previews, but not visual appearance or touch gestures. Use the isolated Edge smoke check and inspect its screenshots for visual regressions.

This section documents the active, confirmed state of the repository as it is today. Preserve schema-v1 save compatibility when making future live-world changes.

## Current prototype

Facilities, an automatic team room with visible generated players, persistent economy, instant stat training, genre-specific scouting, simplified best-of-three tournaments, five-second mock ads, offline rewards, sponsor drones, daily sponsor payouts, and the Esports Empire & Living World milestone.

## Esports Empire & Living World (implemented)

- Permanent vibrant Californian daylight replaces the player-facing day/night control; the house uses a cerulean sky and long, pale-blue distance fog.
- The 3D exterior now contains an attached glass garage with a distinct Coupe → Sprinter → high-roof Tour Bus fleet, crosswalk, Dynasty Mart, tier-2 park/plaza, tier-3 tech promenade, and fan walkers whose density responds to roster fans. Completed shop and park visits automatically grant Inspired, so recovery is visible and not a player-only menu action.
- The Empire mobile drawer provides district, fleet, and HQ evolution; a staff-designed five-block routine; autonomous player personalities and outdoor sports; 12-crest live branding and jersey colors; a staff recruitment market for coaches, managers, and nutritionists; the Spring → MSI → Summer → Worlds calendar; and a persisted VIP vanity inventory.

- Staff hiring now affects gameplay directly: discipline coaches choose match tactics and ban a map before each round; executive managers provide tiered discount bonuses on purchases and deals; nutritionists apply recovery, endurance, or focus boosts that improve morale, energy, and training efficiency.
- District tiers improve automatic income, sponsor potential, mood recovery, and visible fan density. The World Championship writes a persisted season archive with final rank and championship status, and the Empire drawer shows the current four-stage calendar plus a live ranking slice. All additions use defaults during schema-v1 save hydration.
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

Up to eight actual roster members (18 after the level-6 arena unlock) live and train in the house simultaneously, matched to their portrait appearance and jersey uniforms. Income is credited by the existing economy tick. Pause and camera controls (pan, zoom, reset) remain available; daylight is fixed.

Scouts receive unused appearances until all six are represented, with Diamond and Gold tier recruits granting large fan surges and clutch factor traits. Saves remain backwards compatible with `esports_dynasty_save_v1` without losing progress.

Daily payouts match the Sponsors UI: 1 ad grants 5 Energy Cans; 3 ads grant $5,000 and two extra boost hours; 5 ads grant $50,000. Payouts are automatic and reset at midnight UTC.

Income retains fractional cash and accounts for partial boost expiry. Hidden tabs pause ticking and calculate catch-up on return. Each offline interval is capped at eight hours; a popup requires at least 15 seconds away and more than $10 earned. Unclaimed rewards persist.

The store is unified with Zustand persistence. Ads are store-driven; IAdService is an interface with mock providers.

## Historical review fixes (newer sections supersede retired features)

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

1. Room inspectors now expose active/total stations, occupied stations, and the next physical change. Generic purchase previews and x10/Max purchases remain future work.
2. Improve staff-led rotations for larger multi-discipline rosters; implement upstairs simulation before calling dorms functional.
3. Connect existing daily/HQ rewards to longer-term facility, development, and tournament milestones. Event history already retains 12 completed tournaments.
4. Develop branches into independent teams/city scenes; currently they are investment campuses.
5. Android packaging, device performance/touch tests, AdMob tests, server-verified Google Play billing, prestige UI, and PWA installation/offline support.

## Verification

`npm.cmd test -- --run` passes 99 tests covering formulas, store transitions, HQ Pulse cooldowns, daily objective claims, multi-title arena capacity, branch purchases and income, crosswalk/shop routing, automatic Inspired recovery, season archive persistence, cosmetic ownership and Android billing gating, save compatibility, coach lineup and routine choices, sports autonomy, room/ad funding, card development, tournament brackets, and room station summaries/expansion previews. `npm.cmd run build` verifies strict TypeScript compilation and production bundling. `node scripts/verify-hq.mjs` captures starter/max-tier and floor/roof states at 390×844 and checks portrait/landscape control bounds in isolated Edge. Real-device gestures and performance remain unverified.

Suggested browser checks: claim offline rewards through an ad; skip and retry scouting; recruit each genre; resume after boost expiry; reload an unclaimed offline reward; watch five sponsor clips to inspect payouts.

The architecture, design, roadmap, and monetization documents are target plans, not descriptions of completed features. Their engagement percentages and eCPM figures are unverified planning assumptions, not measured project results or validated market benchmarks.
