import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function NotFound() {
    return (
        <div className="flex flex-col bg-background min-h-[70vh] justify-center">
            <PageHeader
                tag="Error 404"
                title="Page Not Found"
                description="The page you are looking for has been moved or does not exist."
            />
            <section className="container py-12 flex justify-center pb-32">
                <Link
                    href="/"
                    className="rounded-full border-2 border-primary bg-transparent px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                >
                    Return to Homepage
                </Link>
            </section>
        </div>
    );
}
