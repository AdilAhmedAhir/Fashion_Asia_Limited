import PageHeader from "@/components/ui/PageHeader";
import { getJobs } from "@/app/actions/jobs-actions";
import CareerPageClient from "./CareerPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Career | Fashion Asia Limited" };

export default async function CareerPage() {
    const jobs = await getJobs(true);
    return <CareerPageClient jobs={jobs} />;
}
