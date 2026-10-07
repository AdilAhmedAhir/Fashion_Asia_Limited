import { createClient } from "@/lib/supabase/server";
import ImportBuiltInGallery from "./ImportBuiltInGallery";
import MediaPublishForm from "./MediaPublishForm";
import MediaDeleteButton from "./MediaDeleteButton";

export const revalidate = 0;

// Where focus goes after a delete removes its card (T-019).
const PUBLISHED_HEADING_ID = "published-assets";

export default async function AdminMediaPage() {
    const supabase = await createClient();
    const { data: media, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });

    return (
        <div className="flex max-w-6xl flex-col gap-10">
            <header className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Content Management</span>
                <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Media &amp; News Center</h1>
                <p className="text-white/50">Publish photo galleries and press releases to the live website.</p>
            </header>

            <ImportBuiltInGallery />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Publish Form */}
                <div className="lg:col-span-1">
                    <MediaPublishForm />
                </div>

                {/* Media Grid */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <h2 id={PUBLISHED_HEADING_ID} tabIndex={-1} className="font-serif text-xl font-bold text-foreground mb-2">Published Assets</h2>
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
                                            <span className="text-[0.65rem] font-bold uppercase tracking-widest text-accent">{post.type}</span>
                                            <span className="text-xs text-white/40">{new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-serif text-lg font-bold text-foreground line-clamp-1">{post.title}</h3>
                                    </div>
                                    <MediaDeleteButton id={post.id} title={post.title} focusAfterDelete={PUBLISHED_HEADING_ID} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
