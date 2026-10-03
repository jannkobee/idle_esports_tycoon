# Technical Architecture Plan: Esports Dynasty Idle Manager

> Target architecture. See [implementation status](PROJECT_STATUS.md) for current behavior and pending features. The offline pseudocode below is illustrative; the implementation integrates boost expiry over time.

## 1. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 / 18 + TypeScript** | Component-based UI, rich ecosystem, type safety for complex game state. |
| **Build & Dev Tooling** | **Vite** | Sub-second HMR, optimized production builds, immediate browser previews for agents & developers. |
| **Mobile Runtime** | **Capacitor 6** | Wraps the web application into native Android (APK) and iOS (IPA) packages without maintaining dual codebases. |
| **Styling & UI** | **Tailwind CSS + Lucide React** | Rapid responsive mobile layout styling, cyber/esports dark theme aesthetic, crisp UI icons. |
| **Animation & Micro-interactions** | **Framer Motion + Canvas-Confetti** | 60 FPS mobile UI animations, floating click numbers, tournament victory celebrations. |
| **State Management** | **Zustand + `persist` middleware** | Lightweight, fast, unopinionated, frictionless serialization to `localStorage` or `IndexedDB`. |
| **Ad Integration** | **Capawesome AdMob Plugin** (`@capawesome/capacitor-admob`) + **Dev Mock Provider** | Standard mobile AdMob support on native, with an interactive web mock modal for local testing. |
| **Testing** | **Vitest** | Fast unit and state testing for mathematical curves, tick engine, and offline calculations. |

---

## 2. System Architecture & Component Diagram

```
+---------------------------------------------------------------------------------+
|                                 React UI Layer                                  |
|  [HUD & Currencies]  [Gaming House View]  [Roster]  [Tournaments]  [Ad Boosts]  |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                            Zustand Global State Store                           |
|  - EconomyStore (Cash, Hype, Gems, Prestige)                                    |
|  - FacilityStore (Rooms, Gear, Upgrades)                                        |
|  - RosterStore (Players, Stats, Scrim assignments)                              |
|  - AdStore (Active multipliers, expiration timestamps, daily ad streak)        |
+----------------------------------------+----------------------------------------+
                     ^                   |
                     |                   v
+--------------------+----+    +--------------------------------------------------+
|    Tick Engine          |    |               Ad Service Abstraction             |
|  - Delta-time loops     |    |              (IAdService Interface)              |
|  - Offline calculation  |    +------------------------+-------------------------+
|  - Active boost expiry  |                             |
+-------------------------+            +----------------+----------------+
                                       |                                 |
                                       v                                 v
                         +---------------------------+   +---------------------------+
                         |     MockAdProvider        |   |    CapacitorAdMobProvider |
                         |   (Web & Local Dev UI)    |   |    (Native iOS & Android) |
                         +---------------------------+   +---------------------------+
```

---

## 3. The Ad Service Abstraction (`IAdService`)

To enable seamless development, testing by AI agents, and production deployment, ad logic is strictly decoupled through an adapter pattern.

### 3.1 Interface Definition (`src/services/ads/IAdService.ts`)
```typescript
export type AdPlacement = 
  | 'boost_2x_income'
  | 'offline_multiplier'
  | 'training_speedup'
  | 'tournament_clutch_buff'
  | 'vip_scout_pull'
  | 'sponsor_drone_drop';

export interface AdRewardResult {
  completed: boolean;
  rewardType: AdPlacement;
  timestamp: number;
}

export interface IAdService {
  initialize(): Promise<void>;
  isAdAvailable(placement: AdPlacement): Promise<boolean>;
  showRewardedVideo(placement: AdPlacement): Promise<AdRewardResult>;
}
```

### 3.2 Mock Ad Provider (for Web, Testing & AI Agents)
- Renders an interactive modal simulating a 5-second video ad with countdown, sponsor branding, and "Claim Reward" callback.
- Enables complete manual and automated end-to-end verification of the rewarded ad loop directly in any web browser without needing an Android emulator or AdMob account.

### 3.3 Native AdMob Provider
- Implements `@capawesome/capacitor-admob`.
- Uses Google's official Test Ad Unit IDs during development:
  - Android Rewarded Test ID: `ca-app-pub-3940256099942544/5224354917`
  - iOS Rewarded Test ID: `ca-app-pub-3940256099942544/1712485313`

---

## 4. Tick Engine & Offline Progress Calculation

### 4.1 Anti-Cheat & Offline Catch-up Logic
Idle income generation must compute offline gains correctly when the user minimizes or quits the game:

```typescript
export function calculateOfflineProgress(
  lastSavedTimestamp: number,
  currentTimestamp: number,
  baseIncomePerSecond: number,
  activeMultipliers: number,
  maxOfflineSeconds: number = 28800 // 8 hours cap
): { offlineSeconds: number; baseEarned: number; boostedEarned: number } {
  const elapsed = Math.max(0, (currentTimestamp - lastSavedTimestamp) / 1000);
  const eligibleSeconds = Math.min(elapsed, maxOfflineSeconds);
  
  const baseEarned = eligibleSeconds * baseIncomePerSecond * activeMultipliers;
  // Rewarded ad offers 3x multiplier on this value
  const boostedEarned = baseEarned * 3;

  return {
    offlineSeconds: eligibleSeconds,
    baseEarned,
    boostedEarned
  };
}
```

---

## 5. File & Folder Structure

```
Game/
├── docs/                               # Comprehensive project documentation
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── AD_MONETIZATION_STRATEGY.md
│   └── ROADMAP_AND_AGENT_TASKS.md
├── src/
│   ├── assets/                         # Sound effects, icons, badges
│   ├── components/
│   │   ├── ads/
│   │   │   ├── AdBoostBanner.tsx       # 2x Energy Drink persistent top bar
│   │   │   ├── MockAdModal.tsx         # Dev interactive simulated ad player
│   │   │   ├── SponsorDrone.tsx        # Floating mystery bonus drone
│   │   │   └── OfflineRewardModal.tsx  # 3x earnings claim prompt
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── CurrencyDisplay.tsx     # Formatted 1.2M, 4.5B
│   │   │   ├── Modal.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── facilities/
│   │   │   ├── FacilityCard.tsx        # PC Scrim Lab, Gym, Streaming Pods
│   │   │   └── FacilityUpgradeList.tsx
│   │   ├── roster/
│   │   │   ├── PlayerCard.tsx          # Aim, Macro, Comms, Tilt ratings
│   │   │   ├── ScoutingModal.tsx       # Ad gacha & cash recruit
│   │   │   └── TrainingPanel.tsx
│   │   ├── tournaments/
│   │   │   ├── MatchSimulator.tsx      # Bracket, round highlights, clutch buff
│   │   │   └── TournamentBracket.tsx
│   │   └── layout/
│   │       ├── BottomNav.tsx           # Facilities | Roster | Tournament | Sponsors | HQ
│   │       └── HeaderHUD.tsx           # Cash, Hype, Gems, 2x Ad Timer
│   ├── core/
│   │   ├── engine/
│   │   │   ├── GameTickEngine.ts       # 1-second interval + delta calculation
│   │   │   ├── OfflineManager.ts
│   │   │   └── FormulaService.ts       # Scaling costs, prestige math
│   │   ├── store/
│   │   │   ├── useGameStore.ts         # Primary unified Zustand store
│   │   │   └── slices/
│   │   │       ├── economySlice.ts
│   │   │       ├── facilitySlice.ts
│   │   │       ├── rosterSlice.ts
│   │   │       └── adSlice.ts
│   │   └── types/
│   │       ├── game.types.ts
│   │       ├── player.types.ts
│   │       ├── facility.types.ts
│   │       └── ad.types.ts
│   ├── services/
│   │   └── ads/
│   │       ├── IAdService.ts
│   │       ├── MockAdService.ts
│   │       ├── CapacitorAdMobService.ts
│   │       └── AdServiceFactory.ts
│   ├── utils/
│   │   ├── formatCurrency.ts           # Compact numbers formatting (K, M, B, T, aa, ab)
│   │   └── soundEffects.ts
│   ├── App.tsx
│   └── main.tsx
├── capacitor.config.ts                 # Native Capacitor configuration
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 6. Implementation Principles for AI Agents
1. **Never Hardcode Native-Only APIs Without Fallbacks:** All calls to native device hardware or ad plugins must flow through `AdServiceFactory` to allow instant web testing.
2. **Deterministic Mathematical Formulas:** Place all cost formulas and multipliers in pure functions in `FormulaService.ts` so they can be unit-tested with Vitest.
3. **Save-Game Resiliency:** State must migrate safely. Use versioned schema in Zustand's `persist` options (`version: 1`, `migrate: ...`).
4. **Optimistic UI with Sound/Haptic Feedback:** Every tap, upgrade, and ad completion must deliver immediate visual/audio satisfaction.
