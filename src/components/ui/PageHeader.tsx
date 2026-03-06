import ScrollReveal from "@/components/ui/ScrollReveal";

interface PageHeaderProps {
    tag: string;
    title: string;
    description?: string;
}

export default function PageHeader({ tag, title, description }: PageHeaderProps) {
    return (
        <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black pt-32 pb-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#016138_0%,transparent_40%)] opacity-10 blur-3xl pointer-events-none" />
            <div className="container relative z-10 flex max-w-4xl flex-col items-center">
                <ScrollReveal>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">{tag}</span>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                    <h1 className="mt-6 font-serif text-[clamp(3rem,6vw,5rem)] font-bold leading-tight text-foreground">
                        {title}
                    </h1>
                </ScrollReveal>
                {description && (
                    <ScrollReveal delay={0.2}>
                        <p className="mt-8 font-sans text-lg leading-relaxed text-white/70 max-w-2xl">
                            {description}
                        </p>
                    </ScrollReveal>
                )}
            </div>
        </section>
    );
}
