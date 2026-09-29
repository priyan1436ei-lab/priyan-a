import { GoalItem, GoalConflictItem, ConflictSeverity, GoalFeasibilityResult } from '../../types/goalPlanning';
import { GoalFeasibilityEngine } from './goalFeasibilityEngine';

export class GoalConflictEngine {
  /**
   * Priority weight ordering for ranking conflicts.
   */
  private static PRIORITY_RANK: Record<string, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    OPTIONAL: 1
  };

  /**
   * Analyzes all goals together to detect multi-goal resource, timeline, and priority conflicts.
   */
  public static detectConflicts(
    goals: GoalItem[],
    availableCapacity: number,
    feasibilityResults?: GoalFeasibilityResult[]
  ): {
    totalRequiredContribution: number;
    monthlyShortfall: number;
    hasResourceConflict: boolean;
    conflicts: GoalConflictItem[];
  } {
    const results = feasibilityResults || GoalFeasibilityEngine.evaluateAllGoals(goals, availableCapacity);
    
    // Calculate total required monthly contribution across active goals
    const activeGoals = goals.filter((g) => g.status !== 'COMPLETED');
    const totalRequired = results.reduce((sum, r) => sum + r.requiredMonthlyContribution, 0);
    const monthlyShortfall = Math.max(0, totalRequired - availableCapacity);
    const hasResourceConflict = monthlyShortfall > 0;

    const conflicts: GoalConflictItem[] = [];

    // 1. Overall Resource Capacity Conflict
    if (hasResourceConflict) {
      const topConflictGoal = activeGoals.slice().sort((a, b) => {
        const rankA = this.PRIORITY_RANK[a.priority] || 1;
        const rankB = this.PRIORITY_RANK[b.priority] || 1;
        return rankB - rankA;
      })[0];

      conflicts.push({
        id: `conflict_overall_resource`,
        goalA: topConflictGoal || goals[0],
        goalB: goals[1] || goals[0],
        conflictType: 'RESOURCE_SHORTFALL',
        severity: monthlyShortfall > 15000 ? 'CRITICAL' : monthlyShortfall > 8000 ? 'HIGH' : 'MEDIUM',
        monthlyImpact: monthlyShortfall,
        reason: `Total required monthly goal funding (₹${totalRequired.toLocaleString('en-IN')}) exceeds available monthly capacity (₹${availableCapacity.toLocaleString('en-IN')}) by ₹${monthlyShortfall.toLocaleString('en-IN')}/month.`,
        affectedMonths: 12
      });
    }

    // 2. Pairwise Goal Conflicts (Timeline Overlap, Priority Clash, Hard Deadline Risk)
    for (let i = 0; i < activeGoals.length; i++) {
      for (let j = i + 1; j < activeGoals.length; j++) {
        const goalA = activeGoals[i];
        const goalB = activeGoals[j];

        const resA = results.find((r) => r.goalId === goalA.id);
        const resB = results.find((r) => r.goalId === goalB.id);

        if (!resA || !resB) continue;

        const reqA = resA.requiredMonthlyContribution;
        const reqB = resB.requiredMonthlyContribution;
        const combinedReq = reqA + reqB;

        // Check timeline overlap
        const monthsA = resA.monthsRemaining;
        const monthsB = resB.monthsRemaining;
        const minMonths = Math.min(monthsA, monthsB);

        // A. Combined requirement exceeds capacity during overlapping timeline
        if (combinedReq > availableCapacity && minMonths > 0) {
          const impact = combinedReq - availableCapacity;
          let severity: ConflictSeverity = 'MEDIUM';
          let reason = '';

          const rankA = this.PRIORITY_RANK[goalA.priority] || 1;
          const rankB = this.PRIORITY_RANK[goalB.priority] || 1;

          if ((goalA.priority === 'CRITICAL' || goalB.priority === 'CRITICAL') && impact > 5000) {
            severity = 'CRITICAL';
            reason = `Critical goal "${rankA > rankB ? goalA.name : goalB.name}" competes for finite monthly capacity with "${rankA > rankB ? goalB.name : goalA.name}" over the next ${minMonths} months.`;
          } else if (goalA.hardDeadline && goalB.hardDeadline) {
            severity = 'HIGH';
            reason = `Both "${goalA.name}" and "${goalB.name}" have rigid deadlines and combined monthly demand of ₹${combinedReq.toLocaleString('en-IN')}/mo exceeds capacity.`;
          } else {
            severity = impact > 10000 ? 'HIGH' : 'MEDIUM';
            reason = `Timeline overlap over ${minMonths} months: "${goalA.name}" and "${goalB.name}" require ₹${combinedReq.toLocaleString('en-IN')}/mo total.`;
          }

          conflicts.push({
            id: `conflict_pair_${goalA.id}_${goalB.id}`,
            goalA,
            goalB,
            conflictType: rankA !== rankB ? 'PRIORITY_CLASH' : 'TIMELINE_OVERLAP',
            severity,
            monthlyImpact: impact,
            reason,
            affectedMonths: minMonths
          });
        }

        // B. Priority Clash: Lower priority goal funded while higher priority goal has funding gap
        const gapA = resA.fundingGap;
        const gapB = resB.fundingGap;
        const rankA = this.PRIORITY_RANK[goalA.priority] || 1;
        const rankB = this.PRIORITY_RANK[goalB.priority] || 1;

        if (rankA > rankB && gapA > 0 && goalB.monthlyContribution > 0) {
          conflicts.push({
            id: `conflict_priority_${goalA.id}_${goalB.id}`,
            goalA,
            goalB,
            conflictType: 'PRIORITY_CLASH',
            severity: rankA - rankB >= 2 ? 'HIGH' : 'MEDIUM',
            monthlyImpact: Math.min(gapA, goalB.monthlyContribution),
            reason: `Lower-priority goal "${goalB.name}" (${goalB.priority}) receives ₹${goalB.monthlyContribution.toLocaleString('en-IN')}/mo while higher-priority goal "${goalA.name}" (${goalA.priority}) faces a ₹${gapA.toLocaleString('en-IN')}/mo shortfall.`,
            affectedMonths: monthsA
          });
        }
      }
    }

    // 3. Hard Deadline Risk Check
    activeGoals.forEach((goal) => {
      const res = results.find((r) => r.goalId === goal.id);
      if (goal.hardDeadline && res && res.fundingGap > 0) {
        conflicts.push({
          id: `conflict_hard_deadline_${goal.id}`,
          goalA: goal,
          goalB: goal,
          conflictType: 'HARD_DEADLINE_RISK',
          severity: goal.priority === 'CRITICAL' || goal.priority === 'HIGH' ? 'CRITICAL' : 'HIGH',
          monthlyImpact: res.fundingGap,
          reason: `Goal "${goal.name}" has a hard deadline (${goal.targetDate}) with no flexibility and suffers an unfulfilled monthly funding gap of ₹${res.fundingGap.toLocaleString('en-IN')}.`,
          affectedMonths: res.monthsRemaining
        });
      }
    });

    return {
      totalRequiredContribution: totalRequired,
      monthlyShortfall,
      hasResourceConflict,
      conflicts
    };
  }
}
