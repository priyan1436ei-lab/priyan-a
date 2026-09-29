import { FinancialCapacityResult } from '../../types/goalPlanning';

export class FinancialCapacityEngine {
  /**
   * Calculates deterministic available monthly financial capacity for household goals.
   * Formula:
   * availableCapacity = monthlyIncome - essentialExpenses - totalActiveEMI - recurringBills - emergencyBufferAllocation
   */
  public static calculateCapacity(params: {
    monthlyIncome: number;
    essentialExpenses: number;
    totalActiveEMI: number;
    recurringBills: number;
    emergencyAllocation?: number;
    existingGoalContributions?: number;
  }): FinancialCapacityResult {
    const income = Math.max(0, isNaN(params.monthlyIncome) ? 0 : params.monthlyIncome);
    const expenses = Math.max(0, isNaN(params.essentialExpenses) ? 0 : params.essentialExpenses);
    const emi = Math.max(0, isNaN(params.totalActiveEMI) ? 0 : params.totalActiveEMI);
    const bills = Math.max(0, isNaN(params.recurringBills) ? 0 : params.recurringBills);
    const emergencyAllocation = Math.max(0, isNaN(params.emergencyAllocation ?? 0) ? 0 : (params.emergencyAllocation ?? 0));
    const existingGoalContributions = Math.max(0, isNaN(params.existingGoalContributions ?? 0) ? 0 : (params.existingGoalContributions ?? 0));

    const totalCommitments = expenses + emi + bills + emergencyAllocation;
    const availableCapacity = Math.max(0, income - totalCommitments);
    const remainingGoalCapacity = Math.max(0, availableCapacity - existingGoalContributions);

    return {
      monthlyIncome: income,
      essentialExpenses: expenses,
      totalActiveEMI: emi,
      recurringBills: bills,
      emergencyAllocation,
      availableCapacity,
      existingGoalContributions,
      remainingGoalCapacity
    };
  }
}
