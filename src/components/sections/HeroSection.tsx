import CanvasEngine from "@/components/canvas/CanvasEngine";
import HeroOverlay from "./HeroOverlay";

export default function HeroSection() {
    return (
        <section className="relative w-full">
            <CanvasEngine>
                <HeroOverlay />
            </CanvasEngine>
        </section>
    );
}
