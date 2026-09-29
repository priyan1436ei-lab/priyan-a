import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Zap,
  Target,
  PieChart,
  HelpCircle
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { GeminiAiEngine, AiChatMessage } from '../lib/geminiAiEngine';
import { FinFamCard, CurrencyText, StatusBadge } from '../components/ui/FinFamDesignSystem';

export const AiAdvisorScreen: React.FC = () => {
  const {
    userProfile,
    financialHealth,
    monthlySpendingTrends,
    emis,
    budgets,
    goals,
    goalPortfolioSummary,
    financialCapacity,
    goalConflicts
  } = useFinFam();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Namaste ${userProfile.name.split(' ')[0]}!\n\nI analyzed your family's finances. You have ₹12,400 available for flexible spending this month.\n\n💡 **Your top opportunity:** Reduce food delivery by ₹1,200 to accelerate your Emergency Fund target by 1 month. How would you like to optimize your household wealth today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '📊 Analyze Spending', query: 'Analyze our family spending categories and identify leakages.' },
    { label: '🎯 Plan My Goals', query: 'How should we prioritize our Higher Education and Emergency Fund goals?' },
    { label: '✂️ Reduce Expenses', query: 'Give me 3 actionable ways to save ₹5,000 extra this month.' },
    { label: '🤔 Can I Afford This?', query: 'Can our family afford a new ₹80,000 laptop on 6-month no-cost EMI?' },
    { label: '📋 Create Budget', query: 'Suggest an ideal 50-30-20 family budget based on our income.' },
    { label: '📈 Explain My Score', query: 'Explain my 82/100 Financial Health score and how to reach 90+.' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: AiChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await GeminiAiEngine.askAdvisor(userText, {
        userProfile,
        financialHealth,
        monthlySpendingTrends,
        emis,
        budgets,
        goals,
        goalPortfolioSummary,
        financialCapacity,
        goalConflicts
      });

      const botMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I apologize, but I encountered an error while formulating your strategy. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-4 space-y-3 animate-fade-in">
      {/* Header */}
      <FinFamCard variant="accent" className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">FinFam AI</h2>
              <StatusBadge status="info" label="ONLINE" />
            </div>
            <p className="text-xs text-slate-400">Your Family Financial Coach & Decision Copilot</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-400 block">Family Health Score</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {financialHealth.overallScore}/100 • Excellent
          </span>
        </div>
      </FinFamCard>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 rounded-3xl bg-[#080E20]/90 border border-slate-800/80 shadow-inner">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isBot
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl sm:rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? 'bg-[#0E1528] border border-slate-700/60 text-slate-200 shadow-xl'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-[#050816] font-semibold shadow-md shadow-cyan-500/20'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{msg.text}</div>
                <div
                  className={`text-[9px] mt-2 font-mono ${
                    isBot ? 'text-slate-500' : 'text-cyan-950 font-bold'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0E1528] border border-slate-800 text-xs text-cyan-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing portfolio telemetry & formulating recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold border border-slate-800 hover:border-cyan-500/30 whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about investments, EMIs, tax or savings..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#050816] font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Send className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};
