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
            // Routes renamed to match their menu names. These paths were live and
            // indexed, so they redirect permanently rather than 404.
            { source: "/business", destination: "/what-we-do", permanent: true },
            { source: "/who-we-work-with", destination: "/global-partner", permanent: true },
            { source: "/media", destination: "/life-at-fashion-asia", permanent: true },
        ];
    },
};

export default nextConfig;
