import { AmortizationRow, EmiCalculationResult, LoanPreset, PrepaymentAnalysis } from '../types';

export const EmiCalculatorEngine = {
  LOAN_PRESETS: [
    {
      id: 'bike',
      title: 'Bike / Two-Wheeler',
      category: 'Vehicle',
      defaultAmount: 120000.0,
      defaultAnnualRate: 9.5,
      defaultTenureMonths: 24,
      iconName: 'Bike',
      defaultLender: 'HDFC Bank',
      description: 'Commuter or sports bike auto loan'
    },
    {
      id: 'car',
      title: 'Car / Four-Wheeler',
      category: 'Vehicle',
      defaultAmount: 750000.0,
      defaultAnnualRate: 8.75,
      defaultTenureMonths: 48,
      iconName: 'Car',
      defaultLender: 'SBI Car Loan',
      description: 'New passenger vehicle loan'
    },
    {
      id: 'laptop',
      title: 'Laptop & Workstation',
      category: 'Electronics',
      defaultAmount: 85000.0,
      defaultAnnualRate: 0.0,
      defaultTenureMonths: 12,
      iconName: 'Laptop',
      defaultLender: 'Bajaj Finserv',
      description: 'Zero-cost or consumer electronics EMI'
    },
    {
      id: 'mobile',
      title: 'Flagship Smartphone',
      category: 'Mobile',
      defaultAmount: 65000.0,
      defaultAnnualRate: 0.0,
      defaultTenureMonths: 6,
      iconName: 'Smartphone',
      defaultLender: 'ICICI Card EMI',
      description: 'No-cost smartphone installment'
    },
    {
      id: 'home',
      title: 'Home & Property Loan',
      category: 'Home',
      defaultAmount: 4500000.0,
      defaultAnnualRate: 8.5,
      defaultTenureMonths: 240,
      iconName: 'Home',
      defaultLender: 'Axis Bank Home Loan',
      description: 'Housing & construction loan'
    },
    {
      id: 'education',
      title: 'Higher Education Loan',
      category: 'Education',
      defaultAmount: 600000.0,
      defaultAnnualRate: 10.5,
      defaultTenureMonths: 60,
      iconName: 'GraduationCap',
      defaultLender: 'Canara Bank Education',
      description: 'University tuition & study fee loan'
    },
    {
      id: 'personal',
      title: 'Personal Loan',
      category: 'Personal',
      defaultAmount: 200000.0,
      defaultAnnualRate: 13.0,
      defaultTenureMonths: 36,
      iconName: 'Landmark',
      defaultLender: 'Kotak Mahindra Bank',
      description: 'Instant personal & emergency loan'
    }
  ] as LoanPreset[],

  calculateEmi(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    extraMonthlyPrepayment: number = 0.0
  ): EmiCalculationResult {
    const safePrincipal = Math.max(principal, 1000.0);
    const safeTenure = Math.max(Math.round(tenureMonths), 1);
    const safeRate = Math.max(annualRate, 0.0);

    const monthlyRate = safeRate / 12.0 / 100.0;

    let monthlyEmi: number;
    if (safeRate <= 0.001 || monthlyRate <= 0.0) {
      monthlyEmi = safePrincipal / safeTenure;
    } else {
      const factor = Math.pow(1 + monthlyRate, safeTenure);
      if (!isFinite(factor) || factor === 1.0) {
        monthlyEmi = safePrincipal / safeTenure;
      } else {
        monthlyEmi = (safePrincipal * monthlyRate * factor) / (factor - 1);
      }
    }

    const totalPayable = monthlyEmi * safeTenure;
    const totalInterest = Math.max(totalPayable - safePrincipal, 0.0);

    const totalForRatio = Math.max(safePrincipal + totalInterest, 1.0);
    const principalPct = Math.min(Math.max((safePrincipal / totalForRatio) * 100, 0), 100);
    const interestPct = Math.min(Math.max((totalInterest / totalForRatio) * 100, 0), 100);

    // Monthly Amortization Table
    const monthlyList: AmortizationRow[] = [];
    let currentBalance = safePrincipal;
    let cumulativeInterest = 0.0;

    for (let m = 1; m <= safeTenure; m++) {
      const opening = currentBalance;
      const interestForMonth = monthlyRate > 0 ? opening * monthlyRate : 0.0;
      const principalForMonth = Math.max(Math.min(monthlyEmi - interestForMonth, opening), 0.0);
      const closing = Math.max(opening - principalForMonth, 0.0);
      cumulativeInterest += interestForMonth;

      monthlyList.push({
        periodIndex: m,
        periodLabel: `Month ${m}`,
        openingBalance: opening,
        emiPaid: principalForMonth + interestForMonth,
        principalPaid: principalForMonth,
        interestPaid: interestForMonth,
        closingBalance: closing,
        cumulativeInterest: cumulativeInterest
      });
      currentBalance = closing;
      if (currentBalance <= 0.01) break;
    }

    // Yearly Amortization Table
    const yearlyList: AmortizationRow[] = [];
    const totalYears = Math.floor((safeTenure + 11) / 12);
    for (let y = 1; y <= totalYears; y++) {
      const startMonth = (y - 1) * 12 + 1;
      const endMonth = Math.min(y * 12, safeTenure);
      const monthsInYear = monthlyList.filter(
        (row) => row.periodIndex >= startMonth && row.periodIndex <= endMonth
      );
      if (monthsInYear.length > 0) {
        const opening = monthsInYear[0].openingBalance;
        const principalYear = monthsInYear.reduce((acc, r) => acc + r.principalPaid, 0);
        const interestYear = monthsInYear.reduce((acc, r) => acc + r.interestPaid, 0);
        const emiYear = monthsInYear.reduce((acc, r) => acc + r.emiPaid, 0);
        const closing = monthsInYear[monthsInYear.length - 1].closingBalance;
        const cumInt = monthsInYear[monthsInYear.length - 1].cumulativeInterest;

        yearlyList.push({
          periodIndex: y,
          periodLabel: `Year ${y}`,
          openingBalance: opening,
          emiPaid: emiYear,
          principalPaid: principalYear,
          interestPaid: interestYear,
          closingBalance: closing,
          cumulativeInterest: cumInt
        });
      }
    }

    // Prepayment Scenario
    let prepayment: PrepaymentAnalysis | null = null;
    if (extraMonthlyPrepayment > 0) {
      prepayment = this.computePrepayment(
        safePrincipal,
        monthlyRate,
        monthlyEmi,
        safeTenure,
        totalInterest,
        extraMonthlyPrepayment
      );
    }

    return {
      principal: safePrincipal,
      annualInterestRate: safeRate,
      tenureMonths: safeTenure,
      monthlyEmi,
      totalInterest,
      totalPayable,
      interestPercentageOfTotal: interestPct,
      principalPercentageOfTotal: principalPct,
      yearlyAmortization: yearlyList,
      monthlyAmortization: monthlyList,
      prepaymentScenario: prepayment
    };
  },

  computePrepayment(
    principal: number,
    monthlyRate: number,
    standardEmi: number,
    originalTenure: number,
    originalTotalInterest: number,
    extraMonthly: number
  ): PrepaymentAnalysis {
    let balance = principal;
    const effectiveMonthly = standardEmi + extraMonthly;
    let newTenureMonths = 0;
    let newTotalInterest = 0.0;

    while (balance > 0.01 && newTenureMonths < originalTenure * 2) {
      newTenureMonths++;
      const interestMonth = monthlyRate > 0 ? balance * monthlyRate : 0.0;
      newTotalInterest += interestMonth;
      const principalMonth = Math.min(effectiveMonthly - interestMonth, balance);
      balance = Math.max(balance - principalMonth, 0.0);
    }

    const monthsSaved = Math.max(originalTenure - newTenureMonths, 0);
    const interestSaved = Math.max(originalTotalInterest - newTotalInterest, 0.0);
    const savingsPct =
      originalTotalInterest > 0
        ? Math.min(Math.max((interestSaved / originalTotalInterest) * 100, 0), 100)
        : 0;

    return {
      extraMonthlyPayment: extraMonthly,
      originalTenureMonths: originalTenure,
      newTenureMonths,
      monthsSaved,
      originalTotalInterest,
      newTotalInterest,
      totalInterestSaved: interestSaved,
      interestSavingsPercent: savingsPct
    };
  }
};
