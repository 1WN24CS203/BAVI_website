-- ================================================================
-- BAVI: Bahubali Builders & Visionary Interiors
-- Database Schema for Supabase (PostgreSQL)
-- ================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DESIGNERS TABLE (Holds company codes for secure designer login)
CREATE TABLE IF NOT EXISTS public.designers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 2. CUSTOMER PROFILES (Linked to Supabase auth.users or standalone demo)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users(id) when auth is active
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    soil_test_status VARCHAR(50) DEFAULT 'completed',
    water_source VARCHAR(100) DEFAULT 'Municipal & Borewell',
    electricity_status VARCHAR(100) DEFAULT 'Connection Approved (15KW)',
    notes TEXT,
    site_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. PAYMENTS TABLE (Supports Stripe Test Mode & Offline Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.designers(id) ON DELETE SET NULL,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(50) DEFAULT 'stripe', -- stripe, bank_transfer, cheque, cash
    stripe_payment_intent_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    receipt_number VARCHAR(100) UNIQUE,
    description TEXT,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. HIGHLIGHTED DESIGNS TABLE (Managed by Designer, shown on customer portal)
CREATE TABLE IF NOT EXISTS public.highlighted_designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Allow public read access to active highlighted designs and reviews
CREATE POLICY "Public read highlighted designs" ON public.highlighted_designs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Allow authenticated users / service role full access for operations
CREATE POLICY "Allow all access to authenticated/anon for prototype" ON public.designers FOR ALL USING (true);
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all access to project_milestones" ON public.project_milestones FOR ALL USING (true);
CREATE POLICY "Allow all access to site_details" ON public.site_details FOR ALL USING (true);
CREATE POLICY "Allow all access to consultations" ON public.consultations FOR ALL USING (true);
CREATE POLICY "Allow all access to payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all access to contact_messages" ON public.contact_messages FOR ALL USING (true);
CREATE POLICY "Allow all access to highlighted_designs" ON public.highlighted_designs FOR ALL USING (true);

-- ================================================================
-- SEED DATA (Ready-to-use Sample Designers, Codes, Customers & Projects)
-- ================================================================

-- 1. Insert Master Designers with Company Codes
INSERT INTO public.designers (id, company_code, full_name, email, phone, specialization, bio)
VALUES 
    ('d1111111-1111-1111-1111-111111111111', 'BAVI-DES-7890', 'Arun Bahubali', 'arun.designer@bavi.in', '+91 98450 12345', 'Principal Architect & Luxury Villa Specialist', 'Over 14 years shaping iconic architectural landmarks in South India.'),
    ('d2222222-2222-2222-2222-222222222222', 'BAVI-DES-1024', 'Ananya Hegde', 'ananya.interiors@bavi.in', '+91 98450 67890', 'Head of Visionary Interior Design', 'Specialist in contemporary Italian-minimalist and neo-classical interior concepts.')
ON CONFLICT (company_code) DO NOTHING;

-- 2. Insert Sample Customers
INSERT INTO public.profiles (id, full_name, email, phone, address, role, designer_id)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Rajesh Sharma', 'rajesh.sharma@example.com', '+91 98765 11111', 'Plot #42, Indiranagar, Bengaluru', 'customer', 'd1111111-1111-1111-1111-111111111111'),
    ('c2222222-2222-2222-2222-222222222222', 'Pooja Reddy', 'pooja.reddy@example.com', '+91 98765 22222', 'Villa 18, Palm Meadows, Whitefield, Bengaluru', 'customer', 'd2222222-2222-2222-2222-222222222222'),
    ('c3333333-3333-3333-3333-333333333333', 'Vikramaditya Rao', 'vikram.rao@example.com', '+91 98765 33333', 'Jayalakshmipuram, Mysuru', 'customer', 'd1111111-1111-1111-1111-111111111111')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Sample Projects
INSERT INTO public.projects (id, customer_id, designer_id, title, description, category, status, budget, paid_amount, location, start_date, estimated_completion, completion_percentage)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'The Grand Serenity Villa', '4BHK Ultra-Luxury contemporary villa with infinity pool, automated glass facades, and Italian marble finishes.', 'residential', 'in_progress', 18500000.00, 7400000.00, 'Indiranagar, Bengaluru', '2026-01-15', '2026-11-30', 65),
    ('p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Whitefield Penthouse Renovation', 'Complete turnkey interior design overhaul featuring bespoke teak wood carpentry, ambient warm LED coves, and acoustic theatre lounge.', 'interior', 'in_progress', 6200000.00, 3100000.00, 'Whitefield, Bengaluru', '2026-03-01', '2026-08-15', 50),
    ('p3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Mysuru Heritage Corporate Hub', 'Biophilic 3-storey boutique corporate office building blending traditional Karnataka stone craft with smart energy-efficient glass.', 'commercial', 'planning', 24000000.00, 2400000.00, 'Jayalakshmipuram, Mysuru', '2026-05-10', '2027-04-20', 15)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Milestones for The Grand Serenity Villa
INSERT INTO public.project_milestones (project_id, title, description, due_date, amount, status, completion_date, order_index)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'Architectural Blueprint & Site Plan Sanction', 'Finalization of 3D architectural elevations, structural drawings, and BBMP municipal plan sanction.', '2026-02-15', 2000000.00, 'completed', '2026-02-10', 1),
    ('p1111111-1111-1111-1111-111111111111', 'Excavation & RCC Foundation Structure', 'Deep foundation column casting, anti-termite treatment, and plinth beam completion.', '2026-04-30', 5400000.00, 'completed', '2026-04-25', 2),
    ('p1111111-1111-1111-1111-111111111111', 'Brick Masonry, Plumbing & Electrical Conduits', 'Double-coat clay brick masonry, concealed Finolex wiring conduits, and Astral plumbing lines.', '2026-07-31', 4500000.00, 'in_progress', NULL, 3),
    ('p1111111-1111-1111-1111-111111111111', 'Flooring, False Ceiling & Premium Painting', 'Italian Botticino marble laying, Gyproc designer false ceiling, and Asian Paints Royale lustre finish.', '2026-09-30', 4000000.00, 'pending', NULL, 4),
    ('p1111111-1111-1111-1111-111111111111', 'Final Handover & Smart Home Automation', 'Custom wood modular cabinetry, landscape lighting, and smart home commissioning.', '2026-11-30', 2600000.00, 'pending', NULL, 5)
ON CONFLICT DO NOTHING;

-- 5. Insert Site Details
INSERT INTO public.site_details (project_id, customer_id, site_address, city, state, pincode, land_area_sqft, builtup_area_sqft, approval_status, zoning, water_source, electricity_status, notes)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Plot #42, 12th Main Road, HAL 2nd Stage, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 4200.00, 6800.00, 'approved', 'Residential (R1-Luxury)', 'BWSSB Municipal + 600ft Borewell with filtration', '15KW 3-Phase BESCOM connection approved', 'East-facing Vastu compliant plot with 40ft wide approach road.')
ON CONFLICT DO NOTHING;

-- 6. Insert Sample Payments
INSERT INTO public.payments (id, project_id, customer_id, designer_id, amount, currency, status, payment_method, receipt_number, description, paid_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2000000.00, 'INR', 'completed', 'stripe', 'BAVI-REC-2026-001', 'Milestone #1: Blueprint & Site Sanction Fee', '2026-02-10 14:30:00+00'),
    ('a2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 5400000.00, 'INR', 'completed', 'stripe', 'BAVI-REC-2026-002', 'Milestone #2: Foundation & Plinth Casting', '2026-04-25 11:15:00+00')
ON CONFLICT DO NOTHING;

-- 7. Insert Sample Consultations
INSERT INTO public.consultations (customer_id, designer_id, customer_name, customer_email, customer_phone, consultation_type, preferred_date, preferred_time, status, notes)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Rajesh Sharma', 'rajesh.sharma@example.com', '+91 98765 11111', 'design_review', '2026-09-05', '11:00 AM', 'confirmed', 'On-site review of living room Italian marble selection and cove lighting mockup.'),
    ('c2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Pooja Reddy', 'pooja.reddy@example.com', '+91 98765 22222', 'site_visit', '2026-09-08', '03:30 PM', 'pending', 'Site inspection for master bedroom walk-in closet measurements.')
ON CONFLICT DO NOTHING;

-- 8. Insert Featured Designs for Homepage
INSERT INTO public.highlighted_designs (title, category, description, image_url, location, display_order)
VALUES
    ('The Glass Pavilion Villa', 'residential', 'Modern minimalist cantilever residence overlooking nature preserve.', '/projects/project1.jpg', 'Indiranagar, Bengaluru', 1),
    ('Vertex Corporate Headquarters', 'commercial', 'State-of-the-art sustainable office hub with gold acoustic louvers.', '/projects/project2.jpg', 'Outer Ring Road, Bengaluru', 2),
    ('The Amber & Teak Penthouse', 'interior', 'Bespoke warmth using aged Burmese teak, brushed brass, and ambient coves.', '/projects/project3.jpg', 'Lavelle Road, Bengaluru', 3)
ON CONFLICT DO NOTHING;
