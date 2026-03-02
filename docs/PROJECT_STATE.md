# PROJECT STATE & ROADMAP

> **AI SYSTEM PROTOCOL (MANDATORY)**
> 1. READ this file at the beginning of every session to establish context without reading the entire codebase.
> 2. UPDATE this file atomically at the end of every successful task, phase, or bug fix.
> 3. DO NOT hallucinate architecture; strictly adhere to the stack and patterns defined here.

## 1. IDENTITY & TECH STACK
- **Framework:** Next.js 15 (App Router, strictly React Server Components by default).
- **Styling:** Tailwind CSS + CSS Variables (Monochrome + #0EC97A).
- **Motion (4-Tier):** Lenis (Scroll) -> GSAP Canvas 2D -> Framer Motion (ScrollReveal) -> CSS (Micro-interactions).
- **Backend/CMS:** Supabase (PostgreSQL, Storage, Auth) via `@supabase/ssr`.
- **Deployment:** Vercel (Edge network).

## 2. ROADMAP & VERSIONING

### v0.9.0 - "The Cinematic Shell & Data Layer" (CURRENT STATE)
- [x] **Phase 1-3:** Architecture Blueprint, Global Layout, Lenis + GSAP Providers, Preloader, Header, Mobile Menu.
- [x] **Phase 4:** Canvas Engine (106 WebP frame scrubber pinned for 300vh).
- [x] **Phase 5-6:** Content Reveal Engine & Sections (About, Pillars, Scale, Marquee, Contact).
- [x] **Phase 7:** Static Sub-pages (Who We Are, Business, Sustainability, Media).
- [x] **Phase 8:** Server Actions for Forms (Contact, Career, Grievance).
- [x] **Phase 9:** Supabase Integration (Server/Client instantiations, SQL schema generation).
- [x] **Documentation:** Project state tracking and update protocol established.

### v1.0.0 - "CMS & Production Polish" (NEXT UP)
- [ ] **Phase 10:** Protected Admin Dashboard UI (`/admin`) & Supabase Auth.
- [ ] **Phase 11:** CMS Data Fetching (Replacing static text with Supabase queries).
- [ ] **Phase 12:** Vercel Edge caching and ISR Webhook triggers.
- [ ] **Phase 13:** Final Performance Polish (SEO metadata, OG Images, Lighthouse 100/100).

## 3. COMPONENT ARCHITECTURE MAP
- `src/components/canvas/CanvasEngine.tsx` -> Core Tier 2 Motion (GSAP Canvas Scrubbing)
- `src/components/global/SmoothScrollProvider.tsx` -> Core Tier 1 Motion (Lenis)
- `src/components/ui/ScrollReveal.tsx` -> Core Tier 3 Motion (Framer Motion Fade-ups)
- `src/app/actions/form-actions.ts` -> Server Actions for Supabase mutations

## 4. CHANGELOG
- **[v0.9.7]** - Frame Scrubber Restored: HTML5 video scrubbing is ineffective on mobile. Reverted to `DynamicCanvasEngine.tsx` with dynamic routing (`v1-v6`). Created `scripts/extract_frames.sh` to downsample 4K MP4s into memory-safe 1080p WebP frame sequences for performant 60fps scrolling. Wrapped Preloader in Suspense to dynamically preload the correct frames.
- **[v0.9.6]** - Hero Engine Migration: Replaced heavy canvas image scrubber with high-performance `<VideoEngine>` natively playing 4K MP4s with GSAP scrolling scale/parallax. Added client `VideoSwitcher` preview dropdown via Next.js `searchParams`. Decoupled Preloader from WebP loading for fast 1.8s mobile streaming.
- **[v0.9.3]** - Frontend Content Integration: Injected official client copywriting into the Who We Are, Business, and Sustainability pages. Structured layouts with Tier 3 ScrollReveal motion architecture.
- **[v0.9.2]** - Branding Integration: Ingested local client images to replace generic placeholders. Built SVG `<BrandLogo>` component and injected into Header. Overhauled Preloader into a cinematic "thread-weaving" experience.
- **[v0.9.1]** - UI Polish: Redesigned PreloaderManager into a premium cinematic brand experience (abstract SVG heritage logo, massive typography, edge-to-edge loading bar). Generated AI Logo Prompt.
- **[v0.9.0]** - Established Git baseline, state tracking, and deployment guide.
