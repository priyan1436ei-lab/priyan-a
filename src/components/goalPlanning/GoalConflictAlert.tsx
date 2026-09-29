import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { GoalConflictItem } from '../../types/goalPlanning';
import { FinancialEngine } from '../../lib/financialEngine';

interface GoalConflictAlertProps {
  conflicts: GoalConflictItem[];
  monthlyShortfall: number;
  onNavigateToConflictMap?: () => void;
  onNavigateToResolutionLab?: () => void;
}

export const GoalConflictAlert: React.FC<GoalConflictAlertProps> = ({
  conflicts,
  monthlyShortfall,
  onNavigateToConflictMap,
  onNavigateToResolutionLab
}) => {
  if (conflicts.length === 0 && monthlyShortfall <= 0) {
    return null;
  }

  const criticalConflicts = conflicts.filter((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH');
  const mainConflict = conflicts[0];

  return (
    <div className="rounded-2xl bg-gradient-to-r from-rose-950/80 via-[#1A0C1F] to-rose-950/80 border border-rose-500/40 p-5 space-y-4 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                Multi-Goal Resource Conflict Detected
              </h3>
              <span className="text-[10px] font-black uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                {monthlyShortfall > 15000 ? 'CRITICAL SHORTFALL' : 'CAPACITY BOTTLENECK'}
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
              Total required monthly goal funding exceeds available household goal capacity by{' '}
              <span className="font-mono font-bold text-white text-sm">
                {FinancialEngine.formatINR(monthlyShortfall)}/month
              </span>.
              {mainConflict && ` ${mainConflict.reason}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onNavigateToConflictMap && (
            <button
              onClick={onNavigateToConflictMap}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" /> Heatmap
            </button>
          )}

          {onNavigateToResolutionLab && (
            <button
              onClick={onNavigateToResolutionLab}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" /> Resolve Conflicts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List of Affected Conflict Pairs */}
      {conflicts.length > 1 && (
        <div className="pt-3 border-t border-rose-500/20 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs relative z-10">
          {conflicts.slice(0, 4).map((c, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-rose-500/20 text-rose-200/80 flex items-center justify-between">
              <span className="truncate max-w-[200px] font-semibold text-white">
                {c.goalA.name} ⚡ {c.goalB.name}
              </span>
              <span className="font-mono font-bold text-rose-400 text-[11px]">
                -{FinancialEngine.formatINR(c.monthlyImpact)}/mo
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
