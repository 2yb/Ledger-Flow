-- ============================================================
-- Ledger Flow - Database Schema
-- PostgreSQL / Supabase
-- ============================================================

-- Remove existing tables when intentionally rebuilding locally.
-- Do NOT execute this section against a production database.
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;


-- ============================================================
-- Accounts
-- ============================================================

CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL
        CHECK (length(trim(name)) > 0),

    -- Money is stored as integer paise.
    -- Example: ₹100.50 = 10050
    balance BIGINT NOT NULL DEFAULT 0
        CHECK (balance >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- Transactions
-- ============================================================

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,

    account_id BIGINT NOT NULL,

    type VARCHAR(10) NOT NULL
        CHECK (type IN ('credit', 'debit')),

    -- Amount is stored in paise.
    amount BIGINT NOT NULL
        CHECK (amount > 0),

    description TEXT,

    reference_id VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT,

    -- A reference can only occur once for the same account.
    CONSTRAINT uq_transaction_account_reference
        UNIQUE (account_id, reference_id)
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_transactions_account_created
    ON transactions(account_id, created_at DESC);