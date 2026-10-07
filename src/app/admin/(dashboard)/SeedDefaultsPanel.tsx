"use client";

import { useId, useState, useTransition } from "react";
import { seedSettingsFromDefaults } from "@/app/actions/settings-actions";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

// Page keys were rewritten by the redesign, so they default to on. contact and
// general hold details the client maintains by hand — they are left off unless
// deliberately selected.
const PAGE_KEYS = ["homepage", "who_we_are", "business", "who_we_work_with", "sustainability"];
const CONFIG_KEYS = ["contact", "general"];

const LABELS: Record<string, string> = {
    homepage: "Homepage",
    who_we_are: "Who We Are",
    // Only the page text is reset (T-026): seedSettingsFromDefaults never
    // writes the categories, which live in the same stored row.
    business: "What We Do page text (categories are never touched)",
    who_we_work_with: "Global Partner",
    sustainability: "Sustainability",
    contact: "Contact details",
    general: "General / SEO"
};

// "Synced Homepage, Who We Are and Sustainability." for the keys a sync
// wrote, in the order it wrote them, or "" for none (T-033). Pages are named
// only by the labels above: a key without one is left out, never shown raw.
function syncedSentence(keys: readonly string[]): string {
    const labels = keys.filter(key => Object.prototype.hasOwnProperty.call(LABELS, key)).map(key => LABELS[key]);
    if (!labels.length) return "";
    const list = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels[0];
    return `Synced ${list}.`;
}

export default function SeedDefaultsPanel() {
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState<string[]>(PAGE_KEYS);
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
    // Names (T-011): each heading names its group of checkboxes.
    const groupId = useId();

    const toggle = (key: string) =>
        setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));

    const run = () => {
        if (!selected.length) return;
        const confirmed = confirm(
            `Replace the stored content for ${selected.length} page(s) with the defaults written in the code?\n\n` +
            selected.map(k => `  • ${LABELS[k] ?? k}`).join("\n") +
            "\n\nAny edit made in this dashboard that is not also in the code will be lost for those pages."
        );
        if (!confirmed) return;

        setResult(null);
        startTransition(async () => {
            try {
                // Returns its failures (T-026) rather than throwing them,
                // because Next redacts a thrown Server Action message in
                // production. A failure still lists the pages synced before
                // it (T-033), and they're named first.
                const outcome = await seedSettingsFromDefaults(selected);
                const synced = syncedSentence(outcome.seeded);
                if (!outcome.ok) {
                    setResult({ ok: false, message: synced ? `${synced} ${outcome.error}` : outcome.error });
                    return;
                }
                setResult({ ok: true, message: synced || "Synced." });
            } catch {
                setResult({ ok: false, message: "Sync failed. Check your connection and try again." });
            }
        });
    };

    const Checkbox = ({ k }: { k: string }) => (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
            <input
                type="checkbox"
                checked={selected.includes(k)}
                onChange={() => toggle(k)}
                className="h-4 w-4 accent-primary"
            />
            {LABELS[k] ?? k}
        </label>
    );

    return (
        <div className="rounded-2xl border border-amber-500/20 bg-white/[0.02] p-8 shadow-lg">
            <h2 className="font-serif text-2xl font-bold mb-2 text-foreground">Sync Content From Code</h2>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/50">
                Replaces stored page content with the defaults defined in
                <code className="mx-1 text-accent">src/lib/site-content.ts</code>.
                Use this once after a redesign, when the database still holds copy written for the
                previous page structure. It is not needed for day-to-day editing.
            </p>

            <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div role="group" aria-labelledby={`${groupId}-pages`} className="flex flex-col gap-3">
                    <span id={`${groupId}-pages`} className="text-xs font-bold uppercase tracking-widest text-white/40">Page content</span>
                    {PAGE_KEYS.map(k => <Checkbox key={k} k={k} />)}
                </div>
                <div role="group" aria-labelledby={`${groupId}-config`} className="flex flex-col gap-3">
                    <span id={`${groupId}-config`} className="text-xs font-bold uppercase tracking-widest text-white/40">Configuration</span>
                    {CONFIG_KEYS.map(k => <Checkbox key={k} k={k} />)}
                    <p className="mt-1 text-xs leading-relaxed text-white/30">
                        Off by default — these hold contact details and SEO text you maintain by hand.
                    </p>
                </div>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <p className="text-xs leading-relaxed text-amber-200/80">
                    Fields defined in the code are overwritten. Fields that exist only in the database
                    are preserved.
                </p>
            </div>

            <button
                onClick={run}
                disabled={isPending || !selected.length}
                className="flex items-center gap-2 rounded-lg border border-amber-500/40 px-6 py-3 text-sm font-bold text-amber-300 transition-all hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {isPending ? "Syncing..." : `Sync ${selected.length} page(s) from code`}
            </button>

            {/* An error is role="alert" and a success role="status"
                (docs/DESIGN.md §6). Success is text-accent: text-primary as
                text on this dark panel fails AA (DESIGN.md §2). */}
            {result && (
                <p role={result.ok ? "status" : "alert"} className={`mt-4 text-sm ${result.ok ? "text-accent" : "text-red-400"}`}>
                    {result.message}
                </p>
            )}
        </div>
    );
}
