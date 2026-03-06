import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getReports } from "@/app/actions/settings-actions";
import { Download, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports & Publications | Fashion Asia Limited",
};

export const revalidate = 60;

const CATEGORY_COLORS: Record<string, string> = {
    financial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    audit: "bg-green-500/20 text-green-400 border-green-500/30",
    compliance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    environmental: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    csr: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default async function ReportsPage() {
    const reports = await getReports(true); // only published

    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader
                tag="Transparency & Governance"
                title="Reports & Publications"
                description="Access our annual reports, audit certifications, and compliance documentation."
            />

            <section className="container py-24">
                {reports.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 border-dashed bg-white/[0.02] p-16 text-center">
                        <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Reports coming soon</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {reports.map((report, i) => (
                            <ScrollReveal key={report.id} delay={i * 0.1}>
                                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(14,201,122,0.08)]">
                                    <div className="flex items-center justify-center bg-surface p-8">
                                        <FileText size={48} className="text-white/20 group-hover:text-primary/40 transition-colors" />
                                    </div>
                                    <div className="flex flex-grow flex-col justify-between p-6">
                                        <div>
                                            <h3 className="font-serif text-lg font-bold text-white mb-3">{report.title}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-block rounded-full border px-3 py-1 text-[0.6rem] uppercase tracking-widest font-bold ${CATEGORY_COLORS[report.category] || ""}`}>
                                                    {report.category}
                                                </span>
                                                <span className="text-xs text-white/40">{report.year}</span>
                                            </div>
                                        </div>
                                        {report.file_url && (
                                            <a href={report.file_url} target="_blank" rel="noopener noreferrer"
                                                className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 py-3 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-black">
                                                <Download size={14} /> Download PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
