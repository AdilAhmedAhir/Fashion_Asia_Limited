"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "group relative flex w-full md:w-fit items-center justify-center gap-4 overflow-hidden rounded-full border-2 border-primary px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest transition-all duration-300",
                pending
                    ? "bg-primary/50 text-black/50 cursor-not-allowed"
                    : "bg-primary text-black hover:bg-transparent hover:text-primary hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
            )}
        >
            {pending ? "Processing..." : label}
        </button>
    );
}
