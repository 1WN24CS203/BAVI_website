-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- ULTRA-SIMPLE DATABASE RESET SCHEMA (10 Core Tables Only)
-- 
-- Run this in Supabase SQL Editor.
-- Everything is simplified, readable, and debug-friendly in ~130 lines.
-- ================================================================

-- 1. CLEAN RESET
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.highlighted_designs CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.callback_requests CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.designers CASCADE;
DROP TABLE IF EXISTS public.designer_access_requests CASCADE;

-- Clean up any old phantom tables if they exist
DROP TABLE IF EXISTS public.equipment, public.safety_records, public.contractors, 
  public.quality_inspections, public.materials, public.site_details, 
  public.client_password_log, public.department_change_requests, 
  public.email_change_requests, public.access_permissions, public.activity_log, 
  public.stage_documents, public.client_requirements, public.project_stages, 
  public.departments CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ================================================================
-- THE 10 REAL TABLES (Exact match for every app query)
-- ================================================================

-- 1. CLIENT PROFILES (Auto-created when client registers or signs in)
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID UNIQUE,                         -- Maps to auth.users.id
    full_name     TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    address       TEXT,
    role          TEXT DEFAULT 'customer',             -- 'customer' or 'designer'
    client_code   TEXT,                                -- e.g. BAVI-CLI-1024
    password      TEXT,                                -- Designer-given or updated password
    designer_id   UUID,
    metadata      JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. DESIGNERS & ARCHITECTS (Staff credentials)
CREATE TABLE public.designers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code  TEXT UNIQUE NOT NULL,                -- e.g. BAVI-OWNER-ADMIN, BAVI-ARCH-001
    full_name     TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT,
    department    TEXT DEFAULT 'architecture',         -- architecture, construction, marketing, tech, admin
    role          TEXT DEFAULT 'designer',             -- owner, architect, engineer
    is_owner      BOOLEAN DEFAULT FALSE,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECTS (Stages, documents & SRS stored as clean JSON)
CREATE TABLE public.projects (
    id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id                    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id                    UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title                          TEXT NOT NULL,
    description                    TEXT,
    category                       TEXT DEFAULT 'residential',
    status                         TEXT DEFAULT 'planning', -- planning, in_progress, completed
    budget                         NUMERIC DEFAULT 0,
    paid_amount                    NUMERIC DEFAULT 0,
    location                       TEXT,
    client_name                    TEXT,
    client_phone                   TEXT,
    client_email                   TEXT,
    stages                         JSONB DEFAULT '[]'::jsonb,  -- All 6 stages with progress & documents
    milestones                     JSONB DEFAULT '[]'::jsonb,
    documents                      JSONB DEFAULT '[]'::jsonb,
    client_requirements            TEXT,                       -- Client plain-words brief
    client_requirements_plain_text TEXT,
    srs_content                    TEXT,                       -- Architect generated SRS
    srs_status                     TEXT DEFAULT 'draft',       -- draft, review, approved
    completion_percentage          INT DEFAULT 0,
    progress                       INT DEFAULT 0,
    created_at                     TIMESTAMPTZ DEFAULT now()
);

-- 4. CALLBACK REQUESTS (Gated client onboarding)
CREATE TABLE public.callback_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL,
    email         TEXT,
    is_client     BOOLEAN DEFAULT FALSE,
    client_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject       TEXT DEFAULT 'Project Consultation Inquiry',
    message       TEXT,
    priority      TEXT DEFAULT 'medium',
    status        TEXT DEFAULT 'new',                  -- 'new', 'contacted' (attended), 'completed'
    assigned_to_name TEXT,
    contacted_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 5. CONSULTATIONS (Site visits & video meetings)
CREATE TABLE public.consultations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name     TEXT,
    customer_email    TEXT,
    customer_phone    TEXT,
    consultation_type TEXT DEFAULT 'Design Review',
    preferred_date    DATE NOT NULL,
    preferred_time    TEXT NOT NULL,
    location          TEXT DEFAULT 'On-Site Indiranagar Plot',
    meeting_link      TEXT,
    notes             TEXT,
    status            TEXT DEFAULT 'pending',          -- pending, confirmed, completed
    created_at        TIMESTAMPTZ DEFAULT now()
);

-- 6. PAYMENTS (Milestone bills & UPI payment receipts)
CREATE TABLE public.payments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount        NUMERIC NOT NULL,
    currency      TEXT DEFAULT 'INR',
    description   TEXT,
    notes         TEXT,
    payment_method TEXT DEFAULT 'Phone / UPI Transfer',
    utr_number    TEXT,
    receipt_number TEXT UNIQUE,
    status        TEXT DEFAULT 'pending',              -- pending, completed, due
    paid_at       TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 7. REVIEWS (Client ratings & feedback)
CREATE TABLE public.reviews (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name TEXT,
    author_name   TEXT,
    rating        INT DEFAULT 5,
    title         TEXT,
    comment       TEXT,
    review_text   TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 8. HIGHLIGHTED DESIGNS (Public portfolio showcase)
CREATE TABLE public.highlighted_designs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    category      TEXT DEFAULT 'interior',
    description   TEXT,
    image_url     TEXT NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    is_featured   BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 9. CONTACT MESSAGES (Public landing page contact form)
CREATE TABLE public.contact_messages (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    subject       TEXT,
    message       TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- 10. DESIGNER ACCESS REQUESTS (Staff registration)
CREATE TABLE public.designer_access_requests (
    id            TEXT PRIMARY KEY,
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL,
    phone         TEXT,
    department    TEXT DEFAULT 'architecture',
    status        TEXT DEFAULT 'PENDING',
    requested_at  TIMESTAMPTZ DEFAULT now()
);


-- ================================================================
-- AUTH TRIGGER: AUTO-CREATE PROFILE ON SUPABASE SIGNUP
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ================================================================
-- ROW LEVEL SECURITY (Permissive for simple frontend access)
-- ================================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles', 'designers', 'projects', 'callback_requests',
    'consultations', 'payments', 'reviews', 'highlighted_designs',
    'contact_messages', 'designer_access_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Allow all %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


-- ================================================================
-- SEED OWNER ADMIN ACCOUNT & SAMPLE SHOWCASE PORTFOLIO
-- ================================================================
INSERT INTO public.designers (company_code, full_name, email, role, department, is_owner, is_active)
VALUES ('BAVI-OWNER-ADMIN', 'BAVI Principal Owner', 'owner@bavi.in', 'owner', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.highlighted_designs (title, category, description, image_url, is_active, display_order)
VALUES 
  ('The Monarch Penthouse', 'interior', 'Italian Statuario marble with smart brass mood lighting', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', TRUE, 1),
  ('Prestige Villa Serenity', 'residential', 'Modern minimalist tropical villa architecture in Indiranagar', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', TRUE, 2),
  ('Aura Wellness Studio', 'commercial', 'Acoustic oak panelling and serene biophilic interior layout', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', TRUE, 3);
