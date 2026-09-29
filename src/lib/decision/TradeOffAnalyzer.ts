import {
  DecisionCriterion,
  AlternativeEvaluation,
  PairwiseTradeOff,
  TradeOffItem
} from '../../types/decisionOptimizer';

export const TradeOffAnalyzer = {
  /**
   * Compares the top-ranked alternative against a competitor alternative.
   */
  comparePair(
    winner: AlternativeEvaluation,
    competitor: AlternativeEvaluation,
    criteria: DecisionCriterion[]
  ): PairwiseTradeOff {
    const advantages: TradeOffItem[] = [];
    const sacrifices: TradeOffItem[] = [];
    let netAdvantageScore = 0;

    for (const crit of criteria) {
      const winNorm = winner.normalizedScores[crit.key] ?? 0;
      const compNorm = competitor.normalizedScores[crit.key] ?? 0;
      const winRaw = winner.alternative.rawCriteriaValues[crit.key] ?? 0;
      const compRaw = competitor.alternative.rawCriteriaValues[crit.key] ?? 0;

      const normDiff = winNorm - compNorm;
      netAdvantageScore += normDiff * crit.weight;

      if (Math.abs(normDiff) > 0.05) {
        const isAdv = normDiff > 0;
        const diffPercent = Math.round(normDiff * 100);

        let note = '';
        if (isAdv) {
          note = `${winner.alternative.title} delivers higher ${crit.name} (${winRaw}${crit.unit} vs ${compRaw}${crit.unit})`;
          advantages.push({
            criterionKey: crit.key,
            criterionName: crit.name,
            winnerValueFormatted: `${winRaw}${crit.unit}`,
            competitorValueFormatted: `${compRaw}${crit.unit}`,
            diffPercent,
            isAdvantage: true,
            note
          });
        } else {
          note = `Giving up ${Math.abs(diffPercent)}% in ${crit.name} compared to ${competitor.alternative.title} (${compRaw}${crit.unit} vs ${winRaw}${crit.unit})`;
          sacrifices.push({
            criterionKey: crit.key,
            criterionName: crit.name,
            winnerValueFormatted: `${winRaw}${crit.unit}`,
            competitorValueFormatted: `${compRaw}${crit.unit}`,
            diffPercent,
            isAdvantage: false,
            note
          });
        }
      }
    }

    // Generate concise financial opportunity cost statement
    let opportunityCostSummary = '';
    if (sacrifices.length > 0) {
      const topSacrifice = sacrifices[0];
      opportunityCostSummary = `Opportunity Cost: By choosing "${winner.alternative.title}", you forfeit higher ${topSacrifice.criterionName} (${topSacrifice.competitorValueFormatted}), but gain significant protection in ${advantages.map((a) => a.criterionName).slice(0, 2).join(' & ')}.`;
    } else {
      opportunityCostSummary = `Dominant Choice: "${winner.alternative.title}" strictly dominates "${competitor.alternative.title}" across evaluated criteria with no major trade-off sacrifices.`;
    }

    return {
      winnerId: winner.alternative.id,
      winnerTitle: winner.alternative.title,
      competitorId: competitor.alternative.id,
      competitorTitle: competitor.alternative.title,
      advantages,
      sacrifices,
      netAdvantageScore: Math.round(netAdvantageScore * 100),
      opportunityCostSummary
    };
  },

  /**
   * Generates pairwise trade-offs for the winner against all other alternatives.
   */
  generateAllTradeOffs(
    evaluations: AlternativeEvaluation[],
    criteria: DecisionCriterion[]
  ): PairwiseTradeOff[] {
    if (evaluations.length < 2) return [];

    const winner = evaluations[0];
    const tradeOffs: PairwiseTradeOff[] = [];

    for (let i = 1; i < evaluations.length; i++) {
      tradeOffs.push(this.comparePair(winner, evaluations[i], criteria));
    }

    return tradeOffs;
  }
};
