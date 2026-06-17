// Static content readers — no backend. All content is defined in
// src/lib/site-content.ts. These keep the original signatures so the pages
// that call them need no changes.

import { SITE_SETTINGS, REPORTS, LEADERS, type Report, type Leader } from "@/lib/site-content";

export async function getSettings(key: string): Promise<Record<string, any>> {
    return SITE_SETTINGS[key] ?? {};
}

export async function getReports(publishedOnly = false): Promise<Report[]> {
    const reports = publishedOnly ? REPORTS.filter((r) => r.published) : REPORTS;
    return [...reports].sort((a, b) => b.year - a.year);
}

export async function getLeaders(): Promise<Leader[]> {
    return [...LEADERS].sort((a, b) => a.sort_order - b.sort_order);
}
