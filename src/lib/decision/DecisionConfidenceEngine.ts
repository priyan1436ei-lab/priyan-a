import {
  AlternativeEvaluation,
  SensitivityAnalysisResult,
  DecisionConfidenceResult
} from '../../types/decisionOptimizer';

export const DecisionConfidenceEngine = {
  /**
   * Evaluates recommendation robustness and confidence score (0-100).
   */
  calculateConfidence(
    evaluations: AlternativeEvaluation[],
    sensitivityResults: SensitivityAnalysisResult[]
  ): DecisionConfidenceResult {
    if (evaluations.length === 0) {
      return {
        confidenceScore: 0,
        confidenceTier: 'LOW',
        scoreMargin: 0,
        stabilityComponent: 0,
        marginComponent: 0,
        constraintSlackComponent: 0,
        explanation: 'No evaluations available to assess confidence.',
        drivers: []
      };
    }

    const winner = evaluations[0];
    const runnerUp = evaluations[1];

    // 1. Margin Component (0 - 40 pts)
    // If margin is >= 20 pts, full 40 pts. If margin <= 3 pts, < 10 pts.
    const scoreMargin = runnerUp ? Math.max(0, winner.finalScore - runnerUp.finalScore) : 30;
    const marginRatio = Math.min(1, scoreMargin / 25);
    const marginComponent = Math.round(marginRatio * 40);

    // 2. Sensitivity Stability Component (0 - 35 pts)
    const avgStability =
      sensitivityResults.length > 0
        ? sensitivityResults.reduce((sum, s) => sum + s.stabilityScore, 0) / sensitivityResults.length
        : 75;
    const stabilityComponent = Math.round((avgStability / 100) * 35);

    // 3. Constraint Slack Component (0 - 25 pts)
    // Checks how safely winner passes all constraints without soft penalties
    let constraintSlackComponent = 25;
    if (winner.softConstraintPenalties > 0) {
      constraintSlackComponent = Math.max(8, Math.round(25 * (1 - winner.softConstraintPenalties * 2)));
    }
    if (!winner.isFeasible) {
      constraintSlackComponent = 0;
    }

    const rawTotal = marginComponent + stabilityComponent + constraintSlackComponent;
    const confidenceScore = Math.min(98, Math.max(20, Math.round(rawTotal)));

    let confidenceTier: 'HIGH' | 'MODERATE' | 'LOW' = 'MODERATE';
    if (confidenceScore >= 78) {
      confidenceTier = 'HIGH';
    } else if (confidenceScore < 58) {
      confidenceTier = 'LOW';
    }

    const drivers: string[] = [];

    if (scoreMargin >= 12) {
      drivers.push(`Decisive +${scoreMargin} pt lead over runner-up "${runnerUp?.alternative.title ?? 'Alternative'}"`);
    } else {
      drivers.push(`Close margin (+${scoreMargin} pts) with runner-up "${runnerUp?.alternative.title ?? 'Alternative'}" indicates sensitive trade-offs`);
    }

    if (avgStability >= 75) {
      drivers.push('High parameter robustness against weight adjustments and market rate fluctuations');
    } else {
      drivers.push('Moderate sensitivity: A moderate shift in user priorities could favor an alternative option');
    }

    if (winner.softConstraintPenalties === 0) {
      drivers.push('Zero constraint penalties; satisfies all household risk and liquidity thresholds cleanly');
    } else {
      drivers.push(`Incurred minor soft constraint deviations (${(winner.softConstraintPenalties * 100).toFixed(0)}%)`);
    }

    let explanation = '';
    if (confidenceTier === 'HIGH') {
      explanation = `High confidence (${confidenceScore}%): "${winner.alternative.title}" stands out with strong criteria dominance and robust stability across parameter variations.`;
    } else if (confidenceTier === 'MODERATE') {
      explanation = `Moderate confidence (${confidenceScore}%): "${winner.alternative.title}" is the optimal current fit, but closely contested in return or liquidity by "${runnerUp?.alternative.title ?? 'runner-up'}".`;
    } else {
      explanation = `Low confidence (${confidenceScore}%): Alternatives have very narrow score separation. Review individual trade-off points before committing funds.`;
    }

    return {
      confidenceScore,
      confidenceTier,
      scoreMargin,
      stabilityComponent,
      marginComponent,
      constraintSlackComponent,
      explanation,
      drivers
    };
  }
};
