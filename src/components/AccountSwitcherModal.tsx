import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Check,
  ShieldCheck,
  Plus,
  LogIn,
  Crown,
  Sparkles
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, switchAccount } = useFinFam();

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState('Member');

  if (!isOpen) return null;

  const demoAccounts = [
    {
      id: 1,
      name: 'Priyanshu Sharma',
      email: 'priyan1436ei@gmail.com',
      role: 'Owner',
      badge: 'Family Creator & Owner',
      color: '#06B6D4'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      role: 'Member',
      badge: 'Invited Member',
      color: '#EC4899'
    },
    {
      id: 3,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      role: 'Member',
      badge: 'Invited Member',
      color: '#8B5CF6'
    },
    {
      id: 4,
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@example.com',
      role: 'Member',
      badge: 'Existing Member',
      color: '#10B981'
    },
    {
      id: 5,
      name: 'Sunita Sharma',
      email: 'sunita.sharma@example.com',
      role: 'Member',
      badge: 'Existing Member',
      color: '#F59E0B'
    }
  ];

  const handleSelectAccount = (acc: typeof demoAccounts[0]) => {
    switchAccount(acc);
    onClose();
  };

  const handleCreateCustomAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    switchAccount({
      id: Date.now(),
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim().toLowerCase(),
      role: customRole
    });

    setCustomName('');
    setCustomEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#090E24] border border-cyan-500/30 p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-extrabold text-white">Switch User Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Switch between household personas to verify email invitation mismatch guards, role
          permissions, and server-verified individual ₹1 Premium entitlements.
        </p>

        {/* Account List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {demoAccounts.map((acc) => {
            const isSelected = userProfile.email.toLowerCase() === acc.email.toLowerCase();
            return (
              <button
                key={acc.email}
                onClick={() => handleSelectAccount(acc)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-[#050816]"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {acc.name}
                      {acc.role === 'Owner' && (
                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{acc.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {acc.badge}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Account Form */}
        <form
          onSubmit={handleCreateCustomAccount}
          className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-2.5"
        >
          <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Sign In with Custom / New Account
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Display Name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-bold text-xs transition-colors flex items-center justify-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" /> Switch to Custom Account
          </button>
        </form>
      </div>
    </div>
  );
};
