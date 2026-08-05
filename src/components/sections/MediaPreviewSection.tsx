import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Facility {
    title: string;
    description: string;
    image: string;
}

interface Pillar {
    title: string;
    description: string;
}

interface MediaPreviewSectionProps {
    tag?: string;
    eyebrow?: string;
    description?: string;
    stat?: { value: string; label: string };
    facilities?: Facility[];
    pillars?: Pillar[];
}

const FALLBACK_FACILITIES: Facility[] = [
    { title: "Medical Center", description: "On-site medical services, healthcare assistance, and maternity support.", image: "/images/client/box6-copy.jpg" },
    { title: "Day Care", description: "Childcare on the premises so working parents stay close to their children.", image: "/images/client/box4-copy.jpg" },
    { title: "Shera Shop", description: "A fair-price shop giving every employee daily essentials below market cost.", image: "/images/client/box3-copy.jpg" },
    { title: "Bicycle Parking", description: "Secure parking and safe commuting for the workforce that travels daily.", image: "/images/client/box2-copy.jpg" },
];

export default function MediaPreviewSection({
    tag,
    eyebrow,
    description,
    stat,
    facilities,
    pillars,
}: MediaPreviewSectionProps) {
    const items = facilities?.length ? facilities : FALLBACK_FACILITIES;
    const values = pillars ?? [];
    const headcount = stat ?? { value: "2,000", label: "People on site every day" };

    return (
        <section className="bg-gradient-to-b from-[#0a0a0a] to-background py-24 md:py-32">
            <div className="container">
                {/* Narrative bridge — carries the reader out of Sustainability
                    and into the people story rather than dropping them onto a
                    bare grid of photographs. */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
                    <div>
                        <ScrollReveal>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                {tag || "Life at Fashion Asia"}
                            </span>
                        </ScrollReveal>
                        <ScrollReveal delay={0.1}>
                            <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-foreground">
                                More Than a <span className="text-gradient">Workplace</span>
                            </h2>
                        </ScrollReveal>
                        {eyebrow && (
                            <ScrollReveal delay={0.15}>
                                <p className="mt-6 border-l-2 border-primary/50 pl-5 font-serif text-lg italic text-white/70 md:text-xl">
                                    {eyebrow}
                                </p>
                            </ScrollReveal>
                        )}
                    </div>

                    <ScrollReveal delay={0.2}>
                        <div className="lg:pb-2">
                            <p className="font-sans text-base leading-relaxed text-white/60">
                                {description ||
                                    "The same standards that make our facility green make it a good place to work. Behind every garment are 2,000 people — and the care we design around them is deliberate, funded, and measured."}
                            </p>
                            <div className="mt-8 flex items-baseline gap-4 border-t border-white/10 pt-6">
                                <span className="font-serif text-4xl font-bold text-gradient md:text-5xl">
                                    {headcount.value}
                                </span>
                                <span className="text-[0.7rem] uppercase tracking-widest text-white/50">
                                    {headcount.label}
                                </span>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Facilities — captions are always visible, so each photograph
                    explains itself instead of relying on a hover state that
                    never fires on touch devices. */}
                <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
                    {items.map((item, i) => (
                        <ScrollReveal key={item.title} delay={0.1 + i * 0.1}>
                            <figure className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors duration-300 hover:border-primary/40">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                                <figcaption className="flex flex-1 flex-col gap-2 p-5">
                                    <span className="font-serif text-lg font-bold text-foreground">
                                        {item.title}
                                    </span>
                                    <span className="font-sans text-sm leading-relaxed text-white/55">
                                        {item.description}
                                    </span>
                                </figcaption>
                            </figure>
                        </ScrollReveal>
                    ))}
                </div>

                {/* The four culture pillars, tying the facilities above back to
                    the commitments stated on /who-we-are. */}
                {values.length > 0 && (
                    <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, i) => (
                            <ScrollReveal key={value.title} delay={0.1 + i * 0.08}>
                                <div className="flex flex-col gap-3">
                                    <span className="h-[2px] w-8 bg-primary" />
                                    <h3 className="font-serif text-base font-bold text-foreground">
                                        {value.title}
                                    </h3>
                                    <p className="font-sans text-sm leading-relaxed text-white/50">
                                        {value.description}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                <ScrollReveal delay={0.3} className="mt-16 flex flex-wrap justify-center gap-4">
                    <Link
                        href="/media"
                        className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                    >
                        Life at Fashion Asia
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                    <Link
                        href="/career"
                        className="group flex items-center gap-3 rounded-full border-2 border-white/15 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
                    >
                        Join the Team
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                </ScrollReveal>
            </div>
        </section>
    );
}
