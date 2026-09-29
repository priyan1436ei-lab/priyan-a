import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Clock, Layers, AlertCircle } from 'lucide-react';
import { GoalItem, ResolutionScenario } from '../../types/goalPlanning';
import { ResolutionScenarioEngine } from '../../lib/goalPlanning/resolutionScenarioEngine';
import { FinancialEngine } from '../../lib/financialEngine';

interface ResolutionLabProps {
  goals: GoalItem[];
  availableCapacity: number;
  onApplyScenario: (scenario: ResolutionScenario) => void;
}

export const ResolutionLab: React.FC<ResolutionLabProps> = ({
  goals,
  availableCapacity,
  onApplyScenario
}) => {
  const scenarios = ResolutionScenarioEngine.generateScenarios(goals, availableCapacity);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');
  const [appliedSuccessId, setAppliedSuccessId] = useState<string | null>(null);

  const handleApply = (scenario: ResolutionScenario) => {
    onApplyScenario(scenario);
    setAppliedSuccessId(scenario.id);
    setTimeout(() => setAppliedSuccessId(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            FinFam Resolution Lab (5 Deterministic Scenarios)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare mathematically verified conflict-resolution strategies tailored to your household capacity
          </p>
        </div>
      </div>

      {/* Applied Banner */}
      {appliedSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          Successfully applied resolution scenario to your active household plan!
        </div>
      )}

      {/* Grid of 5 Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          const isZeroShortfall = sc.monthlyShortfall === 0;

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-5 transition-all cursor-pointer shadow-xl ${
                isSelected
                  ? 'bg-[#0E1528] border-cyan-400 ring-2 ring-cyan-500/20'
                  : 'bg-[#0E1528]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                      {sc.type}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1.5 leading-snug">
                      {sc.name}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border ${
                    isZeroShortfall ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isZeroShortfall ? 'BALANCED' : `-${FinancialEngine.formatINR(sc.monthlyShortfall)}`}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {sc.description}
                </p>

                {/* Score & Affected Counts */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">New Feasibility</span>
                    <span className="text-cyan-300 font-bold text-sm">{sc.newPortfolioFeasibilityScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">Affected Goals</span>
                    <span className="text-purple-300 font-bold text-sm">{sc.affectedGoalsCount} Goals</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Key Benefits</span>
                  {sc.benefits.map((b, idx) => (
                    <div key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Trade-Offs */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Trade-Offs</span>
                  {sc.tradeOffs.map((t, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(sc);
                }}
                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 mt-4"
              >
                Apply Scenario Strategy <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
