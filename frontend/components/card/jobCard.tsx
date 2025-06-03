"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Job } from '../../types/index';

interface JobCardProps {
    job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
    // Define accent color based on company
    const getAccentColor = (company: string) => {
        switch (company) {
            case 'Công ty Tech':
                return 'bg-green-500';
            case 'Công ty Marketing':
                return 'bg-blue-500';
            case 'Công ty Design':
                return 'bg-teal-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <Link href={`/jobs/${job.id}`} className="block">
            <div className="bg-white shadow-md rounded-lg overflow-hidden w-full h-[200px] flex flex-col justify-between">
                <div className="relative">
                    <Image
                        src={job.imageUrl}
                        alt={`${job.title} image`}
                        width={300}
                        height={100}
                        className="w-full h-[100px] object-cover"
                    />

                </div>
                <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-medium text-gray-800 line-clamp-1">{job.title}</h2>
                        <p className="text-xs text-gray-600 line-clamp-1">{job.company}</p>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        <span>{job.location}</span> | <span>{job.salary}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className={`text-white text-xs px-2 py-1 rounded ${getAccentColor(job.company)}`}>
                            Xem chi tiết
                        </span>
                        <span className="text-green-500">❤️</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default JobCard;