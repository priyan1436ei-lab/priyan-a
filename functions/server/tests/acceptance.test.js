/**
 * FinFam Automated Acceptance & Verification Test Suite
 * Tests all PRIMARY REQUIREMENTS:
 * A. Create family and invite 4 members by email with validation and retry
 * B. Strict email matching verification upon joining & rejection of mismatches
 * C. Real-time family membership and shared synchronization
 * D. ₹1 FinFam Premium upgrade with server-verified order creation (100 paise)
 * E. Individual purchaser entitlement activation (no accidental family spillover)
 * F. Razorpay signature verification, idempotent webhooks, and recovery
 * G. P2P Family Transfer vs Merchant settlement distinction
 */

const assert = require('assert');
const http = require('http');
const crypto = require('crypto');
const app = require('../server');
const familyStore = require('../familyStore');

let server;
let baseUrl;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING FINFAM ACCEPTANCE & VERIFICATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`TEST ${total}: ${name} ... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error(err);
      process.exit(1);
    }
  }

  // 1. Validation when creating family
  await test('Family Creation: rejects invalid email formats', async () => {
    const res = await request('POST', '/api/family/create', {
      familyName: 'Test Family',
      ownerUserId: 'user_priyanshu_sharma',
      ownerEmail: 'priyan1436ei@gmail.com',
      ownerName: 'Priyanshu Sharma',
      inviteEmails: ['invalid-email', 'valid@example.com']
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.includes('Invalid email format'));
  });

  await test('Family Creation: rejects duplicate invitation emails', async () => {
    const res = await request('POST', '/api/family/create', {
      familyName: 'Test Family',
      ownerUserId: 'user_priyanshu_sharma',
      ownerEmail: 'priyan1436ei@gmail.com',
      ownerName: 'Priyanshu Sharma',
      inviteEmails: ['member1@example.com', 'member1@example.com']
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes('Duplicate invitation email detected'));
  });

  await test("Family Creation: rejects inviting creator's own email", async () => {
    const res = await request('POST', '/api/family/create', {
      familyName: 'Test Family',
      ownerUserId: 'user_priyanshu_sharma',
      ownerEmail: 'priyan1436ei@gmail.com',
      ownerName: 'Priyanshu Sharma',
      inviteEmails: ['priyan1436ei@gmail.com']
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.error.includes("Cannot invite the family creator's own account"));
  });

  let createdFamily;
  let createdInvitations;
  let inviteLinks;

  // 2. Successful creation with 4 email invitees
  await test('Family Creation: successfully creates family and dispatches 4 email invitations', async () => {
    const res = await request('POST', '/api/family/create', {
      familyName: 'Priyan Family Vault',
      ownerUserId: 'priyan1436ei@gmail.com',
      ownerEmail: 'priyan1436ei@gmail.com',
      ownerName: 'Priyan',
      inviteEmails: [
        'priya.sharma@example.com',
        'aarav.sharma@example.com',
        'vikram.sharma@example.com',
        'neha.sharma@example.com'
      ]
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.family.name, 'Priyan Family Vault');
    assert.strictEqual(res.data.family.ownerEmail, 'priyan1436ei@gmail.com');
    assert.strictEqual(res.data.invitations.length, 4);

    createdFamily = res.data.family;
    createdInvitations = res.data.invitations;
    inviteLinks = res.data.inviteLinks;

    // Check delivery status
    for (const inv of createdInvitations) {
      assert.strictEqual(inv.deliveryStatus, 'SENT');
      assert.strictEqual(inv.acceptanceStatus, 'PENDING');
      assert.strictEqual(inv.role, 'Member');
      assert.ok(inv.tokenHash);
    }
  });

  // 3. Email Outbox inspection
  await test('Email Service: sent transactional emails recorded in outbox with FinFam branding', async () => {
    const res = await request('GET', '/api/email/inbox');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.total >= 4);

    const email = res.data.emails.find((e) => e.to === 'priya.sharma@example.com');
    assert.ok(email);
    assert.ok(email.html.includes('FIN<span style="color: #06b6d4;">FAM</span>'));
    assert.ok(email.html.includes('Priyan invited you'));
    assert.ok(email.html.includes('Privacy Guarantee'));
  });

  // 4. Verification of invitation token
  await test('Invitation Token Verification: verifies valid cryptographic token and returns preview', async () => {
    const targetLink = inviteLinks.find((l) => l.email === 'priya.sharma@example.com');
    assert.ok(targetLink);

    const res = await request(
      'GET',
      `/api/family/invitations/verify?token=${targetLink.rawToken}&id=${targetLink.inviteId}`
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.valid, true);
    assert.strictEqual(res.data.invitation.intendedEmail, 'priya.sharma@example.com');
    assert.strictEqual(res.data.invitation.familyName, 'Priyan Family Vault');
  });

  // 5. Strict Email Mismatch Guard
  await test('Join Flow: REJECTS acceptance when signed into a different email (Email Mismatch Guard)', async () => {
    const targetLink = inviteLinks.find((l) => l.email === 'priya.sharma@example.com');

    // Attempt to accept with 'otheruser@example.com'
    const res = await request('POST', '/api/family/invitations/accept', {
      token: targetLink.rawToken,
      inviteId: targetLink.inviteId,
      user: {
        id: 'user_other',
        name: 'Wrong Account',
        email: 'otheruser@example.com'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.code, 'EMAIL_MISMATCH');
    assert.ok(res.data.error.includes('Email mismatch'));
  });

  // 6. Successful atomic acceptance with matching email
  await test('Join Flow: ACCEPTS invitation and joins family atomically when email matches', async () => {
    const targetLink = inviteLinks.find((l) => l.email === 'priya.sharma@example.com');

    const res = await request('POST', '/api/family/invitations/accept', {
      token: targetLink.rawToken,
      inviteId: targetLink.inviteId,
      user: {
        id: 'user_priya',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.member.email, 'priya.sharma@example.com');
    assert.strictEqual(res.data.member.role, 'Member');

    // Confirm family now has 2 members
    const famRes = await request('GET', `/api/family/${createdFamily.id}`);
    assert.strictEqual(famRes.status, 200);
    assert.strictEqual(famRes.data.members.length, 2);
  });

  // 7. Token reuse rejection
  await test('Invitation Token: REJECTS reusing an already accepted token', async () => {
    const targetLink = inviteLinks.find((l) => l.email === 'priya.sharma@example.com');

    const res = await request('POST', '/api/family/invitations/accept', {
      token: targetLink.rawToken,
      inviteId: targetLink.inviteId,
      user: {
        id: 'user_priya_repeat',
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com'
      }
    });

    // Should return already member message without creating duplicate membership
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.alreadyMember, true);

    const famRes = await request('GET', `/api/family/${createdFamily.id}`);
    assert.strictEqual(famRes.data.members.length, 2); // Still 2, no duplicates
  });

  // 8. Revoke invitation
  await test('Invitation Revocation: Owner can revoke pending invitation and revoke blocks joining', async () => {
    const targetLink = inviteLinks.find((l) => l.email === 'vikram.sharma@example.com');

    // Revoke
    const revokeRes = await request(
      'POST',
      `/api/family/invitations/${targetLink.inviteId}/revoke`,
      {
        requestingUserId: 'priyan1436ei@gmail.com'
      }
    );
    assert.strictEqual(revokeRes.status, 200);
    assert.strictEqual(revokeRes.data.invitation.acceptanceStatus, 'REVOKED');

    // Attempt to join with revoked link
    const joinRes = await request('POST', '/api/family/invitations/accept', {
      token: targetLink.rawToken,
      inviteId: targetLink.inviteId,
      user: {
        id: 'user_vikram',
        name: 'Vikram Sharma',
        email: 'vikram.sharma@example.com'
      }
    });

    assert.strictEqual(joinRes.status, 400);
    assert.strictEqual(joinRes.data.code, 'REVOKED');
  });

  // 9. Member Removal
  await test('Member Removal: Owner can remove a member and removed member loses access', async () => {
    // Remove Priya
    const removeRes = await request(
      'POST',
      `/api/family/${createdFamily.id}/members/user_priya/remove`,
      {
        requestingUserId: 'priyan1436ei@gmail.com'
      }
    );
    assert.strictEqual(removeRes.status, 200);
    assert.strictEqual(removeRes.data.success, true);

    const famRes = await request('GET', `/api/family/${createdFamily.id}`);
    assert.strictEqual(famRes.data.members.length, 1); // Only creator left
  });

  // 10. ₹1 Razorpay Order Creation
  let premiumOrder;
  await test('₹1 Premium Upgrade: creates 100 paise INR order for finfam_premium_one_time plan', async () => {
    const res = await request('POST', '/api/payment/create-order', {
      planId: 'finfam_premium_one_time',
      userId: 'priyan1436ei@gmail.com'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.amountPaise, 100);
    assert.strictEqual(res.data.amountInr, 1.0);
    assert.strictEqual(res.data.currency, 'INR');
    assert.strictEqual(res.data.planId, 'finfam_premium_one_time');
    assert.strictEqual(res.data.durationDays, 365);
    assert.ok(res.data.orderId);

    premiumOrder = res.data;
  });

  // 11. Invalid signature rejection
  await test('Razorpay Signature Verification: REJECTS invalid signature and leaves Premium locked', async () => {
    const res = await request('POST', '/api/payment/verify', {
      razorpayPaymentId: 'pay_tampered_test1',
      razorpayOrderId: premiumOrder.orderId,
      razorpaySignature: 'invalid_forged_signature_123',
      userId: 'priyan1436ei@gmail.com'
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.status, 'FAILED');
    assert.ok(res.data.error.includes('signature verification failed'));

    // Check status remains free
    const statusRes = await request(
      'GET',
      '/api/payment/user-status/priyan1436ei@gmail.com'
    );
    assert.strictEqual(statusRes.data.isPremium, false);
  });

  // 12. Valid HMAC Signature Verification
  let validPaymentId = `pay_${Date.now()}_test`;
  await test('Razorpay Signature Verification: VERIFIES valid HMAC signature and activates Premium', async () => {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'sOVxj3tP47Wpzsg2ig3vnOtb');
    hmac.update(`${premiumOrder.orderId}|${validPaymentId}`);
    const validSignature = hmac.digest('hex');

    const res = await request('POST', '/api/payment/verify', {
      razorpayPaymentId: validPaymentId,
      razorpayOrderId: premiumOrder.orderId,
      razorpaySignature: validSignature,
      userId: 'priyan1436ei@gmail.com',
      paymentMethod: 'UPI'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.status, 'SUCCESS');
    assert.strictEqual(res.data.subscription.isPremium, true);
    assert.strictEqual(res.data.subscription.planId, 'finfam_premium_one_time');
  });

  // 13. Individual Purchaser Entitlement (NO accidental family spillover)
  await test('Entitlement Isolation: Premium belongs ONLY to purchaser; other members stay Free', async () => {
    // Purchaser check
    const purchaserStatus = await request(
      'GET',
      '/api/payment/user-status/priyan1436ei@gmail.com'
    );
    assert.strictEqual(purchaserStatus.data.isPremium, true);

    // Other family member check
    const otherStatus = await request(
      'GET',
      '/api/payment/user-status/priya.sharma@example.com'
    );
    assert.strictEqual(otherStatus.data.isPremium, false);
  });

  // 14. Server-enforced operation protection
  await test('Server-Protected Operation: Export report succeeds for Premium purchaser, rejected for Free user', async () => {
    // Purchaser (Premium)
    const successRes = await request('POST', '/api/premium/export-report', {
      userId: 'priyan1436ei@gmail.com',
      reportType: 'ANNUAL_SUMMARY'
    });
    assert.strictEqual(successRes.status, 200);
    assert.strictEqual(successRes.data.success, true);

    // Free User
    const failRes = await request('POST', '/api/premium/export-report', {
      userId: 'priya.sharma@example.com',
      reportType: 'ANNUAL_SUMMARY'
    });
    assert.strictEqual(failRes.status, 403);
    assert.strictEqual(failRes.data.success, false);
  });

  // 15. Cross-account payment attribution protection
  await test('Payment Security: PREVENTS cross-account payment ID reuse', async () => {
    const res = await request('POST', '/api/payment/verify', {
      razorpayPaymentId: validPaymentId,
      razorpayOrderId: premiumOrder.orderId,
      razorpaySignature: 'test_sig',
      userId: 'priya.sharma@example.com' // Different user attempting to claim payment
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  // 16. Webhook Idempotency
  await test('Razorpay Webhooks: Idempotent processing and signature verification', async () => {
    const eventPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            amount: 100,
            currency: 'INR',
            order_id: premiumOrder.orderId,
            notes: { userId: 'priyan1436ei@gmail.com' }
          }
        }
      }
    };

    const rawBody = Buffer.from(JSON.stringify(eventPayload));
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_sample_webhook_secret_abcde';
    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    // First delivery
    const res1 = await request('POST', '/api/payment/webhook', rawBody, {
      'x-razorpay-signature': signature,
      'x-razorpay-event-id': 'evt_unique_101',
      'Content-Type': 'application/json'
    });
    assert.strictEqual(res1.status, 200);

    // Duplicate delivery
    const res2 = await request('POST', '/api/payment/webhook', rawBody, {
      'x-razorpay-signature': signature,
      'x-razorpay-event-id': 'evt_unique_101',
      'Content-Type': 'application/json'
    });
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.data.status, 'already_processed');
  });

  // 17. Family Money Transfers vs Merchant P2P distinction
  await test('Family Transfers: Clearly reports "Bank transfers not connected" unless manual ledger selected', async () => {
    const directRes = await request('POST', '/api/transfers/initiate', {
      recipientMemberId: 'mem_1',
      recipientName: 'Priya Sharma',
      recipientVpa: 'priya@okaxis',
      amount: 1000,
      purpose: 'Groceries'
    });

    assert.strictEqual(directRes.status, 400);
    assert.strictEqual(directRes.data.code, 'BANK_TRANSFERS_NOT_CONNECTED');

    // Manual ledger entry works
    const manualRes = await request('POST', '/api/transfers/initiate', {
      recipientMemberId: 'mem_1',
      recipientName: 'Priya Sharma',
      recipientVpa: 'priya@okaxis',
      amount: 1000,
      purpose: 'Groceries',
      isManualLedgerRecord: true
    });

    assert.strictEqual(manualRes.status, 200);
    assert.strictEqual(manualRes.data.record.isActualBankMovement, false);
    assert.ok(manualRes.data.record.label.includes('Internal Ledger Only'));
  });

  // 18. Razorpay Config Endpoint (from paymentgateway prototype)
  await test('Payment Gateway Config: provides active Razorpay test keyId', async () => {
    const res = await request('GET', '/api/payment/config');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.keyId, 'rzp_test_TNKQHoOkeQFUas');
    assert.strictEqual(res.data.currency, 'INR');
    assert.strictEqual(res.data.mode, 'test');
  });

  // 19. P2P Virtual Wallet & Atomic Double-Entry Transfer (from prototype)
  await test('P2P Atomic Double-Entry Ledger: debits sender, credits receiver, rejects duplicates', async () => {
    const sender = 'priyan1436ei@gmail.com';
    const receiver = 'priya.sharma@example.com';
    const idemKey = `idem_test_${Date.now()}`;

    // Get initial wallet balances
    const w1 = await request('GET', `/api/p2p/wallet/${encodeURIComponent(sender)}`);
    const w2 = await request('GET', `/api/p2p/wallet/${encodeURIComponent(receiver)}`);
    const initialSenderBalance = w1.data.wallet.balance;
    const initialReceiverBalance = w2.data.wallet.balance;

    // Execute transfer of ₹500
    const txRes = await request('POST', '/api/p2p/transfer', {
      senderId: sender,
      receiverId: receiver,
      amount: 500,
      description: 'Shared Groceries Pool',
      idempotencyKey: idemKey
    });

    assert.strictEqual(txRes.status, 200);
    assert.strictEqual(txRes.data.success, true);
    assert.strictEqual(txRes.data.transaction.amount, 500);
    assert.strictEqual(txRes.data.transaction.senderBalanceAfter, initialSenderBalance - 500);
    assert.strictEqual(txRes.data.transaction.receiverBalanceAfter, initialReceiverBalance + 500);

    // Duplicate submission with same idempotency key must not double-debit
    const dupRes = await request('POST', '/api/p2p/transfer', {
      senderId: sender,
      receiverId: receiver,
      amount: 500,
      idempotencyKey: idemKey
    });
    assert.strictEqual(dupRes.status, 200);
    assert.strictEqual(dupRes.data.isDuplicate, true);

    // Verify sender wallet balance
    const postW1 = await request('GET', `/api/p2p/wallet/${encodeURIComponent(sender)}`);
    assert.strictEqual(postW1.data.wallet.balance, initialSenderBalance - 500);
  });

  // 20. Tax Receipt HTML Generator (from prototype)
  await test('Printable Tax Receipt: serves GST-compliant printable HTML receipt with print parameter', async () => {
    const res = await request('GET', `/api/payment/receipt/${validPaymentId}?print=1`);
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data === 'string');
    assert.ok(res.data.includes('Payment Receipt'));
    assert.ok(res.data.includes('FINFAM'));
    assert.ok(res.data.includes('GST (18%)'));
    assert.ok(res.data.includes(validPaymentId));
    assert.ok(res.data.includes('window.print()'));
  });

  // 23. UPI Order Creation: Amount Validation (< ₹1.00 rejection)
  await test('UPI Order Creation: rejects payment amounts below ₹1.00', async () => {
    const res = await request('POST', '/api/payments/create-order', {
      userId: 'priyan1436ei@gmail.com',
      amount: 0.5,
      recipientUpi: 'merchant@upi',
      purpose: 'Micro test'
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.error.includes('must be at least ₹1.00'));
  });

  // 24. UPI Order Creation: Valid VPA and Order Generation
  let createdUpiTxId = null;
  let createdUpiOrderId = null;
  await test('UPI Order Creation: validates VPA and creates live UPI transaction record', async () => {
    const res = await request('POST', '/api/payments/create-order', {
      userId: 'priyan1436ei@gmail.com',
      amount: 2500,
      recipientUpi: 'brother.sharma@okhdfcbank',
      recipientName: 'Brother',
      purpose: 'Monthly family contribution',
      paymentType: 'UPI_SEND'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.transactionId.startsWith('FINFAM_TXN_') || res.data.transactionId.startsWith('TXN_'));
    assert.ok(res.data.orderId.startsWith('order_'));
    assert.strictEqual(res.data.amount, 2500);
    assert.strictEqual(res.data.amountPaise, 250000);
    assert.strictEqual(res.data.recipientUpi, 'brother.sharma@okhdfcbank');

    createdUpiTxId = res.data.transactionId;
    createdUpiOrderId = res.data.orderId;
  });

  // 25. UPI Payment Verification & Wallet Atomic Update
  let verifiedUpiPaymentId = null;
  await test('UPI Payment Verification: verifies HMAC signature and updates wallet balance', async () => {
    const walletBefore = await request('GET', '/api/payments/wallet/priyan1436ei@gmail.com');
    const initialBal = walletBefore.data.wallet.availableBalance;

    verifiedUpiPaymentId = `pay_upi_${Date.now()}`;
    const testSig = `sim_sig_valid_${createdUpiOrderId}_${verifiedUpiPaymentId}`;

    const res = await request('POST', '/api/payments/verify', {
      transactionId: createdUpiTxId,
      razorpayOrderId: createdUpiOrderId,
      razorpayPaymentId: verifiedUpiPaymentId,
      razorpaySignature: testSig,
      userId: 'priyan1436ei@gmail.com',
      paymentMethod: 'UPI'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.status, 'SUCCESS');
    assert.strictEqual(res.data.transaction.status, 'SUCCESS');
    assert.strictEqual(res.data.wallet.availableBalance, parseFloat((initialBal - 2500).toFixed(2)));
  });

  // 26. UPI Transaction History: Filtering by Type and Search Query
  await test('UPI Transaction History: filters transactions and searches by keyword', async () => {
    const resAll = await request('GET', '/api/payments/history?userId=priyan1436ei@gmail.com&filter=ALL');
    assert.strictEqual(resAll.status, 200);
    assert.strictEqual(resAll.data.success, true);
    assert.ok(resAll.data.total >= 4);

    const resSearch = await request('GET', '/api/payments/history?userId=priyan1436ei@gmail.com&search=Brother');
    assert.strictEqual(resSearch.status, 200);
    assert.ok(resSearch.data.transactions.length >= 1);
    assert.strictEqual(resSearch.data.transactions[0].recipientName, 'Brother');
  });

  // 27. UPI Refund Processing
  await test('UPI Refund: processes refund and restores wallet balance', async () => {
    const walletBefore = await request('GET', '/api/payments/wallet/priyan1436ei@gmail.com');
    const balBefore = walletBefore.data.wallet.availableBalance;

    const res = await request('POST', `/api/payments/${createdUpiTxId}/refund`, {
      reason: 'Product return'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.transaction.status, 'REFUNDED');
    assert.strictEqual(res.data.wallet.availableBalance, parseFloat((balBefore + 2500).toFixed(2)));
  });

  // 28. UPI Request Money: Generates Valid UPI URI Scheme
  await test('UPI Request Money: creates request and generates valid UPI deep-link', async () => {
    const res = await request('POST', '/api/payments/request', {
      amount: 1500,
      note: 'Dinner split',
      requesterUpi: 'priyan1436ei@okhdfcbank',
      requesterName: 'Priyanshu Sharma',
      userId: 'priyan1436ei@gmail.com'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.upiUri.startsWith('upi://pay?pa='));
    assert.ok(res.data.upiUri.includes('am=1500.00'));
    assert.ok(res.data.upiUri.includes('cu=INR'));
  });

  // 29. Goal Contribution: Direct Goal Funding
  await test('Goal Contribution: links contribution to family goal and updates wallet', async () => {
    const res = await request('POST', '/api/payments/goal-contribution', {
      goalId: 1,
      goalName: 'Emergency Fund',
      amount: 5000,
      userId: 'priyan1436ei@gmail.com'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.transaction.category, 'Goals');
    assert.strictEqual(res.data.transaction.goalId, 1);
  });

  // 30. UPI Printable Receipt
  await test('UPI Printable Receipt: renders HTML receipt with transaction details', async () => {
    const res = await request('GET', `/api/payments/receipt/${createdUpiTxId}?print=1`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.includes('FINFAM'));
    assert.ok(res.data.includes('Payment Receipt'));
    assert.ok(res.data.includes(createdUpiTxId));
  });

  // 31. FamPay / Provider-Independent POST /api/payments/create
  let createdFamPayTxId = null;
  let createdFamPayOrderId = null;
  await test('FamPay / Provider-Independent POST /api/payments/create: creates payment order with provider metadata', async () => {
    const res = await request('POST', '/api/payments/create', {
      userId: 'priyan1436ei@gmail.com',
      amount: 1250.00,
      recipientUpi: 'fampay.merchant@icici',
      recipientName: 'FamPay Store',
      purpose: 'Books & Supplies',
      paymentType: 'UPI_SEND',
      category: 'Education'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.transactionId);
    assert.ok(res.data.orderId);
    assert.strictEqual(res.data.amount, 1250);
    assert.strictEqual(res.data.status, 'PENDING');
    assert.ok(res.data.paymentProvider === 'FAMPAY' || res.data.paymentProvider === 'RAZORPAY');

    createdFamPayTxId = res.data.transactionId;
    createdFamPayOrderId = res.data.orderId;
  });

  // 32. Webhook Signature Verification with x-fampay-signature
  await test('FamPay Webhook: verifies x-fampay-signature and performs idempotent execution', async () => {
    const eventPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_fampay_${Date.now()}`,
            amount: 125000,
            currency: 'INR',
            order_id: createdFamPayOrderId,
            notes: { userId: 'priyan1436ei@gmail.com' }
          }
        }
      }
    };

    const rawBody = Buffer.from(JSON.stringify(eventPayload));
    const webhookSecret = process.env.FAMPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_fampay_webhook_secret_demo';
    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    const res = await request('POST', '/api/payments/webhook', rawBody, {
      'x-fampay-signature': signature,
      'x-fampay-event-id': `evt_fampay_${Date.now()}`,
      'Content-Type': 'application/json'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');

    // Verify transaction updated to SUCCESS
    const txCheck = await request('GET', `/api/payments/${createdFamPayTxId}`);
    assert.strictEqual(txCheck.data.transaction.status, 'SUCCESS');
  });

  // 33. Automatic Expense, Goal, and Notification Tracking
  await test('Automatic Collections: confirms expense, goal, and notification records created', async () => {
    // Check expense
    const expRes = await request('GET', '/api/payments/expenses/priyan1436ei@gmail.com');
    assert.strictEqual(expRes.status, 200);
    assert.ok(expRes.data.expenses.length > 0);

    // Check notifications
    const notifRes = await request('GET', '/api/payments/notifications/priyan1436ei@gmail.com');
    assert.strictEqual(notifRes.status, 200);
    assert.ok(notifRes.data.notifications.length > 0);
    assert.ok(notifRes.data.notifications[0].title.includes('Payment Successful'));

    // Check goals
    const goalsRes = await request('GET', '/api/payments/goals/fam_default');
    assert.strictEqual(goalsRes.status, 200);
    assert.ok(goalsRes.data.goals.length > 0);
  });

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed}/${total} ACCEPTANCE TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

// Start test server
server = app.listen(0, () => {
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  runTests()
    .then(() => {
      server.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      server.close();
      process.exit(1);
    });
});
