import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fashionasia.vercel.app';

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
    colorScheme: "dark",
};

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "Fashion Asia Limited | Green Powered Innovation",
        template: "%s | Fashion Asia Limited",
    },
    description: "A 100% export-oriented, LEED Gold certified Ready-Made Garments manufacturing company specializing in knitwear, based in Bangladesh.",
    keywords: ["Knit Garments", "Apparel Manufacturing", "Bangladesh RMG", "LEED Gold Factory", "Sustainable Fashion", "Northern Tosrifa Group"],
    authors: [{ name: "Fashion Asia Limited" }],
    creator: "Fashion Asia Limited",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        title: "Fashion Asia Limited | Green Powered Innovation",
        description: "Modern, compliant, and sustainability-driven knit garments manufacturer in Bangladesh.",
        siteName: "Fashion Asia Limited",
        images: [
            {
                url: "/images/client/2.jpg",
                width: 1200,
                height: 630,
                alt: "Fashion Asia Production Facility",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Fashion Asia Limited | Green Powered Innovation",
        description: "Modern, compliant, and sustainability-driven knit garments manufacturer.",
        images: ["/images/client/2.jpg"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-black">
                {children}
            </body>
        </html>
    );
}
