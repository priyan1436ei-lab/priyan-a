import React, { useState } from 'react';
import { Sliders, RefreshCw, Zap, TrendingUp, AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import { GoalItem, WhatIfParams, RippleSimulationResult } from '../../types/goalPlanning';
import { RippleSimulationEngine } from '../../lib/goalPlanning/rippleSimulationEngine';
import { FinancialEngine } from '../../lib/financialEngine';
import { RippleChain } from './RippleChain';

interface WhatIfScenarioLabProps {
  goals: GoalItem[];
  monthlyIncome: number;
  essentialExpenses: number;
  totalActiveEMI: number;
  recurringBills: number;
  emergencyAllocation?: number;
}

export const WhatIfScenarioLab: React.FC<WhatIfScenarioLabProps> = ({
  goals,
  monthlyIncome,
  essentialExpenses,
  totalActiveEMI,
  recurringBills,
  emergencyAllocation = 0
}) => {
  const [whatIf, setWhatIf] = useState<WhatIfParams>({
    monthlyIncomeDelta: 0,
    monthlyExpenseDelta: 0,
    newEmiMonthly: 0,
    emergencyBufferMonthly: 0,
    goalModifications: {}
  });

  const [selectedGoalId, setSelectedGoalId] = useState<number>(goals[0]?.id || 101);
  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  const handleReset = () => {
    setWhatIf({
      monthlyIncomeDelta: 0,
      monthlyExpenseDelta: 0,
      newEmiMonthly: 0,
      emergencyBufferMonthly: 0,
      goalModifications: {}
    });
  };

  const simulation: RippleSimulationResult = RippleSimulationEngine.simulateRipple({
    goals,
    monthlyIncome,
    essentialExpenses,
    totalActiveEMI,
    recurringBills,
    emergencyAllocation,
    whatIf
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            What-If Scenario Lab & Multi-Goal Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how hypothetical income drops, new EMIs, or goal deadline shifts cascade through your financial plan
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Scenario
        </button>
      </div>

      {/* Control Panel & Live Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-5 space-y-5 shadow-xl">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Adjust Simulation Parameters
          </h3>

          {/* Slider 1: Income Delta */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">Monthly Income Change:</span>
              <span className={`font-mono font-bold ${
                whatIf.monthlyIncomeDelta > 0 ? 'text-emerald-400' : whatIf.monthlyIncomeDelta < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {whatIf.monthlyIncomeDelta >= 0 ? '+' : ''}{FinancialEngine.formatINR(whatIf.monthlyIncomeDelta)}
              </span>
            </div>
            <input
              type="range"
              min="-30000"
              max="30000"
              step="2000"
              value={whatIf.monthlyIncomeDelta}
              onChange={(e) => setWhatIf({ ...whatIf, monthlyIncomeDelta: parseInt(e.target.value, 10) })}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-₹30,000 (Pay Cut)</span>
              <span>₹0</span>
              <span>+₹30,000 (Hike)</span>
            </div>
          </div>

          {/* Slider 2: New EMI Obligation */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">New Active EMI Commitment:</span>
              <span className="font-mono font-bold text-amber-400">
                +{FinancialEngine.formatINR(whatIf.newEmiMonthly)}/mo
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="1000"
              value={whatIf.newEmiMonthly}
              onChange={(e) => setWhatIf({ ...whatIf, newEmiMonthly: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹0</span>
              <span>+₹10,000</span>
              <span>+₹20,000 (New Car/Home Loan)</span>
            </div>
          </div>

          {/* Slider 3: Goal Specific Target Date Shift */}
          {selectedGoal && (
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Goal Target Deadline Shift:</span>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(parseInt(e.target.value, 10))}
                  className="bg-slate-900 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 px-2 py-1"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.emoji} {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    const mod = whatIf.goalModifications[selectedGoalId] || {};
                    setWhatIf({
                      ...whatIf,
                      goalModifications: {
                        ...whatIf.goalModifications,
                        [selectedGoalId]: { ...mod, targetDate: 'Dec 2028' }
                      }
                    });
                  }}
                  className="p-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold border border-purple-500/30 text-left"
                >
                  Accelerate to Dec 2028 (-2 yrs)
                </button>
                <button
                  onClick={() => {
                    const mod = whatIf.goalModifications[selectedGoalId] || {};
                    setWhatIf({
                      ...whatIf,
                      goalModifications: {
                        ...whatIf.goalModifications,
                        [selectedGoalId]: { ...mod, targetDate: 'Dec 2032' }
                      }
                    });
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 text-left"
                >
                  Extend to Dec 2032 (+2 yrs)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Causal Chain Results Column */}
        <div>
          <RippleChain simulation={simulation} onResetSimulation={handleReset} />
        </div>
      </div>
    </div>
  );
};
