import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/global/SmoothScrollProvider";
import PreloaderManager from "@/components/global/PreloaderManager";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
    title: "Fashion Asia Limited | Green Powered Innovation",
    description: "Modern, compliant, and sustainability-driven knit garments manufacturer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <body className="font-sans min-h-screen flex flex-col selection:bg-primary selection:text-black">
                <SmoothScrollProvider>
                    <PreloaderManager />
                    <Header />
                    <main className="flex-grow flex flex-col">
                        {children}
                    </main>
                    <Footer />
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
