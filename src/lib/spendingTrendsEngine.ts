import {
  BudgetItem,
  CategoryBreakdownItem,
  CategoryTrendSeries,
  MonthlyDataPoint,
  MonthlySpendingTrendsState,
  TimeHorizonType,
  TransactionItem,
  TrendMetrics
} from '../types';

export const SpendingTrendsEngine = {
  CATEGORY_COLORS: {
    Food: '#06B6D4', // Cyan
    Rent: '#3B82F6', // Primary Blue
    Bills: '#F59E0B', // Amber
    Travel: '#8B5CF6', // Violet
    Shopping: '#EC4899', // Pink
    Entertainment: '#F97316', // Orange
    Healthcare: '#10B981', // Emerald
    Investment: '#6366F1', // Indigo
    Education: '#14B8A6', // Teal
    Others: '#94A3B8' // Slate Gray
  } as Record<string, string>,

  CATEGORY_ICONS: {
    Food: 'Utensils',
    Rent: 'Home',
    Bills: 'Zap',
    Travel: 'Car',
    Shopping: 'ShoppingBag',
    Entertainment: 'Tv',
    Healthcare: 'HeartPulse',
    Investment: 'TrendingUp',
    Education: 'GraduationCap',
    Others: 'Receipt'
  } as Record<string, string>,

  getCategoryColorHex(category: string): string {
    return this.CATEGORY_COLORS[category] || '#38BDF8';
  },

  getCategoryIcon(category: string): string {
    return this.CATEGORY_ICONS[category] || 'Receipt';
  },

  normalizeCategory(category: string): string {
    const trimmed = category.trim().toLowerCase();
    if (trimmed.includes('food') || trimmed.includes('grocer') || trimmed.includes('dining') || trimmed.includes('restaurant')) return 'Food';
    if (trimmed.includes('rent') || trimmed.includes('hous')) return 'Rent';
    if (trimmed.includes('bill') || trimmed.includes('electr') || trimmed.includes('water') || trimmed.includes('wifi') || trimmed.includes('utilit')) return 'Bills';
    if (trimmed.includes('travel') || trimmed.includes('fuel') || trimmed.includes('uber') || trimmed.includes('cab') || trimmed.includes('commute')) return 'Travel';
    if (trimmed.includes('shop') || trimmed.includes('cloth') || trimmed.includes('amazon')) return 'Shopping';
    if (trimmed.includes('entertain') || trimmed.includes('movie') || trimmed.includes('sub') || trimmed.includes('netflix')) return 'Entertainment';
    if (trimmed.includes('health') || trimmed.includes('medic') || trimmed.includes('pharma') || trimmed.includes('doctor')) return 'Healthcare';
    if (trimmed.includes('invest') || trimmed.includes('sip') || trimmed.includes('stock') || trimmed.includes('mutual')) return 'Investment';
    if (trimmed.includes('educat') || trimmed.includes('school') || trimmed.includes('course')) return 'Education';
    return 'Others';
  },

  computeTrends(
    transactions: TransactionItem[],
    budgets: BudgetItem[] = [],
    timeHorizon: TimeHorizonType = 'LAST_6_MONTHS',
    selectedCategory: string = 'ALL',
    selectedMultiCategories: string[] = [],
    isMultiLineMode: boolean = false,
    pinnedMonthIndex: number = -1
  ): MonthlySpendingTrendsState {
    const monthsCount =
      timeHorizon === 'LAST_3_MONTHS'
        ? 3
        : timeHorizon === 'LAST_6_MONTHS'
        ? 6
        : timeHorizon === 'LAST_12_MONTHS'
        ? 12
        : 24;

    // Reference month: August 2026
    const refDate = new Date(2026, 7, 21); // month 7 is August

    const monthKeys: string[] = [];
    const monthShortLabels: string[] = [];
    const monthStartTimes: number[] = [];
    const monthEndTimes: number[] = [];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const startMs = d.getTime();
      const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const endMs = endD.getTime();

      monthKeys.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
      monthShortLabels.push(monthShorts[d.getMonth()]);
      monthStartTimes.push(startMs);
      monthEndTimes.push(endMs);
    }

    const standardCategories = [
      'Food', 'Rent', 'Bills', 'Travel', 'Shopping', 'Entertainment', 'Healthcare', 'Investment'
    ];

    const matrix: Record<string, number[]> = {};
    standardCategories.forEach((cat) => {
      matrix[cat] = new Array(monthsCount).fill(0);
    });

    const baselineMonthlyPattern: Record<string, number[]> = {
      Food: [7400, 7850, 8100, 7600, 8400, 8250],
      Rent: [18000, 18000, 18000, 18000, 18000, 18000],
      Bills: [3400, 3100, 3800, 3200, 3600, 3200],
      Travel: [2400, 2900, 1800, 2600, 2200, 2100],
      Shopping: [3800, 4200, 2100, 4900, 3100, 2450],
      Entertainment: [1900, 2200, 1400, 1800, 2100, 1600],
      Healthcare: [1200, 600, 1800, 950, 1100, 800],
      Investment: [5000, 5000, 5000, 5000, 5000, 5000]
    };

    // Populate baseline
    for (let m = 0; m < monthsCount; m++) {
      const patternIdx = ((6 - monthsCount + m) % 6 + 6) % 6;
      standardCategories.forEach((cat) => {
        if (baselineMonthlyPattern[cat]) {
          matrix[cat][m] = baselineMonthlyPattern[cat][patternIdx];
        }
      });
    }

    // Overlay transactions
    const expenseTransactions = transactions.filter((t) => !t.isCredit && t.amount > 0);
    expenseTransactions.forEach((tx) => {
      const txTime = tx.timestamp;
      for (let m = 0; m < monthsCount; m++) {
        if (txTime >= monthStartTimes[m] && txTime <= monthEndTimes[m]) {
          const cat = this.normalizeCategory(tx.category);
          if (!matrix[cat]) {
            matrix[cat] = new Array(monthsCount).fill(0);
          }
          if (m === monthsCount - 1) {
            matrix[cat][m] = Math.max(matrix[cat][m] + tx.amount, tx.amount);
          } else {
            matrix[cat][m] += tx.amount;
          }
          break;
        }
      }
    });

    const totalExpensesPerMonth = new Array(monthsCount).fill(0);
    const totalIncomesPerMonth = new Array(monthsCount).fill(0);

    for (let m = 0; m < monthsCount; m++) {
      let sumExp = 0;
      Object.values(matrix).forEach((arr) => {
        sumExp += arr[m] || 0;
      });
      totalExpensesPerMonth[m] = sumExp;
      totalIncomesPerMonth[m] = 65000 + (m % 2 === 0 ? 12500 : 5000);
    }

    const monthlyDataPoints: MonthlyDataPoint[] = [];
    for (let m = 0; m < monthsCount; m++) {
      const catMap: Record<string, number> = {};
      Object.entries(matrix).forEach(([cat, arr]) => {
        catMap[cat] = arr[m];
      });
      monthlyDataPoints.push({
        monthFull: monthKeys[m],
        monthShort: monthShortLabels[m],
        totalExpense: totalExpensesPerMonth[m],
        totalIncome: totalIncomesPerMonth[m],
        categoryAmounts: catMap
      });
    }

    const budgetMap: Record<string, number> = {};
    budgets.forEach((b) => {
      budgetMap[b.category] = b.monthlyLimit;
    });

    const categorySeries: CategoryTrendSeries[] = Object.entries(matrix)
      .map(([cat, points]) => {
        const total = points.reduce((acc, v) => acc + v, 0);
        const avg = points.length > 0 ? total / points.length : 0;

        let peakIdx = 0;
        let lowestIdx = 0;
        points.forEach((val, idx) => {
          if (val > points[peakIdx]) peakIdx = idx;
          if (val < points[lowestIdx]) lowestIdx = idx;
        });

        const mom =
          points.length >= 2
            ? ((points[points.length - 1] - Math.max(points[points.length - 2], 1)) /
                Math.max(points[points.length - 2], 1)) *
              100
            : 0;

        return {
          category: cat,
          colorHex: this.getCategoryColorHex(cat),
          dataPoints: points,
          totalSpent: total,
          averageMonthly: avg,
          momPercentageChange: mom,
          peakMonth: monthShortLabels[peakIdx] || '-',
          peakAmount: points[peakIdx] || 0,
          lowestMonth: monthShortLabels[lowestIdx] || '-',
          lowestAmount: points[lowestIdx] || 0,
          budgetLimit: budgetMap[cat]
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const totalSpendWindow = totalExpensesPerMonth.reduce((acc, v) => acc + v, 0);
    const avgMonthlySpend = monthsCount > 0 ? totalSpendWindow / monthsCount : 0;

    let maxMonthIdx = 0;
    let minMonthIdx = 0;
    totalExpensesPerMonth.forEach((val, idx) => {
      if (val > totalExpensesPerMonth[maxMonthIdx]) maxMonthIdx = idx;
      if (val < totalExpensesPerMonth[minMonthIdx]) minMonthIdx = idx;
    });

    const latestSpend = totalExpensesPerMonth[totalExpensesPerMonth.length - 1] || 0;
    const prevSpend =
      totalExpensesPerMonth.length >= 2
        ? totalExpensesPerMonth[totalExpensesPerMonth.length - 2]
        : latestSpend;
    const overallMom = prevSpend > 0 ? ((latestSpend - prevSpend) / prevSpend) * 100 : 0;

    const topCat = categorySeries[0]?.category || 'Food';
    const topCatSpend = categorySeries[0]?.totalSpent || 0;
    const topCatPct = totalSpendWindow > 0 ? (topCatSpend / totalSpendWindow) * 100 : 0;

    const metrics: TrendMetrics = {
      averageMonthlySpend: avgMonthlySpend,
      highestSpendMonth: monthShortLabels[maxMonthIdx] || '-',
      highestSpendAmount: totalExpensesPerMonth[maxMonthIdx] || 0,
      lowestSpendMonth: monthShortLabels[minMonthIdx] || '-',
      lowestSpendAmount: totalExpensesPerMonth[minMonthIdx] || 0,
      latestMonthSpend: latestSpend,
      previousMonthSpend: prevSpend,
      momPercentageChange: overallMom,
      topCategory: topCat,
      topCategoryPercentage: topCatPct,
      totalSpendInWindow: totalSpendWindow
    };

    const categoryBreakdowns: CategoryBreakdownItem[] = categorySeries.map((series) => {
      const pctShare = totalSpendWindow > 0 ? (series.totalSpent / totalSpendWindow) * 100 : 0;
      const isExceeded =
        series.budgetLimit != null &&
        (series.dataPoints[series.dataPoints.length - 1] || 0) > series.budgetLimit;
      return {
        category: series.category,
        iconName: this.getCategoryIcon(series.category),
        colorHex: series.colorHex,
        totalAmount: series.totalSpent,
        percentageShare: pctShare,
        monthlyAverage: series.averageMonthly,
        momPercentageChange: series.momPercentageChange,
        isBudgetExceeded: isExceeded
      };
    });

    const effectiveMulti =
      selectedMultiCategories.length === 0 && isMultiLineMode
        ? ['Food', 'Rent', 'Bills']
        : selectedMultiCategories;

    return {
      monthsFull: monthKeys,
      monthsShort: monthShortLabels,
      monthlyDataPoints,
      categorySeries,
      totalExpenseSeries: totalExpensesPerMonth,
      totalIncomeSeries: totalIncomesPerMonth,
      selectedTimeHorizon: timeHorizon,
      selectedCategory,
      selectedMultiCategories: effectiveMulti,
      isMultiLineMode,
      metrics,
      categoryBreakdowns,
      selectedMonthIndex:
        pinnedMonthIndex >= 0 && pinnedMonthIndex < monthsCount
          ? pinnedMonthIndex
          : monthsCount - 1
    };
  }
};
