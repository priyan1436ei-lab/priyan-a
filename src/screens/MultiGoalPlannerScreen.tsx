import React, { useState } from 'react';
import { Target, Layers, Sliders, Sparkles, Plus } from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { MultiGoalSummary } from '../components/goalPlanning/MultiGoalSummary';
import { GoalFeasibilityCard } from '../components/goalPlanning/GoalFeasibilityCard';
import { GoalConflictAlert } from '../components/goalPlanning/GoalConflictAlert';
import { GoalTimeline } from '../components/goalPlanning/GoalTimeline';
import { GoalItem } from '../types';

interface MultiGoalPlannerScreenProps {
  onOpenAddGoal: () => void;
  onSelectGoalForTopUp: (goal: GoalItem) => void;
  onNavigateToConflictMap: () => void;
  onNavigateToWhatIfLab: () => void;
  onNavigateToResolutionLab: () => void;
}

export const MultiGoalPlannerScreen: React.FC<MultiGoalPlannerScreenProps> = ({
  onOpenAddGoal,
  onSelectGoalForTopUp,
  onNavigateToConflictMap,
  onNavigateToWhatIfLab,
  onNavigateToResolutionLab
}) => {
  const {
    goals,
    goalFeasibilities,
    goalConflicts,
    goalPortfolioSummary,
    loadHackathonDemoData,
    deleteGoal
  } = useFinFam();

  return (
    <div className="space-[#050816] space-y-8 pb-24">
      {/* 1. Household Portfolio Summary & Feasibility Score */}
      <MultiGoalSummary
        summary={goalPortfolioSummary}
        onLoadDemoData={loadHackathonDemoData}
        onNavigateToConflictMap={onNavigateToConflictMap}
        onNavigateToResolutionLab={onNavigateToResolutionLab}
      />

      {/* 2. Global Conflict Alert Banner */}
      <GoalConflictAlert
        conflicts={goalConflicts}
        monthlyShortfall={goalPortfolioSummary.monthlyShortfall}
        onNavigateToConflictMap={onNavigateToConflictMap}
        onNavigateToResolutionLab={onNavigateToResolutionLab}
      />

      {/* 3. Navigation Shortcut Cards (Conflict Map, What-If Lab, Resolution Lab) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onNavigateToConflictMap}
          className="p-5 rounded-2xl bg-[#0E1528] border border-cyan-500/30 hover:border-cyan-400 text-left transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Cross-Goal Matrix</span>
          </div>
          <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
            Conflict Heatmap & Interference Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Inspect N×N pairwise resource squeeze between concurrent goals
          </p>
        </button>

        <button
          onClick={onNavigateToWhatIfLab}
          className="p-5 rounded-2xl bg-[#0E1528] border border-purple-500/30 hover:border-purple-400 text-left transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Sliders className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">Ripple Engine</span>
          </div>
          <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition-colors">
            What-If Scenario Lab & Simulator
          </h3>
          <p className="text-xs text-slate-400">
            Test deadline shifts, income changes & new EMIs with causal ripple steps
          </p>
        </button>

        <button
          onClick={onNavigateToResolutionLab}
          className="p-5 rounded-2xl bg-[#0E1528] border border-amber-500/30 hover:border-amber-400 text-left transition-all space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">5 Strategies</span>
          </div>
          <h3 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
            Conflict Resolution Lab
          </h3>
          <p className="text-xs text-slate-400">
            Apply deterministic allocation scenarios to balance your household plan
          </p>
        </button>
      </div>

      {/* 4. Active Goals Feasibility Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              Active Goals Feasibility & Requirement Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic calculations evaluating required SIPs, funding gaps, and inflation adjustments
            </p>
          </div>

          <button
            onClick={onOpenAddGoal}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const feas = goalFeasibilities.find((f) => f.goalId === goal.id) || {
              goalId: goal.id,
              goalName: goal.name,
              targetAmount: goal.targetAmount,
              currentAmount: goal.currentAmount,
              remainingAmount: goal.targetAmount - goal.currentAmount,
              monthsRemaining: 12,
              expectedAnnualReturn: goal.expectedAnnualReturn || 8,
              inflationRate: goal.inflationRate || 6,
              inflationAdjustedTarget: goal.targetAmount,
              requiredMonthlyContribution: goal.monthlyContribution,
              currentMonthlyContribution: goal.monthlyContribution,
              fundingGap: 0,
              projectedCompletionDate: goal.targetDate,
              projectedDelayMonths: 0,
              feasibilityScore: 100,
              status: 'ON_TRACK' as const,
              isFeasibleWithCurrentCapacity: true,
              isFeasibleWithTotalCapacity: true
            };

            return (
              <GoalFeasibilityCard
                key={goal.id}
                goal={goal}
                feasibility={feas}
                onDeleteGoal={deleteGoal}
                onTopUpGoal={onSelectGoalForTopUp}
              />
            );
          })}
        </div>
      </div>

      {/* 5. Multi-Goal Milestone Timeline */}
      <GoalTimeline goals={goals} />
    </div>
  );
};
