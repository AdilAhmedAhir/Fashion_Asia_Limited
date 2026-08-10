import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import { CLIENT_LOGOS } from "@/lib/site-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Who We Work With",
    description:
        "The international retailers and labels that rely on Fashion Asia Limited for knitwear manufacturing.",
};

export const revalidate = 60;

export default async function WhoWeWorkWithPage() {
    const data = await getSettings("who_we_work_with");

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

        </div>
    );
}
