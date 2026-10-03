# Roadmap & Agent Task Breakdown: Esports Dynasty Idle Manager

> Target backlog, not a completion checklist. See [implementation status](PROJECT_STATUS.md) for completed features and prioritized next work.

This document provides a modular, step-by-step roadmap designed for **AI coding agents** and developers to pick up tasks autonomously and build the game incrementally with verification checkpoints at every step.

---

## Phase Overview

```
Phase 0: Scaffolding & Tooling 
   ↓
Phase 1: Core Idle Engine, Math Formulas & Zustand State
   ↓
Phase 2: Ad Architecture Abstraction & Interactive Web Mock Ad Player
   ↓
Phase 3: Headquarters / Gaming House Facilities UI & Live Team Room
   ↓
Phase 4: Pro Player Roster, Training System & Scouting Agency
   ↓
Phase 5: Tournament Engine, Auto-Battler Bracket & Coach Ad-Buff
   ↓
Phase 6: Mystery Drone Spawner, Offline 3x Catch-Up & Daily Ad Streak
   ↓
Phase 7: Mobile Capacitor Packaging, Android Build & Native AdMob Setup
```

---

## Detailed Task Breakdown

### Phase 0: Project Scaffolding & Tooling

#### Task 0.1: Initialize Vite + React + TypeScript + Tailwind CSS
- **Target Files:** `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/index.css`
- **Description:** Initialize modern Vite React TypeScript project with Tailwind CSS, Lucide-react icons, and Framer Motion for mobile gaming aesthetics.
- **Acceptance Criteria:**
  - `npm run dev` starts a clean mobile-proportioned UI (e.g. mobile viewport container `max-w-md mx-auto min-h-screen bg-slate-950 text-white`).
  - Tailwind styles and Lucide icons render properly.

#### Task 0.2: Configure Vitest & Testing Environment
- **Target Files:** `vitest.config.ts`, `src/test/setup.ts`
- **Description:** Setup Vitest so all core mathematical scaling functions and state transitions can be automatically tested.
- **Acceptance Criteria:**
  - `npm run test` executes successfully with 100% pass rate.

---

### Phase 1: Core Idle Engine, Math Formulas & Zustand State

#### Task 1.1: Formula Engine (`FormulaService.ts`)
- **Target Files:** `src/core/engine/FormulaService.ts`, `src/core/engine/FormulaService.test.ts`
- **Description:** Implement pure mathematical functions:
  - Upgrade cost scaling: $Cost = BaseCost \times (1.15)^{Level}$
  - Income calculation per room and player stats
  - Offline earnings calculation with time caps
  - Formatted number converter: $1.0\text{K}, 2.5\text{M}, 3.1\text{B}, 4.2\text{T}, 5.0\text{aa}$
- **Acceptance Criteria:**
  - Complete Vitest test suite testing edge cases (0 level, high numbers, 8-hour cap).

#### Task 1.2: Zustand Store Architecture
- **Target Files:** `src/core/store/useGameStore.ts`, `src/core/store/slices/*.ts`
- **Description:** Implement persistent Zustand store with slices:
  - `economySlice`: `cash`, `hype`, `energyCans`, `prestigeTokens`, add/spend actions.
  - `facilitySlice`: room list, upgrade levels, managers.
  - `rosterSlice`: pro player list, current training, active tournament lineup.
  - `adSlice`: active boost expiry timestamps (`boostExpiresAt`), ad watches today, lastDroneSpawn.
- **Acceptance Criteria:**
  - State survives browser reload via `persist` middleware.

#### Task 1.3: Game Tick Engine
- **Target Files:** `src/core/engine/GameTickEngine.ts`
- **Description:** Hook into `requestAnimationFrame` or `setInterval` (1000ms) with delta-time calculation. Updates cash every second based on `(baseIncomePerSec * (isBoostActive ? 2 : 1))`.
- **Acceptance Criteria:**
  - Background tab pauses or resumes without lost earnings.

---

### Phase 2: Ad Architecture Abstraction & Interactive Web Mock

#### Task 2.1: `IAdService` Interface & Factory
- **Target Files:** `src/services/ads/IAdService.ts`, `src/services/ads/AdServiceFactory.ts`
- **Description:** Define standard interface for checking ad availability and requesting rewarded video playback.

#### Task 2.2: Interactive Mock Ad Video Modal
- **Target Files:** `src/components/ads/MockAdModal.tsx`, `src/services/ads/MockAdService.ts`
- **Description:** Build an interactive simulated ad component for browser/development:
  - Displays a 5-second simulated video player with esports sponsor branding (e.g. "HyperX Energy / Apex Gaming Gear").
  - Includes progress countdown (`Reward in 5s... 4s... 3s...`).
  - Simulates successful completion callback or early skip.
- **Acceptance Criteria:**
  - When triggered in browser, modal opens, counts down, closes, and grants the exact in-game reward without errors.

#### Task 2.3: Global 2x Boost HUD Component
- **Target Files:** `src/components/ads/AdBoostBanner.tsx`
- **Description:** Top bar widget showing the Energy Drink icon, active multiplier (`2X ACTIVE`), and remaining countdown timer (`01:54:12`). Tapping prompts the user to watch an ad to extend by +2 hours.
- **Acceptance Criteria:**
  - Tapping opens the ad modal; completion extends time; expires naturally when timer hits 0.

---

### Phase 3: Gaming House Facilities UI & Live Team Room

#### Task 3.1: Facility Room Cards
- **Target Files:** `src/components/facilities/FacilityCard.tsx`, `src/components/facilities/FacilityList.tsx`
- **Description:** Render the gaming house rooms:
  1. *Basement PC Scrim Lab* (Starter room)
  2. *Streaming Pods* (Passive Cash + Hype)
  3. *Fitness & Gym* (Player energy recovery)
  4. *Analyst & Coaching War Room* (Tournament win multiplier)
  5. *Merch Factory* (High cash multiplier)
- **Acceptance Criteria:**
  - Each room shows level, current DPS (Dollars Per Second), cost to upgrade, and "Upgrade x1 / x10 / Max" toggle.

#### Task 3.2: Automatic Team Room (replaces the cash clicker)
- **Target Files:** `src/components/facilities/GamingHouse.tsx`, `HouseScenery.tsx`, `HousePeople.tsx`, `src/core/engine/HouseLayout.ts`, `src/components/roster/PlayerPortrait.tsx`
- **Description:** Isometric cutaway house with five furnished rooms, actual roster characters practicing and walking, and automatic income. Select rooms to unlock/upgrade, select players to inspect stats, and pan/zoom the view. Initial playable version implemented; richer room-specific activities and animation remain future work.
- **Acceptance Criteria:**
  - Stable local portraits survive reloads; existing saves retain progress.
  - No cash-tap action; selecting players never changes currency.
  - Paginate larger rosters and respect reduced-motion preferences.

---

### Phase 4: Pro Player Roster & Training System

#### Task 4.1: Player Roster & Attributes
- **Target Files:** `src/components/roster/PlayerCard.tsx`, `src/types/player.types.ts`
- **Description:** Pro players with:
  - Role: Starter, Sub, Bench.
  - Stats: `Aim` (1-100), `Macro` (1-100), `Comms` (1-100), `Tilt` (1-100).
  - Rarity: Common (Bronze), Rare (Silver), Epic (Gold), Legend (Diamond).
- **Acceptance Criteria:**
  - Player cards display stats, avatars, and current salary.

#### Task 4.2: Talent Scouting Agency (with Rewarded Ad Roll)
- **Target Files:** `src/components/roster/ScoutingAgencyModal.tsx`
- **Description:** Agency where players can recruit talent:
  - Option A: Pay Cash for Standard Scout.
  - Option B: **"Watch Scout Reel" (Rewarded Ad)** for guaranteed Rare+ player scout pull.
- **Acceptance Criteria:**
  - Rewarded ad grants instant gacha pack opening with exciting reveal animation.

---

### Phase 5: Tournament Circuit & Auto-Battler Matches

#### Task 5.1: Tournament Bracket Simulation
- **Target Files:** `src/components/tournaments/TournamentView.tsx`, `src/core/engine/TournamentEngine.ts`
- **Description:** 8-team single elimination bracket. Matches auto-simulate round-by-round based on roster stats + team synergy.
- **Acceptance Criteria:**
  - Clear visual progression through Quarter-finals, Semi-finals, Grand Finals with cash and Hype prizes.

#### Task 5.2: "Tactical Halftime Timeout" Ad Revive Buff
- **Target Files:** `src/components/tournaments/HalftimeBuffModal.tsx`
- **Description:** If team is trailing or loses a game, prompt: "Watch Coach's Halftime Speech to grant +25% stat boost and force Game 3 tiebreaker!"
- **Acceptance Criteria:**
  - Successfully watching ad applies stat multiplier and continues tournament run.

---

### Phase 6: Mystery Drone Spawner & Offline 3x Catch-Up

#### Task 6.1: Floating Sponsor Drone Spawner
- **Target Files:** `src/components/ads/SponsorDrone.tsx`
- **Description:** Randomly every 4–6 minutes, an animated drone flies across the screen. Tapping pauses the drone and opens a mystery sponsor loot prompt (Watch Ad for 15m cash or 10 gems).
- **Acceptance Criteria:**
  - Unobtrusive, smooth CSS/Framer animation; despawns if ignored for 20 seconds.

#### Task 6.2: Offline Earnings Welcome Modal
- **Target Files:** `src/components/ads/OfflineRewardModal.tsx`
- **Description:** Shown when opening the game after being away:
  - Displays total offline duration and calculated base earnings.
  - Button 1: "Collect Standard Earnings ($X)"
  - Button 2 (Prominent Glowing): "**Collect 3X with Sponsor Broadcast ($3X)** [Ad Icon]"
- **Acceptance Criteria:**
  - Choosing ad triggers rewarded video and multiplies earnings by 3x.

---

### Phase 7: Mobile Capacitor Packaging & Native AdMob

#### Task 7.1: Capacitor Android & iOS Initialization
- **Target Files:** `capacitor.config.ts`, `android/`, `ios/`
- **Description:** Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`. Run `npx cap init` and `npx cap add android`.
- **Acceptance Criteria:**
  - `npx cap sync` outputs ready-to-build Android Studio project.

#### Task 7.2: Native AdMob Provider Implementation
- **Target Files:** `src/services/ads/CapacitorAdMobService.ts`
- **Description:** Integrate `@capawesome/capacitor-admob`. Implement `IAdService` with Google's test ad units for rewarded video and UMP consent.
- **Acceptance Criteria:**
  - Tested on native Android build displaying Google test rewarded video.
