import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Receipt,
  RotateCcw,
  Sparkles,
  Smartphone,
  Landmark,
  AlertCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  Sliders,
  AlertTriangle,
  Printer,
  Wallet,
  Send,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Target,
  Search,
  Share2,
  X,
  Camera,
  CheckCircle,
  HelpCircle,
  Lock,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { useFinFam, SUBSCRIPTION_PLANS } from '../context/FinFamContext';
import {
  RazorpayTransactionRecord,
  FinFamUpiTransaction,
  FinFamPaymentType
} from '../types';

export const PaymentScreen: React.FC<{ onNavigateToTransfer: () => void }> = ({
  onNavigateToTransfer
}) => {
  const {
    userProfile,
    paymentHistory,
    processSubscriptionPayment,
    refundPayment,
    restorePurchases,
    exportFinancialReport,
    paymentFlowState,
    lastPaymentError,
    familyMembers,
    goals,
    upiTransactions,
    finfamWallet,
    fetchUpiHistory,
    processUpiPayment,
    refundUpiPayment,
    requestUpiMoney,
    contributeToGoalDirect
  } = useFinFam();

  // Active top navigation tab:
  // 0: FinFam Pay (UPI Gateway & Dashboard)
  // 1: ₹1 Premium Upgrade
  // 2: Family Transfers (P2P vs Merchant)
  // 3: Receipts & Audit Passbook
  const [activeTab, setActiveTab] = useState<number>(0);

  // Common UI State
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter & Search State for Transactions
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals Visibility
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<FinFamUpiTransaction | null>(null);
  const [selectedPlanReceipt, setSelectedPlanReceipt] = useState<RazorpayTransactionRecord | null>(null);
  const [successCelebrationTx, setSuccessCelebrationTx] = useState<FinFamUpiTransaction | null>(null);

  // Send Money State
  const [sendUpiId, setSendUpiId] = useState<string>('');
  const [sendRecipientName, setSendRecipientName] = useState<string>('ABC Store');
  const [sendAmount, setSendAmount] = useState<string>('750');
  const [sendNote, setSendNote] = useState<string>('Groceries');
  const [sendCategory, setSendCategory] = useState<string>('Groceries');
  const [sendSelectedGoalId, setSendSelectedGoalId] = useState<string>('');
  const [sendStep, setSendStep] = useState<'INPUT' | 'CONFIRM'>('INPUT');
  const [transferMethod, setTransferMethod] = useState<'VAULT' | 'GATEWAY'>('VAULT');

  // Request Money State
  const [requestAmount, setRequestAmount] = useState<string>('1500');
  const [requestNote, setRequestNote] = useState<string>('Shared household expense');
  const [requestQrUrl, setRequestQrUrl] = useState<string>('');
  const [requestUpiUri, setRequestUpiUri] = useState<string>('');

  // Scan & Pay State
  const [scannedUpiPayload, setScannedUpiPayload] = useState<string>('');
  const [scanStep, setScanStep] = useState<'SCANNING' | 'CONFIRM'>('SCANNING');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Goal Contribution State
  const [selectedGoalId, setSelectedGoalId] = useState<number>(goals[0]?.id || 1);
  const [goalContribAmount, setGoalContribAmount] = useState<string>('750');

  // ₹1 Subscription Upgrade state
  const [selectedPlanId, setSelectedPlanId] = useState<string>('finfam_premium_one_time');
  const [subPaymentMethod, setSubPaymentMethod] = useState<string>('UPI');

  // Export report state
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Quick Bank Suffixes for instant UPI completion
  const UPI_BANK_HANDLES = ['@okhdfcbank', '@okaxis', '@oksbi', '@okicici', '@paytm', '@ybl', '@upi'];

  const handleApplyBankHandle = (handle: string) => {
    if (!sendUpiId) {
      setSendUpiId(`example${handle}`);
    } else if (sendUpiId.includes('@')) {
      const base = sendUpiId.split('@')[0];
      setSendUpiId(`${base}${handle}`);
    } else {
      setSendUpiId(`${sendUpiId}${handle}`);
    }
  };

  // Load transactions when filter or search changes
  useEffect(() => {
    fetchUpiHistory(selectedFilter, searchQuery);
  }, [selectedFilter, searchQuery]);

  // Generate UPI QR code for Request Money
  useEffect(() => {
    const amt = parseFloat(requestAmount) || 0;
    const uri = `upi://pay?pa=priyan1436ei@okhdfcbank&pn=${encodeURIComponent(
      userProfile.name || 'FinFam User'
    )}&am=${amt.toFixed(2)}&tn=${encodeURIComponent(requestNote)}&cu=INR`;
    setRequestUpiUri(uri);

    QRCode.toDataURL(uri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#050816',
        light: '#FFFFFF'
      }
    })
      .then((url) => setRequestQrUrl(url))
      .catch((err) => console.warn('QR Code generation error:', err));
  }, [requestAmount, requestNote, userProfile.name]);

  // Handle Camera for Scan & Pay
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (e) {
      console.warn('Camera access error:', e);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Share Receipt helper
  const handleShareReceipt = async (tx: FinFamUpiTransaction) => {
    const dateFormatted = new Date(tx.completedAt || tx.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = new Date(tx.completedAt || tx.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const shareText = `FINFAM PAYMENT RECEIPT\n✓ SUCCESSFUL\n\nAmount: ₹${tx.amount.toFixed(2)}\nPaid To: ${tx.recipientName || 'ABC Store'}\nUPI ID: ${tx.recipientUpi || tx.recipientUpiId || tx.upiId || 'example@upi'}\nPurpose: ${tx.purpose || tx.category || 'Groceries'}\nDate: ${dateFormatted}\nTime: ${timeFormatted}\nTransaction ID: ${tx.transactionId}\nUPI Reference: ${tx.providerReference || tx.receiptNumber || 'XXXXXXXXXXXX'}\nPayment Method: ${tx.paymentMethod || 'UPI'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `FinFam Payment Receipt - ${tx.transactionId}`,
          text: shareText
        });
        return;
      } catch (e) {
        // user cancelled or fallback
      }
    }
    navigator.clipboard.writeText(shareText);
    setStatusMessage('Receipt details copied to clipboard!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Execute Send Money via UPI
  const handleExecuteSendMoney = async () => {
    const amt = parseFloat(sendAmount);
    if (isNaN(amt) || amt < 1.0) {
      setErrorMessage('Amount must be at least ₹1.00');
      return;
    }

    if (!sendUpiId || !sendUpiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g. name@bank)');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const isGoal = Boolean(sendSelectedGoalId && sendSelectedGoalId !== '');
    const targetGoal = isGoal ? goals.find((g) => g.id === Number(sendSelectedGoalId)) : null;

    const result = await processUpiPayment({
      amount: amt,
      recipientUpi: sendUpiId,
      recipientName: sendRecipientName || (isGoal ? `${targetGoal?.name || 'Goal'} Vault` : (sendUpiId.split('@')[0] || 'ABC Store')),
      purpose: sendNote || sendCategory,
      paymentType: isGoal ? 'GOAL_CONTRIBUTION' : (sendCategory === 'Family' ? 'FAMILY_TRANSFER' : 'UPI_SEND'),
      category: sendCategory || (isGoal ? 'Goals' : 'UPI'),
      goalId: isGoal ? Number(sendSelectedGoalId) : undefined,
      goalName: targetGoal?.name,
      isDirectVaultTransfer: transferMethod === 'VAULT'
    });

    setIsProcessing(false);

    if (result.success) {
      setShowSendModal(false);
      setSendStep('INPUT');
      setStatusMessage(result.message);
      if (result.transaction) {
        setSuccessCelebrationTx(result.transaction);
      }
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setErrorMessage(result.error || result.message);
    }
  };

  // Execute Goal Contribution via UPI
  const handleExecuteGoalContribution = async () => {
    const amt = parseFloat(goalContribAmount);
    if (isNaN(amt) || amt < 1.0) {
      setErrorMessage('Contribution must be at least ₹1.00');
      return;
    }

    const goal = goals.find((g) => g.id === selectedGoalId) || goals[0];
    if (!goal) return;

    setIsProcessing(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const result = await contributeToGoalDirect(goal.id, goal.name, amt);
    setIsProcessing(false);

    if (result.success) {
      setShowGoalModal(false);
      setStatusMessage(`✓ ₹${amt} contributed to ${goal.name}!`);
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setErrorMessage(result.error || result.message);
    }
  };

  // Quick Pay to Family Member
  const handleQuickPayFamily = (member: { name: string; email: string; vpa?: string }, defaultAmt: number) => {
    setSendRecipientName(member.name);
    setSendUpiId(member.vpa || `${member.name.toLowerCase().replace(/\s+/g, '')}@okaxis`);
    setSendAmount(defaultAmt.toString());
    setSendNote(`Family support to ${member.name}`);
    setSendStep('CONFIRM');
    setShowSendModal(true);
  };

  // Execute Subscription Upgrade
  const handleSubscribe = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const result = await processSubscriptionPayment(selectedPlanId, subPaymentMethod);
    setIsProcessing(false);

    if (result.success) {
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setErrorMessage(result.error || result.message);
    }
  };

  // Execute Refund
  const handleRefundTransaction = async (txId: string) => {
    if (!confirm('Are you sure you want to request a refund for this transaction?')) return;
    setIsProcessing(true);
    const res = await refundUpiPayment(txId, 'Customer initiated refund');
    setIsProcessing(false);
    if (res.success) {
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setErrorMessage(res.error || res.message);
    }
  };

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[0];

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              UPI 2.0 Live Gateway
            </span>
            <span className="text-xs text-slate-400 font-mono">Test Mode (rzp_test_TNKQHoOkeQFUas)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
            FinFam Pay
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
              FamPay-Grade Instant UPI
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time merchant collections, UPI QR scanner, family money transfers & goal contributions.
          </p>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner overflow-x-auto">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 0
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> FinFam Pay (UPI)
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 1
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> ₹1 Premium Upgrade
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 2
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Family Transfers
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 3
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Tax Receipts & Audit
          </button>
        </div>
      </div>

      {/* Global Alerts & Toast Notices */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 shadow-lg animate-slide-down">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 0: FINFAM PAY (UPI GATEWAY & DASHBOARD)                     */}
      {/* ============================================================== */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Hero Wallet Card & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Main FinFam Wallet Card */}
            <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#091124] to-[#050914] border border-cyan-500/30 p-6 md:p-8 shadow-2xl">
              {/* Glowing Background Radial */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                      FP
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                        FINFAM VAULT WALLET
                      </span>
                      <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Double-Entry Ledger Verified
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    INR • ₹
                  </span>
                </div>

                {/* Available Balance Display */}
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Available Wallet Balance
                  </span>
                  <div className="text-4xl md:text-5xl font-black text-white tracking-tight font-mono mt-1 flex items-baseline gap-1">
                    <span className="text-2xl text-cyan-400">₹</span>
                    {finfamWallet.availableBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>
                      VPA:{' '}
                      <strong className="text-slate-200 font-mono">priyan1436ei@okhdfcbank</strong>
                    </span>
                    <button
                      onClick={() => handleCopy('priyan1436ei@okhdfcbank', 'vpa')}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedText === 'vpa' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Wallet Balance Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Received
                    </span>
                    <p className="text-xs md:text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      +₹{finfamWallet.totalReceived.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-red-400" /> Sent
                    </span>
                    <p className="text-xs md:text-sm font-bold text-red-400 font-mono mt-0.5">
                      -₹{finfamWallet.totalSent.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Target className="w-3 h-3 text-purple-400" /> Goals Saved
                    </span>
                    <p className="text-xs md:text-sm font-bold text-purple-400 font-mono mt-0.5">
                      ₹{finfamWallet.goalContributions.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSendStep('INPUT');
                  setShowSendModal(true);
                }}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e162b] border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-[1.02] shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md group-hover:shadow-cyan-500/20 transition-all">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">Send Money</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Instant UPI Transfer</span>
              </button>

              <button
                onClick={() => setShowRequestModal(true)}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e162b] border border-emerald-500/20 hover:border-emerald-400/50 transition-all hover:scale-[1.02] shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md group-hover:shadow-emerald-500/20 transition-all">
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">Request Money</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Share UPI Link / QR</span>
              </button>

              <button
                onClick={() => {
                  setScanStep('SCANNING');
                  setShowScanModal(true);
                  startCamera();
                }}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e162b] border border-purple-500/20 hover:border-purple-400/50 transition-all hover:scale-[1.02] shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mb-3 shadow-md group-hover:shadow-purple-500/20 transition-all">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">Scan & Pay</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Camera QR Scanner</span>
              </button>

              <button
                onClick={() => {
                  setSendUpiId('');
                  setSendStep('INPUT');
                  setTransferMethod('GATEWAY');
                  setShowSendModal(true);
                }}
                className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0e162b] border border-amber-500/20 hover:border-amber-400/50 transition-all hover:scale-[1.02] shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md group-hover:shadow-amber-500/20 transition-all">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-white">Pay UPI Gateway</span>
                <span className="text-[10px] text-amber-400 font-semibold mt-0.5">Live Razorpay UPI</span>
              </button>
            </div>
          </div>

          {/* UPI Gateway Apps & Ecosystem Strip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0B132B] to-slate-900/90 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">UPI 2.0 Real-Time Payment Gateway</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    🟢 ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Supported UPI Apps: GPay • PhonePe • Paytm • BHIM • Cred • Amazon Pay • Any Bank VPA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Key: <span className="text-cyan-300">rzp_test_TNKQHoOkeQFUas</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSendUpiId('');
                  setSendStep('INPUT');
                  setTransferMethod('GATEWAY');
                  setShowSendModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-[11px] font-black transition-all flex items-center gap-1 shadow-sm"
              >
                <Smartphone className="w-3 h-3" /> Open Gateway
              </button>
            </div>
          </div>

          {/* Section: Family Quick Pay */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Family Quick Transfer
                </h3>
                <p className="text-xs text-slate-400">1-click instant UPI payment to verified household members</p>
              </div>
              <button
                onClick={() => setActiveTab(2)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                Manage Family Ledger <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Mom', amount: 5000, color: 'from-pink-500 to-rose-600', vpa: 'mom.sharma@okaxis', role: 'Mother' },
                { name: 'Dad', amount: 3500, color: 'from-blue-500 to-indigo-600', vpa: 'dad.sharma@okhdfcbank', role: 'Father' },
                { name: 'Brother', amount: 1500, color: 'from-emerald-500 to-teal-600', vpa: 'brother.sharma@okhdfcbank', role: 'Brother' },
                { name: 'Sister', amount: 2000, color: 'from-amber-500 to-orange-600', vpa: 'sister.sharma@okicici', role: 'Sister' }
              ].map((fam, idx) => (
                <div
                  key={idx}
                  onClick={() => handleQuickPayFamily({ name: fam.name, email: fam.vpa, vpa: fam.vpa }, fam.amount)}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 group"
                >
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${fam.color} flex items-center justify-center text-white font-black text-xs shadow-md`}
                  >
                    {fam.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {fam.name}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-mono">₹{fam.amount}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Goal Contributions */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" /> Goal Contributions
                </h3>
                <p className="text-xs text-slate-400">Directly fund your family goals with real-time progress update</p>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Custom Goal Top-Up
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.slice(0, 3).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{goal.emoji || '🎯'}</span>
                        <span className="text-xs font-bold text-white">{goal.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{pct}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                      <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setShowGoalModal(true);
                      }}
                      className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <IndianRupee className="w-3 h-3" /> Contribute ₹1,000
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Real-Time Transaction Passbook & Filters */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Transaction Passbook
                </h3>
                <p className="text-xs text-slate-400">
                  Instant, verified timeline of incoming, outgoing, and family money flows
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search recipient, note, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              {[
                { id: 'ALL', label: 'All Transactions' },
                { id: 'SENT', label: 'Money Sent' },
                { id: 'RECEIVED', label: 'Money Received' },
                { id: 'UPI', label: 'UPI Payments' },
                { id: 'FAMILY', label: 'Family' },
                { id: 'BILLS', label: 'Bills' },
                { id: 'GOALS', label: 'Goals' },
                { id: 'FAILED', label: 'Failed' },
                { id: 'PENDING', label: 'Pending' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    selectedFilter === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Transaction Items */}
            <div className="divide-y divide-slate-800/80">
              {upiTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <Receipt className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No transactions found matching your criteria.</p>
                </div>
              ) : (
                upiTransactions.map((tx) => (
                  <div
                    key={tx.transactionId}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-950/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${
                          tx.isCredit
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {tx.isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{tx.recipientName}</p>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              tx.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : tx.status === 'FAILED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : tx.status === 'REFUNDED'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                          <span>{tx.purpose}</span>
                          <span>•</span>
                          <span>{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span>•</span>
                          <span className="text-slate-500">{tx.transactionId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div
                          className={`text-sm font-black font-mono ${
                            tx.isCredit ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {tx.isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">UPI Instant</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedReceiptTx(tx)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                          title="View Tax Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        {tx.status === 'SUCCESS' && !tx.isCredit && (
                          <button
                            onClick={() => handleRefundTransaction(tx.transactionId)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs transition-colors"
                            title="Request Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ₹1 PREMIUM UPGRADE (EXISTING REVERIFIED FLOW)           */}
      {/* ============================================================== */}
      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B132B] to-[#050816] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block mb-2">
                  ₹1.00 INR • 365 Days Access • 100 Paise Verified
                </span>
                <h2 className="text-2xl font-black text-white">FinFam Premium Upgrade</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Unlock advanced financial simulation, what-if planning, multi-goal comparison, and exportable reports.
                  Payment is processed directly via Razorpay and cryptographically verified on the backend.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">One-Time Fee</span>
                <div className="text-4xl font-black text-emerald-400 font-mono">₹1.00</div>
                <span className="text-[10px] text-slate-500">Includes all applicable GST (18%)</span>
              </div>
            </div>

            {/* Features Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-6">
              {[
                'Save unlimited what-if retirement & loan scenarios',
                'Side-by-side resolution plan comparison',
                'Export audit-ready GST financial reports',
                'Multi-goal interference radar & priority analysis'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Payment Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              {userProfile.isPremium ? (
                <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Premium Active until {userProfile.premiumValidUntil}
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing || paymentFlowState === 'CHECKOUT_OPEN'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Pay ₹1 to Upgrade (Razorpay Checkout)
                    </>
                  )}
                </button>
              )}

              <button
                onClick={restorePurchases}
                className="text-xs text-slate-400 hover:text-white underline transition-colors"
              >
                Restore Purchases
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FAMILY TRANSFERS (P2P VS MERCHANT)                      */}
      {/* ============================================================== */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Family Money Transfers vs Merchant Collections
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              FinFam strictly differentiates merchant payments (which settle to our verified company bank account)
              from member-to-member transfers (which use our atomic double-entry virtual ledger or direct UPI intents).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Merchant Checkout
                </span>
                <p className="text-xs text-slate-400">
                  Used for ₹1 Premium Upgrades, subscription fees, and merchant partner bills. Powered by Razorpay.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Personal Family Transfers
                </span>
                <p className="text-xs text-slate-400">
                  Transfers to Mom, Dad, Brother, or Sister. Settle directly through FinFam Vault double-entry ledger or personal UPI IDs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RECEIPTS & AUDIT PASSBOOK                               */}
      {/* ============================================================== */}
      {activeTab === 3 && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" /> Digital Tax Receipts & Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  GST-compliant invoices, server verification logs, and printable receipts
                </p>
              </div>

              <a
                href={`/api/payments/receipt/${upiTransactions[0]?.transactionId || 'TXN_SAMPLE'}?print=1`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Latest Receipt
              </a>
            </div>

            <div className="divide-y divide-slate-800">
              {upiTransactions.slice(0, 10).map((tx) => (
                <div key={tx.transactionId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold">{tx.receiptNumber}</span>
                    <p className="text-slate-300 font-bold mt-0.5">{tx.recipientName}</p>
                    <span className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="font-mono font-bold text-white">₹{tx.amount.toFixed(2)}</span>
                    <a
                      href={`/api/payments/receipt/${tx.transactionId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                    >
                      View Invoice
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: SEND MONEY / PAY UPI ID                               */}
      {/* ============================================================== */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B132B] border border-cyan-500/40 p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Send Money via UPI</h3>
                  <p className="text-[10px] text-slate-400">Zero Gateway Surcharge • Instant Settlement</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendStep('INPUT');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sendStep === 'INPUT' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Recipient UPI ID (VPA)
                    </label>
                    {sendUpiId && sendUpiId.includes('@') && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Valid VPA
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. example@upi or swiggy@icici"
                    value={sendUpiId}
                    onChange={(e) => setSendUpiId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  
                  {/* Quick Bank Suffix Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500 font-semibold">Quick handles:</span>
                    {UPI_BANK_HANDLES.map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => handleApplyBankHandle(handle)}
                        className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>

                  {sendUpiId && !sendUpiId.includes('@') && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      Type username and tap a bank above or enter full VPA (e.g. example@upi)
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Recipient / Store Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Store, Mom, Landlord"
                    value={sendRecipientName}
                    onChange={(e) => setSendRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Amount (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Quick Amount Chips */}
                  <div className="flex items-center gap-2 mt-2">
                    {['250', '500', '750', '1000', '2500'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSendAmount(chip)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                          sendAmount === chip
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        ₹{chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Purpose & Category
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['Groceries', 'Food', 'Family', 'Bills', 'Shopping', 'Travel', 'Health', 'General'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSendCategory(cat);
                          setSendNote(cat);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                          sendCategory === cat
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Groceries, Weekly provisions"
                    value={sendNote}
                    onChange={(e) => setSendNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Optional Goal Link */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Link to Family Goal (Optional)
                  </label>
                  <select
                    value={sendSelectedGoalId}
                    onChange={(e) => setSendSelectedGoalId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">None (Standard UPI Payment)</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.emoji || '🎯'} {g.name} (Current: ₹{g.currentAmount} / Target: ₹{g.targetAmount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transfer Speed / Gateway Selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Payment Engine
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTransferMethod('VAULT')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        transferMethod === 'VAULT'
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold text-white">⚡ Instant Vault</span>
                      </div>
                      <p className="text-[9px] text-emerald-400/90 mt-0.5">Direct realtime debit</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransferMethod('GATEWAY')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        transferMethod === 'GATEWAY'
                          ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px] font-bold text-white">💳 UPI Gateway</span>
                      </div>
                      <p className="text-[9px] text-cyan-400/90 mt-0.5">Razorpay / UPI Intent</p>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSendStep('CONFIRM')}
                  disabled={!sendUpiId || !sendAmount || parseFloat(sendAmount) < 1.0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  Review Payment Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    You are transferring
                  </span>
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    ₹{parseFloat(sendAmount).toFixed(2)}
                  </div>
                  <p className="text-xs font-bold text-white pt-1">To: {sendRecipientName || sendUpiId.split('@')[0]}</p>
                  <span className="text-[11px] text-slate-400 font-mono">{sendUpiId}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Purpose</span>
                    <span className="text-slate-200 font-medium">{sendNote || sendCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-emerald-400 font-medium">{sendCategory}</span>
                  </div>
                  {sendSelectedGoalId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linked Goal</span>
                      <span className="text-purple-400 font-bold">
                        {goals.find((g) => g.id === Number(sendSelectedGoalId))?.name || 'Emergency Fund'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transfer Mode</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {transferMethod === 'VAULT' ? '⚡ Instant Real-Time Transfer' : '💳 Razorpay UPI Intent'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wallet Available</span>
                    <span className="text-slate-300 font-mono font-bold">₹{finfamWallet.availableBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surcharge Fee</span>
                    <span className="text-emerald-400 font-bold font-mono">₹0.00 (FREE)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSendStep('INPUT')}
                    className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteSendMoney}
                    disabled={isProcessing}
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transferring...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Transfer ₹{parseFloat(sendAmount).toFixed(2)} Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: REQUEST MONEY (LIVE UPI QR)                           */}
      {/* ============================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B132B] border border-emerald-500/40 p-6 shadow-2xl space-y-5 animate-scale-up text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Receive Money via UPI QR</h3>
                  <p className="text-[10px] text-slate-400">Scan using any UPI App (GPay, PhonePe, Paytm)</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-xl">
              {requestQrUrl ? (
                <img src={requestQrUrl} alt="UPI QR Code" className="w-56 h-56 mx-auto rounded-lg" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400">UPI ID:</span>
              <div className="font-mono text-xs font-bold text-cyan-400 flex items-center justify-center gap-2">
                priyan1436ei@okhdfcbank
                <button
                  onClick={() => handleCopy('priyan1436ei@okhdfcbank', 'req_vpa')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedText === 'req_vpa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Change Requested Amount */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Amount"
                />
              </div>

              <input
                type="text"
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                className="w-full flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Note"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopy(requestUpiUri, 'link')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedText === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === 'link' ? 'Copied!' : 'Copy Payment Link'}
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Pay ₹${requestAmount} to FinFam: ${requestUpiUri}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: SCAN & PAY (CAMERA QR SCANNER)                        */}
      {/* ============================================================== */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B132B] border border-purple-500/40 p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Scan & Pay</h3>
                  <p className="text-[10px] text-slate-400">Scan any merchant or personal UPI QR</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setShowScanModal(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Camera Scanner Viewport */}
            <div className="relative w-full h-64 rounded-2xl bg-black overflow-hidden border-2 border-dashed border-purple-500/50 flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              
              {/* Animated Scan Reticle */}
              <div className="absolute inset-8 border-2 border-cyan-400/80 rounded-2xl pointer-events-none">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-lg shadow-cyan-400" />
              </div>

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 p-4 space-y-2">
                  <Camera className="w-8 h-8 text-purple-400" />
                  <p className="text-xs">Camera preview unavailable in this browser session.</p>
                  <p className="text-[10px] text-slate-500">You can also paste UPI URI or pick sample below.</p>
                </div>
              )}
            </div>

            {/* Quick Demo QR Presets */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Test UPI QR Payloads:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Swiggy Merchant', vpa: 'swiggy@icici', amt: '420' },
                  { name: 'Electricity Bill', vpa: 'tneb@sbi', amt: '1850' },
                  { name: 'Brother', vpa: 'brother.sharma@okhdfcbank', amt: '1500' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      stopCamera();
                      setShowScanModal(false);
                      setSendUpiId(s.vpa);
                      setSendRecipientName(s.name);
                      setSendAmount(s.amt);
                      setSendStep('CONFIRM');
                      setShowSendModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-slate-800 transition-colors"
                  >
                    {s.name} (₹{s.amt})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: GOAL CONTRIBUTION                                     */}
      {/* ============================================================== */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0B132B] border border-purple-500/40 p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Contribute to Family Goal</h3>
                  <p className="text-[10px] text-slate-400">Directly funded via UPI with verified receipt</p>
                </div>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Goal</label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.emoji || '🎯'} {g.name} (Current: ₹{g.currentAmount} / Target: ₹{g.targetAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Contribution Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={goalContribAmount}
                    onChange={(e) => setGoalContribAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleExecuteGoalContribution}
                disabled={isProcessing || !goalContribAmount || parseFloat(goalContribAmount) < 1.0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-black shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Confirm Contribution (₹{goalContribAmount})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: OFFICIAL DIGITAL TAX RECEIPT (SECTION 10)             */}
      {/* ============================================================== */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B132B] border border-cyan-500/40 p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-wide">FINFAM PAYMENT RECEIPT</h3>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ✓ SUCCESSFUL
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Amount
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                ₹{selectedReceiptTx.amount.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-300 font-semibold">
                Paid To: <span className="text-white font-bold">{selectedReceiptTx.recipientName || 'ABC Store'}</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono">
                UPI ID: {selectedReceiptTx.recipientUpi || selectedReceiptTx.recipientUpiId || selectedReceiptTx.upiId || 'example@upi'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Purpose</span>
                <p className="font-semibold text-slate-200 truncate">{selectedReceiptTx.purpose || selectedReceiptTx.category || 'Groceries'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method</span>
                <p className="font-mono text-cyan-300 font-bold">UPI</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Date & Time</span>
                <p className="font-mono text-slate-200 font-medium text-[11px]">
                  {new Date(selectedReceiptTx.completedAt || selectedReceiptTx.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}{' • '}{new Date(selectedReceiptTx.completedAt || selectedReceiptTx.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">UPI Reference</span>
                <p className="font-mono text-slate-200 font-bold truncate">
                  {selectedReceiptTx.providerReference || selectedReceiptTx.paymentId || selectedReceiptTx.receiptNumber || 'XXXXXXXXXXXX'}
                </p>
              </div>
              <div className="col-span-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Transaction ID</span>
                <p className="font-mono text-cyan-300 font-bold text-xs truncate">{selectedReceiptTx.transactionId}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <a
                href={`/api/payments/receipt/${selectedReceiptTx.transactionId}?print=1`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Tax Receipt
              </a>
              <button
                type="button"
                onClick={() => handleShareReceipt(selectedReceiptTx)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Share Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptTx(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors border border-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: FINFAM TRANSACTION SCREEN (SECTION 3)                 */}
      {/* ============================================================== */}
      {successCelebrationTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#091124] border border-emerald-500/50 p-6 shadow-2xl space-y-5 animate-scale-up text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ✓ Payment Successful
              </span>
              <h2 className="text-3xl font-black text-white font-mono">
                ₹{successCelebrationTx.amount.toFixed(2)}
              </h2>
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-slate-300 font-semibold">
                  Paid to <span className="text-emerald-400 font-bold">{successCelebrationTx.recipientName || 'ABC Store'}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {successCelebrationTx.recipientUpi || successCelebrationTx.recipientUpiId || successCelebrationTx.upiId || 'example@upi'}
                </p>
              </div>
            </div>

            {/* Purpose & Date/Time Badge */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                {successCelebrationTx.purpose || successCelebrationTx.category || 'Groceries'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {new Date(successCelebrationTx.completedAt || successCelebrationTx.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}{' • '}{new Date(successCelebrationTx.completedAt || successCelebrationTx.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>

            {/* Goal Progress Card (if Goal Contribution) */}
            {(successCelebrationTx.type === 'GOAL_CONTRIBUTION' || successCelebrationTx.goalId) && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">
                    🎯 Goal Contribution
                  </span>
                  <span className="text-xs font-bold text-white">
                    {successCelebrationTx.goalName || 'Emergency Fund'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-purple-500/20">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Previous</span>
                    <span className="font-mono text-slate-300 font-bold">
                      ₹{Math.max(0, (goals.find((g) => g.id === successCelebrationTx.goalId)?.currentAmount || 20000) - successCelebrationTx.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-400 block">Contribution</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +₹{successCelebrationTx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-purple-300 block">Current</span>
                    <span className="font-mono text-white font-black">
                      ₹{(goals.find((g) => g.id === successCelebrationTx.goalId)?.currentAmount || 20750).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Family Spending Card (if Family Transfer) */}
            {(successCelebrationTx.type === 'FAMILY_TRANSFER' || successCelebrationTx.category === 'Family') && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-left space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Family Spending</span>
                  <span className="text-white font-mono font-bold">₹{successCelebrationTx.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category</span>
                  <span className="text-cyan-300 font-semibold">{successCelebrationTx.category || 'Groceries'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid By</span>
                  <span className="text-emerald-400 font-bold">{userProfile.name || 'Priyan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-slate-200 font-mono font-bold">UPI</span>
                </div>
              </div>
            )}

            {/* Transaction Details Ledger Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="text-cyan-300 font-mono font-bold truncate max-w-[200px]">{successCelebrationTx.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UPI Reference</span>
                <span className="text-slate-200 font-mono font-bold truncate max-w-[200px]">
                  {successCelebrationTx.providerReference || successCelebrationTx.paymentId || successCelebrationTx.receiptNumber || 'XXXXXXXXXXXX'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method</span>
                <span className="text-emerald-400 font-mono font-bold">UPI</span>
              </div>
            </div>

            {/* Section 3 Action Buttons: [ View Receipt ] and [ Share Receipt ] */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedReceiptTx(successCelebrationTx);
                  setSuccessCelebrationTx(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> View Receipt
              </button>
              <button
                type="button"
                onClick={() => handleShareReceipt(successCelebrationTx)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Share2 className="w-4 h-4 text-cyan-400" /> Share Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FLOATING REAL-TIME GATEWAY PROCESSING STATE BAR                */}
      {/* ============================================================== */}
      {paymentFlowState !== 'IDLE' && (
        <div className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-[#091124] border border-cyan-500/40 shadow-2xl flex items-center gap-3 animate-slide-up text-xs max-w-sm">
          {paymentFlowState === 'CREATING_ORDER' && (
            <>
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Creating Gateway Order...</p>
                <span className="text-[10px] text-slate-400">Validating transaction with bank</span>
              </div>
            </>
          )}
          {paymentFlowState === 'CHECKOUT_OPEN' && (
            <>
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Awaiting Authorization...</p>
                <span className="text-[10px] text-slate-400">Complete payment in Razorpay modal</span>
              </div>
            </>
          )}
          {paymentFlowState === 'AWAITING_CONFIRMATION' && (
            <>
              <ShieldCheck className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Verifying Cryptographic HMAC...</p>
                <span className="text-[10px] text-slate-400">Finalizing ledger attribution</span>
              </div>
            </>
          )}
          {paymentFlowState === 'VERIFIED' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Payment Confirmed!</p>
                <span className="text-[10px] text-emerald-400">Transaction recorded in passbook</span>
              </div>
            </>
          )}
          {paymentFlowState === 'CANCELLED' && (
            <>
              <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Payment Dismissed</p>
                <span className="text-[10px] text-slate-400">You can retry at any time</span>
              </div>
            </>
          )}
          {paymentFlowState === 'FAILED' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Payment Authorization Failed</p>
                <span className="text-[10px] text-red-400">{lastPaymentError || 'Please retry with another method'}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
