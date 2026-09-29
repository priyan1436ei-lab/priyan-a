import { GoalItem, GoalPortfolioSummary } from '../../types/goalPlanning';
import { FinancialCapacityEngine } from './financialCapacityEngine';
import { GoalFeasibilityEngine } from './goalFeasibilityEngine';
import { GoalConflictEngine } from './goalConflictEngine';

export class GoalPortfolioEngine {
  /**
   * Generates a comprehensive household goal portfolio intelligence summary.
   */
  public static evaluatePortfolio(params: {
    goals: GoalItem[];
    monthlyIncome: number;
    essentialExpenses: number;
    totalActiveEMI: number;
    recurringBills: number;
    emergencyAllocation?: number;
  }): GoalPortfolioSummary {
    const capacity = FinancialCapacityEngine.calculateCapacity({
      monthlyIncome: params.monthlyIncome,
      essentialExpenses: params.essentialExpenses,
      totalActiveEMI: params.totalActiveEMI,
      recurringBills: params.recurringBills,
      emergencyAllocation: params.emergencyAllocation
    });

    const feasibilities = GoalFeasibilityEngine.evaluateAllGoals(params.goals, capacity.availableCapacity);
    const conflictsData = GoalConflictEngine.detectConflicts(params.goals, capacity.availableCapacity, feasibilities);

    const totalGoalsCount = params.goals.length;
    const totalTargetValue = params.goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentSavings = params.goals.reduce((sum, g) => sum + g.currentAmount, 0);

    const requiredMonthlyContributions = feasibilities.reduce((sum, f) => sum + f.requiredMonthlyContribution, 0);
    const currentMonthlyContributions = params.goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
    const monthlyShortfall = conflictsData.monthlyShortfall;

    let onTrackCount = 0;
    let atRiskCount = 0;
    let conflictedCount = 0;
    let unachievableCount = 0;
    let completedCount = 0;

    feasibilities.forEach((f) => {
      switch (f.status) {
        case 'ON_TRACK':
          onTrackCount++;
          break;
        case 'AT_RISK':
          atRiskCount++;
          break;
        case 'CONFLICTED':
          conflictedCount++;
          break;
        case 'UNACHIEVABLE':
          unachievableCount++;
          break;
        case 'COMPLETED':
          completedCount++;
          break;
      }
    });

    // Compute overall portfolio feasibility score
    let totalScoreSum = 0;
    feasibilities.forEach((f) => {
      totalScoreSum += f.feasibilityScore;
    });

    let overallFeasibilityScore = totalGoalsCount > 0 ? Math.round(totalScoreSum / totalGoalsCount) : 100;
    if (monthlyShortfall > 0) {
      const penalty = Math.min(40, Math.round((monthlyShortfall / (capacity.availableCapacity || 1)) * 30));
      overallFeasibilityScore = Math.max(10, overallFeasibilityScore - penalty);
    }

    return {
      totalGoalsCount,
      totalTargetValue,
      totalCurrentSavings,
      availableMonthlyCapacity: capacity.availableCapacity,
      requiredMonthlyContributions,
      currentMonthlyContributions,
      monthlyShortfall,
      overallFeasibilityScore,
      onTrackCount,
      atRiskCount,
      conflictedCount,
      unachievableCount,
      completedCount,
      conflicts: conflictsData.conflicts
    };
  }
}
