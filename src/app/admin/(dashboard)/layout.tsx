import { logoutAction } from "@/app/actions/auth-actions";
import { LogOut } from "lucide-react";
import AdminNav from "./AdminNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-surface md:flex-row">
            {/* Sign Out stays a server-rendered form, so it keeps logoutAction here
                and the leave guard on /admin/products still asks before it. */}
            <AdminNav
                signOut={
                    <form action={logoutAction}>
                        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                            <LogOut size={16} /> Sign Out
                        </button>
                    </form>
                }
            />

            <main id="admin-main" className="min-w-0 flex-grow">
                <div className="p-8 md:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
