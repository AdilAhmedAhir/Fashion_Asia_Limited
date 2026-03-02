# 🚀 FASHION ASIA LIMITED - PLATFORM HANDOVER MANUAL

**Project Status:** 100% COMPLETE (v1.2.0)
**Engineered By:** Adil Ahmed
**Tech Stack:** Next.js 15 App Router, GSAP, Framer Motion, Tailwind, Supabase (PostgreSQL, Auth, Edge Storage), Vercel.

Welcome to your new enterprise digital platform. The technical build is complete. This document contains the operational instructions for your management team.

## 1. REVIEWING THE 6 CINEMATIC CONCEPTS
Your website is currently live on your temporary Vercel URL. We have integrated **6 different cinematic 4K video concepts** into the high-performance scrolling engine.

**To review them:**
1. Go to your live website.
2. Hover over "Home" in the desktop navigation (or click "01 Home" on mobile).
3. Select a concept from the dropdown menu to instantly load it.
4. *Once you choose a final winner, we can easily lock that specific video in and remove the dropdown menu.*

## 2. THE CONTENT MANAGEMENT SYSTEM (CMS)
Your platform includes a secure, custom-built Admin Dashboard.

**CMS Login URL:** `https://[YOUR_VERCEL_DOMAIN]/admin/login`

*(Adil: Ensure you have created the client's admin email and password in the Supabase Dashboard -> Authentication -> Users tab before handing this over).*

## 3. MANAGING FORM SUBMISSIONS
All secure forms submitted on the website are routed directly to your CMS database.
1. Log into the CMS.
2. Click **Submissions** in the left sidebar.
3. Use the tabs to toggle between:
   - **Contact:** General business inquiries.
   - **Career:** Job applications and CV links.
   - **Grievance:** Confidential factory reports.

## 4. PUBLISHING TO THE MEDIA CENTER
You have full control over the `/media` page. You can upload photos to the Factory Gallery or publish text-based Press Releases.
1. Log into the CMS and click **Media Center**.
2. **To upload a Photo Gallery Image:**
   - Enter a Title (e.g., "Factory Floor").
   - Select "Photo Gallery" as the Category.
   - Click "Choose File" and select an image.
   - Click "Publish to Site".
3. **To publish News/Press Releases:**
   - Enter a Title.
   - Select "Press / News" as the Category.
   - Type or paste your article into the "Text Content" box.
   - Click "Publish to Site".

## 5. FINAL LAUNCH INSTRUCTIONS (FOR ADIL)
To attach the client's official `.com` or `.ltd` domain:
1. Go to **Vercel -> Settings -> Domains** and add the domain.
2. Update the DNS records in your domain registrar (GoDaddy, Namecheap, etc.).
3. Update `NEXT_PUBLIC_SITE_URL` in **Vercel -> Settings -> Environment Variables** to the new domain (required for perfect SEO/OpenGraph sharing).
4. Update the **Site URL** in **Supabase -> Authentication -> URL Configuration** to the new domain (required for secure login).

---
*System Architecture Verified & Locked.*
