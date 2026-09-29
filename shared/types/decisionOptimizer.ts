export type DecisionCriterionKey =
  | 'LIQUIDITY'
  | 'RETURN_ROI'
  | 'RISK_SAFETY'
  | 'DEBT_REDUCTION'
  | 'TAX_EFFICIENCY'
  | 'TIMELINE_FLEXIBILITY';

export interface DecisionCriterion {
  key: DecisionCriterionKey;
  name: string;
  shortName: string;
  description: string;
  weight: number;
  isBeneficial: boolean;
  unit: string;
  minRange: number;
  maxRange: number;
}

export type ConstraintType = 'HARD' | 'SOFT';

export interface DecisionConstraint {
  id: string;
  name: string;
  type: ConstraintType;
  metricKey: string;
  operator: '>=' | '<=' | '==' | '>';
  targetValue: number;
  unit: string;
  description: string;
}

export interface ConstraintCheckResult {
  constraintId: string;
  constraintName: string;
  isHard: boolean;
  passed: boolean;
  actualValue: number;
  targetValue: number;
  unit: string;
  penalty: number;
  violationMessage?: string;
}

export interface DecisionAlternative {
  id: string;
  title: string;
  category: 'EMERGENCY_BUFFER' | 'DEBT_REPAYMENT' | 'EQUITY_INVESTMENT' | 'GOLD_HYBRID' | 'SAVINGS_SWEEP' | 'CUSTOM';
  description: string;
  allocationAmount: number;
  rawCriteriaValues: Record<DecisionCriterionKey, number>;
  constraintValues: Record<string, number>;
  badge?: string;
  iconName: string;
}

export interface AlternativeEvaluation {
  alternative: DecisionAlternative;
  isFeasible: boolean;
  hardConstraintViolations: string[];
  softConstraintPenalties: number;
  normalizedScores: Record<DecisionCriterionKey, number>;
  weightedContributions: Record<DecisionCriterionKey, number>;
  rawScore: number;
  finalScore: number;
  rank: number;
  constraintResults: ConstraintCheckResult[];
  pros: string[];
  cons: string[];
}

export interface TradeOffItem {
  criterionKey: DecisionCriterionKey;
  criterionName: string;
  winnerValueFormatted: string;
  competitorValueFormatted: string;
  diffPercent: number;
  isAdvantage: boolean;
  note: string;
}

export interface PairwiseTradeOff {
  winnerId: string;
  winnerTitle: string;
  competitorId: string;
  competitorTitle: string;
  advantages: TradeOffItem[];
  sacrifices: TradeOffItem[];
  netAdvantageScore: number;
  opportunityCostSummary: string;
}

export interface FlipPoint {
  criterionKey: DecisionCriterionKey;
  criterionName: string;
  baseWeight: number;
  thresholdWeight: number;
  competitorId: string;
  competitorTitle: string;
  direction: 'INCREASE' | 'DECREASE';
  description: string;
}

export interface SensitivityCurvePoint {
  weight: number;
  scores: Record<string, number>;
  rankings: { alternativeId: string; title: string; score: number; rank: number }[];
}

export interface SensitivityAnalysisResult {
  criterionKey: DecisionCriterionKey;
  criterionName: string;
  baseWeight: number;
  curve: SensitivityCurvePoint[];
  flipPoints: FlipPoint[];
  stabilityScore: number;
}

export interface DecisionConfidenceResult {
  confidenceScore: number;
  confidenceTier: 'HIGH' | 'MODERATE' | 'LOW';
  scoreMargin: number;
  stabilityComponent: number;
  marginComponent: number;
  constraintSlackComponent: number;
  explanation: string;
  drivers: string[];
}

export interface PreferenceLearningResult {
  suggestedWeights: Record<DecisionCriterionKey, number>;
  inferredProfile: 'CONSERVATIVE_CAPITAL_PRESERVER' | 'BALANCED_WEALTH_BUILDER' | 'AGGRESSIVE_GROWTH' | 'DEBT_REDUCTION_FOCUSED';
  profileTitle: string;
  reasoning: string[];
  healthScoreFactor: string;
  emergencyFundFactor: string;
  debtBurdenFactor: string;
}

export interface DecisionScenarioRecord {
  id: string;
  title: string;
  scenarioDilemma: string;
  capitalAmount: number;
  timestamp: number;
  dateFormatted: string;
  criteria: DecisionCriterion[];
  constraints: DecisionConstraint[];
  evaluations: AlternativeEvaluation[];
  winnerId: string;
  winnerTitle: string;
  confidence: DecisionConfidenceResult;
  tradeOffs: PairwiseTradeOff[];
  userNotes?: string;
  status: 'ACCEPTED' | 'PENDING' | 'EXPLORING' | 'DISMISSED';
  aiCommentary?: string;
}

export interface DecisionHistoryRecord {
  id: string;
  timestamp: number;
  scenarioTitle: string;
  capitalAmount: number;
  winningAlternativeId: string;
  winningAlternativeTitle: string;
  winningScore: number;
  confidenceScore: number;
  confidenceTier: 'HIGH' | 'MODERATE' | 'LOW';
  implementationStatus: 'PENDING' | 'IMPLEMENTED' | 'DISMISSED';
  criteriaWeightsSnapshot: Record<string, number>;
  topTradeOffSummary: string;
}
