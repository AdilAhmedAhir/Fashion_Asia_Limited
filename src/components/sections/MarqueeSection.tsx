export default function MarqueeSection() {
    const keywords = [
        "Fashion Asia Limited",
        "Sustainable Manufacturing",
        "LEED Gold Certified",
        "Right First Time",
        "Global Compliance",
        "Vertical Integration",
    ];

    // Duplicate the array multiple times to create a seamless CSS loop
    const content = [...keywords, ...keywords, ...keywords, ...keywords];

    return (
        <section className="relative flex overflow-hidden border-y border-primary/20 bg-background py-12">
            <div className="flex w-fit motion-safe:animate-[marqueeScroll_30s_linear_infinite] items-center whitespace-nowrap motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6">
                {content.map((text, i) => (
                    <div key={i} className={i < keywords.length ? "flex items-center" : "flex items-center motion-reduce:hidden"}>
                        <span className="mx-8 font-serif text-xl font-semibold text-foreground md:text-2xl">
                            {text}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(14,201,122,0.5)]" />
                    </div>
                ))}
            </div>

            {/* Gradient masks for smooth fade on edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent md:w-32 motion-reduce:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent md:w-32 motion-reduce:hidden" />

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
        </section>
    );
}
