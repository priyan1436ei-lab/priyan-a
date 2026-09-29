export type GoalPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';

export type GoalStatus = 'ON_TRACK' | 'AT_RISK' | 'CONFLICTED' | 'UNACHIEVABLE' | 'COMPLETED';

export type GoalRiskTolerance = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type GoalEssentiality = 'MANDATORY' | 'IMPORTANT' | 'DISCRETIONARY';

export type ConflictSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GoalItem {
  id: number;
  name: string;
  emoji: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // Format: YYYY-MM or Mon YYYY
  monthlyContribution: number;
  priority: GoalPriority;
  priorityLabel?: string;
  hardDeadline?: boolean;
  deadlineFlexibilityMonths?: number;
  minimumAcceptableAmount?: number;
  expectedAnnualReturn?: number; // Annual % e.g., 8 for 8%
  inflationRate?: number; // Annual % e.g., 6 for 6%
  riskTolerance?: GoalRiskTolerance;
  essentiality?: GoalEssentiality;
  canPause?: boolean;
  canReduceTarget?: boolean;
  status?: GoalStatus;
  requiredMonthlyContribution?: number;
  fundingGap?: number;
  feasibilityScore?: number; // 0 to 100
  conflictLevel?: ConflictSeverity;
  projectedCompletionDate?: string;
  familyMemberOwner?: string;
  isFamilyGoal?: boolean;
}

export interface FinancialCapacityResult {
  monthlyIncome: number;
  essentialExpenses: number;
  totalActiveEMI: number;
  recurringBills: number;
  emergencyAllocation: number;
  availableCapacity: number;
  existingGoalContributions: number;
  remainingGoalCapacity: number;
}

export interface GoalFeasibilityResult {
  goalId: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  monthsRemaining: number;
  expectedAnnualReturn: number;
  inflationRate: number;
  inflationAdjustedTarget: number;
  requiredMonthlyContribution: number;
  currentMonthlyContribution: number;
  fundingGap: number;
  projectedCompletionDate: string;
  projectedDelayMonths: number;
  feasibilityScore: number; // 0-100
  status: GoalStatus;
  isFeasibleWithCurrentCapacity: boolean;
  isFeasibleWithTotalCapacity: boolean;
}

export interface GoalConflictItem {
  id: string;
  goalA: GoalItem;
  goalB: GoalItem;
  conflictType: 'RESOURCE_SHORTFALL' | 'TIMELINE_OVERLAP' | 'PRIORITY_CLASH' | 'HARD_DEADLINE_RISK';
  severity: ConflictSeverity;
  monthlyImpact: number;
  reason: string;
  affectedMonths: number;
}

export interface GoalInterferenceCell {
  goalAId: number;
  goalAName: string;
  goalBId: number;
  goalBName: string;
  conflictLevel: ConflictSeverity;
  monthlyImpact: number;
  timelineOverlapMonths: number;
  reason: string;
  possibleResolution: string;
}

export interface GoalInterferenceMatrixData {
  goals: GoalItem[];
  matrix: GoalInterferenceCell[][];
}

export interface RippleStep {
  stepNumber: number;
  title: string;
  description: string;
  metricChanged?: string;
  fromValue?: string;
  toValue?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface RippleSimulationResult {
  parameterChangedName: string;
  originalValue: string;
  newValue: string;
  before: {
    availableCapacity: number;
    totalRequiredContribution: number;
    shortfall: number;
    goalsStatus: Record<number, GoalStatus>;
    feasibilityScores: Record<number, number>;
    conflictCount: number;
  };
  after: {
    availableCapacity: number;
    totalRequiredContribution: number;
    shortfall: number;
    goalsStatus: Record<number, GoalStatus>;
    feasibilityScores: Record<number, number>;
    conflictCount: number;
  };
  causalChain: RippleStep[];
  newConflictsDetected: string[];
  conflictsResolved: string[];
  recalculatedGoals: GoalFeasibilityResult[];
}

export interface WhatIfParams {
  monthlyIncomeDelta: number;
  monthlyExpenseDelta: number;
  newEmiMonthly: number;
  emergencyBufferMonthly: number;
  goalModifications: Record<number, {
    targetAmount?: number;
    targetDate?: string;
    monthlyContribution?: number;
    priority?: GoalPriority;
    isPaused?: boolean;
  }>;
}

export interface ScenarioAllocation {
  goalId: number;
  goalName: string;
  originalContribution: number;
  recommendedContribution: number;
  newTargetDate: string;
  newTargetAmount: number;
  isPaused: boolean;
  feasibilityScore: number;
  status: GoalStatus;
}

export interface ResolutionScenario {
  id: string;
  name: string;
  description: string;
  type: 'PRESERVE_CRITICAL' | 'EXTEND_DEADLINES' | 'REDUCE_TARGETS' | 'INCREASE_SAVINGS' | 'PAUSE_OPTIONAL' | 'BALANCED_HYBRID';
  monthlyShortfall: number;
  shortfallReduction: number;
  affectedGoalsCount: number;
  tradeOffs: string[];
  benefits: string[];
  allocations: ScenarioAllocation[];
  newPortfolioFeasibilityScore: number;
}

export interface GoalPortfolioSummary {
  totalGoalsCount: number;
  totalTargetValue: number;
  totalCurrentSavings: number;
  availableMonthlyCapacity: number;
  requiredMonthlyContributions: number;
  currentMonthlyContributions: number;
  monthlyShortfall: number;
  overallFeasibilityScore: number;
  onTrackCount: number;
  atRiskCount: number;
  conflictedCount: number;
  unachievableCount: number;
  completedCount: number;
  conflicts: GoalConflictItem[];
}
