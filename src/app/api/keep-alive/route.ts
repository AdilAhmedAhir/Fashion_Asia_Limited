import { createClient } from "@/lib/supabase/server";
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
        const supabase = await createClient();

        // Lightweight query to keep the Supabase project active
        const { error } = await supabase.rpc("ping", undefined);

        // Fallback: if the RPC doesn't exist, just run a raw health check
        if (error) {
            const { error: fallbackError } = await supabase
                .from("_keep_alive")
                .select("*")
                .limit(1);

            // Even if the table doesn't exist, the API call itself
            // registers activity and prevents pausing
            if (fallbackError) {
                console.log(
                    "[keep-alive] Fallback query ran (table may not exist, but activity registered)",
                    fallbackError.message
                );
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: "Supabase project kept alive",
        });
    } catch (err) {
        console.error("[keep-alive] Error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to ping Supabase" },
            { status: 500 }
        );
    }
}
