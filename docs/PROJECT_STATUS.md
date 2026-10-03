# Implementation status

Reviewed October 4, 2026.

## Current prototype

Facilities, tapping, persistent economy, instant stat training, genre-specific scouting, simplified best-of-three tournaments, five-second mock ads, offline rewards, sponsor drones, and daily sponsor payouts.

Daily payouts match the Sponsors UI: 1 ad grants 5 Energy Cans; 3 ads grant $5,000 and two extra boost hours; 5 ads grant $50,000. These are prototype values, differing from the strategy document's crates and 4x boost. Payouts are automatic and reset at midnight UTC.

Income retains fractional cash and accounts for partial boost expiry. Hidden tabs pause ticking and calculate catch-up on return. Each offline interval is capped at eight hours; a popup requires at least 15 seconds away and more than $10 earned. Unclaimed rewards persist.

The store is unified, not split into slices. Ads are store-driven; IAdService is only an interface. Existing version-1 saves are retained, with transient ad and drone state discarded during hydration.

## Review fixes

- Fixed missing discipline metadata, fighting-game types, and an unused import blocking builds.
- Fixed fractional income loss, offline boost expiry, ad-dialog stacking, and stale persisted ad state.
- Prevented duplicate ad completion and overlapping requests; implemented daily milestone payouts.
- Added scouting for the selected genre and blocked tournaments without matching players.
- Prevented maxed-training charges and assigned unique recruit IDs.
- Added ignored-drone expiry; opened offers remain available during ads.
- Corrected unsupported UI claims about guaranteed Gold scouting, sponsor badges, and passive partner bonuses.

## Prioritized remaining work

1. Move tournament state and timers into a persistent engine. Matches currently live in a component, can lose visible state on tab navigation, and lack the planned eight-team bracket. Coach ads guarantee victory instead of simulating a 25% stat boost.
2. Add x10/Max facility purchases, lineup selection, timed training, and training speedup ads. Salaries are displayed but not deducted; room-specific effects and passive Hype remain pending.
3. Implement the ad-service factory and mock provider before native integration. Scouting cooldowns and Diamond recruitment remain pending.
4. Reconcile balancing documents: drones currently spawn every 90 seconds, expire after 25 seconds, and pay based on cash holdings. Target designs propose 4–6 minute spawning and income-based payouts.
5. Complete prestige UI and trophy benefits, then Capacitor packaging and native test ads. PWA installation/offline support is also pending.

## Verification

`npm test` covers formulas and store transitions, including daily payouts, skipped/duplicate ads, boost expiry, offline caps and claims, hydration, scouting genres, and maxed training. `npm run build` checks TypeScript and bundles the app. Browser interaction and native-device testing remain manual checks.

Suggested browser checks: claim offline rewards through an ad; skip and retry scouting; recruit each genre; resume after boost expiry; reload an unclaimed offline reward; watch five sponsor clips to inspect payouts.

The architecture, design, roadmap, and monetization documents are target plans, not descriptions of completed features. Their engagement percentages and eCPM figures are unverified planning assumptions, not measured project results or validated market benchmarks.
