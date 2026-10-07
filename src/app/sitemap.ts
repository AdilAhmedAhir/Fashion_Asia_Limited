import { MetadataRoute } from 'next';
import { getSettings } from '@/app/actions/settings-actions';
import { normalizeProducts } from '@/lib/site-content';
import { PRODUCTS_PATH, categoryPath } from '@/lib/nav';

// Async per Next's documented sitemap.ts data-fetching support. Category
// entries are generated from the live category list (normalizeProducts())
// rather than hardcoded, so adding/removing a category in /admin changes
// this file's output with no code change (T-005 acceptance) — and each
// entry's `slug` is that same safe, normalized value, never a raw stored
// string, matching the typed MetadataRoute.Sitemap shape Next.js itself
// serializes (docs/SECURITY.md SEC-MED-4, T-005 half) rather than any
// hand-built XML.
// No entry sets a modified date: a request-time one marked every URL as changed on every fetch (T-022).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fashionasialtd.com';

    const business = await getSettings('business');
    const categories = normalizeProducts(business.products);

    // Category pages live under /products since T-025. The old
    // /what-we-do/<slug> URLs only redirect, so they're no longer listed.
    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${baseUrl}${categoryPath(category.slug)}`,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [
        {
            url: baseUrl,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/who-we-are`,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/what-we-do`,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}${PRODUCTS_PATH}`,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...categoryEntries,
        {
            url: `${baseUrl}/global-partner`,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/sustainability`,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/life-at-fashion-asia`,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/career`,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/grievance`,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
}
