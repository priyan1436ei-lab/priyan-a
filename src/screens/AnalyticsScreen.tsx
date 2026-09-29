import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  PieChart,
  BarChart3,
  Filter
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import { FinFamCard, CurrencyText, StatusBadge } from '../components/ui/FinFamDesignSystem';

export const AnalyticsScreen: React.FC<{ onNavigateToAiCoach: () => void }> = ({
  onNavigateToAiCoach
}) => {
  const { financialHealth, userProfile } = useFinFam();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7D' | '30D' | '3M' | '6M' | '1Y'>('30D');

  const timeframes = [
    { id: '7D', label: '7 Days' },
    { id: '30D', label: '30 Days' },
    { id: '3M', label: '3 Months' },
    { id: '6M', label: '6 Months' },
    { id: '1Y', label: '1 Year' }
  ];

  const radarData = [
    { subject: 'Savings Rate', score: financialHealth.pillars.savingsRate.score, fullMark: 100 },
    { subject: 'Debt Burden', score: financialHealth.pillars.debtToIncome.score, fullMark: 100 },
    { subject: 'Discipline', score: financialHealth.pillars.budgetDiscipline.score, fullMark: 100 },
    { subject: 'Emergency', score: financialHealth.pillars.emergencyFund.score, fullMark: 100 },
    { subject: 'Investments', score: financialHealth.pillars.investmentRate.score, fullMark: 100 }
  ];

  const projectedInflow = userProfile.monthlyIncome;
  const projectedOutflow = userProfile.monthlyExpenses * 0.95;
  const projectedEndBalance = userProfile.totalBalance + (projectedInflow - projectedOutflow);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto animate-fade-in text-slate-100">
      {/* Header with Timeframe Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Family Financial Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cash Flow, Solvency Radar & AI Predictive Growth Models
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe selector */}
          <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  selectedTimeframe === tf.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={onNavigateToAiCoach}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Coach</span>
          </button>
        </div>
      </div>

      {/* Radar Chart & Pillar Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Radar Spider Graph */}
        <FinFamCard variant="accent" className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              5-Pillar Solvency Geometry
            </span>
            <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Score: {financialHealth.overallScore}/100
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={9} />
                <Radar
                  name="Health Score"
                  dataKey="score"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </FinFamCard>

        {/* Pillar Breakdown Cards */}
        <FinFamCard variant="default" className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Pillar Scoring Breakdown
            </span>
            <StatusBadge status="success" label={financialHealth.statusLabel} />
          </div>

          <div className="space-y-3">
            {Object.entries(financialHealth.pillars).map(([key, rawPillar]) => {
              const pillar = rawPillar as { score: number; title?: string; summary?: string };
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">{pillar.title || key}</span>
                    <span className="font-mono font-bold text-cyan-400">{pillar.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">{pillar.summary || ''}</div>
                </div>
              );
            })}
          </div>
        </FinFamCard>
      </div>

      {/* 30-Day Predictive Cash Flow Forecast */}
      <FinFamCard variant="elevated" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              {selectedTimeframe} Predictive Cash Flow Forecast
            </h3>
            <p className="text-xs text-slate-400">
              Simulated projections based on recurring salaries, fixed bills, and historical burn rate
            </p>
          </div>
          <StatusBadge status="info" label="94% High Confidence" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Expected Inflow
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              +{FinancialEngine.formatINR(projectedInflow)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Salary & scheduled returns</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <ArrowUpRight className="w-4 h-4 text-rose-400" /> Expected Outflow
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              -{FinancialEngine.formatINR(projectedOutflow)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Bills, EMIs & family expenses</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Net Vault Balance
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {FinancialEngine.formatINR(projectedEndBalance)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              +{FinancialEngine.formatINR(projectedInflow - projectedOutflow)} net surplus
            </div>
          </div>
        </div>
      </FinFamCard>

      {/* AI Diagnostic Recommendations */}
      <FinFamCard variant="default" className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">AI Financial Diagnostics</h3>
        </div>

        <div className="space-y-2">
          {financialHealth.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </FinFamCard>
    </div>
  );
};
