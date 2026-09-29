import React from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';
import { GoalItem, GoalFeasibilityResult } from '../../types/goalPlanning';
import { FinancialEngine } from '../../lib/financialEngine';

interface GoalFeasibilityCardProps {
  goal: GoalItem;
  feasibility: GoalFeasibilityResult;
  onEditGoal?: (goal: GoalItem) => void;
  onDeleteGoal?: (goalId: number) => void;
  onTopUpGoal?: (goal: GoalItem) => void;
}

export const GoalFeasibilityCard: React.FC<GoalFeasibilityCardProps> = ({
  goal,
  feasibility,
  onEditGoal,
  onDeleteGoal,
  onTopUpGoal
}) => {
  const pctSaved = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'ON_TRACK':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'AT_RISK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CONFLICTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'UNACHIEVABLE':
        return 'bg-rose-950 text-rose-400 border-rose-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-5 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-xl">
      <div>
        {/* Top Header: Emoji, Title, Category, Priority & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-white/5">{goal.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">{goal.name}</h3>
                {goal.hardDeadline && (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30" title="Hard Rigid Deadline">
                    HARD DEADLINE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span>{goal.category}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">Target: {goal.targetDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEditGoal && (
              <button
                onClick={() => onEditGoal(goal)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Edit Goal Configuration"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDeleteGoal && (
              <button
                onClick={() => onDeleteGoal(goal.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Priority & Status Badges */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPriorityBadgeClass(goal.priority)}`}>
              {goal.priority} PRIORITY
            </span>
            {goal.familyMemberOwner && (
              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                👤 {goal.familyMemberOwner}
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase border flex items-center gap-1 ${getStatusBadgeClass(feasibility.status)}`}>
            {feasibility.status === 'ON_TRACK' && <CheckCircle2 className="w-3 h-3" />}
            {feasibility.status === 'AT_RISK' && <AlertTriangle className="w-3 h-3 text-amber-300" />}
            {feasibility.status === 'CONFLICTED' && <AlertTriangle className="w-3 h-3 text-rose-300" />}
            {feasibility.status}
          </span>
        </div>

        {/* Saved Progress Bar */}
        <div className="space-y-1.5 mt-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">
              {FinancialEngine.formatINR(goal.currentAmount)} ({pctSaved}%)
            </span>
            <span className="text-slate-400">
              Target: {FinancialEngine.formatINR(goal.targetAmount)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pctSaved >= 100
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500'
              }`}
              style={{ width: `${pctSaved}%` }}
            />
          </div>
        </div>

        {/* Required SIP vs Current Planned Contribution */}
        <div className="grid grid-cols-2 gap-3 mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-sans">Required Monthly</span>
            <span className="text-cyan-300 font-bold text-sm">
              {FinancialEngine.formatINR(feasibility.requiredMonthlyContribution)}/mo
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block uppercase font-sans">Current Planned</span>
            <span className={`font-bold text-sm ${
              feasibility.currentMonthlyContribution >= feasibility.requiredMonthlyContribution
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}>
              {FinancialEngine.formatINR(feasibility.currentMonthlyContribution)}/mo
            </span>
          </div>
        </div>

        {/* Funding Shortfall & Projection Warning */}
        {feasibility.fundingGap > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Shortfall: {FinancialEngine.formatINR(feasibility.fundingGap)}/mo</span>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                At current planned SIP, target completion will be delayed by{' '}
                <span className="font-bold text-rose-200">{feasibility.projectedDelayMonths} months</span> (Est.{' '}
                {feasibility.projectedCompletionDate}).
              </p>
            </div>
          </div>
        )}

        {/* Return & Inflation Assumptions */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            {goal.expectedAnnualReturn ?? 0}% Return Rate
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            {goal.inflationRate ?? 0}% Inflation Adjusted
          </span>
        </div>
      </div>

      {/* Action Footer */}
      {onTopUpGoal && (
        <button
          onClick={() => onTopUpGoal(goal)}
          className="w-full py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-extrabold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 mt-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Top Up Savings
        </button>
      )}
    </div>
  );
};
