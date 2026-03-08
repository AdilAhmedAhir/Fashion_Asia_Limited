-- Fashion Asia Limited — Full Database Schema
-- Run this SQL in your Supabase SQL Editor

-- ================================================================
-- 0. Jobs Table (Career Page Job Postings) — NEW
-- ================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100) DEFAULT 'Sreepur, Bangladesh',
    employment_type VARCHAR(50) DEFAULT 'Full-time',
    description TEXT,
    requirements TEXT,
    published_at DATE DEFAULT CURRENT_DATE,
    deadline DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on active jobs" ON public.jobs FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Allow authenticated full access to jobs" ON public.jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- 1. Submissions Table (Contact, Career, Grievance) — EXISTING
-- ================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'contact', 'career', 'grievance'
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts to submissions" ON public.submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Deny public read on submissions" ON public.submissions FOR SELECT TO anon USING (false);

-- ================================================================
-- 2. Media Assets Table — EXISTING
-- ================================================================
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'gallery', -- 'gallery', 'news'
    url TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on media_assets" ON public.media_assets FOR SELECT TO anon USING (true);

-- ================================================================
-- 3. Site Settings Table — NEW (Key-Value JSON store)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (needed for public pages)
CREATE POLICY "Allow public read on site_settings" ON public.site_settings FOR SELECT TO anon USING (true);

-- Settings keys will be:
-- 'homepage'       → { hero, about, business, sustainability, scale, contact }
-- 'who_we_are'     → { aboutText, vision, mission }
-- 'business'       → { products, capacity, customers }
-- 'sustainability' → { description, certifications, initiatives }
-- 'contact'        → { phone, email, factoryAddress, corporateAddress, mapsUrl, socialLinks }
-- 'general'        → { companyName, seoTitle, seoDescription, footerCopyright }

-- ================================================================
-- 4. Reports Table — NEW (Audit/Financial reports)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'financial', 'audit', 'compliance', 'environmental', 'csr'
    year INTEGER NOT NULL,
    file_url TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public can only see published reports
CREATE POLICY "Allow public read on published reports" ON public.reports FOR SELECT TO anon USING (published = true);

-- ================================================================
-- 5. Leaders Table — NEW (Leadership profiles)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.leaders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    photo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- Public can read leader profiles
CREATE POLICY "Allow public read on leaders" ON public.leaders FOR SELECT TO anon USING (true);

-- ================================================================
-- 6. Seed Default Settings
-- ================================================================
INSERT INTO public.site_settings (key, value) VALUES
('homepage', '{
  "heroTagline": "Innovation in Motion",
  "heroSubtitle": "From automated cutting to precision sewing, every step of our manufacturing process is designed for absolute quality and a zero defect philosophy.",
  "aboutTag": "About Fashion Asia Limited",
  "aboutTitle": "Where Bold Vision Meets Precise Execution",
  "aboutDescription": "As a proud sister concern of Northern Tosrifa Group (NTG), which has over 34 years of excellence in the apparel industry, we continue the legacy of quality, innovation, and responsible manufacturing from our modern, compliant facility in Sreepur, Gazipur.",
  "aboutStats": [{"label": "Right First Time", "value": "99.2%"}, {"label": "On-Time Delivery", "value": "98.5%"}, {"label": "Pieces/Month", "value": "800K"}],
  "businessTag": "What We Do",
  "businessTitle": "Built for Global Scale",
  "businessDescription": "26 production lines. 800K pieces monthly. From cutting-edge knit garments to precision sportswear — we deliver with a zero-defect philosophy for the world''s leading brands.",
  "businessProducts": ["T-Shirts", "Polo Shirts", "Dresses", "Sleepwear", "Sportswear", "Heavy Jersey"],
  "businessStats": [{"value": "26", "label": "Lines"}, {"value": "800K", "label": "Monthly"}, {"value": "2,000+", "label": "Team"}],
  "sustainabilityTag": "Green Manufacturing",
  "sustainabilityTitle": "LEED Gold Certified",
  "sustainabilityDescription": "Solar powered. Zero salt dyeing. Rainwater harvesting. Our factory operates as a fully compliant green facility, setting the benchmark for responsible garment manufacturing.",
  "sustainabilityCerts": ["BSCI", "WRAP", "SEDEX", "GOTS", "OCS", "SLCP", "FEM"],
  "sustainabilityHighlights": [{"icon": "☀️", "label": "Solar Powered"}, {"icon": "💧", "label": "Zero Discharge"}, {"icon": "♻️", "label": "Water Recycling"}, {"icon": "🌿", "label": "100% Compliant"}],
  "scaleStats": [{"value": "99.2%", "label": "Right First Time"}, {"value": "98.5%", "label": "On-Time Delivery"}, {"value": "800K", "label": "Pieces / Month"}],
  "contactCards": [{"label": "Phone", "value": "+880 1711 691 366"}, {"label": "Factory", "value": "Teprirbari, Sreepur, Gazipur"}, {"label": "Corporate", "value": "Gopalpur, Munnu Nagar, Tongi"}]
}'::jsonb),

('who_we_are', '{
  "aboutParagraph1": "Fashion Asia Ltd. is a 100% export-oriented Ready-Made Garments (RMG) manufacturing company specializing in knitwear. Located in Sreepur, Gazipur, one of Bangladesh''s key industrial hubs, our factory operates with modern infrastructure and advanced production technology.",
  "aboutParagraph2": "As part of Northern Tosrifa Group, we inherit decades of industry expertise, strong governance, and global market experience. Our operational model focuses on quality excellence, production efficiency, social compliance, and environmental responsibility. We are committed to building long-term partnerships with international brands through reliability, transparency, and ethical business practices.",
  "visionTitle": "A Globally Recognized Leader",
  "visionDescription": "To be a globally recognized knitwear manufacturer known for sustainable practices, technological advancement, and excellence in product quality.",
  "missionTitle": "Responsible Manufacturing",
  "missionDescription": "To deliver superior knit garments through innovation, efficiency, and responsible manufacturing while ensuring employee welfare, environmental protection, and long-term value creation for our stakeholders."
}'::jsonb),

('business', '{
  "products": ["T-Shirts", "Polo Shirts", "Tank Tops", "Dresses", "Sleepwear", "Leggings", "Sportswear", "Heavy Jersey Products"],
  "capacityDescription": "Our factory operates 26 production lines with a monthly production capacity of 800,000 pieces of knit garments. Supported by 2,000 skilled employees and modern production planning systems.",
  "capacityStats": [{"value": "26", "label": "Production Lines"}, {"value": "800K", "label": "Pieces Monthly"}, {"value": "2,000+", "label": "Skilled Employees"}, {"value": "$30M", "label": "Annual Turnover"}],
  "customers": ["Elcort ECI", "Kappahl", "Tamurakoma", "Max India"]
}'::jsonb),

('sustainability', '{
  "description": "Sustainability and compliance are integral to our business model. We maintain transparent documentation and reporting aligned with international standards and buyer requirements.",
  "certifications": ["BSCI", "WRAP", "SEDEX", "SLCP", "OCS", "GOTS", "FEM"],
  "initiatives": [
    "Use of renewable and solar energy",
    "Rainwater harvesting systems",
    "Energy-efficient production processes",
    "Waste reduction and responsible resource management",
    "Fair Price Shop facility for employees",
    "Educational support through the ''100 Dream School Program'' under Jaggo Foundation"
  ]
}'::jsonb),

('contact', '{
  "phone": "+880 1711 691 366",
  "email": "contact@fashionasia.ltd",
  "factoryAddress": "Teprirbari, Sreepur, Gazipur",
  "corporateAddress": "Gopalpur, Munnu Nagar, Tongi",
  "mapsUrl": "",
  "socialLinks": []
}'::jsonb),

('general', '{
  "companyName": "Fashion Asia Limited",
  "seoTitle": "Fashion Asia Limited — Premium Knitwear Manufacturing",
  "seoDescription": "100% export-oriented knitwear manufacturer backed by Northern Tosrifa Group. LEED Gold certified, 800K pieces monthly capacity.",
  "footerCopyright": "© 2024 Fashion Asia Limited. All rights reserved."
}'::jsonb)

ON CONFLICT (key) DO NOTHING;
