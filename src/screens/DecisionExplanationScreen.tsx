import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Bot,
  Sparkles,
  Scale,
  DollarSign,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import {
  AlternativeEvaluation,
  DecisionCriterion,
  PairwiseTradeOff
} from '../types/decisionOptimizer';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import { GeminiAiEngine } from '../lib/geminiAiEngine';

interface DecisionExplanationScreenProps {
  scenarioTitle: string;
  capitalAmount: number;
  evaluations: AlternativeEvaluation[];
  criteria: DecisionCriterion[];
  tradeOffs: PairwiseTradeOff[];
  onBackToResults: () => void;
}

export const DecisionExplanationScreen: React.FC<DecisionExplanationScreenProps> = ({
  scenarioTitle,
  capitalAmount,
  evaluations,
  criteria,
  tradeOffs,
  onBackToResults
}) => {
  const { userProfile } = useFinFam();
  const winner = evaluations[0];
  const runnerUp = evaluations[1];

  const [aiMemo, setAiMemo] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(true);
  const [selectedCompetitorIndex, setSelectedCompetitorIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const loadAiMemo = async () => {
      if (!winner || !runnerUp) return;
      setIsLoadingAi(true);
      try {
        const topTradeOff = tradeOffs[0]?.opportunityCostSummary || '';
        const memo = await GeminiAiEngine.generateDecisionInsights(
          winner.alternative.title,
          runnerUp.alternative.title,
          capitalAmount,
          userProfile,
          topTradeOff
        );
        if (isMounted) {
          setAiMemo(memo);
          setIsLoadingAi(false);
        }
      } catch (err) {
        if (isMounted) {
          setAiMemo(
            `AI Analysis: "${winner.alternative.title}" delivers optimal capital utility by balancing risk and cashflow.`
          );
          setIsLoadingAi(false);
        }
      }
    };

    loadAiMemo();
    return () => {
      isMounted = false;
    };
  }, [winner, runnerUp, capitalAmount, tradeOffs, userProfile]);

  if (!winner) {
    return (
      <div className="p-6 text-center text-slate-400">
        No evaluation data available.{' '}
        <button onClick={onBackToResults} className="text-cyan-400 underline ml-2">
          Return to results
        </button>
      </div>
    );
  }

  const activeTradeOff = tradeOffs[selectedCompetitorIndex] || tradeOffs[0];

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

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Explanation Layer
        </span>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          Why &quot;{winner.alternative.title}&quot; Won
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Deconstructing the mathematical scoring model, weighted contributions, and pairwise opportunity costs for {scenarioTitle}.
        </p>
      </div>

      {/* STEP 1: MATHEMATICAL CONTRIBUTION BREAKDOWN */}
      <div className="p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            Weighted Sum Contribution Matrix
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-400">
            Total: {winner.finalScore}/100 pts
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Each criterion contribution is calculated as:{' '}
          <span className="font-mono text-cyan-300">Normalized Score × Importance Weight</span>.
          Notice where the winner gathered its winning margin:
        </p>

        <div className="space-y-2.5 pt-1">
          {criteria.map((c) => {
            const raw = winner.alternative.rawCriteriaValues[c.key] ?? 0;
            const norm = winner.normalizedScores[c.key] ?? 0;
            const weightedPts = Math.round((winner.weightedContributions[c.key] ?? 0) * 100);
            const weightPct = Math.round(c.weight * 100);

            return (
              <div
                key={c.key}
                className="p-3 rounded-xl bg-[#050816] border border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({weightPct}% Weight)</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      Raw: <strong className="text-slate-200">{raw}{c.unit}</strong>
                    </span>
                    <span className="text-cyan-400 font-bold text-xs">
                      +{weightedPts} pts
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(norm * 100))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PAIRWISE TRADE-OFF ANALYSIS */}
      {activeTradeOff && (
        <div className="p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Pairwise Trade-Off Analyzer
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Comparing Rank #1 Winner against runner-up alternatives.
              </p>
            </div>

            {/* Competitor Selector Tabs */}
            {tradeOffs.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {tradeOffs.map((t, idx) => (
                  <button
                    key={t.competitorId}
                    onClick={() => setSelectedCompetitorIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCompetitorIndex === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    vs #{idx + 2} {t.competitorTitle.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Opportunity Cost Statement */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>{activeTradeOff.opportunityCostSummary}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Advantages Box */}
            <div className="p-4 rounded-xl bg-[#050816] border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>What You Gain (Advantages)</span>
              </div>

              {activeTradeOff.advantages.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No specific metric advantages found.</div>
              ) : (
                <div className="space-y-2">
                  {activeTradeOff.advantages.map((adv, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <div className="font-semibold text-emerald-300">{adv.criterionName}</div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{adv.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sacrifices Box */}
            <div className="p-4 rounded-xl bg-[#050816] border border-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <TrendingDown className="w-4 h-4" />
                <span>What You Give Up (Sacrifices)</span>
              </div>

              {activeTradeOff.sacrifices.length === 0 ? (
                <div className="text-xs text-slate-400 italic">
                  Dominant choice: No significant trade-off sacrifices against this alternative.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeTradeOff.sacrifices.map((sac, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20">
                      <div className="font-semibold text-amber-300">{sac.criterionName}</div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{sac.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: AI EXECUTIVE DECISION MEMO (Gemini Engine Integration) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B142A] to-[#141A38] border border-purple-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Bot className="w-5 h-5 text-purple-400" />
            <span>AI Executive Financial Memo</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Gemini Advisory Integration
          </span>
        </div>

        {isLoadingAi ? (
          <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
            Synthesizing decision memo with live family vault metrics...
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#050816]/70 border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
            {aiMemo}
          </div>
        )}
      </div>
    </div>
  );
};
