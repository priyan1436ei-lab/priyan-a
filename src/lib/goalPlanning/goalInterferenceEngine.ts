import {
  GoalItem,
  GoalInterferenceMatrixData,
  GoalInterferenceCell,
  ConflictSeverity
} from '../../types/goalPlanning';
import { GoalFeasibilityEngine } from './goalFeasibilityEngine';

export class GoalInterferenceEngine {
  /**
   * Generates N x N cross-goal interference matrix.
   */
  public static generateMatrix(
    goals: GoalItem[],
    availableCapacity: number
  ): GoalInterferenceMatrixData {
    const activeGoals = goals.filter((g) => g.status !== 'COMPLETED');
    const feasibilities = GoalFeasibilityEngine.evaluateAllGoals(activeGoals, availableCapacity);

    const matrix: GoalInterferenceCell[][] = [];

    for (let i = 0; i < activeGoals.length; i++) {
      const row: GoalInterferenceCell[] = [];
      const goalA = activeGoals[i];
      const resA = feasibilities.find((r) => r.goalId === goalA.id);
      const reqA = resA ? resA.requiredMonthlyContribution : goalA.monthlyContribution;
      const monthsA = resA ? resA.monthsRemaining : 12;

      for (let j = 0; j < activeGoals.length; j++) {
        const goalB = activeGoals[j];
        const resB = feasibilities.find((r) => r.goalId === goalB.id);
        const reqB = resB ? resB.requiredMonthlyContribution : goalB.monthlyContribution;
        const monthsB = resB ? resB.monthsRemaining : 12;

        if (i === j) {
          row.push({
            goalAId: goalA.id,
            goalAName: goalA.name,
            goalBId: goalB.id,
            goalBName: goalB.name,
            conflictLevel: 'NONE',
            monthlyImpact: 0,
            timelineOverlapMonths: monthsA,
            reason: `Self reference for ${goalA.name}`,
            possibleResolution: 'N/A'
          });
          continue;
        }

        const combinedReq = reqA + reqB;
        const overlapMonths = Math.min(monthsA, monthsB);
        const monthlyImpact = Math.max(0, combinedReq - availableCapacity);

        let conflictLevel: ConflictSeverity = 'NONE';
        let reason = '';
        let possibleResolution = '';

        if (combinedReq > availableCapacity * 1.25) {
          conflictLevel = 'CRITICAL';
          reason = `Combined demand (₹${combinedReq.toLocaleString('en-IN')}/mo) severely exceeds total capacity (₹${availableCapacity.toLocaleString('en-IN')}/mo) across an overlapping ${overlapMonths}-month window.`;
          possibleResolution = `Extend deadline of flexible goal or reduce target amount by 20-30%.`;
        } else if (combinedReq > availableCapacity) {
          conflictLevel = 'HIGH';
          reason = `Combined demand (₹${combinedReq.toLocaleString('en-IN')}/mo) exceeds household capacity by ₹${monthlyImpact.toLocaleString('en-IN')}/mo.`;
          possibleResolution = `Reallocate monthly contribution based on priority or extend target date.`;
        } else if (combinedReq > availableCapacity * 0.85) {
          conflictLevel = 'MEDIUM';
          reason = `High capacity utilization: "${goalA.name}" and "${goalB.name}" consume ${(combinedReq / availableCapacity * 100).toFixed(0)}% of household capacity.`;
          possibleResolution = `Maintain tight expense discipline to avoid unexpected shortfalls.`;
        } else if (combinedReq > availableCapacity * 0.6) {
          conflictLevel = 'LOW';
          reason = `Moderate timeline overlap. Combined requirement is manageable within budget.`;
          possibleResolution = `Monitor monthly savings buffer.`;
        } else {
          conflictLevel = 'NONE';
          reason = `No significant resource interference between these goals.`;
          possibleResolution = `Both goals remain fully feasible simultaneously.`;
        }

        row.push({
          goalAId: goalA.id,
          goalAName: goalA.name,
          goalBId: goalB.id,
          goalBName: goalB.name,
          conflictLevel,
          monthlyImpact,
          timelineOverlapMonths: overlapMonths,
          reason,
          possibleResolution
        });
      }
      matrix.push(row);
    }

    return {
      goals: activeGoals,
      matrix
    };
  }
}
