# BAVI Platform — Setup & Architecture Guide

Welcome to the **BAVI (Bahubali Builders & Visionary Interiors)** platform documentation.

The platform is structured into **two independent applications** operating on separate ports / domains, backed by a unified Supabase database schema and Stripe (Test Mode) payment processing.

---

## 📁 Architecture Overview

```
BAVI/
├── website/                    ← CUSTOMER PORTAL (Next.js - Port 3000)
│   ├── public/                 ← Assets, logo.png, project images
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/       ← Public landing, projects, about, contact
│   │   │   ├── (auth)/         ← Customer Login & Registration
│   │   │   ├── dashboard/      ← Customer Protected Dashboard
│   │   │   │   ├── project/    ← My Project Details & Milestones
│   │   │   │   ├── site/       ← Site Details & Approvals
│   │   │   │   ├── consultations/ ← Consultation Booking & History
│   │   │   │   ├── payments/   ← Stripe Test Mode Checkout & Receipts
│   │   │   │   ├── reviews/    ← Client Reviews & Feedback
│   │   │   │   └── profile/    ← Customer Profile Settings
│   │   │   └── api/
│   │   │       ├── stripe/     ← Stripe Checkout Session & Verify
│   │   │       └── contact/    ← Contact Inquiry Handler
│   │   ├── components/         ← Reusable luxury UI components
│   │   ├── context/            ← Customer AuthContext
│   │   └── lib/                ← Supabase & Stripe Clients
│   └── package.json
│
├── designer-portal/            ← DESIGNER PORTAL (Next.js - Port 3001)
│   ├── public/                 ← Assets, logo.png
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/          ← Designer Login (Email + Password + Company Code)
│   │   │   ├── dashboard/      ← Designer Analytics & Overview
│   │   │   ├── customers/      ← Customer Management & Details
│   │   │   ├── projects/       ← Project Management & Milestone Tracking
│   │   │   ├── consultations/  ← Consultation Calendar & Approvals
│   │   │   ├── payments/       ← Payment Tracking & Manual Receipts
│   │   │   ├── designs/        ← Highlighted Homepage Designs
│   │   │   └── profile/        ← Designer Profile & Company Code
│   │   ├── components/         ← Designer Sidebar, Header, Modals
│   │   ├── context/            ← Designer AuthContext with Company Code Check
│   │   └── lib/                ← Supabase Client & Utils
│   └── package.json
│
└── Doccumentation/
    ├── schema.sql              ← Supabase PostgreSQL Schema & Seed Data
    └── SETUP_GUIDE.md          ← This file
```

---

## 🔑 Default Test Credentials & Company Codes

### 1. Designer Login (`http://localhost:3001/login`)
| Designer Name | Email | Password | Company Code | Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Arun Bahubali** | `arun.designer@bavi.in` | `Designer@123` | `BAVI-DES-7890` | Principal Architect & Luxury Villas |
| **Ananya Hegde** | `ananya.interiors@bavi.in` | `Designer@123` | `BAVI-DES-1024` | Head of Visionary Interior Design |

> **Note**: Designer login requires the unique **Company Code** assigned to that designer. If the company code does not match, access is strictly denied.

### 2. Customer Login (`http://localhost:3000/login`)
| Customer Name | Email | Password | Assigned Project |
| :--- | :--- | :--- | :--- |
| **Rajesh Sharma** | `rajesh.sharma@example.com` | `Customer@123` | *The Grand Serenity Villa* |
| **Pooja Reddy** | `pooja.reddy@example.com` | `Customer@123` | *Whitefield Penthouse Renovation* |

---

## 📱 UPI QR Code Payment & Database Bill Storage (Zero-Fee, No PAN)

The platform is configured with a **Direct UPI QR Payment Settlement** system:
1. **Dynamic Scannable QR Code**: Automatically generated for each milestone linked to your corporate UPI ID (e.g. `bavi.builders@upi`).
2. **Instant Mobile Intent**: 1-click button to open in **Google Pay, PhonePe, Paytm, or BHIM**.
3. **12-Digit UTR Proof**: Client enters the transaction reference number.
4. **Permanent Database Tax Bill**: Generates an official BAVI tax invoice stored in Supabase with receipt numbers (`BAVI-UPI-2026-XXXX`).
5. **Architect Verification**: Designers can inspect and confirm UTR settlements directly in the Designer Portal.

You can customize the UPI ID in your `.env.local` files:
```env
NEXT_PUBLIC_UPI_ID=yourname@upi
NEXT_PUBLIC_UPI_NAME=BAVI Builders
```

---

## 🚀 How to Run Locally

### Terminal 1: Customer Portal (Port 3000)
```bash
cd "website/User-side"
npm run dev
# Accessible at: http://localhost:3000
```

### Terminal 2: Designer Portal (Port 3001)
```bash
cd "website/Designer-side"
npm run dev
# Accessible at: http://localhost:3001
```

---

## 🗄️ Supabase Setup Instructions

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `Doccumentation/schema.sql`, copy all contents, and click **Run**.
4. Go to **Project Settings -> API** in Supabase:
   - Copy **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon public API Key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Paste these into `website/User-side/.env.local` and `website/Designer-side/.env.local`.
