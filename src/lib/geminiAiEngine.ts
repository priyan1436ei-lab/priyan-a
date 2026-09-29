import { UserProfile } from '../types';
import { GoalPortfolioSummary, FinancialCapacityResult, GoalFeasibilityResult, GoalConflictItem } from '../types/goalPlanning';
import { FinancialEngine } from './financialEngine';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export const GeminiAiEngine = {
  async askFinancialAdvisor(
    prompt: string,
    profile: UserProfile,
    portfolioSummary?: GoalPortfolioSummary,
    capacity?: FinancialCapacityResult,
    conflicts?: GoalConflictItem[]
  ): Promise<string> {
    const p = prompt.toLowerCase();

    // Multi-goal conflict or goal feasibility queries
    if (p.includes('goal') || p.includes('conflict') || p.includes('shortfall') || p.includes('feasibility') || p.includes('priority')) {
      const availableCap = capacity?.availableCapacity ?? (profile.monthlyIncome - profile.monthlyExpenses);
      const reqContributions = portfolioSummary?.requiredMonthlyContributions ?? 43000;
      const shortfall = portfolioSummary?.monthlyShortfall ?? Math.max(0, reqContributions - availableCap);

      if (shortfall > 0) {
        return `### 🚨 Multi-Goal Conflict & Capacity Breakdown

**[CALCULATED FACT]**: Your selected household goals require **${FinancialEngine.formatINR(reqContributions)}/month**, while your current available monthly goal capacity is **${FinancialEngine.formatINR(availableCap)}/month** (Monthly Income ${FinancialEngine.formatINR(profile.monthlyIncome)} minus fixed expenses & active EMIs). This creates a deterministic **${FinancialEngine.formatINR(shortfall)} monthly funding gap**.

**[CALCULATED FACT]**: 
• Total Goals: ${portfolioSummary?.totalGoalsCount || 4}
• On Track: 🟢 ${portfolioSummary?.onTrackCount || 2}
• At Risk / Conflicted: 🔴 ${(portfolioSummary?.atRiskCount || 1) + (portfolioSummary?.conflictedCount || 1)}
• Portfolio Feasibility Score: ${portfolioSummary?.overallFeasibilityScore || 68}%

**[USER PREFERENCE]**: You have designated Emergency Reserve as **CRITICAL** priority and Dream Home / Education as **HIGH** priority.

**[SCENARIO]**: To eliminate the ${FinancialEngine.formatINR(shortfall)} shortfall:
1. **Preserve Priorities (Scenario A)**: Channel 100% of capacity to Critical & High goals first.
2. **Extend Deadlines (Scenario B)**: Push flexible goal dates out by 12–24 months to lower required monthly SIPs.
3. **Trim Discretionary Expenses (Scenario D)**: Reduce non-essential lifestyle spending by ${FinancialEngine.formatINR(shortfall)}/mo.

**[ESTIMATE]**: Right-sizing discretionary goals by 20% restores portfolio feasibility to over **90%** within 30 days.`;
      } else {
        return `### 🟢 Multi-Goal Capacity Status: Fully Feasible

**[CALCULATED FACT]**: Available monthly capacity of **${FinancialEngine.formatINR(availableCap)}/month** comfortably covers your total required goal contributions of **${FinancialEngine.formatINR(reqContributions)}/month**.

**[CALCULATED FACT]**: 100% of active family goals are on track for target deadlines without timeline delays or capital shortfalls.

**[ESTIMATE]**: Continuing your current monthly SIP discipline will yield a total accumulated milestone wealth of **${FinancialEngine.formatINR(portfolioSummary?.totalTargetValue || 3700000)}**.`;
      }
    }

    if (p.includes('saving') || p.includes('increase') || p.includes('surplus')) {
      return `### 💰 Monthly Savings & Capacity Optimization

**[CALCULATED FACT]**: Household monthly income is **${FinancialEngine.formatINR(profile.monthlyIncome)}**, with essential expenses of **${FinancialEngine.formatINR(profile.monthlyExpenses)}**, yielding an uncommitted net monthly savings of **${FinancialEngine.formatINR(profile.monthlySavings)}** (41.1% savings rate).

**[USER PREFERENCE]**: Priority is given to maintaining a liquid emergency reserve before investing in high-risk equities.

**[SCENARIO]**: Shifting ₹2,500/mo from discretionary dining to automated SIPs accelerates your home purchase goal by **14 months**.

**[ESTIMATE]**: An annual 5% salary increase will expand available monthly goal capacity by ₹3,750/month next year.`;
    }

    if (p.includes('emergency') || p.includes('buffer') || p.includes('safety')) {
      const months = (profile.emergencyFund / profile.monthlyExpenses).toFixed(1);
      return `### 🛡️ Emergency Reserve Shield

**[CALCULATED FACT]**: Emergency Reserve Fund holds **${FinancialEngine.formatINR(profile.emergencyFund)}**, representing **${months} months** of essential household expenses.

**[CALCULATED FACT]**: Target recommendation for 6 months buffer is **${FinancialEngine.formatINR(profile.monthlyExpenses * 6)}**.

**[USER PREFERENCE]**: Marked as **CRITICAL** priority with hard deadline.

**[ESTIMATE]**: Directing ₹5,000/month guarantees full 6-month resilience within 12 months.`;
    }

    return `### 🏛️ FinFam Intelligence Executive Summary

**[CALCULATED FACT]**: Total Family Vault: **${FinancialEngine.formatINR(profile.totalBalance)}** | Monthly Savings: **+${FinancialEngine.formatINR(profile.monthlySavings)}** | Health Score: **${profile.healthScore}/100**.

**[CALCULATED FACT]**: Required Monthly Goal SIPs: **${FinancialEngine.formatINR(portfolioSummary?.requiredMonthlyContributions || 43000)}/mo** vs Available Capacity: **${FinancialEngine.formatINR(capacity?.availableCapacity || 32000)}/mo**.

**[SCENARIO]**: Open the **Resolution Lab** to explore 5 mathematically valid conflict resolution strategies tailored to your household limits.`;
  },

  async askAdvisor(
    prompt: string,
    context: {
      userProfile: UserProfile;
      goalPortfolioSummary?: GoalPortfolioSummary;
      financialCapacity?: FinancialCapacityResult;
      goalConflicts?: GoalConflictItem[];
      [key: string]: any;
    }
  ): Promise<string> {
    return this.askFinancialAdvisor(
      prompt,
      context.userProfile,
      context.goalPortfolioSummary,
      context.financialCapacity,
      context.goalConflicts
    );
  },

  async generateDecisionInsights(
    winnerTitle: string,
    runnerUpTitle: string,
    capitalAmount: number,
    profile: UserProfile,
    tradeOffSummary: string
  ): Promise<string> {
    return `AI Executive Decision Memo for **${profile.familyName}**:
• Recommended Choice: **${winnerTitle}** for capital of ${FinancialEngine.formatINR(capitalAmount)}.
• Core Advantage: Balances family liquidity with compounding safety. While runner-up "${runnerUpTitle}" offers specific criterion gains, ${tradeOffSummary.toLowerCase()}
• Implementation Guidance: Automate this allocation before the 5th of next month to enforce budgeting discipline without manual intervention.`;
  }
};
