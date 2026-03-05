import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BusinessPreviewSection() {
    const products = ['T-Shirts', 'Polo Shirts', 'Dresses', 'Sleepwear', 'Sportswear', 'Heavy Jersey'];

    return (
        <section className="bg-gradient-to-b from-[#0a0a0a] to-background py-24 md:py-32">
            <div className="container grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">

                {/* Left: Content */}
                <div className="flex flex-col justify-center">
                    <ScrollReveal delay={0}>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What We Do</span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-foreground">
                            Built for <span className="text-gradient">Global Scale</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-white/70">
                            26 production lines. 800K pieces monthly. From cutting-edge knit garments to precision sportswear — we deliver with a zero-defect philosophy for the world&apos;s leading brands.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.3} className="mt-10 w-fit">
                        <Link
                            href="/business"
                            className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                        >
                            Explore Our Business
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                        </Link>
                    </ScrollReveal>
                </div>

                {/* Right: Product Grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {products.map((product, i) => (
                        <ScrollReveal key={product} delay={0.1 + i * 0.08}>
                            <div className="flex h-28 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center font-serif text-base text-white/80 transition-all duration-500 hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(14,201,122,0.08)]">
                                {product}
                            </div>
                        </ScrollReveal>
                    ))}

                    {/* Stats Cards in the grid */}
                    {[
                        { val: "26", lbl: "Lines" },
                        { val: "800K", lbl: "Monthly" },
                        { val: "2,000+", lbl: "Team" },
                    ].map((stat, i) => (
                        <ScrollReveal key={stat.lbl} delay={0.5 + i * 0.08}>
                            <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5">
                                <span className="text-2xl font-bold text-gradient">{stat.val}</span>
                                <span className="text-[0.6rem] uppercase tracking-widest text-white/50 mt-1">{stat.lbl}</span>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

            </div>
        </section>
    );
}
