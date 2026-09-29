import React, { useState } from 'react';
import {
  Sliders,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  AlternativeEvaluation,
  DecisionCriterion,
  DecisionConstraint,
  DecisionAlternative,
  SensitivityAnalysisResult
} from '../types/decisionOptimizer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';
import { DecisionOptimizerEngine } from '../lib/decision';

interface SensitivityAnalysisScreenProps {
  scenarioTitle: string;
  initialCriteria: DecisionCriterion[];
  constraints: DecisionConstraint[];
  alternatives: DecisionAlternative[];
  sensitivityResults: SensitivityAnalysisResult[];
  onBackToResults: () => void;
}

export const SensitivityAnalysisScreen: React.FC<SensitivityAnalysisScreenProps> = ({
  scenarioTitle,
  initialCriteria,
  constraints,
  alternatives,
  sensitivityResults,
  onBackToResults
}) => {
  // Active criterion chosen for graph inspection
  const [selectedCriterionKey, setSelectedCriterionKey] = useState<string>(
    initialCriteria[0]?.key || 'RETURN_ROI'
  );

  // Interactive local criteria weights for real-time perturbation
  const [liveCriteria, setLiveCriteria] = useState<DecisionCriterion[]>(initialCriteria);

  // Re-run dynamic optimization on perturbed weights
  const dynamicEvaluations = DecisionOptimizerEngine.optimize(
    alternatives,
    liveCriteria,
    constraints
  );
  const currentLeader = dynamicEvaluations[0];

  // Find sensitivity info for selected criterion
  const activeSens = sensitivityResults.find((s) => s.criterionKey === selectedCriterionKey);

  // Format line chart data across 0% to 70% weight sweep for the active criterion
  const curveData = activeSens
    ? activeSens.curve.map((curvePoint) => {
        const row: Record<string, any> = {
          weightPercent: `${Math.round(curvePoint.weight * 100)}%`
        };
        curvePoint.rankings.forEach((r) => {
          row[r.title] = r.score;
        });
        return row;
      })
    : [];

  const handleLiveWeightChange = (key: string, newWeight: number) => {
    setLiveCriteria((prev) => {
      const updated = prev.map((c) => (c.key === key ? { ...c, weight: newWeight } : c));
      const total = updated.reduce((acc, c) => acc + c.weight, 0);
      return updated.map((c) => ({
        ...c,
        weight: Math.round((c.weight / total) * 100) / 100
      }));
    });
  };

  const handleResetWeights = () => {
    setLiveCriteria(initialCriteria);
  };

  const colors = ['#06B6D4', '#3B82F6', '#EC4899', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <button
          onClick={onBackToResults}
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decision Results</span>
        </button>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Robustness & Sensitivity
        </span>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          Parameter Sensitivity & Stability
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Evaluate how robust the winning alternative is against subjective shifts in priority weights. Identifies critical flip-points where another option overtakes the lead.
        </p>
      </div>

      {/* SUMMARY FLIP POINT ALERT CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Identified Flip Points Across All Criteria
          </h3>
          <span className="text-[11px] text-slate-400">
            {sensitivityResults.filter((s) => s.flipPoints && s.flipPoints.length > 0).length} criteria can alter the winner
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sensitivityResults.map((s) => {
            const hasFlip = s.flipPoints && s.flipPoints.length > 0;
            const firstFlip = hasFlip ? s.flipPoints[0] : null;
            const isSelected = selectedCriterionKey === s.criterionKey;

            return (
              <div
                key={s.criterionKey}
                onClick={() => setSelectedCriterionKey(s.criterionKey)}
                className={`p-4 rounded-xl cursor-pointer transition-all border text-left ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40 shadow-lg'
                    : 'bg-[#0E1528] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">{s.criterionName}</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Base: {Math.round(s.baseWeight * 100)}%
                  </span>
                </div>

                {firstFlip ? (
                  <div className="space-y-1">
                    <div className="text-xs text-amber-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>
                        Flips at <strong>{Math.round(firstFlip.thresholdWeight * 100)}% weight</strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Overtaken by:{' '}
                      <strong className="text-slate-200">{firstFlip.competitorTitle}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Robust across all weight spectrums</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SENSITIVITY CURVE GRAPH */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Sensitivity Trajectory Curve: {activeSens?.criterionName}
            </h3>
            <p className="text-[11px] text-slate-400">
              Shows alternative score trajectories as {activeSens?.criterionName} weight scales from 0% to 70%.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {initialCriteria.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCriterionKey(c.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCriterionKey === c.key
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {c.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="weightPercent" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[30, 95]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050816',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {alternatives.map((alt, i) => (
                <Line
                  key={alt.id}
                  type="monotone"
                  dataKey={alt.title}
                  stroke={colors[i % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LIVE INTERACTIVE WEIGHT PERTURBER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0E1528] to-[#121A33] border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Live Dynamic Weight Perturber
            </h3>
            <p className="text-[11px] text-slate-400">
              Drag weights in real-time to test &quot;what-if&quot; scenarios and observe live ranking swaps.
            </p>
          </div>

          <button
            onClick={handleResetWeights}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Dynamic Leader Status Banner */}
        {currentLeader && (
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-300">
                Active #1 Leader with Current Sliders:
              </span>
              <strong className="text-xs text-white font-bold">
                {currentLeader.alternative.title}
              </strong>
            </div>

            <span className="font-mono font-bold text-cyan-400 text-sm">
              {currentLeader.finalScore}/100 pts
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {liveCriteria.map((c) => {
            const pct = Math.round(c.weight * 100);
            return (
              <div key={c.key} className="p-3 rounded-xl bg-[#050816] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{c.name}</span>
                  <span className="font-mono font-bold text-cyan-400">{pct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={pct}
                  onChange={(e) => handleLiveWeightChange(c.key, Number(e.target.value) / 100)}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
