import { FinancialCapacityEngine } from '../financialCapacityEngine';
import { GoalFeasibilityEngine } from '../goalFeasibilityEngine';
import { GoalConflictEngine } from '../goalConflictEngine';
import { GoalInterferenceEngine } from '../goalInterferenceEngine';
import { RippleSimulationEngine } from '../rippleSimulationEngine';
import { ResolutionScenarioEngine } from '../resolutionScenarioEngine';
import { GoalPortfolioEngine } from '../goalPortfolioEngine';
import { HACKATHON_DEMO_DATA } from '../demoDataset';
import { GoalItem } from '../../../types/goalPlanning';

export function runGoalPlanningEngineTests() {
  console.log('--- RUNNING DETERMINISTIC GOAL ENGINE TESTS ---');

  // Test 1: Financial Capacity Calculation
  const cap = FinancialCapacityEngine.calculateCapacity({
    monthlyIncome: 75000,
    essentialExpenses: 35000,
    totalActiveEMI: 8000,
    recurringBills: 0,
    emergencyAllocation: 0
  });

  if (cap.availableCapacity !== 32000) {
    throw new Error(`Test 1 Failed: Expected capacity 32000, got ${cap.availableCapacity}`);
  }
  console.log('✓ Test 1 Passed: Financial Capacity Calculation (32,000 INR)');

  // Test 2: Zero Interest & Zero Inflation Required Monthly Contribution
  const sampleGoal: GoalItem = {
    id: 1,
    name: 'Sample Zero Return Goal',
    emoji: '🎯',
    category: 'General',
    targetAmount: 1000000,
    currentAmount: 200000,
    targetDate: 'Aug 2030', // 48 months from Sept 2026
    monthlyContribution: 10000,
    priority: 'HIGH',
    expectedAnnualReturn: 0,
    inflationRate: 0
  };

  const feasZero = GoalFeasibilityEngine.evaluateGoalFeasibility(sampleGoal, 32000);
  const expectedZeroMonthly = Math.round(800000 / feasZero.monthsRemaining);
  if (feasZero.requiredMonthlyContribution !== expectedZeroMonthly) {
    throw new Error(`Test 2 Failed: Expected required monthly ${expectedZeroMonthly}, got ${feasZero.requiredMonthlyContribution}`);
  }
  console.log(`✓ Test 2 Passed: Zero-Interest Contribution (${expectedZeroMonthly} INR/mo)`);

  // Test 3: Multi-Goal Conflict Detection with Demo Dataset
  const portfolio = GoalPortfolioEngine.evaluatePortfolio({
    goals: HACKATHON_DEMO_DATA.goals,
    monthlyIncome: HACKATHON_DEMO_DATA.monthlyIncome,
    essentialExpenses: HACKATHON_DEMO_DATA.essentialExpenses,
    totalActiveEMI: HACKATHON_DEMO_DATA.activeEMI,
    recurringBills: 0
  });

  if (portfolio.monthlyShortfall <= 0) {
    throw new Error(`Test 3 Failed: Demo dataset should create a monthly shortfall > 0`);
  }
  console.log(`✓ Test 3 Passed: Multi-Goal Conflict Detection (Shortfall = ${portfolio.monthlyShortfall} INR)`);

  // Test 4: Goal Interference Matrix Generation
  const matrixData = GoalInterferenceEngine.generateMatrix(HACKATHON_DEMO_DATA.goals, 32000);
  if (matrixData.matrix.length !== HACKATHON_DEMO_DATA.goals.length) {
    throw new Error(`Test 4 Failed: Matrix size mismatch`);
  }
  console.log('✓ Test 4 Passed: Cross-Goal Interference Matrix Generation');

  // Test 5: Ripple Simulation on Deadline Change
  const rippleResult = RippleSimulationEngine.simulateRipple({
    goals: HACKATHON_DEMO_DATA.goals,
    monthlyIncome: 75000,
    essentialExpenses: 35000,
    totalActiveEMI: 8000,
    recurringBills: 0,
    whatIf: {
      monthlyIncomeDelta: 0,
      monthlyExpenseDelta: 0,
      newEmiMonthly: 0,
      emergencyBufferMonthly: 0,
      goalModifications: {
        101: { targetDate: 'Dec 2028' } // Accelerated from 2030 to 2028
      }
    }
  });

  if (rippleResult.causalChain.length === 0) {
    throw new Error(`Test 5 Failed: Ripple simulation should return non-empty causal chain`);
  }
  console.log(`✓ Test 5 Passed: Ripple Effect Simulation (${rippleResult.causalChain.length} steps generated)`);

  // Test 6: Resolution Scenarios Generation
  const scenarios = ResolutionScenarioEngine.generateScenarios(HACKATHON_DEMO_DATA.goals, 32000);
  if (scenarios.length !== 5) {
    throw new Error(`Test 6 Failed: Expected 5 resolution scenarios, got ${scenarios.length}`);
  }
  console.log('✓ Test 6 Passed: 5 Resolution Scenarios Generated Deterministically');

  // Test 7: Edge Cases - Zero Income, Negative Capacity, Completed Goal
  const completedGoal: GoalItem = {
    id: 99,
    name: 'Done Goal',
    emoji: '✅',
    category: 'Misc',
    targetAmount: 50000,
    currentAmount: 50000,
    targetDate: 'Dec 2026',
    monthlyContribution: 0,
    priority: 'LOW'
  };

  const completedFeas = GoalFeasibilityEngine.evaluateGoalFeasibility(completedGoal, 0);
  if (completedFeas.status !== 'COMPLETED' || completedFeas.feasibilityScore !== 100) {
    throw new Error(`Test 7 Failed: Completed goal status should be COMPLETED with 100 score`);
  }

  const zeroIncomeCap = FinancialCapacityEngine.calculateCapacity({
    monthlyIncome: 0,
    essentialExpenses: 10000,
    totalActiveEMI: 5000,
    recurringBills: 2000
  });

  if (zeroIncomeCap.availableCapacity !== 0 || isNaN(zeroIncomeCap.availableCapacity)) {
    throw new Error(`Test 7 Failed: Zero income capacity should be 0 without NaN`);
  }
  console.log('✓ Test 7 Passed: Edge Cases (Zero Income, Completed Goal, Safe NaN handling)');

  console.log('=== ALL DETERMINISTIC GOAL ENGINE TESTS PASSED SUCCESSFULLY! ===');
  return true;
}
