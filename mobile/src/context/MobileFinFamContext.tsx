import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  UserProfile,
  GoalItem,
  BillItem,
  FamilyMemberItem,
  EmiItem,
} from '../../../src/types';
import {
  FinancialCapacityResult,
  GoalFeasibilityResult,
  GoalConflictItem,
  GoalPortfolioSummary,
  ResolutionScenario,
  FinancialGoal,
  GoalConflict,
  GoalInterferenceCell,
  GoalResolutionPlan,
  MultiGoalFeasibilityReport,
} from '../../../shared/types/goalPlanning';
import {
  FinancialCapacityEngine,
  GoalFeasibilityEngine,
  GoalConflictEngine,
  GoalPortfolioEngine,
  HACKATHON_DEMO_DATA,
} from '../../../src/lib/goalPlanning';
import { DecisionHistoryRecord } from '../../../shared/types/decisionOptimizer';
import { FinancialEngine } from '../../../src/lib/financialEngine';

// Standalone EMI & Debt Utility Functions
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;
  const r = annualRate / (12 * 100);
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return emi;
}

export function calculatePrepaymentSavings(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  extraMonthlyPrepayment: number
) {
  const baseEmi = calculateEMI(principal, annualRate, tenureMonths);
  const totalBasePayment = baseEmi * tenureMonths;
  const baseInterest = totalBasePayment - principal;

  if (extraMonthlyPrepayment <= 0) {
    return { interestSaved: 0, monthsSaved: 0 };
  }

  const newMonthly = baseEmi + extraMonthlyPrepayment;
  const r = annualRate / (12 * 100);

  let balance = principal;
  let months = 0;
  let totalInterestPaid = 0;

  while (balance > 0 && months < tenureMonths) {
    const interest = balance * r;
    totalInterestPaid += interest;
    const principalPaid = newMonthly - interest;
    balance -= principalPaid;
    months++;
  }

  const interestSaved = Math.max(0, baseInterest - totalInterestPaid);
  const monthsSaved = Math.max(0, tenureMonths - months);

  return { interestSaved, monthsSaved };
}

export function evaluateDecision(
  title: string,
  upfrontCost: number,
  monthlyOutflow: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  goals: any[]
) {
  const surplus = monthlyIncome - monthlyExpenses;
  const newSurplus = surplus - monthlyOutflow;

  const postDecisionFeasibility = newSurplus > 0 ? Math.min(0.95, newSurplus / (surplus || 1)) : 0.2;
  const recommendation = postDecisionFeasibility >= 0.6 ? 'PROCEED' : 'REJECT / RESTRUCTURE';

  const summary =
    postDecisionFeasibility >= 0.6
      ? `Decision '${title}' leaves ₹${newSurplus.toLocaleString('en-IN')}/mo net surplus, maintaining a healthy liquidity buffer for existing goals.`
      : `Warning: Outflow of ₹${monthlyOutflow.toLocaleString('en-IN')}/mo risks cannibalizing active goal SIPs and reducing overall portfolio feasibility.`;

  return {
    recommendation,
    postDecisionFeasibility,
    summary,
  };
}

export interface MobileFinFamState {
  userEmail: string;
  subscriptionTier: string;
  overallScore: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  goals: FinancialGoal[];
  conflicts: GoalConflict[];
  matrix: GoalInterferenceCell[][];
  feasibilityReport: MultiGoalFeasibilityReport | null;
  resolutionPlans: GoalResolutionPlan[];
  familyMembers: { id: string; name: string; relation: string; income: number; expenses: number }[];
  familyBills: { id: string; name: string; amount: number; dueDate: string; assignedTo: string; isPaid: boolean }[];
}

export interface MobileFinFamContextType {
  state: MobileFinFamState;
  userProfile: UserProfile;
  goals: GoalItem[];
  emis: EmiItem[];
  bills: BillItem[];
  familyMembers: FamilyMemberItem[];
  financialCapacity: FinancialCapacityResult;
  goalFeasibilities: GoalFeasibilityResult[];
  goalConflicts: GoalConflictItem[];
  goalPortfolioSummary: GoalPortfolioSummary;
  refreshData: () => Promise<void>;
  loadHackathonDemoData: () => void;
  updateGoal: (id: number, data: Partial<GoalItem>) => void;
  addGoal: (newGoal: any) => void;
  deleteGoal: (id: any) => void;
  depositGoal: (id: number, amount: number) => void;
  runSimulation: (params: any) => MultiGoalFeasibilityReport;
  applyResolution: (plan: any) => void;
  applyResolutionScenario: (scenario: ResolutionScenario) => void;
  addFamilyMember: (member: any) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const MobileFinFamContext = createContext<MobileFinFamContextType | null>(null);

const DEMO_FINANCIAL_GOALS: FinancialGoal[] = [
  {
    id: 'g1',
    name: 'Daughter Higher Education',
    category: 'EDUCATION',
    targetAmount: 5000000,
    currentAmount: 850000,
    targetYear: 2032,
    priority: 1,
    currentMonthlySip: 25000,
    expectedReturnRate: 0.12,
    inflationRate: 0.06,
  },
  {
    id: 'g2',
    name: 'Retirement Corpus',
    category: 'RETIREMENT',
    targetAmount: 25000000,
    currentAmount: 3200000,
    targetYear: 2045,
    priority: 1,
    currentMonthlySip: 35000,
    expectedReturnRate: 0.12,
    inflationRate: 0.06,
  },
  {
    id: 'g3',
    name: 'Vacation Home Purchase',
    category: 'HOUSING',
    targetAmount: 8000000,
    currentAmount: 400000,
    targetYear: 2032,
    priority: 2,
    currentMonthlySip: 15000,
    expectedReturnRate: 0.1,
    inflationRate: 0.05,
  },
  {
    id: 'g4',
    name: 'Emergency Buffer',
    category: 'EMERGENCY_FUND',
    targetAmount: 1000000,
    currentAmount: 750000,
    targetYear: 2027,
    priority: 1,
    currentMonthlySip: 10000,
    expectedReturnRate: 0.07,
    inflationRate: 0.05,
  },
];

const DEMO_CONFLICTS: GoalConflict[] = [
  {
    goal1Id: 'g1',
    goal1Name: 'Daughter Higher Education',
    goal2Id: 'g3',
    goal2Name: 'Vacation Home Purchase',
    overlapYear: 2032,
    deficitAmount: 1850000,
    severity: 'HIGH',
    suggestedResolution: {
      delayYears: 2,
      additionalSip: 8000,
    },
  },
];

const DEMO_RESOLUTION_PLANS: GoalResolutionPlan[] = [
  {
    id: 'p1',
    strategyName: 'Optimized SIP & Timeline Stagger',
    description:
      'Increase monthly education SIP by ₹5,000 and delay vacation home by 2 years to completely eliminate overlap deficit.',
    projectedFeasibility: 0.94,
    totalAdditionalSip: 5000,
    maxDelayYears: 2,
    goalAdjustments: [],
  },
  {
    id: 'p2',
    strategyName: 'High Equity Step-up Plan',
    description:
      'Maintain timeline by stepping up SIP by 12% annually in high-growth equity index funds.',
    projectedFeasibility: 0.88,
    totalAdditionalSip: 10000,
    maxDelayYears: 0,
    goalAdjustments: [],
  },
  {
    id: 'p3',
    strategyName: 'Balanced Staggered Allocation',
    description: 'Stagger vacation home by 1 year and shift emergency fund returns.',
    projectedFeasibility: 0.85,
    totalAdditionalSip: 3000,
    maxDelayYears: 1,
    goalAdjustments: [],
  },
];

export const MobileFinFamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 1,
    name: 'Priyanshu Sharma',
    email: 'priyan1436ei@gmail.com',
    phone: '+91 98765 43210',
    currencySymbol: '₹',
    totalBalance: 84500.0,
    monthlyIncome: 125000.0,
    monthlyExpenses: 55000.0,
    monthlySavings: 70000.0,
    emergencyFund: 750000.0,
    healthScore: 84,
    previousHealthScore: 78,
    isPremium: true,
    premiumTier: 'PREMIUM_MONTHLY',
    premiumValidUntil: '2027-12-31',
    familyId: 'fam_sharma_001',
    familyName: 'Sharma Family Vault',
    isBiometricEnabled: true,
    isNotificationsEnabled: true,
    unreadNotificationsCount: 2,
  });

  const [goals, setGoals] = useState<GoalItem[]>(HACKATHON_DEMO_DATA.goals);
  const [finGoals, setFinGoals] = useState<FinancialGoal[]>(DEMO_FINANCIAL_GOALS);
  const [emis, setEmis] = useState<EmiItem[]>([]);
  const [bills, setBills] = useState<BillItem[]>([]);

  const [familyMembersState, setFamilyMembersState] = useState([
    { id: 'fm1', name: 'Priyanshu Sharma', relation: 'Primary', income: 125000, expenses: 35000 },
    { id: 'fm2', name: 'Priya Sharma', relation: 'Spouse', income: 85000, expenses: 20000 },
  ]);

  const [familyBillsState, setFamilyBillsState] = useState([
    { id: 'b1', name: 'Apartment Rent & Maintenance', amount: 32000, dueDate: '05th of month', assignedTo: 'Priyanshu', isPaid: true },
    { id: 'b2', name: 'Electricity & High-speed Fiber', amount: 4500, dueDate: '10th of month', assignedTo: 'Priya', isPaid: false },
    { id: 'b3', name: 'Active HDFC Vehicle EMI', amount: 15000, dueDate: '15th of month', assignedTo: 'Priyanshu', isPaid: true },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const savedGoals = await AsyncStorage.getItem('@finfam_goals');
        if (savedGoals) setFinGoals(JSON.parse(savedGoals));

        const savedProfile = await SecureStore.getItemAsync('finfam_user_profile');
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.warn('AsyncStorage fallback active');
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@finfam_goals', JSON.stringify(finGoals)).catch(() => {});
  }, [finGoals]);

  const refreshData = async () => {
    setUserProfile((prev: UserProfile) => ({ ...prev, healthScore: 86 }));
  };

  const addGoal = (newGoal: any) => {
    if (typeof newGoal === 'string') {
      const g: FinancialGoal = {
        id: `g_${Date.now()}`,
        name: newGoal,
        category: 'WEALTH_BUILDING',
        targetAmount: 1000000,
        currentAmount: 0,
        targetYear: 2030,
        priority: 2,
        currentMonthlySip: 10000,
        expectedReturnRate: 0.12,
        inflationRate: 0.06,
      };
      setFinGoals((prev: FinancialGoal[]) => [...prev, g]);
    } else {
      setFinGoals((prev: FinancialGoal[]) => [...prev, newGoal]);
    }
  };

  const deleteGoal = (id: any) => {
    setFinGoals((prev: FinancialGoal[]) => prev.filter((g) => g.id !== id && String(g.id) !== String(id)));
  };

  const depositGoal = (id: number, amount: number) => {
    setFinGoals((prev: FinancialGoal[]) =>
      prev.map((g) => (g.id === String(id) ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );
  };

  const runSimulation = (params: any): MultiGoalFeasibilityReport => {
    const score = Math.min(0.96, 0.78 + (params.incomeBumpPercent || 0) * 0.01);
    return {
      overallFeasibilityScore: score,
      goalAnalysis: finGoals.map((g) => ({
        goalId: g.id,
        goalName: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        feasibilityScore: score,
        requiredSip: g.currentMonthlySip * 1.1,
        sipGap: 2000,
        inflationAdjustedTarget: g.targetAmount * 1.4,
        recommendations: ['Maintain current equity SIP allocation.'],
      })),
      conflicts: DEMO_CONFLICTS,
      downstreamRipples: [],
    };
  };

  const applyResolution = (plan: any) => {
    setUserProfile((prev: UserProfile) => ({ ...prev, healthScore: Math.round(plan.projectedFeasibility * 100) }));
  };

  const applyResolutionScenario = (scenario: ResolutionScenario) => {};

  const addFamilyMember = (member: any) => {
    setFamilyMembersState((prev) => [
      ...prev,
      { id: `fm_${Date.now()}`, name: member.name, relation: member.relation, income: member.income, expenses: member.expenses },
    ]);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev: UserProfile) => ({ ...prev, ...data }));
  };

  const updateGoal = (id: number, data: Partial<GoalItem>) => {};

  const loadHackathonDemoData = () => {
    setFinGoals(DEMO_FINANCIAL_GOALS);
  };

  // Matrix construction
  const matrix: GoalInterferenceCell[][] = finGoals.map((g1, rIdx) =>
    finGoals.map((g2, cIdx) => ({
      goal1Id: g1.id,
      goal2Id: g2.id,
      interferenceScore: rIdx === cIdx ? 0 : rIdx === 0 && cIdx === 2 ? 0.75 : 0.15,
      impactType: rIdx === 0 && cIdx === 2 ? 'CASHFLOW_COLLISION' : 'INDEPENDENT',
      explanation:
        rIdx === 0 && cIdx === 2
          ? `${g1.name} withdrawal coincides with ${g2.name}, causing ₹18.5L deficit.`
          : 'Low cashflow overlap.',
    }))
  );

  const state: MobileFinFamState = {
    userEmail: userProfile.email,
    subscriptionTier: userProfile.premiumTier || 'PRO',
    overallScore: userProfile.healthScore,
    totalMonthlyIncome: familyMembersState.reduce((s, m) => s + m.income, 0),
    totalMonthlyExpenses: familyMembersState.reduce((s, m) => s + m.expenses, 0),
    goals: finGoals,
    conflicts: DEMO_CONFLICTS,
    matrix,
    feasibilityReport: {
      overallFeasibilityScore: 0.84,
      goalAnalysis: finGoals.map((g) => ({
        goalId: g.id,
        goalName: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        feasibilityScore: 0.84,
        requiredSip: g.currentMonthlySip * 1.15,
        sipGap: 3500,
        inflationAdjustedTarget: g.targetAmount * 1.45,
        recommendations: ['Step up monthly SIP by 10% annually to absorb 6% inflation.'],
      })),
      conflicts: DEMO_CONFLICTS,
      downstreamRipples: [
        {
          affectedGoalId: 'g3',
          affectedGoalName: 'Vacation Home Purchase',
          causalFactor: 'Liquidity drain from Daughter Education in 2032',
          feasibilityImpact: 0.22,
          forcedDelayYears: 2,
          additionalDeficit: 1850000,
          severity: 'HIGH',
        },
      ],
    },
    resolutionPlans: DEMO_RESOLUTION_PLANS,
    familyMembers: familyMembersState,
    familyBills: familyBillsState,
  };

  const financialCapacity: FinancialCapacityResult = {
    monthlyIncome: state.totalMonthlyIncome,
    essentialExpenses: state.totalMonthlyExpenses,
    totalActiveEMI: 15000,
    availableCapacity: state.totalMonthlyIncome - state.totalMonthlyExpenses - 15000,
    dtiRatio: 0.12,
    discretionarySurplus: 40000,
  };

  const goalPortfolioSummary: GoalPortfolioSummary = {
    totalTargetCapital: finGoals.reduce((s, g) => s + g.targetAmount, 0),
    totalCurrentSavings: finGoals.reduce((s, g) => s + g.currentAmount, 0),
    overallFeasibilityScore: 0.84,
    conflicts: [],
    recommendedTotalSip: finGoals.reduce((s, g) => s + g.currentMonthlySip, 0),
  };

  return (
    <MobileFinFamContext.Provider
      value={{
        state,
        userProfile,
        goals,
        emis,
        bills,
        familyMembers: [],
        financialCapacity,
        goalFeasibilities: [],
        goalConflicts: [],
        goalPortfolioSummary,
        refreshData,
        loadHackathonDemoData,
        updateGoal,
        addGoal,
        deleteGoal,
        depositGoal,
        runSimulation,
        applyResolution,
        applyResolutionScenario,
        addFamilyMember,
        updateProfile,
      }}
    >
      {children}
    </MobileFinFamContext.Provider>
  );
};

export const useMobileFinFam = () => {
  const context = useContext(MobileFinFamContext);
  if (!context) {
    throw new Error('useMobileFinFam must be used within MobileFinFamProvider');
  }
  return context;
};
