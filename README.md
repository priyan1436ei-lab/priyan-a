# 💰 FinFam AI — Multi-Goal Financial Conflict & Ripple Resolution Engine

> **Next-Generation Personal & Family Financial Intelligence Platform**  
> *FinFam does not merely track goals in isolation — it maps cross-goal resource interference, predicts downstream decision cascades, and mathematically resolves financial conflicts on a single shared cashflow runway.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0.0-38bdf8.svg)](https://tailwindcss.com/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Deterministic Engines](https://img.shields.io/badge/Engines-Deterministic%20TypeScript-purple.svg)]()

---

## 📑 Table of Contents

1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Core Innovation: Interference Mapping & Ripple Engine](#-core-innovation-interference-mapping--ripple-engine)
3. [System Architecture & Data Pipeline](#-system-architecture--data-pipeline)
4. [File & Directory Map](#-file--directory-map)
5. [Mathematical Formulations & Algorithmic Engines](#-mathematical-formulations--algorithmic-engines)
6. [Data Models & TypeScript Interfaces](#-data-models--typescript-interfaces)
7. [Key Platform Screens & Visual Components](#-key-platform-screens--visual-components)
8. [Judge Demonstration Walkthrough Script](#-judge-demonstration-walkthrough-script)
9. [Full FinFam Ecosystem Capabilities](#-full-finfam-ecosystem-capabilities)
10. [Deterministic Test Suite & Verification Matrix](#-deterministic-test-suite--verification-matrix)
11. [Tech Stack & Dependencies](#-tech-stack--dependencies)
12. [Getting Started & Local Development](#-getting-started--local-development)
13. [License & Credits](#-license--credits)

---

## 🎯 Executive Summary & Problem Statement

Individuals and families simultaneously juggle multiple high-stakes financial goals:
- 🛡️ **Emergency Reserve Fund** (3–6 months essential living expenses)
- 🏡 **Home Purchase / Down Payment**
- 🎓 **Children's Higher Education Fund**
- 🚗 **Vehicle Purchase**
- 🏖️ **Retirement Corpus**
- ✈️ **Family Vacation & Travel**
- 💍 **Marriage & Major Milestones**
- 💳 **Debt Clearance & Personal Loans**

### The Fatal Flaw in Traditional Financial Apps
Traditional personal finance tools analyze each financial goal in complete isolation using simple linear formulas:
$$\text{Required Monthly} = \frac{\text{Target Amount} - \text{Saved Amount}}{\text{Months Remaining}}$$

In the real world, **income and savings are strictly finite**. When multiple goals compete for the exact same monthly disposable savings pool:
- Goals **interfere** with and cannibalize each other's funding.
- Shifting the deadline of one goal triggers a **downstream ripple effect** that starves concurrent goals.
- When money falls short, standard tools output a useless message: *"Insufficient Funds."*

### The FinFam Solution
FinFam AI places all goals on **ONE shared cashflow runway**. It computes exact pairwise interference scores, visualizes the conflict topology network, models cascading ripple events, and automatically synthesizes **actionable, prioritized resolution scenarios** with clear trade-offs.

---

## ⚡ Core Innovation: Interference Mapping & Ripple Engine

```
                                  ┌───────────────────────┐
                                  │   Emergency Reserve   │
                                  │   (Priority: CRITICAL)│
                                  └───────────┬───────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          ┌───────────────────────┐                       ┌───────────────────────┐
          │   Home Down Payment   │◄───[HIGH Interference]│    Education Fund     │
          │    (Priority: HIGH)   │       (Score: 82/100) │    (Priority: HIGH)   │
          └───────────┬───────────┘                       └───────────┬───────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                  ┌───────────────────────┐
                                  │   Retirement Corpus   │
                                  │   (Priority: MEDIUM)  │
                                  └───────────┬───────────┘
                                              │
                                              ▼
                                  ┌───────────────────────┐
                                  │     Family Vacation   │
                                  │   (Priority: LOW)     │
                                  └───────────────────────┘
```

1. **Goal Interference Mapping**:
   Calculates how much Goal $A$ deprives Goal $B$ of necessary monthly capital based on overlapping timeline horizons, shared capacity demands, priority status, and hard/soft deadline constraints.
2. **Downstream Ripple Simulator**:
   Modifies any financial parameter (e.g. advance Home deadline from 2030 to 2028, incur a ₹1.5L medical emergency, or add an ₹8k car EMI) and traces the sequential cascade across every other goal.
3. **Multi-Scenario Resolution Lab**:
   Synthesizes multiple viable mathematical solutions:
   - **Scenario A**: Stagger flexible deadlines by 6–8 months.
   - **Scenario B**: Calibrate optional targets down to user-defined minimum acceptable amounts.
   - **Scenario C**: Boost monthly savings by trimming discretionary spending.
   - **Scenario D**: Temporarily pause low-priority goals.
   - **Scenario E**: Priority-aware dynamic split rebalancing.

---

## 🏛️ System Architecture & Data Pipeline

```
                       USER FINANCIAL VAULT DATA
             (Monthly Income • Expenses • EMIs • Bills • Balances)
                                   │
                                   ▼
                      [GoalFeasibilityEngine.ts]
      (Calculates Inflation Target, Monthly Compounding, Sinking Fund)
                                   │
                                   ▼
                    [FinancialCapacityEngine.ts]
          (Capacity = Income - Expenses - EMIs - Bills - Reserve)
                                   │
                                   ▼
                 [SharedCashflowTimelineEngine.ts]
               (60-Month Single Unified Cashflow Runway)
                                   │
                                   ▼
                      [GoalConflictEngine.ts]
        (Detects Resource Deficits, Deadline Overlaps, Safety Risks)
                                   │
                                   ▼
                    [GoalInterferenceEngine.ts]
          (Pairwise Contention Matrix & SVG Topology Network)
                                   │
                                   ▼
                    [RippleSimulationEngine.ts]
        (Downstream Event Cascade Tracing & Explainability AI)
                                   │
                                   ▼
                    [RippleResolutionEngine.ts]
     (Synthesizes Scenarios: Stagger, Right-Size, Boost, Pause, Split)
                                   │
                                   ▼
                  [MultiGoalDecisionAdapter.ts]
    (Weighted Decision Optimizer, Trade-Off & Sensitivity Analysis)
                                   │
                                   ▼
                    USER SELECTS & APPLIES PLAN
```

---

## 📁 File & Directory Map

```text
src/
├── types/
│   ├── goalPlanning.ts            # Extended GoalItem, Conflict, Ripple, and Scenario interfaces
│   └── index.ts                   # Core FinFam data types
├── lib/
│   ├── goalPlanning/
│   │   ├── GoalFeasibilityEngine.ts       # Sinking fund annuity & inflation calculations
│   │   ├── FinancialCapacityEngine.ts     # Disposable capacity & runway extraction
│   │   ├── SharedCashflowTimelineEngine.ts# 60-month multi-goal unified runway & EMI roll-off
│   │   ├── GoalConflictEngine.ts          # Deficit, overlap, priority, & safety threat detection
│   │   ├── GoalInterferenceEngine.ts      # Pairwise 0-100 contention matrix & topology
│   │   ├── GoalRiskEngine.ts              # Deterministic risk & feasibility scoring
│   │   ├── GoalForecastEngine.ts          # Multi-goal projection curves for Recharts
│   │   ├── RippleSimulationEngine.ts      # Cascading downstream ripple simulator
│   │   ├── RippleResolutionEngine.ts      # 5 automated resolution scenarios
│   │   ├── MultiGoalDecisionAdapter.ts    # Integration with Decision Optimizer (MCDA/WSM)
│   │   ├── GoalEngineTests.ts             # 8 deterministic automated test suites
│   │   └── index.ts                       # Module barrel export
│   └── decision/                          # Core MCDA Decision Optimizer Engine
├── components/
│   ├── goalPlanning/
│   │   ├── GoalInterferenceGraph.tsx      # Interactive SVG topology network
│   │   ├── GoalConflictHeatmap.tsx        # Month-by-month multi-year conflict calendar
│   │   ├── GoalFeasibilityCard.tsx        # Individual goal health & contribution status
│   │   ├── RippleChain.tsx                # Visual step-by-step downstream ripple sequence
│   │   └── ResolutionScenarioCard.tsx     # Scenario proposal card with trade-offs
│   ├── FinFamBottomNavBar.tsx             # Bottom navigation bar with Multi-Goal shortcut
│   └── Dialogs.tsx                        # AddGoalModal & EditGoalModal with advanced parameters
├── screens/
│   ├── GoalPortfolioDashboardScreen.tsx   # Executive multi-goal portfolio overview
│   ├── GoalInterferenceMapScreen.tsx      # SVG topology graph & pairwise contention matrix
│   ├── GoalTimelineScreen.tsx             # Cashflow simulation & multi-year conflict calendar
│   ├── RippleSimulatorScreen.tsx          # 3-panel interactive what-if cascade simulator
│   ├── ResolutionLabScreen.tsx            # Multi-scenario generator & Decision Optimizer
│   └── GoalsAndBudgetsScreen.tsx          # Upgraded goal cards with feasibility metrics
├── context/
│   └── FinFamContext.tsx                  # Global vault state preloaded with hackathon demo data
└── App.tsx                                # Main routing & screen orchestrator
```

---

## 🧮 Mathematical Formulations & Algorithmic Engines

All calculations in FinFam AI are **strictly deterministic**, implemented in robust, zero-division-safe TypeScript.

### 1. Future-Value Sinking Fund Annuity (`GoalFeasibilityEngine.ts`)

When expected annual return $r_{\text{annual}} > 0$:
$$r_{\text{monthly}} = \frac{r_{\text{annual}}}{12 \times 100}$$

Compound growth on current savings over $n$ remaining months:
$$\text{FV}_{\text{current}} = \text{Current Savings} \times (1 + r_{\text{monthly}})^n$$

Inflation-adjusted target amount:
$$\text{Target}_{\text{inflation}} = \text{Target} \times \left(1 + \frac{\text{Inflation Rate}}{100}\right)^{\frac{n}{12}}$$

Net remaining amount required at maturity:
$$\text{Needed FV} = \max\left(0, \text{Target}_{\text{inflation}} - \text{FV}_{\text{current}}\right)$$

Required monthly contribution ($C$):
$$C = \frac{\text{Needed FV} \times r_{\text{monthly}}}{(1 + r_{\text{monthly}})^n - 1}$$

*(When $r_{\text{annual}} = 0$, $C = \frac{\text{Needed FV}}{n}$)*.

### 2. Available Disposable Capacity (`FinancialCapacityEngine.ts`)

$$\text{Capacity} = \text{Monthly Income} - \text{Essential Expenses} - \sum \text{Active EMIs} - \sum \text{Recurring Bills} - \text{Emergency Buffer Allocation}$$

### 3. Pairwise Goal Interference Index (`GoalInterferenceEngine.ts`)

$$\text{Interference}(A \to B) = w_1 \cdot O_{AB} + w_2 \cdot D_{AB} + w_3 \cdot P_{AB} + w_4 \cdot F_{AB}$$

Where:
- $O_{AB}$: Timeline overlap duration factor $\in [0, 1]$
- $D_{AB}$: Capacity demand ratio $\frac{\text{Required Monthly Saving}_A}{\text{Total Disposable Capacity}} \in [0, 1]$
- $P_{AB}$: Priority contention factor (higher when low-priority goals starve high-priority goals)
- $F_{AB}$: Inflexibility factor (based on hard deadline and lock-in constraints)
- Output normalized to $[0, 100]$.

### 4. Decision Optimizer: Weighted Sum Model (`MultiGoalDecisionAdapter.ts`)

$$\text{Score}(S) = \sum_{k=1}^{5} w_k \cdot R_k(S)$$

| Criterion ($k$) | Description | Weight ($w_k$) |
| :--- | :--- | :---: |
| **Priority Protection** | Guaranteeing Critical (Emergency) & High (Home/Edu) goals | **0.30** |
| **Cashflow Headroom** | Surplus cushion remaining in monthly budget | **0.25** |
| **Completion Rate** | Percentage of active goals completed on schedule | **0.20** |
| **Timeline Stability** | Minimizing total months of deadline delay | **0.15** |
| **Shock Resilience** | Ability to withstand a ₹1.5L unexpected shock | **0.10** |

---

## 📦 Data Models & TypeScript Interfaces

### Extended `GoalItem` ([`src/types/goalPlanning.ts`](file:///c:/Users/priya/OneDrive/Pictures/finfam/src/types/goalPlanning.ts))
```typescript
export interface GoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO format: YYYY-MM-DD
  category: string;
  monthlyContribution?: number;
  priority?: 1 | 2 | 3 | 4 | 5; // 1 = Critical, 2 = High, 3 = Medium, 4 = Low, 5 = Optional
  priorityLabel?: 'critical' | 'high' | 'medium' | 'low' | 'optional';
  goalType?: GoalType;
  hardDeadline?: boolean;
  deadlineFlexibilityMonths?: number;
  minimumAcceptableAmount?: number;
  expectedAnnualReturn?: number; // e.g. 7 for 7%
  inflationRate?: number; // e.g. 6 for 6%
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  essentiality?: 'essential' | 'important' | 'discretionary' | 'luxury';
  canPause?: boolean;
  canReduceTarget?: boolean;
  currentStatus?: 'on_track' | 'at_risk' | 'conflicted' | 'unachievable' | 'completed';
}
```

---

## 🖥️ Key Platform Screens & Visual Components

| Screen / Component | Route / Path | Description |
| :--- | :--- | :--- |
| **`GoalPortfolioDashboardScreen`** | `goal_portfolio` | Command center with total monthly capacity, required savings, shortfall alert, portfolio feasibility score, and quick navigation. |
| **`GoalInterferenceMapScreen`** | `goal_interference` | Interactive SVG topology graph, $N \times N$ pairwise contention matrix, and explainable interference drivers. |
| **`GoalTimelineScreen`** | `goal_timeline` | Month-by-month cashflow simulation, multi-year conflict calendar heatmap, and Recharts multi-goal projection trajectories. |
| **`RippleSimulatorScreen`** | `ripple_simulator` | 3-panel interactive what-if simulator with live parameter controls, before vs. after comparison, and step-by-step visual cascade. |
| **`ResolutionLabScreen`** | `resolution_lab` | Multi-scenario synthesis laboratory with side-by-side comparison matrix, Decision Optimizer ranking, and 1-click plan application. |
| **`GoalsAndBudgetsScreen`** | `goals` | Upgraded goal list with feasibility score bars, shortfall indicators, conflict badges, and edit/top-up controls. |
| **`GoalInterferenceGraph.tsx`** | Component | Custom SVG network visualization with glowing nodes, curved Bezier paths, and interactive inspection drawers. |
| **`GoalConflictHeatmap.tsx`** | Component | Color-coded calendar heatmap (🟢 Surplus, 🟡 Tight, 🔴 Deficit Overload) with clickable month inspection. |
| **`RippleChain.tsx`** | Component | Sequential step-by-step cascade with delta badges and directional metrics. |
| **`ResolutionScenarioCard.tsx`** | Component | Scenario presentation card with protected goals, trade-off bullet points, and why-it-works rationale. |

---

## 🏆 Judge Demonstration Walkthrough Script

FinFam AI comes preloaded with the exact demo scenario requested for hackathon evaluations:

### Initial Vault State
- **Monthly Income**: ₹75,000
- **Essential Living Expenses**: ₹35,000
- **Monthly EMI Commitments**: ₹8,000
- **Available Goal Capacity**: **₹32,000/month**
- **5 Active Goals**:
  1. 🛡️ **Emergency Reserve Fund**: Target ₹3L (Saved ₹1.2L) • Priority: **CRITICAL** • Deadline: Dec 2026
  2. 🏡 **Home Down Payment**: Target ₹12L (Saved ₹2L) • Priority: **HIGH** • Deadline: Jun 2030
  3. 🎓 **Higher Education Fund**: Target ₹20L (Saved ₹3.5L) • Priority: **HIGH** • Deadline: Aug 2028
  4. ✈️ **Japan Family Vacation**: Target ₹2.5L (Saved ₹50k) • Priority: **LOW** • Deadline: Dec 2027
  5. 🏖️ **Retirement Corpus**: Target ₹1.5Cr (Saved ₹8L) • Priority: **MEDIUM** • Deadline: Dec 2045

---

### Step 1: Open Goal Portfolio Dashboard
1. Navigate to **Multi-Goal** (`goal_portfolio`).
2. Observe key metrics:
   - **Monthly Capacity**: ₹32,000/mo
   - **Required Total**: ₹47,000/mo
   - **Active Shortfall**: **-₹15,000/mo**
   - **Portfolio Feasibility**: 68% (Conflicts Active)

---

### Step 2: Explore Interference Topology Map
1. Click **Interference Map** (`goal_interference`).
2. Inspect the interactive SVG network:
   - **Home $\to$ Education**: **HIGH Interference (82/100)** — absorbs ₹6,500/mo during shared overlap.
   - **Home $\to$ Retirement**: **MODERATE Interference (62/100)**.
   - **Vacation $\to$ Education**: **MODERATE Interference (48/100)**.
3. Switch to the **Interference Matrix** tab to see the full pairwise contention grid.

---

### Step 3: Trigger Ripple Simulator
1. Navigate to **Ripple Sim** (`ripple_simulator`).
2. Select **Home Down Payment** and advance target deadline from **Jun 2030 $\to$ Jun 2028** (or click the quick preset button: **"Demo: Home 2030 → 2028"**).
3. Observe the live 3-panel ripple reaction:
   - **Home Required Saving**: Surges from ₹14,000/mo $\to$ ₹29,500/mo ($+\text{₹}15,500\text{/mo}$).
   - **Education Feasibility**: Drops by $24\%$ with an immediate ₹7,200/mo unfunded deficit.
   - **Education Projected Completion**: Delayed by **6 months**.
   - **Downstream Ripple Chain**: 5 sequential ripple events logged step-by-step.
   - **AI Impact Breakdown**: Explains how timeline compression starves lower-priority goals.

---

### Step 4: Open Resolution Lab
1. Navigate to **Resolution Lab** (`resolution_lab`).
2. FinFam automatically presents generated solutions:
   - **Scenario A (Timeline Staggering)**: Delay Vacation by 8 months $\implies$ Emergency and Education protected with ₹0 deficit.
   - **Scenario B (Target Scope Optimization)**: Right-size Vacation target to ₹1.8L $\implies$ Feasibility $+18\%$ on original deadlines.
   - **Scenario C (Discretionary Savings Boost)**: Trim non-essential expenses by ₹4,500/mo $\implies$ 100% of goals achieved on time.
   - **Scenario D (Goal Pausing)**: Pause Vacation for 6 months $\implies$ Redirects ₹4,000/mo to Education.
   - **Scenario E (Priority Split Rebalancing)**: Cascades 100% funding to Critical & High goals first.
3. Switch to the **Side-by-Side Matrix** tab to evaluate trade-offs.
4. Switch to **Decision Optimizer Rank** tab to view the Weighted Sum Model ranking.
5. Click **Apply Plan to Vault** $\implies$ View the confirmation modal and apply the updated schedule to the live financial vault!

---

## 🌟 Full FinFam Ecosystem Capabilities

FinFam AI preserves all existing platform capabilities alongside the new Multi-Goal Engine:

- 🛡️ **Family Cloud Vault**: Real-time family member net worth, salary, freelance, and investment pooling.
- ⚡ **P2P Live Transfer Beam**: Instant encrypted funds and data sync between family members.
- 💳 **RuPay & UPI Mock Payment Gateway**: Integrated subscription checkout with transaction verification.
- 📊 **Spending Trends & Category Caps**: Multi-horizon spending analytics with automated budget alerts.
- 🧮 **Interactive Smart EMI Engine**: Loan prepayment calculator with full month-by-month amortization schedules.
- 🎯 **Radar & 5-Pillar Health Score**: Multi-axis financial health evaluation with periodic simulation mode.
- 🤖 **AI Financial Coach**: Context-aware personal advisory powered by Gemini reasoning.
- ⚖️ **Decision Optimizer AI**: Multi-criteria decision analysis (MCDA) with sensitivity curves and confidence tiers.
- 🧾 **OCR Digital Receipt Scanner**: Simulated receipt digitization and automated expense logging.

---

## 🧪 Deterministic Test Suite & Verification Matrix

FinFam includes a comprehensive automated test suite in [`src/lib/goalPlanning/GoalEngineTests.ts`](file:///c:/Users/priya/OneDrive/Pictures/finfam/src/lib/goalPlanning/GoalEngineTests.ts):

| Test Case | Scenario Description | Expected Mathematical Outcome | Status |
| :--- | :--- | :--- | :---: |
| **Test 1** | Capacity ₹50k, Goal requirement ₹35k | No conflict detected, surplus available (+₹15k/mo) | ✅ **PASS** |
| **Test 2** | Capacity ₹30k, Goal requirement ₹45k | ₹15k deficit detected, priority conflict flagged | ✅ **PASS** |
| **Test 3** | Critical Emergency vs Low Vacation | Emergency goal receives 100% funding priority | ✅ **PASS** |
| **Test 4** | Home deadline moved 2030 $\to$ 2028 | Required saving increases, downstream ripples logged | ✅ **PASS** |
| **Test 5** | Current savings $\ge$ Target amount | Required contribution = 0, status = COMPLETED | ✅ **PASS** |
| **Test 6** | Goal target date in the past | Status = UNACHIEVABLE, zero division safety enforced | ✅ **PASS** |
| **Test 7** | Active EMI completes its tenure | Future monthly capacity increases automatically | ✅ **PASS** |
| **Test 8** | Unexpected ₹1.5L emergency shock | Reserve drawn down, downstream goals recalculated | ✅ **PASS** |

---

## 🛠️ Tech Stack & Dependencies

- **Core Framework**: React 18.3.1
- **Language**: TypeScript 5.7.2
- **Build System**: Vite 6.0.0
- **Styling**: Tailwind CSS v4.0.0 (Dark Navy `#050816` glassmorphism visual identity)
- **Charts & Data Visualization**: Recharts 2.15.0 & Custom Interactive React SVG
- **Icons**: Lucide React
- **State Management**: React Context (`FinFamContext`) with LocalStorage sync

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/priyan1436ei-lab/jaya-hackthon-project.git
cd finfam

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build Validation
```bash
# Run TypeScript typecheck and Vite production build
npm run build
```

---

---

## 👨‍👩‍👧‍👦 Family Workspace, Invitation System, ₹1 Razorpay Gateway & P2P Engine

FinFam has been upgraded with a comprehensive Family Collaboration Hub, Transactional Email Invitation System, Server-Verified ₹1 Razorpay Gateway, and Double-Entry P2P Virtual Wallet.

### 🛡️ 1. Create Family & 4-Member Email Invitation System
- **Create Family Screen**:
  - Family name input with real-time preview card.
  - Optional family photo/emblem.
  - 4 default email invitation fields with dynamic `[+ Add Invitee]` and `[✕ Remove]` controls (no artificial limits).
  - Multi-tier validation: regex format checking, duplicate email rejection, and prevention of inviting the creator's own account.
  - Explicit review summary before final submission.
- **Server-Side Transactional Email Service (`server/emailService.js`)**:
  - Full SMTP integration (`nodemailer`) with fallback to Sandbox Mode (internal outbox and preview modal at `/api/email/inbox`).
  - Branded responsive HTML email templates with FinFam typography, inviter's display name, family name, invitation expiry (7 days), and privacy explanation.
  - Cryptographically secure, single-use, expiring SHA-256 tokens (`crypto.randomBytes(32)`). Only token hashes are stored in the database.
  - Granular per-invitation delivery status (`SENT`, `FAILED` with 1-click `[Retry]` action).
  - Invitations never create active memberships until explicitly accepted.

### 🔐 2. Email-Matching Invitation Verification & Atomic Join Flow
- **Deep-Link & Web Invitation Screen (`/accept-invite`)**:
  - Verifies token validity, expiration, revocation, and prior consumption on page load.
  - **Strict Email Mismatch Guard**: Verifies that the authenticated user's email strictly matches the invitation's intended email. If mismatched, the server rejects with HTTP 403 (`EMAIL_MISMATCH`) and the UI renders an account switcher banner preventing accidental or malicious cross-account joins.
  - Reusing an accepted token returns existing membership idempotently without duplicating records.
  - Single-click `[Accept & Join]` atomically writes the membership record and transitions the invitation to `ACCEPTED`.
- **Role-Based Access Control**:
  - **Owner**: Can invite members, resend/revoke pending invitations, remove members, and transfer ownership.
  - **Member**: Can view shared family finances, goals, bills, and contributions, or voluntarily leave the workspace.
  - Removed members immediately lose access to family records and real-time streams.

### ⚡ 3. Real-Time Synchronization (Server-Sent Events)
- Reactive event pipeline (`/api/family/:familyId/stream`) streaming real-time updates for:
  - New member joins & role changes.
  - Shared financial goals and bills modifications.
  - Member contributions and household ledger events.
  - P2P double-entry wallet transfers without page reloads.

---

### 💳 4. Razorpay ₹1 Premium Upgrade (`paymentgatway-portotype-1` Integration)
FinFam incorporates the payment gateway architecture and Test Mode credentials from [priyan1436ei-lab/paymentgatway-portotype-1](https://github.com/priyan1436ei-lab/paymentgatway-portotype-1.git):

- **Plan Configuration**:
  - **Plan ID**: `finfam_premium_one_time`
  - **Price**: 100 paise = **₹1.00 INR** (One-time purchase, 365 days duration, no automatic renewals).
  - **Protected Features**: Multiple what-if scenarios, comparative resolution plans, export financial reports, and advanced goal timeline views.
  - **Server-Enforced Access**: Protected operations (e.g. `/api/premium/export-report`) verify active subscription on the backend before serving data.
- **Entitlement Isolation**:
  - The entitlement is strictly bound to the authenticated purchaser's account (`userId`). Family members remain on the Free tier unless they purchase their own upgrade.
- **Razorpay Checkout & Signature Verification**:
  - Official Razorpay SDK modal integration (`checkout.js`) with key `rzp_test_TNKQHoOkeQFUas`.
  - Server-side timing-safe HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) on `razorpay_order_id|razorpay_payment_id`.
  - Developer Test Simulator signature fallback (`sim_sig_valid_...`) for reliable local sandbox verification.
  - Idempotent raw-body webhook handler (`/api/payment/webhook`) with replay attack protection.
  - Purchase recovery endpoint (`/api/payment/user-status/:userId`) ensuring verified status persists across sessions and devices.
- **Printable GST Tax Receipts (`server/server.js`)**:
  - Formatted, GST-compliant printable HTML receipt endpoint (`/api/payment/receipt/:paymentId?print=1`) with customer details, order identifiers, 18% GST calculation, and auto-print trigger.

---

### 🏦 5. Family Money Transfers vs Merchant Bank Settlement
- **Clear Regulatory Boundary**:
  - Razorpay merchant checkout cannot be used for arbitrary P2P personal payouts between individuals.
  - Personal money transfers require a dedicated banking switch or UPI DeepLink provider (such as Decentro, Cashfree Payouts, or Setu).
  - If a banking switch is not connected, the UI explicitly displays **"Bank transfers not connected"**.
- **Virtual Demo Wallets & Atomic Double-Entry Ledger**:
  - Integrated from the prototype's `p2p/ledger.ts`:
  - Each account receives a virtual demo wallet balance (default ₹10,000 for Priyanshu, ₹5,000 for other family members).
  - Atomic transfer engine (`POST /api/p2p/transfer`) with balance sufficiency check, `senderBalance -₹X`, `receiverBalance +₹X`, idempotency key protection (`idempotencyKey`), and real-time SSE broadcasts.
- **Merchant Settlement Note for Owner UPI (`priyan1436ei@okhdfcbank`)**:
  - The provided UPI ID `priyan1436ei@okhdfcbank` is treated as an owner reference address.
  - In Razorpay, merchant funds settle exclusively to the **verified bank account** configured inside the Razorpay Merchant Dashboard (`Settings -> Bank Account`), NOT automatically to an arbitrary UPI address string.
  - To link your bank account for live settlement: Log into Razorpay Dashboard -> Go to Settings -> Bank Details -> Complete Penny Drop Verification.

---

### 🧪 6. Automated Acceptance Test Results (22/22 Passed)

All primary requirements have been verified via `node server/tests/acceptance.test.js`:

| # | Test Assertion | Requirement Category | Status |
|---|----------------|----------------------|:------:|
| 1 | Rejects invalid email formats | Email Validation | ✅ PASS |
| 2 | Rejects duplicate invitation emails | Email Validation | ✅ PASS |
| 3 | Rejects inviting creator's own email | Family Rules | ✅ PASS |
| 4 | Creates family & dispatches 4 email invitations | Family Creation | ✅ PASS |
| 5 | Sent emails recorded in outbox with branding | Transactional Email | ✅ PASS |
| 6 | Cryptographic token verification & preview | Token Security | ✅ PASS |
| 7 | Rejects acceptance when signed into wrong email | Email Mismatch Guard | ✅ PASS |
| 8 | Accepts invitation and joins family atomically | Atomic Join | ✅ PASS |
| 9 | Rejects reusing already accepted token | Token Replay Protection | ✅ PASS |
| 10 | Owner can revoke pending invitation | Role Permissions | ✅ PASS |
| 11 | Removed member loses access to family records | Access Control | ✅ PASS |
| 12 | ₹1 order created with exactly 100 paise | ₹1 Plan Checkout | ✅ PASS |
| 13 | Rejects invalid/tampered cryptographic signature | Signature Security | ✅ PASS |
| 14 | Verifies HMAC-SHA256 signature & activates Premium | Server Verification | ✅ PASS |
| 15 | Entitlement strictly isolated to purchaser | Entitlement Isolation | ✅ PASS |
| 16 | Protected operation succeeds for Premium, rejected for Free | Protected Backend | ✅ PASS |
| 17 | Prevents cross-account payment ID reuse | Payment Fraud Prevention | ✅ PASS |
| 18 | Idempotent webhook processing & duplicate prevention | Webhook Resilience | ✅ PASS |
| 19 | Clearly reports "Bank transfers not connected" for P2P | Regulatory Accuracy | ✅ PASS |
| 20 | Gateway config endpoint provides active Razorpay test keyId | Gateway Configuration | ✅ PASS |
| 21 | Atomic double-entry ledger debits sender & credits receiver | P2P Ledger Engine | ✅ PASS |
| 22 | Serves GST-compliant printable HTML receipt with print hook | Printable Receipts | ✅ PASS |

---

### 📱 7. Android Development Build & APK Instructions

To package FinFam for Android using Capacitor or Cordova:

1. **Install Capacitor CLI & Android Platform**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "FinFam" "cloud.finfam.app" --web-dir dist
   ```

2. **Build Production Web Bundle**:
   ```bash
   npm run build
   npx cap add android
   npx cap copy
   ```

3. **Configure Android Deep Links (`AndroidManifest.xml`)**:
   Add the verified intent filter for invitation links under `<activity android:name=".MainActivity">`:
   ```xml
   <intent-filter android:autoVerify="true">
       <action android:name="android.intent.action.VIEW" />
       <category android:name="android.intent.category.DEFAULT" />
       <category android:name="android.intent.category.BROWSABLE" />
       <data android:scheme="https" android:host="finfam.cloud" android:pathPrefix="/accept-invite" />
       <data android:scheme="finfam" android:host="invite" />
   </intent-filter>
   ```

4. **Compile Debug APK via Android Studio or CLI**:
   ```bash
   # Open in Android Studio
   npx cap open android
   
   # Or build debug APK directly via Gradle
   cd android && ./gradlew assembleDebug
   # Output APK located at: android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

### 📋 8. External Configuration Checklist

To transition from Sandbox/Test Mode to Live Production:

- [ ] **Razorpay Live API Keys**: Replace `rzp_test_...` with `rzp_live_...` in environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- [ ] **Razorpay Live Webhooks**: In Razorpay Dashboard -> Webhooks -> Add `https://<your-domain>/api/payment/webhook`, subscribe to `payment.captured`, and copy Secret to `RAZORPAY_WEBHOOK_SECRET`.
- [ ] **Merchant Bank Account**: In Razorpay Dashboard -> Settings -> Bank Account, complete KYC and Penny Drop verification to receive daily/T+2 settlements for ₹1 payments.
- [ ] **Live SMTP Email Provider**: Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` (e.g. Amazon SES, SendGrid, Resend, or Google Workspace App Password) in `.env`.
- [ ] **P2P Banking Switch (Optional)**: If enabling real-time bank transfers between family members, register with an authorized partner (e.g. Decentro, Setu UPI DeepLinks, Cashfree Payouts) and set `ENABLE_P2P_BANKING_SWITCH=true`.

---

## 📜 License & Credits

Developed for hackathons, financial engineering research, and multi-goal conflict modeling.

**FinFam AI — Understand the Competition. Master the Ripples. Achieve Every Goal.** 💰✨

# vercel-deploye-
# sumaoru
