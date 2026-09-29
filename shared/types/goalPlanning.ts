export type GoalPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'OPTIONAL';

export type GoalStatus = 'ON_TRACK' | 'AT_RISK' | 'CONFLICTED' | 'UNACHIEVABLE' | 'COMPLETED';

export type GoalRiskTolerance = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type GoalEssentiality = 'MANDATORY' | 'IMPORTANT' | 'DISCRETIONARY';

export type ConflictSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GoalItem {
  id: any;
  name: string;
  emoji?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  targetYear?: any;
  currentMonthlySip?: any;
  monthlyContribution?: number;
  priority: any;
  priorityLabel?: string;
  hardDeadline?: boolean;
  deadlineFlexibilityMonths?: number;
  minimumAcceptableAmount?: number;
  expectedAnnualReturn?: number;
  expectedReturnRate?: number;
  inflationRate?: number;
  riskTolerance?: GoalRiskTolerance;
  essentiality?: GoalEssentiality;
  canPause?: boolean;
  canReduceTarget?: boolean;
  status?: GoalStatus;
  requiredMonthlyContribution?: number;
  fundingGap?: number;
  feasibilityScore?: number;
  conflictLevel?: ConflictSeverity;
  projectedCompletionDate?: string;
  familyMemberOwner?: string;
  isFamilyGoal?: boolean;
}

export type FinancialGoal = GoalItem;

export interface FinancialCapacityResult {
  monthlyIncome: number;
  essentialExpenses: number;
  totalActiveEMI: number;
  recurringBills?: number;
  emergencyAllocation?: number;
  availableCapacity: number;
  existingGoalContributions?: number;
  remainingGoalCapacity?: number;
  dtiRatio?: number;
  discretionarySurplus?: number;
}

export interface GoalFeasibilityResult {
  goalId: any;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount?: number;
  monthsRemaining?: number;
  expectedAnnualReturn?: number;
  inflationRate?: number;
  inflationAdjustedTarget: number;
  requiredMonthlyContribution?: number;
  requiredSip?: number;
  currentMonthlyContribution?: number;
  fundingGap?: number;
  sipGap?: number;
  projectedCompletionDate?: string;
  projectedDelayMonths?: number;
  feasibilityScore: number;
  status?: GoalStatus;
  isFeasibleWithCurrentCapacity?: boolean;
  isFeasibleWithTotalCapacity?: boolean;
  recommendations?: string[];
}

export interface GoalConflictItem {
  id?: string;
  goalA?: GoalItem;
  goalB?: GoalItem;
  goal1Id?: string;
  goal1Name?: string;
  goal2Id?: string;
  goal2Name?: string;
  overlapYear?: number;
  deficitAmount?: number;
  conflictType?: 'RESOURCE_SHORTFALL' | 'TIMELINE_OVERLAP' | 'PRIORITY_CLASH' | 'HARD_DEADLINE_RISK';
  severity: any;
  monthlyImpact?: number;
  reason?: string;
  affectedMonths?: number;
  suggestedResolution?: {
    delayYears: number;
    additionalSip: number;
  };
}

export type GoalConflict = GoalConflictItem;

export interface GoalInterferenceCell {
  goalAId?: any;
  goalAName?: string;
  goal1Id?: any;
  goalBId?: any;
  goal2Id?: any;
  goalBName?: string;
  conflictLevel?: ConflictSeverity;
  interferenceScore?: number;
  impactType?: string;
  explanation?: string;
  monthlyImpact?: number;
  timelineOverlapMonths?: number;
  reason?: string;
  possibleResolution?: string;
}

export interface GoalInterferenceMatrixData {
  goals: GoalItem[];
  matrix: GoalInterferenceCell[][];
}

export interface RippleStep {
  stepNumber?: number;
  affectedGoalId?: string;
  affectedGoalName?: string;
  causalFactor?: string;
  feasibilityImpact?: number;
  forcedDelayYears?: number;
  additionalDeficit?: number;
  title?: string;
  description?: string;
  metricChanged?: string;
  fromValue?: string;
  toValue?: string;
  severity: any;
}

export type RippleEffect = RippleStep;

export interface RippleSimulationResult {
  parameterChangedName: string;
  originalValue: string;
  newValue: string;
  causalChain: RippleStep[];
}

export interface GoalResolutionPlan {
  id: string;
  strategyName: string;
  description: string;
  projectedFeasibility: number;
  totalAdditionalSip: number;
  maxDelayYears: number;
  goalAdjustments?: any[];
}

export interface MultiGoalFeasibilityReport {
  overallFeasibilityScore: number;
  goalAnalysis: GoalFeasibilityResult[];
  conflicts: GoalConflictItem[];
  downstreamRipples: RippleStep[];
}

export interface WhatIfParams {
  monthlyIncomeDelta?: number;
  monthlyExpenseDelta?: number;
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
  totalGoalsCount?: number;
  totalTargetValue?: number;
  totalTargetCapital?: number;
  totalCurrentSavings?: number;
  availableMonthlyCapacity?: number;
  requiredMonthlyContributions?: number;
  recommendedTotalSip?: number;
  currentMonthlyContributions?: number;
  monthlyShortfall?: number;
  overallFeasibilityScore?: number;
  onTrackCount?: number;
  atRiskCount?: number;
  conflictedCount?: number;
  unachievableCount?: number;
  completedCount?: number;
  conflicts: GoalConflictItem[];
}
