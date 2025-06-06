"use client";

import React from 'react';
import { ApplyJob } from '@/app/userDashboard/page';
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
    },
    en: {
        appliedJobs: "Applied Jobs",
        applicationFor: "Application for Job",
        cvId: "CV Name",
        coverLetterId: "Cover Letter Name",
        submittedOn: "Submitted on",
    }
};

interface AppliedJobsProps {
    jobs: ApplyJob[];
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
                {jobs.map((job) => (
                    <Card
                        key={job.id}
                        className="bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-200"
                    >
                        <h3 className="text-md font-medium text-gray-900">{t.applicationFor}: {job.job_id}</h3>

                        <p className="text-xs text-gray-600 mt-1">{t.cvId}: {job.cv_id}</p>
                        {job.coverletter_id && (
                            <p className="text-xs text-gray-600 mt-1">{t.coverLetterId}: {job.coverletter_id}</p>
                        )}
                        <Tag color="green" className="mt-2">{job.status}</Tag>
                        <p className="text-xs text-gray-600 mt-1">{t.submittedOn}: {job.submit_at}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AppliedJobs;