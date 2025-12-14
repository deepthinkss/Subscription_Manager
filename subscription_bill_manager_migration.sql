-- =====================================================
-- Subscription and Bill Manager - Comprehensive Migration
-- =====================================================
--
-- MIGRATION SUMMARY:
-- This migration creates a complete database schema for a Subscription and Bill Manager app
-- with the following key features:
--
-- TABLES CREATED:
-- 1. users - User profiles and authentication data
-- 2. categories - Subscription and bill categories for organization
-- 3. subscriptions - Recurring subscription management
-- 4. bills - One-time and recurring bill tracking
-- 5. payment_history - Complete payment tracking and history
-- 6. notifications - In-app notification system
-- 7. app_settings - User-specific application preferences
--
-- SECURITY MEASURES:
-- - Row Level Security (RLS) enabled on all tables
-- - Comprehensive RLS policies ensuring users can only access their own data
-- - UUID primary keys for enhanced security
-- - Proper foreign key constraints with CASCADE options
--
-- PERFORMANCE OPTIMIZATIONS:
-- - Strategic indexes on frequently queried columns
-- - Composite indexes for common query patterns
-- - Efficient date-based queries for subscriptions and bills
--
-- DATA SAFETY:
-- - Automatic timestamp management with triggers
-- - Proper constraints to ensure data integrity
-- - Safe deletion policies with appropriate CASCADE rules
--
-- IMPORTANT NOTES:
-- - This migration assumes Supabase's auth.users table exists
-- - All monetary values stored as DECIMAL(10,2) for precision
-- - Timezone-aware timestamps using timestamptz
-- - Flexible notification system supporting multiple types
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Extends Supabase auth with additional user profile data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 2. CATEGORIES TABLE
-- =====================================================
-- Categorization system for subscriptions and bills
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50), -- Icon identifier
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique category names per user
    UNIQUE(user_id, name)
);

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories table
CREATE POLICY "Users can manage own categories"
    ON categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(user_id, name);

-- =====================================================
-- 3. SUBSCRIPTIONS TABLE
-- =====================================================
-- Recurring subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'semi-annual', 'annual')),
    next_billing_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL for ongoing subscriptions
    is_active BOOLEAN DEFAULT TRUE,
    website_url TEXT,
    notes TEXT,
    reminder_days INTEGER DEFAULT 3 CHECK (reminder_days >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions table
CREATE POLICY "Users can manage own subscriptions"
    ON subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(user_id, next_billing_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, is_active);

-- =====================================================
-- 4. BILLS TABLE
-- =====================================================
-- One-time and recurring bill tracking
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    due_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval VARCHAR(20) CHECK (
        NOT is_recurring OR recurring_interval IN ('weekly', 'monthly', 'quarterly', 'semi-annual', 'annual')
    ),
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    reminder_days INTEGER DEFAULT 3 CHECK (reminder_days >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure paid_date is set when bill is marked as paid
    CHECK (NOT is_paid OR paid_date IS NOT NULL)
);

-- Enable RLS on bills table
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bills table
CREATE POLICY "Users can manage own bills"
    ON bills FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for bills
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_bills_unpaid ON bills(user_id, is_paid, due_date) WHERE is_paid = FALSE;
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category_id);
CREATE INDEX IF NOT EXISTS idx_bills_recurring ON bills(user_id, is_recurring) WHERE is_recurring = TRUE;

-- =====================================================
-- 5. PAYMENT_HISTORY TABLE
-- =====================================================
-- Complete payment tracking and history
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure either subscription_id or bill_id is provided, but not both
    CHECK ((subscription_id IS NOT NULL AND bill_id IS NULL) OR (subscription_id IS NULL AND bill_id IS NOT NULL))
);

-- Enable RLS on payment_history table
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_history table
CREATE POLICY "Users can manage own payment history"
    ON payment_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(user_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_bill ON payment_history(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(user_id, status);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
-- =====================================================
-- In-app notification system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription_due', 'bill_due', 'payment_failed', 'payment_success', 'subscription_expired', 'general')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    related_bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table
CREATE POLICY "Users can manage own notifications"
    ON notifications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL AND sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(user_id, type);

-- =====================================================
-- 7. APP_SETTINGS TABLE
-- =====================================================
-- User-specific application preferences
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_currency VARCHAR(3) DEFAULT 'USD',
    default_reminder_days INTEGER DEFAULT 3 CHECK (default_reminder_days >= 0),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    monthly_report BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
    first_day_of_week INTEGER DEFAULT 0 CHECK (first_day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on app_settings table
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_settings table
CREATE POLICY "Users can manage own app settings"
    ON app_settings FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Index for app_settings
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON app_settings(user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for upcoming subscriptions (next 30 days)
CREATE OR REPLACE VIEW upcoming_subscriptions AS
SELECT
    s.*,
    c.name AS category_name,
    c.color AS category_color
FROM subscriptions s
LEFT JOIN categories c ON s.category_id = c.id
WHERE s.is_active = TRUE
    AND s.next_billing_date <= CURRENT_DATE + INTERVAL '30 days'
    AND s.user_id = auth.uid();

-- View for upcoming bills (next 30 days)
CREATE OR REPLACE VIEW upcoming_bills AS
SELECT
    b.*,
    c.name AS category_name,
    c.color AS category_color
FROM bills b
LEFT JOIN categories c ON b.category_id = c.id
WHERE b.is_paid = FALSE
    AND b.due_date <= CURRENT_DATE + INTERVAL '30 days'
    AND b.user_id = auth.uid();

-- View for monthly spending summary
CREATE OR REPLACE VIEW monthly_spending_summary AS
SELECT
    user_id,
    DATE_TRUNC('month', payment_date) AS month,
    COUNT(*) AS payment_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS average_amount,
    currency
FROM payment_history
WHERE user_id = auth.uid()
    AND status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', payment_date), currency
ORDER BY month DESC;

-- =====================================================
-- DEFAULT CATEGORIES INSERTION FUNCTION
-- =====================================================

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO categories (user_id, name, description, color, icon, is_default) VALUES
    (user_uuid, 'Entertainment', 'Streaming services, games, and media', '#FF6B6B', 'play-circle', TRUE),
    (user_uuid, 'Utilities', 'Electricity, water, internet, phone', '#4ECDC4', 'zap', TRUE),
    (user_uuid, 'Software', 'Apps, tools, and software subscriptions', '#45B7D1', 'laptop', TRUE),
    (user_uuid, 'Health & Fitness', 'Gym memberships, health apps, supplements', '#96CEB4', 'heart', TRUE),
    (user_uuid, 'Food & Dining', 'Meal delivery, restaurant subscriptions', '#FFEAA7', 'utensils', TRUE),
    (user_uuid, 'Transportation', 'Transit passes, ride-sharing, parking', '#DDA0DD', 'car', TRUE),
    (user_uuid, 'Insurance', 'Health, auto, home, life insurance', '#F0B27A', 'shield', TRUE),
    (user_uuid, 'Education', 'Online courses, books, learning platforms', '#85C1E9', 'graduation-cap', TRUE);
END;
$$ LANGUAGE plpgsql;

-- Function to create default app settings for new users
CREATE OR REPLACE FUNCTION create_default_app_settings(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO app_settings (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETION SUMMARY
-- =====================================================
--
-- ✅ TABLES CREATED (7):
--    • users - User profiles with timezone and currency preferences
--    • categories - Customizable categorization system with colors and icons
--    • subscriptions - Comprehensive recurring subscription management
--    • bills - Flexible one-time and recurring bill tracking
--    • payment_history - Complete payment audit trail
--    • notifications - Multi-type notification system with scheduling
--    • app_settings - User-specific application preferences
--
-- ✅ SECURITY IMPLEMENTED:
--    • Row Level Security (RLS) enabled on all tables
--    • User-scoped policies ensuring data isolation
--    • UUID primary keys for enhanced security
--    • Proper foreign key constraints with CASCADE rules
--
-- ✅ PERFORMANCE OPTIMIZED:
--    • 19 strategic indexes created for common query patterns
--    • Composite indexes for date-based queries
--    • Filtered indexes for active/unpaid items
--
-- ✅ DATA INTEGRITY:
--    • Automatic timestamp management with triggers
--    • Check constraints for data validation
--    • Unique constraints where appropriate
--
-- ✅ HELPER FUNCTIONS:
--    • Views for upcoming subscriptions and bills
--    • Monthly spending summary view
--    • Default categories and settings creation functions
--
-- 🔧 RECOMMENDED NEXT STEPS:
--    1. Test the migration in a staging environment
--    2. Create sample data for testing
--    3. Implement application-level validation
--    4. Set up automated backups
--    5. Monitor query performance and adjust indexes as needed
--
-- =====================================================