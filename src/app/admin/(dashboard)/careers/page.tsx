import { getJobs } from "@/app/actions/jobs-actions";
import CareersClient from "./CareersClient";

export default async function AdminCareersPage() {
    const jobs = await getJobs();
    return <CareersClient initial={jobs} />;
}
