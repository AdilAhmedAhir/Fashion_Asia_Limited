import DynamicCanvasEngine from "@/components/canvas/DynamicCanvasEngine";
import HeroOverlay from "./HeroOverlay";

export default function HeroSection() {
    return (
        <section className="relative w-full">
            <DynamicCanvasEngine>
                <HeroOverlay />
            </DynamicCanvasEngine>
        </section>
    );
}
