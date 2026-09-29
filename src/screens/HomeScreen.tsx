import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  TrendingUp,
  Zap,
  CreditCard,
  Target,
  Users,
  Bot,
  ScanLine,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  QrCode,
  Send,
  Download,
  RotateCw,
  Flame,
  CheckCircle2,
  PieChart,
  Activity,
  Layers,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import {
  FinFamCard,
  CurrencyText,
  StatusBadge,
  ProgressRing,
  SmartInsightCard
} from '../components/ui/FinFamDesignSystem';
import { RippleEffectSimulator } from '../components/RippleEffectSimulator';

interface HomeScreenProps {
  onNavigate: (route: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenScanReceipt: () => void;
  onSelectGoalForTopUp: (goal: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenScanReceipt,
  onSelectGoalForTopUp
}) => {
  const {
    userProfile,
    financialHealth,
    transactions,
    budgets,
    goals,
    bills,
    deleteTransaction,
    payBill,
    finfamWallet
  } = useFinFam();

  // Interactive Card & UI States
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showQrModal, setShowQrModal] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const healthScore = financialHealth.overallScore || 82;

  // Breakdown metrics
  const scoreBreakdown = [
    { label: 'Savings', score: 88, color: 'text-emerald-400', bar: 'bg-emerald-400' },
    { label: 'Expenses', score: 76, color: 'text-cyan-400', bar: 'bg-cyan-400' },
    { label: 'Goals', score: 84, color: 'text-purple-400', bar: 'bg-purple-400' },
    { label: 'Emergency', score: 72, color: 'text-amber-400', bar: 'bg-amber-400' },
    { label: 'Debt', score: 90, color: 'text-teal-400', bar: 'bg-teal-400' }
  ];

  // Family members list
  const familyMembers = [
    { name: 'Priyan', role: 'Vault Admin', balance: 24580, share: '32%', color: 'from-cyan-500 to-blue-600', initials: 'PS' },
    { name: 'Mom', role: 'Family Co-Owner', balance: 18400, share: '24%', color: 'from-rose-500 to-pink-600', initials: 'MS' },
    { name: 'Dad', role: 'Family Contributor', balance: 32500, share: '38%', color: 'from-emerald-500 to-teal-600', initials: 'DS' },
    { name: 'Brother', role: 'Junior Member', balance: 9080, share: '6%', color: 'from-amber-500 to-orange-600', initials: 'BS' }
  ];

  // Spending categories breakdown
  const spendingCategories = [
    { name: 'Food & Dining', amount: 5250, percent: 28, color: 'bg-rose-500', barColor: '#f43f5e' },
    { name: 'Bills & Utilities', amount: 4100, percent: 22, color: 'bg-blue-500', barColor: '#3b82f6' },
    { name: 'Transport', amount: 2800, percent: 15, color: 'bg-amber-500', barColor: '#f59e0b' },
    { name: 'Shopping', amount: 2300, percent: 13, color: 'bg-purple-500', barColor: '#a855f7' },
    { name: 'Other Essentials', amount: 4000, percent: 22, color: 'bg-emerald-500', barColor: '#10b981' }
  ];

  const totalMonthlySpending = spendingCategories.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-20 animate-fade-in max-w-5xl mx-auto text-slate-100">
      {/* ============================================================== */}
      {/* 1. TOP GREETING & CONTEXT HEADER                               */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {userProfile.name.split(' ')[0]}</span>
            <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Your Family Financial Command Center • <span className="text-cyan-400 font-semibold">{userProfile.familyName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBalanceHidden(!isBalanceHidden)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Privacy Eye: Hide/Reveal Balances"
          >
            {isBalanceHidden ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{isBalanceHidden ? 'Hidden' : 'Hide'}</span>
          </button>

          <button
            onClick={() => onNavigate('payment')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span>UPI Pay</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN BALANCE CARD & VIRTUAL CARD DOCK                       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Financial Overview Card */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl p-6 bg-gradient-to-br from-[#0C1529] via-[#0A1122] to-[#070D1B] border border-slate-700/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-cyan-400" /> Total Family Balance
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> ↑ 8.4% this month
              </span>
            </div>

            <div className="my-3">
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight flex items-baseline gap-2">
                <CurrencyText
                  amount={userProfile.totalBalance || 84560}
                  isPrivacyMasked={isBalanceHidden}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active Vault Reserve • 4 Connected Family Ledgers
              </p>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => onNavigate('payment')}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-cyan-500/40 text-center transition-all group active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Send Money</span>
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-emerald-500/40 text-center transition-all group active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Receive</span>
            </button>

            <button
              onClick={onOpenScanReceipt}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-purple-500/40 text-center transition-all group active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ScanLine className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Scan & Pay</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 hover:border-rose-500/40 text-center transition-all group active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Add Expense</span>
            </button>
          </div>
        </div>

        {/* Right: Virtual Interactive RuPay/UPI 3D Card */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            className="cursor-pointer group relative w-full h-56 sm:h-60 rounded-3xl p-6 transition-all duration-500 transform preserve-3d shadow-2xl overflow-hidden select-none"
            style={{
              background: isCardFrozen
                ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)'
                : 'linear-gradient(135deg, #0A2540 0%, #0D3B66 40%, #051923 100%)',
              boxShadow: isCardFrozen
                ? '0 20px 40px -15px rgba(30, 41, 59, 0.5)'
                : '0 20px 40px -15px rgba(6, 182, 212, 0.35)'
            }}
          >
            {/* Holographic Shimmer Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-emerald-400/20 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

            {!isCardFlipped ? (
              /* CARD FRONT */
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center font-black text-xs text-slate-950 shadow-md">
                      F
                    </div>
                    <span className="font-black text-sm tracking-wider text-white">
                      FinFam <span className="text-[10px] text-cyan-300 font-mono font-normal">VAULT</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCardFrozen && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> FROZEN
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold text-cyan-300/80 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      RuPay • UPI 2.0
                    </span>
                  </div>
                </div>

                {/* EMV Chip */}
                <div className="flex items-center gap-3 my-auto">
                  <div className="w-10 h-8 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border border-amber-300/80 shadow-inner flex items-center justify-center">
                    <div className="w-full h-[1px] bg-amber-700/60 my-0.5" />
                  </div>
                  <Zap className="w-4 h-4 text-cyan-400/80" />
                </div>

                {/* Card Number & Holder */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-slate-300 tracking-widest">
                      •••• •••• •••• 9281
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">EXP 09/29</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Cardholder</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wide truncate max-w-[140px] block">
                        {userProfile.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase font-semibold block">Live Vault</span>
                      <span className="text-sm font-black font-mono text-emerald-400">
                        <CurrencyText amount={userProfile.totalBalance || 84560} isPrivacyMasked={isBalanceHidden} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* CARD BACK */
              <div className="relative z-10 h-full flex flex-col justify-between py-1">
                <div className="w-full h-8 bg-slate-950/90 -mx-6 my-1 border-y border-white/10" />
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] text-slate-400 font-mono">CVV Security Code</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCvv(!showCvv);
                    }}
                    className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {showCvv ? '824' : '•••'}
                    </span>
                    {showCvv ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                  </button>
                </div>
                <div className="text-[9px] text-slate-400 px-2 leading-tight">
                  FinFam Family Multi-Currency Vault Card. Encrypted by NPCI & 256-Bit TLS.
                </div>
              </div>
            )}
          </div>

          {/* Quick Card Controls */}
          <div className="flex items-center justify-between mt-2 px-1 text-xs">
            <button
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isCardFlipped ? 'Show Front' : 'Flip to CVV'}</span>
            </button>
            <button
              onClick={() => setIsCardFrozen(!isCardFrozen)}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                isCardFrozen ? 'text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isCardFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FINANCIAL HEALTH SCORE & AI EXPLANATION                     */}
      {/* ============================================================== */}
      <FinFamCard variant="accent" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Financial Health Score
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                82 / 100 • Excellent
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              6-Axis Real-Time Family Solvency & Savings Readiness
            </p>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Full Radar Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Progress Ring */}
          <div className="md:col-span-4 flex justify-center py-2">
            <ProgressRing score={82} size={120} strokeWidth={10} />
          </div>

          {/* Breakdown Bars */}
          <div className="md:col-span-8 space-y-2.5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {scoreBreakdown.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold text-slate-300">{item.label}</span>
                    <span className={`text-xs font-mono font-bold ${item.color}`}>{item.score}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.bar} h-full rounded-full`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Explanation Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-emerald-400">AI Health Assessment:</strong> Your financial health improved because your monthly savings increased by 12% and debt-to-income ratio dropped to 14%.
              </p>
            </div>
          </div>
        </div>
      </FinFamCard>

      {/* ============================================================== */}
      {/* 4. SMART INSIGHTS CAROUSEL / GRID                              */}
      {/* ============================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Smart AI Insights
          </h3>
          <span className="text-[11px] text-slate-400">Real-time telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <SmartInsightCard
            type="saving"
            title="Grocery spending surged +18% this month"
            description="Your family grocery expense crossed the 3-month average. Reallocating bulk purchases to weekend deals can yield substantial monthly savings."
            savingAmount={1250}
            actionText="View Analysis & Optimizer"
            onAction={() => onNavigate('optimizer')}
          />

          <SmartInsightCard
            type="goal"
            title="Emergency Fund is 82% on track"
            description="You can reach your full 6-month safety buffer 2 months earlier by increasing automated allocations by just ₹800/month."
            actionText="Adjust Goal Timeline"
            onAction={() => onNavigate('goals')}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. FAMILY DASHBOARD OVERVIEW                                   */}
      {/* ============================================================== */}
      <FinFamCard variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Family Overview & Contributions
            </h3>
            <p className="text-xs text-slate-400">
              4 Connected Family Accounts • Shared Expenses & Allocations
            </p>
          </div>
          <button
            onClick={() => onNavigate('family')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Manage Family</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {familyMembers.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${m.color} flex items-center justify-center font-bold text-xs text-white shadow-md`}>
                  {m.initials}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate">{m.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{m.role}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-baseline justify-between">
                <span className="text-[10px] text-slate-400">Contribution:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  <CurrencyText amount={m.balance} isPrivacyMasked={isBalanceHidden} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </FinFamCard>

      {/* ============================================================== */}
      {/* 6. EXPENSE TRACKER & CATEGORY VISUALIZATION                    */}
      {/* ============================================================== */}
      <FinFamCard variant="elevated" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">September Spending</h3>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                <CurrencyText amount={totalMonthlySpending} isPrivacyMasked={isBalanceHidden} />
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive Category Breakdown & Expense Ledger
            </p>
          </div>
          <button
            onClick={onOpenAddExpense}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            {spendingCategories.map((c, i) => (
              <div
                key={i}
                style={{ width: `${c.percent}%`, backgroundColor: c.barColor }}
                className="h-full transition-all hover:opacity-80"
                title={`${c.name}: ₹${c.amount} (${c.percent}%)`}
              />
            ))}
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {spendingCategories.map((c, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                  <span className="text-[11px] font-semibold text-slate-300 truncate">{c.name}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    <CurrencyText amount={c.amount} isPrivacyMasked={isBalanceHidden} />
                  </span>
                  <span className="text-[10px] text-slate-400">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FinFamCard>

      {/* ============================================================== */}
      {/* 7. GOALS & MILESTONES WITH AI RECOMMENDATIONS                  */}
      {/* ============================================================== */}
      <FinFamCard variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Active Family Goals
            </h3>
            <p className="text-xs text-slate-400">
              Feasibility & Automated Milestone Progression
            </p>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All Goals</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Goal 1: Education */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101930] to-[#0A1122] border border-purple-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  🎓 Higher Education
                </span>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                  64%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-400 mb-2">
                <span>Current: <CurrencyText amount={64000} isPrivacyMasked={isBalanceHidden} /></span>
                <span>Target: <CurrencyText amount={100000} isPrivacyMasked={isBalanceHidden} /></span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '64%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span>Target: <strong className="text-white">June 2027</strong></span>
              <span>₹4,000/mo</span>
            </div>

            <button
              onClick={() => onSelectGoalForTopUp({ name: 'Higher Education', currentAmount: 64000, targetAmount: 100000 })}
              className="w-full py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Add Money
            </button>
          </div>

          {/* Goal 2: Emergency Buffer */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#101930] to-[#0A1122] border border-emerald-500/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  🛡️ Family Emergency Fund
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  82%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs text-slate-400 mb-2">
                <span>Current: <CurrencyText amount={164000} isPrivacyMasked={isBalanceHidden} /></span>
                <span>Target: <CurrencyText amount={200000} isPrivacyMasked={isBalanceHidden} /></span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span>Target: <strong className="text-white">Dec 2026</strong></span>
              <span>₹5,000/mo</span>
            </div>

            <button
              onClick={() => onSelectGoalForTopUp({ name: 'Emergency Fund', currentAmount: 164000, targetAmount: 200000 })}
              className="w-full py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Add Money
            </button>
          </div>
        </div>
      </FinFamCard>

      {/* ============================================================== */}
      {/* 8. INTERACTIVE RIPPLE EFFECT SIMULATOR                         */}
      {/* ============================================================== */}
      <RippleEffectSimulator />

      {/* ============================================================== */}
      {/* 9. AI FINANCIAL COACH QUICK ACCESS                             */}
      {/* ============================================================== */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              FinFam AI Financial Coach
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                GPT-4o & Claude 3.5
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              "You have ₹12,400 available for flexible savings this month. Top opportunity: Reduce food delivery by ₹1,200."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {['Analyze Spending', 'Plan Goals', 'Reduce Expenses', 'Can I Afford This?'].map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate('advisor')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all active:scale-95"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 10. RECENT TRANSACTIONS STREAM                                 */}
      {/* ============================================================== */}
      <FinFamCard variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Cryptographically Verified UPI Ledger</p>
          </div>
          <button
            onClick={() => onNavigate('payment')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {transactions.slice(0, 5).map((txn) => {
            const isIncome = txn.type === 'INCOME' || txn.isCredit;
            return (
              <div
                key={txn.id}
                className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{txn.title || txn.notes || 'Transaction'}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{txn.date}</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-medium">{txn.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold block ${
                    isIncome ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {isIncome ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                    ✓ Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </FinFamCard>

      {/* ============================================================== */}
      {/* QR RECEIVE MODAL DIALOG                                        */}
      {/* ============================================================== */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#091124] border border-cyan-500/40 p-6 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white">Receive via UPI</h3>
            <p className="text-xs text-slate-400">Scan this QR code from Google Pay, PhonePe, Paytm, or BHIM</p>
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center">
              <div className="w-full h-full border-2 border-slate-900 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-900 font-mono text-xs">
                <QrCode className="w-24 h-24 text-slate-900 mb-1" />
                <span className="text-[10px] font-bold">priyan@finfam</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
              VPA: priyan@finfam
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
