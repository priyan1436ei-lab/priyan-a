import React, { useState } from 'react';
import { Layers, AlertTriangle, CheckCircle2, X, Info, HelpCircle } from 'lucide-react';
import { GoalItem, GoalInterferenceMatrixData, GoalInterferenceCell } from '../../types/goalPlanning';
import { GoalInterferenceEngine } from '../../lib/goalPlanning/goalInterferenceEngine';
import { FinancialEngine } from '../../lib/financialEngine';

interface GoalInterferenceMatrixProps {
  goals: GoalItem[];
  availableCapacity: number;
}

export const GoalInterferenceMatrix: React.FC<GoalInterferenceMatrixProps> = ({
  goals,
  availableCapacity
}) => {
  const matrixData: GoalInterferenceMatrixData = GoalInterferenceEngine.generateMatrix(goals, availableCapacity);
  const [selectedCell, setSelectedCell] = useState<GoalInterferenceCell | null>(null);

  const activeGoals = matrixData.goals;

  const getCellColor = (cell: GoalInterferenceCell) => {
    if (cell.goalAId === cell.goalBId) return 'bg-slate-900 border-slate-800 text-slate-600';
    switch (cell.conflictLevel) {
      case 'CRITICAL':
        return 'bg-rose-950/90 hover:bg-rose-900 text-rose-300 border-rose-600/60 font-bold shadow-lg shadow-rose-950/50';
      case 'HIGH':
        return 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border-rose-500/40 font-semibold';
      case 'MEDIUM':
        return 'bg-amber-950/60 hover:bg-amber-900 text-amber-200 border-amber-500/40';
      case 'LOW':
        return 'bg-cyan-950/50 hover:bg-cyan-900 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Cross-Goal Interference Heatmap Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate how funding one goal squeezes capacity for other concurrent household goals
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
          </span>
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Low/None
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-4 overflow-x-auto shadow-2xl">
        <div className="min-w-[600px]">
          {/* Column Headers */}
          <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-2">
            <div className="text-xs font-bold text-slate-500 p-2 uppercase tracking-wider">Goal \ Goal</div>
            {activeGoals.map((g) => (
              <div key={g.id} className="text-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-lg block">{g.emoji}</span>
                <span className="text-[11px] font-bold text-slate-200 truncate block mt-0.5 max-w-[90px] mx-auto">
                  {g.name}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrixData.matrix.map((row, rIdx) => {
            const rowGoal = activeGoals[rIdx];
            return (
              <div key={rowGoal.id} className="grid grid-cols-[140px_repeat(auto-fit,minmax(100px,1fr))] gap-2 mb-2 items-center">
                {/* Row Header */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <span className="text-lg">{rowGoal.emoji}</span>
                  <span className="text-[11px] font-bold text-slate-200 truncate max-w-[90px]">
                    {rowGoal.name}
                  </span>
                </div>

                {/* Cells */}
                {row.map((cell, cIdx) => {
                  const isSelf = cell.goalAId === cell.goalBId;
                  return (
                    <button
                      key={cIdx}
                      onClick={() => !isSelf && setSelectedCell(cell)}
                      disabled={isSelf}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[70px] ${getCellColor(cell)} ${
                        !isSelf ? 'cursor-pointer active:scale-95' : 'cursor-default opacity-40'
                      }`}
                    >
                      {isSelf ? (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      ) : (
                        <>
                          <span className="text-xs font-black tracking-tight">{cell.conflictLevel}</span>
                          {cell.monthlyImpact > 0 && (
                            <span className="text-[10px] font-mono mt-1 opacity-90">
                              -{FinancialEngine.formatINR(cell.monthlyImpact)}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Cell Inspector Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E1528] border border-cyan-500/40 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedCell(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  Cross-Goal Inspection
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">
                  {selectedCell.goalAName} ⚡ {selectedCell.goalBName}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Interference Level:</span>
                  <span className={`font-black text-xs px-2 py-0.5 rounded border ${
                    selectedCell.conflictLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {selectedCell.conflictLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">Monthly Resource Squeeze:</span>
                  <span className="text-rose-400 font-bold">
                    {FinancialEngine.formatINR(selectedCell.monthlyImpact)} / mo
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">Timeline Overlap Window:</span>
                  <span className="text-cyan-300 font-bold">{selectedCell.timelineOverlapMonths} Months</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400" /> Root Cause Analysis
                </h4>
                <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  {selectedCell.reason}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Recommended Resolution Option
                </h4>
                <p className="text-emerald-300/90 leading-relaxed bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
                  {selectedCell.possibleResolution}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
