import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  Plus,
  Zap,
  CheckCheck,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Mail,
  UserCheck,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { THEME_OPTIONS, FinFamTheme, getSavedTheme, applyTheme } from '../lib/themeManager';

interface FinFamTopAppBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenAddExpense: () => void;
  onOpenScanReceipt: () => void;
  onOpenAccountSwitcher?: () => void;
  onOpenEmailInbox?: () => void;
}

export const FinFamTopAppBar: React.FC<FinFamTopAppBarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAddExpense,
  onOpenScanReceipt,
  onOpenAccountSwitcher,
  onOpenEmailInbox
}) => {
  const { userProfile, notifications, dismissNotification, markAllNotificationsRead } = useFinFam();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [activeTheme, setActiveTheme] = useState<FinFamTheme>(getSavedTheme());

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const handleSelectTheme = (theme: FinFamTheme) => {
    setActiveTheme(theme);
    applyTheme(theme);
    setShowThemeMenu(false);
  };

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050816]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-4 py-2">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Left: Avatar & App Branding */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('profile')}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all ring-1 ring-white/20"
            title="View Profile"
          >
            PS
          </button>
          <div className="cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white tracking-tight">FinFam</span>
              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Vault
              </span>
              {userProfile.isPremium && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-xs">
              {userProfile.familyName} • ₹{Math.round(userProfile.totalBalance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Right: Compact Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Instant Theme Switcher Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-cyan-300 border border-cyan-500/20 transition-all flex items-center gap-1 text-[11px] font-bold active:scale-95"
              title="Fast Theme Switcher"
            >
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Theme</span>
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0E1528] border border-cyan-500/30 shadow-2xl p-1.5 z-50 animate-fade-in space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 py-1">
                  Select Theme
                </span>
                {THEME_OPTIONS.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => handleSelectTheme(th.id)}
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      activeTheme === th.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{th.icon}</span>
                      <span>{th.name}</span>
                    </span>
                    {activeTheme === th.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Switcher */}
          {onOpenAccountSwitcher && (
            <button
              onClick={onOpenAccountSwitcher}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-cyan-300 border border-cyan-500/20 transition-all flex items-center gap-1 text-[11px] font-medium"
              title="Switch Persona"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{userProfile.name.split(' ')[0]}</span>
            </button>
          )}

          {/* Email Outbox */}
          {onOpenEmailInbox && (
            <button
              onClick={onOpenEmailInbox}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-1 text-[11px] font-medium"
              title="Invitations & Emails"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Invites</span>
            </button>
          )}

          {/* Quick Pay Action */}
          <button
            onClick={() => onNavigate('payment')}
            className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#050816] font-black text-[11px] px-2.5 py-1.5 rounded-xl transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Pay</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-white/10 transition-all active:scale-95"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center ring-1 ring-[#050816]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0E1528] border border-slate-700/70 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Vault Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition-colors hover:bg-white/[0.03] ${
                          notif.isUnread ? 'bg-cyan-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 text-cyan-400">
                              {notif.type === 'BILL_DUE_TOMORROW' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                              {notif.type === 'BUDGET_CROSSED' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                              {notif.type === 'SCORE_INCREASED' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                              {notif.type === 'SAVINGS_GOAL_REACHED' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                              {notif.type === 'PAYMENT_SUCCESS' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                {notif.title}
                                {notif.amountFormatted && (
                                  <span className="font-mono text-cyan-400 font-bold">
                                    {notif.amountFormatted}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                <span>{notif.timeAgo}</span>
                                {notif.actionRoute && (
                                  <button
                                    onClick={() => {
                                      setShowNotifications(false);
                                      onNavigate(notif.actionRoute!);
                                    }}
                                    className="text-cyan-400 hover:underline flex items-center gap-0.5 font-medium"
                                  >
                                    View details <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => dismissNotification(notif.id)}
                            className="text-slate-500 hover:text-slate-300 p-1"
                            title="Dismiss"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
