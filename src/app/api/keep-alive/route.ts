import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // Verify the request is from Vercel Cron (in production)
    const authHeader = request.headers.get("authorization");
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Use the direct Supabase client (no cookies needed for cron)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Lightweight query to keep the Supabase project active
        const { data, error } = await supabase
            .from("site_settings")
            .select("id")
            .limit(1);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: "Supabase project kept alive",
            dbReachable: !error,
        });
    } catch (err) {
        console.error("[keep-alive] Error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to ping Supabase" },
            { status: 500 }
        );
    }
}
