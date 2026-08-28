-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- Production Database Schema for Supabase (PostgreSQL)
-- ================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLE DEFINITIONS
-- ================================================================

-- 1. DESIGNERS TABLE (Holds master credentials & security codes)
CREATE TABLE IF NOT EXISTS public.designers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(255) DEFAULT 'Luxury Residential & Commercial Interiors',
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CUSTOMER PROFILES (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- References auth.users(id) when email auth is enabled
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    role VARCHAR(50) DEFAULT 'customer',
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'residential', -- residential, commercial, interior, renovation
    status VARCHAR(50) DEFAULT 'planning',       -- planning, in_progress, completed, on_hold
    budget NUMERIC(14, 2) DEFAULT 0,
    paid_amount NUMERIC(14, 2) DEFAULT 0,
    location VARCHAR(255),
    start_date DATE,
    estimated_completion DATE,
    completion_percentage INT DEFAULT 0,
    floor_plan_url TEXT,
    site_photos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROJECT MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    completion_date DATE,
    order_index INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SITE DETAILS TABLE
CREATE TABLE IF NOT EXISTS public.site_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    site_address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    state VARCHAR(100) DEFAULT 'Karnataka',
    pincode VARCHAR(20),
    coordinates VARCHAR(100),
    land_area_sqft NUMERIC(10, 2),
    builtup_area_sqft NUMERIC(10, 2),
    approval_status VARCHAR(50) DEFAULT 'under_review', -- submitted, under_review, approved, action_required
    zoning VARCHAR(100) DEFAULT 'Residential (R1)',
    soil_test_status VARCHAR(50) DEFAULT 'pending',
    water_source VARCHAR(100) DEFAULT 'Municipal / Borewell',
    electricity_status VARCHAR(100) DEFAULT 'Connection Under Sanction',
    notes TEXT,
    site_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    consultation_type VARCHAR(100) DEFAULT 'initial', -- initial, site_visit, design_review, progress_update
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, rescheduled, completed, cancelled
    meeting_link TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PAYMENTS TABLE (Supports Direct Phone / UPI QR Payment & Stored Tax Bills)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed, under_verification
    payment_method VARCHAR(50) DEFAULT 'phone_upi', -- phone_upi, upi_qr, bank_transfer, cheque, cash
    utr_number VARCHAR(100),
    proof_url TEXT,
    receipt_number VARCHAR(100) UNIQUE,
    description TEXT,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. HIGHLIGHTED DESIGNS TABLE
CREATE TABLE IF NOT EXISTS public.highlighted_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- residential, commercial, interior, renovation
    description TEXT,
    image_url TEXT NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_designer_id ON public.profiles(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON public.projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON public.consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_designer_id ON public.consultations(designer_id);

-- ================================================================
-- AUTOMATED UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_designers_updated_at ON public.designers;
CREATE TRIGGER set_designers_updated_at BEFORE UPDATE ON public.designers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_site_details_updated_at ON public.site_details;
CREATE TRIGGER set_site_details_updated_at BEFORE UPDATE ON public.site_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_consultations_updated_at ON public.consultations;
CREATE TRIGGER set_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlighted_designs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to allow clean re-execution
DROP POLICY IF EXISTS "Public read highlighted designs" ON public.highlighted_designs;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public submit contact" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all access to designers" ON public.designers;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all access to project_milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Allow all access to site_details" ON public.site_details;
DROP POLICY IF EXISTS "Allow all access to consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow all access to payments" ON public.payments;
DROP POLICY IF EXISTS "Allow all access to contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow all access to highlighted_designs" ON public.highlighted_designs;

-- Public & Operational Policies
CREATE POLICY "Public read highlighted designs" ON public.highlighted_designs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all access to designers" ON public.designers FOR ALL USING (true);
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all access to project_milestones" ON public.project_milestones FOR ALL USING (true);
CREATE POLICY "Allow all access to site_details" ON public.site_details FOR ALL USING (true);
CREATE POLICY "Allow all access to consultations" ON public.consultations FOR ALL USING (true);
CREATE POLICY "Allow all access to payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all access to contact_messages" ON public.contact_messages FOR ALL USING (true);
CREATE POLICY "Allow all access to highlighted_designs" ON public.highlighted_designs FOR ALL USING (true);

-- ================================================================
-- ESSENTIAL SYSTEM INITIALIZATION (Master Designers & Codes Only)
-- ================================================================

-- Insert Master Designer Login Codes (Required for Designer Portal Login)
INSERT INTO public.designers (company_code, full_name, email, phone, specialization, bio)
VALUES 
    ('BAVI-DES-7890', 'Arun Bahubali', 'arun.designer@bavi.in', '+91 98450 12345', 'Principal Architect & Luxury Villa Specialist', 'Over 14 years shaping iconic architectural landmarks in Karnataka.'),
    ('BAVI-DES-1024', 'Ananya Hegde', 'ananya.interiors@bavi.in', '+91 98450 67890', 'Head of Visionary Interior Design', 'Specialist in contemporary Italian-minimalist and neo-classical interior concepts.')
ON CONFLICT (company_code) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    specialization = EXCLUDED.specialization;
