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
                primary: "#0EC97A",
                secondary: "#019329",
                surface: "#0a0a0a",
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
