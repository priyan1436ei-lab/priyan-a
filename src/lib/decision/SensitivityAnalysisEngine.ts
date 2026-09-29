import {
  DecisionCriterion,
  DecisionConstraint,
  DecisionAlternative,
  SensitivityAnalysisResult,
  SensitivityCurvePoint,
  FlipPoint
} from '../../types/decisionOptimizer';
import { DecisionOptimizerEngine } from './DecisionOptimizerEngine';

export const SensitivityAnalysisEngine = {
  /**
   * Performs full sensitivity analysis by perturbing criteria weights across a spectrum.
   */
  analyzeSensitivity(
    alternatives: DecisionAlternative[],
    baseCriteria: DecisionCriterion[],
    constraints: DecisionConstraint[]
  ): SensitivityAnalysisResult[] {
    const results: SensitivityAnalysisResult[] = [];
    const baseEvaluations = DecisionOptimizerEngine.optimize(
      alternatives,
      baseCriteria,
      constraints
    );
    if (baseEvaluations.length === 0) return [];
    const baseWinnerId = baseEvaluations[0].alternative.id;

    // Weight range points to sample: 0.05 to 0.70 in increments of 0.05
    const weightSteps = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60, 0.70];

    for (const targetCriterion of baseCriteria) {
      const curve: SensitivityCurvePoint[] = [];
      const flipPoints: FlipPoint[] = [];
      let minDistanceToFlip = 1.0;

      const otherCriteria = baseCriteria.filter((c) => c.key !== targetCriterion.key);
      const otherBaseTotalWeight = otherCriteria.reduce((sum, c) => sum + c.weight, 0);

      for (const w of weightSteps) {
        const remainingWeight = Math.max(0.001, 1 - w);

        // Proportionally re-scale the weights of other criteria
        const perturbedCriteria: DecisionCriterion[] = baseCriteria.map((c) => {
          if (c.key === targetCriterion.key) {
            return { ...c, weight: w };
          }
          const share = otherBaseTotalWeight > 0 ? c.weight / otherBaseTotalWeight : 1 / otherCriteria.length;
          return { ...c, weight: share * remainingWeight };
        });

        const evals = DecisionOptimizerEngine.optimize(
          alternatives,
          perturbedCriteria,
          constraints
        );

        const stepScores: Record<string, number> = {};
        const stepRankings = evals.map((e) => {
          stepScores[e.alternative.id] = e.finalScore;
          return {
            alternativeId: e.alternative.id,
            title: e.alternative.title,
            score: e.finalScore,
            rank: e.rank
          };
        });

        curve.push({
          weight: Math.round(w * 100) / 100,
          scores: stepScores,
          rankings: stepRankings
        });

        // Check if the winner flipped at this step
        const currentWinner = evals[0]?.alternative;
        if (currentWinner && currentWinner.id !== baseWinnerId) {
          const dist = Math.abs(w - targetCriterion.weight);
          if (dist < minDistanceToFlip) {
            minDistanceToFlip = dist;
          }

          const direction = w > targetCriterion.weight ? 'INCREASE' : 'DECREASE';
          const alreadyLogged = flipPoints.some((fp) => fp.competitorId === currentWinner.id);

          if (!alreadyLogged) {
            flipPoints.push({
              criterionKey: targetCriterion.key,
              criterionName: targetCriterion.name,
              baseWeight: Math.round(targetCriterion.weight * 100) / 100,
              thresholdWeight: Math.round(w * 100) / 100,
              competitorId: currentWinner.id,
              competitorTitle: currentWinner.title,
              direction,
              description: `If ${targetCriterion.name} weight shifts to ${(w * 100).toFixed(0)}%, "${currentWinner.title}" overtakes the top rank.`
            });
          }
        }
      }

      // Stability score: higher if the nearest flip point is far from base weight
      // If no flip point found in the range, stability is high (95-100)
      let stabilityScore = 95;
      if (flipPoints.length > 0) {
        // Distance >= 0.25 -> 80+, Distance < 0.10 -> <60
        stabilityScore = Math.min(95, Math.max(30, Math.round(minDistanceToFlip * 250)));
      }

      results.push({
        criterionKey: targetCriterion.key,
        criterionName: targetCriterion.name,
        baseWeight: Math.round(targetCriterion.weight * 100) / 100,
        curve,
        flipPoints,
        stabilityScore
      });
    }

    return results;
  }
};
