import { cn } from "@/lib/utils";

interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    textarea?: boolean;
    className?: string;
}

export function FormInput({ label, name, type = "text", required = true, textarea = false, className }: FormInputProps) {
    const baseClasses = "mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 font-sans text-white placeholder:text-white/20 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

    return (
        <div className={cn("flex flex-col", className)}>
            <label htmlFor={name} className="font-sans text-xs font-bold uppercase tracking-widest text-white/50">
                {label} {required && <span className="text-primary">*</span>}
            </label>
            {textarea ? (
                <textarea id={name} name={name} required={required} rows={5} className={cn(baseClasses, "resize-none")} />
            ) : (
                <input id={name} name={name} type={type} required={required} className={baseClasses} />
            )}
        </div>
    );
}
