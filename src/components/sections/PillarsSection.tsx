import ScrollReveal from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

export default function PillarsSection() {
    const pillars = [
        {
            num: "01",
            title: "Quality",
            desc: "Zero-defect philosophy with Optitex precision and rigorous 4-point inspection.",
            tags: ["Optitex CAD", "AQL 2.5", "Gemini"],
            img: "/images/client/box10-copy.jpg",
            featured: false
        },
        {
            num: "02",
            title: "Sustainability",
            desc: "Solar powered. Zero salt dyeing. Water recycling. 100% compliance.",
            tags: ["Solar Power", "Zero Discharge", "Certified"],
            img: "/images/client/csr-main-copy.jpg",
            featured: true
        },
        {
            num: "03",
            title: "Delivery",
            desc: "Bullmar auto-cutting. Real-time tracking. Agile production systems.",
            tags: ["Bullmar", "45K/Day", "Agile"],
            img: "/images/client/box12-copy.jpg",
            featured: false
        }
    ];

    return (
        <section id="pillars" className="bg-gradient-to-b from-[#0a0a0a] to-background py-24 md:py-32">
            <div className="container flex flex-col items-center">

                <ScrollReveal delay={0} className="text-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Framework</span>
                    <h2 className="mt-4 font-serif text-[clamp(2.5rem,4vw,3.5rem)] font-bold text-foreground">Three Pillars of Excellence</h2>
                </ScrollReveal>

                <div className="mt-16 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {pillars.map((pillar, i) => (
                        <ScrollReveal key={pillar.num} delay={0.2 + i * 0.1} className="h-full">
                            <div className={cn(
                                "group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(14,201,122,0.1)]",
                                pillar.featured ? "border-primary/50 bg-primary/5 hover:border-primary" : "border-white/10 bg-white/[0.02] hover:border-primary/50"
                            )}>
                                <div className="relative h-[250px] w-full overflow-hidden">
                                    <img src={pillar.img} alt={pillar.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                    <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-primary/20 font-serif text-lg font-bold text-white backdrop-blur-md">
                                        {pillar.num}
                                    </div>
                                    {pillar.featured && (
                                        <div className="absolute left-4 top-4 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">LEED GOLD</div>
                                    )}
                                </div>

                                <div className="flex flex-grow flex-col justify-between p-8">
                                    <div>
                                        <h3 className="font-serif text-2xl font-bold text-foreground">{pillar.title}</h3>
                                        <p className="mt-4 font-sans text-sm leading-relaxed text-white/60">{pillar.desc}</p>
                                    </div>
                                    <div className="mt-8 flex flex-wrap gap-2">
                                        {pillar.tags.map(tag => (
                                            <span key={tag} className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-white">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
