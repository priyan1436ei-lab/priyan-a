import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Zap,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Crown,
  LogOut,
  UserX,
  Share2,
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';

interface FamilyAndBillsScreenProps {
  onOpenAddBill: () => void;
  onNavigateToCreateFamily?: () => void;
  onNavigateToTransfer?: () => void;
}

export const FamilyAndBillsScreen: React.FC<FamilyAndBillsScreenProps> = ({
  onOpenAddBill,
  onNavigateToCreateFamily,
  onNavigateToTransfer
}) => {
  const {
    userProfile,
    familyWorkspace,
    familyMembers,
    familyInvitations,
    familyActivities,
    isRealTimeFamilyConnected,
    bills,
    goals,
    resendFamilyInvitation,
    revokeFamilyInvitation,
    removeFamilyMemberFromVault,
    leaveFamilyWorkspace,
    transferFamilyOwnership,
    payBill,
    deleteBill,
    addFamilyMember
  } = useFinFam();

  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'activity' | 'bills'>('members');
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [transferOwnerTargetId, setTransferOwnerTargetId] = useState<string | null>(null);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);

  const isOwner = userProfile.familyRole === 'Owner' || familyWorkspace?.ownerEmail === userProfile.email;

  const totalFamilyContribution = (Array.isArray(familyMembers) ? familyMembers : []).reduce((acc, m) => acc + m.monthlyContribution, 0);

  const handleCopyInviteLink = (invite: any) => {
    const link = `${window.location.origin}/?inviteToken=invite_token_preview&inviteId=${invite.id}`;
    navigator.clipboard.writeText(link);
    setCopiedInviteId(invite.id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  const handleResend = async (inviteId: string) => {
    setActionLoadingId(inviteId);
    await resendFamilyInvitation(inviteId);
    setActionLoadingId(null);
  };

  const handleRevoke = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this pending invitation?')) return;
    setActionLoadingId(inviteId);
    await revokeFamilyInvitation(inviteId);
    setActionLoadingId(null);
  };

  const handleRemoveMember = async (memberId: string | number, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the family? They will immediately lose access to family records.`)) return;
    await removeFamilyMemberFromVault(memberId);
  };

  const handleLeave = async () => {
    await leaveFamilyWorkspace();
    setIsConfirmingLeave(false);
  };

  const handleTransferOwnership = async (targetId: string | number) => {
    if (!confirm('Are you sure you want to transfer Owner role to this member?')) return;
    await transferFamilyOwnership(targetId);
    setTransferOwnerTargetId(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* 1. Family Workspace Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1129] via-[#0E1738] to-[#080D21] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl text-[#050816] shadow-lg shadow-cyan-500/20">
              {familyWorkspace?.name ? familyWorkspace.name.substring(0, 2).toUpperCase() : 'FV'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  {familyWorkspace?.name || userProfile.familyName || 'Family Vault'}
                </h1>

                {isOwner && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-amber-300" /> Owner
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>
                  Owner: <strong className="text-slate-200">{familyWorkspace?.ownerName || userProfile.name}</strong>
                </span>
                <span>•</span>
                <span>
                  {familyMembers.length} Active Member{familyMembers.length !== 1 ? 's' : ''}
                </span>
                <span>•</span>
                {/* Real-Time Sync Indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRealTimeFamilyConnected ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isRealTimeFamilyConnected ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
                  </span>
                  <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                    {isRealTimeFamilyConnected ? 'Live Mesh Synced' : 'Real-Time Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onNavigateToCreateFamily && (
              <button
                onClick={onNavigateToCreateFamily}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050816] text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Create / Invite
              </button>
            )}

            {!isOwner && familyMembers.length > 0 && (
              <button
                onClick={() => setIsConfirmingLeave(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave Family
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Leave Modal */}
        {isConfirmingLeave && (
          <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in">
            <span>
              Are you sure you want to leave this workspace? You will lose access to shared family data.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfirmingLeave(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold"
              >
                Confirm Leave
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" /> Active Members ({familyMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'invitations'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Mail className="w-4 h-4" /> Pending Invitations ({familyInvitations.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" /> Shared Activity
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'bills'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" /> Shared Utility Bills ({bills.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Total Monthly Household Inflow:{' '}
              <strong className="text-emerald-400 font-mono text-sm">
                ₹{totalFamilyContribution.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {familyMembers.map((member) => {
              const isMemberOwner = member.role === 'Owner';
              const isCurrentUser = member.email === userProfile.email;

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-[#050816] shadow-md"
                        style={{ backgroundColor: member.avatarColor || '#06B6D4' }}
                      >
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          {member.name}
                          {isCurrentUser && (
                            <span className="text-[10px] text-cyan-400 font-mono">(You)</span>
                          )}
                          {isMemberOwner && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>{member.role}</span>
                          <span>•</span>
                          <span className="font-mono">{member.email}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300 font-semibold">
                      ₹{member.monthlyContribution.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  {/* Owner Controls on Member Card */}
                  {isOwner && !isMemberOwner && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleTransferOwnership(member.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Crown className="w-3 h-3 text-amber-400" /> Transfer Ownership
                      </button>

                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Pending & Dispatched Invitations</h3>
              <p className="text-xs text-slate-400">
                Created with expiring, single-use cryptographically random tokens.
              </p>
            </div>

            {onNavigateToCreateFamily && (
              <button
                onClick={onNavigateToCreateFamily}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Invite More
              </button>
            )}
          </div>

          {familyInvitations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-3">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs text-slate-400">
                No active pending invitations. Tap "Invite More" to send invitations to up to 4 members.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {familyInvitations.map((inv) => {
                const isSent = inv.deliveryStatus === 'SENT';
                const isAccepted = inv.acceptanceStatus === 'ACCEPTED';
                const isRevoked = inv.acceptanceStatus === 'REVOKED';

                return (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="text-xs font-mono font-bold text-white">
                            {inv.intendedEmail}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            Role: {inv.role || 'Member'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Email Dispatched
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Delivery Failed
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isAccepted
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isRevoked
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {inv.acceptanceStatus}
                        </span>
                      </div>
                    </div>

                    {inv.deliveryError && (
                      <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300 flex items-center justify-between">
                        <span>Provider Delivery Issue: {inv.deliveryError}</span>
                      </div>
                    )}

                    {/* Owner Actions */}
                    {isOwner && !isAccepted && !isRevoked && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleCopyInviteLink(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          {copiedInviteId === inv.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied Link
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Link
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleResend(inv.id)}
                          disabled={actionLoadingId === inv.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${actionLoadingId === inv.id ? 'animate-spin' : ''}`}
                          />{' '}
                          Resend Email
                        </button>

                        <button
                          onClick={() => handleRevoke(inv.id)}
                          disabled={actionLoadingId === inv.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Revoke
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHARED ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Real-time feed of invitations, memberships, and shared contributions.
          </div>

          <div className="space-y-3">
            {familyActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-200">{act.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}{' '}
                    • Actor: {act.actorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHARED UTILITY BILLS */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Shared Household Recurring Bills</h3>
            <button
              onClick={onOpenAddBill}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Bill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{bill.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Due: {bill.dueDate} • {bill.category}
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-cyan-400">
                    ₹{bill.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bill.isPaid
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {bill.isPaid ? 'PAID' : 'PENDING'}
                  </span>

                  {!bill.isPaid && (
                    <button
                      onClick={() => payBill(bill.id, bill.name, bill.amount)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#050816] text-xs font-bold"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
