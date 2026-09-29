import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { FinFamCard, CurrencyText, StatusBadge } from './ui/FinFamDesignSystem';

interface RippleEffectSimulatorProps {
  onApplyScenario?: (delta: number) => void;
  onReset?: () => void;
}

export const RippleEffectSimulator: React.FC<RippleEffectSimulatorProps> = ({
  onApplyScenario,
  onReset
}) => {
  const [extraContribution, setExtraContribution] = useState<number>(2000);
  const [selectedGoal, setSelectedGoal] = useState<'education' | 'emergency' | 'vacation'>('education');
  const [isScenarioApplied, setIsScenarioApplied] = useState<boolean>(false);

  const calculateRipple = (delta: number, goal: string) => {
    return {
      primaryGoal: {
        name: goal === 'education' ? '🎓 Education Fund' : goal === 'emergency' ? '🛡️ Emergency Fund' : '✈️ Family Vacation',
        deltaMonthly: delta,
        monthsAccelerated: Math.max(1, Math.round(delta / 1000) * 2),
        completionDate: 'March 2027 (2 months earlier)'
      },
      impactedGoals: [
        {
          name: '🛡️ Emergency Fund',
          impact: delta > 0 ? 'Target delayed by 1 month' : 'No change',
          type: 'warning' as const,
          delayMonths: 1
        },
        {
          name: '✈️ Family Vacation',
          impact: delta > 0 ? 'Target delayed by 2 months' : 'No change',
          type: 'warning' as const,
          delayMonths: 2
        },
        {
          name: '💰 Flexible Monthly Savings',
          impact: `-₹${delta.toLocaleString('en-IN')}/month`,
          type: 'neutral' as const,
          delayMonths: 0
        }
      ]
    };
  };

  const simulation = calculateRipple(extraContribution, selectedGoal);

  const handleApply = () => {
    setIsScenarioApplied(true);
    if (onApplyScenario) onApplyScenario(extraContribution);
  };

  const handleReset = () => {
    setExtraContribution(2000);
    setSelectedGoal('education');
    setIsScenarioApplied(false);
    if (onReset) onReset();
  };

  return (
    <FinFamCard variant="highlight" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Ripple Effect Simulator
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Interactive Lab
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Simulate how shifting monthly capital creates cascade impacts across competing family goals
            </p>
          </div>
        </div>

        {isScenarioApplied && (
          <StatusBadge status="success" label="Scenario Active" icon={<CheckCircle2 className="w-3 h-3" />} />
        )}
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
            Select Goal to Prioritize:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'education', label: '🎓 Education' },
              { id: 'emergency', label: '🛡️ Emergency' },
              { id: 'vacation', label: '✈️ Vacation' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGoal(g.id as any);
                  setIsScenarioApplied(false);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all text-center truncate ${
                  selectedGoal === g.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Contribution Delta:
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              +₹{extraContribution.toLocaleString('en-IN')}/mo
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={extraContribution}
            onChange={(e) => {
              setExtraContribution(Number(e.target.value));
              setIsScenarioApplied(false);
            }}
            className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>+₹500</span>
            <span>+₹5,000</span>
            <span>+₹10,000</span>
          </div>
        </div>
      </div>

      {/* Ripple Results Waterfall */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Simulated Capital Ripple Outcomes:
        </span>

        {/* Primary Benefit Card */}
        <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{simulation.primaryGoal.name}</span>
              <p className="text-[11px] text-emerald-400">
                Target reached {simulation.primaryGoal.monthsAccelerated} months earlier ({simulation.primaryGoal.completionDate})
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
            +₹{simulation.primaryGoal.deltaMonthly.toLocaleString('en-IN')}/mo
          </span>
        </div>

        {/* Trade-off Impact Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {simulation.impactedGoals.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">{item.name}</span>
              <span
                className={`text-[11px] font-mono font-medium ${
                  item.type === 'warning' ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {item.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
        <button
          onClick={handleApply}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
            isScenarioApplied
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isScenarioApplied ? 'Scenario Applied' : 'Apply Scenario'}</span>
        </button>
      </div>
    </FinFamCard>
  );
};
