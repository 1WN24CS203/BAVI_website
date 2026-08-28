# 🚀 Vercel Deployment Guide — BAVI Platform

This guide teaches you step-by-step how to deploy both the **Customer Portal** and the **Designer Command Portal** to Vercel from this repository.

Because BAVI contains two distinct Next.js applications inside a single repository (`website/User-side` and `website/Designer-side`), you will create **two separate Vercel projects** pointing to the same GitHub repository, each configured with its own **Root Directory**.

---

## 📋 Prerequisites

1. A free account on [Vercel](https://vercel.com).
2. A free account on [GitHub](https://github.com).
3. A free account on [Supabase](https://supabase.com).
4. Free [Stripe Test Mode Keys](https://dashboard.stripe.com/test/apikeys) (`pk_test_...` and `sk_test_...`).

---

## 1️⃣ Step 1: Push Your Project to GitHub

In your project root terminal:

```bash
# Initialize git if not already initialized
git init

# Add all project files
git add .

# Commit changes
git commit -m "Initial commit: BAVI Customer & Designer Portals"

# Create a new repository on GitHub (e.g. github.com/your-username/BAVI)
# Then link and push:
git remote add origin https://github.com/your-username/BAVI.git
git branch -M main
git push -u origin main
```

---

## 2️⃣ Step 2: Deploy Customer Portal (`User-side`) to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** ➔ **"Project"**.
2. Select and import your **`BAVI`** repository from GitHub.
3. Configure Project Settings:
   - **Project Name**: `bavi-customer-portal` (or your preferred domain name)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `website/User-side` ⚠️ *(Critical Step)*
4. Under **Environment Variables**, add the following keys:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyzcompany.supabase.co` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Anon Public API Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51...` | Stripe Test Mode Publishable Key |
| `STRIPE_SECRET_KEY` | `sk_test_51...` | Stripe Test Mode Secret Key |
| `NEXT_PUBLIC_SITE_URL` | `https://bavi-customer-portal.vercel.app` | Production URL of Customer Portal |
| `NEXT_PUBLIC_DESIGNER_PORTAL_URL` | `https://bavi-designer-portal.vercel.app` | Production URL of Designer Portal |

5. Click **"Deploy"**.
6. Once deployment finishes, you will receive a live URL (e.g. `https://bavi-customer-portal.vercel.app`).

---

## 3️⃣ Step 3: Deploy Designer Portal (`Designer-side`) to Vercel

1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** ➔ **"Project"** again.
2. Select the **same `BAVI` GitHub repository**.
3. Configure Project Settings:
   - **Project Name**: `bavi-designer-portal`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `website/Designer-side` ⚠️ *(Critical Step)*
4. Under **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyzcompany.supabase.co` | Same Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Same Supabase Anon Public API Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51...` | Stripe Test Publishable Key |
| `STRIPE_SECRET_KEY` | `sk_test_51...` | Stripe Test Secret Key |
| `NEXT_PUBLIC_SITE_URL` | `https://bavi-customer-portal.vercel.app` | URL of Customer Portal |
| `NEXT_PUBLIC_DESIGNER_PORTAL_URL` | `https://bavi-designer-portal.vercel.app` | URL of Designer Portal |

5. Click **"Deploy"**.
6. Once finished, you will receive your live Designer Portal URL (e.g. `https://bavi-designer-portal.vercel.app`).

---

## 4️⃣ Step 4: Run Supabase SQL Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Click on **"SQL Editor"** in the left sidebar.
3. Open [`Doccumentation/schema.sql`](file:///Doccumentation/schema.sql) from this project.
4. Copy and paste all the SQL commands into the Supabase editor and click **Run**.
5. This automatically provisions:
   - All 10 database tables with foreign keys and indexes.
   - Row-Level Security (RLS) policies.
   - Seed data for master designers (`BAVI-DES-7890`, `BAVI-DES-1024`), demo clients (`Rajesh Sharma`, `Pooja Reddy`), projects, milestones, site details, and highlighted designs.

---

## 5️⃣ Step 5: Custom Domain Setup (Optional)

If you own a custom domain (e.g. `bavi.in`):
1. In Vercel, go to `bavi-customer-portal` ➔ **Settings** ➔ **Domains** ➔ Add `bavi.in` and `www.bavi.in`.
2. Go to `bavi-designer-portal` ➔ **Settings** ➔ **Domains** ➔ Add subdomain `admin.bavi.in` or `designer.bavi.in`.
3. Add the corresponding DNS CNAME / A records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) as instructed by Vercel.

---

## 🔄 Automatic Continuous Deployment (CI/CD)

Whenever you make updates and run `git push origin main`, Vercel will automatically:
- Detect which folder was modified (`User-side` or `Designer-side`).
- Rebuild and deploy only the changed portal in seconds with zero downtime.
