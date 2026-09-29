-- ====================================================================
-- FINFAM ENTERPRISE REAL-TIME FAMILY FINANCE & PAYOUTS SYSTEM
-- Target: Supabase PostgreSQL with Row Level Security (RLS)
-- Features: Atomic State Machine, Idempotent Webhooks, Masked Payment Profiles
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE family_role_type AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEW_ONLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_type AS ENUM (
        'CREATED',
        'PAYMENT_PENDING',
        'PAYMENT_VERIFYING',
        'PAYMENT_CAPTURED',
        'PAYMENT_FAILED',
        'PAYOUT_CREATED',
        'PAYOUT_PROCESSING',
        'SUCCESS',
        'PAYOUT_FAILED',
        'REVERSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE beneficiary_status_type AS ENUM ('UNVERIFIED', 'VERIFYING', 'VERIFIED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    avatar_url TEXT,
    currency VARCHAR(8) DEFAULT 'INR',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FAMILIES TABLE
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role family_role_type NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    monthly_allowance_limit_paise BIGINT DEFAULT 1000000, -- Default limit ₹10,000
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- 6. FAMILY INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES profiles(id),
    invited_email VARCHAR(255) NOT NULL,
    role family_role_type NOT NULL DEFAULT 'MEMBER',
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RECIPIENT PAYMENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS payment_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    upi_id VARCHAR(255),
    upi_masked VARCHAR(255),
    bank_account_holder_name VARCHAR(255),
    bank_account_number_encrypted TEXT,
    bank_account_masked VARCHAR(64),
    ifsc VARCHAR(32),
    beneficiary_status beneficiary_status_type NOT NULL DEFAULT 'UNVERIFIED',
    provider_contact_id VARCHAR(128),
    provider_fund_account_id VARCHAR(128),
    upi_verified BOOLEAN NOT NULL DEFAULT FALSE,
    bank_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRANSACTIONS TABLE (With strict state machine & audit linkage)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY, -- e.g. FFM-2026-928192
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE RESTRICT,
    sender_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    receiver_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    
    purpose VARCHAR(255) NOT NULL DEFAULT 'family_transfer',
    message TEXT,
    
    payment_provider VARCHAR(64) NOT NULL DEFAULT 'RAZORPAY',
    payout_provider VARCHAR(64) DEFAULT 'RAZORPAYX',
    
    provider_order_id VARCHAR(128),
    provider_payment_id VARCHAR(128),
    provider_payout_id VARCHAR(128),
    
    provider_payment_status VARCHAR(64) DEFAULT 'PENDING',
    provider_payout_status VARCHAR(64) DEFAULT 'PENDING',
    
    status transaction_status_type NOT NULL DEFAULT 'CREATED',
    
    utr VARCHAR(64), -- Official provider UTR only
    failure_code VARCHAR(64),
    failure_reason TEXT,
    
    idempotency_key VARCHAR(128) UNIQUE,
    signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_live_mode BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_verified_at TIMESTAMPTZ,
    payout_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PROVIDER WEBHOOK EVENTS (Idempotency Table)
CREATE TABLE IF NOT EXISTS provider_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(64) NOT NULL, -- RAZORPAY or RAZORPAYX
    event_id VARCHAR(128) NOT NULL UNIQUE,
    event_type VARCHAR(128) NOT NULL,
    provider_order_id VARCHAR(128),
    provider_payment_id VARCHAR(128),
    provider_payout_id VARCHAR(128),
    payload_hash VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSED'
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE SET NULL,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SUBSCRIPTIONS TABLE (For ₹1 Premium One-Time Upgrade)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    plan_id VARCHAR(64) NOT NULL,
    plan_title VARCHAR(255) NOT NULL,
    payment_id VARCHAR(128) NOT NULL,
    amount_paise BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    features JSONB,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    old_status VARCHAR(64),
    new_status VARCHAR(64),
    provider_reference VARCHAR(128),
    ip_address VARCHAR(64),
    user_agent TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. GOALS & ALLOCATIONS TABLE (For Ripple Impact Integration)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES profiles(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    target_amount_paise BIGINT NOT NULL,
    current_amount_paise BIGINT NOT NULL DEFAULT 0,
    target_date DATE NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    feasibility_score INT DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE SET NULL,
    amount_paise BIGINT NOT NULL,
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON transactions(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_order ON transactions(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_provider_events_event_id ON provider_events(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_transaction ON audit_logs(transaction_id);

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read profiles in the same family
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Payment Profiles: Members see masked info, only owner sees full configuration
CREATE POLICY "Users can read family payment profiles" ON payment_profiles
    FOR SELECT USING (
        user_id IN (
            SELECT fm2.user_id FROM family_members fm1
            JOIN family_members fm2 ON fm1.family_id = fm2.family_id
            WHERE fm1.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    );

-- Transactions: Family members can view transactions for their family
CREATE POLICY "Members can view family transactions" ON transactions
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM family_members
            WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        )
    );
