"use client";

import React from 'react';
import { ApplyJob } from '@/api/jobApi';
import { Card, Tag } from 'antd';
import { FaBriefcase } from 'react-icons/fa';
import { useLanguage } from '@/providers/global-provider';

const translations = {
    vi: {
        appliedJobs: "Việc đã ứng tuyển",
        applicationFor: "Ứng tuyển cho công việc",
        cvId: "Tên CV",
        coverLetterId: "Tên Cover Letter",
        submittedOn: "Ngày nộp",
        location: "Địa điểm",
        salary: "Lương",
        workType: "Loại việc",
    },
    en: {
        appliedJobs: "Applied Jobs",
        applicationFor: "Application for Job",
        cvId: "CV Name",
        coverLetterId: "Cover Letter Name",
        submittedOn: "Submitted on",
        location: "Location",
        salary: "Salary",
        workType: "Work Type",
    }
};

// Allow jobId to be object or string
export interface ApplyJobWithJob {
    id: string;
    jobId: any; // object or string
    userId: string;
    cvId: string;
    coverletterId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AppliedJobsProps {
    jobs: ApplyJobWithJob[];
}

const AppliedJobs: React.FC<AppliedJobsProps> = ({ jobs }) => {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <div className="bg-gradient-to-r from-blue-100 to-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 relative">
            <div className="flex items-center mb-4">
                <FaBriefcase className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">{t.appliedJobs}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => {
                    // jobId có thể là object hoặc string
                    const jobObj = typeof job.jobId === 'object' && job.jobId !== null ? job.jobId : null;
                    return (
                        <div
                            key={job.id}
                            className="bg-white border border-blue-100 rounded-2xl shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-200 p-6 flex flex-col gap-2 group"
                        >
                            <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 transition-colors">
                                {t.applicationFor}: {jobObj ? jobObj.title : job.jobId}
                            </h3>
                            {jobObj && (
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-1">
                                    <span>{t.location}: <span className="font-medium text-blue-500">{jobObj.location}</span></span>
                                    <span>{t.salary}: <span className="font-medium text-green-600">{jobObj.salaryRange}</span></span>
                                    <span>{t.workType}: <span className="font-medium text-indigo-500">{jobObj.workType}</span></span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mt-1">
                                <span>{t.cvId}: <span className="font-medium text-gray-700">{typeof job.cvId === 'object' && job.cvId !== null ? ((job.cvId as any).title || (job.cvId as any)._id) : job.cvId}</span></span>
                                {job.coverletterId ? (
                                    <span>{t.coverLetterId}: <span className="font-medium text-gray-700">{typeof job.coverletterId === 'object' && job.coverletterId !== null ? ((job.coverletterId as any).title || (job.coverletterId as any)._id) : job.coverletterId}</span></span>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs text-gray-500 font-medium">Status:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 group-hover:bg-green-100 transition-all`}>{job.status}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 font-medium">{t.submittedOn}:</span>
                                <span className="text-xs text-blue-500 font-semibold">{job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppliedJobs;