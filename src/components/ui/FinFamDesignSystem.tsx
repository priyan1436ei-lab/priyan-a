import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

/* ========================================================================== */
/* 1. TYPOGRAPHY & TEXT UTILITIES                                             */
/* ========================================================================== */

export const CurrencyText: React.FC<{
  amount: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  isPrivacyMasked?: boolean;
}> = ({ amount, className = '', prefix = '₹', suffix = '', isPrivacyMasked = false }) => {
  if (isPrivacyMasked) {
    return <span className={`font-mono tracking-wider ${className}`}>••••••</span>;
  }
  return (
    <span className={`font-mono tracking-tight font-bold ${className}`}>
      {prefix}
      {Math.round(amount).toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

/* ========================================================================== */
/* 2. CARD CONTAINERS                                                         */
/* ========================================================================== */

export const FinFamCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'glass' | 'accent' | 'highlight';
}> = ({ children, className = '', hoverEffect = false, onClick, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-[#0D1322]/90 border border-slate-800/80 shadow-xl shadow-black/40',
    elevated: 'bg-[#111A30]/95 border border-slate-700/60 shadow-2xl shadow-black/50',
    glass: 'bg-[#0A1020]/75 backdrop-blur-xl border border-white/10 shadow-xl',
    accent: 'bg-gradient-to-br from-[#0F1B38] to-[#0A1224] border border-cyan-500/30 shadow-cyan-950/30 shadow-xl',
    highlight: 'bg-gradient-to-br from-[#131F3B] to-[#0D152A] border border-indigo-500/30 shadow-indigo-950/30 shadow-xl'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 ${variantStyles[variant]} ${
        hoverEffect ? 'hover:border-slate-600 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ========================================================================== */
/* 3. STATUS & PILL BADGES                                                    */
/* ========================================================================== */

export const StatusBadge: React.FC<{
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pro';
  label: string;
  icon?: React.ReactNode;
  className?: string;
}> = ({ status, label, icon, className = '' }) => {
  const styles = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    pro: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${styles[status]} ${className}`}
    >
      {icon}
      {label}
    </span>
  );
};

/* ========================================================================== */
/* 4. CIRCULAR PROGRESS RING (FINANCIAL HEALTH GAUGE)                         */
/* ========================================================================== */

export const ProgressRing: React.FC<{
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}> = ({ score, size = 110, strokeWidth = 9, showLabel = true }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return { stroke: '#10B981', gradient: 'from-emerald-400 to-teal-500', label: 'Excellent' };
    if (val >= 65) return { stroke: '#06B6D4', gradient: 'from-cyan-400 to-blue-500', label: 'Good' };
    if (val >= 50) return { stroke: '#F59E0B', gradient: 'from-amber-400 to-yellow-500', label: 'Moderate' };
    return { stroke: '#F43F5E', gradient: 'from-rose-500 to-pink-500', label: 'Needs Attention' };
  };

  const scoreMeta = getScoreColor(score);

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-800/80"
        />
        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreMeta.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Inner Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black font-mono text-white tracking-tighter leading-none">
          {score}
        </span>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
          / 100
        </span>
      </div>
      {showLabel && (
        <span className="mt-1.5 text-[11px] font-bold text-slate-300">
          {scoreMeta.label}
        </span>
      )}
    </div>
  );
};

/* ========================================================================== */
/* 5. AI INSIGHT CARD COMPONENT                                               */
/* ========================================================================== */

export const SmartInsightCard: React.FC<{
  type: 'saving' | 'goal' | 'budget' | 'security';
  title: string;
  description: string;
  savingAmount?: number;
  actionText?: string;
  onAction?: () => void;
}> = ({ type, title, description, savingAmount, actionText, onAction }) => {
  const typeConfig = {
    saving: {
      icon: Sparkles,
      iconColor: 'text-cyan-400',
      borderGlow: 'border-cyan-500/30 hover:border-cyan-400/50',
      badge: 'FinFam AI Insight'
    },
    goal: {
      icon: TrendingUp,
      iconColor: 'text-purple-400',
      borderGlow: 'border-purple-500/30 hover:border-purple-400/50',
      badge: 'Goal Insight'
    },
    budget: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      borderGlow: 'border-amber-500/30 hover:border-amber-400/50',
      badge: 'Budget Alert'
    },
    security: {
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      borderGlow: 'border-emerald-500/30 hover:border-emerald-400/50',
      badge: 'Vault Security'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl p-4 bg-gradient-to-br from-[#0F182E] to-[#0A1122] border ${config.borderGlow} transition-all duration-200 shadow-lg`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            {config.badge}
          </span>
        </div>
        {savingAmount && (
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Save ₹{savingAmount.toLocaleString('en-IN')}/mo
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};

/* ========================================================================== */
/* 6. EMPTY STATE COMPONENT                                                   */
/* ========================================================================== */

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
    <p className="text-xs text-slate-400 max-w-sm mb-4">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/* ========================================================================== */
/* 7. SKELETON LOADER COMPONENT                                               */
/* ========================================================================== */

export const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className = '', lines = 1 }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-slate-800/70 rounded-lg"
        style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
      />
    ))}
  </div>
);
