-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- Master Database Schema (Supabase PostgreSQL)
-- 
-- 100% SAFE & NON-DESTRUCTIVE:
-- - Safe for FRESH databases (creates all tables from scratch)
-- - Safe for EXISTING databases (uses IF NOT EXISTS & safe column migration)
-- - Zero data loss: Never drops existing tables or columns
-- 
-- ARCHITECTURE DOMAINS (5 Simple Groups):
--   1. Identity & Auth (departments, designers, profiles, access_requests)
--   2. Project Engine   (projects, stages, documents, requirements)
--   3. Client Concierge (callbacks, consultations, payments, reviews, password_log)
--   4. Site Operations  (site_details, materials, contractors, inspections, safety, equipment)
--   5. System Audit     (activity_log, permissions, change_requests, portfolio)
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1: Enable Required Extensions
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ----------------------------------------------------------------
-- DOMAIN 1: IDENTITY, ORG STRUCTURE & ACCESS CONTROL
-- ----------------------------------------------------------------

-- 1.1 Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) UNIQUE NOT NULL, -- architecture, construction, marketing, tech, admin
    display_name      VARCHAR(255) NOT NULL,
    description       TEXT,
    is_custom         BOOLEAN DEFAULT FALSE,
    created_by        VARCHAR(255),
    requested_by_dept VARCHAR(100),
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.2 Designers & Staff Members
CREATE TABLE IF NOT EXISTS public.designers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code      VARCHAR(50) UNIQUE NOT NULL,
    full_name         VARCHAR(255) NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    phone             VARCHAR(50),
    department        VARCHAR(100) DEFAULT 'architecture',
    department_id     UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    role              VARCHAR(50) DEFAULT 'designer', -- owner, architect, engineer, marketer, designer, manager
    permissions       JSONB DEFAULT '{}'::jsonb,
    specialization    VARCHAR(255) DEFAULT 'Luxury Residential & Commercial Architecture',
    council_reg_no    VARCHAR(100),
    bio               TEXT,
    avatar_url        TEXT,
    status            VARCHAR(50) DEFAULT 'ACTIVE',
    via_request       BOOLEAN DEFAULT FALSE,
    password_hash     TEXT,
    is_active         BOOLEAN DEFAULT TRUE,
    is_owner          BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.3 Client Profiles (Synchronized with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE,
    full_name         VARCHAR(255) NOT NULL,
    email             VARCHAR(255) UNIQUE NOT NULL,
    phone             VARCHAR(50),
    address           TEXT,
    role              VARCHAR(50) DEFAULT 'customer',
    designer_id       UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    avatar_url        TEXT,
    metadata          JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.4 Designer Registration & Access Requests
CREATE TABLE IF NOT EXISTS public.designer_access_requests (
    id                TEXT PRIMARY KEY,
    full_name         VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    password_hash     TEXT,
    phone             VARCHAR(50),
    specialization    VARCHAR(255) DEFAULT 'Luxury Villa Architect',
    council_reg_no    VARCHAR(100),
    bio               TEXT,
    department        VARCHAR(100) DEFAULT 'architecture',
    requested_role    VARCHAR(50) DEFAULT 'designer',
    is_owner_request  BOOLEAN DEFAULT FALSE,
    keyless_disabled  BOOLEAN DEFAULT FALSE,
    status            VARCHAR(50) DEFAULT 'PENDING',
    generated_code    VARCHAR(100),
    submitted_to      VARCHAR(255),
    requested_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at       TIMESTAMP WITH TIME ZONE,
    approved_by       VARCHAR(255),
    rejection_reason  TEXT
);


-- ----------------------------------------------------------------
-- DOMAIN 2: PROJECT & CONSTRUCTION STAGES ENGINE
-- ----------------------------------------------------------------

-- 2.1 Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id                    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id                    UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title                          VARCHAR(255) NOT NULL,
    description                    TEXT,
    category                       VARCHAR(100) DEFAULT 'residential',
    status                         VARCHAR(50) DEFAULT 'planning',
    budget                         NUMERIC(14, 2) DEFAULT 0,
    paid_amount                    NUMERIC(14, 2) DEFAULT 0,
    location                       VARCHAR(255),
    
    -- Client Contact Snapshot
    client_name                    VARCHAR(255),
    client_phone                   VARCHAR(50),
    client_email                   VARCHAR(255),
    
    -- Fast JSON Storage for Stages, Milestones & SRS (Zero complex joins)
    stages                         JSONB DEFAULT '[]'::jsonb,
    milestones                     JSONB DEFAULT '[]'::jsonb,
    client_requirements            TEXT,
    client_requirements_plain_text TEXT,
    srs_content                    TEXT,
    srs_status                     VARCHAR(50) DEFAULT 'draft', -- draft, review, approved
    completion_percentage          INT DEFAULT 0,
    progress                       INT DEFAULT 0,
    
    start_date                     DATE,
    estimated_end_date             DATE,
    created_at                     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at                     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Relational Project Stages (For relational workflows if needed)
CREATE TABLE IF NOT EXISTS public.project_stages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_number      INT NOT NULL,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    status            VARCHAR(50) DEFAULT 'pending',
    progress          INT DEFAULT 0,
    builder_approved  BOOLEAN DEFAULT FALSE,
    client_approved   BOOLEAN DEFAULT FALSE,
    queries           JSONB DEFAULT '[]'::jsonb,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 Stage Documents & Blueprints
CREATE TABLE IF NOT EXISTS public.stage_documents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id          UUID REFERENCES public.project_stages(id) ON DELETE CASCADE,
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    file_name         VARCHAR(255) NOT NULL,
    file_type         VARCHAR(100),
    file_url          TEXT,
    file_data         TEXT, -- Base64 storage fallback
    file_size         BIGINT,
    uploaded_by       VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Client Requirements Table (Backward compatibility)
CREATE TABLE IF NOT EXISTS public.client_requirements (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_text          TEXT NOT NULL,
    structured_srs    JSONB DEFAULT '{}'::jsonb,
    status            VARCHAR(50) DEFAULT 'pending_review',
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ----------------------------------------------------------------
-- DOMAIN 3: CLIENT CONCIERGE & FINANCIAL ESCROW
-- ----------------------------------------------------------------

-- 3.1 Callback Requests (Gated Client Onboarding)
CREATE TABLE IF NOT EXISTS public.callback_requests (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,
    phone             VARCHAR(50) NOT NULL,
    email             VARCHAR(255),
    is_client         BOOLEAN DEFAULT FALSE,
    client_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject           VARCHAR(255) DEFAULT 'General Consultation Inquiry',
    message           TEXT,
    status            VARCHAR(50) DEFAULT 'new', -- new, contacted/attended, completed/resolved
    assigned_to       UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    assigned_to_name  VARCHAR(255),
    priority          VARCHAR(20) DEFAULT 'medium',
    contacted_at      TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 Scheduled Consultations & Site Walkthroughs
CREATE TABLE IF NOT EXISTS public.consultations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_name     VARCHAR(255),
    customer_email    VARCHAR(255),
    customer_phone    VARCHAR(50),
    designer_id       UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    consultation_type VARCHAR(100) DEFAULT 'design_review',
    preferred_date    DATE NOT NULL,
    preferred_time    VARCHAR(50) NOT NULL,
    notes             TEXT,
    status            VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    location          VARCHAR(255) DEFAULT 'On-Site Indiranagar Plot',
    meeting_link      TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.3 Payments & Billing Milestone Escrow
CREATE TABLE IF NOT EXISTS public.payments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount            NUMERIC(14, 2) NOT NULL,
    milestone_id      UUID REFERENCES public.project_stages(id) ON DELETE SET NULL,
    description       TEXT,
    payment_method    VARCHAR(50) DEFAULT 'upi',
    utr_number        VARCHAR(100),
    receipt_number    VARCHAR(100) UNIQUE,
    status            VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    due_date          DATE,
    paid_at           TIMESTAMP WITH TIME ZONE,
    notes             TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.4 Client Reviews & Ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    customer_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating            INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title             VARCHAR(255),
    comment           TEXT,
    author_name       VARCHAR(255),
    is_published      BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.5 Contact Messages (Public Showcase Site)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    phone             VARCHAR(50),
    subject           VARCHAR(255),
    message           TEXT NOT NULL,
    status            VARCHAR(50) DEFAULT 'unread',
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.6 Client Password Change Audit Log
CREATE TABLE IF NOT EXISTS public.client_password_log (
    id                TEXT PRIMARY KEY,
    client_id         TEXT,
    client_code       VARCHAR(100),
    client_name       VARCHAR(255) NOT NULL,
    client_email      VARCHAR(255) NOT NULL,
    reason            TEXT,
    status            VARCHAR(50) DEFAULT 'APPLIED',
    submitted_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    designer_notified BOOLEAN DEFAULT TRUE
);


-- ----------------------------------------------------------------
-- DOMAIN 4: SITE OPERATIONS, PROCUREMENT & CONSTRUCTION MANAGEMENT
-- ----------------------------------------------------------------

-- 4.1 Plot & Geolocation Site Details
CREATE TABLE IF NOT EXISTS public.site_details (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    plot_number       VARCHAR(100),
    survey_number     VARCHAR(100),
    address           TEXT,
    city              VARCHAR(100) DEFAULT 'Bengaluru',
    state             VARCHAR(100) DEFAULT 'Karnataka',
    pincode           VARCHAR(20),
    latitude          NUMERIC(10, 8),
    longitude         NUMERIC(11, 8),
    plot_dimensions   VARCHAR(100),
    total_area_sqft   NUMERIC(10, 2),
    builtup_area_sqft NUMERIC(10, 2),
    zoning_type       VARCHAR(100),
    soil_test_report  TEXT,
    sanction_number   VARCHAR(100),
    sanction_date     DATE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.2 Material Procurement & Inventory Tracker
CREATE TABLE IF NOT EXISTS public.materials (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name              VARCHAR(255) NOT NULL,
    category          VARCHAR(100) NOT NULL, -- cement, steel, timber, electrical, plumbing, tiles, paint
    quantity          NUMERIC(10, 2) NOT NULL,
    unit              VARCHAR(50) DEFAULT 'units',
    unit_price        NUMERIC(10, 2) DEFAULT 0,
    total_cost        NUMERIC(12, 2) DEFAULT 0,
    supplier          VARCHAR(255),
    status            VARCHAR(50) DEFAULT 'required', -- required, ordered, delivered, in_use, consumed
    delivery_date     DATE,
    notes             TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.3 Quality Inspections & Audit Scorecards
CREATE TABLE IF NOT EXISTS public.quality_inspections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    inspector_id      UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title             VARCHAR(255) NOT NULL,
    category          VARCHAR(100), -- structural, electrical, plumbing, finishing, waterproofing
    inspection_date   DATE NOT NULL,
    status            VARCHAR(50) DEFAULT 'passed', -- passed, action_required, failed
    score             INT DEFAULT 100,
    checklist         JSONB DEFAULT '[]'::jsonb,
    remarks           TEXT,
    action_items      TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.4 Contractor & Agency Registry
CREATE TABLE IF NOT EXISTS public.contractors (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,
    specialty         VARCHAR(100) NOT NULL,
    phone             VARCHAR(50),
    email             VARCHAR(255),
    address           TEXT,
    rating            NUMERIC(3, 2) DEFAULT 5.0,
    compliance_status VARCHAR(50) DEFAULT 'VERIFIED',
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.5 Site Health, Safety & Environment (HSE) Records
CREATE TABLE IF NOT EXISTS public.safety_records (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    record_type       VARCHAR(50) NOT NULL, -- briefing, drill, incident, near_miss, inspection
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    severity          VARCHAR(20) DEFAULT 'low',
    logged_by         VARCHAR(255),
    action_taken      TEXT,
    logged_date       DATE NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4.6 Heavy Machinery & Equipment Tracking
CREATE TABLE IF NOT EXISTS public.equipment (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(255) NOT NULL,
    category          VARCHAR(100),
    serial_number     VARCHAR(100),
    project_id        UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    status            VARCHAR(50) DEFAULT 'available', -- active, maintenance, available
    operator_name     VARCHAR(255),
    daily_rate        NUMERIC(10, 2) DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ----------------------------------------------------------------
-- DOMAIN 5: AUDIT TRAIL, GOVERNANCE & PORTFOLIO
-- ----------------------------------------------------------------

-- 5.1 Audit Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id          UUID,
    actor_name        VARCHAR(255) NOT NULL,
    actor_role        VARCHAR(50),
    department        VARCHAR(100),
    action            VARCHAR(100) NOT NULL,
    target_type       VARCHAR(100),
    target_id         VARCHAR(255),
    target_name       VARCHAR(255),
    details           JSONB DEFAULT '{}'::jsonb,
    ip_address        VARCHAR(50),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5.2 Access Permissions
CREATE TABLE IF NOT EXISTS public.access_permissions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource          VARCHAR(100) NOT NULL,
    action            VARCHAR(50) NOT NULL,
    granted_to        VARCHAR(50) NOT NULL,
    granted_by        UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5.3 Department Change Requests (Exclusive to Tech department)
CREATE TABLE IF NOT EXISTS public.department_change_requests (
    id                 TEXT PRIMARY KEY,
    action             VARCHAR(10) NOT NULL,
    dept_key           VARCHAR(100) NOT NULL,
    dept_display       VARCHAR(255) NOT NULL,
    requested_by       VARCHAR(255),
    requested_by_dept  VARCHAR(100) DEFAULT 'tech',
    status             VARCHAR(50) DEFAULT 'PENDING',
    submitted_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at        TIMESTAMP WITH TIME ZONE,
    approved_by        VARCHAR(255),
    rejected_at        TIMESTAMP WITH TIME ZONE,
    rejection_reason   TEXT
);

-- 5.4 Email Change Requests
CREATE TABLE IF NOT EXISTS public.email_change_requests (
    id                 TEXT PRIMARY KEY,
    designer_id        TEXT,
    full_name          VARCHAR(255) NOT NULL,
    department         VARCHAR(100),
    role               VARCHAR(100),
    company_code       VARCHAR(100),
    current_email      VARCHAR(255) NOT NULL,
    requested_email    VARCHAR(255) NOT NULL,
    reason             TEXT,
    status             VARCHAR(50) DEFAULT 'PENDING',
    submitted_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at        TIMESTAMP WITH TIME ZONE,
    approved_by        VARCHAR(255),
    rejected_at        TIMESTAMP WITH TIME ZONE,
    rejection_reason   TEXT
);

-- 5.5 Featured Signature Designs Portfolio
CREATE TABLE IF NOT EXISTS public.highlighted_designs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    designer_id       UUID REFERENCES public.designers(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    category          VARCHAR(100) DEFAULT 'interior',
    description       TEXT,
    image_url         TEXT NOT NULL,
    tags              TEXT[],
    is_featured       BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ----------------------------------------------------------------
-- SAFE COLUMN MIGRATION FOR PRE-EXISTING TABLES
-- (Guarantees zero-error re-runs even if tables already existed)
-- ----------------------------------------------------------------

ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS is_custom          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS requested_by_dept  VARCHAR(100);

ALTER TABLE public.designers
  ADD COLUMN IF NOT EXISTS council_reg_no     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS status             VARCHAR(50) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS via_request        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS department         VARCHAR(100) DEFAULT 'architecture',
  ADD COLUMN IF NOT EXISTS password_hash      TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS metadata           JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS stages                         JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS milestones                     JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_requirements            TEXT,
  ADD COLUMN IF NOT EXISTS client_requirements_plain_text TEXT,
  ADD COLUMN IF NOT EXISTS srs_content                    TEXT,
  ADD COLUMN IF NOT EXISTS srs_status                     VARCHAR(50) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS progress                       INT DEFAULT 0;

ALTER TABLE public.project_stages
  ADD COLUMN IF NOT EXISTS progress           INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS queries            JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.stage_documents
  ADD COLUMN IF NOT EXISTS file_data          TEXT;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());


-- ----------------------------------------------------------------
-- PERFORMANCE INDEXES (Safe IF NOT EXISTS)
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_designers_email ON public.designers(email);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON public.projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON public.callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_is_client ON public.callback_requests(is_client);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_customer_email ON public.consultations(customer_email);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_id ON public.activity_log(actor_id);


-- ----------------------------------------------------------------
-- AUTOMATED UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------

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

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------
-- AUTH HOOK: AUTO-SYNC AUTH.USERS -> PUBLIC.PROFILES
-- ----------------------------------------------------------------

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
        user_id = EXCLUDED.user_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for frontend web clients
-- ----------------------------------------------------------------

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'departments', 'designers', 'profiles', 'projects', 'project_stages',
    'stage_documents', 'client_requirements', 'callback_requests', 'access_permissions',
    'activity_log', 'site_details', 'consultations', 'payments', 'reviews',
    'contact_messages', 'highlighted_designs', 'materials', 'quality_inspections',
    'contractors', 'safety_records', 'equipment', 'designer_access_requests',
    'department_change_requests', 'email_change_requests', 'client_password_log'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Allow all %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


-- ----------------------------------------------------------------
-- CORE SEED DATA
-- ----------------------------------------------------------------

-- Seed default departments
INSERT INTO public.departments (name, display_name, description, is_custom, created_by)
VALUES
  ('architecture', 'Architecture & Design',
   'Architectural planning, interior design, blueprint creation, and design portfolio management',
   FALSE, 'system'),
  ('construction', 'Construction & Management',
   'Site supervision, material procurement, quality inspections, contractor management, and safety compliance',
   FALSE, 'system'),
  ('marketing', 'Marketing & Sales',
   'Lead management, callback handling, campaign tracking, and client acquisition',
   FALSE, 'system'),
  ('tech', 'Tech & Digitalization',
   'System integration management, digital asset library, documentation systems, and activity monitoring',
   FALSE, 'system'),
  ('admin', 'Owner / Administration',
   'Cross-department monitoring, access control, employee management, and system configuration',
   FALSE, 'system')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description  = EXCLUDED.description;

-- Seed default Owner Admin account
INSERT INTO public.designers (
  company_code, full_name, email, role, specialization, is_owner, is_active, status, department
)
VALUES (
  'BAVI-OWNER-ADMIN',
  'BAVI Principal Owner',
  'owner@bavi.in',
  'owner',
  'Principal Architect & Site Owner',
  TRUE,
  TRUE,
  'ACTIVE',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
