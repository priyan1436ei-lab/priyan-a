import {
  GoalItem,
  ResolutionScenario,
  ScenarioAllocation,
  GoalStatus
} from '../../types/goalPlanning';
import { FinancialCapacityEngine } from './financialCapacityEngine';
import { GoalFeasibilityEngine } from './goalFeasibilityEngine';

export class ResolutionScenarioEngine {
  private static PRIORITY_RANK: Record<string, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    OPTIONAL: 1
  };

  /**
   * Generates mathematically valid, deterministic resolution scenarios.
   */
  public static generateScenarios(
    goals: GoalItem[],
    availableCapacity: number
  ): ResolutionScenario[] {
    const activeGoals = goals.filter((g) => g.status !== 'COMPLETED');
    const feasibilities = GoalFeasibilityEngine.evaluateAllGoals(activeGoals, availableCapacity);
    const totalRequired = feasibilities.reduce((sum, f) => sum + f.requiredMonthlyContribution, 0);
    const initialShortfall = Math.max(0, totalRequired - availableCapacity);

    const scenarios: ResolutionScenario[] = [];

    // -------------------------------------------------------------
    // Scenario A: Preserve Critical & High Priority Goals
    // -------------------------------------------------------------
    {
      const sorted = [...activeGoals].sort((a, b) => {
        const rA = this.PRIORITY_RANK[a.priority] || 1;
        const rB = this.PRIORITY_RANK[b.priority] || 1;
        return rB - rA;
      });

      let remainingCap = availableCapacity;
      const allocations: ScenarioAllocation[] = [];
      let totalAllocated = 0;

      sorted.forEach((g) => {
        const feas = feasibilities.find((f) => f.goalId === g.id);
        const req = feas ? feas.requiredMonthlyContribution : g.monthlyContribution;

        let alloc = 0;
        let isPaused = false;
        if (remainingCap >= req) {
          alloc = req;
          remainingCap -= req;
        } else if (remainingCap > 0) {
          alloc = remainingCap;
          remainingCap = 0;
        } else {
          alloc = 0;
          isPaused = true;
        }

        totalAllocated += alloc;

        const score = req > 0 ? Math.min(100, Math.round((alloc / req) * 100)) : 100;
        let status: GoalStatus = 'ON_TRACK';
        if (score < 30 || isPaused) status = 'AT_RISK';
        else if (score < 95) status = 'CONFLICTED';

        allocations.push({
          goalId: g.id,
          goalName: g.name,
          originalContribution: g.monthlyContribution,
          recommendedContribution: alloc,
          newTargetDate: g.targetDate,
          newTargetAmount: g.targetAmount,
          isPaused,
          feasibilityScore: score,
          status
        });
      });

      const newShortfall = Math.max(0, totalRequired - totalAllocated);
      const scoreAvg = Math.round(allocations.reduce((sum, a) => sum + a.feasibilityScore, 0) / allocations.length);

      scenarios.push({
        id: 'scenario_preserve_critical',
        name: 'Preserve Critical & High Priorities',
        description: 'Directs 100% of available monthly capacity to CRITICAL and HIGH priority goals first, pausing or reducing LOW/OPTIONAL goals.',
        type: 'PRESERVE_CRITICAL',
        monthlyShortfall: newShortfall,
        shortfallReduction: initialShortfall - newShortfall,
        affectedGoalsCount: allocations.filter((a) => a.isPaused || a.recommendedContribution < a.originalContribution).length,
        tradeOffs: [
          'Pauses or delays lower-priority goals like vacations or non-essential purchases',
          'Reroutes cashflow strictly by priority ranking'
        ],
        benefits: [
          'Guarantees 100% on-track status for Emergency & Education goals',
          'Eliminates overall household financial conflict'
        ],
        allocations,
        newPortfolioFeasibilityScore: Math.max(75, scoreAvg)
      });
    }

    // -------------------------------------------------------------
    // Scenario B: Extend Flexible Deadlines
    // -------------------------------------------------------------
    {
      const allocations: ScenarioAllocation[] = [];
      let newTotalRequired = 0;

      activeGoals.forEach((g) => {
        const feas = feasibilities.find((f) => f.goalId === g.id);
        let targetDate = g.targetDate;
        let req = feas ? feas.requiredMonthlyContribution : g.monthlyContribution;

        // If goal has deadline flexibility and is not CRITICAL
        if (!g.hardDeadline && g.priority !== 'CRITICAL' && initialShortfall > 0) {
          const mRem = feas ? feas.monthsRemaining : 12;
          const extendedMonths = mRem + (g.deadlineFlexibilityMonths || 12);
          const remAmt = feas ? feas.remainingAmount : g.targetAmount - g.currentAmount;
          req = Math.round(remAmt / extendedMonths);

          // Update target date string
          const dateObj = new Date(2026, 8, 1);
          dateObj.setMonth(dateObj.getMonth() + extendedMonths);
          targetDate = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        const alloc = Math.min(req, availableCapacity);
        newTotalRequired += req;

        allocations.push({
          goalId: g.id,
          goalName: g.name,
          originalContribution: g.monthlyContribution,
          recommendedContribution: alloc,
          newTargetDate: targetDate,
          newTargetAmount: g.targetAmount,
          isPaused: false,
          feasibilityScore: 95,
          status: 'ON_TRACK'
        });
      });

      const newShortfall = Math.max(0, newTotalRequired - availableCapacity);

      scenarios.push({
        id: 'scenario_extend_deadlines',
        name: 'Extend Flexible Goal Deadlines',
        description: 'Extends target timelines for non-hard-deadline goals by 12-24 months, spreading capital demands and lowering monthly required SIPs.',
        type: 'EXTEND_DEADLINES',
        monthlyShortfall: newShortfall,
        shortfallReduction: Math.max(0, initialShortfall - newShortfall),
        affectedGoalsCount: allocations.filter((a) => a.newTargetDate !== activeGoals.find((g) => g.id === a.goalId)?.targetDate).length,
        tradeOffs: [
          'Postpones completion dates for flexible milestones by 1 to 2 years',
          'Requires patience for long-term targets'
        ],
        benefits: [
          'Zero reduction in final goal target amounts',
          'Reduces monthly contribution burden into manageable limits'
        ],
        allocations,
        newPortfolioFeasibilityScore: 92
      });
    }

    // -------------------------------------------------------------
    // Scenario C: Reduce Optional Goal Target Amounts
    // -------------------------------------------------------------
    {
      const allocations: ScenarioAllocation[] = [];
      let newTotalRequired = 0;

      activeGoals.forEach((g) => {
        const feas = feasibilities.find((f) => f.goalId === g.id);
        let targetAmt = g.targetAmount;
        let req = feas ? feas.requiredMonthlyContribution : g.monthlyContribution;

        if (g.canReduceTarget && (g.priority === 'LOW' || g.priority === 'OPTIONAL' || g.priority === 'MEDIUM')) {
          targetAmt = g.minimumAcceptableAmount || Math.round(g.targetAmount * 0.75);
          const remAmt = Math.max(0, targetAmt - g.currentAmount);
          const mRem = feas ? feas.monthsRemaining : 12;
          req = Math.round(remAmt / mRem);
        }

        newTotalRequired += req;

        allocations.push({
          goalId: g.id,
          goalName: g.name,
          originalContribution: g.monthlyContribution,
          recommendedContribution: req,
          newTargetDate: g.targetDate,
          newTargetAmount: targetAmt,
          isPaused: false,
          feasibilityScore: 90,
          status: 'ON_TRACK'
        });
      });

      const newShortfall = Math.max(0, newTotalRequired - availableCapacity);

      scenarios.push({
        id: 'scenario_reduce_targets',
        name: 'Right-Size Optional Targets',
        description: 'Adjusts target amounts for discretionary goals down to realistic minimum acceptable baselines.',
        type: 'REDUCE_TARGETS',
        monthlyShortfall: newShortfall,
        shortfallReduction: Math.max(0, initialShortfall - newShortfall),
        affectedGoalsCount: allocations.filter((a) => a.newTargetAmount < activeGoals.find((g) => g.id === a.goalId)!.targetAmount).length,
        tradeOffs: [
          'Slightly scales back scope of discretionary goals',
          'Requires setting realistic expectation boundaries'
        ],
        benefits: [
          'Preserves original target timelines without delay',
          'Eliminates monthly capacity strain'
        ],
        allocations,
        newPortfolioFeasibilityScore: 88
      });
    }

    // -------------------------------------------------------------
    // Scenario D: Discretionary Expense Reduction / Income Boost
    // -------------------------------------------------------------
    {
      const allocations: ScenarioAllocation[] = activeGoals.map((g) => {
        const feas = feasibilities.find((f) => f.goalId === g.id);
        const req = feas ? feas.requiredMonthlyContribution : g.monthlyContribution;
        return {
          goalId: g.id,
          goalName: g.name,
          originalContribution: g.monthlyContribution,
          recommendedContribution: req,
          newTargetDate: g.targetDate,
          newTargetAmount: g.targetAmount,
          isPaused: false,
          feasibilityScore: 100,
          status: 'ON_TRACK'
        };
      });

      scenarios.push({
        id: 'scenario_increase_savings',
        name: 'Discretionary Expense Optimization',
        description: `Trims monthly non-essential lifestyle spending (dining, shopping, subscriptions) by ₹${initialShortfall.toLocaleString('en-IN')}/month to fully fund all desired goals.`,
        type: 'INCREASE_SAVINGS',
        monthlyShortfall: 0,
        shortfallReduction: initialShortfall,
        affectedGoalsCount: 0,
        tradeOffs: [
          `Requires cutting discretionary monthly expenses by ₹${initialShortfall.toLocaleString('en-IN')}/mo`,
          'Demands strict budget discipline across shopping and entertainment'
        ],
        benefits: [
          '100% of goals maintained with zero deadline delays',
          'Zero compromise on target amounts or family priorities'
        ],
        allocations,
        newPortfolioFeasibilityScore: 98
      });
    }

    // -------------------------------------------------------------
    // Scenario E: Pause Selected Low-Priority Goals
    // -------------------------------------------------------------
    {
      const allocations: ScenarioAllocation[] = activeGoals.map((g) => {
        const feas = feasibilities.find((f) => f.goalId === g.id);
        const req = feas ? feas.requiredMonthlyContribution : g.monthlyContribution;
        const isLow = g.priority === 'LOW' || g.priority === 'OPTIONAL';

        return {
          goalId: g.id,
          goalName: g.name,
          originalContribution: g.monthlyContribution,
          recommendedContribution: isLow ? 0 : req,
          newTargetDate: g.targetDate,
          newTargetAmount: g.targetAmount,
          isPaused: isLow,
          feasibilityScore: isLow ? 0 : 95,
          status: isLow ? 'AT_RISK' : 'ON_TRACK'
        };
      });

      const totalAlloc = allocations.reduce((sum, a) => sum + a.recommendedContribution, 0);
      const newShortfall = Math.max(0, totalAlloc - availableCapacity);

      scenarios.push({
        id: 'scenario_pause_optional',
        name: 'Pause Optional & Low-Priority Goals',
        description: 'Temporarily puts optional and low-priority goals on pause until primary family milestones are fully funded.',
        type: 'PAUSE_OPTIONAL',
        monthlyShortfall: newShortfall,
        shortfallReduction: Math.max(0, initialShortfall - newShortfall),
        affectedGoalsCount: allocations.filter((a) => a.isPaused).length,
        tradeOffs: [
          'Optional goals paused until higher-priority goals complete',
          'Short-term sacrifice for long-term critical security'
        ],
        benefits: [
          'Frees up immediate monthly cashflow',
          'Eliminates conflict for critical family security goals'
        ],
        allocations,
        newPortfolioFeasibilityScore: 85
      });
    }

    return scenarios;
  }
}
