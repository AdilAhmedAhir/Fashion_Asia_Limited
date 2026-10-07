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
            // Category pages moved from /what-we-do/<slug> to /products/<slug>
            // (T-025). The old URLs were live and indexed, so they redirect
            // permanently; /what-we-do itself isn't matched. Redirects run
            // before pages, so this rule overrides any page added at
            // /what-we-do/<x> later: narrow it first. Browsers cache a 308,
            // so /products/[category] must keep serving even after a revert.
            { source: "/what-we-do/:slug", destination: "/products/:slug", permanent: true },
        ];
    },
    // Drops the `X-Powered-By: Next.js` response header (T-008).
    poweredByHeader: false,
    // Sitewide security headers on every response (T-008, docs/SECURITY.md
    // SEC-MED-2). Every value is a static literal. The CSP is structural only:
    // it has no fetch directive, so it can't block any script, style, image,
    // font, video or request. Permissions-Policy must never list autoplay,
    // fullscreen or picture-in-picture: the hero video autoplays. HSTS goes
    // out from production builds only (`next build`), never from `next dev`.
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
                    { key: "X-Frame-Options", value: "DENY" },
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
                    },
                    // includeSubDomains is safe only while both bare domains are Vercel redirects; remove it before the site is ever served from one.
                    ...(process.env.NODE_ENV === "production"
                        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
                        : []),
                ],
            },
        ];
    },
};

export default nextConfig;
