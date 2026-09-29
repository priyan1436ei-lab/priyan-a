import React from 'react';
import { ArrowDown, Zap, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { RippleSimulationResult } from '../../types/goalPlanning';
import { FinancialEngine } from '../../lib/financialEngine';

interface RippleChainProps {
  simulation: RippleSimulationResult;
  onResetSimulation?: () => void;
}

export const RippleChain: React.FC<RippleChainProps> = ({
  simulation,
  onResetSimulation
}) => {
  return (
    <div className="rounded-3xl bg-[#0E1528] border border-white/10 p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 uppercase">
              RIPPLE SIMULATOR
            </span>
            <span className="text-xs text-slate-400">FinFam Causal Ripple Engine</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            Parameter Cascade: {simulation.parameterChangedName}
          </h2>
        </div>

        {onResetSimulation && (
          <button
            onClick={onResetSimulation}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Parameters
          </button>
        )}
      </div>

      {/* Before vs After Metric Comparison Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Monthly Capacity</span>
          <div className="flex justify-between font-mono font-bold">
            <span className="text-slate-300">Before: {FinancialEngine.formatINR(simulation.before.availableCapacity)}</span>
            <span className="text-cyan-400">After: {FinancialEngine.formatINR(simulation.after.availableCapacity)}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] block uppercase">Total Goal Required</span>
          <div className="flex justify-between font-mono font-bold">
            <span className="text-slate-300">Before: {FinancialEngine.formatINR(simulation.before.totalRequiredContribution)}</span>
            <span className="text-purple-300">After: {FinancialEngine.formatINR(simulation.after.totalRequiredContribution)}</span>
          </div>
        </div>

        <div className={`p-3 rounded-2xl border space-y-1 ${
          simulation.after.shortfall > 0 ? 'bg-rose-950/30 border-rose-500/30' : 'bg-emerald-950/30 border-emerald-500/30'
        }`}>
          <span className="text-slate-400 text-[10px] block uppercase">Monthly Shortfall</span>
          <div className="flex justify-between font-mono font-bold">
            <span className="text-slate-300">Before: {FinancialEngine.formatINR(simulation.before.shortfall)}</span>
            <span className={simulation.after.shortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}>
              After: {FinancialEngine.formatINR(simulation.after.shortfall)}
            </span>
          </div>
        </div>
      </div>

      {/* Causal Ripple Chain Node Flow */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400 animate-pulse" /> Step-By-Step Causal Ripple Chain
        </h3>

        <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-purple-500/30">
          {simulation.causalChain.map((step) => {
            const isWarning = step.severity === 'WARNING' || step.severity === 'CRITICAL';
            const isSuccess = step.severity === 'SUCCESS';

            return (
              <div
                key={step.stepNumber}
                className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-purple-500/40 transition-all shadow-md"
              >
                {/* Step Node Dot */}
                <div className={`absolute -left-[33px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0E1528] ${
                  isWarning ? 'bg-rose-500' : isSuccess ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}>
                  {step.stepNumber}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                    {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {step.title}
                  </h4>
                  {step.metricChanged && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-white/5">
                      {step.metricChanged}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>

                {step.fromValue && step.toValue && (
                  <div className="flex items-center gap-2 text-[11px] font-mono pt-1 text-slate-400">
                    <span className="line-through">{step.fromValue}</span>
                    <span>→</span>
                    <span className="font-bold text-cyan-300">{step.toValue}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
