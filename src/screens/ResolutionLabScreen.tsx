import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { ResolutionLab } from '../components/goalPlanning/ResolutionLab';

interface ResolutionLabScreenProps {
  onBackToPlanner: () => void;
}

export const ResolutionLabScreen: React.FC<ResolutionLabScreenProps> = ({ onBackToPlanner }) => {
  const { goals, financialCapacity, applyResolutionScenario } = useFinFam();

  return (
    <div className="space-y-6 pb-24">
      <button
        onClick={onBackToPlanner}
        className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goal Intelligence
      </button>

      <ResolutionLab
        goals={goals}
        availableCapacity={financialCapacity.availableCapacity}
        onApplyScenario={applyResolutionScenario}
      />
    </div>
  );
};
