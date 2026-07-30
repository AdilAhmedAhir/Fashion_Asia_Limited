import PageHeader from "@/components/ui/PageHeader";
import { getJobs } from "@/app/actions/jobs-actions";
import CareerPageClient from "./CareerPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Career",
    description:
        "Careers at Fashion Asia Limited — current openings and how to apply to join a 2,000-strong team in Sreepur, Gazipur.",
};

export default async function CareerPage() {
    const jobs = await getJobs(true);
    return <CareerPageClient jobs={jobs} />;
}
