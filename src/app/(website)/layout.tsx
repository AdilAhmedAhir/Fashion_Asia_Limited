import SmoothScrollProvider from "@/components/global/SmoothScrollProvider";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import Preloader from "@/components/global/Preloader";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <SmoothScrollProvider>
            <Preloader />
            <Header />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
        </SmoothScrollProvider>
    );
}
