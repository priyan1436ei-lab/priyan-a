/**
 * FinFam Transactional Email Service
 * Supports:
 * 1. Standard SMTP / Nodemailer (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * 2. Ethereal / Sandbox automated test accounts
 * 3. In-Memory Transactional Email Outbox / Inspection API (for automated testing and web preview)
 */

const nodemailer = require('nodemailer');

// In-memory outbox for inspection, test validation, and email preview
const sentEmailsOutbox = [];

let transporter = null;
let isTransporterReady = false;

async function initEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.verify();
      isTransporterReady = true;
      console.log('✅ SMTP Transporter connected:', process.env.SMTP_HOST);
      return;
    } catch (err) {
      console.warn('⚠️ SMTP connection failed, falling back to Sandbox Mode:', err.message);
    }
  }

  // Fallback to local sandbox transporter
  transporter = nodemailer.createTransport({
    jsonTransport: true
  });
  isTransporterReady = true;
  console.log('ℹ️ Email service initialized in Sandbox Mode (Emails recorded to internal outbox & previewable)');
}

initEmailTransporter().catch(console.error);

/**
 * Generates responsive FinFam branded HTML email for family invitations
 */
function generateInvitationHtml({
  inviterName,
  familyName,
  joinUrl,
  expiresAtFormatted,
  intendedEmail
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${familyName} on FinFam</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050816; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050816; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #0b1129; border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #0b1129 0%, #0d213f 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                  FIN<span style="color: #06b6d4;">FAM</span>
                </span>
                <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 999px; margin-left: 8px;">
                  Family Vault Invitation
                </span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${inviterName} invited you to join the <span style="color: #06b6d4;">${familyName}</span> workspace
              </h1>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Collaborate on shared household goals, recurring utility bills, and family financial health milestones in real time.
              </p>

              <!-- Join CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);">
                    <a href="${joinUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #050816; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                      Join Family Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Invitation Details Box -->
              <div style="background-color: #050816; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                  <strong style="color: #cbd5e1;">Invited Email:</strong> ${intendedEmail}
                </p>
                <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                  <strong style="color: #cbd5e1;">Workspace:</strong> ${familyName}
                </p>
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                  <strong style="color: #cbd5e1;">Expires:</strong> ${expiresAtFormatted}
                </p>
              </div>

              <!-- Permitted Sharing Disclaimer -->
              <div style="border-left: 3px solid #10b981; padding: 12px 16px; background-color: rgba(16, 185, 129, 0.08); border-radius: 0 8px 8px 0; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a7f3d0;">
                  <strong>Privacy Guarantee:</strong> Joining shares only explicitly permitted family information (such as shared goals and utility bills). Your personal bank balances, individual investments, and private expense entries remain strictly confidential.
                </p>
              </div>

              <p style="margin: 24px 0 0; font-size: 11px; color: #475569; line-height: 1.5;">
                If you were not expecting this invitation, you can safely ignore this email. You will only join after signing into your account and clicking "Accept & Join".
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #070c1e; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; 2026 FinFam Technologies Inc. • Enterprise Household Wealth Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Sends family invitation email
 * Returns { success: boolean, messageId?: string, error?: string, previewUrl?: string }
 */
async function sendFamilyInvitationEmail({
  intendedEmail,
  inviterName,
  familyName,
  joinUrl,
  expiresAt,
  invitationId
}) {
  const expiresAtFormatted = new Date(expiresAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Check for intentional simulated failure in test mode if requested
  if (process.env.SIMULATE_EMAIL_FAILURES === 'true' && intendedEmail.includes('fail')) {
    const errorMsg = 'Simulated SMTP connection timeout to mail server';
    console.error(`[EmailService] Simulated delivery failure for ${intendedEmail}:`, errorMsg);
    
    // Record failure in outbox
    sentEmailsOutbox.unshift({
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invitationId,
      to: intendedEmail,
      subject: `${inviterName} invited you to join ${familyName} on FinFam`,
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: errorMsg
    };
  }

  const html = generateInvitationHtml({
    inviterName,
    familyName,
    joinUrl,
    expiresAtFormatted,
    intendedEmail
  });

  const plainText = `${inviterName} invited you to join the ${familyName} workspace on FinFam.

Collaborate on shared goals and household bills.
Joining shares only permitted family information. Your personal accounts and private transactions remain confidential.

Open this link to accept the invitation:
${joinUrl}

This invitation expires on ${expiresAtFormatted}.
`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"FinFam Platform" <invitations@finfam.cloud>',
    to: intendedEmail,
    subject: `${inviterName} invited you to join ${familyName} on FinFam`,
    text: plainText,
    html: html
  };

  try {
    if (!transporter) {
      await initEmailTransporter();
    }

    const info = await transporter.sendMail(mailOptions);
    const messageId = info.messageId || `msg_${Date.now()}`;

    const record = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invitationId,
      to: intendedEmail,
      from: mailOptions.from,
      subject: mailOptions.subject,
      joinUrl,
      html,
      status: 'SENT',
      messageId,
      timestamp: new Date().toISOString()
    };

    sentEmailsOutbox.unshift(record);
    console.log(`[EmailService] ✉️ Invitation successfully dispatched to ${intendedEmail} (ID: ${invitationId})`);

    return {
      success: true,
      messageId,
      record
    };
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to dispatch email to ${intendedEmail}:`, error.message);

    sentEmailsOutbox.unshift({
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invitationId,
      to: intendedEmail,
      subject: mailOptions.subject,
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      error: error.message || 'Failed to dispatch email through configured provider'
    };
  }
}

function getOutbox() {
  return sentEmailsOutbox;
}

function getEmailById(id) {
  return sentEmailsOutbox.find(e => e.id === id || e.invitationId === id);
}

module.exports = {
  sendFamilyInvitationEmail,
  getOutbox,
  getEmailById,
  generateInvitationHtml
};
