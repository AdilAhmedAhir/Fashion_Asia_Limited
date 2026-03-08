import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";

const footerLinks = [
    {
        title: "Company",
        links: [
            { label: "Who We Are", href: "/who-we-are" },
            { label: "Business", href: "/business" },
            { label: "Sustainability", href: "/sustainability" },
            { label: "Reports", href: "/reports" },
            { label: "Media Center", href: "/media" },
        ],
    },
    {
        title: "Careers",
        links: [
            { label: "Career", href: "/career" },
            { label: "Contact Us", href: "/contact" },
            { label: "Grievance Policy", href: "/grievance" },
        ],
    },
    {
        title: "Connect",
        links: [
            { label: "admin@fashionasialtd.com", href: "mailto:admin@fashionasialtd.com" },
            { label: "+880 1711 691 366", href: "tel:+8801711691366" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-[#050505]">
            {/* Main Footer */}
            <div className="container py-16 md:py-20">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <BrandLogo className="w-10 h-10 transition-transform duration-700 group-hover:rotate-180" />
                            <div className="flex flex-col">
                                <span className="font-serif text-xl font-bold tracking-wide text-foreground">FASHION ASIA</span>
                                <span className="text-[0.6rem] uppercase tracking-[0.2em] text-foreground/40">Limited</span>
                            </div>
                        </Link>
                        <p className="max-w-sm text-sm leading-relaxed text-white/50">
                            A 100% export-oriented knitwear manufacturing company and proud sister concern of Northern Tosrifa Group, operating from a LEED Gold certified facility in Sreepur, Bangladesh.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            {["BSCI", "WRAP", "SEDEX", "GOTS"].map(cert => (
                                <span key={cert} className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[0.55rem] font-bold uppercase tracking-widest text-accent/70">
                                    {cert}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {footerLinks.map(group => (
                        <div key={group.title} className="flex flex-col gap-5">
                            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{group.title}</h4>
                            <ul className="flex flex-col gap-3">
                                {group.links.map(link => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/50 transition-colors hover:text-accent"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
                    <div className="flex items-center gap-4 text-xs text-white/30">
                        <span>© {new Date().getFullYear()} Fashion Asia Limited. All Rights Reserved.</span>
                        <span className="hidden md:inline text-white/10">|</span>
                        <span className="hidden md:inline">A Concern of Northern Tosrifa Group</span>
                    </div>
                    <div className="text-xs text-white/20">
                        fashionasialtd.com
                    </div>
                </div>
            </div>
        </footer>
    );
}
