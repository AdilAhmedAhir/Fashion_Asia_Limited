import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import { CLIENT_LOGOS } from "@/lib/site-content";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Who We Work With",
    description:
        "The international retailers and labels that rely on Fashion Asia Limited for knitwear manufacturing, and how we partner with them.",
};

export const revalidate = 60;

export default async function WhoWeWorkWithPage() {
    const data = await getSettings("who_we_work_with");
    const partnership: { title: string; description: string }[] = data.partnership || [];
    const assuranceStats: { value: string; label: string }[] = data.assuranceStats || [];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Our Partners"
                title="Who We Work With"
                description="Reputable international buyers who trust us for quality, compliance, and timely delivery."
            />

            {/* Brand wall */}
            <section className="container py-24 border-b border-white/5">
                <ScrollReveal>
                    <p className="mx-auto max-w-4xl text-center text-lg leading-relaxed text-white/70">
                        {data.intro}
                    </p>
                </ScrollReveal>

                <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {CLIENT_LOGOS.map((brand, i) => (
                        <ScrollReveal key={brand.name} delay={0.05 + (i % 4) * 0.08}>
                            <div className="flex h-24 items-center justify-center rounded-xl bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md md:h-28">
                                <img
                                    src={brand.src}
                                    alt={brand.name}
                                    loading="lazy"
                                    className="max-h-12 w-auto max-w-full object-contain md:max-h-14"
                                />
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Showroom band */}
            <section className="relative h-[280px] w-full overflow-hidden md:h-[400px]">
                {/* The showroom photograph is near-white. Rather than stacking
                    scrims heavy enough to bury it, dim the image itself the way
                    ScaleSection does — the room stays legible and white type
                    sits cleanly on top. */}
                <img
                    src="/images/client/showroom.jpg"
                    alt="Sample showroom at Fashion Asia Limited, with garment rails and display plinths"
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[0.45] grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="container">
                        <ScrollReveal>
                            <p className="max-w-xl font-serif text-2xl font-bold leading-tight text-foreground md:text-3xl">
                                Every partnership starts in the sample room — with fit, fabric, and finish
                                agreed before a single bulk piece is cut.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* How we partner */}
            <section className="bg-surface py-24 border-b border-white/5">
                <div className="container max-w-6xl">
                    <ScrollReveal>
                        <div className="mb-16 max-w-3xl">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                Working Together
                            </span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                                {data.partnershipTitle || "How We Partner"}
                            </h2>
                            <p className="mt-6 text-lg leading-relaxed text-white/70">
                                A buyer relationship is more than a purchase order. From first sample to final
                                shipment, these are the commitments our partners can hold us to.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {partnership.map((item, i) => (
                            <ScrollReveal key={item.title} delay={i * 0.1}>
                                <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-8 transition-colors hover:border-primary/30">
                                    <span className="font-serif text-sm font-bold text-primary">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <h3 className="font-serif text-xl font-bold text-foreground">{item.title}</h3>
                                    <p className="leading-relaxed text-white/60">{item.description}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assurance numbers */}
            {assuranceStats.length > 0 && (
                <section className="container py-24 border-b border-white/5">
                    <ScrollReveal>
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                                The Numbers
                            </span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                                What Partners Can Count On
                            </h2>
                        </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        {assuranceStats.map((stat, i) => (
                            <ScrollReveal key={stat.label} delay={i * 0.1}>
                                <div className="flex flex-col items-start gap-2 rounded-2xl border border-white/5 bg-black p-6 md:p-8">
                                    <span className="text-3xl font-bold text-gradient md:text-4xl">{stat.value}</span>
                                    <span className="text-[0.65rem] uppercase tracking-widest text-white/50 md:text-xs">
                                        {stat.label}
                                    </span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="container py-24">
                <ScrollReveal>
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                            Considering Bangladesh for your next programme?
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-white/70">
                            We are happy to walk you through our capacity, compliance portfolio, and sampling
                            process — and to arrange a visit to the facility in Sreepur.
                        </p>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="group flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-secondary hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                            >
                                Start a Conversation
                                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                            </Link>
                            <Link
                                href="/business"
                                className="group flex items-center gap-3 rounded-full border-2 border-white/15 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white/80 transition-all duration-300 hover:border-white/40 hover:text-white"
                            >
                                See What We Do
                                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
