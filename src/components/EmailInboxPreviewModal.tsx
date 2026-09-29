import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock
} from 'lucide-react';

interface EmailInboxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInviteLink: (joinUrl: string) => void;
}

export const EmailInboxPreviewModal: React.FC<EmailInboxPreviewModalProps> = ({
  isOpen,
  onClose,
  onOpenInviteLink
}) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/email/inbox');
      const data = await res.json();
      if (data.success && data.emails) {
        setEmails(data.emails);
        if (!selectedEmail && data.emails.length > 0) {
          setSelectedEmail(data.emails[0]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch emails:', err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-3xl bg-[#090E24] border border-cyan-500/30 text-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-[#0B1129]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                FinFam Transactional Email Outbox / Inspection
              </h3>
              <p className="text-[11px] text-slate-400">
                Inspect real dispatched invitation emails, preview branding, and click join links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1 transition-colors"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email List Sidebar */}
          <div className="w-full md:w-80 border-r border-white/10 overflow-y-auto p-3 space-y-2 bg-slate-950/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Dispatched Emails ({emails.length})
            </div>

            {emails.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No emails sent yet. Create a family to dispatch invitations!
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isSent = email.status === 'SENT';

                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full p-3 rounded-xl border text-left transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold truncate max-w-[150px]">
                        {email.to}
                      </span>
                      {isSent ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> SENT
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {email.subject}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(email.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Email Preview Pane */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#050816]">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Email Meta Bar */}
                <div className="p-4 border-b border-white/10 bg-slate-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white">
                      Subject: <span className="text-cyan-300">{selectedEmail.subject}</span>
                    </div>
                    {selectedEmail.joinUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(selectedEmail.joinUrl, selectedEmail.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1"
                        >
                          {copiedId === selectedEmail.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Link
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenInviteLink(selectedEmail.joinUrl);
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-[#050816] text-xs font-black flex items-center gap-1 hover:brightness-110 shadow-md shadow-cyan-500/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Test Open Link & Join
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>
                      To: <strong className="text-slate-200 font-mono">{selectedEmail.to}</strong>
                    </span>
                    <span>
                      Status:{' '}
                      <strong
                        className={
                          selectedEmail.status === 'SENT' ? 'text-emerald-400' : 'text-red-400'
                        }
                      >
                        {selectedEmail.status}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* HTML Iframe Preview */}
                <div className="flex-1 p-3 overflow-hidden bg-slate-950">
                  <iframe
                    srcDoc={selectedEmail.html}
                    title="Email Preview"
                    className="w-full h-full rounded-xl border border-white/10 bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-xs text-slate-500">
                Select an email from the list to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
