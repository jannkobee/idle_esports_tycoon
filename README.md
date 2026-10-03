# Esports Dynasty: Idle Manager

A browser prototype for building an esports organization through idle income, facility upgrades, scouting, training, tournaments, and optional simulated sponsor ads.

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

Current stack: React 18, TypeScript, Vite 5, Tailwind 3, Zustand 4 with localStorage persistence, Lucide, Framer Motion, and Vitest. Capacitor and real AdMob integration are planned; `npx cap sync` is not available yet.

Select a genre in the roster before scouting (All Genres defaults to FPS). VIP mock ads guarantee Silver or better. Income boosts last two hours and stack to eight hours. Offline earnings are capped at eight hours and account for boost expiry. Daily sponsor rewards pay automatically at 1, 3, and 5 completed ads, resetting at midnight UTC.

Saves use the browser's `esports_dynasty_save_v1` localStorage key. Clearing browser storage removes progress. Pending offline claims survive reloads; ad dialogs and callbacks are transient.

## Documentation

- [Implementation status and next steps](docs/PROJECT_STATUS.md)
- [Game design](docs/GAME_DESIGN_DOCUMENT.md)
- [Target technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Rewarded ad strategy](docs/AD_MONETIZATION_STRATEGY.md)
- [Roadmap](docs/ROADMAP_AND_AGENT_TASKS.md)

The design documents describe the target game. Consult implementation status for what currently runs and what remains unfinished.
