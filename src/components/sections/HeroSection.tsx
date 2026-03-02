import DynamicCanvasEngine from "@/components/canvas/DynamicCanvasEngine";
import HeroOverlay from "./HeroOverlay";

export default function HeroSection({ videoIndex = "1" }: { videoIndex?: string }) {
    return (
        <section className="relative w-full">
            <DynamicCanvasEngine videoIndex={videoIndex}>
                <HeroOverlay />
            </DynamicCanvasEngine>
        </section>
    );
}
