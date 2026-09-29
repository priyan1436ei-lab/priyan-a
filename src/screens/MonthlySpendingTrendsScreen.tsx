import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import { TimeHorizonType } from '../types';

export const MonthlySpendingTrendsScreen: React.FC = () => {
  const {
    monthlySpendingTrends,
    spendingTrendHorizon,
    setSpendingTrendHorizon,
    spendingTrendCategory,
    setSpendingTrendCategory,
    spendingTrendMultiCategories,
    toggleSpendingTrendMultiCategory,
    spendingTrendMultiLineMode,
    setSpendingTrendMultiLineMode
  } = useFinFam();

  const horizons: { id: TimeHorizonType; label: string }[] = [
    { id: 'LAST_3_MONTHS', label: 'Last 3M' },
    { id: 'LAST_6_MONTHS', label: 'Last 6M' },
    { id: 'LAST_12_MONTHS', label: '1 Year' },
    { id: 'ALL_TIME', label: 'All Time' }
  ];

  const categories = [
    'ALL',
    'Food',
    'Rent',
    'Bills',
    'Travel',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Investment'
  ];

  // Prepare chart data for Recharts
  const chartData = monthlySpendingTrends.monthlyDataPoints.map((dp, idx) => {
    const item: any = {
      month: dp.monthShort,
      monthFull: dp.monthFull,
      TotalExpense: dp.totalExpense,
      TotalIncome: dp.totalIncome
    };
    Object.entries(dp.categoryAmounts).forEach(([cat, val]) => {
      item[cat] = val;
    });
    return item;
  });

  const { metrics, categoryBreakdowns } = monthlySpendingTrends;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Monthly Spending Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track category trajectories, cash flow dynamics, and historical averages
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex items-center bg-slate-900 border border-white/10 p-1 rounded-xl w-fit">
          {horizons.map((h) => (
            <button
              key={h.id}
              onClick={() => setSpendingTrendHorizon(h.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                spendingTrendHorizon === h.id
                  ? 'bg-cyan-500 text-[#050816] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Average Monthly Spend</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {FinancialEngine.formatINR(metrics.averageMonthlySpend)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Calculated across selected window</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Peak Spending Month</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400 mt-1">
            {FinancialEngine.formatINR(metrics.highestSpendAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Recorded in {metrics.highestSpendMonth}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Lowest Spend Month</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
            {FinancialEngine.formatINR(metrics.lowestSpendAmount)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Recorded in {metrics.lowestSpendMonth}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-[11px] font-semibold text-slate-400">Month-over-Month Change</div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono mt-1 flex items-center gap-1 ${
              metrics.momPercentageChange >= 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {metrics.momPercentageChange >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {metrics.momPercentageChange > 0 ? '+' : ''}
            {metrics.momPercentageChange.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Top Category: <span className="text-cyan-400 font-semibold">{metrics.topCategory}</span> (
            {metrics.topCategoryPercentage.toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Chart Mode Controls */}
      <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Filter By Category:</span>
            {!spendingTrendMultiLineMode && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSpendingTrendCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      spendingTrendCategory === cat
                        ? 'bg-cyan-500 text-[#050816]'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpendingTrendMultiLineMode(!spendingTrendMultiLineMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                spendingTrendMultiLineMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {spendingTrendMultiLineMode ? 'Multi-Line Mode: ON' : 'Multi-Line Comparison'}
            </button>
          </div>
        </div>

        {/* Multi-Category Selector when active */}
        {spendingTrendMultiLineMode && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/40 rounded-xl border border-purple-500/20">
            <span className="text-xs text-purple-300 font-semibold">Select series to compare:</span>
            {categories
              .filter((c) => c !== 'ALL')
              .map((cat) => {
                const isSelected = spendingTrendMultiCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleSpendingTrendMultiCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 font-semibold'
                        : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cat}
                  </button>
                );
              })}
          </div>
        )}

        {/* Interactive Line Chart Canvas */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0A1022] border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <div className="font-bold text-white border-b border-white/10 pb-1 mb-1.5">
                          {payload[0]?.payload?.monthFull || label}
                        </div>
                        {payload.map((entry: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <span style={{ color: entry.color }} className="font-medium">
                              {entry.name}:
                            </span>
                            <span className="font-mono font-bold text-white">
                              ₹{Number(entry.value).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {/* Dynamic Lines based on mode */}
              {!spendingTrendMultiLineMode ? (
                spendingTrendCategory === 'ALL' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="TotalExpense"
                      name="Total Outflow"
                      stroke="#EF4444"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#EF4444' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="TotalIncome"
                      name="Total Inflow"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#10B981' }}
                    />
                  </>
                ) : (
                  <Line
                    type="monotone"
                    dataKey={spendingTrendCategory}
                    name={spendingTrendCategory}
                    stroke="#06B6D4"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#06B6D4' }}
                    activeDot={{ r: 7 }}
                  />
                )
              ) : (
                spendingTrendMultiCategories.map((cat, idx) => {
                  const palette = ['#06B6D4', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981'];
                  const color = palette[idx % palette.length];
                  return (
                    <Line
                      key={cat}
                      type="monotone"
                      dataKey={cat}
                      name={cat}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: color }}
                    />
                  );
                })
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & Budget Adherence List */}
      <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Category Breakdown & Variance</h3>
            <p className="text-[11px] text-slate-400">Total volume and share in this time window</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {metrics.totalSpendInWindow ? `Total: ${FinancialEngine.formatINR(metrics.totalSpendInWindow)}` : ''}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {categoryBreakdowns.map((cat) => (
            <div key={cat.category} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.colorHex }}
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {cat.category}
                    {cat.isBudgetExceeded && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/30 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Exceeded
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Monthly Avg: {FinancialEngine.formatINR(cat.monthlyAverage)} • Share: {cat.percentageShare.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-bold text-sm text-white">
                  {FinancialEngine.formatINR(cat.totalAmount)}
                </div>
                <div
                  className={`text-[10px] font-semibold mt-0.5 ${
                    cat.momPercentageChange >= 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {cat.momPercentageChange >= 0 ? '+' : ''}
                  {cat.momPercentageChange.toFixed(1)}% MoM
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
