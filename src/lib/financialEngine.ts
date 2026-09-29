import { FinancialHealth } from '../types';

export const FinancialEngine = {
  /**
   * Formats amounts in standard Indian Rupee notation (e.g. ₹1.25 L, ₹50,000, ₹84,500)
   */
  formatINR(amount: number, compact: boolean = false): string {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (compact) {
      if (absAmount >= 10000000) {
        return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
      }
      if (absAmount >= 100000) {
        return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
      }
      if (absAmount >= 1000) {
        return `${sign}₹${(absAmount / 1000).toFixed(1)} K`;
      }
      return `${sign}₹${Math.round(absAmount)}`;
    }

    const rounded = Math.round(absAmount);
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(rounded);

    return `${sign}₹${formatted}`;
  },

  formatExactINR(amount: number): string {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(absAmount);
    return `${sign}₹${formatted}`;
  },

  /**
   * Real-time calculation of Financial Health Score (0-100) based on all financial pillars
   */
  calculateHealth(
    income: number,
    expenses: number,
    savings: number,
    emergencyFund: number = 72500,
    debt: number = 5000,
    unpaidBillsCount: number = 1,
    budgetsOverspentCount: number = 0,
    goalsProgressRatio: number = 0.72
  ): FinancialHealth {
    const safeIncome = Math.max(income, 1000);
    const safeExpenses = Math.max(expenses, 500);

    // 1. Savings Rate (Target >= 25% of monthly income) -> 20 pts
    const savingsRate = Math.min(Math.max(savings / safeIncome, 0), 1);
    const savingsRateScore = Math.min(Math.max(savingsRate / 0.30, 0), 1) * 100;

    // 2. Spending Consistency (Expenses <= 60% of income) -> 15 pts
    const expenseRatio = safeExpenses / safeIncome;
    const spendingConsistencyScore =
      expenseRatio <= 0.60
        ? 100
        : Math.min(Math.max(1.0 - (expenseRatio - 0.60) / 0.40, 0), 1) * 100;

    // 3. Emergency Fund (Target >= 6 months of expenses) -> 15 pts
    const monthsCovered = Math.min(Math.max(emergencyFund / safeExpenses, 0), 12);
    const emergencyFundScore = Math.min(Math.max(monthsCovered / 6.0, 0), 1) * 100;

    // 4. Bill Payment History (No overdue/unpaid bills) -> 15 pts
    const billAdherenceScore = unpaidBillsCount === 0 ? 100 : unpaidBillsCount <= 2 ? 80 : 50;

    // 5. Budget Adherence (All categories within budget) -> 15 pts
    const budgetAdherenceScore =
      budgetsOverspentCount === 0 ? 95 : Math.max(80 - budgetsOverspentCount * 15, 30);

    // 6. Debt Behavior (DTI <= 15%) -> 10 pts
    const dti = debt / safeIncome;
    const debtBehaviorScore =
      dti <= 0.15 ? 100 : Math.min(Math.max(1.0 - (dti - 0.15) / 0.50, 0), 1) * 100;

    // 7. Goal Progress (Average % toward milestones) -> 10 pts
    const goalProgressScore = Math.min(Math.max(goalsProgressRatio * 100, 0), 100);

    // Weighted Overall Score (0-100)
    const weightedScore = Math.min(
      Math.max(
        Math.round(
          savingsRateScore * 0.20 +
            spendingConsistencyScore * 0.15 +
            emergencyFundScore * 0.15 +
            billAdherenceScore * 0.15 +
            budgetAdherenceScore * 0.15 +
            debtBehaviorScore * 0.10 +
            goalProgressScore * 0.10
        ),
        10
      ),
      100
    );

    let statusLabel = 'Poor';
    let statusColorHex = '#EF4444';
    if (weightedScore >= 90) {
      statusLabel = 'Excellent';
      statusColorHex = '#10B981';
    } else if (weightedScore >= 75) {
      statusLabel = 'Very Good';
      statusColorHex = '#06B6D4';
    } else if (weightedScore >= 60) {
      statusLabel = 'Good';
      statusColorHex = '#3B82F6';
    } else if (weightedScore >= 40) {
      statusLabel = 'Fair';
      statusColorHex = '#F59E0B';
    }

    let aiSummary = 'Discretionary spending is slightly elevated this month. Review your Food and Entertainment budgets.';
    if (weightedScore >= 80) {
      aiSummary = 'You improved your savings rate by 4.2% and stayed consistently within your monthly household budget.';
    } else if (weightedScore >= 65) {
      aiSummary = 'Good financial foundation. Boosting your emergency reserve by ₹25,000 will elevate you into the Excellent tier.';
    }

    const recommendations = [
      'Maintain your 41% savings rate to reach your Family Vacation goal 2 months early.',
      'Schedule auto-debit for your Internet & Health Insurance bills to avoid late penalty risks.',
      'Allocate ₹3,500 surplus this month into the Emergency Reserve Fund.'
    ];

    return {
      overallScore: weightedScore,
      statusLabel,
      statusColorHex,
      scoreChange: +6,
      savingsRateScore: Math.round(savingsRateScore),
      spendingConsistencyScore: Math.round(spendingConsistencyScore),
      emergencyFundScore: Math.round(emergencyFundScore),
      billAdherenceScore: Math.round(billAdherenceScore),
      budgetAdherenceScore: Math.round(budgetAdherenceScore),
      debtBehaviorScore: Math.round(debtBehaviorScore),
      goalProgressScore: Math.round(goalProgressScore),
      pillars: {
        savingsRate: { score: Math.round(savingsRateScore), weight: 0.20, title: 'Savings Rate', summary: 'Current savings rate exceeds the 25% guideline.' },
        debtToIncome: { score: Math.round(debtBehaviorScore), weight: 0.10, title: 'Debt / EMI Burden', summary: 'Low debt obligation well within safe 15% DTI threshold.' },
        budgetDiscipline: { score: Math.round(budgetAdherenceScore), weight: 0.15, title: 'Budget Discipline', summary: 'Discretionary spending is tracking closely to planned limits.' },
        emergencyFund: { score: Math.round(emergencyFundScore), weight: 0.15, title: 'Emergency Fund', summary: 'Reserve fund covers over 2 months of essential family expenses.' },
        investmentRate: { score: Math.round(goalProgressScore), weight: 0.10, title: 'Investment Flow', summary: 'Target goals are 72% funded towards planned milestones.' },
        spendingConsistency: { score: Math.round(spendingConsistencyScore), weight: 0.15, title: 'Spending Consistency', summary: 'Expense-to-income ratio remains sustainable.' },
        billAdherence: { score: Math.round(billAdherenceScore), weight: 0.15, title: 'Bill Adherence', summary: 'Bills and utility payments are consistently settled on schedule.' }
      },
      aiSummary,
      recommendations
    };
  }
};
