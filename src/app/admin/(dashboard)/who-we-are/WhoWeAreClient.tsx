"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea } from "@/components/admin/SettingsForm";
import { createLeader, updateLeader, deleteLeader } from "@/app/actions/settings-actions";
import { Plus, Trash2 } from "lucide-react";

interface WhoWeAreData {
    aboutParagraph1: string; aboutParagraph2: string;
    visionTitle: string; visionDescription: string;
    missionTitle: string; missionDescription: string;
}
interface Leader { id: string; name: string; title: string; bio: string; photo_url: string; sort_order: number; }

export default function WhoWeAreClient({ settings: init, leaders: initLeaders }: {
    settings: WhoWeAreData; leaders: Leader[];
}) {
    const [data, setData] = useState(init);
    const [leaders, setLeaders] = useState(initLeaders);
    const [isPending, startTransition] = useTransition();

    const set = <K extends keyof WhoWeAreData>(k: K, v: string) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        await updateSettings("who_we_are", data as unknown as Record<string, unknown>);
    });

    const addLeader = () => startTransition(async () => {
        const fd = new FormData();
        fd.set("name", "New Leader"); fd.set("title", "Title"); fd.set("bio", ""); fd.set("photo_url", ""); fd.set("sort_order", leaders.length.toString());
        await createLeader(fd);
        window.location.reload();
    });

    const removeLeader = (id: string) => {
        if (!confirm("Remove this leader?")) return;
        startTransition(async () => { await deleteLeader(id); window.location.reload(); });
    };

    const saveLeader = (leader: Leader) => startTransition(async () => {
        const fd = new FormData();
        fd.set("name", leader.name); fd.set("title", leader.title); fd.set("bio", leader.bio || ""); fd.set("photo_url", leader.photo_url || ""); fd.set("sort_order", leader.sort_order.toString());
        await updateLeader(leader.id, fd);
    });

    const updateLocalLeader = (i: number, field: keyof Leader, val: string) => {
        const next = [...leaders];
        next[i] = { ...next[i], [field]: val };
        setLeaders(next);
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="Who We Are" onSave={save} saving={isPending} />

            <SettingsCard title="About Us Content">
                <div className="flex flex-col gap-6">
                    <TextArea label="Paragraph 1" value={data.aboutParagraph1} onChange={v => set("aboutParagraph1", v)} rows={4} />
                    <TextArea label="Paragraph 2" value={data.aboutParagraph2} onChange={v => set("aboutParagraph2", v)} rows={4} />
                </div>
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
                        <TextArea label="Description" value={data.missionDescription} onChange={v => set("missionDescription", v)} rows={4} />
                    </div>
                </SettingsCard>
            </div>

            <SettingsCard title="Leadership Team">
                <div className="flex flex-col gap-6">
                    {leaders.map((leader, i) => (
                        <div key={leader.id} className="rounded-xl border border-white/10 bg-black/50 p-6">
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
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-2 flex-grow mr-4">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Photo URL</label>
                                    <input type="text" value={leader.photo_url || ""} onChange={e => updateLocalLeader(i, "photo_url", e.target.value)}
                                        onBlur={() => saveLeader(leaders[i])} placeholder="https://..."
                                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                                <button onClick={() => removeLeader(leader.id)} className="text-red-400 hover:text-red-300 p-2 mt-5"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addLeader} disabled={isPending}
                        className="flex items-center gap-2 self-start rounded-lg border border-primary/30 px-5 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                        <Plus size={14} /> Add Leader
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
}
