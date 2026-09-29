import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserProfile,
  TransactionItem,
  BudgetItem,
  GoalItem,
  BillItem,
  FamilyMemberItem,
  EmiItem,
  FinancialHealth,
  FinancialHealthAxis,
  MonthlySpendingTrendsState,
  TimeHorizonType,
  DailySpendDataPoint,
  WeeklySpendBar,
  FamilyContributionShare,
  ExpensePrediction,
  NotificationAlertItem,
  ReceiptScanResult,
  ChatMessage,
  RealTimeTransferRecord,
  LivePeerNode,
  RazorpayTransactionRecord,
  SubscriptionPlanTier,
  RealTimeTransferType,
  FamilyWorkspaceItem,
  FamilyInvitationItem,
  FamilyActivityItem,
  FinFamUpiTransaction,
  FinFamWalletData,
  UpiPaymentStatus,
  FinFamPaymentType
} from '../types';
import {
  FinancialCapacityResult,
  GoalFeasibilityResult,
  GoalConflictItem,
  GoalPortfolioSummary,
  ResolutionScenario
} from '../types/goalPlanning';
import {
  FinancialCapacityEngine,
  GoalFeasibilityEngine,
  GoalConflictEngine,
  GoalPortfolioEngine,
  HACKATHON_DEMO_DATA
} from '../lib/goalPlanning';
import { DecisionHistoryRecord } from '../types/decisionOptimizer';
import { FinancialEngine } from '../lib/financialEngine';
import { SpendingTrendsEngine } from '../lib/spendingTrendsEngine';
import { GeminiAiEngine } from '../lib/geminiAiEngine';

const INITIAL_DECISION_HISTORY: DecisionHistoryRecord[] = [
  {
    id: 'dec_sample_01',
    timestamp: Date.now() - 86400000 * 2,
    scenarioTitle: 'Allocation of ₹50,000 Surplus',
    capitalAmount: 50000,
    winningAlternativeId: 'alt_emergency_fund',
    winningAlternativeTitle: 'Liquid Emergency Reserve Fund',
    winningScore: 88,
    confidenceScore: 84,
    confidenceTier: 'HIGH',
    implementationStatus: 'IMPLEMENTED',
    criteriaWeightsSnapshot: {
      LIQUIDITY: 0.25,
      RETURN_ROI: 0.20,
      RISK_SAFETY: 0.25,
      DEBT_REDUCTION: 0.15,
      TAX_EFFICIENCY: 0.05,
      TIMELINE_FLEXIBILITY: 0.10
    },
    topTradeOffSummary: 'Sacrifices 4.5% equity upside to guarantee 0-day liquidity and zero capital loss risk.'
  }
];

const INITIAL_PROFILE: UserProfile = {
  id: 1,
  name: 'Priyanshu Sharma',
  email: 'priyan1436ei@gmail.com',
  phone: '+91 98765 43210',
  currencySymbol: '₹',
  totalBalance: 84500.0,
  monthlyIncome: 65000.0,
  monthlyExpenses: 38250.0,
  monthlySavings: 26750.0,
  emergencyFund: 72500.0,
  healthScore: 82,
  previousHealthScore: 76,
  isPremium: false,
  premiumTier: 'FREE',
  premiumValidUntil: 'N/A',
  familyId: 'fam_sharma_001',
  familyName: 'Sharma Family Vault',
  familyRole: 'Owner',
  isBiometricEnabled: true,
  isNotificationsEnabled: true,
  unreadNotificationsCount: 2
};

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 1,
    title: 'Nature\'s Basket Grocery Store',
    category: 'Food',
    amount: 1845.0,
    type: 'EXPENSE',
    isCredit: false,
    date: '21 Aug 2026',
    timestamp: Date.now() - 3600000 * 2,
    paymentMethod: 'UPI',
    notes: 'Weekly fresh vegetables & almond milk',
    isFamilyShared: true,
    memberName: 'Priyanshu',
    iconName: 'Utensils',
    riskStatus: 'VERIFIED'
  },
  {
    id: 2,
    title: 'Monthly Salary Credit',
    category: 'Salary',
    amount: 65000.0,
    type: 'INCOME',
    isCredit: true,
    date: '01 Aug 2026',
    timestamp: Date.now() - 86400000 * 20,
    paymentMethod: 'Net Banking',
    notes: 'August 2026 Corporate Payroll',
    isFamilyShared: true,
    memberName: 'Priyanshu',
    iconName: 'Building2',
    riskStatus: 'VERIFIED'
  },
  {
    id: 3,
    title: 'HDFC Bank Bike EMI',
    category: 'Vehicle',
    amount: 4200.0,
    type: 'PAYMENT',
    isCredit: false,
    date: '05 Aug 2026',
    timestamp: Date.now() - 86400000 * 16,
    paymentMethod: 'Auto Debit',
    notes: 'Month 14/24 Royal Enfield Hunter 350',
    isFamilyShared: false,
    memberName: 'Priyanshu',
    iconName: 'Bike',
    riskStatus: 'VERIFIED'
  },
  {
    id: 4,
    title: 'Airtel Xstream Fiber Broadband',
    category: 'Bills',
    amount: 1179.0,
    type: 'EXPENSE',
    isCredit: false,
    date: '12 Aug 2026',
    timestamp: Date.now() - 86400000 * 9,
    paymentMethod: 'UPI',
    notes: 'Gigabit 300 Mbps Unlimited Wifi',
    isFamilyShared: true,
    memberName: 'Rajesh (Father)',
    iconName: 'Wifi',
    riskStatus: 'VERIFIED'
  },
  {
    id: 5,
    title: 'Amazon Fresh & Household Supplies',
    category: 'Shopping',
    amount: 2450.0,
    type: 'EXPENSE',
    isCredit: false,
    date: '15 Aug 2026',
    timestamp: Date.now() - 86400000 * 6,
    paymentMethod: 'RuPay Credit Card',
    notes: 'Detergents, oils & household utilities',
    isFamilyShared: true,
    memberName: 'Sunita (Mother)',
    iconName: 'ShoppingBag',
    riskStatus: 'VERIFIED'
  },
  {
    id: 6,
    title: 'Indian Oil Fuel XP95',
    category: 'Travel',
    amount: 1500.0,
    type: 'EXPENSE',
    isCredit: false,
    date: '18 Aug 2026',
    timestamp: Date.now() - 86400000 * 3,
    paymentMethod: 'UPI',
    notes: '14.8 Litres Premium Petrol',
    isFamilyShared: false,
    memberName: 'Priyanshu',
    iconName: 'Car',
    riskStatus: 'VERIFIED'
  },
  {
    id: 7,
    title: 'Freelance UI/UX Consulting Inflow',
    category: 'Freelance',
    amount: 12500.0,
    type: 'INCOME',
    isCredit: true,
    date: '19 Aug 2026',
    timestamp: Date.now() - 86400000 * 2,
    paymentMethod: 'IMPS',
    notes: 'Design sprint milestone completion',
    isFamilyShared: false,
    memberName: 'Priyanshu',
    iconName: 'Sparkles',
    riskStatus: 'VERIFIED'
  }
];

const INITIAL_BUDGETS: BudgetItem[] = [
  { id: 1, category: 'Food & Dining', monthlyLimit: 8500, spent: 5800, month: 'August 2026', iconName: 'Utensils', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true },
  { id: 2, category: 'Rent & Housing', monthlyLimit: 18000, spent: 18000, month: 'August 2026', iconName: 'Home', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true },
  { id: 3, category: 'Bills & Utilities', monthlyLimit: 4000, spent: 3200, month: 'August 2026', iconName: 'Zap', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true },
  { id: 4, category: 'Shopping & Clothes', monthlyLimit: 4500, spent: 2450, month: 'August 2026', iconName: 'ShoppingBag', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true },
  { id: 5, category: 'Travel & Commute', monthlyLimit: 3000, spent: 2100, month: 'August 2026', iconName: 'Car', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true },
  { id: 6, category: 'Entertainment & OTT', monthlyLimit: 2000, spent: 1600, month: 'August 2026', iconName: 'Tv', alertThreshold80: true, alertThreshold90: true, alertThreshold100: true }
];

const INITIAL_GOALS: GoalItem[] = [
  {
    id: 1,
    name: 'Emergency Shield Reserve',
    emoji: '🛡️',
    targetAmount: 200000,
    currentAmount: 100000,
    targetDate: 'Dec 2027',
    category: 'Emergency',
    monthlyContribution: 5000,
    priority: 'CRITICAL',
    priorityLabel: 'CRITICAL',
    hardDeadline: true,
    deadlineFlexibilityMonths: 0,
    minimumAcceptableAmount: 200000,
    expectedAnnualReturn: 5,
    inflationRate: 5,
    riskTolerance: 'CONSERVATIVE',
    essentiality: 'MANDATORY',
    canPause: false,
    canReduceTarget: false,
    isFamilyGoal: true,
    familyMemberOwner: 'Priyanshu Sharma'
  },
  {
    id: 2,
    name: 'Family Dream Home Purchase',
    emoji: '🏡',
    targetAmount: 1000000,
    currentAmount: 200000,
    targetDate: 'Dec 2030',
    category: 'Real Estate',
    monthlyContribution: 18000,
    priority: 'HIGH',
    priorityLabel: 'HIGH',
    hardDeadline: true,
    deadlineFlexibilityMonths: 0,
    minimumAcceptableAmount: 850000,
    expectedAnnualReturn: 8,
    inflationRate: 6,
    riskTolerance: 'MODERATE',
    essentiality: 'MANDATORY',
    canPause: false,
    canReduceTarget: true,
    isFamilyGoal: true,
    familyMemberOwner: 'Family Shared'
  },
  {
    id: 3,
    name: 'Ananya Higher Education Fund',
    emoji: '🎓',
    targetAmount: 500000,
    currentAmount: 100000,
    targetDate: 'Aug 2029',
    category: 'Education',
    monthlyContribution: 15000,
    priority: 'HIGH',
    priorityLabel: 'HIGH',
    hardDeadline: true,
    deadlineFlexibilityMonths: 6,
    minimumAcceptableAmount: 400000,
    expectedAnnualReturn: 8,
    inflationRate: 7,
    riskTolerance: 'CONSERVATIVE',
    essentiality: 'MANDATORY',
    canPause: false,
    canReduceTarget: true,
    isFamilyGoal: true,
    familyMemberOwner: 'Ananya Sharma'
  },
  {
    id: 4,
    name: 'Long-Term Retirement Corpus',
    emoji: '🏖️',
    targetAmount: 2000000,
    currentAmount: 300000,
    targetDate: 'Dec 2040',
    category: 'Retirement',
    monthlyContribution: 10000,
    priority: 'MEDIUM',
    priorityLabel: 'MEDIUM',
    hardDeadline: false,
    deadlineFlexibilityMonths: 24,
    minimumAcceptableAmount: 1500000,
    expectedAnnualReturn: 10,
    inflationRate: 6,
    riskTolerance: 'AGGRESSIVE',
    essentiality: 'IMPORTANT',
    canPause: true,
    canReduceTarget: true,
    isFamilyGoal: true,
    familyMemberOwner: 'Rajesh & Sunita'
  }
];

const INITIAL_BILLS: BillItem[] = [
  { id: 1, name: 'Torrent Power Electricity', amount: 2340, dueDate: '25 Aug 2026', dueTimestamp: Date.now() + 86400000 * 4, category: 'Electricity', isRecurring: true, isPaid: false, reminderDays: 3, autoPayEnabled: true },
  { id: 2, name: 'Airtel Xstream Fiber Broadband', amount: 1179, dueDate: '22 Aug 2026', dueTimestamp: Date.now() + 86400000 * 1, category: 'Internet', isRecurring: true, isPaid: false, reminderDays: 2, autoPayEnabled: false },
  { id: 3, name: 'Star Health Family Insurance', amount: 4850, dueDate: '02 Sep 2026', dueTimestamp: Date.now() + 86400000 * 12, category: 'Insurance', isRecurring: true, isPaid: false, reminderDays: 5, autoPayEnabled: true },
  { id: 4, name: 'Indane LPG Gas Cylinder', amount: 825, dueDate: '15 Aug 2026', dueTimestamp: Date.now() - 86400000 * 6, category: 'Gas', isRecurring: false, isPaid: true, reminderDays: 1, autoPayEnabled: false }
];

const INITIAL_FAMILY: FamilyMemberItem[] = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    role: 'Father',
    email: 'rajesh.sharma@example.com',
    avatarColor: '#10B981',
    monthlyContribution: 80000,
    spentThisMonth: 32000,
    salaryIncome: 80000,
    freelanceIncome: 0,
    businessIncome: 0,
    rentalIncome: 15000,
    otherIncome: 0,
    foodExpense: 8000,
    transportExpense: 4000,
    shoppingExpense: 3000,
    educationExpense: 10000,
    healthExpense: 3000,
    entertainmentExpense: 4000,
    bankSavings: 150000,
    emergencyFund: 45000,
    fixedDeposit: 300000,
    mutualFund: 250000,
    monthlyEmi: 0,
    equityInvestments: 180000,
    goldInvestments: 200000,
    ppfInvestments: 150000,
    fdInterest: 21000,
    rdInterest: 6000,
    savingsInterest: 4500,
    investmentReturns: 32000
  },
  {
    id: 2,
    name: 'Sunita Sharma',
    role: 'Mother',
    email: 'sunita.sharma@example.com',
    avatarColor: '#06B6D4',
    monthlyContribution: 60000,
    spentThisMonth: 24000,
    salaryIncome: 55000,
    freelanceIncome: 5000,
    businessIncome: 0,
    rentalIncome: 0,
    otherIncome: 0,
    foodExpense: 10000,
    transportExpense: 2000,
    shoppingExpense: 6000,
    educationExpense: 2000,
    healthExpense: 2000,
    entertainmentExpense: 2000,
    bankSavings: 90000,
    emergencyFund: 27500,
    fixedDeposit: 150000,
    mutualFund: 120000,
    monthlyEmi: 0,
    equityInvestments: 75000,
    goldInvestments: 350000,
    ppfInvestments: 100000,
    fdInterest: 10500,
    rdInterest: 3000,
    savingsInterest: 2700,
    investmentReturns: 14000
  },
  {
    id: 3,
    name: 'Priyanshu Sharma',
    role: 'Son (You)',
    email: 'priyan1436ei@gmail.com',
    avatarColor: '#3B82F6',
    monthlyContribution: 40000,
    spentThisMonth: 16000,
    salaryIncome: 65000,
    freelanceIncome: 12500,
    businessIncome: 0,
    rentalIncome: 0,
    otherIncome: 0,
    foodExpense: 4500,
    transportExpense: 2500,
    shoppingExpense: 3500,
    educationExpense: 0,
    healthExpense: 1000,
    entertainmentExpense: 4500,
    bankSavings: 84500,
    emergencyFund: 72500,
    fixedDeposit: 100000,
    mutualFund: 185000,
    monthlyEmi: 4200,
    equityInvestments: 220000,
    goldInvestments: 50000,
    ppfInvestments: 60000,
    fdInterest: 7000,
    rdInterest: 0,
    savingsInterest: 2500,
    investmentReturns: 28000
  },
  {
    id: 4,
    name: 'Ananya Sharma',
    role: 'Daughter',
    email: 'ananya.sharma@example.com',
    avatarColor: '#A855F7',
    monthlyContribution: 20000,
    spentThisMonth: 8000,
    salaryIncome: 25000,
    freelanceIncome: 0,
    businessIncome: 0,
    rentalIncome: 0,
    otherIncome: 0,
    foodExpense: 2500,
    transportExpense: 1500,
    shoppingExpense: 2500,
    educationExpense: 1500,
    healthExpense: 0,
    entertainmentExpense: 0,
    bankSavings: 35000,
    emergencyFund: 10000,
    fixedDeposit: 50000,
    mutualFund: 40000,
    monthlyEmi: 0,
    equityInvestments: 30000,
    goldInvestments: 25000,
    ppfInvestments: 20000,
    fdInterest: 3500,
    rdInterest: 0,
    savingsInterest: 1000,
    investmentReturns: 4500
  }
];

const INITIAL_EMIS: EmiItem[] = [
  {
    id: 1,
    title: 'Royal Enfield Hunter 350 Bike',
    category: 'Vehicle',
    totalAmount: 120000.0,
    paidAmount: 58800.0,
    monthlyEmi: 4200.0,
    interestRate: 9.5,
    totalTenureMonths: 24,
    paidTenureMonths: 14,
    dueDate: '05th of every month',
    dueDayOfMonth: 5,
    lenderBank: 'HDFC Bank Auto Loan',
    isAutoDebit: true,
    isPaidThisMonth: true,
    lastPaymentDate: '05 Aug 2026',
    iconName: 'Bike'
  },
  {
    id: 2,
    title: 'MacBook Pro M3 Max Workstation',
    category: 'Electronics',
    totalAmount: 85000.0,
    paidAmount: 42500.0,
    monthlyEmi: 7083.0,
    interestRate: 0.0,
    totalTenureMonths: 12,
    paidTenureMonths: 6,
    dueDate: '10th of every month',
    dueDayOfMonth: 10,
    lenderBank: 'Bajaj Finserv No-Cost',
    isAutoDebit: true,
    isPaidThisMonth: false,
    lastPaymentDate: '10 Jul 2026',
    iconName: 'Laptop'
  }
];

const INITIAL_RADAR_AXES: FinancialHealthAxis[] = [
  { categoryName: 'Savings', score: 88, maxScore: 100, metricFormatted: '41% of Income', status: 'Optimal', statusColor: '#10B981' },
  { categoryName: 'Debt', score: 85, maxScore: 100, metricFormatted: '11% DTI Ratio', status: 'Optimal', statusColor: '#10B981' },
  { categoryName: 'Spending', score: 76, maxScore: 100, metricFormatted: '₹38,250 Discretionary', status: 'Strong', statusColor: '#06B6D4' },
  { categoryName: 'Investments', score: 82, maxScore: 100, metricFormatted: '₹4.8L Active SIPs', status: 'Optimal', statusColor: '#10B981' },
  { categoryName: 'Budget', score: 80, maxScore: 100, metricFormatted: '92% Adherence', status: 'Strong', statusColor: '#06B6D4' },
  { categoryName: 'Emergency', score: 79, maxScore: 100, metricFormatted: '1.9 Months Buffer', status: 'Strong', statusColor: '#06B6D4' }
];

const INITIAL_NOTIFICATIONS: NotificationAlertItem[] = [
  {
    id: 'notif_bill_due',
    title: 'Bill Due Tomorrow',
    message: 'Airtel Xstream Fiber Broadband (₹1,179) is due tomorrow. Auto-pay scheduled.',
    type: 'BILL_DUE_TOMORROW',
    timeAgo: '10 mins ago',
    isUnread: true,
    actionRoute: 'family',
    amountFormatted: '₹1,179'
  },
  {
    id: 'notif_budget_crossed',
    title: 'Budget Crossed Warning',
    message: 'Food & Dining budget reached 68.2%. AI predicts overflow by ₹1,900 by Day 28.',
    type: 'BUDGET_CROSSED',
    timeAgo: '1 hour ago',
    isUnread: true,
    actionRoute: 'trends',
    amountFormatted: '₹1,900'
  },
  {
    id: 'notif_score_increased',
    title: 'Financial Health Score Increased',
    message: 'Your score improved by +6 points to 82/100 (Tier: Excellent) thanks to early debt reduction.',
    type: 'SCORE_INCREASED',
    timeAgo: '3 hours ago',
    isUnread: false,
    actionRoute: 'analytics',
    amountFormatted: '+6 pts'
  },
  {
    id: 'notif_goal_reached',
    title: 'Savings Goal Milestone Reached',
    message: 'Emergency Reserve Fund reached 72.5% milestone! ₹72,500 deposited.',
    type: 'SAVINGS_GOAL_REACHED',
    timeAgo: 'Yesterday',
    isUnread: false,
    actionRoute: 'goals',
    amountFormatted: '₹72,500'
  },
  {
    id: 'notif_payment_success',
    title: 'Payment Successful',
    message: '₹199.00 paid for FinFam Pro Monthly Subscription via Razorpay UPI. Verified.',
    type: 'PAYMENT_SUCCESS',
    timeAgo: '2 days ago',
    isUnread: false,
    actionRoute: 'payment',
    amountFormatted: '₹199'
  }
];

const INITIAL_PEER_NODES: LivePeerNode[] = [
  {
    id: 'peer_priya',
    name: 'Priya Sharma',
    relationship: 'Spouse',
    vpa: 'priya.sharma@okaxis',
    ipAddress: '192.168.1.44:8443',
    pingMs: 11,
    isOnline: true,
    avatarColorHex: '#7C3AED',
    lastSyncText: 'Live (2s ago)'
  },
  {
    id: 'peer_aarav',
    name: 'Aarav Sharma',
    relationship: 'Son',
    vpa: 'aarav.junior@okicici',
    ipAddress: '192.168.1.48:8443',
    pingMs: 16,
    isOnline: true,
    avatarColorHex: '#00E5FF',
    lastSyncText: 'Live (12s ago)'
  },
  {
    id: 'peer_sunita',
    name: 'Sunita Sharma',
    relationship: 'Mother',
    vpa: 'sunita.sharma@oksbi',
    ipAddress: '192.168.1.52:8443',
    pingMs: 22,
    isOnline: true,
    avatarColorHex: '#10B981',
    lastSyncText: 'Online'
  },
  {
    id: 'peer_vault',
    name: 'Encrypted Family Backup Beam',
    relationship: 'Vault Cloud',
    vpa: 'sync://vault.finfam.cloud',
    ipAddress: '10.0.4.18:443',
    pingMs: 8,
    isOnline: true,
    avatarColorHex: '#3B82F6',
    lastSyncText: 'Synchronized'
  }
];

const INITIAL_TRANSFER_HISTORY: RealTimeTransferRecord[] = [
  {
    id: 'TXN-8F92BA01',
    utrNumber: 'UTR429184029103',
    senderName: 'Priyanshu Sharma (Vault)',
    senderVpaOrAcc: 'priyan1436ei@okhdfcbank',
    receiverName: 'Priya Sharma (Spouse)',
    receiverVpaOrAcc: 'priya.sharma@okaxis',
    amount: 15000.0,
    transferType: 'FAMILY_ALLOWANCE',
    status: 'SETTLED',
    protocol: 'WSS://finfam.sync.p2p • AES-256',
    latencyMs: 12,
    note: 'Monthly Household & Groceries Vault Pool',
    timestampFormatted: '10 mins ago'
  },
  {
    id: 'TXN-7E14C920',
    utrNumber: 'UTR429183928174',
    senderName: 'Priyanshu Sharma',
    senderVpaOrAcc: 'priyan1436ei@okhdfcbank',
    receiverName: 'Family Cloud Vault',
    receiverVpaOrAcc: 'sync://vault.finfam.cloud',
    payloadSizeKb: 248.6,
    transferType: 'DATA_SYNC_BEAM',
    status: 'SETTLED',
    protocol: 'WSS://finfam.sync.p2p • AES-256',
    latencyMs: 9,
    note: 'Automated Budget & EMI Ledger Sync',
    timestampFormatted: '42 mins ago'
  },
  {
    id: 'TXN-5C38190F',
    utrNumber: 'UTR429181029482',
    senderName: 'Priyanshu Sharma',
    senderVpaOrAcc: 'priyan1436ei@okhdfcbank',
    receiverName: 'Aarav Sharma (Son)',
    receiverVpaOrAcc: 'aarav.junior@okicici',
    amount: 2500.0,
    transferType: 'FUNDS_TRANSFER',
    status: 'SETTLED',
    protocol: 'NPCI-IMPS-LIVE • AES-256',
    latencyMs: 15,
    note: 'Weekly School & Coding Camp Allowance',
    timestampFormatted: 'Yesterday, 04:30 PM'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlanTier[] = [
  {
    id: 'finfam_premium_one_time',
    title: 'FinFam Premium (1 Year)',
    amountInr: 1.0,
    amountPaise: 100,
    durationDays: 365,
    badge: 'SPECIAL OFFER • ₹1 ONLY',
    recommended: true,
    features: [
      'Save multiple what-if scenarios',
      'Compare resolution plans',
      'Export financial reports (PDF & CSV)',
      'Advanced goal timeline views'
    ]
  },
  {
    id: 'premium_monthly',
    title: 'FinFam Pro Monthly',
    amountInr: 199.0,
    amountPaise: 19900,
    durationDays: 30,
    badge: 'FLEXIBLE',
    features: [
      'Unlimited Family Members & Vault Sync',
      'Interactive Smart EMI & Amortization Engine',
      'Real-Time P2P Funds Beam (Sub-second)',
      'OCR Digital Receipt Scanning & Categorization',
      'AI Advisor with Custom Household Insights'
    ]
  },
  {
    id: 'premium_annual',
    title: 'FinFam Pro Annual',
    amountInr: 1499.0,
    amountPaise: 149900,
    durationDays: 365,
    badge: 'POPULAR • SAVE 37%',
    recommended: true,
    features: [
      'Everything in Monthly Plan',
      'Advanced 24-Month Trend Modeling & Forecasts',
      'UPI Anti-Scam Intent Shield (256-bit)',
      'Multi-device Real-Time Ledger Mesh',
      'Priority Financial Coach Advisory'
    ]
  },
  {
    id: 'premium_lifetime',
    title: 'Lifetime Founder Shield',
    amountInr: 3999.0,
    amountPaise: 399900,
    durationDays: 36500,
    badge: 'ONE-TIME • LIFETIME ACCESS',
    features: [
      'Permanent Lifetime Access for Whole Household',
      'Unlimited Automated Bill Payment Integrations',
      'VIP Dedicated Cloud Vault Backup',
      'Founder Badge & Early Beta Access',
      'Zero Gateway or Maintenance Fees Ever'
    ]
  }
];

interface FinFamContextType {
  userProfile: UserProfile;
  transactions: TransactionItem[];
  budgets: BudgetItem[];
  goals: GoalItem[];
  bills: BillItem[];
  familyMembers: FamilyMemberItem[];
  emis: EmiItem[];
  financialHealth: FinancialHealth;
  monthlySpendingTrends: MonthlySpendingTrendsState;
  spendingTrendHorizon: TimeHorizonType;
  setSpendingTrendHorizon: (h: TimeHorizonType) => void;
  spendingTrendCategory: string;
  setSpendingTrendCategory: (cat: string) => void;
  spendingTrendMultiCategories: string[];
  toggleSpendingTrendMultiCategory: (cat: string) => void;
  spendingTrendMultiLineMode: boolean;
  setSpendingTrendMultiLineMode: (enabled: boolean) => void;
  spendingTrendSelectedMonthIndex: number;
  setSpendingTrendSelectedMonth: (idx: number) => void;
  radarHealthAxes: FinancialHealthAxis[];
  isSimulatingRadarUpdates: boolean;
  togglePeriodicRadarSimulation: () => void;
  simulateRadarDataStep: () => void;
  resetRadarBaseline: () => void;
  dailySpendingPoints: DailySpendDataPoint[];
  weeklySpendingBars: WeeklySpendBar[];
  familyContributions: FamilyContributionShare[];
  expensePrediction: ExpensePrediction;
  notifications: NotificationAlertItem[];
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotificationAlert: (title: string, message: string, type: any, amountFormatted?: string) => void;
  chatMessages: ChatMessage[];
  isCoachTyping: boolean;
  askAiCoach: (prompt: string) => Promise<void>;
  scannedReceiptResult: ReceiptScanResult | null;
  isScanningReceipt: boolean;
  scanReceiptSimulator: (type?: string) => void;
  confirmScannedReceiptAsExpense: () => void;
  dismissScannedReceipt: () => void;
  liveP2pNodes: LivePeerNode[];
  realTimeTransferHistory: RealTimeTransferRecord[];
  isLiveTransferStreaming: boolean;
  executeRealTimeFundsTransfer: (
    receiverName: string,
    receiverVpa: string,
    amount: number,
    transferType: RealTimeTransferType,
    note: string
  ) => Promise<RealTimeTransferRecord>;
  paymentHistory: RazorpayTransactionRecord[];
  activePlanTier: string;
  isSubscriptionActive: boolean;
  paymentFlowState: 'IDLE' | 'CREATING_ORDER' | 'CHECKOUT_OPEN' | 'AWAITING_CONFIRMATION' | 'VERIFIED' | 'FAILED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED';
  lastPaymentError: string | null;
  familyWorkspace: FamilyWorkspaceItem | null;
  familyInvitations: FamilyInvitationItem[];
  familyActivities: FamilyActivityItem[];
  isRealTimeFamilyConnected: boolean;
  createFamily: (data: { familyName: string; photoUrl?: string; emails: string[] }) => Promise<{ success: boolean; family?: any; invitations?: any[]; inviteLinks?: any[]; error?: string }>;
  resendFamilyInvitation: (inviteId: string) => Promise<{ success: boolean; error?: string; joinUrl?: string }>;
  revokeFamilyInvitation: (inviteId: string) => Promise<{ success: boolean; error?: string }>;
  verifyInvitationToken: (token: string, inviteId: string) => Promise<{ valid: boolean; invitation?: any; error?: string; code?: string }>;
  acceptFamilyInvitation: (token: string, inviteId: string) => Promise<{ success: boolean; family?: any; error?: string; code?: string; message?: string; intendedEmail?: string; currentUserEmail?: string }>;
  removeFamilyMemberFromVault: (memberId: string | number) => Promise<{ success: boolean; error?: string }>;
  leaveFamilyWorkspace: () => Promise<{ success: boolean; error?: string }>;
  transferFamilyOwnership: (targetMemberId: string | number) => Promise<{ success: boolean; error?: string }>;
  switchAccount: (account: { id: number; name: string; email: string; phone?: string; role?: string }) => void;
  restorePurchases: () => Promise<{ success: boolean; isPremium: boolean; message?: string }>;
  exportFinancialReport: (reportType?: string) => Promise<{ success: boolean; reportUrl?: string; error?: string }>;
  processSubscriptionPayment: (planId?: string, paymentMethod?: string, simulateMock?: boolean) => Promise<{ success: boolean; message: string; error?: string }>;
  refundPayment: (paymentId: string) => Promise<{ success: boolean; message: string }>;
  upiTransactions: FinFamUpiTransaction[];
  finfamWallet: FinFamWalletData;
  fetchUpiHistory: (filter?: string, search?: string) => Promise<void>;
  processUpiPayment: (params: {
    amount: number;
    recipientUpi?: string;
    recipientName: string;
    recipientId?: string;
    purpose: string;
    paymentType?: FinFamPaymentType | string;
    category?: string;
    goalId?: number | string;
    goalName?: string;
    isDirectVaultTransfer?: boolean;
  }) => Promise<{ success: boolean; transaction?: FinFamUpiTransaction; message: string; error?: string }>;
  refundUpiPayment: (transactionId: string, reason?: string) => Promise<{ success: boolean; message: string; error?: string }>;
  requestUpiMoney: (amount: number, note?: string) => Promise<{ success: boolean; upiUri: string; error?: string }>;
  contributeToGoalDirect: (goalId: number, goalName: string, amount: number) => Promise<{ success: boolean; message: string; error?: string }>;
  addExpense: (title: string, category: string, amount: number, paymentMethod: string, notes?: string, isFamilyShared?: boolean, memberName?: string) => void;
  addIncome: (title: string, category: string, amount: number, paymentMethod: string, notes?: string, memberName?: string) => void;
  deleteTransaction: (id: number) => void;
  addBudget: (category: string, limit: number) => void;
  deleteBudget: (id: number) => void;
  addGoal: (name: string, emoji: string, targetAmount: number, targetDate: string, category: string, isFamilyGoal: boolean, extra?: Partial<GoalItem>) => void;
  updateGoal: (id: number, data: Partial<GoalItem>) => void;
  depositGoal: (id: number, amount: number) => void;
  withdrawGoal: (id: number, amount: number) => void;
  deleteGoal: (id: number) => void;
  financialCapacity: FinancialCapacityResult;
  goalFeasibilities: GoalFeasibilityResult[];
  goalConflicts: GoalConflictItem[];
  goalPortfolioSummary: GoalPortfolioSummary;
  loadHackathonDemoData: () => void;
  applyResolutionScenario: (scenario: ResolutionScenario) => void;
  addBill: (name: string, amount: number, dueDate: string, category: string, isRecurring: boolean, autoPay: boolean) => void;
  payBill: (billId: number, billName: string, amount: number, method?: string) => void;
  deleteBill: (id: number) => void;
  toggleAutoPay: (id: number) => void;
  addFamilyMember: (data: Partial<FamilyMemberItem>) => void;
  updateFamilyMember: (member: FamilyMemberItem) => void;
  deleteFamilyMember: (id: number | string) => void;
  addEmi: (title: string, category: string, totalAmount: number, monthlyEmi: number, interestRate: number, tenureMonths: number, lenderBank: string, dueDate?: string) => void;
  payEmi: (emiId: number, emiTitle: string, amount: number, method?: string) => void;
  deleteEmi: (id: number) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  resetAllData: () => void;
  decisionHistory: DecisionHistoryRecord[];
  saveDecisionRecord: (record: Omit<DecisionHistoryRecord, 'id' | 'timestamp'>) => void;
  deleteDecisionRecord: (id: string) => void;
  updateDecisionStatus: (id: string, status: 'IMPLEMENTED' | 'DISMISSED' | 'PENDING') => void;
}

const FinFamContext = createContext<FinFamContextType | null>(null);

export const FinFamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from LocalStorage or defaults
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryRecord[]>(() => {
    const saved = localStorage.getItem('finfam_decision_history');
    return saved ? JSON.parse(saved) : INITIAL_DECISION_HISTORY;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finfam_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('finfam_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('finfam_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<GoalItem[]>(() => {
    const saved = localStorage.getItem('finfam_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [bills, setBills] = useState<BillItem[]>(() => {
    const saved = localStorage.getItem('finfam_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>(() => {
    try {
      const saved = localStorage.getItem('finfam_family');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : INITIAL_FAMILY;
      }
    } catch (e) { /* corrupted localStorage */ }
    return INITIAL_FAMILY;
  });

  const [emis, setEmis] = useState<EmiItem[]>(() => {
    const saved = localStorage.getItem('finfam_emis');
    return saved ? JSON.parse(saved) : INITIAL_EMIS;
  });

  const [radarHealthAxes, setRadarHealthAxes] = useState<FinancialHealthAxis[]>(INITIAL_RADAR_AXES);
  const [isSimulatingRadarUpdates, setIsSimulatingRadarUpdates] = useState(false);

  const [notifications, setNotifications] = useState<NotificationAlertItem[]>(() => {
    const saved = localStorage.getItem('finfam_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [liveP2pNodes, setLiveP2pNodes] = useState<LivePeerNode[]>(INITIAL_PEER_NODES);
  const [realTimeTransferHistory, setRealTimeTransferHistory] = useState<RealTimeTransferRecord[]>(() => {
    const saved = localStorage.getItem('finfam_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFER_HISTORY;
  });

  const [isLiveTransferStreaming, setIsLiveTransferStreaming] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState<RazorpayTransactionRecord[]>(() => {
    const saved = localStorage.getItem('finfam_payments');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pay_finfam_init01',
        orderId: 'order_N82ba91x',
        paymentId: 'pay_N82ba91x_live',
        userId: 'user_priyanshu_sharma',
        planId: 'premium_monthly',
        planTitle: 'FinFam Pro Monthly',
        amount: 199.0,
        currency: 'INR',
        status: 'SUCCESS',
        paymentMethod: 'UPI (PhonePe)',
        date: '19 Aug 2026',
        timestamp: Date.now() - 86400000 * 2,
        validUntil: '18 Sep 2026'
      }
    ];
  });

  const [upiTransactions, setUpiTransactions] = useState<FinFamUpiTransaction[]>([]);
  const [finfamWallet, setFinfamWallet] = useState<FinFamWalletData>({
    userId: userProfile.email,
    availableBalance: 24580.00,
    totalReceived: 17000.00,
    totalSent: 7270.00,
    familyContributions: 5000.00,
    goalContributions: 3500.00,
    lastUpdated: new Date().toISOString()
  });

  const [familyWorkspace, setFamilyWorkspace] = useState<FamilyWorkspaceItem | null>(() => {
    const saved = localStorage.getItem('finfam_family_workspace');
    return saved ? JSON.parse(saved) : {
      id: 'fam_sharma_001',
      name: 'Sharma Family Vault',
      photoUrl: null,
      ownerId: 'priyan1436ei@gmail.com',
      ownerEmail: 'priyan1436ei@gmail.com',
      ownerName: 'Priyanshu Sharma',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [familyInvitations, setFamilyInvitations] = useState<FamilyInvitationItem[]>(() => {
    const saved = localStorage.getItem('finfam_family_invitations');
    return saved ? JSON.parse(saved) : [];
  });

  const [familyActivities, setFamilyActivities] = useState<FamilyActivityItem[]>(() => {
    const saved = localStorage.getItem('finfam_family_activities');
    return saved ? JSON.parse(saved) : [
      {
        id: 'act_init_1',
        familyId: 'fam_sharma_001',
        type: 'FAMILY_CREATED',
        description: 'Priyanshu Sharma established the Sharma Family Vault workspace.',
        actorName: 'Priyanshu Sharma',
        timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: 'act_init_2',
        familyId: 'fam_sharma_001',
        type: 'MEMBER_JOINED',
        description: 'Rajesh Sharma joined the family workspace as Member.',
        actorName: 'Rajesh Sharma',
        timestamp: new Date(Date.now() - 86400000 * 25).toISOString()
      }
    ];
  });

  const [isRealTimeFamilyConnected, setIsRealTimeFamilyConnected] = useState(false);
  const [paymentFlowState, setPaymentFlowState] = useState<'IDLE' | 'CREATING_ORDER' | 'CHECKOUT_OPEN' | 'AWAITING_CONFIRMATION' | 'VERIFIED' | 'FAILED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED'>('IDLE');
  const [lastPaymentError, setLastPaymentError] = useState<string | null>(null);

  // Save to LocalStorage
  useEffect(() => { localStorage.setItem('finfam_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('finfam_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finfam_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finfam_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('finfam_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('finfam_family', JSON.stringify(familyMembers)); }, [familyMembers]);
  useEffect(() => { localStorage.setItem('finfam_family_workspace', JSON.stringify(familyWorkspace)); }, [familyWorkspace]);
  useEffect(() => { localStorage.setItem('finfam_family_invitations', JSON.stringify(familyInvitations)); }, [familyInvitations]);
  useEffect(() => { localStorage.setItem('finfam_family_activities', JSON.stringify(familyActivities)); }, [familyActivities]);
  useEffect(() => { localStorage.setItem('finfam_emis', JSON.stringify(emis)); }, [emis]);
  useEffect(() => { localStorage.setItem('finfam_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('finfam_transfers', JSON.stringify(realTimeTransferHistory)); }, [realTimeTransferHistory]);
  useEffect(() => { localStorage.setItem('finfam_payments', JSON.stringify(paymentHistory)); }, [paymentHistory]);
  useEffect(() => { localStorage.setItem('finfam_decision_history', JSON.stringify(decisionHistory)); }, [decisionHistory]);

  const saveDecisionRecord = (record: Omit<DecisionHistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: DecisionHistoryRecord = {
      ...record,
      id: `dec_${Date.now()}`,
      timestamp: Date.now()
    };
    setDecisionHistory((prev) => [newRecord, ...prev]);
  };

  const deleteDecisionRecord = (id: string) => {
    setDecisionHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const updateDecisionStatus = (id: string, status: 'IMPLEMENTED' | 'DISMISSED' | 'PENDING') => {
    setDecisionHistory((prev) =>
      prev.map((r) => (r.id === id ? { ...r, implementationStatus: status } : r))
    );
  };

  // Spending Trends Query State
  const [spendingTrendHorizon, setSpendingTrendHorizon] = useState<TimeHorizonType>('LAST_6_MONTHS');
  const [spendingTrendCategory, setSpendingTrendCategory] = useState('ALL');
  const [spendingTrendMultiCategories, setSpendingTrendMultiCategories] = useState<string[]>(['Food', 'Rent', 'Bills']);
  const [spendingTrendMultiLineMode, setSpendingTrendMultiLineMode] = useState(false);
  const [spendingTrendSelectedMonthIndex, setSpendingTrendSelectedMonth] = useState(-1);

  const toggleSpendingTrendMultiCategory = (cat: string) => {
    if (spendingTrendMultiCategories.includes(cat)) {
      if (spendingTrendMultiCategories.length > 1) {
        setSpendingTrendMultiCategories(spendingTrendMultiCategories.filter((c) => c !== cat));
      }
    } else {
      setSpendingTrendMultiCategories([...spendingTrendMultiCategories, cat]);
    }
  };

  // Computed Financial Health
  const financialHealth = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.isCredit).reduce((acc, t) => acc + t.amount, 0) || userProfile.monthlyIncome;
    const totalExpenses = transactions.filter((t) => !t.isCredit).reduce((acc, t) => acc + t.amount, 0) || userProfile.monthlyExpenses;
    const totalSavings = Math.max(totalIncome - totalExpenses, 0);
    const goalsRatio = goals.length > 0 ? goals.reduce((acc, g) => acc + g.currentAmount, 0) / Math.max(goals.reduce((acc, g) => acc + g.targetAmount, 0), 1) : 0.72;
    const unpaidBills = bills.filter((b) => !b.isPaid).length;
    const overspentBudgets = budgets.filter((b) => b.spent > b.monthlyLimit).length;

    return FinancialEngine.calculateHealth(
      totalIncome,
      totalExpenses,
      totalSavings,
      userProfile.emergencyFund,
      5000,
      unpaidBills,
      overspentBudgets,
      goalsRatio
    );
  }, [transactions, userProfile, goals, bills, budgets]);

  // Computed Monthly Spending Trends
  const monthlySpendingTrends = useMemo(() => {
    return SpendingTrendsEngine.computeTrends(
      transactions,
      budgets,
      spendingTrendHorizon,
      spendingTrendCategory,
      spendingTrendMultiCategories,
      spendingTrendMultiLineMode,
      spendingTrendSelectedMonthIndex
    );
  }, [
    transactions,
    budgets,
    spendingTrendHorizon,
    spendingTrendCategory,
    spendingTrendMultiCategories,
    spendingTrendMultiLineMode,
    spendingTrendSelectedMonthIndex
  ]);

  // Radar Dynamic Simulation
  const simulateRadarDataStep = () => {
    setRadarHealthAxes((prev) =>
      prev.map((axis) => {
        const delta = Math.floor(Math.random() * 13) - 6;
        const newScore = Math.min(Math.max(axis.score + delta, 45), 98);
        let status = 'Attention Needed';
        let statusColor = '#EF4444';
        if (newScore >= 85) {
          status = 'Optimal';
          statusColor = '#10B981';
        } else if (newScore >= 75) {
          status = 'Strong';
          statusColor = '#06B6D4';
        } else if (newScore >= 65) {
          status = 'Moderate';
          statusColor = '#F59E0B';
        }

        let updatedMetric = axis.metricFormatted;
        if (axis.categoryName === 'Savings') updatedMetric = `${Math.round(newScore * 0.38)}% of Income`;
        if (axis.categoryName === 'Debt') updatedMetric = `${Math.max(Math.round(40 - newScore * 0.25), 8)}% DTI Ratio`;
        if (axis.categoryName === 'Spending') updatedMetric = `₹${Math.round(65000 - newScore * 380)} Discretionary`;
        if (axis.categoryName === 'Investments') updatedMetric = `₹${(newScore * 0.022).toFixed(2)}L Active SIPs`;
        if (axis.categoryName === 'Budget') updatedMetric = `${Math.round(newScore)}% Adherence`;
        if (axis.categoryName === 'Emergency') updatedMetric = `${(newScore * 0.075).toFixed(1)} Months Buffer`;

        return {
          ...axis,
          score: newScore,
          status,
          statusColor,
          metricFormatted: updatedMetric
        };
      })
    );
  };

  const togglePeriodicRadarSimulation = () => {
    setIsSimulatingRadarUpdates((prev) => !prev);
  };

  useEffect(() => {
    if (!isSimulatingRadarUpdates) return;
    const timer = setInterval(() => {
      simulateRadarDataStep();
    }, 3000);
    return () => clearInterval(timer);
  }, [isSimulatingRadarUpdates]);

  const resetRadarBaseline = () => {
    setRadarHealthAxes(INITIAL_RADAR_AXES);
  };

  // Daily & Weekly Analytics
  const dailySpendingPoints: DailySpendDataPoint[] = useMemo(() => {
    const points: DailySpendDataPoint[] = [];
    for (let day = 1; day <= 21; day++) {
      const amt = 800 + ((day * 137) % 1400) + (day % 7 === 0 ? 1800 : 0);
      points.push({ day, dateLabel: `${day} Aug`, amount: amt, isProjected: false });
    }
    const avg = points.reduce((acc, p) => acc + p.amount, 0) / points.length;
    for (let day = 22; day <= 31; day++) {
      const amt = avg * (0.95 + (day % 3) * 0.08);
      points.push({ day, dateLabel: `${day} Aug`, amount: amt, isProjected: true });
    }
    return points;
  }, []);

  const weeklySpendingBars: WeeklySpendBar[] = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const base = [3200, 4100, 2800, 5600, 7400, 9200, 5950];
    return days.map((day, idx) => ({
      dayName: day,
      amount: base[idx],
      isPeakDay: idx === 5
    }));
  }, []);

  const familyContributions: FamilyContributionShare[] = useMemo(() => {
    const members = Array.isArray(familyMembers) ? familyMembers : [];
    const total = members.reduce((acc, m) => acc + m.monthlyContribution, 0) || 1;
    return members.map((m) => ({
      memberName: `${m.name} (${m.role})`,
      role: m.role,
      contributionAmount: m.monthlyContribution,
      spentAmount: m.spentThisMonth,
      percentageShare: (m.monthlyContribution / total) * 100,
      avatarColorHex: m.avatarColor
    }));
  }, [familyMembers]);

  const expensePrediction: ExpensePrediction = useMemo(() => {
    const totalSpent = transactions.filter((t) => !t.isCredit).reduce((acc, t) => acc + t.amount, 0) || userProfile.monthlyExpenses;
    const currentDay = 21;
    const daysInMonth = 31;
    const projected = (totalSpent / currentDay) * daysInMonth;
    const projectedSavings = Math.max(userProfile.monthlyIncome - projected, 0);

    return {
      projectedEndOfMonthSpend: projected,
      projectedFutureSavings: projectedSavings,
      monthlyBudgetLimit: 38250,
      isBudgetExceeded: projected > 38250,
      overflowCategory: 'Food & Dining',
      overflowAmount: 1900,
      predictedDaysRemaining: 10,
      aiInsights: [
        'At your current velocity, you will exceed your food & dining budget by ~₹1,900.',
        'Household utility bills are tracking 12% below projected ceiling.',
        'Shifting weekend dining out by 15% recovers ₹2,800 in projected monthly surplus.'
      ],
      recommendation: 'Reallocate ₹2,000 from Shopping surplus to maintain a 100% green budget status.'
    };
  }, [transactions, userProfile]);

  // Notifications
  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUserProfile((prev) => ({ ...prev, unreadNotificationsCount: Math.max(prev.unreadNotificationsCount - 1, 0) }));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    setUserProfile((prev) => ({ ...prev, unreadNotificationsCount: 0 }));
  };

  const addNotificationAlert = (title: string, message: string, type: any, amountFormatted?: string) => {
    const newItem: NotificationAlertItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timeAgo: 'Just now',
      isUnread: true,
      amountFormatted
    };
    setNotifications((prev) => [newItem, ...prev]);
    setUserProfile((prev) => ({ ...prev, unreadNotificationsCount: prev.unreadNotificationsCount + 1 }));
  };

  // AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_finfam',
      text: '👋 Hello Priyanshu! I am FinFam AI, your dedicated Family Financial Coach. I can analyze your household spending, suggest budget optimizations, calculate savings runway, and help you reach your Japan Vacation goal faster. How can I help you today?',
      isUser: false,
      timestamp: Date.now()
    }
  ]);
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  const askAiCoach = async (prompt: string) => {
    if (!prompt.trim()) return;
    const userMsg: ChatMessage = { id: `msg_${Date.now()}`, text: prompt, isUser: true, timestamp: Date.now() };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsCoachTyping(true);

    try {
      const response = await GeminiAiEngine.askFinancialAdvisor(prompt, userProfile);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { id: `ai_${Date.now()}`, text: response, isUser: false, timestamp: Date.now() }
        ]);
        setIsCoachTyping(false);
      }, 600);
    } catch {
      setIsCoachTyping(false);
    }
  };

  // OCR Receipt Scanner Simulator
  const [scannedReceiptResult, setScannedReceiptResult] = useState<ReceiptScanResult | null>(null);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);

  const scanReceiptSimulator = (imageType: string = 'GROCERY') => {
    setIsScanningReceipt(true);
    setTimeout(() => {
      let result: ReceiptScanResult;
      if (imageType === 'RESTAURANT') {
        result = {
          merchantName: 'Barbeque Nation Buffet',
          amount: 2360.0,
          date: 'Today',
          category: 'Food',
          detectedItems: ['2x Grand Dinner Buffet (₹1998)', 'Mocktails (₹250)', 'GST 5% (₹112)'],
          taxGst: 112.0,
          paymentMode: 'Credit Card',
          rawText: 'BARBEQUE NATION HOSPITALITY LTD\nTAX INVOICE #BN-8842\nTOTAL: INR 2360.00'
        };
      } else if (imageType === 'FUEL') {
        result = {
          merchantName: 'Indian Oil Petrol Pump',
          amount: 1500.0,
          date: 'Today',
          category: 'Travel',
          detectedItems: ['XP95 Petrol 14.8L (₹1500.00)'],
          taxGst: 0.0,
          paymentMode: 'UPI',
          rawText: 'INDIAN OIL CORP LTD\nPOS RECEIPT #IOC-9912\nTOTAL: INR 1500.00'
        };
      } else {
        result = {
          merchantName: "Nature's Basket Organic Supermarket",
          amount: 1845.0,
          date: 'Today',
          category: 'Food',
          detectedItems: [
            'Organic Sourdough Bread (₹180)',
            'Almond Milk 1L (₹290)',
            'Fresh Avocado 500g (₹350)',
            'Imported Pasta & Olive Oil (₹1025)'
          ],
          taxGst: 85.0,
          paymentMode: 'UPI',
          rawText: 'NATURES BASKET RETAIL\nINVOICE #NB-4421\nNET PAYABLE: INR 1845.00'
        };
      }
      setScannedReceiptResult(result);
      setIsScanningReceipt(false);
    }, 1200);
  };

  const confirmScannedReceiptAsExpense = () => {
    if (!scannedReceiptResult) return;
    addExpense(
      scannedReceiptResult.merchantName,
      scannedReceiptResult.category,
      scannedReceiptResult.amount,
      scannedReceiptResult.paymentMode,
      `Scanned Receipt OCR (${scannedReceiptResult.detectedItems.join(', ')})`,
      true,
      'Priyanshu'
    );
    setScannedReceiptResult(null);
  };

  const dismissScannedReceipt = () => setScannedReceiptResult(null);

  // Real-Time P2P Funds Transfer Beam
  const executeRealTimeFundsTransfer = async (
    receiverName: string,
    receiverVpa: string,
    amount: number,
    transferType: RealTimeTransferType,
    note: string
  ): Promise<RealTimeTransferRecord> => {
    setIsLiveTransferStreaming(true);

    await new Promise((resolve) => setTimeout(resolve, 850));

    const newRecord: RealTimeTransferRecord = {
      id: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      utrNumber: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      senderName: userProfile.name,
      senderVpaOrAcc: 'priyan1436ei@okhdfcbank',
      receiverName,
      receiverVpaOrAcc: receiverVpa,
      amount,
      transferType,
      status: 'SETTLED',
      protocol: 'WSS://finfam.sync.p2p • AES-256',
      latencyMs: Math.floor(8 + Math.random() * 12),
      note: note || `Real-time transfer to ${receiverName}`,
      timestampFormatted: 'Just now'
    };

    setRealTimeTransferHistory((prev) => [newRecord, ...prev]);

    // Add transaction to ledger & deduct balance
    addExpense(
      note || `Transfer to ${receiverName}`,
      transferType === 'FAMILY_ALLOWANCE' ? 'Family' : 'Transfer',
      amount,
      'Real-Time UPI Transfer',
      `P2P Real-time Beam to ${receiverVpa} (Ref: ${newRecord.utrNumber})`,
      true,
      'Priyanshu'
    );

    setIsLiveTransferStreaming(false);
    return newRecord;
  };

  // Real-Time Family Synchronization via Server-Sent Events (SSE)
  useEffect(() => {
    if (!userProfile.familyId) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/family/${userProfile.familyId}/stream`);

      eventSource.onopen = () => {
        setIsRealTimeFamilyConnected(true);
      };

      eventSource.addEventListener('snapshot', (e: MessageEvent) => {
        try {
          const snapshot = JSON.parse(e.data);
          if (snapshot.family) setFamilyWorkspace(snapshot.family);
          if (snapshot.members) setFamilyMembers(snapshot.members);
          if (snapshot.pendingInvites) setFamilyInvitations(snapshot.pendingInvites);
          if (snapshot.activities) setFamilyActivities(snapshot.activities);
        } catch (err) {
          console.error('Error parsing family snapshot:', err);
        }
      });

      eventSource.addEventListener('member_joined', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { member, family } = payload.data;
          setFamilyMembers((prev) => {
            if (prev.some((m) => m.email === member.email || m.userId === member.userId)) return prev;
            return [...prev, member];
          });
          if (family) setFamilyWorkspace(family);
          addNotificationAlert('New Family Member', `${member.name} accepted the invitation and joined the family.`, 'SAVINGS_GOAL_REACHED');
        } catch (err) {}
      });

      eventSource.addEventListener('member_removed', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { memberId, userId } = payload.data;
          setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId && m.userId !== userId));
          if (userProfile.id.toString() === userId || userProfile.email === userId) {
            setUserProfile((prev) => ({
              ...prev,
              familyId: '',
              familyName: 'Personal Vault',
              familyRole: 'Member'
            }));
            addNotificationAlert('Family Access Revoked', 'You have been removed from the family workspace.', 'BUDGET_CROSSED');
          }
        } catch (err) {}
      });

      eventSource.addEventListener('invitation_updated', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const updated = payload.data;
          setFamilyInvitations((prev) => {
            const index = prev.findIndex((i) => i.id === updated.id);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = updated;
              return copy;
            }
            return [updated, ...prev];
          });
        } catch (err) {}
      });

      eventSource.addEventListener('invitation_revoked', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { inviteId } = payload.data;
          setFamilyInvitations((prev) =>
            prev.map((inv) => (inv.id === inviteId ? { ...inv, acceptanceStatus: 'REVOKED' } : inv))
          );
        } catch (err) {}
      });

      eventSource.addEventListener('activity_added', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const activity = payload.data;
          setFamilyActivities((prev) => [activity, ...prev]);
        } catch (err) {}
      });

      eventSource.onerror = () => {
        setIsRealTimeFamilyConnected(false);
      };
    } catch (err) {
      console.warn('Real-time family stream initialization notice:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userProfile.familyId]);

  // Restore purchase from authoritative server records
  const restorePurchases = async (): Promise<{ success: boolean; isPremium: boolean; message?: string }> => {
    try {
      const res = await fetch(`/api/payment/user-status/${encodeURIComponent(userProfile.email)}`);
      const data = await res.json();
      if (data.success && data.isPremium) {
        setUserProfile((prev) => ({
          ...prev,
          isPremium: true,
          premiumTier: (data.subscription?.planId === 'finfam_premium_one_time' ? 'PREMIUM_ONE_TIME' : (data.subscription?.planId?.toUpperCase() || 'PREMIUM_ONE_TIME')) as any,
          premiumValidUntil: data.validUntil || 'Active'
        }));
        return { success: true, isPremium: true, message: `Premium restored! Valid until ${data.validUntil}` };
      } else {
        setUserProfile((prev) => ({
          ...prev,
          isPremium: false,
          premiumTier: 'FREE',
          premiumValidUntil: 'N/A'
        }));
        return { success: true, isPremium: false, message: 'No active Premium purchase found for this account.' };
      }
    } catch (err: any) {
      return { success: false, isPremium: false, message: err.message };
    }
  };

  // Check purchase status on account change or mount
  useEffect(() => {
    restorePurchases();
  }, [userProfile.email]);

  // Razorpay Server-Verified Payments & Subscriptions
  const isSubscriptionActive = userProfile.isPremium;
  const activePlanTier = userProfile.premiumTier;

// Helper to guarantee Razorpay checkout.js SDK is loaded into the browser document
const loadRazorpayCheckoutScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if ((window as any).Razorpay) {
      return resolve(true);
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      if ((window as any).Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      setTimeout(() => {
        resolve(Boolean((window as any).Razorpay));
      }, 1200);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

  const processSubscriptionPayment = async (
    planId: string = 'finfam_premium_one_time',
    paymentMethod: string = 'UPI',
    simulateMock: boolean = false
  ): Promise<{ success: boolean; message: string; error?: string }> => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];
    setLastPaymentError(null);
    setPaymentFlowState('CREATING_ORDER');

    try {
      // Step 1: Create order on authoritative backend (verifies auth and checks if already premium)
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          userId: userProfile.email
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setPaymentFlowState('FAILED');
        const err = orderData.error || 'Failed to create payment order';
        setLastPaymentError(err);
        return { success: false, message: err, error: err };
      }

      let paymentResult: {
        paymentId: string;
        orderId: string;
        signature: string;
      };

      if (!simulateMock) {
        // Step 2: Ensure Razorpay Checkout SDK is ready in DOM
        const isSdkLoaded = await loadRazorpayCheckoutScript();
        if (!isSdkLoaded || !(window as any).Razorpay) {
          setPaymentFlowState('FAILED');
          const err = 'Razorpay Checkout SDK could not be loaded. Please check your internet connection.';
          setLastPaymentError(err);
          return { success: false, message: err, error: err };
        }

        setPaymentFlowState('CHECKOUT_OPEN');

        // Step 3: Open Real-Time Live Razorpay Modal with key rzp_test_TNKQHoOkeQFUas
        const razorpayKeyId = orderData.keyId || 'rzp_test_TNKQHoOkeQFUas';

        try {
          paymentResult = await new Promise((resolve, reject) => {
            const options = {
              key: razorpayKeyId,
              amount: orderData.amountPaise || plan.amountPaise,
              currency: orderData.currency || 'INR',
              name: 'FinFam Technologies',
              description: `${plan.title} - ₹${plan.amountInr} Premium Upgrade`,
              order_id: orderData.orderId,
              image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              prefill: {
                name: userProfile.name || 'FinFam User',
                email: userProfile.email || 'priyan1436ei@gmail.com',
                contact: '9876543210'
              },
              notes: {
                userId: userProfile.email,
                planId: plan.id,
                purpose: 'FinFam ₹1 Premium Upgrade'
              },
              theme: {
                color: '#10B981'
              },
              modal: {
                ondismiss: function () {
                  reject(new Error('Checkout dismissed by user'));
                },
                escape: true,
                backdropclose: false
              },
              handler: function (response: any) {
                if (!response.razorpay_payment_id || !response.razorpay_signature) {
                  reject(new Error('Incomplete payment response from Razorpay checkout modal'));
                  return;
                }
                resolve({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id || orderData.orderId,
                  signature: response.razorpay_signature
                });
              }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (resp: any) {
              reject(new Error(resp.error?.description || 'Razorpay payment was not authorized'));
            });
            rzp.open();
          });
        } catch (checkoutErr: any) {
          if (checkoutErr.message === 'Checkout dismissed by user') {
            setPaymentFlowState('CANCELLED');
            return {
              success: false,
              message: 'Payment cancelled. You can retry anytime whenever you are ready.',
              error: 'Payment cancelled'
            };
          }
          setPaymentFlowState('FAILED');
          const errMsg = checkoutErr.message || 'Payment failed';
          setLastPaymentError(errMsg);
          return { success: false, message: errMsg, error: errMsg };
        }
      } else {
        // Explicit automated/sandbox bypass
        const mockPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const mockSignature = `sim_sig_valid_${orderData.orderId}_${mockPaymentId}`;
        paymentResult = {
          paymentId: mockPaymentId,
          orderId: orderData.orderId,
          signature: mockSignature
        };
      }

      setPaymentFlowState('AWAITING_CONFIRMATION');

      // Step 4: Verify signature on backend using stored order ID and activate ONLY for purchaser
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayPaymentId: paymentResult.paymentId,
          razorpayOrderId: paymentResult.orderId,
          razorpaySignature: paymentResult.signature,
          planId: plan.id,
          paymentMethod,
          userId: userProfile.email
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setPaymentFlowState('FAILED');
        const err = verifyData.error || 'Payment signature verification failed. Premium remains locked.';
        setLastPaymentError(err);
        return { success: false, message: err, error: err };
      }

      // Step 5: Atomically unlock Premium ONLY for the authenticated purchaser account
      setPaymentFlowState('VERIFIED');

      setUserProfile((prev) => ({
        ...prev,
        isPremium: true,
        premiumTier: (plan.id === 'finfam_premium_one_time' ? 'PREMIUM_ONE_TIME' : plan.id.toUpperCase()) as any,
        premiumValidUntil: verifyData.validUntil
      }));

      const newPaymentRecord: RazorpayTransactionRecord = {
        id: paymentResult.paymentId,
        orderId: orderData.orderId,
        paymentId: paymentResult.paymentId,
        signature: paymentResult.signature,
        userId: userProfile.email,
        planId: plan.id,
        planTitle: plan.title,
        amount: plan.amountInr,
        currency: 'INR',
        status: 'SUCCESS',
        paymentMethod,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timestamp: Date.now(),
        validUntil: verifyData.validUntil
      };

      setPaymentHistory((prev) => [newPaymentRecord, ...prev]);

      addExpense(
        `${plan.title} Upgrade`,
        'Subscriptions',
        plan.amountInr,
        paymentMethod,
        `Razorpay Verified Order: ${orderData.orderId} (Payment: ${paymentResult.paymentId})`,
        false,
        userProfile.name
      );

      addNotificationAlert(
        'Payment Verified & Premium Activated',
        `₹${plan.amountInr} verified for ${plan.title}. Active until ${verifyData.validUntil}.`,
        'PAYMENT_SUCCESS',
        `₹${plan.amountInr}`
      );

      return {
        success: true,
        message: `Payment verified. ${plan.title} unlocked for ${userProfile.name}!`
      };
    } catch (err: any) {
      setPaymentFlowState('FAILED');
      setLastPaymentError(err.message || 'Payment network error');
      return { success: false, message: err.message, error: err.message };
    }
  };

  const refundPayment = async (paymentId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPaymentHistory((prev) =>
      prev.map((rec) => {
        if (rec.paymentId === paymentId) {
          return {
            ...rec,
            status: 'REFUNDED',
            refundStatus: 'REFUNDED',
            refundId: `rfnd_${Math.random().toString(36).substring(2, 10)}`
          };
        }
        return rec;
      })
    );
    return { success: true, message: 'Refund initiated successfully. Will reflect in 2-3 banking days.' };
  };

  const fetchUpiHistory = async (filter: string = 'ALL', search: string = '') => {
    try {
      const res = await fetch(
        `/api/payments/history?userId=${encodeURIComponent(userProfile.email)}&filter=${encodeURIComponent(
          filter
        )}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setUpiTransactions(data.transactions || []);
      }
    } catch (e) {
      console.warn('Failed to fetch UPI history:', e);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(`/api/payments/wallet/${encodeURIComponent(userProfile.email)}`);
      const data = await res.json();
      if (res.ok && data.success && data.wallet) {
        setFinfamWallet(data.wallet);
      }
    } catch (e) {
      console.warn('Failed to fetch wallet:', e);
    }
  };

  useEffect(() => {
    fetchUpiHistory();
    fetchWallet();
  }, [userProfile.email]);

  // Real-time SSE Payment event listener
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/payments/stream');
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === 'TRANSACTION_CREATED' ||
            payload.type === 'TRANSACTION_CONFIRMED' ||
            payload.type === 'PAYMENT_CONFIRMED' ||
            payload.type === 'PAYMENT_REFUNDED' ||
            payload.type === 'GOAL_CONTRIBUTED'
          ) {
            fetchUpiHistory();
            fetchWallet();
            if (payload.type === 'PAYMENT_CONFIRMED' && payload.transaction) {
              addNotificationAlert(
                `Payment Successful: ₹${payload.transaction.amount} paid to ${payload.transaction.recipientName}`,
                'PAYMENT_SUCCESS',
                `₹${payload.transaction.amount}`
              );
            }
          }
        } catch (err) {}
      };
    } catch (e) {
      console.warn('SSE Payment stream error:', e);
    }

    return () => {
      if (es) es.close();
    };
  }, [userProfile.email]);

  const processUpiPayment = async ({
    amount,
    recipientUpi = '',
    recipientName = 'Merchant / Recipient',
    recipientId = '',
    purpose = 'UPI Payment',
    paymentType = 'UPI_SEND',
    category = 'General',
    goalId,
    goalName,
    isDirectVaultTransfer = false
  }: {
    amount: number;
    recipientUpi?: string;
    recipientName: string;
    recipientId?: string;
    purpose: string;
    paymentType?: FinFamPaymentType | string;
    category?: string;
    goalId?: number | string;
    goalName?: string;
    isDirectVaultTransfer?: boolean;
  }): Promise<{ success: boolean; transaction?: FinFamUpiTransaction; message: string; error?: string }> => {
    setLastPaymentError(null);
    setPaymentFlowState('CREATING_ORDER');

    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          recipientUpi,
          recipientName,
          recipientId,
          purpose,
          paymentType,
          category,
          goalId,
          goalName,
          familyId: userProfile.familyId,
          userId: userProfile.email,
          isDirectVaultTransfer
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        setPaymentFlowState('FAILED');
        const err = orderData.error || 'Failed to create payment order';
        setLastPaymentError(err);
        return { success: false, message: err, error: err };
      }

      // If direct real-time vault transfer executed
      if (orderData.isDirectTransfer && orderData.transaction) {
        setPaymentFlowState('VERIFIED');
        if (orderData.wallet) {
          setFinfamWallet(orderData.wallet);
        }
        setUpiTransactions((prev) => [orderData.transaction, ...prev.filter((t) => t.transactionId !== orderData.transaction.transactionId)]);
        
        if (paymentType !== 'GOAL_CONTRIBUTION') {
          addExpense(
            recipientName || (recipientUpi ? recipientUpi.split('@')[0] : 'UPI Recipient'),
            category || 'UPI Payment',
            amount,
            'UPI',
            `Direct Vault Ref: ${orderData.transactionId} (${purpose})`,
            paymentType === 'FAMILY_TRANSFER',
            userProfile.name
          );
        } else if (goalId) {
          depositGoal(Number(goalId), amount);
        }

        addNotificationAlert(
          '✓ Payment Successful',
          `₹${amount.toLocaleString('en-IN')} transferred in real-time to ${recipientUpi || recipientName}.`,
          'PAYMENT_SUCCESS',
          `₹${amount}`
        );

        return {
          success: true,
          transaction: orderData.transaction,
          message: orderData.message || `₹${amount.toLocaleString('en-IN')} transferred successfully.`
        };
      }

      const isLoaded = await loadRazorpayCheckoutScript();
      if (!isLoaded || !(window as any).Razorpay) {
        setPaymentFlowState('FAILED');
        const err = 'Unable to load payment checkout SDK.';
        setLastPaymentError(err);
        return { success: false, message: err, error: err };
      }

      setPaymentFlowState('CHECKOUT_OPEN');

      const paymentResult: {
        paymentId: string;
        orderId: string;
        signature: string;
      } = await new Promise((resolve, reject) => {
        const options = {
          key: orderData.keyId || 'rzp_test_TNKQHoOkeQFUas',
          amount: orderData.amountPaise,
          currency: orderData.currency || 'INR',
          name: 'FinFam Pay',
          description: `${purpose} - ₹${amount}`,
          order_id: orderData.orderId,
          image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          prefill: {
            name: userProfile.name,
            email: userProfile.email,
            contact: '9876543210'
          },
          notes: {
            transactionId: orderData.transactionId,
            userId: userProfile.email,
            purpose,
            recipientUpi
          },
          theme: {
            color: '#10B981'
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Checkout dismissed by user'));
            },
            escape: true,
            backdropclose: false
          },
          handler: function (response: any) {
            if (!response.razorpay_payment_id || !response.razorpay_signature) {
              reject(new Error('Incomplete signature received from checkout gateway'));
              return;
            }
            resolve({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || orderData.orderId,
              signature: response.razorpay_signature
            });
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          reject(new Error(resp.error?.description || 'Payment authorization failed on gateway.'));
        });
        rzp.open();
      });

      setPaymentFlowState('AWAITING_CONFIRMATION');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayPaymentId: paymentResult.paymentId,
          razorpayOrderId: paymentResult.orderId,
          razorpaySignature: paymentResult.signature,
          transactionId: orderData.transactionId,
          paymentMethod: 'UPI',
          userId: userProfile.email
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setPaymentFlowState('FAILED');
        const err = verifyData.error || 'Server signature verification failed';
        setLastPaymentError(err);
        return { success: false, message: err, error: err };
      }

      setPaymentFlowState('VERIFIED');

      if (paymentType !== 'GOAL_CONTRIBUTION') {
        addExpense(
          recipientName,
          category || 'UPI Payment',
          amount,
          'UPI',
          `UPI Ref: ${orderData.transactionId} (${purpose})`,
          paymentType === 'FAMILY_TRANSFER',
          userProfile.name
        );
      }

      if (goalId) {
        depositGoal(Number(goalId), amount);
      }

      fetchUpiHistory();
      fetchWallet();

      return {
        success: true,
        transaction: verifyData.transaction,
        message: `✓ ₹${amount} successfully paid to ${recipientName} via UPI.`
      };
    } catch (err: any) {
      if (err.message === 'Checkout dismissed by user') {
        setPaymentFlowState('CANCELLED');
        return { success: false, message: 'Payment cancelled.', error: 'Payment cancelled' };
      }
      setPaymentFlowState('FAILED');
      const msg = err.message || 'Payment processing failed';
      setLastPaymentError(msg);
      return { success: false, message: msg, error: msg };
    }
  };

  const refundUpiPayment = async (transactionId: string, reason: string = 'User refund request') => {
    try {
      const res = await fetch(`/api/payments/${transactionId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUpiHistory();
        fetchWallet();
        addNotificationAlert(`Refund Processed: ₹${data.transaction.amount} refunded`, 'INFO', 'Refund');
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Refund failed', message: data.error };
    } catch (e: any) {
      return { success: false, error: e.message, message: e.message };
    }
  };

  const requestUpiMoney = async (amount: number, note: string = 'FinFam Money Request') => {
    try {
      const res = await fetch('/api/payments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          note,
          requesterUpi: 'priyan1436ei@okhdfcbank',
          requesterName: userProfile.name,
          userId: userProfile.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, upiUri: data.upiUri };
      }
      return { success: false, error: data.error || 'Request creation failed', upiUri: '' };
    } catch (e: any) {
      return { success: false, error: e.message, upiUri: '' };
    }
  };

  const contributeToGoalDirect = async (goalId: number, goalName: string, amount: number) => {
    return processUpiPayment({
      amount,
      recipientName: `${goalName} Goal Vault`,
      recipientUpi: 'finfam.goals@hdfcbank',
      purpose: `Direct Goal Contribution: ${goalName}`,
      paymentType: 'GOAL_CONTRIBUTION',
      category: 'Goals',
      goalId,
      goalName
    });
  };

  // Protected Backend Operation: Export Financial Report (Requires active Premium)
  const exportFinancialReport = async (reportType: string = 'ANNUAL_SUMMARY') => {
    try {
      const res = await fetch('/api/premium/export-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.email,
          reportType
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Active FinFam Premium required to export reports.');
      }
      return { success: true, reportUrl: data.reportUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Multi-Account Persona Switcher (For testing multi-user invite & join flows)
  const switchAccount = (account: { id: number; name: string; email: string; phone?: string; role?: string }) => {
    setUserProfile((prev) => ({
      ...prev,
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone || prev.phone,
      familyRole: (account.role || 'Member') as any,
      // Fresh user starts with Free status until verified from backend
      isPremium: false,
      premiumTier: 'FREE',
      premiumValidUntil: 'N/A'
    }));
  };

  // Family Management Actions
  const createFamily = async ({
    familyName,
    photoUrl,
    emails
  }: {
    familyName: string;
    photoUrl?: string;
    emails: string[];
  }) => {
    try {
      const res = await fetch('/api/family/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName,
          photoUrl,
          inviteEmails: emails,
          ownerUserId: userProfile.email,
          ownerEmail: userProfile.email,
          ownerName: userProfile.name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create family workspace');
      }

      setFamilyWorkspace(data.family);
      setFamilyInvitations(data.invitations || []);
      setUserProfile((prev) => ({
        ...prev,
        familyId: data.family.id,
        familyName: data.family.name,
        familyRole: 'Owner'
      }));

      // Creator is Owner
      const ownerMember: FamilyMemberItem = {
        id: Date.now(),
        name: userProfile.name,
        role: 'Owner',
        email: userProfile.email,
        avatarColor: '#06B6D4',
        monthlyContribution: userProfile.monthlySavings,
        spentThisMonth: 0,
        salaryIncome: userProfile.monthlyIncome,
        freelanceIncome: 0,
        businessIncome: 0,
        rentalIncome: 0,
        otherIncome: 0,
        foodExpense: 0,
        transportExpense: 0,
        shoppingExpense: 0,
        educationExpense: 0,
        healthExpense: 0,
        entertainmentExpense: 0,
        bankSavings: userProfile.totalBalance,
        emergencyFund: userProfile.emergencyFund,
        fixedDeposit: 0,
        mutualFund: 0,
        monthlyEmi: 0,
        equityInvestments: 0,
        goldInvestments: 0,
        ppfInvestments: 0,
        fdInterest: 0,
        rdInterest: 0,
        savingsInterest: 0,
        investmentReturns: 0
      };
      setFamilyMembers([ownerMember]);

      addNotificationAlert(
        'Family Workspace Created',
        `Created "${data.family.name}" with ${data.invitations.length} invitations dispatched.`,
        'SAVINGS_GOAL_REACHED'
      );

      return {
        success: true,
        family: data.family,
        invitations: data.invitations,
        inviteLinks: data.inviteLinks
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const resendFamilyInvitation = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/family/invitations/${inviteId}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingUserId: userProfile.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend invitation');

      setFamilyInvitations((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, ...data.invitation } : inv))
      );

      return { success: true, joinUrl: data.joinUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const revokeFamilyInvitation = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/family/invitations/${inviteId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingUserId: userProfile.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke invitation');

      setFamilyInvitations((prev) =>
        prev.map((inv) => (inv.id === inviteId ? { ...inv, acceptanceStatus: 'REVOKED' } : inv))
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const verifyInvitationToken = async (token: string, inviteId: string) => {
    try {
      const res = await fetch(
        `/api/family/invitations/verify?token=${encodeURIComponent(token)}&id=${encodeURIComponent(inviteId)}`
      );
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { valid: false, error: err.message };
    }
  };

  const acceptFamilyInvitation = async (token: string, inviteId: string) => {
    try {
      const res = await fetch('/api/family/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          inviteId,
          user: {
            id: userProfile.email,
            email: userProfile.email,
            name: userProfile.name
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          code: data.code,
          error: data.error,
          intendedEmail: data.intendedEmail,
          currentUserEmail: data.currentUserEmail
        };
      }

      // Successfully joined family workspace
      setUserProfile((prev) => ({
        ...prev,
        familyId: data.family.id,
        familyName: data.family.name,
        familyRole: (data.member?.role || 'Member') as any
      }));
      setFamilyWorkspace(data.family);

      addNotificationAlert(
        'Joined Family Workspace',
        `You have successfully joined "${data.family.name}".`,
        'SAVINGS_GOAL_REACHED'
      );

      return { success: true, family: data.family, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeFamilyMemberFromVault = async (memberId: string | number) => {
    try {
      const res = await fetch(`/api/family/${userProfile.familyId}/members/${memberId}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestingUserId: userProfile.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');

      setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId && m.userId !== memberId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const leaveFamilyWorkspace = async () => {
    try {
      const res = await fetch(`/api/family/${userProfile.familyId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to leave family');

      setUserProfile((prev) => ({
        ...prev,
        familyId: '',
        familyName: 'Personal Workspace',
        familyRole: 'Member'
      }));
      setFamilyMembers([]);
      setFamilyInvitations([]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const transferFamilyOwnership = async (targetMemberId: string | number) => {
    try {
      const res = await fetch(`/api/family/${userProfile.familyId}/transfer-ownership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMemberId,
          requestingUserId: userProfile.email
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transfer ownership');

      setUserProfile((prev) => ({ ...prev, familyRole: 'Member' }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // CRUD Operations
  const addExpense = (
    title: string,
    category: string,
    amount: number,
    paymentMethod: string,
    notes: string = '',
    isFamilyShared: boolean = false,
    memberName: string = 'Priyanshu'
  ) => {
    const newItem: TransactionItem = {
      id: Date.now(),
      title,
      category,
      amount,
      type: 'EXPENSE',
      isCredit: false,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      paymentMethod,
      notes,
      isFamilyShared,
      memberName,
      iconName: SpendingTrendsEngine.getCategoryIcon(category),
      riskStatus: 'VERIFIED'
    };

    setTransactions((prev) => [newItem, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      totalBalance: Math.max(prev.totalBalance - amount, 0),
      monthlyExpenses: prev.monthlyExpenses + amount,
      monthlySavings: Math.max(prev.monthlyIncome - (prev.monthlyExpenses + amount), 0)
    }));

    // Update matching budget spent
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.category.toLowerCase().includes(category.toLowerCase())) {
          return { ...b, spent: b.spent + amount };
        }
        return b;
      })
    );
  };

  const addIncome = (
    title: string,
    category: string,
    amount: number,
    paymentMethod: string,
    notes: string = '',
    memberName: string = 'Priyanshu'
  ) => {
    const newItem: TransactionItem = {
      id: Date.now(),
      title,
      category,
      amount,
      type: 'INCOME',
      isCredit: true,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      paymentMethod,
      notes,
      isFamilyShared: true,
      memberName,
      iconName: 'Sparkles',
      riskStatus: 'VERIFIED'
    };

    setTransactions((prev) => [newItem, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + amount,
      monthlyIncome: prev.monthlyIncome + amount,
      monthlySavings: prev.monthlySavings + amount
    }));
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addBudget = (category: string, limit: number) => {
    const newBudget: BudgetItem = {
      id: Date.now(),
      category,
      monthlyLimit: limit,
      spent: 0,
      month: 'August 2026',
      iconName: SpendingTrendsEngine.getCategoryIcon(category),
      alertThreshold80: true,
      alertThreshold90: true,
      alertThreshold100: true
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const deleteBudget = (id: number) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addGoal = (
    name: string,
    emoji: string,
    targetAmount: number,
    targetDate: string,
    category: string,
    isFamilyGoal: boolean,
    extra?: Partial<GoalItem>
  ) => {
    const newGoal: GoalItem = {
      id: Date.now(),
      name,
      emoji: emoji || '🎯',
      targetAmount,
      currentAmount: 0,
      targetDate,
      category,
      isFamilyGoal,
      monthlyContribution: extra?.monthlyContribution || Math.round(targetAmount / 24),
      priority: extra?.priority || 'MEDIUM',
      hardDeadline: extra?.hardDeadline || false,
      expectedAnnualReturn: extra?.expectedAnnualReturn || 8,
      inflationRate: extra?.inflationRate || 6,
      ...extra
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const depositGoal = (id: number, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g))
    );
    addExpense(`Goal Deposit: Goal #${id}`, 'Savings', amount, 'Vault Transfer', 'Deposited into Goal', true);
  };

  const withdrawGoal = (id: number, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.max(g.currentAmount - amount, 0) } : g))
    );
    addIncome(`Goal Withdrawal: Goal #${id}`, 'Savings', amount, 'Vault Transfer', 'Withdrawn to Vault');
  };

  const deleteGoal = (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addBill = (name: string, amount: number, dueDate: string, category: string, isRecurring: boolean, autoPay: boolean) => {
    const newBill: BillItem = {
      id: Date.now(),
      name,
      amount,
      dueDate,
      dueTimestamp: Date.now() + 86400000 * 7,
      category,
      isRecurring,
      isPaid: false,
      reminderDays: 3,
      autoPayEnabled: autoPay
    };
    setBills((prev) => [...prev, newBill]);
  };

  const payBill = (billId: number, billName: string, amount: number, method: string = 'UPI') => {
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, isPaid: true } : b)));
    addExpense(billName, 'Bills', amount, method, `Paid utility bill (${billName})`, true);
  };

  const deleteBill = (id: number) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleAutoPay = (id: number) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, autoPayEnabled: !b.autoPayEnabled } : b)));
  };

  const addFamilyMember = (data: Partial<FamilyMemberItem>) => {
    const newMember: FamilyMemberItem = {
      id: Date.now(),
      name: data.name || 'New Member',
      role: data.role || 'Member',
      email: data.email || '',
      avatarColor: data.avatarColor || '#3B82F6',
      monthlyContribution: data.monthlyContribution || 0,
      spentThisMonth: data.spentThisMonth || 0,
      salaryIncome: data.salaryIncome || 0,
      freelanceIncome: 0,
      businessIncome: 0,
      rentalIncome: 0,
      otherIncome: 0,
      foodExpense: 0,
      transportExpense: 0,
      shoppingExpense: 0,
      educationExpense: 0,
      healthExpense: 0,
      entertainmentExpense: 0,
      bankSavings: 0,
      emergencyFund: 0,
      fixedDeposit: 0,
      mutualFund: 0,
      monthlyEmi: 0,
      equityInvestments: 0,
      goldInvestments: 0,
      ppfInvestments: 0,
      fdInterest: 0,
      rdInterest: 0,
      savingsInterest: 0,
      investmentReturns: 0
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  const updateFamilyMember = (member: FamilyMemberItem) => {
    setFamilyMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
  };

  const deleteFamilyMember = (id: number | string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const addEmi = (
    title: string,
    category: string,
    totalAmount: number,
    monthlyEmi: number,
    interestRate: number,
    tenureMonths: number,
    lenderBank: string,
    dueDate: string = '05th of every month'
  ) => {
    const newEmi: EmiItem = {
      id: Date.now(),
      title,
      category,
      totalAmount,
      paidAmount: 0,
      monthlyEmi,
      interestRate,
      totalTenureMonths: tenureMonths,
      paidTenureMonths: 0,
      dueDate,
      dueDayOfMonth: 5,
      lenderBank,
      isAutoDebit: true,
      isPaidThisMonth: false,
      iconName: category.toLowerCase().includes('car') ? 'Car' : category.toLowerCase().includes('bike') ? 'Bike' : 'Landmark'
    };
    setEmis((prev) => [...prev, newEmi]);
  };

  const payEmi = (emiId: number, emiTitle: string, amount: number, method: string = 'UPI') => {
    setEmis((prev) =>
      prev.map((e) => {
        if (e.id === emiId) {
          return {
            ...e,
            paidAmount: Math.min(e.paidAmount + amount, e.totalAmount),
            paidTenureMonths: Math.min(e.paidTenureMonths + 1, e.totalTenureMonths),
            isPaidThisMonth: true,
            lastPaymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          };
        }
        return e;
      })
    );
    addExpense(emiTitle, 'Debt & EMI', amount, method, `Loan EMI installment for ${emiTitle}`);
  };

  const deleteEmi = (id: number) => {
    setEmis((prev) => prev.filter((e) => e.id !== id));
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUserProfile(INITIAL_PROFILE);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setBills(INITIAL_BILLS);
    setFamilyMembers(INITIAL_FAMILY);
    setEmis(INITIAL_EMIS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRadarHealthAxes(INITIAL_RADAR_AXES);
    setRealTimeTransferHistory(INITIAL_TRANSFER_HISTORY);
  };

  // Multi-Goal Planning Engine Calculations
  const totalActiveEMI = useMemo(() => emis.reduce((sum, e) => sum + e.monthlyEmi, 0), [emis]);
  const recurringBills = useMemo(
    () => bills.filter((b) => b.isRecurring && !b.isPaid).reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  const financialCapacity = useMemo(
    () =>
      FinancialCapacityEngine.calculateCapacity({
        monthlyIncome: userProfile.monthlyIncome,
        essentialExpenses: userProfile.monthlyExpenses,
        totalActiveEMI,
        recurringBills
      }),
    [userProfile.monthlyIncome, userProfile.monthlyExpenses, totalActiveEMI, recurringBills]
  );

  const goalPortfolioSummary = useMemo(
    () =>
      GoalPortfolioEngine.evaluatePortfolio({
        goals,
        monthlyIncome: userProfile.monthlyIncome,
        essentialExpenses: userProfile.monthlyExpenses,
        totalActiveEMI,
        recurringBills
      }),
    [goals, userProfile.monthlyIncome, userProfile.monthlyExpenses, totalActiveEMI, recurringBills]
  );

  const goalFeasibilities = useMemo(
    () => GoalFeasibilityEngine.evaluateAllGoals(goals, financialCapacity.availableCapacity),
    [goals, financialCapacity.availableCapacity]
  );

  const goalConflicts = goalPortfolioSummary.conflicts;

  const loadHackathonDemoData = () => {
    setUserProfile((prev) => ({
      ...prev,
      monthlyIncome: HACKATHON_DEMO_DATA.monthlyIncome,
      monthlyExpenses: HACKATHON_DEMO_DATA.essentialExpenses
    }));

    setEmis([
      {
        id: 901,
        title: 'Active Vehicle Loan EMI',
        category: 'Vehicle',
        totalAmount: 200000,
        paidAmount: 50000,
        monthlyEmi: HACKATHON_DEMO_DATA.activeEMI,
        interestRate: 8.5,
        totalTenureMonths: 36,
        paidTenureMonths: 10,
        dueDate: '05th of month',
        dueDayOfMonth: 5,
        lenderBank: 'HDFC Bank',
        isAutoDebit: true,
        isPaidThisMonth: true,
        iconName: 'Car'
      }
    ]);

    setGoals(HACKATHON_DEMO_DATA.goals);
  };

  const updateGoal = (id: number, data: Partial<GoalItem>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  };

  const applyResolutionScenario = (scenario: ResolutionScenario) => {
    setGoals((prev) =>
      prev.map((g) => {
        const alloc = scenario.allocations.find((a) => a.goalId === g.id);
        if (!alloc) return g;
        return {
          ...g,
          monthlyContribution: alloc.recommendedContribution,
          targetDate: alloc.newTargetDate,
          targetAmount: alloc.newTargetAmount,
          canPause: alloc.isPaused
        };
      })
    );
  };

  return (
    <FinFamContext.Provider
      value={{
        userProfile,
        transactions,
        budgets,
        goals,
        bills,
        familyMembers,
        emis,
        financialHealth,
        monthlySpendingTrends,
        spendingTrendHorizon,
        setSpendingTrendHorizon,
        spendingTrendCategory,
        setSpendingTrendCategory,
        spendingTrendMultiCategories,
        toggleSpendingTrendMultiCategory,
        spendingTrendMultiLineMode,
        setSpendingTrendMultiLineMode,
        spendingTrendSelectedMonthIndex,
        setSpendingTrendSelectedMonth,
        radarHealthAxes,
        isSimulatingRadarUpdates,
        togglePeriodicRadarSimulation,
        simulateRadarDataStep,
        resetRadarBaseline,
        dailySpendingPoints,
        weeklySpendingBars,
        familyContributions,
        expensePrediction,
        notifications,
        dismissNotification,
        markAllNotificationsRead,
        addNotificationAlert,
        chatMessages,
        isCoachTyping,
        askAiCoach,
        scannedReceiptResult,
        isScanningReceipt,
        scanReceiptSimulator,
        confirmScannedReceiptAsExpense,
        dismissScannedReceipt,
        liveP2pNodes,
        realTimeTransferHistory,
        isLiveTransferStreaming,
        executeRealTimeFundsTransfer,
        paymentHistory,
        activePlanTier,
        isSubscriptionActive,
        paymentFlowState,
        lastPaymentError,
        familyWorkspace,
        familyInvitations,
        familyActivities,
        isRealTimeFamilyConnected,
        createFamily,
        resendFamilyInvitation,
        revokeFamilyInvitation,
        verifyInvitationToken,
        acceptFamilyInvitation,
        removeFamilyMemberFromVault,
        leaveFamilyWorkspace,
        transferFamilyOwnership,
        switchAccount,
        restorePurchases,
        exportFinancialReport,
        processSubscriptionPayment,
        refundPayment,
        upiTransactions,
        finfamWallet,
        fetchUpiHistory,
        processUpiPayment,
        refundUpiPayment,
        requestUpiMoney,
        contributeToGoalDirect,
        addExpense,
        addIncome,
        deleteTransaction,
        addBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        depositGoal,
        withdrawGoal,
        deleteGoal,
        financialCapacity,
        goalFeasibilities,
        goalConflicts,
        goalPortfolioSummary,
        loadHackathonDemoData,
        applyResolutionScenario,
        addBill,
        payBill,
        deleteBill,
        toggleAutoPay,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        addEmi,
        payEmi,
        deleteEmi,
        updateProfile,
        resetAllData,
        decisionHistory,
        saveDecisionRecord,
        deleteDecisionRecord,
        updateDecisionStatus
      }}
    >
      {children}
    </FinFamContext.Provider>
  );
};

export const useFinFam = () => {
  const context = useContext(FinFamContext);
  if (!context) {
    throw new Error('useFinFam must be used within a FinFamProvider');
  }
  return context;
};
