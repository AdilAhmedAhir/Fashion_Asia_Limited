import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings, getLeaders } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Who We Are",
    description:
        "Fashion Asia Limited — a knit garments manufacturer in Sreepur, Gazipur and sister concern of Northern Tosrifa Group. Our vision, values, milestones, and leadership.",
};

export const revalidate = 60;

export default async function WhoWeArePage() {
    const data = await getSettings("who_we_are");
    const leaders = await getLeaders();

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Inheriting Excellence"
                title="Who We Are"
                description="A 100% export-oriented Ready-Made Garments manufacturing company specializing in knitwear, backed by the legacy of Northern Tosrifa Group."
            />

            {/* About Us */}
            <section className="container py-24 md:py-32">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
                    <ScrollReveal>
                        <div>
                            <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl mb-8">About Us</h2>
                            <div className="flex flex-col gap-6">
                                {(data.aboutParagraphs || []).map((para: string, i: number) => (
                                    <p key={i} className="text-white/70 leading-relaxed text-lg">{para}</p>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10">
                            <img
                                src="/images/client/who-we-are.jpg"
                                alt="Fashion Asia Limited knitwear"
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute bottom-5 left-5 rounded-full border border-primary/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
                                Knitwear Craftsmanship
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="bg-surface py-24 border-y border-white/5">
                <div className="container grid grid-cols-1 gap-16 md:grid-cols-2 max-w-6xl mx-auto">
                    <ScrollReveal delay={0.1}>
                        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/50 h-full hover:border-primary/30 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Vision</span>
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">{data.visionTitle || "A Globally Recognized Leader"}</h3>
                            <p className="mt-6 text-white/60 leading-relaxed text-lg">
                                {data.visionDescription || "To be a globally recognized knitwear manufacturer known for sustainable practices, technological advancement, and excellence in product quality."}
                            </p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/50 h-full hover:border-primary/30 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Mission</span>
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">{data.missionTitle || "Responsible Manufacturing"}</h3>
                            <ul className="mt-6 flex flex-col gap-4">
                                {(data.missionPoints || []).map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-white/60 leading-relaxed text-lg">
                                        <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary shadow-[0_0_10px_#016138]" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Milestones & Achievements */}
            {(data.milestones || []).length > 0 && (
                <section className="container py-24 md:py-32 border-b border-white/5">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <ScrollReveal>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Journey</span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Milestones &amp; Achievements</h2>
                            <p className="mt-4 text-white/70 text-lg">Three decades of steady, deliberate growth — from a single group venture to a green facility serving buyers worldwide.</p>
                        </ScrollReveal>
                    </div>

                    <div className="relative mx-auto max-w-3xl">
                        {/* Vertical spine */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />

                        <ol className="flex flex-col gap-10">
                            {(data.milestones || []).map((m: { year: string; title: string; description: string }, i: number) => (
                                <li key={m.year + m.title}>
                                    <ScrollReveal delay={i * 0.08}>
                                        <div className={`relative pl-10 md:w-1/2 md:pl-0 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:ml-auto md:pl-12"}`}>
                                            {/* Node. Left-column entries anchor to the right edge of
                                                their box, right-column entries to the left edge — both
                                                land on the centre spine. Only one of `left`/`right` may
                                                be set per side, or the dot falls back to its static
                                                position and floats above the text. */}
                                            <span
                                                className={`absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 border-primary bg-primary shadow-[0_0_12px_rgba(1,97,56,0.8)] ${i % 2 === 0 ? "md:left-auto md:-right-2" : "md:-left-2"}`}
                                                aria-hidden="true"
                                            />
                                            <span className="font-serif text-2xl font-bold text-gradient">{m.year}</span>
                                            <h3 className="mt-1 font-serif text-xl font-bold text-foreground">{m.title}</h3>
                                            <p className="mt-2 leading-relaxed text-white/60">{m.description}</p>
                                        </div>
                                    </ScrollReveal>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* Values */}
            <section className="container py-24 md:py-32 border-b border-white/5">
                <div className="mx-auto max-w-3xl text-center mb-16">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What Drives Us</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Our Values</h2>
                    </ScrollReveal>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(data.values || []).map((v: { title: string; description: string }, i: number) => (
                        <ScrollReveal key={v.title} delay={i * 0.1}>
                            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-primary/30">
                                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{v.title}</h3>
                                <p className="text-white/60 leading-relaxed">{v.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Leadership */}
            <section className="container py-24 md:py-32">
                <div className="mx-auto max-w-4xl text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl mb-8">Leadership</h2>
                        <p className="text-white/70 leading-relaxed text-lg mb-12">
                            Fashion Asia Ltd. is guided by experienced industry leaders who bring decades of knowledge in garment manufacturing, strategic management, and global sourcing.
                        </p>
                    </ScrollReveal>

                    {leaders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                            {leaders.map((leader, i) => (
                                <ScrollReveal key={leader.id} delay={i * 0.1}>
                                    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:border-primary/30 transition-colors">
                                        {leader.photo_url ? (
                                            <img src={leader.photo_url} alt={leader.name} className="h-24 w-24 rounded-full object-cover border-2 border-primary/30" />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                                {leader.name.charAt(0)}
                                            </div>
                                        )}
                                        <h3 className="font-serif text-xl font-bold text-white">{leader.name}</h3>
                                        <span className="text-xs uppercase tracking-widest text-primary font-bold">{leader.title}</span>
                                        {leader.bio && <p className="text-white/60 text-sm leading-relaxed mt-2">{leader.bio}</p>}
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 p-8 border border-dashed border-white/20 rounded-2xl bg-white/[0.01]">
                            <p className="text-xs uppercase tracking-widest text-white/30 font-bold">Leadership profiles coming soon</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
