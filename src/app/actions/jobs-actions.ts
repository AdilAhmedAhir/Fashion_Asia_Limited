// Static job listings — no backend. Edit JOBS in src/lib/site-content.ts.

import { JOBS, type Job } from "@/lib/site-content";

export type { Job };

export async function getJobs(activeOnly = false): Promise<Job[]> {
    return activeOnly ? JOBS.filter((j) => j.is_active) : JOBS;
}
