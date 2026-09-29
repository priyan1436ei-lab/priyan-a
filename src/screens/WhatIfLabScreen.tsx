import React from 'react';
import { Sliders, ArrowLeft } from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { WhatIfScenarioLab } from '../components/goalPlanning/WhatIfScenarioLab';

interface WhatIfLabScreenProps {
  onBackToPlanner: () => void;
}

export const WhatIfLabScreen: React.FC<WhatIfLabScreenProps> = ({ onBackToPlanner }) => {
  const { goals, userProfile, emis, bills } = useFinFam();

  const totalActiveEMI = emis.reduce((sum, e) => sum + e.monthlyEmi, 0);
  const recurringBills = bills.filter((b) => b.isRecurring && !b.isPaid).reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Back button */}
      <button
        onClick={onBackToPlanner}
        className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goal Intelligence
      </button>

      {/* Simulator Lab */}
      <WhatIfScenarioLab
        goals={goals}
        monthlyIncome={userProfile.monthlyIncome}
        essentialExpenses={userProfile.monthlyExpenses}
        totalActiveEMI={totalActiveEMI}
        recurringBills={recurringBills}
      />
    </div>
  );
};
