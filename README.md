# Esports Dynasty: Idle Manager

A modern idle esports tycoon featuring a living 3D headquarters, permanent Californian daylight, player routines and personalities, organization branding, corporate leadership, and high-stakes rival tournaments with global power rankings.

**HQ quality update (October 4, 2026):** The camera is entirely player-controlled—there are no automatic shop or branch tours. It has wider orbit, pan, and zoom controls plus a manual roof toggle. The PC Scrim Lab opens a visible 12-rig Multi-Title Arena Wing at level 6, lifting live HQ capacity from 8 to 18 pros and providing stations for FPS, MOBA, battle royale, and fighting games. The HUD also offers a claimable HQ Pulse every 90 seconds, giving cash and Energy Cans, with a larger Energy Can bonus every fifth claim. District tiers visibly unlock Dynasty Mart, the Esports Plaza, then the Tech Promenade; fan visitors scale from total organization fans, and real shop/park visits automatically grant Inspired. World Championships archive season results in a live leaderboard calendar. The current code passes 94 tests and a production build. See [implementation status](docs/PROJECT_STATUS.md).

Explore a detailed 3D cutaway esports gaming house with six earnable rooms, evolving PC equipment with lit displays, gym workouts, strategy VOD reviews, a glass team garage, and a living district across the street. The roster follows staff-designed priorities but can choose breaks, roam outdoors, and play basketball or football. The Empire drawer manages the district, fleet, HQ evolution, branding, staff recruitment, seasonal circuit, and vanity items.

The HQ uses open sliding glass doors with clear walking passages. Exterior walls, room entrances, furniture, and player routes are checked together. The rear sports yard remains a continuous landscaped property with finished courts, paths, planting beds, and perimeter fencing.

The Empire drawer includes a daily Reward Board. Training/development, signing a card, completing a tournament match, and claiming HQ Pulse each advance a visible objective; completed crates can be claimed once per UTC day for cash, hype, and Energy Cans. Basketball players visibly dribble and shoot; football players run a ball-control drill instead of idling at the sports stations.

Finished tournament brackets are retained in a persisted Tournament Archive, recording each event’s discipline, final round, result, and championship prize.

Before investing, the Empire drawer previews the concrete next district, fleet, and HQ unlock. Successful district and fleet purchases show an immediate celebration. The former oversized front patio/pergola has been replaced by a low-profile entry garden, so the HQ exterior remains a coherent arrival space rather than an outdoor living room.

**HQ cleanup and equipment evolution (October 5, 2026):** The house has connected dining and Merch extensions, a level-6 arena, and a separate garage plot—not duplicate decorative rooms. Doors, usable furniture, collision boundaries, and character seats are aligned. The phone HUD wraps into compact rows and the reset camera frames the whole HQ. Pause now stops the house simulation, not just character animations.

Equipment evolves at levels **1, 10, 25, 50, 100, and 250**. PCs change from starter single-screen desks through RGB dual-screen, ultrawide, triple-screen, liquid-cooled panoramic, and gold championship rigs. Other rooms gain tier-specific production, analysis, fitness, retail, or catering equipment. Room inspection shows the current model and next milestone. Level 250 caps visual complexity; later income upgrades do not enlarge models or add infinite objects. This uses existing facility levels and preserves schema-v1 saves. See the [HQ layout contract and verification checklist](docs/HQ_LAYOUT_CONTRACT.md).

The Roster now includes collectible player cards with six visible ratings, age, role, overall rating, and individual potential. Cash card packs cost $750 before GM discounts and disclose Bronze/Silver/Gold/Platinum/Diamond/GOAT odds (45/28/15/7/4/1%). Young Scaling Prodigies can exceed their rarity's usual development ceiling. Training and simulated practice respect individual potential. Duplicate bench cards can be converted into development points and spent on six card attributes below each player's potential.

The Tournament screen uses one persistent eight-team bracket per event, with other rival fixtures, BO3 quarterfinal and semifinal, a BO5 final, ranked opponents, coach-selected map vetoes and tactics, individual map scores, and championship prizes. FPS maps use round scores; other disciplines use 1-0 game scores. The accelerated schedule unlocks rounds at entry, 30 seconds, and 60 seconds. Entry fees and prizes vary by discipline. The former scripted/ad-driven match flow is removed; ads cannot force a tournament win. Generated coaches have distinct discipline styles and tiers; managers specialize in executive roles, while nutritionists specialize in recovery, endurance, or focus. Hiring a replacement changes the corresponding gameplay bonus.

The Roster shows a coach-selected starting team for each discipline. Coaches weigh role fit, card attributes, mood, energy, and their strategy; the player cannot manually assign starters or call match tactics. The player's decisions are recruitment, upgrades, and investing in card potential. Staff design the routine, while players can deviate from it based on needs and interests.

All six rooms start locked on a new save. The organization earns a small baseline income before its first room; rooms open with saved cash and required hype, or through four completed room-funding ads. Skipped ads grant no room progress. Older saves retain previously unlocked rooms; missing new fields receive defaults.

The Empire drawer now includes a cosmetic store with 13 items: Cyberpunk/Carbon/Scandinavian wallpapers, Oak/Marble/Neon hallway finishes, Sandstone/Glass/Carbon facades, and four vanity objects (RGB sign, arcade cabinet, hypercar wrap, gold pedestal). Spend Energy Cans to unlock an item, then equip house finishes; cosmetics have no match or income benefit. The 3D cutaway uses lighter locked-room surfaces and slim front-door/window frames to avoid opaque black patches. Previously selected wallpapers are grandfathered as owned when loading an older save.

Google Play purchase buttons appear only inside an Android host that injects `window.DynastyGooglePlayBilling.purchase(productId)`. Product IDs use `com.dynasty.esports.cosmetic.<item_id>`. The host must verify the Google Play purchase token server-side before returning `{ productId, verified: true }`; the browser app does not contain an Android shell, Play Console products, or a verification backend yet. Until those are supplied, real-money checkout is intentionally unavailable and only Energy Cans can complete purchases. Never grant entitlements from an unverified client callback.

## Development

Requires Node.js 18+ and npm. Run:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

Current stack: React 18, TypeScript, Vite 5, Tailwind 3, React Three Fiber, Three.js, Drei, Zustand 4 with localStorage persistence, Lucide, Framer Motion, and Vitest. Capacitor and real AdMob integration are planned; `npx cap sync` is not available yet.

Select a genre in the roster before scouting (All Genres defaults to FPS). VIP mock ads guarantee Silver or better. Income boosts last two hours and stack to eight hours. Offline earnings are capped at eight hours and account for boost expiry. Daily sponsor rewards pay automatically at 1, 3, and 5 completed ads, resetting at midnight UTC.

Saves use the browser's `esports_dynasty_save_v1` localStorage key. New Empire fields are optional on hydration, so existing schema-v1 saves remain valid. Clearing browser storage removes progress. Pending offline claims survive reloads; ad dialogs and callbacks are transient.

## Documentation

- [Implementation status and next steps](docs/PROJECT_STATUS.md)
- [Game design](docs/GAME_DESIGN_DOCUMENT.md)
- [Target technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Rewarded ad strategy](docs/AD_MONETIZATION_STRATEGY.md)
- [Roadmap](docs/ROADMAP_AND_AGENT_TASKS.md)

The design documents describe the target game. Consult implementation status for what currently runs and what remains unfinished.
