import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
    title: "Fashion Asia Limited | Green Powered Innovation",
    description: "Modern, compliant, and sustainability-driven knit garments manufacturer.",
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
