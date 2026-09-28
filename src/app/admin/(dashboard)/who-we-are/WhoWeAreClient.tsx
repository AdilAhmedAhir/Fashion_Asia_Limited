"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, StatsList, ListEditor, ObjectListEditor } from "@/components/admin/SettingsForm";
import { createLeader, updateLeader, deleteLeader } from "@/app/actions/settings-actions";
import { NEW_LEADER_NAME, NEW_LEADER_TITLE, isLeaderPublishable } from "@/lib/site-content";
import { Plus, Trash2, TriangleAlert } from "lucide-react";

// Fallbacks for an unexpected throw in the leader handlers (T-015). An
// expected failure arrives as the action's own {ok:false, error} text instead
// and is shown as-is. A leader save keeps T-012's wording, shared with every
// settings save; add and remove name their own action, because "saving these
// changes" misdescribes both.
const GENERIC_ERROR = "Something went wrong saving these changes. Check your connection and try again.";
const ADD_LEADER_ERROR = "Couldn't add a leader. Check your connection and try again.";
const REMOVE_LEADER_ERROR = "Couldn't remove this leader. Check your connection and try again.";

export interface WhoWeAreData {
    assuranceStats: { value: string; label: string }[];
    aboutParagraphs: string[];
    milestones: { year: string; title: string; description: string }[];
    visionTitle: string; visionDescription: string;
    missionTitle: string; missionPoints: string[];
    values: { title: string; description: string }[];
    lifeAtFAL: { title: string; description: string }[];
}
interface Leader { id: string; name: string; title: string; bio: string; photo_url: string; sort_order: number; }

export default function WhoWeAreClient({ settings: init, leaders: initLeaders }: {
    settings: WhoWeAreData; leaders: Leader[];
}) {
    const [data, setData] = useState(init);
    const [leaders, setLeaders] = useState(initLeaders);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof WhoWeAreData>(k: K, v: WhoWeAreData[K]) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        setError(null);
        try {
            const result = await updateSettings("who_we_are", data as unknown as Record<string, unknown>);
            if (!result.ok) setError(result.error);
        } catch {
            setError("Something went wrong saving these changes. Check your connection and try again.");
        }
    });

    // Leader writes save on their own, separately from the page's Save
    // Changes button, so their failures get their own slots rather than
    // SettingsHeader's `error`: one per leader card (keyed by id, shared by
    // that card's save and delete) and one beside Add Leader. T-015.
    const [leaderErrors, setLeaderErrors] = useState<Record<string, string>>({});
    const [addLeaderError, setAddLeaderError] = useState<string | null>(null);

    const setLeaderError = (id: string, message: string | null) =>
        setLeaderErrors(prev => {
            const next = { ...prev };
            if (message === null) delete next[id];
            else next[id] = message;
            return next;
        });

    const addLeader = () => startTransition(async () => {
        setAddLeaderError(null);
        try {
            const fd = new FormData();
            fd.set("name", NEW_LEADER_NAME); fd.set("title", NEW_LEADER_TITLE); fd.set("bio", ""); fd.set("photo_url", ""); fd.set("sort_order", leaders.length.toString());
            const result = await createLeader(fd);
            if (!result.ok) {
                setAddLeaderError(result.error);
                return;
            }
            window.location.reload();
        } catch {
            setAddLeaderError(ADD_LEADER_ERROR);
        }
    });

    const removeLeader = (id: string) => {
        if (!confirm("Remove this leader?")) return;
        startTransition(async () => {
            setLeaderError(id, null);
            try {
                const result = await deleteLeader(id);
                if (!result.ok) {
                    setLeaderError(id, result.error);
                    return;
                }
                window.location.reload();
            } catch {
                setLeaderError(id, REMOVE_LEADER_ERROR);
            }
        });
    };

    // Fires on every field blur. Success stays silent, as before; a failure
    // shows in this leader's card, and the typed values stay in the fields
    // (local state is never reset), so the next blur retries with them.
    const saveLeader = (leader: Leader) => startTransition(async () => {
        setLeaderError(leader.id, null);
        try {
            const fd = new FormData();
            fd.set("name", leader.name); fd.set("title", leader.title); fd.set("bio", leader.bio || ""); fd.set("photo_url", leader.photo_url || ""); fd.set("sort_order", leader.sort_order.toString());
            const result = await updateLeader(leader.id, fd);
            if (!result.ok) setLeaderError(leader.id, result.error);
        } catch {
            setLeaderError(leader.id, GENERIC_ERROR);
        }
    });

    const updateLocalLeader = (i: number, field: keyof Leader, val: string) => {
        const next = [...leaders];
        next[i] = { ...next[i], [field]: val };
        setLeaders(next);
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="Who We Are" onSave={save} saving={isPending} error={error} />

            <SettingsCard title="Assurance Stats">
                <StatsList label="Stats" items={data.assuranceStats} onChange={v => set("assuranceStats", v)} />
            </SettingsCard>

            <SettingsCard title="About Us Content">
                <ListEditor label="Paragraphs" items={data.aboutParagraphs} onChange={v => set("aboutParagraphs", v)} />
            </SettingsCard>

            <SettingsCard title="Milestones & Achievements">
                <ObjectListEditor
                    label="Timeline"
                    items={data.milestones}
                    onChange={v => set("milestones", v)}
                    addLabel="Add Milestone"
                    fields={[
                        { key: "year", label: "Year" },
                        { key: "title", label: "Title" },
                        { key: "description", label: "Description", type: "textarea" },
                    ]}
                />
                <p className="mt-4 text-xs text-white/30">
                    Leave this list empty to hide the timeline section entirely.
                </p>
            </SettingsCard>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <SettingsCard title="Vision">
                    <div className="flex flex-col gap-5">
                        <TextInput label="Title" value={data.visionTitle} onChange={v => set("visionTitle", v)} />
                        <TextArea label="Description" value={data.visionDescription} onChange={v => set("visionDescription", v)} rows={4} />
                    </div>
                </SettingsCard>
                <SettingsCard title="Mission">
                    <div className="flex flex-col gap-5">
                        <TextInput label="Title" value={data.missionTitle} onChange={v => set("missionTitle", v)} />
                        <ListEditor label="Mission Points" items={data.missionPoints} onChange={v => set("missionPoints", v)} />
                    </div>
                </SettingsCard>
            </div>

            <SettingsCard title="Core Values">
                <ObjectListEditor
                    label="Values"
                    items={data.values}
                    onChange={v => set("values", v)}
                    addLabel="Add Value"
                    fields={[
                        { key: "title", label: "Title" },
                        { key: "description", label: "Description", type: "textarea" },
                    ]}
                />
            </SettingsCard>

            <SettingsCard title="Life at Fashion Asia">
                <ObjectListEditor
                    label="Culture Pillars (also shown on /life-at-fashion-asia)"
                    items={data.lifeAtFAL}
                    onChange={v => set("lifeAtFAL", v)}
                    addLabel="Add Pillar"
                    fields={[
                        { key: "title", label: "Title" },
                        { key: "description", label: "Description", type: "textarea" },
                    ]}
                />
            </SettingsCard>

            <SettingsCard title="Leadership Team">
                <div className="flex flex-col gap-6">
                    {leaders.map((leader, i) => (
                        <div key={leader.id} className="rounded-xl border border-white/10 bg-black/50 p-6">
                            {!isLeaderPublishable(leader) && (
                                <p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[0.7rem] text-amber-300/80">
                                    Not shown on the site yet — give this leader a real name to publish them.
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Name</label>
                                    <input type="text" value={leader.name} onChange={e => updateLocalLeader(i, "name", e.target.value)}
                                        onBlur={() => saveLeader(leaders[i])}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
                                    <input type="text" value={leader.title} onChange={e => updateLocalLeader(i, "title", e.target.value)}
                                        onBlur={() => saveLeader(leaders[i])}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 mb-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Bio</label>
                                <textarea value={leader.bio || ""} onChange={e => updateLocalLeader(i, "bio", e.target.value)}
                                    onBlur={() => saveLeader(leaders[i])} rows={3}
                                    className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none resize-none" />
                            </div>
                            {/* min-w-0 lets the Photo URL field shrink below the
                                input's ~200px default width. Without it, at phone
                                widths the field spilled out of the card and pushed
                                the remove button outside it. The button has an
                                aria-label because lucide marks its icon aria-hidden. */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-2 flex-grow mr-4 min-w-0">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Photo URL</label>
                                    <input type="text" value={leader.photo_url || ""} onChange={e => updateLocalLeader(i, "photo_url", e.target.value)}
                                        onBlur={() => saveLeader(leaders[i])} placeholder="https://..."
                                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                                <button onClick={() => removeLeader(leader.id)} aria-label={`Remove ${leader.name || "this leader"}`} className="text-red-400 hover:text-red-300 p-2 mt-5"><Trash2 size={16} /></button>
                            </div>
                            {/* This card's save or delete failure. Same markup as
                                SettingsHeader's (T-012); text-red-400 on the card's
                                #070707 is 7.26:1, above the 4.5:1 AA floor. */}
                            {leaderErrors[leader.id] && (
                                <p role="alert" className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-red-400">
                                    <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                    {leaderErrors[leader.id]}
                                </p>
                            )}
                        </div>
                    ))}
                    {/* The button was already disabled while any write on this
                        page runs, but looked identical. It now dims, and the
                        hover tint only shows when it can be pressed. No
                        spinner: the busy flag is shared with leader blur-saves
                        and the page's Save, so it can't say what is running.
                        Error: text-red-400 on this card's #0f0f0f, 6.93:1. */}
                    <div className="flex flex-col gap-3">
                        <button onClick={addLeader} disabled={isPending}
                            className="flex items-center gap-2 self-start rounded-lg border border-primary/30 px-5 py-2.5 text-xs font-bold text-primary enabled:hover:bg-primary/10 disabled:opacity-50 transition-colors">
                            <Plus size={14} /> Add Leader
                        </button>
                        {addLeaderError && (
                            <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                                <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                {addLeaderError}
                            </p>
                        )}
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
}
