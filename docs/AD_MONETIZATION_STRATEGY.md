# Rewarded Ad Monetization Strategy & Player Psychology

> Planning document. See [implementation status](PROJECT_STATUS.md) for current rewards. Engagement and revenue benchmarks below are unverified assumptions. All current ads are simulated and generate no revenue.

## 1. Core Monetization Philosophy

In traditional mobile games, ads are often perceived as disruptive interruptions (e.g., unskippable forced interstitials). In modern top-grossing idle games (*Idle Miner Tycoon*, *Eatventure*, *Egg, Inc.*), **rewarded ads are designed as core gameplay mechanics**—opt-in power-ups that players actively look forward to triggering.

### 1.1 The Golden Rules of Rewarded Ad Design
1. **100% Opt-In:** The player is never forced into an ad. Every video watched is a voluntary decision.
2. **Proportional & Dynamic Rewards:** Never award flat sums (e.g., "$50") that become obsolete 10 minutes later. Rewards must scale with current income per second or current stage level.
3. **Thematic Coherence:** Ads must not feel like alien commercials; they are integrated into the narrative as **"Sponsorship Deals"**, **"Broadcast Rights"**, **"Energy Drinks"**, and **"Scouting Highlight Reels"**.
4. **Immediate Dopamine Payoff:** The moment an ad finishes, the UI must erupt with high-energy audio, confetti/particles, and a visible spike in stats or currency.

---

## 2. Comprehensive Ad Placement Matrix

| # | Placement Name | Thematic Hook | Trigger Location | Reward | Cooldown / Cap |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Energy Surge** | "Gamer Energy Drink Sponsor" | Persistent HUD button (Top right) | **2x Global Income & Training Speed** for 2 hours | Stackable up to 8 hours (4 ads max) |
| **2** | **Broadcast Highlights** | "VOD Streaming Royalties" | App Launch / Resume from Offline ($>10$m) | **Triples (3x) accumulated offline cash** | None (triggered whenever offline screen appears) |
| **3** | **Sponsor Mystery Drone** | "Flying Tech Sponsor Delivery" | Floating animated drone crosses screen | Instant **15–30 minutes of current revenue** OR **5–15 Energy Cans** | Spawns every 4–6 minutes; despawns in 20s |
| **4** | **Tactical Timeout** | "Coach Halftime Pep Talk" | In-Match Tournament Defeat Screen | **+25% All Stats Buff & Free Rematch** | Once per tournament series |
| **5** | **Scout Highlight Reel** | "Talent Agency Showcase" | Scouting Agency Tab | **1 Free Premium Player Scout Roll** (Chance at Gold/Diamond) | 2-hour cooldown (or 3x daily) |
| **6** | **Fast-Track Bootcamp** | "Emergency Scrim Session" | Player Training or Facility Construction | **Instantly skips 30–60 minutes of timer** | 10-minute cooldown |
| **7** | **Sponsor Daily Streak** | "Title Sponsor Milestones" | Daily Quests Modal | Watch 1, 3, and 5 ads daily to claim milestone crates | Resets at 00:00 UTC |

---

## 3. Deep Dive: Placement Mechanics & Player Psychology

### 3.1 Placement 1: The Energy Surge (2x Boost)
- **Player Psychology:** Fear of Missing Out (FOMO). Playing at 1x speed feels inefficient when 2x is readily available with a single tap. Players develop a habit of watching 2–4 ads at the start of their daily session to "charge up the battery" for the entire day.
- **Implementation:**
  - When active, a glowing energy drink icon pulses on screen with a countdown timer (`03:59:42`).
  - Tapping allows the player to add another 2 hours up to an 8-hour maximum.

### 3.2 Placement 2: The Broadcast Highlights (3x Offline Earnings)
- **Player Psychology:** Anchoring and loss aversion. The dialog clearly presents two buttons:
  - Grey standard button: `Claim $1.2M`
  - Big glowing green animated button with video icon: `Claim 3x ($3.6M) with Sponsor Clip`
- **Result:** 70–85% of idle game players choose the 3x rewarded ad button because leaving 2x extra money on the table feels like a net loss.

### 3.3 Placement 3: The Sponsor Mystery Drone
- **Player Psychology:** Variable Ratio Reinforcement (the same psychological mechanism behind lucky drops and slot machines).
- **Behavior:**
  - A small illuminated drone flies diagonally across the gaming house screens with a subtle sound effect.
  - Tapping the drone pauses it and reveals a mystery briefcase.
  - The player watches the ad to open the briefcase for a high-tier prize.

### 3.4 Placement 4: The Tactical Halftime Pep Talk
- **Player Psychology:** Removing frustration at the moment of failure.
- **Scenario:** The player's team is in the Finals of the Challenger League and loses Game 1 or Game 2.
- **The Pitch:** "Don't let the trophy slip away! Watch Coach's tactical breakdown video to grant your squad +25% aim and clutch stats for the deciding match!"
- **Result:** Converts a negative defeat moment into a high-engagement, triumphant ad view.

### 3.5 Placement 7: The Daily Sponsor Streak Meter
- Creates a structured meta-goal for watching ads.
- **Milestones:**
  - 1 Ad: 5 Energy Cans
  - 3 Ads: 15-Minute Hyper Boost (4x income)
  - 5 Ads: Tier-3 "Championship Sponsor Crate" (Guaranteed Epic Player Contract or Gear)
- Encourages players who might otherwise only watch 1 or 2 ads to reach the 5-ad threshold.

---

## 4. Monetization Metrics & eCPM Optimization

### 4.1 Expected Industry Benchmarks (Rewarded Video)
- **Tier 1 (US, UK, CA, AU, DE):** $25.00 – $48.00 eCPM
- **Tier 2 (FR, IT, ES, KR, JP):** $14.00 – $24.00 eCPM
- **Tier 3 (Rest of World):** $3.50 – $9.00 eCPM

### 4.2 ARPDAU Projection Formula
$$\text{ARPDAU} = \frac{\text{Average Impressions per DAU} \times \text{Average eCPM}}{1000}$$
- If an engaged player watches **7 rewarded ads per day** in a Tier 1 market with an average \$32 eCPM:
  $$\text{ARPDAU} = \frac{7 \times 32}{1000} = \$0.224 \text{ per daily active player}$$
- For a modest base of 50,000 DAU, this translates to:
  $$50,000 \times \$0.224 = \$11,200 \text{ / day} \approx \$336,000 \text{ / month}$$
  solely from rewarded video ads without requiring aggressive in-app purchases.

---

## 5. Ad Mediation & Production Technical Setup
- **Primary Mediation:** Google AdMob or AppLovin MAX.
- **Supported Networks:** Google AdMob, Unity Ads, AppLovin, ironSource, Mintegral.
- **Compliance:**
  - Integration of Google User Messaging Platform (UMP) for GDPR / CPRA consent before ad requests.
  - COPPA compliance flags configured in `IAdService.initialize()`.
