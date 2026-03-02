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
        <section className="relative flex overflow-hidden border-y border-primary/20 bg-[#1a1f1a] py-12">
            <div className="flex w-fit animate-[marqueeScroll_30s_linear_infinite] items-center whitespace-nowrap">
                {content.map((text, i) => (
                    <div key={i} className="flex items-center">
                        <span className="mx-8 font-serif text-xl font-semibold text-foreground md:text-2xl">
                            {text}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(14,201,122,0.5)]" />
                    </div>
                ))}
            </div>

            {/* Gradient masks for smooth fade on edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#1a1f1a] to-transparent md:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#1a1f1a] to-transparent md:w-32" />

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
