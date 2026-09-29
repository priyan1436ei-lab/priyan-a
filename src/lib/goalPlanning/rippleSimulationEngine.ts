import {
  GoalItem,
  RippleSimulationResult,
  RippleStep,
  WhatIfParams,
  GoalStatus
} from '../../types/goalPlanning';
import { FinancialCapacityEngine } from './financialCapacityEngine';
import { GoalFeasibilityEngine } from './goalFeasibilityEngine';
import { GoalConflictEngine } from './goalConflictEngine';

export class RippleSimulationEngine {
  /**
   * Runs a complete ripple effect simulation when a user alters a financial or goal parameter.
   */
  public static simulateRipple(params: {
    goals: GoalItem[];
    monthlyIncome: number;
    essentialExpenses: number;
    totalActiveEMI: number;
    recurringBills: number;
    emergencyAllocation?: number;
    whatIf: WhatIfParams;
  }): RippleSimulationResult {
    // 1. Calculate BEFORE baseline
    const baseCap = FinancialCapacityEngine.calculateCapacity({
      monthlyIncome: params.monthlyIncome,
      essentialExpenses: params.essentialExpenses,
      totalActiveEMI: params.totalActiveEMI,
      recurringBills: params.recurringBills,
      emergencyAllocation: params.emergencyAllocation
    });

    const baseFeasibilities = GoalFeasibilityEngine.evaluateAllGoals(params.goals, baseCap.availableCapacity);
    const baseConflicts = GoalConflictEngine.detectConflicts(params.goals, baseCap.availableCapacity, baseFeasibilities);

    const beforeGoalsStatus: Record<number, GoalStatus> = {};
    const beforeFeasibilityScores: Record<number, number> = {};
    baseFeasibilities.forEach((f) => {
      beforeGoalsStatus[f.goalId] = f.status;
      beforeFeasibilityScores[f.goalId] = f.feasibilityScore;
    });

    // 2. Apply What-If parameters to calculate AFTER state
    const newIncome = Math.max(0, params.monthlyIncome + params.whatIf.monthlyIncomeDelta);
    const newExpenses = Math.max(0, params.essentialExpenses + params.whatIf.monthlyExpenseDelta);
    const newEMI = Math.max(0, params.totalActiveEMI + params.whatIf.newEmiMonthly);
    const newEmergency = Math.max(0, (params.emergencyAllocation ?? 0) + params.whatIf.emergencyBufferMonthly);

    const modifiedGoals: GoalItem[] = params.goals.map((g) => {
      const mod = params.whatIf.goalModifications[g.id];
      if (!mod) return { ...g };

      return {
        ...g,
        targetAmount: mod.targetAmount ?? g.targetAmount,
        targetDate: mod.targetDate ?? g.targetDate,
        monthlyContribution: mod.isPaused ? 0 : (mod.monthlyContribution ?? g.monthlyContribution),
        priority: mod.priority ?? g.priority,
        canPause: mod.isPaused ?? g.canPause
      };
    });

    const afterCap = FinancialCapacityEngine.calculateCapacity({
      monthlyIncome: newIncome,
      essentialExpenses: newExpenses,
      totalActiveEMI: newEMI,
      recurringBills: params.recurringBills,
      emergencyAllocation: newEmergency
    });

    const afterFeasibilities = GoalFeasibilityEngine.evaluateAllGoals(modifiedGoals, afterCap.availableCapacity);
    const afterConflicts = GoalConflictEngine.detectConflicts(modifiedGoals, afterCap.availableCapacity, afterFeasibilities);

    const afterGoalsStatus: Record<number, GoalStatus> = {};
    const afterFeasibilityScores: Record<number, number> = {};
    afterFeasibilities.forEach((f) => {
      afterGoalsStatus[f.goalId] = f.status;
      afterFeasibilityScores[f.goalId] = f.feasibilityScore;
    });

    // 3. Build causal chain steps
    const causalChain: RippleStep[] = [];
    let stepNumber = 1;

    // Parameter Change Description
    let changeName = 'Parameter Modified';
    let origValStr = 'Standard';
    let newValStr = 'Modified';

    if (params.whatIf.monthlyIncomeDelta !== 0) {
      changeName = 'Monthly Household Income';
      origValStr = `₹${params.monthlyIncome.toLocaleString('en-IN')}`;
      newValStr = `₹${newIncome.toLocaleString('en-IN')} (${params.whatIf.monthlyIncomeDelta > 0 ? '+' : ''}₹${params.whatIf.monthlyIncomeDelta.toLocaleString('en-IN')})`;
      causalChain.push({
        stepNumber: stepNumber++,
        title: 'Household Income Change',
        description: `Monthly family income adjusted from ${origValStr} to ${newValStr}.`,
        metricChanged: 'Household Income',
        fromValue: origValStr,
        toValue: newValStr,
        severity: params.whatIf.monthlyIncomeDelta < 0 ? 'WARNING' : 'SUCCESS'
      });
    }

    if (params.whatIf.newEmiMonthly > 0) {
      changeName = 'New Active EMI Introduced';
      origValStr = `₹${params.totalActiveEMI.toLocaleString('en-IN')}`;
      newValStr = `₹${newEMI.toLocaleString('en-IN')} (+₹${params.whatIf.newEmiMonthly.toLocaleString('en-IN')}/mo)`;
      causalChain.push({
        stepNumber: stepNumber++,
        title: 'New EMI Commitment Added',
        description: `New EMI obligation of ₹${params.whatIf.newEmiMonthly.toLocaleString('en-IN')}/month added to monthly fixed commitments.`,
        metricChanged: 'Active EMIs',
        fromValue: origValStr,
        toValue: newValStr,
        severity: 'WARNING'
      });
    }

    // Check modified goal parameters
    Object.entries(params.whatIf.goalModifications).forEach(([idStr, mod]) => {
      const g = params.goals.find((x) => x.id === parseInt(idStr, 10));
      if (!g) return;

      if (mod.targetDate && mod.targetDate !== g.targetDate) {
        changeName = `${g.name} Target Date`;
        origValStr = g.targetDate;
        newValStr = mod.targetDate;
        const resBefore = baseFeasibilities.find((f) => f.goalId === g.id);
        const resAfter = afterFeasibilities.find((f) => f.goalId === g.id);

        const reqBeforeStr = `₹${(resBefore?.requiredMonthlyContribution ?? 0).toLocaleString('en-IN')}/mo`;
        const reqAfterStr = `₹${(resAfter?.requiredMonthlyContribution ?? 0).toLocaleString('en-IN')}/mo`;

        causalChain.push({
          stepNumber: stepNumber++,
          title: `Goal Timeline Shifted: ${g.name}`,
          description: `Target deadline moved from ${g.targetDate} to ${mod.targetDate}. Required monthly funding shifted from ${reqBeforeStr} to ${reqAfterStr}.`,
          metricChanged: `${g.name} Deadline & Requirement`,
          fromValue: `${g.targetDate} (${reqBeforeStr})`,
          toValue: `${mod.targetDate} (${reqAfterStr})`,
          severity: (resAfter?.requiredMonthlyContribution ?? 0) > (resBefore?.requiredMonthlyContribution ?? 0) ? 'WARNING' : 'SUCCESS'
        });
      }

      if (mod.targetAmount && mod.targetAmount !== g.targetAmount) {
        changeName = `${g.name} Target Amount`;
        origValStr = `₹${g.targetAmount.toLocaleString('en-IN')}`;
        newValStr = `₹${mod.targetAmount.toLocaleString('en-IN')}`;
        causalChain.push({
          stepNumber: stepNumber++,
          title: `Goal Target Revised: ${g.name}`,
          description: `Target amount updated from ${origValStr} to ${newValStr}.`,
          metricChanged: `${g.name} Target`,
          fromValue: origValStr,
          toValue: newValStr,
          severity: mod.targetAmount < g.targetAmount ? 'SUCCESS' : 'WARNING'
        });
      }
    });

    // Step: Capacity Consumption Effect
    const capDiff = afterCap.availableCapacity - baseCap.availableCapacity;
    causalChain.push({
      stepNumber: stepNumber++,
      title: 'Financial Capacity Shift',
      description: `Available monthly goal capacity recalculated from ₹${baseCap.availableCapacity.toLocaleString('en-IN')} to ₹${afterCap.availableCapacity.toLocaleString('en-IN')} (${capDiff >= 0 ? '+' : ''}₹${capDiff.toLocaleString('en-IN')}/mo).`,
      metricChanged: 'Available Goal Capacity',
      fromValue: `₹${baseCap.availableCapacity.toLocaleString('en-IN')}`,
      toValue: `₹${afterCap.availableCapacity.toLocaleString('en-IN')}`,
      severity: capDiff < 0 ? 'WARNING' : 'SUCCESS'
    });

    // Step: Cross-Goal Interference & Squeeze
    const affectedOtherGoals: string[] = [];
    afterFeasibilities.forEach((resAfter) => {
      const resBefore = baseFeasibilities.find((b) => b.goalId === resAfter.goalId);
      if (!resBefore) return;

      if (resAfter.status !== resBefore.status) {
        affectedOtherGoals.push(
          `"${resAfter.goalName}" shifted from ${resBefore.status} (${resBefore.feasibilityScore}%) to ${resAfter.status} (${resAfter.feasibilityScore}%)`
        );
      }
    });

    if (affectedOtherGoals.length > 0) {
      causalChain.push({
        stepNumber: stepNumber++,
        title: 'Cross-Goal Ripple Impact',
        description: `Capacity changes cascaded through active household goals: ${affectedOtherGoals.join('; ')}.`,
        metricChanged: 'Goal Feasibility Statuses',
        severity: 'CRITICAL'
      });
    }

    // Step: New Conflicts vs Resolved Conflicts
    const newConflicts: string[] = [];
    const resolvedConflicts: string[] = [];

    afterConflicts.conflicts.forEach((c) => {
      if (!baseConflicts.conflicts.some((bc) => bc.id === c.id)) {
        newConflicts.push(c.reason);
      }
    });

    baseConflicts.conflicts.forEach((bc) => {
      if (!afterConflicts.conflicts.some((c) => c.id === bc.id)) {
        resolvedConflicts.push(bc.reason);
      }
    });

    if (newConflicts.length > 0) {
      causalChain.push({
        stepNumber: stepNumber++,
        title: 'New Conflict Detected',
        description: `Simulation triggered ${newConflicts.length} new conflict(s): ${newConflicts[0]}`,
        severity: 'CRITICAL'
      });
    } else if (resolvedConflicts.length > 0) {
      causalChain.push({
        stepNumber: stepNumber++,
        title: 'Conflict Resolved',
        description: `Simulation successfully resolved resource conflict: ${resolvedConflicts[0]}`,
        severity: 'SUCCESS'
      });
    }

    return {
      parameterChangedName: changeName,
      originalValue: origValStr,
      newValue: newValStr,
      before: {
        availableCapacity: baseCap.availableCapacity,
        totalRequiredContribution: baseConflicts.totalRequiredContribution,
        shortfall: baseConflicts.monthlyShortfall,
        goalsStatus: beforeGoalsStatus,
        feasibilityScores: beforeFeasibilityScores,
        conflictCount: baseConflicts.conflicts.length
      },
      after: {
        availableCapacity: afterCap.availableCapacity,
        totalRequiredContribution: afterConflicts.totalRequiredContribution,
        shortfall: afterConflicts.monthlyShortfall,
        goalsStatus: afterGoalsStatus,
        feasibilityScores: afterFeasibilityScores,
        conflictCount: afterConflicts.conflicts.length
      },
      causalChain,
      newConflictsDetected: newConflicts,
      conflictsResolved: resolvedConflicts,
      recalculatedGoals: afterFeasibilities
    };
  }
}
