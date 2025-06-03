"use client";
import React from 'react';
import JobCard from '../card/jobCard';
import { Job } from '../../types/index';

interface JobListProps {
    jobs: Job[];
}

const JobList: React.FC<JobListProps> = ({ jobs }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {jobs.map((job) => (
                <div key={job.id} className="w-full h-[200px]">
                    <JobCard job={job} />
                </div>
            ))}
        </div>
    );
};

export default JobList;