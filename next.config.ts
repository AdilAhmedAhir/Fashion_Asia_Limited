import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async redirects() {
        return [
            // Reports & Publications now lives on the Sustainability page.
            // Keep the old URL working for anything already linked or indexed.
            {
                source: "/reports",
                destination: "/sustainability#reports",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
