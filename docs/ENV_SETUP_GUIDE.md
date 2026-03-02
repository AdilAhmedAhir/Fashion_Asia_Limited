# ENVIRONMENT SETUP & DEPLOYMENT GUIDE

Follow these exact instructions to connect your local codebase to GitHub, Vercel, and Supabase.

## 1. GITHUB PUSH
Open your terminal and run the following commands to push your baseline code to your remote repository:
```bash
git remote add origin https://github.com/AdilAhmedAhir/Fashion_Asia_Limited.git
git push -u origin main
```

## 2. SUPABASE SETUP
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **Project Settings → API** and copy:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create a `.env.local` file in your project root (DO NOT commit this file):
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```
4. Navigate to the **SQL Editor** in your Supabase dashboard and run the contents of `supabase-schema.sql` to create the `submissions` table with RLS policies.

## 3. VERCEL DEPLOYMENT
1. Go to [vercel.com](https://vercel.com) and import the GitHub repository.
2. In the Vercel project settings, navigate to **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. Vercel will auto-detect the Next.js framework and configure the build settings.
4. Deploy. The site will be available at your Vercel domain.

## 4. LOCAL DEVELOPMENT
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 5. CANVAS SEQUENCE FRAMES
The hero section requires 106 WebP frames in `public/sequence/`:
- Files must be named `frame_0.webp` through `frame_105.webp`
- Recommended resolution: 1920x1080 or higher
- The Preloader will block the UI until the first 35 frames are loaded

## 6. FILE STRUCTURE OVERVIEW
```
Fashion_asia_limited/
├── docs/                    # Project documentation
├── public/sequence/         # 106 WebP frames for canvas engine
├── src/
│   ├── app/
│   │   ├── (forms)/         # Contact, Career, Grievance pages
│   │   ├── (marketing)/     # Who We Are, Business, Sustainability, Media
│   │   ├── admin/           # Protected CMS dashboard (Phase 10)
│   │   └── actions/         # Server Actions
│   ├── components/
│   │   ├── canvas/          # CanvasEngine (GSAP + Canvas 2D)
│   │   ├── global/          # Preloader, Header, MobileMenu, Footer, SmoothScroll
│   │   ├── sections/        # Hero, About, Pillars, Scale, Marquee, Contact
│   │   └── ui/              # ScrollReveal, PageHeader, FormInput, SubmitButton
│   └── lib/
│       ├── supabase/        # Server & Client Supabase clients
│       └── utils.ts         # cn() Tailwind merge utility
├── supabase-schema.sql      # Database schema for Supabase
├── .env.example             # Environment variable template
└── .env.local               # Your local secrets (NOT committed)
```
