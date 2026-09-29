/**
 * FinFam Enterprise Payment & Payout Engine
 * Strict Transaction State Machine, Razorpay Gateway, RazorpayX Payouts,
 * Webhook Idempotency, Masked Payment Profiles, and Real-Time SSE Broadcast.
 */

const crypto = require('crypto');
const Razorpay = require('razorpay');

// Configuration
const PAYMENTS_MODE = (process.env.PAYMENTS_MODE || 'test').toLowerCase();
const ENABLE_REAL_MONEY_TRANSFERS = process.env.ENABLE_REAL_MONEY_TRANSFERS === 'true';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TNKQHoOkeQFUas';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'sOVxj3tP47Wpzsg2ig3vnOtb';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_sample_webhook_secret_abcde';

const RAZORPAYX_KEY_ID = process.env.RAZORPAYX_KEY_ID || '';
const RAZORPAYX_KEY_SECRET = process.env.RAZORPAYX_KEY_SECRET || '';
const RAZORPAYX_WEBHOOK_SECRET = process.env.RAZORPAYX_WEBHOOK_SECRET || 'whsec_sample_razorpayx_secret_1234';
const RAZORPAYX_ACCOUNT_NUMBER = process.env.RAZORPAYX_ACCOUNT_NUMBER || '';

// Razorpay SDK Instance
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Storage Collections
const transactions = new Map();
const paymentProfiles = new Map();
const providerEvents = new Map(); // Idempotency store for webhooks
const auditLogs = [];
const sseClients = new Set();

// Masking Utilities
function maskUpiId(upi) {
  if (!upi || typeof upi !== 'string') return 'N/A';
  const parts = upi.split('@');
  if (parts.length !== 2) return '******';
  const handle = parts[0];
  const domain = parts[1];
  if (handle.length <= 2) return `${handle[0]}*@${domain}`;
  const prefix = handle.substring(0, 2);
  return `${prefix}${'*'.repeat(Math.max(4, handle.length - 2))}@${domain}`;
}

function maskAccountNumber(acc) {
  if (!acc || typeof acc !== 'string') return 'XXXX XXXX 0000';
  const clean = acc.replace(/\s+/g, '');
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
}

// Seed Initial Verified Payment Profiles
const SEED_PROFILES = [
  {
    userId: 'user_priyanshu_sharma',
    email: 'priyan1436ei@gmail.com',
    displayName: 'Priyanshu Sharma',
    upiId: 'priyan1436ei@okhdfcbank',
    upiMasked: 'pr******@okhdfcbank',
    bankHolderName: 'Priyanshu Sharma',
    bankAccountNumber: '50100239120934',
    bankAccountMasked: 'XXXX XXXX 0934',
    ifsc: 'HDFC0000128',
    beneficiaryStatus: 'VERIFIED',
    upiVerified: true,
    bankVerified: true,
    providerContactId: 'cont_priyan_001',
    providerFundAccountId: 'fa_priyan_001',
    updatedAt: new Date().toISOString()
  },
  {
    userId: 'user_jayashree',
    email: 'jayashree@example.com',
    displayName: 'Jayashree',
    upiId: 'jayashree@okaxis',
    upiMasked: 'ja******@okaxis',
    bankHolderName: 'Jayashree Sharma',
    bankAccountNumber: '9180200384193241',
    bankAccountMasked: 'XXXX XXXX 3241',
    ifsc: 'UTIB0000456',
    beneficiaryStatus: 'VERIFIED',
    upiVerified: true,
    bankVerified: true,
    providerContactId: 'cont_jayashree_002',
    providerFundAccountId: 'fa_jayashree_002',
    updatedAt: new Date().toISOString()
  },
  {
    userId: 'user_priyadarshini',
    email: 'priyadarshini@example.com',
    displayName: 'Priyadarshini',
    upiId: 'priyadarshini@oksbi',
    upiMasked: 'pr******@oksbi',
    bankHolderName: 'Priyadarshini Sharma',
    bankAccountNumber: '2019384910385512',
    bankAccountMasked: 'XXXX XXXX 5512',
    ifsc: 'SBIN0001245',
    beneficiaryStatus: 'VERIFIED',
    upiVerified: true,
    bankVerified: true,
    providerContactId: 'cont_priya_003',
    providerFundAccountId: 'fa_priya_003',
    updatedAt: new Date().toISOString()
  },
  {
    userId: 'user_rajesh_sharma',
    email: 'rajesh.sharma@example.com',
    displayName: 'Rajesh Sharma (Parent)',
    upiId: 'rajesh.sharma@okicici',
    upiMasked: 'ra******@okicici',
    bankHolderName: 'Rajesh Sharma',
    bankAccountNumber: '00120158493019',
    bankAccountMasked: 'XXXX XXXX 3019',
    ifsc: 'ICIC0000012',
    beneficiaryStatus: 'VERIFIED',
    upiVerified: true,
    bankVerified: true,
    providerContactId: 'cont_rajesh_004',
    providerFundAccountId: 'fa_rajesh_004',
    updatedAt: new Date().toISOString()
  }
];

SEED_PROFILES.forEach((p) => {
  paymentProfiles.set(p.userId, p);
  paymentProfiles.set(p.email, p); // Map email as well for robust matching
});

// State Machine Validation Table
const VALID_TRANSITIONS = {
  CREATED: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['PAYMENT_VERIFYING', 'PAYMENT_FAILED'],
  PAYMENT_VERIFYING: ['PAYMENT_CAPTURED', 'PAYMENT_FAILED'],
  PAYMENT_CAPTURED: ['PAYOUT_CREATED', 'PAYOUT_PROCESSING', 'PAYOUT_FAILED', 'SUCCESS'],
  PAYOUT_CREATED: ['PAYOUT_PROCESSING', 'PAYOUT_FAILED'],
  PAYOUT_PROCESSING: ['SUCCESS', 'PAYOUT_FAILED', 'REVERSED'],
  PAYOUT_FAILED: ['PAYOUT_CREATED'], // Manual admin retry
  SUCCESS: [], // Terminal
  REVERSED: [] // Terminal
};

function isValidStateTransition(fromState, toState) {
  if (fromState === toState) return true;
  const allowed = VALID_TRANSITIONS[fromState];
  return allowed ? allowed.includes(toState) : false;
}

// Real-Time SSE Stream Handlers
function subscribeRealtimeTransactions(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);

  // Send initial snapshot of recent 25 transactions
  const recentList = Array.from(transactions.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 25);

  res.write(`event: snapshot\ndata: ${JSON.stringify({
    type: 'TRANSACTIONS_SNAPSHOT',
    count: recentList.length,
    transactions: recentList,
    serverMode: PAYMENTS_MODE,
    realPayoutsEnabled: ENABLE_REAL_MONEY_TRANSFERS && Boolean(RAZORPAYX_KEY_ID)
  })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
}

function broadcastTransactionUpdate(tx, eventType = 'TRANSACTION_UPDATED') {
  const payload = JSON.stringify({
    eventType,
    timestamp: new Date().toISOString(),
    transaction: tx
  });

  for (const client of sseClients) {
    try {
      client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

// Audit Log Recorder
function recordAuditLog({
  actorUserId,
  familyId,
  transactionId,
  action,
  oldStatus,
  newStatus,
  providerReference,
  ipAddress = '127.0.0.1',
  metadata = {}
}) {
  const logEntry = {
    id: `AUDIT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorUserId,
    familyId,
    transactionId,
    action,
    oldStatus: oldStatus || null,
    newStatus: newStatus || null,
    providerReference: providerReference || null,
    ipAddress,
    metadata,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(logEntry);
  if (auditLogs.length > 500) auditLogs.pop();
  return logEntry;
}

// Helper: Seed Default Successful History for Hackathon
function seedDefaultHistory() {
  if (transactions.size > 0) return;
  const now = Date.now();
  const tx1 = {
    id: 'FFM-2026-948102',
    familyId: 'fam_sharma_001',
    senderUserId: 'user_priyanshu_sharma',
    senderName: 'Priyanshu Sharma',
    receiverUserId: 'user_jayashree',
    receiverName: 'Jayashree',
    receiverMaskedDestination: 'ja******@okaxis',
    amountPaise: 10000,
    amountInr: 100.0,
    currency: 'INR',
    purpose: 'family_transfer',
    message: 'Dinner contribution',
    paymentProvider: 'RAZORPAY',
    payoutProvider: 'RAZORPAYX',
    providerOrderId: 'order_seed_demo_9481',
    providerPaymentId: 'pay_seed_demo_9481',
    providerPayoutId: 'pout_seed_demo_9481',
    providerPaymentStatus: 'CAPTURED',
    providerPayoutStatus: 'PROCESSED',
    status: 'SUCCESS',
    utr: 'UTR928374619283',
    isLiveMode: false,
    signatureVerified: true,
    createdAt: new Date(now - 3600000 * 3).toISOString(),
    paymentVerifiedAt: new Date(now - 3600000 * 3 + 12000).toISOString(),
    payoutStartedAt: new Date(now - 3600000 * 3 + 14000).toISOString(),
    completedAt: new Date(now - 3600000 * 3 + 24000).toISOString(),
    updatedAt: new Date(now - 3600000 * 3 + 24000).toISOString()
  };
  transactions.set(tx1.id, tx1);
}
seedDefaultHistory();

// Export Module Interface
module.exports = {
  PAYMENTS_MODE,
  ENABLE_REAL_MONEY_TRANSFERS,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  RAZORPAYX_KEY_ID,
  RAZORPAYX_KEY_SECRET,
  RAZORPAYX_WEBHOOK_SECRET,
  RAZORPAYX_ACCOUNT_NUMBER,
  razorpay,
  transactions,
  paymentProfiles,
  providerEvents,
  auditLogs,
  maskUpiId,
  maskAccountNumber,
  isValidStateTransition,
  subscribeRealtimeTransactions,
  broadcastTransactionUpdate,
  recordAuditLog
};
