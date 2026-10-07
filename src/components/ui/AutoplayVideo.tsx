"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

/**
 * @purpose A muted, looping, inline autoplay `<video>` that respects
 * `prefers-reduced-motion`: with reduced motion on it's paused and shows its
 * poster, and it plays again if the preference is cleared. Its server markup is
 * byte-identical to the plain `<video src poster autoPlay muted loop playsInline …>`
 * it replaces; other props (aria-*, className, preload) pass through in order.
 * Used by the homepage hero, AboutSection and /what-we-do (T-028).
 */

type AutoplayVideoProps = Omit<
    ComponentPropsWithoutRef<"video">,
    "src" | "poster" | "autoPlay" | "muted" | "loop" | "playsInline" | "children"
> & {
    src: string;
    poster: string;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function AutoplayVideo({ src, poster, ...rest }: AutoplayVideoProps) {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;
        const query = window.matchMedia(REDUCED_MOTION);

        const sync = () => {
            const reduce = query.matches;
            // Already right: autoplaying without the preference, held with it.
            if (video.autoplay === !reduce) return;
            video.autoplay = !reduce;
            if (reduce) video.pause();
            // load() resets the element: back to the poster, or (preference
            // cleared) a fresh start that autoplays again.
            video.load();
        };

        sync();
        query.addEventListener("change", sync);
        return () => query.removeEventListener("change", sync);
    }, []);

    return <video ref={ref} src={src} poster={poster} autoPlay muted loop playsInline {...rest} />;
}
