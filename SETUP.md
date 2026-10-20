# 🚀 Nova — Prerequisites & Developer Setup Guide

Welcome to **Nova**! This guide contains a numbered, beginner-friendly checklist to get your local environment configured and all required services (Supabase, Google Gemini, Google OAuth, Spline, Upstash) connected.

---

## 📋 Table of Contents
1. [Initial Installation & Environment Files](#1-initial-installation--environment-files)
2. [Supabase Project Setup & API Keys](#2-supabase-project-setup--api-keys)
3. [Database Extensions & Storage Configuration](#3-database-extensions--storage-configuration)
4. [Google OAuth Configuration](#4-google-oauth-configuration)
5. [Supabase Auth URL Configuration](#5-supabase-auth-url-configuration)
6. [Google Gemini AI API Setup](#6-google-gemini-ai-api-setup)
7. [Spline 3D Scene Setup (Optional)](#7-spline-3d-scene-setup-optional)
8. [Upstash Redis Setup (Optional)](#8-upstash-redis-setup-optional)
9. [Verification & Running the App](#9-verification--running-the-app)
10. [Common Errors & Troubleshooting Table](#10-common-errors--troubleshooting-table)

---

## 1. Initial Installation & Environment Files

1. Make sure you have **Node.js 20+** installed.
2. In the project root, make a copy of the environment template:
   ```bash
   cp .env.example .env.local
   ```
   > ⚠️ **Security Warning**: `.env.local` is listed in `.gitignore` and must **never** be committed to version control.
3. Install project dependencies (if not already done):
   ```bash
   npm install
   ```

---

## 2. Supabase Project Setup & API Keys

1. Sign up or log in to [Supabase](https://supabase.com).
2. Click **"New Project"**, select your organization, assign a project name (e.g., `nova-dev`), set a secure database password, and choose a region close to your users.
3. Once the project dashboard is ready, navigate to:
   - **Project Settings** (gear icon at the bottom left) ➔ **API**.
4. Copy the following keys and paste them into your `.env.local`:
   - **Project URL**:
     ```env
     NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
     ```
   - **Project API Keys ➔ `anon` `public`**:
     ```env
     NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
     ```
   - **Project API Keys ➔ `service_role` `secret`**:
     ```env
     SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
     ```
   > 🚨 **Critical**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security (RLS). Keep it strictly server-side.

---

## 3. Database Extensions & Storage Configuration

### A. Enable Database Extensions
1. In the Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **"New Query"**, paste the SQL below (from `supabase/migrations/0000_extensions.sql`), and click **Run**:
   ```sql
   -- Enable vector extension for AI embeddings and similarity search
   CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

   -- Enable pgcrypto for cryptographic functions and UUID generation
   CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
   ```
3. Verify that the query returns `Success. No rows returned`.

### B. Create Private Storage Bucket
1. Click **Storage** in the left sidebar.
2. Click **"New Bucket"**.
3. Fill in the bucket details:
   - **Name**: `documents`
   - **Public bucket**: **Disabled (OFF)** (this keeps documents private and protected by RLS).
   - Click **Save**.
4. (Optional) Under **Policies**, configure Row Level Security (RLS) rules so that authenticated users can only view or upload their own documents:
   ```sql
   -- Allow authenticated users to upload to documents bucket
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'documents');

   -- Allow users to read their own files
   CREATE POLICY "Allow authenticated read"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

---

## 4. Google OAuth Configuration

### A. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. In the search bar, search for **"OAuth consent screen"**:
   - User Type: Select **External** and click **Create**.
   - Fill in **App name** (`Nova`), **User support email**, and **Developer contact information**.
   - Click **Save and Continue** through Scopes (default scopes: `email`, `profile`, `openid` are sufficient).
4. Navigate to **Credentials** in the left sidebar:
   - Click **+ CREATE CREDENTIALS** ➔ **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Nova Web Client`.
   - **Authorized redirect URIs** ➔ Click **+ ADD URI**.
   - Enter your Supabase callback URL in this exact format:
     ```
     https://<your-supabase-project-id>.supabase.co/auth/v1/callback
     ```
     *(Example: `https://abcdefghijklm.supabase.co/auth/v1/callback`)*
   - Click **Create**.
5. Copy the generated **Client ID** and **Client Secret**.

### B. Configure Provider in Supabase
1. In your Supabase dashboard, go to **Authentication** ➔ **Providers**.
2. Find **Google** and click to expand it.
3. Toggle **Enable Google provider** to **ON**.
4. Paste your **Client ID** and **Client Secret** from Google Cloud.
5. Click **Save**.

---

## 5. Supabase Auth URL Configuration

1. In the Supabase dashboard, go to **Authentication** ➔ **URL Configuration**.
2. **Site URL**:
   - For local development, set this to:
     ```
     http://localhost:3000
     ```
   - When deploying to production, update this to your primary production URL (e.g., `https://nova.vercel.app`).
3. **Redirect URLs**:
   Add the following patterns to the allowlist (one per line):
   ```
   http://localhost:3000/**
   https://*-your-team.vercel.app/**
   https://nova.vercel.app/**
   ```
4. Click **Save**.

---

## 6. Google Gemini AI API Setup

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Get API key"** ➔ **"Create API key in new project"** (or choose an existing GCP project).
4. Copy the API key and paste it into `.env.local`:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```
5. Default models configured in `.env.local`:
   ```env
   GEMINI_CHAT_MODEL="gemini-2.5-flash"
   GEMINI_EMBEDDING_MODEL="text-embedding-004"
   ```
   You can swap these to other supported Gemini models at any time without code changes.

---

## 7. Spline 3D Scene Setup (Optional)

1. Open [Spline 3D](https://spline.design) or choose any public community scene.
2. In the top toolbar, click **Export**.
3. Under **Code**, select **Viewer URL** or copy the `.splinecode` URL:
   ```
   https://prod.spline.design/example-scene-id/scene.splinecode
   ```
4. Paste into `.env.local`:
   ```env
   NEXT_PUBLIC_SPLINE_SCENE_URL="https://prod.spline.design/your_scene_id/scene.splinecode"
   ```
   > 💡 **Graceful Fallback**: If `NEXT_PUBLIC_SPLINE_SCENE_URL` is empty, Nova automatically falls back to lightweight CSS/SVG animations so development is never blocked.

---

## 8. Upstash Redis Setup (Optional)

Upstash provides serverless Redis for distributed rate-limiting and caching.

1. Sign up or log in to [Upstash Console](https://console.upstash.com/).
2. Click **"Create Database"**:
   - Name: `nova-cache`
   - Primary Region: Choose the region closest to your Vercel deployment.
3. In the database details page, scroll down to the **REST API** section.
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` and paste them into `.env.local`:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-database-id.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="AY12AS..."
   ```
   > 💡 **In-Memory Fallback**: If left empty, Nova automatically uses an in-memory rate limiter in local development.

---

## 9. Verification & Running the App

### Step 1: Validate Environment Variables
Run the automated environment validator:
```bash
npm run check-env
```
This prints a clean table verifying each variable:
- `✅ set` for valid configuration.
- `❌ missing` if a required variable is missing or invalid.
- `⚠️ optional-not-set` for optional variables.

### Step 2: Start Development Server
```bash
npm run dev
```
*(The `predev` script will automatically run `check-env` before launching the server).*

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 10. Common Errors & Troubleshooting Table

| Error / Symptom | Probable Cause | Exact Solution |
| :--- | :--- | :--- |
| **`redirect_uri_mismatch` (Google OAuth)** | Google Cloud Console authorized redirect URI does not match Supabase callback. | Check Google Cloud Console ➔ Credentials ➔ OAuth Client. Ensure `https://<supabase-project-id>.supabase.co/auth/v1/callback` is listed under **Authorized redirect URIs** with no trailing spaces. |
| **`AuthApiError: redirect_to URL not allowed`** | The redirect URL is not whitelisted in Supabase. | Open Supabase ➔ **Authentication** ➔ **URL Configuration** ➔ **Redirect URLs**. Add `http://localhost:3000/**` and your Vercel deployment domain patterns. |
| **`type "vector" does not exist`** | `pgvector` extension was not enabled in PostgreSQL. | Open Supabase ➔ **SQL Editor**. Run `CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";`. |
| **`new row violates row-level security policy`** | Row Level Security (RLS) is enabled on a table without an `INSERT` policy for the user. | In Supabase SQL Editor, verify your RLS policy allows `INSERT` for the `authenticated` or `anon` role, or ensure server-side administrative tasks use `SUPABASE_SERVICE_ROLE_KEY`. |
| **`StorageApiError: Bucket not found`** | The `documents` bucket has not been created. | Open Supabase ➔ **Storage** ➔ **New Bucket**. Create a private bucket named `documents`. |
| **`Security Guard: Attempted to access server-only environment variable ... on the client`** | A client component (`"use client"`) tried to import `serverEnv` from `@/lib/env`. | Do not import `serverEnv` in client components. Move the logic that needs secrets (e.g., Gemini API, Service Role key) to a Server Action or Route Handler (`app/api/...`), and only pass back client-safe data. |
| **Spline Scene Black Screen / WebGL Crash** | Invalid Spline URL or WebGL acceleration disabled in the browser. | Verify `NEXT_PUBLIC_SPLINE_SCENE_URL` ends in `.splinecode` and is publicly accessible. Check that browser hardware acceleration is enabled. Leave blank to trigger the fallback UI. |
| **`Gemini API Error 400 / 403`** | Missing or invalid Gemini API key or model identifier. | Verify `GEMINI_API_KEY` in `.env.local` matches your key from Google AI Studio, and that the Generative Language API is enabled for your Google Cloud project. |
| **`npm run dev` fails with exit code 1** | A required environment variable is missing in `.env.local`. | Run `npm run check-env` to see which required variable is marked with `❌ missing` in the report table. Fill it in `.env.local`. |
