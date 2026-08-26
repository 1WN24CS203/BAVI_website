# Bahubali Builders & Visionary Interiors (BAVI)
## Production Web Application Architecture & Implementation Guide

---

## Executive Summary & Vision

**Bahubali Builders and Visionary Interiors (BAVI)** is a dual-domain enterprise platform combining heavy construction/architectural engineering (Bahubali Builders) with premium interior design & space planning (Visionary Interiors).

This document serves as an exhaustive, step-by-step engineering blueprint for building a high-performance, SEO-optimized, and secure web application. It eliminates "vibe coding" in favor of strict architectural patterns, structured type definitions, schema designs, and backend abstractions for **Appwrite** and **Supabase**.

---

## Table of Contents

1. [System Architecture & Tech Stack](#1-system-architecture--tech-stack)
2. [Database Schema & Data Modeling](#2-database-schema--data-modeling)
3. [Appwrite Backend Configuration Guide](#3-appwrite-backend-configuration-guide)
4. [Supabase Backend Configuration Guide (Alternative)](#4-supabase-backend-configuration-guide-alternative)
5. [Appwrite to Supabase Migration & Comparison](#5-appwrite-to-supabase-migration--comparison)
6. [Backend Abstraction Layer (Decoupling Architecture)](#6-backend-abstraction-layer-decoupling-architecture)
7. [Next.js Project Blueprint & Code Structure](#7-nextjs-project-blueprint--code-structure)
8. [Role-Based Access Control (RBAC) & Security](#8-role-based-access-control-rbac--security)
9. [Production Deployment & Operations Checklist](#9-production-deployment--operations-checklist)

---

## 1. System Architecture & Tech Stack

```
                               ┌─────────────────────────────────────────┐
                               │             Next.js 14 App              │
                               │        (App Router, React 18, TS)       │
                               └────────────────────┬────────────────────┘
                                                    │
                               ┌────────────────────┴────────────────────┐
                               │       Backend Abstraction Layer         │
                               │           (/src/lib/backend)            │
                               └──────────┬───────────────────┬──────────┘
                                          │                   │
                        ┌─────────────────┴─┐               ┌─┴─────────────────┐
                        │ Appwrite Engine   │   (or Swap)   │ Supabase Engine   │
                        │ - Databases       │  ──────────>  │ - PostgreSQL      │
                        │ - Auth / Teams    │               │ - Auth & RLS      │
                        │ - Storage         │               │ - Storage Buckets │
                        └───────────────────┘               └───────────────────┘
```

### Core Stack
* **Frontend Framework**: Next.js 14+ (App Router, Server Components, Server Actions)
* **Language**: TypeScript 5.x (Strict Mode)
* **Styling & UI**: Vanilla CSS / CSS Modules / Tailwind CSS + Lucide Icons + Framer Motion
* **Primary Backend**: Appwrite Cloud / Self-Hosted (v1.5+)
* **Secondary Backend Option**: Supabase (PostgreSQL 15+)
* **State & Data Fetching**: React Server Components (RSC) + TanStack Query (for client state)
* **Deployment**: Vercel (Frontend) + Appwrite/Supabase Cloud (Backend)

---

## 2. Database Schema & Data Modeling

The BAVI platform requires managing portfolios, active construction projects, interior design packages, lead consultations, and a client tracking portal.

### Core Collections / Tables

#### A. `projects` (Construction & Interior Projects)
| Field Name | Type | Key Constraint / Index | Description |
|---|---|---|---|
| `$id` / `id` | String / UUID | Primary Key | Unique Project ID |
| `title` | String | Index (Fulltext) | Project Name (e.g., "Grand Villa Rajajinagar") |
| `slug` | String | Unique Index | URL Slug (`grand-villa-rajajinagar`) |
| `category` | Enum | Index | `construction`, `interior`, `commercial`, `turnkey` |
| `status` | Enum | Index | `planning`, `in_progress`, `completed` |
| `client_name` | String | Optional | Owner Name |
| `location` | String | Index | City / Area (e.g., "Bengaluru, KA") |
| `area_sqft` | Integer | | Area size in square feet |
| `budget_range` | String | | Display range (e.g., "₹50L - ₹75L") |
| `cover_image_id`| String | | File ID from Storage Bucket |
| `gallery_ids` | Array[String]| | Array of File IDs |
| `description` | Text | | Detailed description / case study |
| `completion_date`| Date | | Handover Date |
| `created_at` | DateTime | Index | Timestamp |

#### B. `leads` (Consultation & Inquiry Requests)
| Field Name | Type | Key Constraint | Description |
|---|---|---|---|
| `id` | String / UUID | Primary Key | Unique Lead ID |
| `full_name` | String | | Client Name |
| `email` | String | Index | Client Email |
| `phone` | String | Index | Phone Number |
| `service_type` | Enum | | `full_construction`, `interior_design`, `renovation`, `architecture_plan` |
| `site_location` | String | | Site location |
| `estimated_budget`| String | | Selected budget segment |
| `notes` | Text | | Custom project details |
| `lead_status` | Enum | Index | `new`, `contacted`, `site_visited`, `quoted`, `closed`, `rejected` |
| `assigned_to` | String (Ref) | | Admin / Manager User ID |

#### C. `client_portal` (Progress Tracking for Ongoing Clients)
| Field Name | Type | Key Constraint | Description |
|---|---|---|---|
| `id` | String / UUID | Primary Key | Progress record ID |
| `project_id` | Foreign Key | Index | Ref to `projects.id` |
| `client_user_id`| Foreign Key | Index | Ref to User Auth ID |
| `milestone_name`| String | | Current Milestone (e.g., "Slab Casting Phase 2") |
| `completion_pct`| Integer | | Percentage (0 - 100) |
| `update_notes` | Text | | Weekly report note from site engineer |
| `site_photos` | Array[String]| | Array of storage file IDs |
| `blueprint_doc` | String | | Blueprint PDF File ID |
| `payment_status`| Enum | | `paid`, `pending`, `overdue` |

---

## 3. Appwrite Backend Configuration Guide

### 3.1 Step 1: Environment & SDK Initialization
Install the official Appwrite SDKs in your Next.js project:
```bash
npm install appwrite node-appwrite
```

Create `/src/lib/appwrite/config.ts`:
```typescript
export const APPWRITE_CONFIG = {
  ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'bavi_main_db',
  COLLECTIONS: {
    PROJECTS: 'projects',
    LEADS: 'leads',
    CLIENT_PORTAL: 'client_portal',
    SERVICES: 'services'
  },
  BUCKETS: {
    PORTFOLIO_IMAGES: 'portfolio_media',
    CLIENT_DOCUMENTS: 'client_blueprints'
  }
};
```

### 3.2 Client SDK Setup (Browser Side)
Create `/src/lib/appwrite/client.ts`:
```typescript
import { Client, Account, Databases, Storage } from 'appwrite';
import { APPWRITE_CONFIG } from './config';

const client = new Client();

client
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

export const appwriteAccount = new Account(client);
export const appwriteDatabases = new Databases(client);
export const appwriteStorage = new Storage(client);
export { client as appwriteClient };
```

### 3.3 Server SDK Setup (SSR & Server Actions)
Create `/src/lib/appwrite/server.ts`:
```typescript
import { Client, Account, Databases, Storage, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { APPWRITE_CONFIG } from './config';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID);

  const sessionCookie = cookies().get('bavi_appwrite_session');

  if (!sessionCookie || !sessionCookie.value) {
    throw new Error('No active session found');
  }

  client.setSession(sessionCookie.value);

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); }
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT)
    .setProject(APPWRITE_CONFIG.PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!); // Secret Server Key

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); },
    get storage() { return new Storage(client); },
    get users() { return new Users(client); }
  };
}
```

### 3.4 Appwrite Permissions & Security Rules
Configuring Appwrite Permissions for Production:
1. **Projects Collection**:
   - `read("any")`: Anyone can view portfolio projects.
   - `create("team:admin")`, `update("team:admin")`, `delete("team:admin")`: Admin team only.
2. **Leads Collection**:
   - `create("any")`: Anyone can submit a consultation request.
   - `read("team:admin")`, `update("team:admin")`, `delete("team:admin")`: Strictly restricted to BAVI sales & management staff.
3. **Storage Buckets**:
   - `portfolio_media`: Read = `any`, Write = `team:admin`
   - `client_blueprints`: Read = `user:{client_id}`, Write = `team:admin`

---

## 4. Supabase Backend Configuration Guide (Alternative)

If you prefer PostgreSQL relational power, here is the complete setup for Supabase.

### 4.1 Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 4.2 Step 2: Database Schema (SQL Migration File)
Create `supabase/migrations/20260826_init_bavi.sql`:

```sql
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE project_category AS ENUM ('construction', 'interior', 'commercial', 'turnkey');
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'completed');
CREATE TYPE lead_status_type AS ENUM ('new', 'contacted', 'site_visited', 'quoted', 'closed', 'rejected');

-- 1. Projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category project_category NOT NULL DEFAULT 'construction',
    status project_status NOT NULL DEFAULT 'in_progress',
    client_name VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    area_sqft INT,
    budget_range VARCHAR(100),
    cover_image_url TEXT NOT NULL,
    gallery_urls TEXT[],
    description TEXT,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Leads Table
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    site_location VARCHAR(255),
    estimated_budget VARCHAR(100),
    notes TEXT,
    status lead_status_type DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Client Progress Table
CREATE TABLE public.client_portal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    completion_pct INT CHECK (completion_pct BETWEEN 0 AND 100),
    update_notes TEXT,
    site_photos TEXT[],
    blueprint_doc_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Projects
CREATE POLICY "Public Projects View" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin Full Access Projects" ON public.projects FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies: Leads
CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Only Admin can view leads" ON public.leads FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies: Client Portal
CREATE POLICY "Client can view own portal" ON public.client_portal FOR SELECT 
  USING (auth.uid() = client_user_id);
```

### 4.3 Supabase SSR Client Helpers
Create `/src/lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );
}
```

---

## 5. Appwrite to Supabase Migration & Comparison

If you start with Appwrite and later want to migrate to Supabase (or vice-versa), evaluate these architectural trade-offs:

### Feature Comparison Matrix

| Architectural Dimension | Appwrite | Supabase |
|---|---|---|
| **Database Engine** | MariaDB / MongoDB (Document store semantics) | PostgreSQL (Relational SQL engine) |
| **Querying Style** | Query SDK methods (`Query.equal()`, `Query.orderDesc()`) | SQL / PostgREST (`.select('*').eq()`) |
| **Access Control** | Resource-level Document & Collection Permissions | Row Level Security (RLS) via SQL policies |
| **Complex Joins** | Manual aggregation or Relationship attributes | Native SQL `JOIN` queries |
| **Realtime Updates** | WebSockets (`client.subscribe`) | Postgres CDC (Change Data Capture) |
| **File Storage** | Storage API (Buckets, Files, Compression built-in) | S3-backed Storage Buckets + RLS |

### Migration Steps (Appwrite → Supabase)

1. **Export Appwrite Data**: Use Appwrite Server SDK script to dump JSON records from Collections.
2. **Schema Translation**: Map JSON Document schemas to SQL `CREATE TABLE` DDL queries.
3. **Data Ingestion**: Run a Node.js batch script using `@supabase/supabase-js` `upsert` queries to load exported data into PostgreSQL.
4. **Storage Migration**: Download files from Appwrite Buckets (`storage.getFileDownload()`) and stream upload to Supabase Buckets (`supabase.storage.from().upload()`).
5. **Auth Users Migration**: Export users via Appwrite `users.list()` and import via Supabase `supabase.auth.admin.createUser()`.

---

## 6. Backend Abstraction Layer (Decoupling Architecture)

To ensure your Next.js application does **not** hardcode backend logic (allowing painless switches between Appwrite and Supabase), implement a Data Access Layer (DAL) interface.

### Step 6.1: Define Common Types
Create `/src/types/domain.ts`:
```typescript
export interface Project {
  id: string;
  title: string;
  slug: string;
  category: 'construction' | 'interior' | 'commercial' | 'turnkey';
  status: 'planning' | 'in_progress' | 'completed';
  clientName?: string;
  location: string;
  areaSqft?: number;
  budgetRange?: string;
  coverImageUrl: string;
  galleryUrls: string[];
  description: string;
  completionDate?: string;
}

export interface LeadSubmission {
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  siteLocation?: string;
  estimatedBudget?: string;
  notes?: string;
}
```

### Step 6.2: Define Abstract Service Contract
Create `/src/lib/backend/interface.ts`:
```typescript
import { Project, LeadSubmission } from '@/types/domain';

export interface IBackendService {
  getProjects(category?: string): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  createLead(lead: LeadSubmission): Promise<{ success: boolean; id: string }>;
}
```

### Step 6.3: Implement Appwrite Provider
Create `/src/lib/backend/appwrite-provider.ts`:
```typescript
import { IBackendService } from './interface';
import { Project, LeadSubmission } from '@/types/domain';
import { appwriteDatabases, appwriteStorage } from '../appwrite/client';
import { APPWRITE_CONFIG } from '../appwrite/config';
import { Query, ID } from 'appwrite';

export class AppwriteBackendProvider implements IBackendService {
  async getProjects(category?: string): Promise<Project[]> {
    const queries = [Query.orderDesc('$createdAt')];
    if (category) queries.push(Query.equal('category', category));

    const response = await appwriteDatabases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.PROJECTS,
      queries
    );

    return response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      category: doc.category,
      status: doc.status,
      clientName: doc.client_name,
      location: doc.location,
      areaSqft: doc.area_sqft,
      budgetRange: doc.budget_range,
      coverImageUrl: appwriteStorage.getFilePreview(
        APPWRITE_CONFIG.BUCKETS.PORTFOLIO_IMAGES,
        doc.cover_image_id
      ).href,
      galleryUrls: (doc.gallery_ids || []).map(
        (id: string) => appwriteStorage.getFilePreview(
          APPWRITE_CONFIG.BUCKETS.PORTFOLIO_IMAGES, 
          id
        ).href
      ),
      description: doc.description,
      completionDate: doc.completion_date,
    }));
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const response = await appwriteDatabases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.PROJECTS,
      [Query.equal('slug', slug), Query.limit(1)]
    );
    if (response.documents.length === 0) return null;
    const doc = response.documents[0];
    return {
      id: doc.$id,
      title: doc.title,
      slug: doc.slug,
      category: doc.category,
      status: doc.status,
      location: doc.location,
      coverImageUrl: appwriteStorage.getFilePreview(APPWRITE_CONFIG.BUCKETS.PORTFOLIO_IMAGES, doc.cover_image_id).href,
      galleryUrls: [],
      description: doc.description
    };
  }

  async createLead(lead: LeadSubmission): Promise<{ success: boolean; id: string }> {
    const res = await appwriteDatabases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.LEADS,
      ID.unique(),
      {
        full_name: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        service_type: lead.serviceType,
        site_location: lead.siteLocation,
        estimated_budget: lead.estimatedBudget,
        notes: lead.notes,
        lead_status: 'new'
      }
    );
    return { success: true, id: res.$id };
  }
}
```

### Step 6.4: Implement Supabase Provider
Create `/src/lib/backend/supabase-provider.ts`:
```typescript
import { IBackendService } from './interface';
import { Project, LeadSubmission } from '@/types/domain';
import { createSupabaseServerClient } from '../supabase/server';

export class SupabaseBackendProvider implements IBackendService {
  async getProjects(category?: string): Promise<Project[]> {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      category: item.category,
      status: item.status,
      clientName: item.client_name,
      location: item.location,
      areaSqft: item.area_sqft,
      budgetRange: item.budget_range,
      coverImageUrl: item.cover_image_url,
      galleryUrls: item.gallery_urls || [],
      description: item.description,
      completionDate: item.completion_date,
    }));
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).single();
    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: data.category,
      status: data.status,
      location: data.location,
      coverImageUrl: data.cover_image_url,
      galleryUrls: data.gallery_urls || [],
      description: data.description,
    };
  }

  async createLead(lead: LeadSubmission): Promise<{ success: boolean; id: string }> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('leads').insert([{
      full_name: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      service_type: lead.serviceType,
      site_location: lead.siteLocation,
      estimated_budget: lead.estimatedBudget,
      notes: lead.notes,
      status: 'new'
    }]).select().single();

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  }
}
```

### Step 6.5: Factory Provider Selector
Create `/src/lib/backend/index.ts`:
```typescript
import { IBackendService } from './interface';
import { AppwriteBackendProvider } from './appwrite-provider';
import { SupabaseBackendProvider } from './supabase-provider';

const BACKEND_PROVIDER = process.env.NEXT_PUBLIC_BACKEND_PROVIDER || 'appwrite';

export function getBackendService(): IBackendService {
  if (BACKEND_PROVIDER === 'supabase') {
    return new SupabaseBackendProvider();
  }
  return new AppwriteBackendProvider();
}
```

---

## 7. Next.js Project Blueprint & Code Structure

### Directory Architecture
```
BAVI/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                  # Home Page (Dual Brand Hero)
│   │   │   ├── builders/                 # Bahubali Builders Showcase
│   │   │   │   └── page.tsx
│   │   │   ├── interiors/                # Visionary Interiors Showcase
│   │   │   │   └── page.tsx
│   │   │   ├── portfolio/
│   │   │   │   ├── page.tsx              # Portfolio Grid
│   │   │   │   └── [slug]/page.tsx       # Project Case Study Details
│   │   │   └── contact/                  # Lead Capture Form
│   │   │       └── page.tsx
│   │   ├── (auth)/                       # Login / Signup Modal / Routes
│   │   │   ├── login/page.tsx
│   │   ├── client-portal/                # Authenticated Progress Tracker
│   │   │   └── page.tsx
│   │   └── api/                          # Next.js API Routes / Webhooks
│   ├── components/
│   │   ├── ui/                           # Reusable UI Atoms (Buttons, Cards)
│   │   ├── layout/                       # Navbar, Footer, Dual Brand Switcher
│   │   ├── forms/                        # Consultation Form with Validation
│   │   └── portfolio/                    # Interactive Gallery & Filters
│   ├── lib/
│   │   ├── appwrite/                     # Appwrite Low-level Clients
│   │   ├── supabase/                     # Supabase Low-level Clients
│   │   └── backend/                      # Decoupled Abstraction Layer
│   ├── types/
│   │   └── domain.ts                     # Strict TypeScript Interfaces
│   └── styles/
│       └── globals.css                   # Core Design Tokens
```

### Sample Implementation: Consultation Server Action
Create `/src/app/contact/actions.ts`:
```typescript
'use server';

import { getBackendService } from '@/lib/backend';
import { LeadSubmission } from '@/types/domain';

export async function submitConsultationLead(formData: FormData) {
  try {
    const rawData: LeadSubmission = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      serviceType: formData.get('serviceType') as string,
      siteLocation: formData.get('siteLocation') as string,
      estimatedBudget: formData.get('estimatedBudget') as string,
      notes: formData.get('notes') as string,
    };

    if (!rawData.fullName || !rawData.phone) {
      return { error: 'Name and Phone are mandatory.' };
    }

    const backend = getBackendService();
    const result = await backend.createLead(rawData);

    return { success: true, leadId: result.id };
  } catch (err: any) {
    return { error: err.message || 'Failed to submit lead inquiry.' };
  }
}
```

---

## 8. Role-Based Access Control (RBAC) & Security

### Role Architecture
1. **Visitor (Unauthenticated)**:
   - View Bahubali Builders & Visionary Interiors portfolios.
   - Submit consultation leads.
2. **Client (Authenticated)**:
   - Access `/client-portal` to view assigned active site updates, structural blueprints, and payment status.
3. **Site Manager / Engineer (Admin Team)**:
   - Upload weekly site photos, update progress percentage.
4. **Super Admin**:
   - Manage all leads, publish new portfolio projects, manage user permissions.

### Next.js Middleware Route Protection
Create `middleware.ts` in project root:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('bavi_appwrite_session') || request.cookies.get('sb-access-token');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/client-portal');

  if (isAuthRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/client-portal/:path*'],
};
```

---

## 9. Production Deployment & Operations Checklist

### Environment Variables Checklist (.env.production)

```env
# APP CONFIG
NEXT_PUBLIC_SITE_URL=https://bahubalibuilders.com
NEXT_PUBLIC_BACKEND_PROVIDER=appwrite # Or 'supabase'

# APPWRITE CONFIG
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=bavi_production_db
APPWRITE_API_KEY=your_secret_server_api_key

# SUPABASE CONFIG (If Swapping)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Pre-Launch Checklist
- [ ] Database Indexes created on `slug`, `category`, `status`, and `created_at`.
- [ ] CORS domains configured in Appwrite/Supabase dashboard to strictly match `https://bahubalibuilders.com`.
- [ ] File Upload File Size Limits set (e.g., 10MB limit for high-res images, 50MB for PDF blueprints).
- [ ] Image Optimization via `next/image` configured with remote domain patterns.
- [ ] Automated daily backup strategy enabled on Appwrite Cloud or Supabase Postgres.

---
*Document Version: 1.0.0 | Created for Bahubali Builders & Visionary Interiors Architecture*
