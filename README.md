# Esports Dynasty: Idle Manager

A modern idle esports tycoon featuring a living 3D headquarters, permanent Californian daylight, player routines and personalities, organization branding, corporate leadership, and high-stakes rival tournaments with global power rankings.

Explore a detailed 3D cutaway esports gaming house with five fully furnished rooms, live PC monitors running FPS gameplay HUDs, gym workouts, strategy VOD reviews, a glass team garage, and a living district across the street. Pro players follow routines and personalities, take outdoor treat runs for an Inspired buff, and build their stats through simulation. The Empire drawer manages a three-tier district (Dynasty Mart → Esports Plaza → Tech Promenade), team fleet, HQ evolution, custom crest and jersey colors, executive staff, seasonal circuit, and vanity items.

The Roster now includes collectible player cards with six visible ratings, age, role, overall rating, and individual potential. Cash card packs cost $750 before GM discounts and disclose Bronze/Silver/Gold/Platinum/Diamond/GOAT odds (45/28/15/7/4/1%). Young Scaling Prodigies can exceed their rarity's usual development ceiling. Training and simulated practice respect individual potential. Duplicate bench cards can be converted into development points and spent on six card attributes below each player's potential.

The Tournament screen uses one persistent eight-team bracket per event, with other rival fixtures, BO3 quarterfinal and semifinal, a BO5 final, ranked opponents, map vetoes, team tactics, individual map scores, and championship prizes. FPS maps use round scores; other disciplines use 1-0 game scores. The accelerated schedule unlocks rounds at entry, 30 seconds, and 60 seconds. Entry fees and prizes vary by discipline. The former scripted/ad-driven match flow is removed; ads cannot force a tournament win.

The Roster lineup manager saves a separate starting team for each discipline. Assign cards to FPS AWPer/Rifler/IGL, MOBA lane roles, BR roles, or the fighting slot; moving a starter to another slot swaps the displaced card. Off-role choices lose eight rating. The live power preview uses only assigned, eligible cards, and both tournament modes use the saved lineup. Existing saves receive an automatic initial lineup until you edit it.

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
