import {
  DecisionCriterionKey,
  PreferenceLearningResult
} from '../../types/decisionOptimizer';
import { UserProfile, FinancialHealth, EmiItem } from '../../types';

export const PreferenceLearningEngine = {
  /**
   * Learns and infers recommended criterion weights from the user's real financial state.
   * Completely transparent and interpretable without requiring external API calls.
   */
  inferPreferenceWeights(
    profile: UserProfile,
    health: FinancialHealth,
    emis: EmiItem[] = []
  ): PreferenceLearningResult {
    const monthlyExpenses = Math.max(profile.monthlyExpenses, 1000);
    const monthsOfBuffer = profile.emergencyFund / monthlyExpenses;

    // Total monthly EMI obligation
    const totalEmiObligation = emis.reduce((sum, e) => sum + e.monthlyEmi, 0);
    const dtiRatio = totalEmiObligation / Math.max(profile.monthlyIncome, 1000);

    const baseWeights: Record<DecisionCriterionKey, number> = {
      LIQUIDITY: 0.20,
      RETURN_ROI: 0.20,
      RISK_SAFETY: 0.20,
      DEBT_REDUCTION: 0.15,
      TAX_EFFICIENCY: 0.15,
      TIMELINE_FLEXIBILITY: 0.10
    };

    const reasoning: string[] = [];
    let inferredProfile: PreferenceLearningResult['inferredProfile'] = 'BALANCED_WEALTH_BUILDER';
    let profileTitle = 'Balanced Household Wealth Builder';

    // 1. Emergency Reserve Analysis
    let emergencyFactor = '';
    if (monthsOfBuffer < 2.5) {
      baseWeights.LIQUIDITY += 0.15;
      baseWeights.RISK_SAFETY += 0.10;
      baseWeights.RETURN_ROI -= 0.10;
      baseWeights.TAX_EFFICIENCY -= 0.05;
      baseWeights.TIMELINE_FLEXIBILITY += 0.05;

      emergencyFactor = `Reserve buffer (${monthsOfBuffer.toFixed(1)} mo) is critically below the 3-month safety floor. Prioritizing instant liquidity and capital preservation.`;
      reasoning.push(emergencyFactor);
      inferredProfile = 'CONSERVATIVE_CAPITAL_PRESERVER';
      profileTitle = 'Capital Preserver (Defensive Stance)';
    } else if (monthsOfBuffer >= 5.0) {
      baseWeights.LIQUIDITY -= 0.08;
      baseWeights.RETURN_ROI += 0.12;
      baseWeights.TAX_EFFICIENCY += 0.05;

      emergencyFactor = `Healthy reserve buffer of ${monthsOfBuffer.toFixed(1)} months. You have substantial runway to seek higher compounding and tax-efficient returns.`;
      reasoning.push(emergencyFactor);
      inferredProfile = 'AGGRESSIVE_GROWTH';
      profileTitle = 'Wealth Accelerator & Compounding';
    } else {
      emergencyFactor = `Adequate reserve buffer (${monthsOfBuffer.toFixed(1)} mo). Maintaining balanced asset distribution.`;
      reasoning.push(emergencyFactor);
    }

    // 2. Debt & EMI Burden Analysis
    let debtFactor = '';
    if (dtiRatio > 0.20 || emis.length >= 2) {
      baseWeights.DEBT_REDUCTION += 0.15;
      baseWeights.RETURN_ROI -= 0.05;
      baseWeights.LIQUIDITY -= 0.05;

      debtFactor = `Debt-to-Income is ${Math.round(dtiRatio * 100)}% with ₹${Math.round(totalEmiObligation).toLocaleString('en-IN')}/mo in active loan payments. Prepayment yields guaranteed tax-free return.`;
      reasoning.push(debtFactor);
      if (inferredProfile !== 'CONSERVATIVE_CAPITAL_PRESERVER') {
        inferredProfile = 'DEBT_REDUCTION_FOCUSED';
        profileTitle = 'Debt Freedom Prioritizer';
      }
    } else {
      debtFactor = `Low debt load (${Math.round(dtiRatio * 100)}% DTI). Debt reduction is optional; focus remains on capital appreciation.`;
      reasoning.push(debtFactor);
    }

    // 3. Health Score Factor
    let healthFactor = '';
    if (health.overallScore >= 80) {
      healthFactor = `High Financial Health score (${health.overallScore}/100) reflects disciplined cashflow; supports strategic wealth creation.`;
      reasoning.push(healthFactor);
    } else {
      healthFactor = `Health score (${health.overallScore}/100) indicates discretionary expenditure pressure. Emphasizing risk mitigation.`;
      baseWeights.RISK_SAFETY += 0.05;
      reasoning.push(healthFactor);
    }

    // Normalize weights to sum exactly to 1.00
    const rawSum = Object.values(baseWeights).reduce((sum, v) => sum + Math.max(0.02, v), 0);
    const suggestedWeights: Record<DecisionCriterionKey, number> = {
      LIQUIDITY: 0,
      RETURN_ROI: 0,
      RISK_SAFETY: 0,
      DEBT_REDUCTION: 0,
      TAX_EFFICIENCY: 0,
      TIMELINE_FLEXIBILITY: 0
    };

    for (const key of Object.keys(baseWeights) as DecisionCriterionKey[]) {
      suggestedWeights[key] = Math.round((Math.max(0.02, baseWeights[key]) / rawSum) * 100) / 100;
    }

    // Clean up rounding edge case
    const totalNormalized = Object.values(suggestedWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(1.0 - totalNormalized) > 0.001) {
      suggestedWeights.RETURN_ROI = Math.round((suggestedWeights.RETURN_ROI + (1.0 - totalNormalized)) * 100) / 100;
    }

    return {
      suggestedWeights,
      inferredProfile,
      profileTitle,
      reasoning,
      healthScoreFactor: healthFactor,
      emergencyFundFactor: emergencyFactor,
      debtBurdenFactor: debtFactor
    };
  }
};
