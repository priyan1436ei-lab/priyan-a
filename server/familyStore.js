/**
 * FinFam Family & Real-Time Membership Store
 * In-memory reactive store with atomic operations, cryptographic token hashing,
 * role-based access control, and SSE real-time broadcast pub/sub.
 */

const crypto = require('crypto');
const emailService = require('./emailService');

// State Maps
const families = new Map();
const familyMembers = new Map(); // familyId -> Array of members
const invitations = new Map(); // inviteId -> Invitation object
const familyActivities = new Map(); // familyId -> Array of activity events
const sseClients = new Map(); // familyId -> Set of express res objects

// Helper: Hash raw token with SHA-256
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

// Seed initial default family (Sharma Family)
const DEFAULT_FAMILY_ID = 'fam_sharma_001';
families.set(DEFAULT_FAMILY_ID, {
  id: DEFAULT_FAMILY_ID,
  name: 'Sharma Family Vault',
  photoUrl: null,
  ownerId: 'user_priyanshu_sharma',
  ownerEmail: 'priyan1436ei@gmail.com',
  ownerName: 'Priyanshu Sharma',
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString()
});

familyMembers.set(DEFAULT_FAMILY_ID, [
  {
    id: 'mem_priyanshu',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user_priyanshu_sharma',
    name: 'Priyanshu Sharma',
    email: 'priyan1436ei@gmail.com',
    role: 'Owner',
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    monthlyContribution: 26750,
    avatarColorHex: '#06B6D4'
  },
  {
    id: 'mem_jayashree',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user_jayashree',
    name: 'Jayashree',
    email: 'jayashree@example.com',
    role: 'Admin',
    joinedAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    monthlyContribution: 35000,
    avatarColorHex: '#8B5CF6'
  },
  {
    id: 'mem_priyadarshini',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user_priyadarshini',
    name: 'Priyadarshini',
    email: 'priyadarshini@example.com',
    role: 'Member',
    joinedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    monthlyContribution: 20000,
    avatarColorHex: '#F59E0B'
  },
  {
    id: 'mem_rajesh',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user_rajesh_sharma',
    name: 'Rajesh Sharma (Parent)',
    email: 'rajesh.sharma@example.com',
    role: 'Member',
    joinedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    monthlyContribution: 80000,
    avatarColorHex: '#10B981'
  },
  {
    id: 'mem_sunita',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user_sunita_sharma',
    name: 'Sunita Sharma',
    email: 'sunita.sharma@example.com',
    role: 'Member',
    joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    monthlyContribution: 45000,
    avatarColorHex: '#EC4899'
  }
]);

familyActivities.set(DEFAULT_FAMILY_ID, [
  {
    id: 'act_seed_1',
    familyId: DEFAULT_FAMILY_ID,
    type: 'FAMILY_CREATED',
    description: 'Priyanshu Sharma established the Sharma Family Vault workspace.',
    actorName: 'Priyanshu Sharma',
    timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'act_seed_2',
    familyId: DEFAULT_FAMILY_ID,
    type: 'MEMBER_JOINED',
    description: 'Rajesh Sharma joined the family workspace as Member.',
    actorName: 'Rajesh Sharma',
    timestamp: new Date(Date.now() - 86400000 * 25).toISOString()
  }
]);

/**
 * Register SSE client for a family
 */
function subscribeFamilyStream(familyId, res) {
  if (!sseClients.has(familyId)) {
    sseClients.set(familyId, new Set());
  }
  sseClients.get(familyId).add(res);

  // Send initial snapshot
  const snapshot = getFamilySnapshot(familyId);
  res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);

  res.on('close', () => {
    const clients = sseClients.get(familyId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(familyId);
      }
    }
  });
}

/**
 * Broadcast event to all SSE subscribers of a family
 */
function broadcastFamilyUpdate(familyId, eventType, data) {
  const clients = sseClients.get(familyId);
  if (!clients || clients.size === 0) return;

  const payload = JSON.stringify({
    eventType,
    timestamp: Date.now(),
    data
  });

  clients.forEach(client => {
    try {
      client.write(`event: ${eventType}\ndata: ${payload}\n\n`);
    } catch (err) {
      console.error('Error writing to SSE client:', err.message);
    }
  });
}

/**
 * Get full snapshot of a family
 */
function getFamilySnapshot(familyId) {
  const family = families.get(familyId);
  if (!family) return null;

  const members = familyMembers.get(familyId) || [];
  const activities = (familyActivities.get(familyId) || []).slice(0, 30);
  
  // Pending invitations for this family
  const pendingInvites = [];
  for (const inv of invitations.values()) {
    if (inv.familyId === familyId) {
      pendingInvites.push({
        id: inv.id,
        familyId: inv.familyId,
        intendedEmail: inv.intendedEmail,
        role: inv.role,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
        deliveryStatus: inv.deliveryStatus,
        deliveryError: inv.deliveryError,
        acceptanceStatus: inv.acceptanceStatus,
        acceptedUserId: inv.acceptedUserId,
        acceptedAt: inv.acceptedAt
      });
    }
  }

  return {
    family,
    members,
    pendingInvites,
    activities
  };
}

/**
 * Record a family activity event
 */
function addFamilyActivity(familyId, type, description, actorName) {
  if (!familyActivities.has(familyId)) {
    familyActivities.set(familyId, []);
  }

  const newEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId,
    type,
    description,
    actorName,
    timestamp: new Date().toISOString()
  };

  familyActivities.get(familyId).unshift(newEvent);
  broadcastFamilyUpdate(familyId, 'activity_added', newEvent);
  return newEvent;
}

/**
 * Creates a new family and sends invitation emails to the specified emails
 */
async function createFamilyWithInvitations({
  familyName,
  photoUrl = null,
  inviteEmails = [],
  ownerUserId,
  ownerEmail,
  ownerName,
  baseUrl = 'http://localhost:3000'
}) {
  if (!familyName || typeof familyName !== 'string' || !familyName.trim()) {
    throw new Error('Family name is required');
  }

  const cleanFamilyName = familyName.trim();
  const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();

  // Validate email formats and uniqueness
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmails = [];
  const seenEmails = new Set();

  for (const rawEmail of inviteEmails) {
    if (!rawEmail || typeof rawEmail !== 'string') continue;
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail) continue;

    if (!emailRegex.test(cleanEmail)) {
      throw new Error(`Invalid email format: "${cleanEmail}"`);
    }

    if (cleanEmail === normalizedOwnerEmail) {
      throw new Error(`Cannot invite the family creator's own account (${normalizedOwnerEmail})`);
    }

    if (seenEmails.has(cleanEmail)) {
      throw new Error(`Duplicate invitation email detected: "${cleanEmail}"`);
    }

    seenEmails.add(cleanEmail);
    validEmails.push(cleanEmail);
  }

  // Create Family
  const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newFamily = {
    id: familyId,
    name: cleanFamilyName,
    photoUrl,
    ownerId: ownerUserId,
    ownerEmail: normalizedOwnerEmail,
    ownerName: ownerName || 'Family Creator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  families.set(familyId, newFamily);

  // Assign Creator as Owner Member
  const ownerMember = {
    id: `mem_${Date.now()}`,
    familyId,
    userId: ownerUserId,
    name: ownerName || 'Family Creator',
    email: normalizedOwnerEmail,
    role: 'Owner',
    joinedAt: new Date().toISOString(),
    monthlyContribution: 0,
    avatarColorHex: '#06B6D4'
  };

  familyMembers.set(familyId, [ownerMember]);
  familyActivities.set(familyId, []);

  addFamilyActivity(
    familyId,
    'FAMILY_CREATED',
    `${ownerName} created the ${cleanFamilyName} family workspace.`,
    ownerName
  );

  // Create invitations and dispatch emails
  const createdInvitations = [];
  const inviteLinks = [];

  for (const email of validEmails) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiry

    const invitationRecord = {
      id: inviteId,
      familyId,
      familyName: cleanFamilyName,
      inviterUserId: ownerUserId,
      inviterName: ownerName,
      intendedEmail: email,
      role: 'Member',
      tokenHash,
      createdAt: new Date().toISOString(),
      expiresAt,
      deliveryStatus: 'PENDING',
      deliveryError: null,
      acceptanceStatus: 'PENDING',
      acceptedUserId: null,
      acceptedAt: null
    };

    invitations.set(inviteId, invitationRecord);

    const joinUrl = `${baseUrl}/?inviteToken=${rawToken}&inviteId=${inviteId}`;
    inviteLinks.push({
      email,
      inviteId,
      rawToken,
      joinUrl
    });

    // Send transactional email
    try {
      const emailResult = await emailService.sendFamilyInvitationEmail({
        intendedEmail: email,
        inviterName: ownerName,
        familyName: cleanFamilyName,
        joinUrl,
        expiresAt,
        invitationId: inviteId
      });

      if (emailResult.success) {
        invitationRecord.deliveryStatus = 'SENT';
      } else {
        invitationRecord.deliveryStatus = 'FAILED';
        invitationRecord.deliveryError = emailResult.error;
      }
    } catch (err) {
      invitationRecord.deliveryStatus = 'FAILED';
      invitationRecord.deliveryError = err.message;
    }

    createdInvitations.push(invitationRecord);
  }

  broadcastFamilyUpdate(familyId, 'family_created', { family: newFamily });

  return {
    success: true,
    family: newFamily,
    invitations: createdInvitations,
    inviteLinks
  };
}

/**
 * Resends a pending or failed invitation
 */
async function resendInvitation({ inviteId, requestingUserId, baseUrl = 'http://localhost:3000' }) {
  const invitation = invitations.get(inviteId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }

  const family = families.get(invitation.familyId);
  if (!family) {
    throw new Error('Associated family not found');
  }

  // Only Owner can resend invitations
  if (family.ownerId !== requestingUserId) {
    throw new Error('Only the family owner can resend invitations');
  }

  if (invitation.acceptanceStatus === 'ACCEPTED') {
    throw new Error('Invitation has already been accepted');
  }

  // Generate fresh token and extend expiry
  const newRawToken = crypto.randomBytes(32).toString('hex');
  invitation.tokenHash = hashToken(newRawToken);
  invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  invitation.acceptanceStatus = 'PENDING';

  const joinUrl = `${baseUrl}/?inviteToken=${newRawToken}&inviteId=${inviteId}`;

  const emailResult = await emailService.sendFamilyInvitationEmail({
    intendedEmail: invitation.intendedEmail,
    inviterName: invitation.inviterName,
    familyName: invitation.familyName,
    joinUrl,
    expiresAt: invitation.expiresAt,
    invitationId: inviteId
  });

  if (emailResult.success) {
    invitation.deliveryStatus = 'SENT';
    invitation.deliveryError = null;
  } else {
    invitation.deliveryStatus = 'FAILED';
    invitation.deliveryError = emailResult.error;
  }

  broadcastFamilyUpdate(invitation.familyId, 'invitation_updated', invitation);

  return {
    success: emailResult.success,
    invitation,
    joinUrl,
    error: emailResult.error
  };
}

/**
 * Revokes a pending invitation
 */
function revokeInvitation({ inviteId, requestingUserId }) {
  const invitation = invitations.get(inviteId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }

  const family = families.get(invitation.familyId);
  if (!family || family.ownerId !== requestingUserId) {
    throw new Error('Only the family owner can revoke invitations');
  }

  if (invitation.acceptanceStatus === 'ACCEPTED') {
    throw new Error('Cannot revoke an already accepted invitation');
  }

  invitation.acceptanceStatus = 'REVOKED';
  broadcastFamilyUpdate(invitation.familyId, 'invitation_revoked', { inviteId });

  return { success: true, invitation };
}

/**
 * Verifies an invitation token
 */
function verifyInvitationToken(rawToken, inviteId) {
  if (!rawToken || !inviteId) {
    return { valid: false, error: 'Missing invitation token or ID' };
  }

  const invitation = invitations.get(inviteId);
  if (!invitation) {
    return { valid: false, error: 'Invitation not found' };
  }

  const inputHash = hashToken(rawToken);
  if (inputHash !== invitation.tokenHash) {
    return { valid: false, error: 'Invalid or forged invitation token' };
  }

  // Check Expiry
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    invitation.acceptanceStatus = 'EXPIRED';
    return {
      valid: false,
      code: 'EXPIRED',
      error: 'This invitation has expired. Please ask the family owner to resend it.'
    };
  }

  // Check Status
  if (invitation.acceptanceStatus === 'REVOKED') {
    return {
      valid: false,
      code: 'REVOKED',
      error: 'This invitation was revoked by the family owner.'
    };
  }

  if (invitation.acceptanceStatus === 'ACCEPTED') {
    return {
      valid: false,
      code: 'ALREADY_USED',
      error: 'This invitation has already been accepted.'
    };
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      familyId: invitation.familyId,
      familyName: invitation.familyName,
      inviterName: invitation.inviterName,
      intendedEmail: invitation.intendedEmail,
      role: invitation.role,
      expiresAt: invitation.expiresAt
    }
  };
}

/**
 * Accepts an invitation and joins the family atomically
 * Enforces email matching between authenticated user and invitation!
 */
function acceptInvitation({ rawToken, inviteId, user }) {
  if (!user || !user.email) {
    throw new Error('Authenticated user profile with verified email is required');
  }

  const invitation = invitations.get(inviteId);
  if (!invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  const inputHash = hashToken(rawToken);
  if (inputHash !== invitation.tokenHash) {
    return { success: false, error: 'Invalid or forged invitation token' };
  }

  // Check Expiry
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    invitation.acceptanceStatus = 'EXPIRED';
    return {
      success: false,
      code: 'EXPIRED',
      error: 'This invitation has expired. Please ask the family owner to resend it.'
    };
  }

  // Check Revoked
  if (invitation.acceptanceStatus === 'REVOKED') {
    return {
      success: false,
      code: 'REVOKED',
      error: 'This invitation was revoked by the family owner.'
    };
  }

  const normalizedUserEmail = user.email.trim().toLowerCase();
  const normalizedIntendedEmail = invitation.intendedEmail.trim().toLowerCase();

  // CRITICAL REQUIREMENT: Require authenticated, verified email to match invited email
  if (normalizedUserEmail !== normalizedIntendedEmail) {
    return {
      success: false,
      code: 'EMAIL_MISMATCH',
      error: `Email mismatch: You are currently signed in as "${user.email}", but this invitation was sent to "${invitation.intendedEmail}".`,
      intendedEmail: invitation.intendedEmail,
      currentUserEmail: user.email
    };
  }

  const family = families.get(invitation.familyId);
  if (!family) {
    return { success: false, error: 'Associated family workspace does not exist' };
  }

  const members = familyMembers.get(invitation.familyId) || [];
  
  // Check if user is already a member
  const existingMember = members.find(m => m.userId === user.id || m.email.toLowerCase() === normalizedUserEmail);
  if (existingMember) {
    return {
      success: true,
      alreadyMember: true,
      family,
      member: existingMember,
      message: 'You are already a member of this family workspace.'
    };
  }

  // Check if already used by another party
  if (invitation.acceptanceStatus === 'ACCEPTED') {
    return {
      success: false,
      code: 'ALREADY_USED',
      error: 'This invitation has already been accepted.'
    };
  }

  // Atomically create membership
  const newMember = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    familyId: invitation.familyId,
    userId: user.id || `user_${Date.now()}`,
    name: user.name || normalizedUserEmail.split('@')[0],
    email: normalizedUserEmail,
    role: invitation.role || 'Member',
    joinedAt: new Date().toISOString(),
    monthlyContribution: 0,
    avatarColorHex: ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EC4899'][members.length % 5]
  };

  members.push(newMember);
  familyMembers.set(invitation.familyId, members);

  // Mark invitation accepted
  invitation.acceptanceStatus = 'ACCEPTED';
  invitation.acceptedUserId = newMember.userId;
  invitation.acceptedAt = new Date().toISOString();

  // Add activity event
  addFamilyActivity(
    invitation.familyId,
    'MEMBER_JOINED',
    `${newMember.name} accepted the invitation and joined the family workspace.`,
    newMember.name
  );

  // Broadcast real-time update
  broadcastFamilyUpdate(invitation.familyId, 'member_joined', {
    member: newMember,
    family
  });

  return {
    success: true,
    family,
    member: newMember,
    message: `Successfully joined ${family.name}!`
  };
}

/**
 * Removes a member from family
 * Enforces: Only Owner can remove members. Removed member loses access immediately.
 */
function removeFamilyMember({ familyId, memberId, requestingUserId }) {
  const family = families.get(familyId);
  if (!family) throw new Error('Family not found');

  if (family.ownerId !== requestingUserId) {
    throw new Error('Only the family owner can remove members');
  }

  const members = familyMembers.get(familyId) || [];
  const targetMember = members.find(m => m.id === memberId || m.userId === memberId);
  if (!targetMember) throw new Error('Member not found in this family');

  if (targetMember.role === 'Owner') {
    throw new Error('Family owner cannot be removed. Transfer ownership first.');
  }

  // Remove member
  const updatedMembers = members.filter(m => m.id !== targetMember.id);
  familyMembers.set(familyId, updatedMembers);

  addFamilyActivity(
    familyId,
    'MEMBER_REMOVED',
    `${targetMember.name} was removed from the family workspace by the owner.`,
    family.ownerName
  );

  broadcastFamilyUpdate(familyId, 'member_removed', {
    memberId: targetMember.id,
    userId: targetMember.userId
  });

  return { success: true, removedMember: targetMember };
}

/**
 * Member leaves the family
 */
function leaveFamily({ familyId, userId }) {
  const family = families.get(familyId);
  if (!family) throw new Error('Family not found');

  const members = familyMembers.get(familyId) || [];
  const member = members.find(m => m.userId === userId);
  if (!member) throw new Error('You are not a member of this family');

  if (member.role === 'Owner') {
    throw new Error('Family owner cannot leave. Transfer ownership to another member first.');
  }

  const updatedMembers = members.filter(m => m.userId !== userId);
  familyMembers.set(familyId, updatedMembers);

  addFamilyActivity(
    familyId,
    'MEMBER_LEFT',
    `${member.name} left the family workspace.`,
    member.name
  );

  broadcastFamilyUpdate(familyId, 'member_left', {
    memberId: member.id,
    userId
  });

  return { success: true, leftMember: member };
}

/**
 * Owner transfers ownership to another member
 */
function transferFamilyOwnership({ familyId, targetMemberId, requestingUserId }) {
  const family = families.get(familyId);
  if (!family) throw new Error('Family not found');

  if (family.ownerId !== requestingUserId) {
    throw new Error('Only the current family owner can transfer ownership');
  }

  const members = familyMembers.get(familyId) || [];
  const targetMember = members.find(m => m.id === targetMemberId || m.userId === targetMemberId);
  if (!targetMember) throw new Error('Target member not found in this family');

  const currentOwnerMember = members.find(m => m.userId === requestingUserId);
  if (currentOwnerMember) {
    currentOwnerMember.role = 'Member';
  }

  targetMember.role = 'Owner';
  family.ownerId = targetMember.userId;
  family.ownerEmail = targetMember.email;
  family.ownerName = targetMember.name;
  family.updatedAt = new Date().toISOString();

  addFamilyActivity(
    familyId,
    'OWNERSHIP_TRANSFERRED',
    `Ownership transferred to ${targetMember.name}.`,
    targetMember.name
  );

  broadcastFamilyUpdate(familyId, 'ownership_transferred', {
    family,
    newOwner: targetMember
  });

  return { success: true, family, newOwner: targetMember };
}

/**
 * Check if a user has access to a family
 */
function hasFamilyAccess(familyId, userId) {
  const members = familyMembers.get(familyId) || [];
  return members.some(m => m.userId === userId);
}

module.exports = {
  families,
  familyMembers,
  invitations,
  familyActivities,
  createFamilyWithInvitations,
  resendInvitation,
  revokeInvitation,
  verifyInvitationToken,
  acceptInvitation,
  removeFamilyMember,
  leaveFamily,
  transferFamilyOwnership,
  getFamilySnapshot,
  hasFamilyAccess,
  subscribeFamilyStream,
  broadcastFamilyUpdate,
  addFamilyActivity,
  hashToken
};
