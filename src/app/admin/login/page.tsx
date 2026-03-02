import { loginAction } from "@/app/actions/auth-actions";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-8 shadow-2xl">
                <div className="mb-8 flex flex-col items-center text-center">
                    <BrandLogo className="h-16 w-16" />
                    <h1 className="mt-6 font-serif text-2xl font-bold tracking-wider text-white">FASHION ASIA CMS</h1>
                    <p className="mt-2 text-xs uppercase tracking-widest text-white/40">Secure Access Portal</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-medium text-red-500">
                        Invalid email or password.
                    </div>
                )}

                <form action={loginAction} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/50">Admin Email</label>
                        <input name="email" type="email" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/50">Password</label>
                        <input name="password" type="password" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <button type="submit" className="mt-4 w-full rounded-xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:bg-secondary hover:shadow-[0_0_20px_rgba(14,201,122,0.3)]">
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
}
