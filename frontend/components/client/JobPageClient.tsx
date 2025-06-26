'use client';

import { useState, useEffect } from 'react';
import JobSearch from '@/components/ui/jobSearch';
import PromoSlider from '@/components/ui/jobSlide';
import { getLocalJobs, Job } from '@/api/jobApi';

export default function JobPageClient() {
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const jobs = await getLocalJobs();
                setAllJobs(Array.isArray(jobs) ? jobs : []);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Failed to load jobs');
                setAllJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Create a unique list of job types for filtering
    const jobTypes: string[] = Array.from(
        new Set(
            (allJobs || [])
                .map(job => job.workType)
                .filter(Boolean)
        )
    );

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-white py-8 px-4 sm:px-6 lg:px-8 mt-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-white py-8 px-4 sm:px-6 lg:px-8 mt-10 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-white py-8 px-4 sm:px-6 lg:px-8 mt-10">
            <PromoSlider />
            <JobSearch jobs={allJobs} jobTypes={jobTypes} />
        </div>
    );
} 