import React, { useState } from 'react';
import {
  Home,
  CreditCard,
  Target,
  Grid,
  Plus,
  TrendingUp,
  Calculator,
  Activity,
  Users,
  Bot,
  UserCheck,
  Scale,
  Layers,
  Sliders,
  Sparkles,
  Zap,
  Receipt,
  ScanLine,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface FinFamBottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAddExpense?: () => void;
  onOpenScanReceipt?: () => void;
  onOpenAddIncome?: () => void;
}

export const FinFamBottomNavBar: React.FC<FinFamBottomNavBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAddExpense,
  onOpenScanReceipt,
  onOpenAddIncome
}) => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const hubCategories = [
    {
      title: '🧠 AI & Decision Lab',
      items: [
        { id: 'optimizer', label: 'Decision AI Optimizer', desc: 'Trade-off & multi-criteria scoring', icon: Scale, color: 'from-cyan-500 to-blue-600' },
        { id: 'what_if_lab', label: 'What-If Simulation Lab', desc: 'Stress-test financial decisions', icon: Sliders, color: 'from-purple-500 to-indigo-600' },
        { id: 'conflict_map', label: 'Goal Conflict Map', desc: 'Detect resource contention', icon: Layers, color: 'from-amber-500 to-orange-600' },
        { id: 'resolution_lab', label: 'Resolution Lab', desc: 'Compromise & Pareto optimization', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
        { id: 'advisor', label: 'FinFam AI Coach', desc: 'Personalized GenAI advisory', icon: Bot, color: 'from-rose-500 to-pink-600' }
      ]
    },
    {
      title: '📊 Analytics & Intelligence',
      items: [
        { id: 'trends', label: 'Monthly Trends & Projections', desc: '6-month predictive category models', icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
        { id: 'analytics', label: 'Financial Health Radar', desc: '6-axis family readiness score', icon: Activity, color: 'from-emerald-500 to-teal-600' },
        { id: 'emi', label: 'EMI Engine & Debt Payoff', desc: 'Avalanche vs Snowball optimizer', icon: Calculator, color: 'from-amber-500 to-yellow-600' }
      ]
    },
    {
      title: '👨‍👩‍👧‍👦 Family Workspace & Mesh',
      items: [
        { id: 'family', label: 'Family Dashboard & Bills', desc: '4-member allocation & bills', icon: Users, color: 'from-indigo-500 to-purple-600' },
        { id: 'create_family', label: 'Invite Family Members', desc: 'Transactional email invitation hub', icon: Users, color: 'from-teal-500 to-emerald-600' },
        { id: 'transfer', label: 'Real-Money Family Transfer', desc: 'Razorpay Live & RazorpayX Payout Hub', icon: Zap, color: 'from-cyan-500 to-blue-600' },
        { id: 'profile', label: 'Profile & Security Shield', desc: 'Biometric & account settings', icon: UserCheck, color: 'from-slate-600 to-slate-800' }
      ]
    }
  ];

  const handleSelectRoute = (routeId: string) => {
    onNavigate(routeId);
    setIsHubOpen(false);
    setIsQuickActionsOpen(false);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. NATIVE MOBILE FLOATING BOTTOM DOCK                          */}
      {/* ============================================================== */}
      <nav className="fixed bottom-2.5 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-sm z-40">
        <div className="bg-[#070C1E]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-1 shadow-[0_8px_30px_rgba(0,0,0,0.7)] flex items-center justify-around relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/10 to-purple-500/5 pointer-events-none" />

          {/* Tab 1: Vault (Home) */}
          <button
            onClick={() => handleSelectRoute('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative active:scale-95 ${
              currentRoute === 'home'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentRoute === 'home' && (
              <span className="absolute top-0.5 w-4 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] animate-pulse" />
            )}
            <Home className={`w-4 h-4 ${currentRoute === 'home' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] tracking-tight mt-0.5 font-medium">Vault</span>
          </button>

          {/* Tab 2: UPI Pay */}
          <button
            onClick={() => handleSelectRoute('payment')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative active:scale-95 ${
              currentRoute === 'payment'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {currentRoute === 'payment' && (
              <span className="absolute top-0.5 w-4 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
            )}
            <CreditCard className={`w-4 h-4 ${currentRoute === 'payment' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] tracking-tight mt-0.5 font-medium">Pay</span>
          </button>

          {/* Tab 3: CENTER FLOATING ACTION BUTTON */}
          <div className="flex-1 flex items-center justify-center -my-2">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30 transition-all transform active:scale-90 hover:scale-105 ${
                isQuickActionsOpen ? 'rotate-45' : ''
              }`}
              title="Quick Actions"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Tab 4: Goals */}
          <button
            onClick={() => handleSelectRoute('goals')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative active:scale-95 ${
              currentRoute === 'goals' || currentRoute === 'multi_goal_planner'
                ? 'text-purple-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {(currentRoute === 'goals' || currentRoute === 'multi_goal_planner') && (
              <span className="absolute top-0.5 w-4 h-0.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7] animate-pulse" />
            )}
            <Target className={`w-4 h-4 ${currentRoute === 'goals' || currentRoute === 'multi_goal_planner' ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] tracking-tight mt-0.5 font-medium">Goals</span>
          </button>

          {/* Tab 5: All Apps / Hub */}
          <button
            onClick={() => setIsHubOpen(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all relative active:scale-95 ${
              isHubOpen
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className={`w-4 h-4 ${isHubOpen ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] tracking-tight mt-0.5 font-medium">Hub</span>
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 2. QUICK ACTIONS BOTTOM SHEET MODAL                            */}
      {/* ============================================================== */}
      {isQuickActionsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4"
          onClick={() => setIsQuickActionsOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#091124] border border-cyan-500/40 p-5 shadow-2xl space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">FinFam Quick Actions</h3>
                  <p className="text-[10px] text-slate-400">Instant transactions & tools</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickActionsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectRoute('payment')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border border-emerald-500/30 text-left hover:border-emerald-400 transition-all flex flex-col justify-between group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Send UPI</span>
                  <p className="text-[10px] text-emerald-400">Instant VPA Transfer</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  if (onOpenScanReceipt) onOpenScanReceipt();
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/5 border border-cyan-500/30 text-left hover:border-cyan-400 transition-all flex flex-col justify-between group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-cyan-500/20 mb-2 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Scan & Pay</span>
                  <p className="text-[10px] text-cyan-300">QR & OCR Scanner</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  if (onOpenAddExpense) onOpenAddExpense();
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500/15 to-pink-500/5 border border-rose-500/30 text-left hover:border-rose-400 transition-all flex flex-col justify-between group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Add Expense</span>
                  <p className="text-[10px] text-rose-300">Manual Entry</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectRoute('optimizer')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/5 border border-purple-500/30 text-left hover:border-purple-400 transition-all flex flex-col justify-between group active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20 mb-2 group-hover:scale-110 transition-transform">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Decision AI</span>
                  <p className="text-[10px] text-purple-300">Run Optimizer</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ALL APPS / HUB DRAWER MODAL                                 */}
      {/* ============================================================== */}
      {isHubOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in p-4"
          onClick={() => setIsHubOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#091124] border border-slate-700/80 p-6 shadow-2xl space-y-6 overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">FinFam App Hub</h2>
                  <p className="text-xs text-slate-400">All financial intelligence engines & tools</p>
                </div>
              </div>
              <button
                onClick={() => setIsHubOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {hubCategories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block px-1">
                    {cat.title}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentRoute === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectRoute(item.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 group active:scale-98 ${
                            isActive
                              ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
                            <Icon className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{item.label}</span>
                            <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
