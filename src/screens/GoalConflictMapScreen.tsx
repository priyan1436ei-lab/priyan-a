import React from 'react';
import { Layers, ArrowLeft, Sparkles } from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { GoalInterferenceMatrix } from '../components/goalPlanning/GoalInterferenceMatrix';
import { GoalConflictAlert } from '../components/goalPlanning/GoalConflictAlert';

interface GoalConflictMapScreenProps {
  onBackToPlanner: () => void;
  onNavigateToResolutionLab: () => void;
}

export const GoalConflictMapScreen: React.FC<GoalConflictMapScreenProps> = ({
  onBackToPlanner,
  onNavigateToResolutionLab
}) => {
  const { goals, financialCapacity, goalConflicts, goalPortfolioSummary } = useFinFam();

  return (
    <div className="space-y-6 pb-24">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToPlanner}
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Goal Intelligence
        </button>

        <button
          onClick={onNavigateToResolutionLab}
          className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" /> Open Resolution Lab
        </button>
      </div>

      {/* Global Conflict Banner */}
      <GoalConflictAlert
        conflicts={goalConflicts}
        monthlyShortfall={goalPortfolioSummary.monthlyShortfall}
        onNavigateToResolutionLab={onNavigateToResolutionLab}
      />

      {/* N x N Goal Interference Heatmap Matrix */}
      <GoalInterferenceMatrix
        goals={goals}
        availableCapacity={financialCapacity.availableCapacity}
      />
    </div>
  );
};
