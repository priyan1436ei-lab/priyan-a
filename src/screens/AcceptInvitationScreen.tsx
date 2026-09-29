import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  UserCheck,
  RefreshCw,
  LogOut,
  Mail,
  Clock,
  Sparkles
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';

interface AcceptInvitationScreenProps {
  token: string;
  inviteId: string;
  onJoinedSuccess: () => void;
  onCancel: () => void;
  onOpenAccountSwitch: () => void;
}

export const AcceptInvitationScreen: React.FC<AcceptInvitationScreenProps> = ({
  token,
  inviteId,
  onJoinedSuccess,
  onCancel,
  onOpenAccountSwitch
}) => {
  const { userProfile, verifyInvitationToken, acceptFamilyInvitation, switchAccount } = useFinFam();

  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    invitation?: {
      id: string;
      familyId: string;
      familyName: string;
      inviterName: string;
      intendedEmail: string;
      role: string;
      expiresAt: string;
    };
    error?: string;
    code?: string;
  } | null>(null);

  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  // New account sign-in fields if switching or signing in
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Verify invitation on mount or token change
  useEffect(() => {
    let isMounted = true;
    const checkToken = async () => {
      setIsLoading(true);
      const res = await verifyInvitationToken(token, inviteId);
      if (isMounted) {
        setVerificationResult(res);
        setIsLoading(false);
      }
    };

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token, inviteId]);

  const intendedEmail = verificationResult?.invitation?.intendedEmail?.toLowerCase() || '';
  const currentUserEmail = userProfile.email?.toLowerCase() || '';
  const isEmailMatch = intendedEmail === currentUserEmail;

  const handleAcceptAndJoin = async () => {
    if (!isEmailMatch) {
      setJoinError(
        `Email mismatch: You are signed in as "${userProfile.email}", but this invitation was sent to "${intendedEmail}".`
      );
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    const result = await acceptFamilyInvitation(token, inviteId);
    setIsJoining(false);

    if (result.success) {
      setJoinedSuccess(true);
      setTimeout(() => {
        onJoinedSuccess();
      }, 1500);
    } else {
      setJoinError(result.error || 'Failed to accept invitation');
    }
  };

  // Quick switch to intended email to allow acceptance
  const handleQuickSwitchToIntended = () => {
    if (!intendedEmail) return;
    const fallbackName = intendedEmail.split('@')[0];
    const capitalizedName =
      fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1).replace('.', ' ');

    switchAccount({
      id: Date.now(),
      name: capitalizedName,
      email: intendedEmail
    });
    setJoinError(null);
  };

  const handleCustomSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    switchAccount({
      id: Date.now(),
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim().toLowerCase()
    });
    setCustomEmail('');
    setCustomName('');
    setJoinError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-300 font-semibold">Verifying secure invitation token...</p>
      </div>
    );
  }

  // Token is invalid, expired, or revoked
  if (!verificationResult?.valid) {
    const code = verificationResult?.code;
    return (
      <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-900 border border-red-500/30 text-center space-y-5 shadow-2xl my-8">
        <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-white">
            {code === 'EXPIRED'
              ? 'Invitation Has Expired'
              : code === 'REVOKED'
              ? 'Invitation Revoked'
              : code === 'ALREADY_USED'
              ? 'Invitation Already Used'
              : 'Invalid Invitation Link'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {verificationResult?.error ||
              'This invitation link is not valid or has expired. Please contact the family workspace owner to issue a fresh invitation.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Back to FinFam Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { invitation } = verificationResult;

  return (
    <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-3xl bg-[#0B1129] border border-cyan-500/30 text-white space-y-6 shadow-2xl my-6 animate-in zoom-in-95">
      {/* FinFam Branding & Header */}
      <div className="text-center space-y-2 border-b border-white/10 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> FinFam Family Invitation
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white pt-1">
          Join <span className="text-cyan-400">{invitation?.familyName}</span>
        </h1>
        <p className="text-xs text-slate-400">
          <strong className="text-slate-200">{invitation?.inviterName}</strong> invited you to
          collaborate on shared household goals and budgets.
        </p>
      </div>

      {/* Permitted Sharing Notice */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Strict Privacy & Permitted Sharing Guarantee
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Joining shares only permitted family information (like shared goals and utility bills).
          Your personal bank accounts, investments, and private expenses remain strictly
          confidential.
        </p>
      </div>

      {/* Invitation Details Summary */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Intended Recipient Email:</span>
          <span className="font-mono font-bold text-cyan-300">{invitation?.intendedEmail}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Assigned Role:</span>
          <span className="font-bold text-emerald-400">{invitation?.role || 'Member'}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Expires:</span>
          <span className="font-mono text-slate-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {new Date(invitation?.expiresAt || '').toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Authentication & Email Mismatch Guard */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Currently Signed In As:</span>
          <span className="font-mono text-slate-200 font-semibold">{userProfile.email}</span>
        </div>

        {!isEmailMatch ? (
          /* EMAIL MISMATCH WARNING */
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300">Account Mismatch Warning</div>
                <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                  You are signed in as <strong className="text-white">{userProfile.email}</strong>,
                  but this invitation was sent to{' '}
                  <strong className="text-white">{invitation?.intendedEmail}</strong>.
                </p>
                <p className="text-[11px] text-amber-300/80 mt-1">
                  To protect family security, the invitation cannot be attached to a different
                  account.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleQuickSwitchToIntended}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#050816] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" /> Switch to {invitation?.intendedEmail}
              </button>
              <button
                type="button"
                onClick={onOpenAccountSwitch}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-white/10"
              >
                Sign In Different Account
              </button>
            </div>
          </div>
        ) : (
          /* EMAIL MATCHED - READY TO JOIN */
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Verified: Your account (<strong className="text-white">{userProfile.email}</strong>)
              matches the invitation!
            </span>
          </div>
        )}

        {joinError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {joinError}
          </div>
        )}

        {joinedSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-black text-white">Joined Successfully!</div>
            <p className="text-xs text-slate-300">Opening your family dashboard...</p>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isEmailMatch || isJoining}
              onClick={handleAcceptAndJoin}
              className={`flex-1 py-3 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                isEmailMatch
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050816] shadow-cyan-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isJoining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Joining Workspace...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Accept & Join
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
