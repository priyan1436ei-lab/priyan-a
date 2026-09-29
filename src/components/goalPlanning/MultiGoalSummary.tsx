import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Layers,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GoalPortfolioSummary } from '../../types/goalPlanning';
import { FinancialEngine } from '../../lib/financialEngine';

interface MultiGoalSummaryProps {
  summary: GoalPortfolioSummary;
  onLoadDemoData: () => void;
  onNavigateToConflictMap?: () => void;
  onNavigateToResolutionLab?: () => void;
}

export const MultiGoalSummary: React.FC<MultiGoalSummaryProps> = ({
  summary,
  onLoadDemoData,
  onNavigateToConflictMap,
  onNavigateToResolutionLab
}) => {
  const isShortfall = summary.monthlyShortfall > 0;

  return (
    <div className="rounded-3xl bg-[#0E1528] border border-white/10 p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              FINFAM INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400 font-medium">Multi-Goal Planning & Conflict Resolution</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            Household Financial Capacity & Portfolio Health
          </h2>
        </div>

        <button
          onClick={onLoadDemoData}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          ⚡ Load Hackathon Conflict Demo
        </button>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Available Capacity */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Available Goal Capacity</span>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
            {FinancialEngine.formatINR(summary.availableMonthlyCapacity)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <p className="text-[11px] text-slate-400">Household income minus essential expenses & EMIs</p>
        </div>

        {/* Total Required Contribution */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Required Monthly SIP</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
            {FinancialEngine.formatINR(summary.requiredMonthlyContributions)}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <p className="text-[11px] text-slate-400">Sum of required contributions for all goals</p>
        </div>

        {/* Monthly Shortfall */}
        <div className={`rounded-2xl border p-4 space-y-2 ${
          isShortfall ? 'bg-rose-950/30 border-rose-500/40' : 'bg-emerald-950/30 border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Monthly Resource Shortfall</span>
            {isShortfall ? <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className={`text-xl sm:text-2xl font-black font-mono ${isShortfall ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isShortfall ? `-${FinancialEngine.formatINR(summary.monthlyShortfall)}` : '₹0 (Balanced)'}
            <span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {isShortfall ? 'Required funding exceeds available monthly capacity' : 'Household capacity comfortably covers all goal SIPs'}
          </p>
        </div>

        {/* Overall Feasibility Score */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Portfolio Feasibility Score</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300">
              {summary.overallFeasibilityScore}%
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              summary.overallFeasibilityScore >= 80
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : summary.overallFeasibilityScore >= 50
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {summary.overallFeasibilityScore >= 80 ? 'HEALTHY' : summary.overallFeasibilityScore >= 50 ? 'MODERATE' : 'CRITICAL'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Multi-goal feasibility & timeline alignment</p>
        </div>
      </div>

      {/* Goal Health Breakdown & Quick Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Goal Health Status:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/15 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
            🟢 {summary.onTrackCount} On Track
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
            🟡 {summary.atRiskCount} At Risk
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-rose-500/15 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30">
            🔴 {summary.conflictedCount} Conflicted
          </span>
          {summary.completedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-cyan-500/15 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/30">
              ✨ {summary.completedCount} Completed
            </span>
          )}
        </div>

        {isShortfall && (
          <div className="flex items-center gap-2">
            {onNavigateToConflictMap && (
              <button
                onClick={onNavigateToConflictMap}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all flex items-center gap-1"
              >
                Inspect Conflict Map
              </button>
            )}
            {onNavigateToResolutionLab && (
              <button
                onClick={onNavigateToResolutionLab}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-1"
              >
                Resolve Conflicts (5 Scenarios)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
