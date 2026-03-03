import { createClient } from "@/lib/supabase/server";
import { addMediaAction, deleteMediaAction } from "@/app/actions/media-actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Trash2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminMediaPage() {
    const supabase = await createClient();
    const { data: media, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });

    return (
        <div className="flex max-w-6xl flex-col gap-10">
            <header className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Content Management</span>
                <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Media &amp; News Center</h1>
                <p className="text-white/50">Publish photo galleries and press releases to the live website.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Publish Form */}
                <div className="lg:col-span-1">
                    <form action={addMediaAction} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black p-6 shadow-xl sticky top-8">
                        <h2 className="font-serif text-xl font-bold text-white mb-2">Publish New Item</h2>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Title</label>
                            <input name="title" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none" placeholder="e.g. Factory Floor" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Category</label>
                            <select name="type" required className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary focus:outline-none appearance-none">
                                <option value="gallery">Photo Gallery</option>
                                <option value="news">Press / News</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Image Upload</label>
                            <input name="file" type="file" accept="image/*" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-primary/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/30" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Image URL (Fallback if no upload)</label>
                            <input name="url" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none" placeholder="/images/client/1.jpg or https://..." />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Text Content (For News)</label>
                            <textarea name="content" rows={4} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none resize-none" />
                        </div>

                        <div className="mt-2 w-full">
                            <SubmitButton label="Publish to Site" />
                        </div>
                    </form>
                </div>

                {/* Media Grid */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h2 className="font-serif text-xl font-bold text-white mb-2">Published Assets</h2>
                    {error ? (
                        <div className="p-6 text-red-400 bg-red-400/10 rounded-xl border border-red-500/20">Database error. Did you run the SQL script?</div>
                    ) : media?.length === 0 ? (
                        <div className="p-12 text-center text-white/40 border border-white/5 border-dashed rounded-2xl bg-white/[0.01]">No media published yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {media?.map((post) => (
                                <div key={post.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                                    <div className="aspect-video w-full overflow-hidden bg-white/5">
                                        {post.url ? (
                                            <img src={post.url} alt={post.title} className="h-full w-full object-cover opacity-80" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-primary">{post.type}</span>
                                            <span className="text-xs text-white/40">{new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-white line-clamp-1">{post.title}</h3>
                                    </div>
                                    <form action={deleteMediaAction} className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <input type="hidden" name="id" value={post.id} />
                                        <input type="hidden" name="url" value={post.url || ""} />
                                        <button type="submit" className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500 backdrop-blur-sm shadow-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
