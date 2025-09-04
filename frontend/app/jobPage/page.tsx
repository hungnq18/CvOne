import PromoSlider from '@/components/ui/jobSlide';
import JobSearch from '@/components/ui/jobSearch';
import { getLocalJobs } from '@/api/jobApi';

// ISR: regenerate mỗi 60 giây
export const revalidate = 60;

export default async function JobPage() {
    const jobs = await getLocalJobs();

    const jobTypes = Array.from(
        new Set(jobs.map((job: any) => job.workType).filter(Boolean))
    );

    return (
        <div className="min-h-screen w-full bg-white py-8 px-4 sm:px-6 lg:px-8 mt-10">
            <PromoSlider />
            <JobSearch jobs={jobs} jobTypes={jobTypes} />
        </div>
    );
}
