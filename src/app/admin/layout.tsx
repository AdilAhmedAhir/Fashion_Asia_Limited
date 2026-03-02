import { logoutAction } from "@/app/actions/auth-actions";
import Link from "next/link";
import { LogOut, LayoutDashboard, Image as ImageIcon, Inbox, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export const metadata = { title: "Admin Dashboard | Fashion Asia Limited" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-black p-6 flex-col hidden md:flex">
                <div className="mb-12 flex items-center gap-3">
                    <BrandLogo className="h-8 w-8" />
                    <span className="font-serif text-lg font-bold tracking-widest text-white">FA CMS</span>
                </div>

                <nav className="flex flex-col gap-2 flex-grow">
                    <span className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/30">System</span>
                    <Link href="/admin" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>

                    <span className="mb-2 mt-6 text-[0.65rem] font-bold uppercase tracking-widest text-white/30">Management</span>
                    <Link href="/admin/media" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <ImageIcon size={18} /> Media Center
                    </Link>
                    <Link href="/admin/submissions" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <Inbox size={18} /> Submissions
                    </Link>
                </nav>

                <div className="mt-auto border-t border-white/5 pt-6">
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                        <ShieldCheck size={18} className="text-primary" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Super Admin</span>
                            <span className="text-[0.65rem] text-primary">Secure Session</span>
                        </div>
                    </div>
                    <form action={logoutAction}>
                        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
                            <LogOut size={18} /> Sign Out
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
