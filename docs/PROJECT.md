# PROJECT.md — Vision & Scope

> **GENESIS Phase 1, existing-project variant, 2026-09-28.** The owner delegated the Founder
> Table answers to the orchestrator: "This is a complete site… answer them yourself." Every
> answer below is derived from the live site and the V5 record (`docs/VISION.md`,
> `docs/MEMORY_BANK.md`, the client's 18-item feedback list). GATE 1 (idea lock) still needs
> the owner's explicit yes, recorded in `docs/DECISIONS.md`.

## What this is
The corporate website and client-editable CMS for **Fashion Asia Limited (FAL)**, a 100%
export-oriented knitwear manufacturer in Sreepur, Gazipur, Bangladesh, and a sister concern of
Northern Tosrifa Group. It is live at `www.fal.com.bd` and `www.fashionasialtd.com`; both
domains serve the same Vercel deployment. It exists for two reasons:
- to show international apparel buyers that FAL can make what they need;
- to let FAL's own staff keep that proof current without a developer.

**In plain terms:** it's FAL's shop window for foreign clothing brands, and FAL's staff can
change what's in the window themselves.

## Reality map (what exists on 2026-09-28)

**Works:**
- **Public pages:** the cinematic homepage; `/who-we-are`; `/what-we-do` with 8 clickable
  category pages (live since 2026-09-28); `/global-partner`; `/sustainability` with
  published reports; `/life-at-fashion-asia` (the gallery).
- **Public forms:** contact, career and grievance forms, all writing to Supabase
  `submissions`.
- **Admin, all behind Supabase email and password:**
  - page editors: homepage, who-we-are, business/categories, who-we-work-with,
    sustainability;
  - products within categories (new);
  - media gallery, jobs, reports and leaders;
  - the submissions inbox.

**Pretends or is broken:**
- The `/admin/settings` Contact and General editors save, but nothing public reads them
  (MEMORY_BANK Known Trap #7).
- The homepage "Business" strip is unlinked and has drifted from the catalog: 6 names
  against 8 categories.
- Media Center uploads are unvalidated and fail silently (T-019).
- Report PDFs over 1 MB can't be uploaded, because of Next.js's Server Action body limit.
- About 160 dead hero-frame requests fire on every desktop visit (T-017).
- Every category page shows "Coming Soon" until staff add products, and the one-time
  `/admin/business` bootstrap Save is still pending.

**Audience signal:** there is no analytics, and none is installed by design. Audiences are
known from the forms and the brief: buyers and sourcing managers, job seekers, factory workers
(grievance), and FAL content staff.

## The Founder Table (answered from reality)

1. **Who exactly is this for?**
   - **Primary:** a sourcing or merchandising manager at an international apparel brand who
     is evaluating FAL as a knitwear supplier.
   - **Secondary:** FAL's content editor, who keeps that evidence current.
   - **Also served:** job seekers (career form), and workers and auditors (the grievance
     channel, which buyers expect export factories to run).
2. **What do they do today without it?**
   - **Buyers:** they rely on PDFs and emails from FAL's merchandisers, trade fairs and
     factory audits. Online, until 2026-09-28, they found one photo per category and cards
     that went nowhere.
   - **Staff:** any catalog change needed a developer.
3. **What is the ONE painful moment this removes?** A buyer clicks a category and sees what
   FAL actually makes, without waiting for a PDF, because FAL staff published it themselves
   that day.
4. **Why now, and why FAL?** The capability already exists: 26 production lines, 800,000
   pieces a month, certifications and sustainability reporting. The CMS already exists, and
   the client asked for exactly this in the feedback list.
5. **The 10-star version:**
   - **The dream:** a digital showroom with deep, photographed categories, capacity and
     certification proof, buyer inquiries tied to specific products and routed to a
     merchandiser, and transparent sustainability reporting.
   - **Cut back to real:** a catalog staff can fill, an admin that never fails silently, and
     forms that work.
6. **What is deliberately NOT in v1?** See the NOT-list below. It's longer than the feature
   list on purpose.
7. **What does success look like in 90 days?** By **2026-12-27**, **0 of 8 categories show
   "Coming Soon"**. Every category has **at least 3 real products**, all published by FAL
   staff with no developer involved. This is measured straight from `public.products`.

## Locked idea (for GATE 1)
1. This is FAL's buyer-facing website plus the CMS FAL staff use to keep it current.
2. The primary user is a sourcing manager at a foreign apparel brand, judging whether FAL
   can make their product.
3. The one moment that matters: clicking a category shows real FAL products, not a
   placeholder.
4. FAL's content editor adds, edits, orders and removes those products without a developer.
5. Everything else on the site (company story, sustainability, careers, grievance channel,
   gallery) stays as it is: it works and it's not the bottleneck.
6. Priority one is a trustworthy admin: no silent failures, and no account that shouldn't
   be there.
7. v1 is a catalog, not a shop: no prices, sizes, SKUs, search, accounts or languages.
8. Success in 90 days: all 8 categories have at least 3 real products, published by FAL
   staff.
9. The site stays on its current stack (Next.js on Vercel, Supabase) with no rebuild.
10. Scope changes after this lock are formal decisions, not drift.

## MVP scope (in / out)

**In:**
- the category catalog (8 public pages plus the products admin);
- the image-size guidance;
- trustworthy admin writes (errors surfaced, sign-in checked, owner-only accounts);
- keeping the existing pages and forms working;
- the security fixes that are live-relevant.

**Out: the NOT-list (later, or never, without a new decision):**
- prices, cart or e-commerce;
- SKUs, sizes, colours and a "type" field (the client declined these);
- bulk import;
- search, filters and pagination;
- a buyer accounts or portal;
- product-level inquiry routing;
- multi-language;
- analytics or tracking SDKs;
- automatic image resizing;
- moving or merging products between categories;
- linking the homepage strip (until a single source of truth is chosen, CLIENT_QUESTIONS
  Q04);
- any admin role besides "FAL admin".

## Locked stack (pinned versions; mirror of `docs/STACK.md` §2)
- **Language:** TypeScript 5.9.3 (strict).
- **Package manager:** npm, with `package-lock.json`.
- **Framework:** Next.js **16.3.6** (range `^16.1.6`; 16.3.6 is the minimum approved, per
  the TECH_STACK decision of 2026-09-28), React 19.2.4 and react-dom 19.2.4, using the App
  Router.
- **Styling:** Tailwind CSS 3.4.19 with PostCSS 8.5.23 and autoprefixer 10.4.27.
- **Motion:** framer-motion 12.34.3, gsap 3.14.2 with @gsap/react 2.1.2, and lenis 1.3.17.
- **Icons:** lucide-react 0.575.0.
- **Data and auth:** Supabase (Postgres, Auth and Storage) via @supabase/supabase-js 2.112.2
  and @supabase/ssr 0.8.0. Schema is hand-applied SQL; there's no Supabase CLI.
- **Deploy:** Vercel, building production from GitHub `main`. Two remotes are kept at the
  same commit (see `docs/WORKFLOW.md`).
- **Lint:** ESLint 9.39.3 with the legacy `.eslintrc.json`. This is **broken**, so the lint
  gate is suspended (Known Trap #10).
- **Tests:** none installed.

## Env vars (NAMES only, never values)
- `NEXT_PUBLIC_SUPABASE_URL`: the Supabase project URL. Required.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the Supabase anon key, used server-side. Today it never
  ships to a browser bundle (SEC-INFO-32). Required.
- `NEXT_PUBLIC_SITE_URL`: the canonical site URL, used by the sitemap and metadata. It
  defaults to `https://fashionasialtd.com`. Optional.
- `CRON_SECRET`: the bearer token for `/api/keep-alive`. Optional.
