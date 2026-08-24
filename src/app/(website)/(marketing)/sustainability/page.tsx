import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings, getReports } from "@/app/actions/settings-actions";
import { CERTIFICATIONS } from "@/lib/site-content";
import { Download, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sustainability",
    description:
        "Green manufacturing at Fashion Asia Limited — solar power, rainwater harvesting, waste reduction, and LEED Gold, WRAP, BSCI, SMETA, SLCP, Higg Index, GOTS, OCS, GRS, OEKO-TEX, BCI and RSC certification.",
    // Self-referencing canonical and per-page OG. Without these every page
    // inherited the homepage's og:url, which matters most right after a
    // URL rename when crawlers are re-resolving these paths.
    alternates: { canonical: "/sustainability" },
    openGraph: {
        url: "/sustainability",
        title: "Sustainability",
        description:
                    "Green manufacturing at Fashion Asia Limited — solar power, rainwater harvesting, waste reduction, and LEED Gold, WRAP, BSCI, SMETA, SLCP, Higg Index, GOTS, OCS, GRS, OEKO-TEX, BCI and RSC certification.",
    },
};

export const revalidate = 60;

// Category pill colours for the reports listing (moved here from /reports).
const CATEGORY_COLORS: Record<string, string> = {
    financial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    audit: "bg-green-500/20 text-green-400 border-green-500/30",
    compliance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    environmental: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    csr: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default async function SustainabilityPage() {
    const data = await getSettings("sustainability");
    const reports = await getReports(true); // only published
    const initiatives = data.initiatives?.length ? data.initiatives : [
        "Use of renewable and solar energy",
        "Rainwater harvesting systems",
        "Energy-efficient production processes",
        "Waste reduction and responsible resource management",
        "Fair Price Shop facility for employees",
        "Educational support through the '100 Dream School Program' under Jaggo Foundation",
    ];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Green Manufacturing"
                title="Sustainability"
                description="Operating as a Green Factory with a strong commitment to environmental stewardship and social responsibility."
            />


            {/* Initiatives */}
            <section className="bg-surface py-24 border-b border-white/5">
                <div className="container max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="mb-16">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Environmental &amp; Social</span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Key Sustainability Initiatives</h2>
                            <p className="mt-4 text-white/70 text-lg">We believe sustainable growth is only possible when business success aligns with social and environmental well-being.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {initiatives.map((item: string, i: number) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="flex items-start gap-4 p-8 rounded-2xl border border-white/5 bg-black/40 hover:border-primary/20 transition-colors h-full">
                                    <div className="mt-1 h-3 w-3 rounded-full bg-primary flex-shrink-0 shadow-[0_0_10px_#016138]" />
                                    <p className="text-white/80 font-sans leading-relaxed text-lg">{item}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="container py-24">
                <div className="mx-auto mb-16 max-w-4xl text-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Global Recognition</span>
                        <h2 className="mt-4 mb-6 font-serif text-3xl font-bold md:text-4xl">Certifications &amp; Audits</h2>
                        <p className="text-lg leading-relaxed text-white/70">
                            These certifications demonstrate our commitment to ethical business conduct, responsible sourcing, environmental management, and international labor standards.
                        </p>
                    </ScrollReveal>
                </div>

                {/* The marks are supplied as artwork on white, so each sits on a
                    white card — the same treatment the buyer logos use, and the
                    only way most of them stay legible on the dark background. */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {CERTIFICATIONS.map((cert, i) => (
                        <ScrollReveal key={cert.name} delay={0.05 + (i % 4) * 0.08}>
                            <figure className="flex h-full flex-col items-center gap-4 rounded-xl bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                                <div className="flex h-16 flex-1 items-center justify-center md:h-20">
                                    <img
                                        src={cert.src}
                                        alt={`${cert.name} certification`}
                                        loading="lazy"
                                        className="max-h-16 w-auto max-w-full object-contain md:max-h-20"
                                    />
                                </div>
                                <figcaption className="text-center text-[0.65rem] font-bold uppercase tracking-widest text-black/50">
                                    {cert.name}
                                </figcaption>
                            </figure>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Reports & Publications — folded in from the former /reports page,
                which now redirects here. Entries come from REPORTS in
                src/lib/site-content.ts. */}
            <section id="reports" className="bg-surface py-24 border-t border-white/5 scroll-mt-24">
                <div className="container">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <ScrollReveal>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Transparency &amp; Governance
                            </span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                                Reports &amp; Publications
                            </h2>
                            <p className="mt-6 text-white/70 leading-relaxed text-lg">
                                Our annual reports, audit certifications, and compliance documentation —
                                published so buyers and stakeholders can verify what we claim.
                            </p>
                        </ScrollReveal>
                    </div>

                    {reports.length === 0 ? (
                        <ScrollReveal>
                            <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
                                <p className="text-sm font-bold uppercase tracking-widest text-white/30">
                                    Reports coming soon
                                </p>
                            </div>
                        </ScrollReveal>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {reports.map((report, i) => (
                                <ScrollReveal key={report.id} delay={i * 0.1}>
                                    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(14,201,122,0.08)]">
                                        <div className="flex items-center justify-center bg-black/40 p-8">
                                            <FileText size={48} className="text-white/20 transition-colors group-hover:text-primary/40" />
                                        </div>
                                        <div className="flex flex-grow flex-col justify-between p-6">
                                            <div>
                                                <h3 className="mb-3 font-serif text-lg font-bold text-white">{report.title}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-block rounded-full border px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest ${CATEGORY_COLORS[report.category] || ""}`}>
                                                        {report.category}
                                                    </span>
                                                    <span className="text-xs text-white/40">{report.year}</span>
                                                </div>
                                            </div>
                                            {report.file_url && (
                                                <a
                                                    href={report.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-black"
                                                >
                                                    <Download size={14} /> Download PDF
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
