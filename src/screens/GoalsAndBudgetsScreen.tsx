import React from 'react';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  PieChart,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import { GoalItem } from '../types';
import { FinFamCard, CurrencyText, StatusBadge } from '../components/ui/FinFamDesignSystem';

interface GoalsAndBudgetsScreenProps {
  onOpenAddGoal: () => void;
  onOpenAddBudget: () => void;
  onSelectGoalForTopUp: (goal: GoalItem) => void;
}

export const GoalsAndBudgetsScreen: React.FC<GoalsAndBudgetsScreenProps> = ({
  onOpenAddGoal,
  onOpenAddBudget,
  onSelectGoalForTopUp
}) => {
  const { goals, budgets, deleteGoal, deleteBudget } = useFinFam();

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto animate-fade-in text-slate-100">
      {/* 1. Goals Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Family Goals & Milestones
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Multi-Horizon Family Savings Milestones & AI Goal Recommendations
            </p>
          </div>

          <button
            onClick={onOpenAddGoal}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5 self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isDone = pct >= 100;

            return (
              <FinFamCard
                key={goal.id}
                variant="default"
                className="flex flex-col justify-between space-y-4 border-slate-800 hover:border-cyan-500/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
                      {goal.emoji || '🎯'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                        {pct}%
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3 truncate">{goal.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span>Target: {goal.targetDate}</span>
                    <span>•</span>
                    <span className="text-purple-400 font-semibold">{goal.category}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mt-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs font-mono mt-2">
                    <span className="text-white font-bold">
                      {FinancialEngine.formatINR(goal.currentAmount)}
                    </span>
                    <span className="text-slate-400">
                      Goal: {FinancialEngine.formatINR(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <button
                    onClick={() => onSelectGoalForTopUp(goal)}
                    className="w-full py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all active:scale-95 shadow-sm"
                  >
                    + Add Money
                  </button>
                </div>
              </FinFamCard>
            );
          })}
        </div>
      </div>

      {/* 2. Category Budgets Section */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Category Spending Caps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Automated Household Spending Limits & Real-Time Alert Triggers
            </p>
          </div>

          <button
            onClick={onOpenAddBudget}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Category Cap
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(Math.round((b.spent / b.monthlyLimit) * 100), 100);
            const remaining = Math.max(b.monthlyLimit - b.spent, 0);
            const isDanger = pct >= 90;
            const isWarning = pct >= 80 && pct < 90;

            return (
              <FinFamCard
                key={b.id}
                variant="default"
                className="space-y-3 border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{b.category}</span>
                    {isDanger && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded-full font-bold border border-rose-500/30">
                        OVER CAP
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between items-end text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Spent</span>
                    <span className="text-white font-bold">{FinancialEngine.formatINR(b.spent)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-[10px] block">Limit</span>
                    <span className="text-slate-300">{FinancialEngine.formatINR(b.monthlyLimit)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Left</span>
                    <span
                      className={`font-bold ${
                        isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {FinancialEngine.formatINR(remaining)}
                    </span>
                  </div>
                </div>
              </FinFamCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
