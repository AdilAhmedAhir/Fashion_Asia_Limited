"use client";

import Image from "next/image";

export function BrandLogo({ className = "w-8 h-8", animated = false }: { className?: string; animated?: boolean }) {
    return (
        <Image
            src="/logo.png"
            alt="Fashion Asia Limited Logo"
            width={40}
            height={40}
            className={className}
            priority
        />
    );
}
