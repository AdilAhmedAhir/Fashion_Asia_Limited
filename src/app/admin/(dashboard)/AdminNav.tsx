"use client";

/** @purpose The admin's navigation (T-030): the sidebar from 768 px; below that, a top bar whose Menu toggle opens the same links in the same groups, plus Sign Out. Both mark the current page. */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Image as ImageIcon, Inbox,
    ShieldCheck, Home, Users, Briefcase, Leaf, FileText,
    Settings, Globe, Shirt, Menu, X
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useOverlayMenu } from "@/lib/use-overlay-menu";

const navItems = [
    {
        group: "System", items: [
            { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        ]
    },
    {
        group: "Page Settings", items: [
            { href: "/admin/homepage", icon: Home, label: "Homepage" },
            { href: "/admin/who-we-are", icon: Users, label: "Who We Are" },
            { href: "/admin/business", icon: Briefcase, label: "What We Do" },
            // Categories and their products (T-026), right after What We Do,
            // matching the public menu's order.
            { href: "/admin/products", icon: Shirt, label: "Products" },
            { href: "/admin/who-we-work-with", icon: Globe, label: "Global Partner" },
            { href: "/admin/sustainability", icon: Leaf, label: "Sustainability" },
        ]
    },
    {
        group: "Management", items: [
            { href: "/admin/careers", icon: Briefcase, label: "Careers" },
            { href: "/admin/reports", icon: FileText, label: "Reports (on /sustainability)" },
            { href: "/admin/media", icon: ImageIcon, label: "Life at Fashion Asia" },
            { href: "/admin/submissions", icon: Inbox, label: "Submissions" },
        ]
    },
    {
        group: "Configuration", items: [
            { href: "/admin/settings", icon: Settings, label: "Contact & Settings" },
        ]
    },
];

// The phone menu's panel is always in the page, so the toggle's
// aria-controls always has a target; it's `hidden` until opened.
const MENU_ID = "admin-menu";

// `/admin` is the dashboard, so it's current only on itself. Every other link
// is also current on the pages under it, such as /admin/products/x.
function isCurrent(href: string, pathname: string): boolean {
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

// The current page gets a bar and bolder text as well as a lighter fill, so it
// doesn't rely on colour alone. The focus ring is inset because the sidebar's
// link list scrolls, and a scrolling box clips a ring drawn outside the link.
function linkClass(current: boolean): string {
    const base = "relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
    return current
        ? `${base} bg-white/10 font-semibold text-foreground before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-accent`
        : `${base} font-medium text-white/70 hover:bg-white/5 hover:text-white`;
}

function NavGroups({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
    return (
        <>
            {navItems.map(group => (
                <div key={group.group}>
                    <span className="mb-2 mt-4 block text-xs font-bold uppercase tracking-widest text-white/50 first:mt-0">
                        {group.group}
                    </span>
                    {group.items.map(item => {
                        const current = isCurrent(item.href, pathname);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={current ? "page" : undefined}
                                onClick={onNavigate}
                                className={linkClass(current)}
                            >
                                <item.icon size={16} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </>
    );
}

export default function AdminNav({ signOut }: { signOut: ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);

    useOverlayMenu({
        open,
        onClose: close,
        toggleRef,
        panelRef,
        inertTargets: "#admin-main",
        // Tailwind's `md`, where the sidebar takes over from the menu.
        closeWhen: "(min-width: 768px)",
    });

    // Page scroll is locked while the menu is open. The lock goes on <html>:
    // globals.css gives <html> `overflow-x: clip`, which makes <html>'s
    // overflow the one the page scrolls by, so `overflow: hidden` on <body>
    // alone wouldn't stop it.
    useEffect(() => {
        if (!open) return;
        const root = document.documentElement;
        const previous = root.style.overflow;
        root.style.overflow = "hidden";
        return () => {
            root.style.overflow = previous;
        };
    }, [open]);

    return (
        <>
            {/* Below 768 px: a top bar with the Menu toggle. */}
            <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-black px-4 md:hidden">
                <div className="flex items-center gap-3">
                    <BrandLogo className="h-8 w-8" />
                    <span className="font-serif text-lg font-bold tracking-widest text-white">FA CMS</span>
                </div>
                <button
                    ref={toggleRef}
                    type="button"
                    aria-expanded={open}
                    aria-controls={MENU_ID}
                    onClick={() => setOpen(value => !value)}
                    className={`flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black ${open ? "bg-white/10 text-foreground" : "text-white/70 hover:bg-white/5 hover:text-foreground"}`}
                >
                    {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
                    Menu
                </button>
            </div>

            <div
                id={MENU_ID}
                ref={panelRef}
                hidden={!open}
                className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain bg-black px-4 pb-8 pt-4 md:hidden"
            >
                <nav aria-label="Admin" className="flex flex-col gap-1">
                    <NavGroups pathname={pathname} onNavigate={close} />
                </nav>
                <div className="mt-4 border-t border-white/5 pt-4">{signOut}</div>
            </div>

            {/* From 768 px: the sidebar. */}
            <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-r border-white/5 bg-black p-6 flex-col hidden md:flex">
                <div className="mb-8 flex items-center gap-3">
                    <BrandLogo className="h-8 w-8" />
                    <span className="font-serif text-lg font-bold tracking-widest text-white">FA CMS</span>
                </div>

                <nav aria-label="Admin" className="flex flex-col gap-1 flex-grow overflow-y-auto">
                    <NavGroups pathname={pathname} />
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                        <ShieldCheck size={16} className="text-accent" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Super Admin</span>
                            <span className="text-xs text-accent">Secure Session</span>
                        </div>
                    </div>
                    {signOut}
                </div>
            </aside>
        </>
    );
}
