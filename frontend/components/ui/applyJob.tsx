import React from 'react';
import { ApplyJob } from '@/app/userDashboard/page';
import { Card, Tag } from 'antd';
import { FaBriefcase } from 'react-icons/fa';


interface AppliedJobsProps {
    jobs: ApplyJob[];
}

const AppliedJobs: React.FC<AppliedJobsProps> = ({ jobs }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
                <FaBriefcase className="text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-blue-600">Việc đã ứng tuyển</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                    <Card
                        key={job.id}
                        className="bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors duration-200"
                    >
                        <h3 className="text-md font-medium text-gray-900">Application for Job ID: {job.job_id}</h3>
                        <p className="text-sm text-gray-700">User ID: {job.user_id}</p>
                        <p className="text-xs text-gray-600 mt-1">CV ID: {job.cv_id}</p>
                        {job.coverletter_id && (
                            <p className="text-xs text-gray-600 mt-1">Cover Letter ID: {job.coverletter_id}</p>
                        )}
                        <Tag color="green" className="mt-2">{job.status}</Tag>
                        <p className="text-xs text-gray-600 mt-1">Submitted on: {job.submit_at}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AppliedJobs;