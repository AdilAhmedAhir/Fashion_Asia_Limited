/**
 * ============================================================================
 *  SITE CONTENT — single source of truth for all editable text on the site
 * ============================================================================
 *
 *  These are the DEFAULTS. The site is backed by Supabase and edited through
 *  /admin — a stored value always wins over what is written here. This file is
 *  what renders when a page has no stored row yet, and what the admin
 *  "Sync content from code" panel writes into the database.
 *
 *  So: edit here for a new baseline (then sync), edit in /admin for day-to-day
 *  copy changes. Editing here alone will NOT change a page the client has
 *  already saved from the dashboard.
 *
 *  Images live in   public/images/client/   (referenced as /images/client/...)
 *  Videos live in    public/videos/          (referenced as /videos/...)
 *
 *  After editing, commit + push — Vercel rebuilds automatically.
 * ============================================================================
 */

// Keyed content blocks consumed by the homepage + marketing pages.
export const SITE_SETTINGS: Record<string, Record<string, unknown>> = {
    homepage: {
        // Hero overlay — headline, the three facts under it, and the stat rail.
        // "34+ Yrs" follows the company brief ("over 34 years of excellence").
        // Keep this in step with aboutDescription on this page and the About Us
        // copy on /who-we-are, which make the same claim.
        heroKicker: "Northern Tosrifa Group",
        heroTitleTop: "Green Powered",
        heroTitleAccent: "Innovation",
        heroFacts: ["LEED Gold Certified", "800K Monthly", "Sreepur, Bangladesh"],
        heroStats: [
            { label: "Legacy", value: "34+ Yrs" },
            { label: "Machines", value: "750" },
            { label: "Annual Revenue", value: "$30M" },
        ],
        heroTagline: "Innovation in Motion",
        heroSubtitle:
            "From automated cutting to precision sewing, every step of our manufacturing process is designed for absolute quality and a zero defect philosophy.",
        aboutTag: "About Fashion Asia Limited",
        aboutTitle: "Where Bold Vision Meets Precise Execution",
        aboutDescription:
            "As a proud sister concern of Northern Tosrifa Group (NTG), which has over 34 years of excellence in the apparel industry, we continue the legacy of quality, innovation, and responsible manufacturing from our modern, compliant facility in Sreepur, Gazipur.",
        aboutStats: [
            { label: "Right First Time", value: "99.2%" },
            { label: "On-Time Delivery", value: "98.5%" },
            { label: "Pieces/Month", value: "800K" },
        ],
        businessTag: "What We Do",
        businessTitle: "Built for Global Scale",
        businessDescription:
            "26 production lines. 800K pieces monthly. From cutting-edge knit garments to precision sportswear — we deliver with a zero-defect philosophy for the world's leading brands.",
        businessProducts: ["T-Shirts", "Polo Shirts", "Dresses", "Sleepwear", "Sportswear", "Heavy Jersey"],
        businessStats: [
            { value: "26", label: "Lines" },
            { value: "800K", label: "Monthly" },
            { value: "2,000+", label: "Team" },
        ],
        sustainabilityTag: "Green Manufacturing",
        sustainabilityTitle: "LEED Gold Certified",
        sustainabilityDescription:
            "Solar powered. Zero salt dyeing. Rainwater harvesting. Our factory operates as a fully compliant green facility, setting the benchmark for responsible garment manufacturing.",
        // Short abbreviations here; /sustainability spells the same
        // certifications out in full beside their artwork. Amfori (BSCI) is
        // held but no mark was supplied, so it appears here in text only —
        // see the note above CERTIFICATIONS.
        sustainabilityCerts: [
            "LEED Gold", "WRAP", "Amfori (BSCI)", "SMETA", "SLCP", "Higg Index",
            "GOTS", "OCS", "GRS", "OEKO-TEX", "BCI", "RSC",
        ],
        sustainabilityHighlights: [
            { icon: "☀️", label: "Solar Powered" },
            { icon: "💧", label: "Zero Discharge" },
            { icon: "♻️", label: "Water Recycling" },
            { icon: "🌿", label: "100% Compliant" },
        ],
        scaleStats: [
            { value: "99.2%", label: "Right First Time" },
            { value: "98.5%", label: "On-Time Delivery" },
            { value: "800K", label: "Pieces / Month" },
        ],
        // "Life at Fashion Asia" — the people story that follows sustainability.
        // Each facility card carries its own caption so the photographs are
        // never shown without context.
        lifeTag: "Life at Fashion Asia",
        lifeEyebrow: "Our responsibility does not stop at the factory gate.",
        lifeDescription:
            "The same standards that make our facility green make it a good place to work. Behind every garment are 2,000 people — and the care we design around them is deliberate, funded, and measured.",
        lifeStat: { value: "2,000", label: "People on site every day" },
        lifeFacilities: [
            {
                title: "Medical Center",
                description: "On-site medical services, healthcare assistance, and maternity support.",
                image: "/images/client/box6-copy.webp",
            },
            {
                title: "Day Care",
                description: "Childcare on the premises so working parents stay close to their children.",
                image: "/images/client/box4-copy.webp",
            },
            {
                title: "Shera Shop",
                description: "A fair-price shop giving every employee daily essentials below market cost.",
                image: "/images/client/box3-copy.webp",
            },
            {
                title: "Bicycle Parking",
                description: "Secure parking and safe commuting for the workforce that travels daily.",
                image: "/images/client/box2-copy.webp",
            },
        ],
        lifePillars: [
            { title: "Our People", description: "Teamwork, respect, and inclusion — every employee valued and heard." },
            { title: "Rewards & Recognition", description: "Competitive pay, advancement, and recognition for dedication." },
            { title: "Wellbeing & Safety", description: "Human rights protected in a safe, healthy, respectful workplace." },
            { title: "Learning & Growth", description: "Structured training and leadership development for every career." },
        ],
        contactCards: [
            { label: "Phone", value: "+880 1711 691 366" },
            { label: "Factory", value: "Teprirbari, Sreepur, Gazipur" },
            { label: "Corporate", value: "Gopalpur, Munnu Nagar, Tongi" },
        ],
    },

    who_we_are: {
        // Headline figures shown under About Us on /who-we-are.
        assuranceStats: [
            { value: "99.2%", label: "Right First Time" },
            { value: "98.5%", label: "On-Time Delivery" },
            { value: "800K", label: "Pieces / Month" },
            { value: "$30M", label: "Annual Turnover" },
        ],
        // **bold** is rendered as <strong> by the About section. The client's
        // copy marked these phrases with asterisks; the markers were unbalanced,
        // so they are normalised here to the phrases they clearly wrapped.
        aboutParagraphs: [
            "**Fashion Asia Ltd.** is a modern and responsible knitwear manufacturer based in Sreepur, Gazipur, Bangladesh. As a sister concern of **Northern Tosrifa Group (NTG)**, with over 34 years of apparel industry experience, we focus on quality, innovation, and responsible manufacturing.",
            "With **26 production lines and a monthly capacity of 800,000 pieces**, we serve global customers with a wide range of knit garments. Our **Green Building** factory, supported by solar power, rainwater harvesting, advanced technology, and 2,000 skilled employees, reflects our strong commitment to **sustainability, quality, and compliance**.",
        ],
        // Supplied by the client, 2026-08-16. These replace the invented dates
        // that previously shipped. Each entry is the client's sentence verbatim
        // as the heading — nothing has been embellished into a description, so
        // the detail line is left empty and the card omits it.
        milestones: [
            {
                year: "1967",
                title: "Northern Steel Re-Rolling Mill Ltd. was founded by Shafiuddin Ahmed and Tosrifa Khatoon.",
                description: "",
            },
            { year: "2000", title: "Fashion Asia Ltd. was established.", description: "" },
            { year: "2017", title: "Construction of the new factory building started.", description: "" },
            {
                year: "2019",
                title: "Achieved LEED Certification and started operations in our Green Building.",
                description: "",
            },
            { year: "2021", title: "Achieved Grade ‘A’ in the amfori BSCI Audit.", description: "" },
            { year: "2024", title: "Awarded Responsible Supplier by Kappahl.", description: "" },
        ],
        // The eyebrows above these already read "Our Vision" / "Our Mission",
        // so the headings say where we are going and how we get there rather
        // than repeating the label.
        visionTitle: "The Company We Intend to Be",
        visionDescription:
            "We are committed to becoming the most trusted and preferred organization for our customers, employees, suppliers, shareholders, and the communities we serve.",
        missionTitle: "How We Get There",
        missionPoints: [
            "Excellence in quality, innovation, and on-time delivery.",
            "A safe workplace built on dignity, respect, and human rights.",
            "Sustainable and ethical business for a better future.",
        ],
        values: [
            { title: "Quality Excellence", description: "We are committed to delivering products that consistently meet the highest standards of quality and customer expectations." },
            { title: "Reliability & Accountability", description: "We honor our commitments through on-time delivery, transparency, and dependable service." },
            { title: "Respect for People", description: "We uphold human rights and foster a safe, inclusive, and empowering workplace for all." },
            { title: "Innovation & Continuous Improvement", description: "We embrace technology, creativity, and learning to enhance efficiency, quality, and value." },
            { title: "Sustainability & Integrity", description: "We conduct business ethically and responsibly, protecting the environment and contributing to a sustainable future." },
        ],
        lifeAtFAL: [
            { title: "Our People", description: "At Fashion Asia, our people are our greatest strength. We foster a culture of teamwork, respect, inclusion, and shared success, where every employee is valued, heard, and empowered to contribute." },
            { title: "Rewards & Recognition", description: "We recognize performance, dedication, and innovation through competitive compensation, career advancement opportunities, and employee recognition programs. Our support also includes fair-price shopping facilities, salary advance options, and other initiatives designed to improve employees' quality of life." },
            { title: "Wellbeing, Safety & Respect", description: "We are committed to providing a safe, healthy, and respectful workplace where human rights and employee wellbeing are fully protected. Our employees benefit from maternity support, on-site medical services, healthcare assistance, childcare facilities, hygienic canteens, and a strong culture of safety, dignity, and ethical conduct." },
            { title: "Learning & Growth", description: "We invest in continuous learning, skills development, and leadership training to help our employees build rewarding careers. Through structured training programs and growth opportunities, we empower our people to reach their full potential." },
        ],
    },

    business: {
        // Blank lines separate paragraphs on /what-we-do. Kept as one string so the
        // admin stays a single textarea.
        whatWeDoText:
            "Fashion Asia transforms ideas into world-class knitwear solutions. We turn creativity into reality.\n\n" +
            "We specialize in developing and manufacturing all types of knitted garments for every market, age group, gender, climate, and lifestyle.\n\n" +
            "From everyday essentials to fashion-forward designs, we use diverse fabrics, finishes, and innovative constructions to bring our customers\u2019 ideas to life and turn creative concepts into commercially successful products.",
        whatWeDoTagline: "If you can imagine it, Fashion Asia can make it happen.",
        // The end-to-end pipeline shown as arrow-joined chips under Our Craft.
        processTitle: "A complete solution from start to finish.",
        processSteps: [
            "Concept", "Product Development", "Sourcing", "Manufacturing",
            "Quality Control", "Compliance", "Final Delivery",
        ],
        // Each card carries a title, an optional short description, and its own
        // photograph. Descriptions ship empty on purpose — the card hides the
        // line until someone writes it in /admin, so nothing invented goes live.
        // `slug` is hand-picked here, not derived via slugify() at runtime, and
        // matches the seed row already written into supabase-schema.sql. It is
        // a category's permanent identity and public URL segment (T-001/
        // T-005) — once a category has been saved from /admin at least once,
        // its stored slug always wins over this default (see normalizeProducts()).
        products: [
            { title: "T-Shirts", slug: "t-shirts", description: "", image: "/images/client/product-tshirts.webp" },
            { title: "Polo Shirts", slug: "polo-shirts", description: "", image: "/images/client/box12-copy.webp" },
            { title: "Tank Tops", slug: "tank-tops", description: "", image: "/images/client/product-tanktops.webp" },
            { title: "Dresses", slug: "dresses", description: "", image: "/images/client/product-dresses.webp" },
            { title: "Sleepwear", slug: "sleepwear", description: "", image: "/images/client/product-sleepwear.webp" },
            { title: "Leggings", slug: "leggings", description: "", image: "/images/client/box10-copy.webp" },
            { title: "Sportswear", slug: "sportswear", description: "", image: "/images/client/product-sportswear.webp" },
            { title: "Heavy Jersey Products", slug: "heavy-jersey-products", description: "", image: "/images/client/4-copy.webp" },
        ],
    },

    who_we_work_with: {
        intro:
            "We are proud to partner with leading international fashion brands and buyers across global markets. Our long-standing partnerships reflect their confidence in our quality, compliance, innovation, sustainability, and reliable on-time delivery, making Fashion Asia a trusted manufacturing partner.",
    },

    sustainability: {
        // NOTE: /sustainability now renders the certification marks from the
        // CERTIFICATIONS array below rather than a list of abbreviations, so
        // edit that array to add or remove a certification.
        initiatives: [
            "Use of renewable and solar energy",
            "Rainwater harvesting systems",
            "Energy-efficient production processes",
            "Waste reduction and responsible resource management",
            "Fair Price Shop facility for employees",
            "Educational support through the '100 Dream School Program' under Jaggo Foundation",
        ],
    },

    contact: {
        phone: "+880 1711 691 366",
        email: "admin@fashionasialtd.com",
        factoryAddress: "Teprirbari, Sreepur, Gazipur",
        corporateAddress: "Gopalpur, Munnu Nagar, Tongi",
        mapsUrl: "https://maps.app.goo.gl/En3k5dJ8yZTiwFAp8",
        socialLinks: [] as { platform: string; url: string }[],
    },

    general: {
        companyName: "Fashion Asia Limited",
        seoTitle: "Fashion Asia Limited — Premium Knitwear Manufacturing",
        seoDescription:
            "100% export-oriented knitwear manufacturer backed by Northern Tosrifa Group. LEED Gold certified, 800K pieces monthly capacity.",
        footerCopyright: "© 2026 Fashion Asia Limited. All rights reserved.",
    },
};

// ---------------------------------------------------------------------------
// Buyer / brand logos shown on the homepage, /what-we-do and /global-partner.
// Files live in public/images/client/logos/. Add or remove entries here and
// every page that lists brands updates together.
// ---------------------------------------------------------------------------
export interface ClientLogo {
    name: string;
    src: string;
}

export const CLIENT_LOGOS: ClientLogo[] = [
    { name: "El Corte Inglés", src: "/images/client/logos/el-corte-ingles.png" },
    { name: "Kappahl", src: "/images/client/logos/kappahl.png" },
    { name: "Sports Direct", src: "/images/client/logos/sports-direct.png" },
    { name: "Renner", src: "/images/client/logos/renner.png" },
    { name: "Kenneth Cole New York", src: "/images/client/logos/kenneth-cole.png" },
    { name: "Beverly Hills Polo Club", src: "/images/client/logos/beverly-hills-polo-club.png" },
    { name: "Ochnik", src: "/images/client/logos/ochnik.png" },
    { name: "Piazza Italia", src: "/images/client/logos/piazza-italia.png" },
    { name: "American Holic", src: "/images/client/logos/american-holic.png" },
    { name: "Lakole", src: "/images/client/logos/lakole.png" },
    { name: "Paper Denim & Cloth", src: "/images/client/logos/paper-denim-cloth.png" },
    { name: "Gym Glamour", src: "/images/client/logos/gym-glamour.png" },
    { name: "Free Planet", src: "/images/client/logos/free-planet.png" },
    { name: "JVZ", src: "/images/client/logos/jvz.png" },
];

// ---------------------------------------------------------------------------
// Certification marks shown on /sustainability. Files live in
// public/images/client/certifications/. `name` is the accessible label and the
// caption under each mark, so spell it the way the scheme does.
//
// Names below follow the supplied artwork. Two notes for whoever maintains it:
//
//  1. BSCI is held but no mark was supplied (the client's Certifications-01
//     export came through empty). It therefore appears in the text lists —
//     homepage sustainabilityCerts and the Footer badges — but not in this
//     grid. Drop the artwork into public/images/client/certifications/ and add
//     an entry here to include it.
//  2. BCI (Better Cotton Initiative, cotton sourcing) and BSCI (amfori
//     Business Social Compliance Initiative, social audit) are different
//     schemes. The company holds both. Do not merge or "correct" one into the
//     other — the near-identical acronyms make that an easy mistake.
//
// Two further names differ from the abbreviations the site used before:
// SMETA is the audit conducted under Sedex, and the Higg Index covers what
// was previously listed as FEM.
// ---------------------------------------------------------------------------
// Photographs behind the product cards on /what-we-do. Keyed by the product
// name as it appears in the CMS products list; anything unmapped falls back
// to the knit-texture shot so client-added products still render as a card.
export const PRODUCT_IMAGES: Record<string, string> = {
    "T-Shirts": "/images/client/product-tshirts.webp",
    "Polo Shirts": "/images/client/box12-copy.webp",
    "Tank Tops": "/images/client/product-tanktops.webp",
    "Dresses": "/images/client/product-dresses.webp",
    "Sleepwear": "/images/client/product-sleepwear.webp",
    "Leggings": "/images/client/box10-copy.webp",
    "Sportswear": "/images/client/product-sportswear.webp",
    "Heavy Jersey Products": "/images/client/4-copy.webp",
};

export const PRODUCT_IMAGE_FALLBACK = "/images/client/4-copy.webp";

export type Product = {
    id: string; // server-issued category identity. "" = not yet assigned. Internal only: never displayed, never a URL segment.
    title: string;
    slug: string; // stable identity + public URL segment; assigned once, frozen after
    description: string;
    image: string;
};

// A category's frozen identity as it already sits in storage, read fresh by
// updateSettings immediately before every `business` save — never taken from
// client memory (docs/TECH_STACK.md decision (d), 2026-09-27, and its
// same-day "legacy (id-less) categories" follow-up). Shared by
// resolveCategoriesForSave's carry-forward lookup, computeRemovedCategories'
// id-diff, and products-actions.ts's attachability check.
export type ExistingCategoryRef = { slug: string; title: string };

// Individual catalog item inside a category (image/name/description) — the
// shape of a row in the new public.products table (db/migrations/0001_
// products-within-category.sql). Snake_case fields match the Job/Report/
// Leader convention already used below for Supabase rows, so a row read
// from that table needs no mapping step. Do not confuse this with `Product`
// above: despite the name, `Product` is a CATEGORY (T-Shirts, Polo Shirts,
// ...) — see the naming-quirk note in docs/TECH_STACK.md.
export type CategoryProduct = {
    id: string;
    category_slug: string;
    name: string;
    description: string;
    image: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

// Create/update payload shape for a CategoryProduct row — never sends id,
// created_at, or updated_at, which are DB-generated (gen_random_uuid() /
// now() defaults on public.products). Reusing the read-shaped
// CategoryProduct type directly for writes would let a caller pass a
// client-picked id or timestamp that the insert/update never actually uses
// (docs/QA_REPORT.md T-001 Static Pass WARN-3; docs/ROADMAP.md T-003).
export type CategoryProductInput = Omit<CategoryProduct, "id" | "created_at" | "updated_at">;

// Category slug: lowercase, every run of non-alphanumeric characters
// collapsed to a single "-", leading/trailing "-" trimmed. A title with no
// alphanumeric characters at all would otherwise produce an empty, unusable
// URL segment, so that case falls back to "category".
export function slugify(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || "category";
}

// Appends -2, -3, ... until `slug` no longer collides with a slug already
// assigned earlier in the same normalizeProducts() call. This is the
// read-time-only fallback for a legacy category that predates the `slug`
// field (docs/TECH_STACK.md → Database, decision (b)) — an actual save
// rejects a colliding freshly-computed slug outright instead of ever
// reaching this function.
function dedupeSlug(slug: string, seen: Set<string>): string {
    if (!seen.has(slug)) return slug;
    let suffix = 2;
    while (seen.has(`${slug}-${suffix}`)) suffix++;
    return `${slug}-${suffix}`;
}

// `products` used to be a plain list of names. Stored rows still hold that shape
// until the migration runs, and a client can always save a half-filled row, so
// accept both forms and fill the gaps: a missing image falls back to the one
// that name used to resolve to, a missing description simply hides the line.
// Entries without a usable title are dropped rather than rendered as blank cards.
// A stored `slug` always wins over a fresh computation, even after a title
// edit, so a category's public URL never moves once assigned. Freshly
// computed slugs are deduped against every slug already assigned earlier in
// this same call — stored or computed — via `seen`, shared across the reduce.
export function normalizeProducts(raw: unknown): Product[] {
    if (!Array.isArray(raw)) return [];

    const seen = new Set<string>();

    return raw.reduce<Product[]>((acc, item) => {
        if (typeof item === "string") {
            const title = item.trim();
            if (title) {
                const slug = dedupeSlug(slugify(title), seen);
                seen.add(slug);
                acc.push({ id: "", title, slug, description: "", image: PRODUCT_IMAGES[title] ?? PRODUCT_IMAGE_FALLBACK });
            }
            return acc;
        }

        if (item && typeof item === "object" && !Array.isArray(item)) {
            const row = item as Record<string, unknown>;
            const title = typeof row.title === "string" ? row.title.trim() : "";
            if (!title) return acc;

            const image = typeof row.image === "string" && row.image.trim()
                ? row.image.trim()
                : PRODUCT_IMAGES[title] ?? PRODUCT_IMAGE_FALLBACK;
            const description = typeof row.description === "string" ? row.description.trim() : "";

            // Carried forward exactly like slug below — read-time only,
            // never invented here. resolveCategoriesForSave (save-time) is
            // the only place a missing id is ever actually assigned one.
            const id = typeof row.id === "string" ? row.id.trim() : "";

            const storedSlug = typeof row.slug === "string" ? row.slug.trim() : "";
            const slug = storedSlug || dedupeSlug(slugify(title), seen);
            seen.add(slug);

            acc.push({ id, title, slug, description, image });
        }

        return acc;
    }, []);
}

export type CategorySaveResult =
    | { ok: true; categories: Product[] }
    | { ok: false; error: string };

// Every stored slug's shape is provably confined to this exact pattern by
// slugify() (SEC-INFO-12) — used both to gate a frozen slug's reuse at save
// time below (a malformed stored value can never be silently carried
// forward again) and, in products-actions.ts, to gate whether a category is
// genuinely attachable yet.
export function isWellFormedSlug(value: string): boolean {
    return value.length > 0 && value.length <= 255 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

// A server-issued id for a brand-new category. Deliberately backed by the
// runtime's Web Crypto global rather than Node's `crypto` module import:
// this file has zero import statements today and is already imported by a
// client component (BusinessClient.tsx, type-only, confirmed by reading it)
// — globalThis.crypto.randomUUID() is available in both server and browser
// runtimes, so this stays safe even if a client component ever starts
// importing a VALUE (not just a type) from this shared module
// (docs/TECH_STACK.md decision (d), 2026-09-27).
function randomUUID(): string {
    return globalThis.crypto.randomUUID();
}

// Save-time counterpart to normalizeProducts() above, for the `business`
// settings write path (src/app/actions/settings-actions.ts::updateSettings).
// normalizeProducts() is READ-time only and silently auto-suffixes a
// colliding freshly-computed slug via dedupeSlug() so a page always has
// something to render. Decision (b) (docs/TECH_STACK.md) requires the
// opposite at save time: a collision is refused outright — the entire save
// fails with a specific, named-category error, never silently suffixed or
// overwritten. This function is that guard; it never calls dedupeSlug().
//
// Category identity — decision (d), docs/TECH_STACK.md, 2026-09-27. A
// category is matched to an existing row by `id` alone — never by slug,
// never by title. `existingById` must be every currently-persisted
// category's own id mapped to its frozen {slug, title}, read fresh by the
// caller (readStoredCategoryIdentities, below) immediately before calling
// this — never taken from client memory. An incoming item's own `.slug`
// field is NEVER read by this function, under any circumstance: every
// resolved slug is either looked up by id or freshly derived via slugify(),
// so a client can never propose a slug value. This closes CRIT-1 (a fresh
// slug reissued for a just-deleted category made the deletion invisible to
// the guard) and SEC-HIGH-3 (a carried-forward item claiming a different
// row's slug) as one mechanism, not two patches — both were bare
// slug-string-membership bugs with no record of which row actually owns a
// given slug; id-based provenance means ownership can never be inferred
// from the string itself.
export function resolveCategoriesForSave(
    raw: unknown,
    existingById: ReadonlyMap<string, ExistingCategoryRef>,
): CategorySaveResult {
    if (!Array.isArray(raw)) {
        return {
            ok: false,
            error: "Categories must be a list of category objects — refusing to save. Reload the page and try again.",
        };
    }

    const seenSlugs = new Map<string, string>(); // slug -> first title that claimed it
    const claimedIds = new Set<string>();
    const categories: Product[] = [];

    for (const item of raw) {
        let title = "";
        let description = "";
        let image = "";
        let incomingId = "";

        if (typeof item === "string") {
            title = item.trim();
        } else if (item && typeof item === "object" && !Array.isArray(item)) {
            const row = item as Record<string, unknown>;
            title = typeof row.title === "string" ? row.title.trim() : "";
            description = typeof row.description === "string" ? row.description.trim() : "";
            image = typeof row.image === "string" ? row.image.trim() : "";
            incomingId = typeof row.id === "string" ? row.id.trim() : "";
        } else {
            continue;
        }

        if (!title) continue;
        if (!image) image = PRODUCT_IMAGES[title] ?? PRODUCT_IMAGE_FALLBACK;

        const existing = incomingId ? existingById.get(incomingId) : undefined;

        let id: string;
        let slug: string;

        if (existing) {
            // Same category, regardless of title/description/image/array-
            // position changes. Two incoming items claiming the same
            // existing id reject the whole save by name before either is
            // resolved further.
            if (claimedIds.has(incomingId)) {
                return {
                    ok: false,
                    error: `Two categories in this save both claim to be "${existing.title}". Reload the page and try again.`,
                };
            }
            claimedIds.add(incomingId);

            // "Frozen forever" was always meant to apply to a validly-
            // assigned slug. A stored slug can only be malformed today via
            // manual DB editing — re-validated here rather than silently
            // persisting an invalid value forward again.
            if (!isWellFormedSlug(existing.slug)) {
                return {
                    ok: false,
                    error: `"${existing.title}"'s stored URL slug is invalid and can't be safely reused. This category needs a developer to fix its stored data before it can be saved again.`,
                };
            }

            // Its slug is looked up by id and reattached verbatim — the
            // incoming item's own `.slug` field is never read for this
            // decision, so a client can never donate or hijack a slug.
            id = incomingId;
            slug = existing.slug;
        } else {
            // No id, or an id absent from existingById: a new category.
            // Fresh id, fresh slug derived only from the title — again, the
            // incoming item's own `.slug` field is never read here either.
            id = randomUUID();
            slug = slugify(title).slice(0, 255);
        }

        // Collision check — across ALL resolved slugs so far, whether frozen
        // or freshly derived, regardless of the order categories arrived in.
        // Never silently resolved: the whole save is refused with a specific,
        // named-category error (docs/TECH_STACK.md decision (b);
        // docs/SECURITY.md SEC-MED-4(b); docs/QA_REPORT.md T-001 WARN-1).
        const claimant = seenSlugs.get(slug);
        if (claimant !== undefined) {
            return {
                ok: false,
                error: claimant === title
                    ? `Two categories are both named "${title}", which would both use the page /what-we-do/${slug}. Rename one of them and save again.`
                    : `"${claimant}" and "${title}" would both use the page /what-we-do/${slug}. Rename one of them and save again.`,
            };
        }
        seenSlugs.set(slug, title);

        categories.push({ id, title, slug, description, image });
    }

    return { ok: true, categories };
}

// Every existing category whose id is absent from a save's resolved output —
// an id-diff, never a slug-diff, so a brand-new row that happens to compute
// the identical slug a deleted row just vacated can never make the deletion
// invisible (closes CRIT-1 / SEC-HIGH-3 on the delete-guard's own side of the
// same root cause). Called by updateSettings immediately after a successful
// resolveCategoriesForSave().
export function computeRemovedCategories(
    existingById: ReadonlyMap<string, ExistingCategoryRef>,
    resolvedCategories: readonly Product[],
): ExistingCategoryRef[] {
    const resolvedIds = new Set(resolvedCategories.map(c => c.id));
    const removed: ExistingCategoryRef[] = [];
    for (const [id, ref] of existingById) {
        if (!resolvedIds.has(id)) removed.push(ref);
    }
    return removed;
}

// Factored out of updateSettings's own pre-fetch parsing so
// products-actions.ts can share the identical "which categories are
// genuinely frozen" read without re-deriving it (docs/TECH_STACK.md decision
// (d)'s same-day "legacy (id-less) categories" follow-up). A category with
// no stored id has never survived a save under decision (d) — true of every
// one of today's 8 live categories — and is absent from the returned map
// regardless of what normalizeProducts()'s read-time display fallback would
// compute for it.
export function readStoredCategoryIdentities(raw: unknown): Map<string, ExistingCategoryRef> {
    const result = new Map<string, ExistingCategoryRef>();
    if (!Array.isArray(raw)) return result;

    for (const item of raw) {
        if (!item || typeof item !== "object" || Array.isArray(item)) continue;
        const row = item as Record<string, unknown>;
        const id = typeof row.id === "string" ? row.id.trim() : "";
        if (!id) continue;

        const slug = typeof row.slug === "string" ? row.slug.trim() : "";
        const title = typeof row.title === "string" ? row.title.trim() : "";
        result.set(id, { slug, title: title || "(untitled category)" });
    }

    return result;
}

export interface Certification {
    name: string;
    src: string;
}

export const CERTIFICATIONS: Certification[] = [
    { name: "LEED Gold", src: "/images/client/certifications/leed-gold.jpg" },
    { name: "WRAP", src: "/images/client/certifications/wrap.jpg" },
    { name: "SMETA", src: "/images/client/certifications/smeta.jpg" },
    { name: "SLCP", src: "/images/client/certifications/slcp.jpg" },
    { name: "Higg Index", src: "/images/client/certifications/higg-index.jpg" },
    { name: "GOTS", src: "/images/client/certifications/gots.jpg" },
    { name: "Organic Content Standard", src: "/images/client/certifications/ocs.jpg" },
    { name: "Global Recycled Standard", src: "/images/client/certifications/grs.jpg" },
    { name: "OEKO-TEX Standard 100", src: "/images/client/certifications/oeko-tex.jpg" },
    { name: "Better Cotton Initiative", src: "/images/client/certifications/bci.jpg" },
    { name: "RMG Sustainability Council", src: "/images/client/certifications/rsc.jpg" },
];

// Email submissions land here (Contact / Career / Grievance forms open the
// visitor's mail client addressed to this inbox).
export const CONTACT_EMAIL = "admin@fashionasialtd.com";

// ---------------------------------------------------------------------------
// Career openings. Add entries to this array to publish job posts on /career.
// Leave it empty to show only the "Submit Your Application" form.
// ---------------------------------------------------------------------------
export interface Job {
    id: string;
    title: string;
    department: string | null;
    vacancy: number;
    location: string;
    employment_type: string;
    responsibilities: string | null;
    educational_requirements: string | null;
    experience_requirements: string | null;
    additional_requirements: string | null;
    workplace: string | null;
    salary: string | null;
    compensation: string | null;
    published_at: string;
    deadline: string | null;
    is_active: boolean;
    created_at: string;
}

export const JOBS: Job[] = [
    // Example (copy, edit, and set is_active: true to publish):
    // {
    //   id: "1",
    //   title: "Officer, Procurement & Development",
    //   department: "Procurement",
    //   vacancy: 1,
    //   location: "Sreepur, Bangladesh",
    //   employment_type: "Full-time",
    //   responsibilities: "Source raw materials\nNegotiate with suppliers",
    //   educational_requirements: "Bachelor's degree in a relevant field",
    //   experience_requirements: "2+ years in apparel sourcing",
    //   additional_requirements: null,
    //   workplace: "Work at office",
    //   salary: "Negotiable",
    //   compensation: null,
    //   published_at: "2026-06-01",
    //   deadline: "2026-07-31",
    //   is_active: true,
    //   created_at: "2026-06-01T00:00:00Z",
    // },
];

// ---------------------------------------------------------------------------
// Reports & publications shown on /reports. Empty => "Reports coming soon".
// category: 'financial' | 'audit' | 'compliance' | 'environmental' | 'csr'
// ---------------------------------------------------------------------------
export interface Report {
    id: string;
    title: string;
    category: string;
    year: number;
    file_url: string | null;
    published: boolean;
}

export const REPORTS: Report[] = [];

// ---------------------------------------------------------------------------
// Leadership profiles shown on /who-we-are. Empty => placeholder note hidden.
// ---------------------------------------------------------------------------
export interface Leader {
    id: string;
    name: string;
    title: string;
    bio: string | null;
    photo_url: string | null;
    sort_order: number;
}

// "Add Leader" in the admin creates the row immediately, so an unfilled one is
// publicly visible until somebody types over it. These are the values it starts
// with; the public page skips any leader still carrying them.
export const NEW_LEADER_NAME = "New Leader";
export const NEW_LEADER_TITLE = "Title";

export function isLeaderPublishable(leader: { name?: string | null; title?: string | null }) {
    const name = leader.name?.trim();
    if (!name) return false;
    return !(name === NEW_LEADER_NAME && leader.title?.trim() === NEW_LEADER_TITLE);
}

export const LEADERS: Leader[] = [
    { id: "1", name: "Sharifur Rahman", title: "Chairman", bio: null, photo_url: null, sort_order: 0 },
    { id: "2", name: "Alif Nadvi Rahman", title: "Managing Director", bio: null, photo_url: null, sort_order: 1 },
    { id: "3", name: "Aqib Jafri Sharif", title: "Director", bio: null, photo_url: null, sort_order: 2 },
];

// ---------------------------------------------------------------------------
// Media Center gallery (/life-at-fashion-asia). type: 'gallery' | 'news'.
// Drop new images into public/images/client/ and add entries here.
// ---------------------------------------------------------------------------
export interface MediaAsset {
    id: string;
    type: "gallery" | "news";
    title: string;
    url: string;
    content: string;
    created_at: string;
}

export const MEDIA_ASSETS: MediaAsset[] = [
    { id: "g1", type: "gallery", title: "Quality Control", url: "/images/client/box10-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g2", type: "gallery", title: "Green Facility", url: "/images/client/csr-main-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g3", type: "gallery", title: "Finishing & Delivery", url: "/images/client/box12-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g4", type: "gallery", title: "Production Scale", url: "/images/client/4-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g5", type: "gallery", title: "Medical Center", url: "/images/client/box6-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g6", type: "gallery", title: "Day Care", url: "/images/client/box4-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g7", type: "gallery", title: "Shera Shop", url: "/images/client/box3-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g8", type: "gallery", title: "Bicycle Parking", url: "/images/client/box2-copy.webp", content: "", created_at: "2026-01-01T00:00:00Z" },
];
