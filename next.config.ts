import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // From Next 16.3, `next dev` rewrites AGENTS.md and creates CLAUDE.md when it
    // detects an AI coding agent. AGENTS.md is this repo's A-Team governance file,
    // so no server start may edit it (docs/TECH_STACK.md, T-006 decision (c)).
    agentRules: false,
    // From Next 16.2, `next dev` logs every Server Function call with its arguments,
    // which here include the admin password (loginAction) and public-form PII.
    logging: { serverFunctions: false },
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
