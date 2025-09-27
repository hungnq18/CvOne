import JobDetailClient from '@/components/client/JobDetailClient';
import { getLocalJobs } from '@/api/jobApi';

// ISR: regenerate mỗi 60 giây
export const revalidate = 60;

export async function generateStaticParams() {
    const jobs = await getLocalJobs();
    return (jobs || []).map((job: any) => ({
        id: job._id?.toString?.() ?? String(job._id),
    }));
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    return <JobDetailClient id={params.id} />;
}
