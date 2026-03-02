import VideoEngine from "@/components/canvas/VideoEngine";
import HeroOverlay from "./HeroOverlay";

export default function HeroSection({ videoIndex = "1" }: { videoIndex?: string }) {
    return (
        <section className="relative w-full">
            <VideoEngine videoIndex={videoIndex}>
                <HeroOverlay />
            </VideoEngine>
        </section>
    );
}
