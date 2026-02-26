-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with full onboarding state
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    onboarding_step VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Full conversation memory
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rich CRM leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    business_name VARCHAR(255),
    service_interest TEXT,
    problem_statement TEXT,
    timeline VARCHAR(255),
    budget VARCHAR(100),
    meeting_requested BOOLEAN DEFAULT FALSE,
    meeting_time VARCHAR(255),
    deal_stage VARCHAR(50) DEFAULT 'new'
        CHECK (deal_stage IN ('new','discovery','qualified','proposal','negotiation','closed','lost')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(deal_stage);

-- ─── ALTER commands (run these if tables already exist) ───────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'new';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS problem_statement TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS meeting_time VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_stage VARCHAR(50) DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;

-- Reset any users with NULL onboarding state
UPDATE users SET onboarding_step = 'new', onboarding_complete = FALSE
WHERE onboarding_step IS NULL OR onboarding_complete IS NULL;
