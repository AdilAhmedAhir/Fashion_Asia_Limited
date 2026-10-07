import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: { DEFAULT: "1.5rem", md: "2rem", lg: "4rem" },
            screens: { "2xl": "1400px" },
        },
        extend: {
            colors: {
                background: "#1a1f1a",
                foreground: "#f5faf5",
                primary: "#016138",
                secondary: "#02894f",
                accent: "#0EC97A",
                surface: "#0a0a0a",
            },
            backgroundImage: {
                // The photo-card scrim (T-027): the same gradient as
                // bg-gradient-to-t from-black/90 via-black/40 to-transparent.
                // 360deg is "to top". The CSS minifier rewrites "to top" and 0deg
                // as a reversed "to bottom", which rounds some pixels differently.
                scrim: "linear-gradient(360deg, rgb(0 0 0 / 0.9), rgb(0 0 0 / 0.4), transparent)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                serif: ["var(--font-playfair)", "serif"],
            },
        },
    },
    plugins: [],
};
export default config;
