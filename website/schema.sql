-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- Production Database Schema v2.0 for Supabase (PostgreSQL)
-- Multi-Department Architecture with Access Control
-- ================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ================================================================
-- DROP EXISTING TABLES (Reverse dependency order to allow clean re-runs)
-- ================================================================
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.safety_records CASCADE;
DROP TABLE IF EXISTS public.contractors CASCADE;
DROP TABLE IF EXISTS public.quality_inspections CASCADE;
DROP TABLE IF EXISTS public.materials CASCADE;
DROP TABLE IF EXISTS public.highlighted_designs CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.site_details CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.access_permissions CASCADE;
DROP TABLE IF EXISTS public.callback_requests CASCADE;
DROP TABLE IF EXISTS public.client_requirements CASCADE;
DROP TABLE IF EXISTS public.stage_documents CASCADE;
DROP TABLE IF EXISTS public.project_stages CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.designers CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;

-- ================================================================
-- TABLE DEFINITIONS
-- ================================================================

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,         -- architecture, construction, marketing, admin
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DESIGNERS TABLE (Holds master credentials & security codes)
CREATE TABLE IF NOT EXISTS public.designers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'designer',       -- owner, architect, engineer, marketer, designer, manager
    permissions JSONB DEFAULT '{}'::jsonb,      -- Granular permissions per role
    specialization VARCHAR(255) DEFAULT 'Luxury Residential & Commercial Interiors',
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_owner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CUSTOMER PROFILES (Linked to Supabase Auth users)
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

-- 4. PROJECTS TABLE (with client info & requirement tracking)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'residential',       -- residential, commercial, interior, renovation
    status VARCHAR(50) DEFAULT 'planning',              -- planning, requirement_analysis, in_progress, completed, on_hold
    budget NUMERIC(14, 2) DEFAULT 0,
    paid_amount NUMERIC(14, 2) DEFAULT 0,
    location VARCHAR(255),
    
    -- Client information
    client_name VARCHAR(255),
    client_phone VARCHAR(50),
    client_email VARCHAR(255),
    
    -- Requirement Analysis Phase
    client_requirements_plain_text TEXT,                 -- Client describes needs in plain words
    srs_document_url TEXT,                              -- Builder-generated SRS document
    srs_status VARCHAR(50) DEFAULT 'not_started',       -- not_started, draft, review, approved, revision_requested
    srs_content TEXT,                                   -- SRS content (structured)
    
    start_date DATE,
    estimated_completion DATE,
    completion_percentage INT DEFAULT 0,
    floor_plan_url TEXT,
    site_photos JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PROJECT STAGES TABLE (replaces hardcoded milestone arrays â€” dual approval)
CREATE TABLE IF NOT EXISTS public.project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    amount NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',               -- pending, in_progress, awaiting_approval, completed
    order_index INT DEFAULT 1,
    
    -- Dual Approval System
    builder_approved BOOLEAN DEFAULT FALSE,
    builder_approved_at TIMESTAMP WITH TIME ZONE,
    builder_approved_by UUID REFERENCES public.designers(id),
    client_approved BOOLEAN DEFAULT FALSE,
    client_approved_at TIMESTAMP WITH TIME ZONE,
    client_approved_by UUID REFERENCES public.profiles(id),
    
    -- Stage Documents
    documents JSONB DEFAULT '[]'::jsonb,                -- Array of {url, name, size, type, uploaded_by, uploaded_at}
    
    -- Stage feedback
    client_feedback TEXT,
    builder_notes TEXT,
    
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STAGE DOCUMENTS TABLE (per-stage uploaded documents)
CREATE TABLE IF NOT EXISTS public.stage_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(100),                             -- pdf, dwg, jpg, png, docx, xlsx, zip
    category VARCHAR(100) DEFAULT 'general',            -- blueprint, report, photo, invoice, permit, contract
    uploaded_by_type VARCHAR(50) DEFAULT 'designer',    -- designer, client
    uploaded_by_id UUID,
    uploaded_by_name VARCHAR(255),
    notes TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CLIENT REQUIREMENTS TABLE
CREATE TABLE IF NOT EXISTS public.client_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Client's plain text requirements
    plain_text_requirements TEXT NOT NULL,
    
    -- Builder's SRS output
    srs_title VARCHAR(255),
    srs_scope TEXT,
    srs_functional_requirements TEXT,
    srs_non_functional_requirements TEXT,
    srs_material_specifications TEXT,
    srs_timeline TEXT,
    srs_budget_breakdown TEXT,
    srs_additional_notes TEXT,
    
    status VARCHAR(50) DEFAULT 'submitted',             -- submitted, srs_drafted, under_review, approved, revision_requested
    revision_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CALLBACK REQUESTS TABLE (Marketing Team)
CREATE TABLE IF NOT EXISTS public.callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_client BOOLEAN DEFAULT FALSE,                    -- Whether requester is existing client
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    subject VARCHAR(255),
    message TEXT,
    preferred_time VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'normal',              -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'new',                   -- new, contacted, scheduled, completed, cancelled
    
    assigned_to UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(255),
    notes TEXT,
    
    contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ACCESS PERMISSIONS TABLE (Cross-access grants)
CREATE TABLE IF NOT EXISTS public.access_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who is granting access
    granted_by UUID NOT NULL,
    granted_by_type VARCHAR(50) NOT NULL,               -- owner, designer, client
    
    -- Who is receiving access
    granted_to UUID NOT NULL,
    granted_to_type VARCHAR(50) NOT NULL,               -- designer, client
    
    -- What access is being granted
    resource_type VARCHAR(50) NOT NULL,                  -- project, department, client_data
    resource_id UUID,                                    -- Specific resource ID (project, etc.)
    permission_level VARCHAR(50) DEFAULT 'read',         -- read, write, admin
    
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ACTIVITY LOG TABLE (Owner monitoring / audit trail)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    actor_id UUID NOT NULL,
    actor_type VARCHAR(50) NOT NULL,                     -- owner, designer, client, system
    actor_name VARCHAR(255),
    department VARCHAR(100),
    
    action VARCHAR(255) NOT NULL,                        -- created_project, approved_stage, uploaded_document, etc.
    resource_type VARCHAR(100),                          -- project, stage, document, callback, requirement
    resource_id UUID,
    resource_name VARCHAR(255),
    
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. SITE DETAILS TABLE
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
    approval_status VARCHAR(50) DEFAULT 'under_review',
    zoning VARCHAR(100) DEFAULT 'Residential (R1)',
    soil_test_status VARCHAR(50) DEFAULT 'pending',
    water_source VARCHAR(100) DEFAULT 'Municipal / Borewell',
    electricity_status VARCHAR(100) DEFAULT 'Connection Under Sanction',
    notes TEXT,
    site_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    consultation_type VARCHAR(100) DEFAULT 'initial',
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    meeting_link TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES public.project_stages(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'completed',
    payment_method VARCHAR(50) DEFAULT 'phone_upi',
    utr_number VARCHAR(100),
    proof_url TEXT,
    receipt_number VARCHAR(100) UNIQUE,
    description TEXT,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. REVIEWS TABLE
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

-- 15. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. HIGHLIGHTED DESIGNS TABLE
CREATE TABLE IF NOT EXISTS public.highlighted_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. MATERIALS TRACKER TABLE (Construction Department)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',            -- cement, steel, timber, electrical, plumbing, paint, tiles, fittings
    quantity NUMERIC(12, 2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units',                   -- units, bags, tons, sqft, meters, liters
    unit_price NUMERIC(12, 2) DEFAULT 0,
    total_cost NUMERIC(14, 2) DEFAULT 0,
    supplier VARCHAR(255),
    status VARCHAR(50) DEFAULT 'required',              -- required, ordered, delivered, in_use, consumed
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. QUALITY INSPECTIONS TABLE (Construction Department)
CREATE TABLE IF NOT EXISTS public.quality_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    stage_id UUID REFERENCES public.project_stages(id) ON DELETE SET NULL,
    inspector_name VARCHAR(255) NOT NULL,
    inspection_type VARCHAR(100) DEFAULT 'structural',   -- structural, electrical, plumbing, finishing, safety, environmental
    inspection_date DATE NOT NULL,
    result VARCHAR(50) DEFAULT 'pending',                -- pending, passed, failed, conditional
    findings TEXT,
    corrective_actions TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. CONTRACTORS TABLE (Construction Department)
CREATE TABLE IF NOT EXISTS public.contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    specialization VARCHAR(255),                         -- masonry, electrical, plumbing, painting, carpentry, landscaping
    phone VARCHAR(50),
    email VARCHAR(255),
    license_number VARCHAR(100),
    rating INT DEFAULT 0,
    total_projects INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',                 -- active, on_assignment, suspended, blacklisted
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. SAFETY COMPLIANCE TABLE (Construction Department)
CREATE TABLE IF NOT EXISTS public.safety_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    record_type VARCHAR(100) DEFAULT 'inspection',       -- inspection, incident, drill, certification, violation
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) DEFAULT 'low',                  -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'open',                   -- open, resolved, escalated, closed
    reported_by VARCHAR(255),
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    incident_date DATE,
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 21. EQUIPMENT TRACKER TABLE (Construction Department)
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',             -- excavation, concrete, scaffolding, lifting, surveying, safety, power_tools
    status VARCHAR(50) DEFAULT 'available',              -- available, in_use, maintenance, retired
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    assigned_to VARCHAR(255),
    condition_status VARCHAR(50) DEFAULT 'good',         -- excellent, good, fair, needs_repair
    rental_daily_cost NUMERIC(10, 2) DEFAULT 0,
    last_maintenance DATE,
    next_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_designer_id ON public.profiles(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_designer_id ON public.projects(designer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON public.projects(client_email);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON public.project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_stage_documents_stage_id ON public.stage_documents(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_documents_project_id ON public.stage_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_callback_requests_status ON public.callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_callback_requests_is_client ON public.callback_requests(is_client);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor_id ON public.activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_department ON public.activity_log(department);
CREATE INDEX IF NOT EXISTS idx_access_permissions_granted_to ON public.access_permissions(granted_to);
CREATE INDEX IF NOT EXISTS idx_client_requirements_project_id ON public.client_requirements(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON public.consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_designer_id ON public.consultations(designer_id);
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON public.materials(project_id);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_project_id ON public.quality_inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_designers_department_id ON public.designers(department_id);

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

DROP TRIGGER IF EXISTS set_callback_requests_updated_at ON public.callback_requests;
CREATE TRIGGER set_callback_requests_updated_at BEFORE UPDATE ON public.callback_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_client_requirements_updated_at ON public.client_requirements;
CREATE TRIGGER set_client_requirements_updated_at BEFORE UPDATE ON public.client_requirements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_materials_updated_at ON public.materials;
CREATE TRIGGER set_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_equipment_updated_at ON public.equipment;
CREATE TRIGGER set_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
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

-- Open policies for initial development (tighten for production)
CREATE POLICY "Allow all departments" ON public.departments FOR ALL USING (true);
CREATE POLICY "Allow all designers" ON public.designers FOR ALL USING (true);
CREATE POLICY "Allow all profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all project_stages" ON public.project_stages FOR ALL USING (true);
CREATE POLICY "Allow all stage_documents" ON public.stage_documents FOR ALL USING (true);
CREATE POLICY "Allow all client_requirements" ON public.client_requirements FOR ALL USING (true);
CREATE POLICY "Allow all callback_requests" ON public.callback_requests FOR ALL USING (true);
CREATE POLICY "Allow all access_permissions" ON public.access_permissions FOR ALL USING (true);
CREATE POLICY "Allow all activity_log" ON public.activity_log FOR ALL USING (true);
CREATE POLICY "Allow all site_details" ON public.site_details FOR ALL USING (true);
CREATE POLICY "Allow all consultations" ON public.consultations FOR ALL USING (true);
CREATE POLICY "Allow all payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Allow all contact_messages" ON public.contact_messages FOR ALL USING (true);
CREATE POLICY "Allow all highlighted_designs" ON public.highlighted_designs FOR ALL USING (true);
CREATE POLICY "Allow all materials" ON public.materials FOR ALL USING (true);
CREATE POLICY "Allow all quality_inspections" ON public.quality_inspections FOR ALL USING (true);
CREATE POLICY "Allow all contractors" ON public.contractors FOR ALL USING (true);
CREATE POLICY "Allow all safety_records" ON public.safety_records FOR ALL USING (true);
CREATE POLICY "Allow all equipment" ON public.equipment FOR ALL USING (true);

-- ================================================================
-- SEED DATA: Departments
-- ================================================================
INSERT INTO public.departments (name, display_name, description)
VALUES
    ('architecture', 'Architecture & Design', 'Architectural planning, interior design, blueprint creation, and design portfolio management'),
    ('construction', 'Construction & Management', 'Site supervision, material procurement, quality inspections, contractor management, and safety compliance'),
    ('marketing', 'Marketing & Sales', 'Lead management, callback handling, campaign tracking, and client acquisition'),
    ('admin', 'Owner / Administration', 'Cross-department monitoring, access control, employee management, and system configuration')
ON CONFLICT (name) DO NOTHING;


-- ================================================================
-- EXTRA ADDITIONS: AUTH HOOK & AUTOMATIC PROFILE PERSISTENCE
-- ================================================================

-- Function to automatically create or update a profile when a new user signs up in auth.users
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

-- Trigger to execute whenever a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS allows insert and upsert from both authenticated and anon roles during signup
DROP POLICY IF EXISTS "Allow all profiles insert" ON public.profiles;
CREATE POLICY "Allow all profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all profiles update" ON public.profiles;
CREATE POLICY "Allow all profiles update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
