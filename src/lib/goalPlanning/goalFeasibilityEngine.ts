import { GoalItem, GoalFeasibilityResult, GoalStatus } from '../../types/goalPlanning';

export class GoalFeasibilityEngine {
  /**
   * Helper to parse target date string into months remaining from reference date (default Sept 2026).
   */
  public static parseMonthsRemaining(targetDateStr: string, referenceDate: Date = new Date(2026, 8, 1)): number {
    if (!targetDateStr) return 12;

    const str = targetDateStr.trim();
    let targetYear = referenceDate.getFullYear();
    let targetMonth = referenceDate.getMonth();

    // Check ISO format YYYY-MM
    if (/^\d{4}-\d{2}$/.test(str)) {
      const parts = str.split('-');
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10) - 1;
    } else {
      // Check Mon YYYY or YYYY e.g. "Dec 2026", "2030", "May 2027"
      const yearMatch = str.match(/\b(20\d\d)\b/);
      if (yearMatch) {
        targetYear = parseInt(yearMatch[1], 10);
      }

      const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };

      const lowerStr = str.toLowerCase();
      for (const [key, val] of Object.entries(monthMap)) {
        if (lowerStr.includes(key)) {
          targetMonth = val;
          break;
        }
      }
    }

    const diffYears = targetYear - referenceDate.getFullYear();
    const diffMonths = targetMonth - referenceDate.getMonth();
    const totalMonths = diffYears * 12 + diffMonths;

    return Math.max(1, totalMonths);
  }

  /**
   * Deterministic calculation for a single goal feasibility.
   */
  public static evaluateGoalFeasibility(
    goal: GoalItem,
    availableCapacity: number = Infinity,
    referenceDate: Date = new Date(2026, 8, 1)
  ): GoalFeasibilityResult {
    const targetAmount = Math.max(0, isNaN(goal.targetAmount) ? 0 : goal.targetAmount);
    const currentAmount = Math.max(0, isNaN(goal.currentAmount) ? 0 : goal.currentAmount);
    const remainingAmount = Math.max(0, targetAmount - currentAmount);
    const monthsRemaining = this.parseMonthsRemaining(goal.targetDate, referenceDate);

    const annualReturnPct = Math.max(0, goal.expectedAnnualReturn ?? 0);
    const inflationPct = Math.max(0, goal.inflationRate ?? 0);

    // 1. Inflation adjustment
    const yearsRemaining = monthsRemaining / 12;
    const inflationFactor = Math.pow(1 + inflationPct / 100, yearsRemaining);
    const inflationAdjustedTarget = Math.round(targetAmount * inflationFactor);
    const adjustedRemainingTarget = Math.max(0, inflationAdjustedTarget - currentAmount);

    // 2. Required monthly contribution calculation
    let requiredMonthly = 0;
    const r = annualReturnPct / 1200; // monthly rate

    if (adjustedRemainingTarget === 0 || currentAmount >= inflationAdjustedTarget) {
      requiredMonthly = 0;
    } else if (r > 0) {
      // FV of current savings over n months
      const fvCurrentSavings = currentAmount * Math.pow(1 + r, monthsRemaining);
      const remainingTargetToFV = Math.max(0, inflationAdjustedTarget - fvCurrentSavings);

      if (remainingTargetToFV <= 0) {
        requiredMonthly = 0;
      } else {
        const factor = (Math.pow(1 + r, monthsRemaining) - 1) / r;
        requiredMonthly = factor > 0 ? remainingTargetToFV / factor : remainingTargetToFV / monthsRemaining;
      }
    } else {
      // Zero return calculation
      requiredMonthly = adjustedRemainingTarget / monthsRemaining;
    }

    requiredMonthly = Math.max(0, Math.round(isNaN(requiredMonthly) ? 0 : requiredMonthly));

    const currentContribution = Math.max(0, isNaN(goal.monthlyContribution) ? 0 : goal.monthlyContribution);
    const fundingGap = Math.max(0, requiredMonthly - currentContribution);

    // 3. Projected completion date calculation based on current monthly contribution
    let projectedMonthsToComplete = monthsRemaining;
    if (remainingAmount <= 0) {
      projectedMonthsToComplete = 0;
    } else if (currentContribution > 0) {
      if (r > 0) {
        // Solve for n: FV = S*(1+r)^n + PMT * ((1+r)^n - 1)/r >= Target
        // Approximation or iterative solve up to 600 months (50 years)
        let fv = currentAmount;
        let m = 0;
        while (fv < targetAmount && m < 600) {
          m++;
          fv = fv * (1 + r) + currentContribution;
        }
        projectedMonthsToComplete = m;
      } else {
        projectedMonthsToComplete = Math.ceil(remainingAmount / currentContribution);
      }
    } else {
      projectedMonthsToComplete = 999; // Never completes without contribution
    }

    const projectedDelayMonths = Math.max(0, projectedMonthsToComplete - monthsRemaining);

    // Format projected completion date
    const projectedDate = new Date(referenceDate);
    projectedDate.setMonth(projectedDate.getMonth() + projectedMonthsToComplete);
    const projectedCompletionDateStr = projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // 4. Feasibility Score (0 to 100)
    let feasibilityScore = 100;
    let status: GoalStatus = 'ON_TRACK';

    if (currentAmount >= targetAmount || remainingAmount === 0) {
      feasibilityScore = 100;
      status = 'COMPLETED';
    } else if (requiredMonthly === 0) {
      feasibilityScore = 100;
      status = 'ON_TRACK';
    } else {
      const ratio = currentContribution / requiredMonthly;
      feasibilityScore = Math.min(100, Math.round(ratio * 100));

      if (feasibilityScore >= 95) {
        status = 'ON_TRACK';
      } else if (feasibilityScore >= 70) {
        status = 'AT_RISK';
      } else if (feasibilityScore >= 30) {
        status = 'CONFLICTED';
      } else {
        status = 'UNACHIEVABLE';
      }
    }

    // Check if capacity restricts feasibility
    const isFeasibleWithCurrentCapacity = currentContribution <= availableCapacity;
    const isFeasibleWithTotalCapacity = requiredMonthly <= availableCapacity;

    if (!isFeasibleWithTotalCapacity && status !== 'COMPLETED') {
      status = requiredMonthly > availableCapacity * 1.5 ? 'UNACHIEVABLE' : 'CONFLICTED';
    }

    return {
      goalId: goal.id,
      goalName: goal.name,
      targetAmount,
      currentAmount,
      remainingAmount,
      monthsRemaining,
      expectedAnnualReturn: annualReturnPct,
      inflationRate: inflationPct,
      inflationAdjustedTarget,
      requiredMonthlyContribution: requiredMonthly,
      currentMonthlyContribution: currentContribution,
      fundingGap,
      projectedCompletionDate: projectedCompletionDateStr,
      projectedDelayMonths,
      feasibilityScore,
      status,
      isFeasibleWithCurrentCapacity,
      isFeasibleWithTotalCapacity
    };
  }

  /**
   * Evaluate all goals together.
   */
  public static evaluateAllGoals(
    goals: GoalItem[],
    availableCapacity: number
  ): GoalFeasibilityResult[] {
    return goals.map((g) => this.evaluateGoalFeasibility(g, availableCapacity));
  }
}
