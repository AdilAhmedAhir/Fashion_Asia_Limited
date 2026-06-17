import HeroOverlay from "./HeroOverlay";

export default function HeroSection() {
    return (
        <section className="relative h-screen min-h-[680px] w-full overflow-hidden bg-black">
            {/* Background video */}
            <video
                src="/videos/hero.mp4"
                poster="/sequence/hero/poster.webp"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            {/* Cinematic darkening overlays (matches the design comp) */}
            <div
                className="absolute inset-0 z-[1]"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(26,31,26,0.35) 45%, rgba(26,31,26,0.95) 100%)" }}
            />
            <div
                className="absolute inset-0 z-[1]"
                style={{ background: "radial-gradient(circle at 50% 45%, transparent 0%, rgba(0,0,0,0.45) 100%)" }}
            />

            {/* Headline / stats / scroll indicator */}
            <div className="hero-overlay-wrapper absolute inset-0 z-10 flex flex-col items-center justify-center">
                <HeroOverlay />
            </div>
        </section>
    );
}
