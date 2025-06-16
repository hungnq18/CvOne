import JobSearch from '@/components/ui/jobSearch';
import PromoSlider from '@/components/ui/jobSlide';
import { getLocalJobs } from '@/api/jobApi';

export default function JobPage() {
    // Fetch all jobs using the centralized API function
    const allJobs = getLocalJobs();

    // Create a unique list of job types for filtering
    const jobTypes: string[] = Array.from(new Set(allJobs.map(job => job.workType).filter(Boolean)));

    return (
        <div className="min-h-screen w-full bg-white py-8 px-4 sm:px-6 lg:px-8 mt-10">
            <PromoSlider />
            <JobSearch jobs={allJobs} jobTypes={jobTypes} />
        </div>
    );
}