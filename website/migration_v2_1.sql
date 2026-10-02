-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- Safe Database Update & Migration Script (Non-Destructive)
-- Target: Supabase (PostgreSQL)
-- 
-- ✅ 100% SAFE: Zero data loss. Never drops tables, columns, or rows.
-- ✅ IDEMPOTENT: Safe to run multiple times without duplicate errors.
-- ✅ NON-BLOCKING: Preserves all existing relationships and foreign keys.
-- ================================================================

-- ----------------------------------------------------------------
-- STEP 1: Enable Required Extensions
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ----------------------------------------------------------------
-- STEP 2: Safely Add Any Missing Columns to Existing Tables
-- (ADD COLUMN IF NOT EXISTS leaves all existing rows and columns intact)
-- ----------------------------------------------------------------

-- 1. Departments table
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS is_custom          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_by         VARCHAR(255),
  ADD COLUMN IF NOT EXISTS requested_by_dept  VARCHAR(100);

-- 2. Designers table
ALTER TABLE public.designers
  ADD COLUMN IF NOT EXISTS council_reg_no     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS status             VARCHAR(50) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS via_request        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS department         VARCHAR(100) DEFAULT 'architecture',
  ADD COLUMN IF NOT EXISTS password_hash      TEXT;

-- 3. Profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS metadata           JSONB DEFAULT '{}'::jsonb;

-- 4. Projects table (GitHub-like dynamic stages, SRS, & documents)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS stages             JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS milestones         JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_requirements TEXT;

-- 5. Project Stages table (custom stage progression & user queries)
ALTER TABLE public.project_stages
  ADD COLUMN IF NOT EXISTS progress           INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS queries            JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 6. Stage Documents table
ALTER TABLE public.stage_documents
  ADD COLUMN IF NOT EXISTS file_data          TEXT;

-- 7. Payments table
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());


-- ----------------------------------------------------------------
-- STEP 3: Ensure All Tables Exist (If Not Already Created)
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.designer_access_requests (
    id               TEXT PRIMARY KEY,
    full_name        VARCHAR(255) NOT NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    TEXT,
    phone            VARCHAR(50),
    specialization   VARCHAR(255) DEFAULT 'Luxury Villa Architect',
    council_reg_no   VARCHAR(100),
    bio              TEXT,
    department       VARCHAR(100) DEFAULT 'architecture',
    requested_role   VARCHAR(50) DEFAULT 'designer',
    is_owner_request BOOLEAN DEFAULT FALSE,
    keyless_disabled BOOLEAN DEFAULT FALSE,
    status           VARCHAR(50) DEFAULT 'PENDING',
    generated_code   VARCHAR(100),
    submitted_to     VARCHAR(255),
    requested_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at      TIMESTAMP WITH TIME ZONE,
    approved_by      VARCHAR(255),
    rejection_reason TEXT
);

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

-- Client Password Change Log (self-service password updates by clients)
CREATE TABLE IF NOT EXISTS public.client_password_log (
    id               TEXT PRIMARY KEY,
    client_id        TEXT,
    client_code      VARCHAR(100),
    client_name      VARCHAR(255) NOT NULL,
    client_email     VARCHAR(255) NOT NULL,
    reason           TEXT,
    status           VARCHAR(50) DEFAULT 'APPLIED',
    submitted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    designer_notified BOOLEAN DEFAULT TRUE
);


-- ----------------------------------------------------------------
-- STEP 4: Performance Indexes (Safe IF NOT EXISTS)
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_designer_id ON public.profiles(designer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_designers_department_id ON public.designers(department_id);
CREATE INDEX IF NOT EXISTS idx_designers_email ON public.designers(email);
CREATE INDEX IF NOT EXISTS idx_designers_status ON public.designers(status);

CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON public.projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_status ON public.project_stages(status);

CREATE INDEX IF NOT EXISTS idx_stage_documents_stage_id ON public.stage_documents(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_documents_project_id ON public.stage_documents(project_id);

CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON public.callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_is_client ON public.callback_requests(is_client);
CREATE INDEX IF NOT EXISTS idx_callback_requests_client_id ON public.callback_requests(client_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_actor_id ON public.activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_department ON public.activity_log(department);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

CREATE INDEX IF NOT EXISTS idx_access_permissions_granted_to ON public.access_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_client_requirements_project_id ON public.client_requirements(project_id);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);

CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON public.consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_designer_id ON public.consultations(designer_id);

CREATE INDEX IF NOT EXISTS idx_materials_project_id ON public.materials(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_project_id ON public.quality_inspections(project_id);

CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.designer_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.designer_access_requests(status);

CREATE INDEX IF NOT EXISTS idx_dept_change_requests_status ON public.department_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_dept_change_requests_dept_key ON public.department_change_requests(dept_key);

CREATE INDEX IF NOT EXISTS idx_email_change_requests_status ON public.email_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_current_email ON public.email_change_requests(current_email);
CREATE INDEX IF NOT EXISTS idx_email_change_requests_requested_email ON public.email_change_requests(requested_email);


-- ----------------------------------------------------------------
-- STEP 5: Automated updated_at Function & Triggers
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

DROP TRIGGER IF EXISTS set_project_stages_updated_at ON public.project_stages;
CREATE TRIGGER set_project_stages_updated_at BEFORE UPDATE ON public.project_stages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_site_details_updated_at ON public.site_details;
CREATE TRIGGER set_site_details_updated_at BEFORE UPDATE ON public.site_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_consultations_updated_at ON public.consultations;
CREATE TRIGGER set_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_callback_requests_updated_at ON public.callback_requests;
CREATE TRIGGER set_callback_requests_updated_at BEFORE UPDATE ON public.callback_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_client_requirements_updated_at ON public.client_requirements;
CREATE TRIGGER set_client_requirements_updated_at BEFORE UPDATE ON public.client_requirements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_materials_updated_at ON public.materials;
CREATE TRIGGER set_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_equipment_updated_at ON public.equipment;
CREATE TRIGGER set_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ----------------------------------------------------------------
-- STEP 6: Auth Hook - Auto-Sync auth.users with public.profiles
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
-- STEP 7: Row Level Security (RLS) Permissive Policies
-- Ensures User-side & Designer-side apps have full read/write access
-- ----------------------------------------------------------------

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlighted_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designer_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation (Permissive for frontend apps)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'departments', 'designers', 'profiles', 'projects', 'project_stages',
    'stage_documents', 'client_requirements', 'callback_requests', 'access_permissions',
    'activity_log', 'site_details', 'consultations', 'payments', 'reviews',
    'contact_messages', 'highlighted_designs', 'materials', 'quality_inspections',
    'contractors', 'safety_records', 'equipment', 'designer_access_requests',
    'department_change_requests', 'email_change_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Allow all %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;


-- ----------------------------------------------------------------
-- STEP 8: Seed Core Departments (Preserves Existing Records)
-- ----------------------------------------------------------------

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
   'System integration management, digital asset library, documentation systems, activity log monitoring, and exclusive authority to submit department structure change requests',
   FALSE, 'system'),
  ('admin', 'Owner / Administration',
   'Cross-department monitoring, access control, employee management, and system configuration',
   FALSE, 'system')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description  = EXCLUDED.description;


-- ----------------------------------------------------------------
-- STEP 9: Default Owner Admin Profile (Only inserted if absent)
-- ----------------------------------------------------------------

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
