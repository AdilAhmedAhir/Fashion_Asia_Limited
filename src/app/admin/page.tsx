import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { count: contactCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('type', 'contact');
    const { count: careerCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('type', 'career');
    const { count: grievanceCount } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('type', 'grievance');

    return (
        <div className="flex flex-col gap-10 max-w-6xl">
            <header>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Overview</span>
                <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl text-white">System Dashboard</h1>
                <p className="mt-2 text-white/50">Welcome to the Fashion Asia Command Center.</p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Contact Inquiries</span>
                    <p className="mt-6 font-serif text-5xl font-bold text-primary">{contactCount || 0}</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Job Applications</span>
                    <p className="mt-6 font-serif text-5xl font-bold text-white">{careerCount || 0}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-white/[0.02] p-8 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-widest text-red-400">Grievance Reports</span>
                    <p className="mt-6 font-serif text-5xl font-bold text-white">{grievanceCount || 0}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 shadow-lg">
                <h2 className="font-serif text-2xl font-bold mb-6 text-white">Database Status</h2>
                <div className="flex items-center p-6 border border-white/10 rounded-xl bg-black">
                    <div className="h-3 w-3 rounded-full bg-[#0EC97A] shadow-[0_0_10px_#0EC97A] mr-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-white/80">Supabase Connection Active</p>
                </div>
            </div>
        </div>
    );
}
