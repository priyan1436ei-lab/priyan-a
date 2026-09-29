import {
  DecisionCriterion,
  DecisionConstraint,
  DecisionAlternative
} from '../../types/decisionOptimizer';

export const DEFAULT_DECISION_CRITERIA: DecisionCriterion[] = [
  {
    key: 'LIQUIDITY',
    name: 'Liquidity & Access',
    shortName: 'Liquidity',
    description: 'Ease and speed of accessing capital without lock-in or early withdrawal exit penalties.',
    weight: 0.20,
    isBeneficial: true,
    unit: '/10',
    minRange: 1,
    maxRange: 10
  },
  {
    key: 'RETURN_ROI',
    name: 'Expected Annual Return (CAGR / Yield)',
    shortName: 'Return',
    description: 'Projected annualized pre-tax or post-tax yield over a multi-year horizon.',
    weight: 0.25,
    isBeneficial: true,
    unit: '%',
    minRange: 0,
    maxRange: 20
  },
  {
    key: 'RISK_SAFETY',
    name: 'Capital Preservation & Safety',
    shortName: 'Safety',
    description: 'Protection of principal against market drawdowns, credit defaults, or negative shocks.',
    weight: 0.20,
    isBeneficial: true,
    unit: '/10',
    minRange: 1,
    maxRange: 10
  },
  {
    key: 'DEBT_REDUCTION',
    name: 'Debt & Interest Burden Relief',
    shortName: 'Debt Impact',
    description: 'Direct reduction of outstanding liabilities and saving future monthly interest outflows.',
    weight: 0.15,
    isBeneficial: true,
    unit: '/10',
    minRange: 0,
    maxRange: 10
  },
  {
    key: 'TAX_EFFICIENCY',
    name: 'Tax Savings & LTCG Efficiency',
    shortName: 'Tax Saving',
    description: 'Eligibility for deductions (Sec 80C, 24b) and lower effective long-term tax rates.',
    weight: 0.10,
    isBeneficial: true,
    unit: '%',
    minRange: 0,
    maxRange: 35
  },
  {
    key: 'TIMELINE_FLEXIBILITY',
    name: 'Tenure Horizon & Agility',
    shortName: 'Flexibility',
    description: 'Flexibility to adapt capital as household life milestones and urgent goals change.',
    weight: 0.10,
    isBeneficial: true,
    unit: '/10',
    minRange: 1,
    maxRange: 10
  }
];

export interface ScenarioPreset {
  id: string;
  title: string;
  categoryTag: string;
  dilemmaDescription: string;
  capitalAmount: number;
  criteria: DecisionCriterion[];
  constraints: DecisionConstraint[];
  alternatives: DecisionAlternative[];
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'preset_surplus_50k',
    title: 'Monthly Surplus Allocation: ₹50,000',
    categoryTag: 'Monthly Cashflow',
    dilemmaDescription: 'Our household has ₹50,000 surplus this month. Should we bolster our emergency liquid buffer, accelerate EMI payoff on the two-wheeler loan, or deploy into diversified index equity?',
    capitalAmount: 50000,
    criteria: DEFAULT_DECISION_CRITERIA,
    constraints: [
      {
        id: 'c_min_buffer',
        name: 'Min Reserve Retention',
        type: 'HARD',
        metricKey: 'postLiquidityBuffer',
        operator: '>=',
        targetValue: 60000,
        unit: '₹',
        description: 'Post-allocation household buffer must stay above ₹60,000'
      },
      {
        id: 'c_max_risk',
        name: 'Risk Ceiling',
        type: 'HARD',
        metricKey: 'riskScore',
        operator: '<=',
        targetValue: 8.0,
        unit: '/10',
        description: 'Max acceptable risk rating is 8.0'
      },
      {
        id: 'c_lock_in',
        name: 'Lock-in Period',
        type: 'SOFT',
        metricKey: 'lockInMonths',
        operator: '<=',
        targetValue: 12,
        unit: 'Mo',
        description: 'Prefers under 12 months lock-in'
      }
    ],
    alternatives: [
      {
        id: 'alt_emergency_fund',
        title: 'Emergency Liquid Reserve Top-Up',
        category: 'EMERGENCY_BUFFER',
        description: 'Park funds into an instant-access High-Yield Savings Account / Overnight Liquid Fund.',
        allocationAmount: 50000,
        badge: 'Zero Risk',
        iconName: 'ShieldAlert',
        rawCriteriaValues: {
          LIQUIDITY: 10,
          RETURN_ROI: 6.8,
          RISK_SAFETY: 10,
          DEBT_REDUCTION: 0,
          TAX_EFFICIENCY: 10,
          TIMELINE_FLEXIBILITY: 10
        },
        constraintValues: {
          postLiquidityBuffer: 122500,
          riskScore: 1.0,
          lockInMonths: 0,
          expectedReturnRate: 6.8
        }
      },
      {
        id: 'alt_emi_prepayment',
        title: 'HDFC Bike Loan Prepayment',
        category: 'DEBT_REPAYMENT',
        description: 'Prepay ₹50,000 principal on the 12.5% two-wheeler loan, shaving 13 months off tenure.',
        allocationAmount: 50000,
        badge: 'Guaranteed 12.5% Tax-Free',
        iconName: 'Banknote',
        rawCriteriaValues: {
          LIQUIDITY: 3,
          RETURN_ROI: 12.5, // Effective return is the avoided interest
          RISK_SAFETY: 10,
          DEBT_REDUCTION: 10,
          TAX_EFFICIENCY: 20,
          TIMELINE_FLEXIBILITY: 4
        },
        constraintValues: {
          postLiquidityBuffer: 72500,
          riskScore: 1.0,
          lockInMonths: 0,
          expectedReturnRate: 12.5
        }
      },
      {
        id: 'alt_equity_index',
        title: 'Nifty 50 & Flexi-Cap Equity SIP',
        category: 'EQUITY_INVESTMENT',
        description: 'Invest into low-cost index funds targeting long-term wealth compounding (13-14% historical CAGR).',
        allocationAmount: 50000,
        badge: 'High Growth',
        iconName: 'TrendingUp',
        rawCriteriaValues: {
          LIQUIDITY: 8,
          RETURN_ROI: 13.8,
          RISK_SAFETY: 5.5,
          DEBT_REDUCTION: 0,
          TAX_EFFICIENCY: 25,
          TIMELINE_FLEXIBILITY: 8
        },
        constraintValues: {
          postLiquidityBuffer: 72500,
          riskScore: 6.5,
          lockInMonths: 0,
          expectedReturnRate: 13.8
        }
      },
      {
        id: 'alt_hybrid_balanced',
        title: '50/50 Split (₹25k Loan Prepay + ₹25k Equity)',
        category: 'CUSTOM',
        description: 'A balanced compromise: cut interest payments immediately while participating in equity growth.',
        allocationAmount: 50000,
        badge: 'Balanced Stance',
        iconName: 'Scale',
        rawCriteriaValues: {
          LIQUIDITY: 6,
          RETURN_ROI: 13.1,
          RISK_SAFETY: 8,
          DEBT_REDUCTION: 5,
          TAX_EFFICIENCY: 22,
          TIMELINE_FLEXIBILITY: 7
        },
        constraintValues: {
          postLiquidityBuffer: 72500,
          riskScore: 3.8,
          lockInMonths: 0,
          expectedReturnRate: 13.1
        }
      },
      {
        id: 'alt_speculative_crypto',
        title: 'High-Beta Crypto & Small-Cap Basket',
        category: 'CUSTOM',
        description: 'Aggressive speculative allocation targeting 25%+ return but high drawdown volatility.',
        allocationAmount: 50000,
        badge: 'Speculative',
        iconName: 'Flame',
        rawCriteriaValues: {
          LIQUIDITY: 7,
          RETURN_ROI: 22.0,
          RISK_SAFETY: 1.5,
          DEBT_REDUCTION: 0,
          TAX_EFFICIENCY: 5,
          TIMELINE_FLEXIBILITY: 5
        },
        constraintValues: {
          postLiquidityBuffer: 72500,
          riskScore: 9.2, // Will fail the risk <= 8.0 constraint!
          lockInMonths: 0,
          expectedReturnRate: 22.0
        }
      }
    ]
  },
  {
    id: 'preset_lump_sum_250k',
    title: 'Bonus / Lump Sum Allocation: ₹2,50,000',
    categoryTag: 'Lump Sum Dilemma',
    dilemmaDescription: 'Received an annual performance bonus of ₹2.5 Lakhs. Should we clear our high-cost debts, lock in 7.4% fixed deposit interest, or invest via STP into equity?',
    capitalAmount: 250000,
    criteria: DEFAULT_DECISION_CRITERIA,
    constraints: [
      {
        id: 'c_buffer_floor',
        name: 'Min Household Reserve',
        type: 'HARD',
        metricKey: 'postLiquidityBuffer',
        operator: '>=',
        targetValue: 70000,
        unit: '₹',
        description: 'Preserve at least ₹70,000 in liquid assets'
      },
      {
        id: 'c_risk_limit',
        name: 'Max Risk Level',
        type: 'HARD',
        metricKey: 'riskScore',
        operator: '<=',
        targetValue: 7.0,
        unit: '/10',
        description: 'Maximum risk ceiling'
      }
    ],
    alternatives: [
      {
        id: 'alt_debt_wipeout',
        title: 'Full Outstanding Debt Wipeout',
        category: 'DEBT_REPAYMENT',
        description: 'Completely eliminate all consumer debts and bike EMI. Boosts monthly disposable income by ₹4,200/month immediately.',
        allocationAmount: 250000,
        badge: 'Immediate Cashflow Boost',
        iconName: 'CheckCircle2',
        rawCriteriaValues: {
          LIQUIDITY: 4,
          RETURN_ROI: 12.0,
          RISK_SAFETY: 10,
          DEBT_REDUCTION: 10,
          TAX_EFFICIENCY: 15,
          TIMELINE_FLEXIBILITY: 5
        },
        constraintValues: {
          postLiquidityBuffer: 72500,
          riskScore: 1.0,
          lockInMonths: 0,
          expectedReturnRate: 12.0
        }
      },
      {
        id: 'alt_equity_stp',
        title: 'Systematic Transfer Plan (STP) to Equity',
        category: 'EQUITY_INVESTMENT',
        description: 'Park ₹2.5L in liquid fund at 6.8% and transfer ₹25k/month systematically into Flexi-cap equity.',
        allocationAmount: 250000,
        badge: 'Rupee Cost Averaging',
        iconName: 'TrendingUp',
        rawCriteriaValues: {
          LIQUIDITY: 7.5,
          RETURN_ROI: 13.2,
          RISK_SAFETY: 6.8,
          DEBT_REDUCTION: 0,
          TAX_EFFICIENCY: 25,
          TIMELINE_FLEXIBILITY: 8
        },
        constraintValues: {
          postLiquidityBuffer: 95000,
          riskScore: 5.0,
          lockInMonths: 10,
          expectedReturnRate: 13.2
        }
      },
      {
        id: 'alt_multi_asset_vault',
        title: 'Family Multi-Asset Shield (60% Debt, 30% Equity, 10% Gold)',
        category: 'GOLD_HYBRID',
        description: 'All-weather asset allocation providing steady compounding with low drawdown risk.',
        allocationAmount: 250000,
        badge: 'All-Weather Shield',
        iconName: 'Shield',
        rawCriteriaValues: {
          LIQUIDITY: 7.0,
          RETURN_ROI: 10.5,
          RISK_SAFETY: 8.8,
          DEBT_REDUCTION: 2,
          TAX_EFFICIENCY: 20,
          TIMELINE_FLEXIBILITY: 7.5
        },
        constraintValues: {
          postLiquidityBuffer: 90000,
          riskScore: 3.5,
          lockInMonths: 6,
          expectedReturnRate: 10.5
        }
      }
    ]
  }
];
