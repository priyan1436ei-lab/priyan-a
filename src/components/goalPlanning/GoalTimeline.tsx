import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GoalItem } from '../../types/goalPlanning';
import { GoalFeasibilityEngine } from '../../lib/goalPlanning/goalFeasibilityEngine';
import { FinancialEngine } from '../../lib/financialEngine';

interface GoalTimelineProps {
  goals: GoalItem[];
}

export const GoalTimeline: React.FC<GoalTimelineProps> = ({ goals }) => {
  const activeGoals = goals.filter((g) => g.status !== 'COMPLETED');
  const feasibilities = activeGoals.map((g) => GoalFeasibilityEngine.evaluateGoalFeasibility(g));

  const maxMonths = Math.max(...feasibilities.map((f) => f.monthsRemaining), 36);

  return (
    <div className="rounded-3xl bg-[#0E1528] border border-white/10 p-5 sm:p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Multi-Goal Timeline & Milestone Roadmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual milestone dates and active monthly funding overlap zones
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activeGoals.map((g) => {
          const feas = feasibilities.find((f) => f.goalId === g.id);
          const months = feas ? feas.monthsRemaining : 12;
          const pctWidth = Math.min(100, Math.max(15, Math.round((months / maxMonths) * 100)));

          return (
            <div key={g.id} className="space-y-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{g.emoji}</span>
                  <span className="font-extrabold text-white">{g.name}</span>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {g.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-300">Deadline: {g.targetDate}</span>
                  <span className="text-cyan-400 font-bold">({months} mos)</span>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    g.priority === 'CRITICAL'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                      : g.priority === 'HIGH'
                      ? 'bg-gradient-to-r from-amber-500 to-cyan-400'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>Start: Current</span>
                <span>Required: {FinancialEngine.formatINR(feas?.requiredMonthlyContribution || g.monthlyContribution)}/mo</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
