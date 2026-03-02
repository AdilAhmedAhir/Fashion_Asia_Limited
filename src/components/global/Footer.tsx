export default function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-[#0a0a0a] py-12">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex flex-col items-center gap-1 md:items-start">
                    <span className="font-serif text-lg font-bold text-foreground">
                        Fashion Asia Limited
                    </span>
                    <span className="font-sans text-sm text-white/50">
                        A Concern of Northern Tosrifa Group
                    </span>
                </div>
                <div className="font-sans text-sm text-white/40">
                    © {new Date().getFullYear()} All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
