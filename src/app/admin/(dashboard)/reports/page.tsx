import { getReports } from "@/app/actions/settings-actions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
    const reports = await getReports();
    return <ReportsClient initial={reports} />;
}
