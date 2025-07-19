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
        viewAll: "Xem tất cả",
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
        viewAll: "View all",
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
            <div className="flex items-center mb-4 relative">
                <FaBriefcase className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">{t.appliedJobs}</h2>
                <button
                    className="absolute right-0 top-0 flex items-center px-7 py-2 overflow-hidden font-medium transition-all bg-blue-500 rounded-md group mb-1 text-sm"
                    onClick={() => window.location.href = '/myJobs'}
                    title={language === 'vi' ? 'Xem tất cả việc đã ứng tuyển' : 'View all applied jobs'}
                    style={{ zIndex: 1 }}
                >
                    <span
                        className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-blue-600 rounded group-hover:-mr-4 group-hover:-mt-4"
                    >
                        <span
                            className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
                        ></span>
                    </span>
                    <span
                        className="absolute bottom-0 rotate-180 left-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-blue-600 rounded group-hover:-ml-4 group-hover:-mb-4"
                    >
                        <span
                            className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"
                        ></span>
                    </span>
                    <span
                        className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-blue-400 rounded-md group-hover:translate-x-0"
                    ></span>
                    <span
                        className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white font-semibold"
                    >
                        {t.viewAll}
                    </span>
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {(jobs
                    .slice() // copy array
                    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
                    .slice(0, 3)
                ).map((job) => {
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