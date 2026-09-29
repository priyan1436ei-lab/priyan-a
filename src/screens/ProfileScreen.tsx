import React, { useState } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Fingerprint,
  Users,
  CheckCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Scale,
  Moon,
  Lock,
  FileText,
  HelpCircle,
  Smartphone,
  Eye
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';
import { FinFamCard, CurrencyText, StatusBadge } from '../components/ui/FinFamDesignSystem';

export const ProfileScreen: React.FC<{
  onNavigateToDecisionOptimizer?: () => void;
  onNavigateToSubscription?: () => void;
}> = ({ onNavigateToDecisionOptimizer, onNavigateToSubscription }) => {
  const { userProfile, familyMembers, updateProfile } = useFinFam();

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isPushAlertsEnabled, setIsPushAlertsEnabled] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(userProfile.name);

  const handleSaveName = () => {
    updateProfile({ name: userName });
    setIsEditingName(false);
  };

  const menuSections = [
    {
      title: 'Account & Family',
      items: [
        { icon: User, label: 'Financial Profile & Net Worth', desc: 'Family KYC and tax brackets', badge: 'Verified' },
        { icon: Users, label: 'Family Members & Allocations', desc: `${familyMembers.length} active family members`, badge: userProfile.familyName },
        { icon: CreditCard, label: 'Payment Settings & UPI VPAs', desc: 'Default banks & autopay rules', badge: 'Active' }
      ]
    },
    {
      title: 'Security & Preferences',
      items: [
        { icon: Lock, label: 'Vault Privacy & Security Shield', desc: 'End-to-end encrypted family ledger', badge: 'AES-256' },
        { icon: Moon, label: 'Appearance & Theme', desc: 'Fintech Obsidian Dark Mode (Default)', badge: 'Dark' },
        { icon: HelpCircle, label: 'Help & Priority Concierge', desc: '24/7 FinFam instant support', badge: 'Live' }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto animate-fade-in text-slate-100">
      {/* Header Profile Hero Card */}
      <FinFamCard variant="accent" className="p-6 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-cyan-500/25">
              {userProfile.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-[#050816] border border-cyan-500/50 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1.5 bg-cyan-500 text-[#050816] rounded-xl text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingName(true)}
                  className="text-xl font-black text-white cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-2"
                  title="Click to edit"
                >
                  {userProfile.name}
                  <span className="text-[10px] text-slate-400 font-normal underline">edit</span>
                </h2>
              )}
              <div className="text-xs text-slate-400 mt-0.5">{userProfile.email}</div>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status="info" label={userProfile.familyName} />
                <StatusBadge
                  status={userProfile.isPremium ? 'pro' : 'neutral'}
                  label={userProfile.isPremium ? '💎 PRO VAULT' : 'FREE TIER'}
                />
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Net Worth</div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {FinancialEngine.formatINR(userProfile.totalBalance)}
            </div>
          </div>
        </div>
      </FinFamCard>

      {/* Decision AI Optimizer Banner */}
      {onNavigateToDecisionOptimizer && (
        <div
          onClick={onNavigateToDecisionOptimizer}
          className="p-4 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all flex items-center justify-between group shadow-lg active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Multi-Criteria Decision AI Optimizer</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  AI LAB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluate financial trade-offs (WSM model, sensitivity analysis & confidence scoring).
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Security & Biometrics Controls */}
      <FinFamCard variant="default" className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          Security & Biometrics
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-semibold text-white">Biometric Vault Authentication</div>
                <div className="text-[10px] text-slate-400">Require Touch ID / Face ID for payments & transfers</div>
              </div>
            </div>
            <button
              onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isBiometricEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isBiometricEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs font-semibold text-white">Smart Push Notifications</div>
                <div className="text-[10px] text-slate-400">Bill reminders & high-urgency budget anomaly pings</div>
              </div>
            </div>
            <button
              onClick={() => setIsPushAlertsEnabled(!isPushAlertsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isPushAlertsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  isPushAlertsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </FinFamCard>

      {/* Menu Settings Sections */}
      {menuSections.map((sec, sIdx) => (
        <FinFamCard key={sIdx} variant="default" className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            {sec.title}
          </h3>

          <div className="space-y-2">
            {sec.items.map((item, iIdx) => {
              const Icon = item.icon;
              return (
                <div
                  key={iIdx}
                  className="p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 group-hover:text-cyan-400 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </FinFamCard>
      ))}
    </div>
  );
};
