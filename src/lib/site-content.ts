/**
 * ============================================================================
 *  SITE CONTENT — single source of truth for all editable text on the site
 * ============================================================================
 *
 *  This is a static, backend-free site. There is NO database and NO admin panel.
 *  To change wording, stats, products, certifications, jobs, reports, or the
 *  media gallery, edit the plain objects in THIS file and redeploy.
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
        sustainabilityCerts: ["BSCI", "WRAP", "SEDEX", "GOTS", "OCS", "SLCP", "FEM"],
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
                image: "/images/client/box6-copy.jpg",
            },
            {
                title: "Day Care",
                description: "Childcare on the premises so working parents stay close to their children.",
                image: "/images/client/box4-copy.jpg",
            },
            {
                title: "Shera Shop",
                description: "A fair-price shop giving every employee daily essentials below market cost.",
                image: "/images/client/box3-copy.jpg",
            },
            {
                title: "Bicycle Parking",
                description: "Secure parking and safe commuting for the workforce that travels daily.",
                image: "/images/client/box2-copy.jpg",
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
        aboutParagraphs: [
            "Fashion Asia Ltd. is a modern, compliant, and sustainability-driven knit garments manufacturer based in Sreepur, Gazipur, Bangladesh. As a proud sister concern of Northern Tosrifa Group (NTG), which has over 34 years of excellence in the apparel industry, Fashion Asia continues the legacy of quality, innovation, and responsible manufacturing.",
            "With 26 production lines and a monthly capacity of 800,000 pieces, we specialize in producing a diverse range of knit garments including t-shirts, polo shirts, tank tops, dresses, sleepwear, leggings, sportswear, and heavy jersey products. Our factory is designed as a Green Manufacturing Facility, integrating renewable energy, solar power systems, and rainwater harvesting to reduce environmental impact.",
            "Equipped with state-of-the-art machinery such as auto spreaders, plotters, and auto cutters, and supported by advanced software solutions across cutting, sewing, merchandising, store, HR, payroll, and accounts, Fashion Asia delivers efficiency, transparency, and precision at every stage of production.",
            "With a dedicated workforce of 2,000 skilled employees and an annual turnover of USD 30 million, we are committed to delivering value to our global customers while maintaining the highest standards of compliance and sustainability.",
        ],
        // ⚠️ PLACEHOLDER DATES — VERIFY BEFORE PUBLISHING TO THE LIVE SITE.
        // The client brief listed "Milestones & Achievements" as a heading with
        // no entries. The years below are illustrative scaffolding so the
        // section renders; only the 1991 group founding is derived from a
        // stated fact ("over 34 years"). Replace every year and description
        // with the company's real history, or delete this array to hide the
        // section entirely (the page handles an empty list).
        milestones: [
            {
                year: "1992",
                title: "Northern Tosrifa Group Founded",
                description: "The parent group begins operations, starting more than three decades of continuous growth in Bangladesh's apparel sector.",
            },
            {
                year: "2015",
                title: "Fashion Asia Ltd. Established",
                description: "A dedicated knitwear unit is set up in Sreepur, Gazipur, purpose-built as a 100% export-oriented facility.",
            },
            {
                year: "2018",
                title: "Green Manufacturing Facility",
                description: "Solar power systems and rainwater harvesting are integrated, and the plant begins operating as a green factory.",
            },
            {
                year: "2021",
                title: "Scaled to 26 Production Lines",
                description: "Capacity reaches 800,000 pieces per month, supported by auto spreaders, plotters, and auto cutters.",
            },
            {
                year: "2024",
                title: "Full Compliance Portfolio",
                description: "BSCI, WRAP, SEDEX, SLCP, OCS, GOTS, and FEM certifications are maintained across the operation.",
            },
            {
                year: "Today",
                title: "2,000 People, USD 30M Turnover",
                description: "A skilled workforce of 2,000 delivers an annual turnover of USD 30 million for buyers worldwide.",
            },
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
        whatWeDoText:
            "Fashion Asia transforms ideas into world-class knitwear solutions. We turn creativity into reality. We specialize in developing and manufacturing all types of knitted garments for every market, age group, gender, climate, and lifestyle. From everyday essentials to complex fashion-forward designs, we work with a wide range of fabrics, finishes, and innovative constructions to bring our customers' visions to life. Whether inspired by the latest global trends or a completely new concept, our experienced team turns creative ideas into commercially successful products.",
        whatWeDoTagline: "If you can imagine it, Fashion Asia can make it happen.",
        products: [
            "T-Shirts", "Polo Shirts", "Tank Tops", "Dresses",
            "Sleepwear", "Leggings", "Sportswear", "Heavy Jersey Products",
        ],
        capacityDescription:
            "Our factory operates 26 production lines with a monthly production capacity of 800,000 pieces of knit garments. Supported by 2,000 skilled employees and modern production planning systems.",
        capacityStats: [
            { value: "26", label: "Production Lines" },
            { value: "800K", label: "Pieces Monthly" },
            { value: "2,000+", label: "Skilled Employees" },
            { value: "$30M", label: "Annual Turnover" },
        ],
        customers: ["Elcort ECI", "Kappahl", "Tamurakoma", "Max India"],
    },

    who_we_work_with: {
        intro:
            "Fashion Asia Ltd. is proud to serve reputable international buyers who trust us for quality, compliance, and timely delivery. Our partners range from national department stores and high-street retailers to specialist sportswear and denim labels across Europe, the Americas, and Asia.",
        assuranceStats: [
            { value: "99.2%", label: "Right First Time" },
            { value: "98.5%", label: "On-Time Delivery" },
            { value: "800K", label: "Pieces / Month" },
            { value: "$30M", label: "Annual Turnover" },
        ],
    },

    sustainability: {
        description:
            "Sustainability and compliance are integral to our business model. We maintain transparent documentation and reporting aligned with international standards and buyer requirements.",
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
    },

    general: {
        companyName: "Fashion Asia Limited",
        seoTitle: "Fashion Asia Limited — Premium Knitwear Manufacturing",
        seoDescription:
            "100% export-oriented knitwear manufacturer backed by Northern Tosrifa Group. LEED Gold certified, 800K pieces monthly capacity.",
    },
};

// ---------------------------------------------------------------------------
// Buyer / brand logos shown on the homepage, /business and /who-we-work-with.
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
// ---------------------------------------------------------------------------
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
    { name: "OCS 100", src: "/images/client/certifications/ocs.jpg" },
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

export const LEADERS: Leader[] = [
    { id: "1", name: "Sharifur Rahman", title: "Chairman", bio: null, photo_url: null, sort_order: 0 },
    { id: "2", name: "Alif Nadvi Rahman", title: "Managing Director", bio: null, photo_url: null, sort_order: 1 },
    { id: "3", name: "Aqib Jafri Sharif", title: "Director", bio: null, photo_url: null, sort_order: 2 },
];

// ---------------------------------------------------------------------------
// Media Center gallery (/media). type: 'gallery' | 'news'.
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
    { id: "g1", type: "gallery", title: "Quality Control", url: "/images/client/box10-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g2", type: "gallery", title: "Green Facility", url: "/images/client/csr-main-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g3", type: "gallery", title: "Finishing & Delivery", url: "/images/client/box12-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g4", type: "gallery", title: "Production Scale", url: "/images/client/4-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g5", type: "gallery", title: "Medical Center", url: "/images/client/box6-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g6", type: "gallery", title: "Day Care", url: "/images/client/box4-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g7", type: "gallery", title: "Shera Shop", url: "/images/client/box3-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
    { id: "g8", type: "gallery", title: "Bicycle Parking", url: "/images/client/box2-copy.jpg", content: "", created_at: "2026-01-01T00:00:00Z" },
];
