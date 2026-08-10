import type { SubmitState } from "@/app/actions/form-actions";

export function FormStatusMessage({ state }: { state: SubmitState }) {
    if (!state) return null;

    return (
        <p role="status" className={`text-sm ${state.ok ? "text-primary" : "text-red-400"}`}>
            {state.message}
        </p>
    );
}
