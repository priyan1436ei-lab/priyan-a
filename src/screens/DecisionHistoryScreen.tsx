import React, { useState } from 'react';
import {
  History,
  ArrowLeft,
  Calendar,
  DollarSign,
  Trophy,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Filter,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { DecisionHistoryRecord } from '../types/decisionOptimizer';
import { FinancialEngine } from '../lib/financialEngine';

interface DecisionHistoryScreenProps {
  historyRecords: DecisionHistoryRecord[];
  onLoadRecord: (record: DecisionHistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateStatus: (id: string, status: 'IMPLEMENTED' | 'DISMISSED' | 'PENDING') => void;
  onBackToOptimizer: () => void;
}

export const DecisionHistoryScreen: React.FC<DecisionHistoryScreenProps> = ({
  historyRecords,
  onLoadRecord,
  onDeleteRecord,
  onUpdateStatus,
  onBackToOptimizer
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredRecords = historyRecords.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.implementationStatus === filterStatus;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          onClick={onBackToOptimizer}
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decision Optimizer</span>
        </button>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Decision Audit Trail
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            Decision Vault History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Permanent record of optimized financial scenarios, chosen allocations, and execution status.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-[#0E1528] p-1 rounded-xl border border-white/10">
          {['ALL', 'PENDING', 'IMPLEMENTED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500 text-[#050816] font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0E1528] border border-white/10 space-y-3">
          <Scale className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Decision Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Run an optimization scenario and click &quot;Save to Vault&quot; to preserve your trade-off analysis.
          </p>
          <button
            onClick={onBackToOptimizer}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold transition-all shadow-md"
          >
            Launch Decision Optimizer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const statusColor =
              record.implementationStatus === 'IMPLEMENTED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : record.implementationStatus === 'DISMISSED'
                ? 'bg-slate-700/50 text-slate-400 border-white/10'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-[#0E1528] border border-white/10 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${statusColor}`}>
                        {record.implementationStatus}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(record.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {record.scenarioTitle}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadRecord(record)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View & Re-simulate
                    </button>
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div className="p-2 rounded-lg bg-[#050816]">
                    <span className="text-[10px] text-slate-400">Winning Selection</span>
                    <div className="font-bold text-emerald-300 truncate">
                      {record.winningAlternativeTitle}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#050816]">
                    <span className="text-[10px] text-slate-400">Capital Allocated</span>
                    <div className="font-mono font-bold text-white">
                      {FinancialEngine.formatINR(record.capitalAmount)}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#050816]">
                    <span className="text-[10px] text-slate-400">Winning WSM Score</span>
                    <div className="font-mono font-bold text-cyan-400">
                      {record.winningScore}/100
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#050816]">
                    <span className="text-[10px] text-slate-400">Confidence Index</span>
                    <div className="font-semibold text-slate-200">
                      {record.confidenceTier} ({record.confidenceScore}%)
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-400">Change Status:</span>
                  <div className="flex items-center gap-1.5">
                    {record.implementationStatus !== 'IMPLEMENTED' && (
                      <button
                        onClick={() => onUpdateStatus(record.id, 'IMPLEMENTED')}
                        className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20"
                      >
                        Mark Implemented
                      </button>
                    )}
                    {record.implementationStatus !== 'DISMISSED' && (
                      <button
                        onClick={() => onUpdateStatus(record.id, 'DISMISSED')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-semibold"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
