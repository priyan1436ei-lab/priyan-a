import {
  DecisionCriterion,
  DecisionCriterionKey,
  DecisionConstraint,
  DecisionAlternative,
  AlternativeEvaluation
} from '../../types/decisionOptimizer';
import { ConstraintEngine } from './ConstraintEngine';

export const DecisionOptimizerEngine = {
  /**
   * Normalizes raw values for a criterion across all alternatives using Linear Min-Max scaling.
   * If beneficial: (v - min) / (max - min)
   * If cost/detriment: (max - v) / (max - min)
   */
  normalizeCriterionValues(
    alternatives: DecisionAlternative[],
    criterion: DecisionCriterion
  ): Record<string, number> {
    const values = alternatives.map(
      (a) => a.rawCriteriaValues[criterion.key] ?? 0
    );

    const min = Math.min(...values);
    const max = Math.max(...values);
    const normalized: Record<string, number> = {};

    for (const alt of alternatives) {
      const val = alt.rawCriteriaValues[criterion.key] ?? 0;
      if (Math.abs(max - min) < 0.00001) {
        // If all alternatives have identical value, default normalized score to 0.5 or 1.0
        normalized[alt.id] = 0.8;
      } else if (criterion.isBeneficial) {
        normalized[alt.id] = Math.max(0, Math.min(1, (val - min) / (max - min)));
      } else {
        // Lower is better (cost, risk, lock-in)
        normalized[alt.id] = Math.max(0, Math.min(1, (max - val) / (max - min)));
      }
    }

    return normalized;
  },

  /**
   * Evaluates all alternatives through the MCDA Weighted Sum Model.
   */
  optimize(
    alternatives: DecisionAlternative[],
    criteria: DecisionCriterion[],
    constraints: DecisionConstraint[]
  ): AlternativeEvaluation[] {
    if (alternatives.length === 0) return [];

    // Ensure criteria weights sum to 1.0
    const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);
    const normalizedCriteria = criteria.map((c) => ({
      ...c,
      weight: totalWeight > 0 ? c.weight / totalWeight : 1 / criteria.length
    }));

    // Step 1: Normalize all criteria across alternatives
    const criterionNormalizedMap: Record<DecisionCriterionKey, Record<string, number>> = {
      LIQUIDITY: {},
      RETURN_ROI: {},
      RISK_SAFETY: {},
      DEBT_REDUCTION: {},
      TAX_EFFICIENCY: {},
      TIMELINE_FLEXIBILITY: {}
    };

    for (const criterion of normalizedCriteria) {
      criterionNormalizedMap[criterion.key] = this.normalizeCriterionValues(
        alternatives,
        criterion
      );
    }

    // Step 2: Constraint filtering & Weighted Sum Calculation
    const evaluations: AlternativeEvaluation[] = [];

    for (const alt of alternatives) {
      // Evaluate constraints first
      const constraintCheck = ConstraintEngine.evaluateAlternativeConstraints(
        alt,
        constraints
      );

      const normalizedScores: Record<DecisionCriterionKey, number> = {
        LIQUIDITY: 0,
        RETURN_ROI: 0,
        RISK_SAFETY: 0,
        DEBT_REDUCTION: 0,
        TAX_EFFICIENCY: 0,
        TIMELINE_FLEXIBILITY: 0
      };

      const weightedContributions: Record<DecisionCriterionKey, number> = {
        LIQUIDITY: 0,
        RETURN_ROI: 0,
        RISK_SAFETY: 0,
        DEBT_REDUCTION: 0,
        TAX_EFFICIENCY: 0,
        TIMELINE_FLEXIBILITY: 0
      };

      let rawTotal = 0;

      for (const criterion of normalizedCriteria) {
        const normVal = criterionNormalizedMap[criterion.key]?.[alt.id] ?? 0;
        const weightedVal = normVal * criterion.weight;

        normalizedScores[criterion.key] = Math.round(normVal * 100) / 100;
        weightedContributions[criterion.key] = Math.round(weightedVal * 1000) / 1000;
        rawTotal += weightedVal;
      }

      // Final score (0-100), penalized by soft constraint deviations
      const penaltyDiscount = 1 - constraintCheck.softPenalty;
      let finalScore = Math.round(rawTotal * penaltyDiscount * 100);

      // If hard constraint is violated, heavily penalize rank score
      if (!constraintCheck.isFeasible) {
        finalScore = Math.min(finalScore, 25);
      }

      // Dynamic Pros and Cons based on criteria performance vs peers
      const pros: string[] = [];
      const cons: string[] = [];

      for (const crit of normalizedCriteria) {
        const score = normalizedScores[crit.key];
        const rawVal = alt.rawCriteriaValues[crit.key];
        if (score >= 0.80) {
          pros.push(`Outstanding ${crit.name} (${rawVal}${crit.unit})`);
        } else if (score <= 0.25 && crit.weight >= 0.15) {
          cons.push(`Lower relative ${crit.name} (${rawVal}${crit.unit})`);
        }
      }

      if (constraintCheck.softPenalty > 0) {
        cons.push(`Incurred soft constraint penalty (-${(constraintCheck.softPenalty * 100).toFixed(0)}%)`);
      }

      evaluations.push({
        alternative: alt,
        isFeasible: constraintCheck.isFeasible,
        hardConstraintViolations: constraintCheck.hardViolations,
        softConstraintPenalties: constraintCheck.softPenalty,
        normalizedScores,
        weightedContributions,
        rawScore: Math.round(rawTotal * 100) / 100,
        finalScore,
        rank: 1, // will be sorted and indexed below
        constraintResults: constraintCheck.results,
        pros: pros.slice(0, 3),
        cons: cons.slice(0, 3)
      });
    }

    // Step 3: Sort feasible alternatives first by score desc, then infeasible
    evaluations.sort((a, b) => {
      if (a.isFeasible && !b.isFeasible) return -1;
      if (!a.isFeasible && b.isFeasible) return 1;
      return b.finalScore - a.finalScore;
    });

    // Step 4: Assign distinct ranks
    evaluations.forEach((item, index) => {
      item.rank = index + 1;
    });

    return evaluations;
  }
};
