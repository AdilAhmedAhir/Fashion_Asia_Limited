import SmoothScrollProvider from "@/components/global/SmoothScrollProvider";
import PreloaderManager from "@/components/global/PreloaderManager";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <SmoothScrollProvider>
            <PreloaderManager />
            <Header />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
        </SmoothScrollProvider>
    );
}
