"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return redirect("/admin/login?error=true");
    }

    revalidatePath("/admin", "layout");
    return redirect("/admin");
}

export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/admin/login");
}
