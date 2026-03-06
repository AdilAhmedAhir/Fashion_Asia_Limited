import { logoutAction } from "@/app/actions/auth-actions";
import Link from "next/link";
import {
    LogOut, LayoutDashboard, Image as ImageIcon, Inbox,
    ShieldCheck, Home, Users, Briefcase, Leaf, FileText,
    Settings, Globe
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

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
            { href: "/admin/business", icon: Briefcase, label: "Business" },
            { href: "/admin/sustainability", icon: Leaf, label: "Sustainability" },
        ]
    },
    {
        group: "Management", items: [
            { href: "/admin/reports", icon: FileText, label: "Reports" },
            { href: "/admin/media", icon: ImageIcon, label: "Media Center" },
            { href: "/admin/submissions", icon: Inbox, label: "Submissions" },
        ]
    },
    {
        group: "Configuration", items: [
            { href: "/admin/settings", icon: Settings, label: "Contact & Settings" },
        ]
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-black p-6 flex-col hidden md:flex">
                <div className="mb-8 flex items-center gap-3">
                    <BrandLogo className="h-8 w-8" />
                    <span className="font-serif text-lg font-bold tracking-widest text-white">FA CMS</span>
                </div>

                <nav className="flex flex-col gap-1 flex-grow overflow-y-auto">
                    {navItems.map(group => (
                        <div key={group.group}>
                            <span className="mb-2 mt-4 block text-[0.6rem] font-bold uppercase tracking-widest text-white/25 first:mt-0">
                                {group.group}
                            </span>
                            {group.items.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
                        <ShieldCheck size={16} className="text-primary" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Super Admin</span>
                            <span className="text-[0.6rem] text-primary">Secure Session</span>
                        </div>
                    </div>
                    <form action={logoutAction}>
                        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            <main className="flex-grow flex flex-col max-h-screen overflow-y-auto">
                <div className="p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
