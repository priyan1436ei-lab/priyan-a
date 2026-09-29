import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Shield,
  Plus,
  Trash2,
  HelpCircle,
  TrendingUp,
  Brain,
  History,
  Scale,
  DollarSign
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import {
  DecisionCriterion,
  DecisionConstraint,
  DecisionAlternative,
  DecisionCriterionKey,
  PreferenceLearningResult
} from '../types/decisionOptimizer';
import {
  DEFAULT_DECISION_CRITERIA,
  SCENARIO_PRESETS,
  PreferenceLearningEngine,
  DecisionOptimizerEngine,
  TradeOffAnalyzer,
  SensitivityAnalysisEngine,
  DecisionConfidenceEngine
} from '../lib/decision';
import { FinancialEngine } from '../lib/financialEngine';

interface DecisionOptimizerScreenProps {
  onRunOptimization: (payload: {
    title: string;
    scenarioDilemma: string;
    capitalAmount: number;
    criteria: DecisionCriterion[];
    constraints: DecisionConstraint[];
    alternatives: DecisionAlternative[];
    evaluations: any[];
    tradeOffs: any[];
    sensitivityResults: any[];
    confidence: any;
  }) => void;
  onNavigateToHistory: () => void;
}

export const DecisionOptimizerScreen: React.FC<DecisionOptimizerScreenProps> = ({
  onRunOptimization,
  onNavigateToHistory
}) => {
  const { userProfile, financialHealth, emis } = useFinFam();

  // Scenario selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset_surplus_50k');
  const [scenarioTitle, setScenarioTitle] = useState<string>(SCENARIO_PRESETS[0].title);
  const [scenarioDilemma, setScenarioDilemma] = useState<string>(SCENARIO_PRESETS[0].dilemmaDescription);
  const [capitalAmount, setCapitalAmount] = useState<number>(SCENARIO_PRESETS[0].capitalAmount);

  // Active state
  const [criteria, setCriteria] = useState<DecisionCriterion[]>(DEFAULT_DECISION_CRITERIA);
  const [constraints, setConstraints] = useState<DecisionConstraint[]>(SCENARIO_PRESETS[0].constraints);
  const [alternatives, setAlternatives] = useState<DecisionAlternative[]>(SCENARIO_PRESETS[0].alternatives);

  // Preference learning suggestion state
  const [preferenceSuggestion, setPreferenceSuggestion] = useState<PreferenceLearningResult | null>(null);
  const [showLearningModal, setShowLearningModal] = useState<boolean>(false);

  // Custom alternative modal
  const [showAddAlternativeModal, setShowAddAlternativeModal] = useState<boolean>(false);
  const [newAltTitle, setNewAltTitle] = useState('');
  const [newAltDesc, setNewAltDesc] = useState('');
  const [newAltReturn, setNewAltReturn] = useState('10.5');
  const [newAltLiquidity, setNewAltLiquidity] = useState('7');
  const [newAltRisk, setNewAltRisk] = useState('4');

  // Handle preset change
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SCENARIO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setScenarioTitle(preset.title);
      setScenarioDilemma(preset.dilemmaDescription);
      setCapitalAmount(preset.capitalAmount);
      setCriteria(preset.criteria);
      setConstraints(preset.constraints);
      setAlternatives(preset.alternatives);
    }
  };

  // Run preference learning engine
  const handleInferPreferences = () => {
    const inferred = PreferenceLearningEngine.inferPreferenceWeights(
      userProfile,
      financialHealth,
      emis
    );
    setPreferenceSuggestion(inferred);
    setShowLearningModal(true);
  };

  const handleApplySuggestedWeights = () => {
    if (!preferenceSuggestion) return;
    setCriteria((prev) =>
      prev.map((c) => ({
        ...c,
        weight: preferenceSuggestion.suggestedWeights[c.key] ?? c.weight
      }))
    );
    setShowLearningModal(false);
  };

  // Adjust criteria weights with proportional normalization
  const handleWeightChange = (key: DecisionCriterionKey, newWeightRaw: number) => {
    const newWeight = Math.max(0.02, Math.min(0.70, newWeightRaw));
    setCriteria((prev) => {
      const updated = prev.map((c) => (c.key === key ? { ...c, weight: newWeight } : c));
      const total = updated.reduce((acc, c) => acc + c.weight, 0);
      return updated.map((c) => ({
        ...c,
        weight: Math.round((c.weight / total) * 100) / 100
      }));
    });
  };

  // Add custom alternative
  const handleCreateCustomAlternative = () => {
    if (!newAltTitle.trim()) return;
    const returnVal = parseFloat(newAltReturn) || 8.0;
    const liquidityVal = parseFloat(newAltLiquidity) || 5;
    const riskVal = parseFloat(newAltRisk) || 5;

    const newAlt: DecisionAlternative = {
      id: `alt_custom_${Date.now()}`,
      title: newAltTitle.trim(),
      category: 'CUSTOM',
      description: newAltDesc.trim() || 'Custom user-specified financial allocation path.',
      allocationAmount: capitalAmount,
      badge: 'Custom Scenario',
      iconName: 'Sparkles',
      rawCriteriaValues: {
        LIQUIDITY: liquidityVal,
        RETURN_ROI: returnVal,
        RISK_SAFETY: Math.max(1, 10 - riskVal),
        DEBT_REDUCTION: 3,
        TAX_EFFICIENCY: 15,
        TIMELINE_FLEXIBILITY: 6
      },
      constraintValues: {
        postLiquidityBuffer: userProfile.emergencyFund,
        riskScore: riskVal,
        lockInMonths: 12,
        expectedReturnRate: returnVal
      }
    };

    setAlternatives((prev) => [...prev, newAlt]);
    setNewAltTitle('');
    setNewAltDesc('');
    setShowAddAlternativeModal(false);
  };

  const handleRemoveAlternative = (id: string) => {
    if (alternatives.length <= 2) {
      return; // Keep at least 2 alternatives to compare
    }
    setAlternatives((prev) => prev.filter((a) => a.id !== id));
  };

  // Trigger full MCDA computation & navigate to results
  const handleExecuteOptimization = () => {
    const evaluations = DecisionOptimizerEngine.optimize(alternatives, criteria, constraints);
    const tradeOffs = TradeOffAnalyzer.generateAllTradeOffs(evaluations, criteria);
    const sensitivityResults = SensitivityAnalysisEngine.analyzeSensitivity(
      alternatives,
      criteria,
      constraints
    );
    const confidence = DecisionConfidenceEngine.calculateConfidence(
      evaluations,
      sensitivityResults
    );

    onRunOptimization({
      title: scenarioTitle,
      scenarioDilemma,
      capitalAmount,
      criteria,
      constraints,
      alternatives,
      evaluations,
      tradeOffs,
      sensitivityResults,
      confidence
    });
  };

  const totalWeightPercent = Math.round(criteria.reduce((sum, c) => sum + c.weight, 0) * 100);

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                AIML 04 Module
              </span>
              <span className="text-xs text-slate-400">Multi-Criteria Decision Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Scale className="w-6 h-6 text-cyan-400" />
              Intelligent Decision Optimizer
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Objective mathematical trade-off evaluation (Weighted Sum Model) filtering alternatives through household constraints, opportunity costs, and parameter sensitivity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-semibold transition-all shadow-sm"
              title="View past decisions"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>Vault History</span>
            </button>
            <button
              onClick={handleInferPreferences}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all shadow-sm"
              title="Infer criteria weights from financial health"
            >
              <Brain className="w-4 h-4 text-purple-300" />
              <span>Smart Weights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Scenario Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Select Dilemma Scenario
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SCENARIO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                    : 'bg-[#0E1528] border-white/10 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {preset.categoryTag}
                  </span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    {FinancialEngine.formatINR(preset.capitalAmount)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{preset.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.dilemmaDescription}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capital & Dilemma Configuration */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Decision Context / Goal</label>
            <input
              type="text"
              value={scenarioTitle}
              onChange={(e) => setScenarioTitle(e.target.value)}
              className="w-full bg-[#050816] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Allocation of ₹50,000 Surplus"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Capital at Stake (INR)
            </label>
            <input
              type="number"
              value={capitalAmount}
              onChange={(e) => setCapitalAmount(Math.max(1000, Number(e.target.value)))}
              className="w-full bg-[#050816] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
              placeholder="50000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Detailed Dilemma & Hypotheses</label>
          <textarea
            rows={2}
            value={scenarioDilemma}
            onChange={(e) => setScenarioDilemma(e.target.value)}
            className="w-full bg-[#050816] border border-white/10 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Alternatives Pool */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Financial Alternatives ({alternatives.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Contending allocation paths evaluated against constraints and criteria.
            </p>
          </div>

          <button
            onClick={() => setShowAddAlternativeModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Alternative</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alternatives.map((alt, idx) => (
            <div
              key={alt.id}
              className="p-4 rounded-xl bg-[#0E1528] border border-white/10 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">#{idx + 1}</span>
                      <h4 className="text-sm font-bold text-white tracking-tight">{alt.title}</h4>
                    </div>
                    {alt.badge && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-cyan-300 border border-white/10">
                        {alt.badge}
                      </span>
                    )}
                  </div>

                  {alternatives.length > 2 && (
                    <button
                      onClick={() => handleRemoveAlternative(alt.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{alt.description}</p>
              </div>

              <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-[#050816]/70">
                  <div className="text-[10px] text-slate-400">Return</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {alt.rawCriteriaValues.RETURN_ROI}%
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-[#050816]/70">
                  <div className="text-[10px] text-slate-400">Liquidity</div>
                  <div className="font-mono font-bold text-cyan-400">
                    {alt.rawCriteriaValues.LIQUIDITY}/10
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-[#050816]/70">
                  <div className="text-[10px] text-slate-400">Risk Score</div>
                  <div className="font-mono font-bold text-amber-400">
                    {alt.constraintValues.riskScore ?? 5}/10
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints Filter Layer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Pre-Scoring Constraints Filtering Layer</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Hard constraints disqualify alternatives; Soft constraints apply penalty discounts.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {constraints.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-[#050816] border border-white/10 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      c.type === 'HARD'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {c.type}
                  </span>
                  <span className="font-semibold text-slate-200">{c.name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{c.description}</p>
              </div>

              <div className="text-right whitespace-nowrap font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-white/5">
                {c.operator} {c.metricKey === 'postLiquidityBuffer' ? `₹${c.targetValue.toLocaleString('en-IN')}` : `${c.targetValue} ${c.unit}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Weights Customizer (Weighted Sum Model) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Criteria Importance Weights (WSM)
            </h3>
            <p className="text-[11px] text-slate-400">
              Adjust how much weight each financial dimension carries in the MCDA algorithm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                totalWeightPercent === 100
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              Sum: {totalWeightPercent}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteria.map((c) => {
            const pct = Math.round(c.weight * 100);
            return (
              <div key={c.key} className="p-3 rounded-xl bg-[#050816] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{c.description}</p>
                  </div>
                  <span className="font-mono font-bold text-cyan-400 ml-2 text-sm">{pct}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={pct}
                    onChange={(e) => handleWeightChange(c.key, Number(e.target.value) / 100)}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating CTA to Run Optimizer */}
      <div className="fixed bottom-14 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#050816] via-[#050816]/95 to-transparent backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block text-xs text-slate-300">
            Comparing <span className="font-bold text-white">{alternatives.length} options</span> across{' '}
            <span className="font-bold text-white">{criteria.length} criteria</span> &{' '}
            <span className="font-bold text-white">{constraints.length} constraints</span>
          </div>

          <button
            onClick={handleExecuteOptimization}
            className="w-full sm:w-auto ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#050816] font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Run Decision Optimizer</span>
          </button>
        </div>
      </div>

      {/* Preference Learning Suggestion Modal */}
      {showLearningModal && preferenceSuggestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1528] border border-purple-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Preference Learning Inference</h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Rule-Based Bayesian Model
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Inferred Profile Archetype
              </span>
              <div className="text-sm font-bold text-white">{preferenceSuggestion.profileTitle}</div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Financial Rationale:</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {preferenceSuggestion.reasoning.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#050816] p-2.5 rounded-lg border border-white/5">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Suggested Optimal Weights:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {Object.entries(preferenceSuggestion.suggestedWeights).map(([k, w]) => (
                  <div key={k} className="p-2 rounded bg-[#050816] border border-white/5 flex justify-between">
                    <span className="text-slate-400 capitalize">{k.toLowerCase().replace('_', ' ')}</span>
                    <span className="font-bold text-cyan-400">{Math.round((w as number) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowLearningModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySuggestedWeights}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
              >
                Apply Suggested Weights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Alternative Modal */}
      {showAddAlternativeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1528] border border-cyan-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Add Custom Alternative
              </h3>
              <button onClick={() => setShowAddAlternativeModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Alternative Title</label>
                <input
                  type="text"
                  value={newAltTitle}
                  onChange={(e) => setNewAltTitle(e.target.value)}
                  placeholder="e.g. Sovereign Gold Bond (SGB)"
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={newAltDesc}
                  onChange={(e) => setNewAltDesc(e.target.value)}
                  placeholder="Strategic premise of this allocation option..."
                  className="w-full bg-[#050816] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Return CAGR %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAltReturn}
                    onChange={(e) => setNewAltReturn(e.target.value)}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Liquidity (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newAltLiquidity}
                    onChange={(e) => setNewAltLiquidity(e.target.value)}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Risk Level (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newAltRisk}
                    onChange={(e) => setNewAltRisk(e.target.value)}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowAddAlternativeModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomAlternative}
                disabled={!newAltTitle.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#050816] text-xs font-bold transition-all shadow-md"
              >
                Add to Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
