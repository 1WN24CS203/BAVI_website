# BAVI Architecture & Schema Simplification Guide

This document explains the simplified, debug-friendly database schema and code structure of the BAVI platform.

---

## 1. Simplified Database Schema (5 Core Domains)

Previously, the project had a destructive `schema.sql` (with `DROP TABLE CASCADE`) and an incremental patch `migration_v2_1.sql`. They have now been consolidated into a single master **[schema.sql](file:///c:/Users/prath/OneDrive%20-%20bmsce.ac.in/Desktop/New%20folder%20%282%29/BAVI/website/schema.sql)** that is:
* **100% Non-destructive**: Never drops tables or columns. Safe on fresh or existing databases.
* **Idempotent**: Can be executed repeatedly without errors (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).
* **Grouped into 5 Easy-to-Remember Domains**:

```
+----------------------------------------------------------------------------------+
|                            BAVI 5-DOMAIN ARCHITECTURE                            |
+----------------------------------------------------------------------------------+
| 1. IDENTITY & AUTH       departments | designers | profiles | access_requests    |
| 2. PROJECT ENGINE        projects | project_stages | stage_documents             |
| 3. CLIENT CONCIERGE      callback_requests | consultations | payments | reviews  |
| 4. SITE OPERATIONS       site_details | materials | contractors | safety         |
| 5. SYSTEM GOVERNANCE     activity_log | permissions | department_change_requests |
+----------------------------------------------------------------------------------+
```

### Domain Breakdown

| Domain | Key Tables | Purpose |
|---|---|---|
| **Identity & Access** | `departments`<br>`designers`<br>`profiles`<br>`designer_access_requests` | Role-based authentication (Owner, Architect, Contractor, Marketer, Client). Stores council registration numbers and password hashes. Auto-syncs with `auth.users`. |
| **Project Engine** | `projects`<br>`project_stages`<br>`stage_documents` | Core architectural milestone tracking. Projects table stores `stages`, `milestones`, and `srs_content` directly as JSONB for instant loading without complex SQL joins. |
| **Client Concierge** | `callback_requests`<br>`consultations`<br>`payments`<br>`reviews`<br>`client_password_log` | Handles gated client onboarding (callbacks attended before account issuance), UPI bill settlements, appointment bookings, and client password change logs. |
| **Site Operations** | `site_details`<br>`materials`<br>`contractors`<br>`quality_inspections`<br>`safety_records`<br>`equipment` | Geotechnical coordinates, bill of quantities (BOQ), contractor directory, HSE safety briefings, and equipment logistics. |
| **Governance & Audit** | `activity_log`<br>`access_permissions`<br>`department_change_requests`<br>`email_change_requests` | Immutable audit trail of administrative actions, cross-department boundary enforcement, and portfolio showcase. |

---

## 2. Code Simplification & Abstraction

### A. Centralized Data Access Layer ([dataStore.js](file:///c:/Users/prath/OneDrive%20-%20bmsce.ac.in/Desktop/New%20folder%20%282%29/BAVI/website/Designer-side/src/lib/dataStore.js))
Previously, every dashboard page repeated 20-30 lines of boilerplate checking `isSupabaseConfigured()`, wrapping queries in `try/catch`, and falling back to `localStorage`.

`dataStore.js` unifies this into simple, debuggable helper functions:
```javascript
import { fetchCollection, saveRecord, getLocalItem, setLocalItem } from '@/lib/dataStore';

// Fetch collection from Supabase, or use LocalStorage fallback if offline
const data = await fetchCollection('consultations', 'bavi_client_consultations', []);

// Persist record to LocalStorage and push to Supabase in parallel
await saveRecord('consultations', 'bavi_client_consultations', newBooking);
```

### B. Consolidated Dashboard Styling (`shared.module.css`)
* Replaced redundant CSS classes (`.card`, `.container`, `.grid`, `.badge`) across individual page modules with a single unified module:
  * [Designer-side shared.module.css](file:///c:/Users/prath/OneDrive%20-%20bmsce.ac.in/Desktop/New%20folder%20%282%29/BAVI/website/Designer-side/src/app/dashboard/shared.module.css)
  * [User-side shared.module.css](file:///c:/Users/prath/OneDrive%20-%20bmsce.ac.in/Desktop/New%20folder%20%282%29/BAVI/website/User-side/src/app/dashboard/shared.module.css)
* Uses native Astryx design tokens:
  * Glassmorphism background: `var(--astryx-surface-1)`
  * Accent borders: `var(--astryx-border-gold)`
  * Gold typography: `var(--astryx-gold-light)`

---

## 3. Client Account & Credential Security Flow

```
1. Prospective Client Submits Inquiry
   │  (register page or landing page callback form)
   ▼
2. Appears in Designer "Callback Requests"
   │  Status: "PENDING"
   │  *Account creation is LOCKED at this stage*
   ▼
3. Architect Conducts Phone / Site Discussion
   │  Architect marks inquiry as "ATTENDED"
   ▼
4. Architect Initiates Project Booking
   │  Assigns Client Code (BAVI-CLI-XXXX)
   │  Assigns Temporary Password (Bavi#XXXX@XXXX)
   │  Credentials dispatched to client email
   ▼
5. Client Logs in to Private Portal
   │  Can update password directly at any time from Profile tab
   │  Updates take effect immediately and log to client_password_log
```
