import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';

interface CreateFamilyScreenProps {
  onBackToFamily: () => void;
  onOpenInviteLink?: (url: string) => void;
}

export const CreateFamilyScreen: React.FC<CreateFamilyScreenProps> = ({
  onBackToFamily,
  onOpenInviteLink
}) => {
  const { userProfile, createFamily, resendFamilyInvitation } = useFinFam();

  const [familyName, setFamilyName] = useState(`${userProfile.name.split(' ')[0]}'s Family Vault`);
  const [photoUrl, setPhotoUrl] = useState('');
  // Exactly 4 email input fields by default
  const [inviteEmails, setInviteEmails] = useState<string[]>([
    'priya.sharma@example.com',
    'aarav.sharma@example.com',
    'vikram.sharma@example.com',
    'neha.sharma@example.com'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    family?: any;
    invitations?: any[];
    inviteLinks?: Array<{ email: string; inviteId: string; rawToken: string; joinUrl: string }>;
    error?: string;
  } | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [retryingInviteId, setRetryingInviteId] = useState<string | null>(null);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Add field
  const handleAddField = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  // Remove field
  const handleRemoveField = (index: number) => {
    if (inviteEmails.length <= 1) return;
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  // Update email
  const handleEmailChange = (index: number, value: string) => {
    const updated = [...inviteEmails];
    updated[index] = value;
    setInviteEmails(updated);
  };

  // Client-side pre-validation
  const validateForm = () => {
    const errors: string[] = [];

    if (!familyName.trim()) {
      errors.push('Family workspace name is required.');
    }

    const normalizedOwnerEmail = userProfile.email.trim().toLowerCase();
    const seenEmails = new Set<string>();

    inviteEmails.forEach((email, idx) => {
      const clean = email.trim().toLowerCase();
      if (!clean) {
        errors.push(`Invitation field #${idx + 1} cannot be empty.`);
        return;
      }

      if (!emailRegex.test(clean)) {
        errors.push(`"${email}" is not a valid email address.`);
      }

      if (clean === normalizedOwnerEmail) {
        errors.push(`Cannot invite creator's own email ("${userProfile.email}").`);
      }

      if (seenEmails.has(clean)) {
        errors.push(`Duplicate invitation address entered: "${email}".`);
      }

      seenEmails.add(clean);
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionResult(null);

    const result = await createFamily({
      familyName: familyName.trim(),
      photoUrl: photoUrl.trim() || undefined,
      emails: inviteEmails.map((e) => e.trim().toLowerCase())
    });

    setIsSubmitting(false);
    setSubmissionResult(result);
  };

  const handleCopyLink = (url: string, idx: number) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(idx);
    setTimeout(() => setCopiedLinkIndex(null), 2500);
  };

  const handleRetryInvite = async (inviteId: string) => {
    setRetryingInviteId(inviteId);
    await resendFamilyInvitation(inviteId);
    setRetryingInviteId(null);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            CREATE FAMILY & INVITE MEMBERS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Establish a unified household vault. Creator is assigned Owner role.
          </p>
        </div>
        <button
          onClick={onBackToFamily}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>

      {!submissionResult ? (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in">
          {/* Family Details Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              1. Family Workspace Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Family Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family Vault"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Family Photo / Banner URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-500">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <span>
                Workspace Creator: <strong className="text-white">{userProfile.name}</strong> ({userProfile.email})
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold font-mono">
                ROLE: OWNER
              </span>
            </div>
          </div>

          {/* Invitation Email Fields Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  2. Invite Members by Email ({inviteEmails.length} Invitees)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Separate invitations will be sent. Four invitees means four additional people besides you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddField}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Invitee
              </button>
            </div>

            <div className="space-y-3">
              {inviteEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs font-mono text-slate-500 font-bold">
                    #{index + 1}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder={`invitee${index + 1}@example.com`}
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>

                  {inviteEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Validation Warnings Box */}
            {validationErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Please fix the following validation errors:
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review Section */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <div className="font-bold text-[11px] uppercase tracking-wider mb-1 text-emerald-400">
                Review Summary Before Dispatch:
              </div>
              <p className="text-[11px] text-slate-300">
                {inviteEmails.filter((e) => e.trim()).length} unique invitation email(s) will be
                dispatched via transactional email service. Membership is created atomically only
                after the invited person opens the email link, verifies their matching account, and
                taps "Accept & Join".
              </p>
            </div>
          </div>

          {/* Submission Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToFamily}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-[#050816] text-xs font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating & Dispatching...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Create Family & Send Invitations
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Submission Results & Per-Email Delivery Status */
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Family Workspace "{submissionResult.family?.name}" Created!
                </h3>
                <p className="text-xs text-slate-400">
                  Role: <span className="text-cyan-400 font-bold">Owner</span> • You can manage
                  invitations, members, and shared records in real time.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Per-Email Delivery & Acceptance Status:</span>
                <span className="text-[10px] text-slate-500">Single-use SHA-256 tokens</span>
              </div>

              {submissionResult.invitations?.map((inv: any, idx: number) => {
                const inviteLink = submissionResult.inviteLinks?.find(
                  (l) => l.email === inv.intendedEmail
                );
                const isSent = inv.deliveryStatus === 'SENT';

                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-bold text-white">
                          {inv.intendedEmail}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Email Sent
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Delivery Failed
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          {inv.acceptanceStatus}
                        </span>
                      </div>
                    </div>

                    {!isSent && inv.deliveryError && (
                      <div className="text-[11px] text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20 flex items-center justify-between">
                        <span>Error: {inv.deliveryError}</span>
                        <button
                          onClick={() => handleRetryInvite(inv.id)}
                          disabled={retryingInviteId === inv.id}
                          className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[10px] font-bold flex items-center gap-1"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${retryingInviteId === inv.id ? 'animate-spin' : ''}`}
                          />{' '}
                          Retry
                        </button>
                      </div>
                    )}

                    {inviteLink && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                          {inviteLink.joinUrl}
                        </span>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleCopyLink(inviteLink.joinUrl, idx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            {copiedLinkIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Link
                              </>
                            )}
                          </button>

                          {onOpenInviteLink && (
                            <button
                              onClick={() => onOpenInviteLink(inviteLink.joinUrl)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 border border-cyan-500/30 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> Open Join Flow
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onBackToFamily}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              Go to Family Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
