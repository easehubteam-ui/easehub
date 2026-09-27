-- EaseHub InsForge PostgreSQL Migration Schema
-- Step 2 Foundation Setup

-- Enable PGCrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------
-- 1. USERS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'superadmin', 'vendor')),
    avatar_url TEXT,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for users
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 2. PGS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS pgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) DEFAULT 'PG',
    gender VARCHAR(20) DEFAULT 'BOYS' CHECK (gender IN ('BOYS', 'GIRLS', 'CO-ED')),
    room_type VARCHAR(100),
    price NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) DEFAULT 0,
    amenities TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    address VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revision', 'disabled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for pgs
CREATE TRIGGER set_pgs_updated_at
BEFORE UPDATE ON pgs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 3. MEAL PROVIDERS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS meal_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    images TEXT[] DEFAULT '{}',
    is_veg BOOLEAN DEFAULT true,
    meal_types TEXT[] DEFAULT '{}',
    daily_price NUMERIC(10, 2) DEFAULT 0,
    monthly_price NUMERIC(10, 2) DEFAULT 0,
    menu JSONB DEFAULT '{}'::jsonb,
    address VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revision', 'disabled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for meal_providers
CREATE TRIGGER set_meal_providers_updated_at
BEFORE UPDATE ON meal_providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 4. LAUNDRY PROVIDERS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS laundry_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image TEXT,
    images TEXT[] DEFAULT '{}',
    services JSONB DEFAULT '[]'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    pickup_available BOOLEAN DEFAULT true,
    delivery_available BOOLEAN DEFAULT true,
    pickup_radius VARCHAR(100) DEFAULT '5km',
    address VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revision', 'disabled')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for laundry_providers
CREATE TRIGGER set_laundry_providers_updated_at
BEFORE UPDATE ON laundry_providers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 5. SERVICES TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    image TEXT,
    images TEXT[] DEFAULT '{}',
    starting_price NUMERIC(10, 2) NOT NULL,
    pricing JSONB DEFAULT '{}'::jsonb,
    coverage_area VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for services
CREATE TRIGGER set_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 6. BOOKINGS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('PG', 'MEAL', 'LAUNDRY', 'SERVICE')),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED')),
    scheduled_date TIMESTAMPTZ NOT NULL,
    scheduled_time VARCHAR(50),
    address TEXT NOT NULL,
    notes TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for bookings
CREATE TRIGGER set_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 7. PAYMENTS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('qr', 'online')),
    status VARCHAR(50) DEFAULT 'VERIFICATION_PENDING' CHECK (status IN ('VERIFICATION_PENDING', 'VERIFIED', 'REJECTED', 'FAILED')),
    utr VARCHAR(255),
    screenshot_url TEXT,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for payments
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for notifications
CREATE TRIGGER set_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- 9. REVIEWS TABLE
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for reviews
CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------
-- INDEXES FOR OPTIMIZED QUERY PERFORMANCE
-- --------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_pgs_code ON pgs(code);
CREATE INDEX IF NOT EXISTS idx_pgs_status ON pgs(status);
CREATE INDEX IF NOT EXISTS idx_pgs_city ON pgs(city);

CREATE INDEX IF NOT EXISTS idx_meal_providers_code ON meal_providers(code);
CREATE INDEX IF NOT EXISTS idx_meal_providers_status ON meal_providers(status);
CREATE INDEX IF NOT EXISTS idx_meal_providers_city ON meal_providers(city);

CREATE INDEX IF NOT EXISTS idx_laundry_providers_code ON laundry_providers(code);
CREATE INDEX IF NOT EXISTS idx_laundry_providers_status ON laundry_providers(status);
CREATE INDEX IF NOT EXISTS idx_laundry_providers_city ON laundry_providers(city);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(booking_type);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- --------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users RLS Policies
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "Admins full access on users" ON users FOR ALL USING (is_admin());

-- Catalog Public Read RLS Policies
CREATE POLICY "Public read active PGs" ON pgs FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage PGs" ON pgs FOR ALL USING (is_admin());

CREATE POLICY "Public read active Meal Providers" ON meal_providers FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage Meal Providers" ON meal_providers FOR ALL USING (is_admin());

CREATE POLICY "Public read active Laundry Providers" ON laundry_providers FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage Laundry Providers" ON laundry_providers FOR ALL USING (is_admin());

CREATE POLICY "Public read active Services" ON services FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins manage Services" ON services FOR ALL USING (is_admin());

-- Bookings RLS Policies
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Admins manage bookings" ON bookings FOR ALL USING (is_admin());

-- Payments RLS Policies
CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Admins manage payments" ON payments FOR ALL USING (is_admin());

-- Notifications RLS Policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Admins manage notifications" ON notifications FOR ALL USING (is_admin());

-- Reviews RLS Policies
CREATE POLICY "Public read published reviews" ON reviews FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Users can insert own review" ON reviews FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Admins manage reviews" ON reviews FOR ALL USING (is_admin());

-- --------------------------------------------------
-- SEED INITIAL SUPERADMIN SYSTEM RECORD
-- --------------------------------------------------
INSERT INTO users (name, email, phone, role, is_active)
VALUES ('EaseHub SuperAdmin', 'admin@easehub.com', '9999999999', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;
