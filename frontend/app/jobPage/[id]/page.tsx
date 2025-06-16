'use client';

import Link from 'next/link';
import { getLocalJobById, findRelatedLocalJobs } from '@/api/jobApi';
import { Button, Card, Tag } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, DollarCircleOutlined, CalendarOutlined, ThunderboltOutlined, CheckCircleOutlined, ProfileOutlined } from '@ant-design/icons';

interface JobDetailPageProps {
    params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
    const job = getLocalJobById(params.id);

    if (!job) {
        return (
            <div className="container mx-auto p-8 text-center bg-gray-50 min-h-screen">
                <h1 className="text-2xl font-bold text-red-600">Job Not Found</h1>
                <p className="text-gray-600 mt-2">The job you are looking for does not exist.</p>
                <Link href="/jobPage" className="text-indigo-600 hover:underline mt-6 inline-block">
                    <ArrowLeftOutlined /> Back to Jobs
                </Link>
            </div>
        );
    }

    const relatedJobs = findRelatedLocalJobs(job, 3);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Link href="/jobPage" className="text-indigo-600 hover:text-indigo-800 mb-6 inline-flex items-center gap-2">
                    <ArrowLeftOutlined /> Back to All Jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-sm">
                        <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                        <p className="text-lg text-gray-600 mt-1">{job.role}</p>

                        <div className="mt-6 border-t pt-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><ProfileOutlined /> Job Description</h2>
                            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><ThunderboltOutlined /> Responsibilities</h2>
                            <p className="text-gray-700 whitespace-pre-line">{job.responsibilities}</p>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><CheckCircleOutlined /> Qualifications & Skills</h2>
                            <div className="space-y-4">
                                <p className="text-gray-700"><strong className="font-medium">Qualifications:</strong> {job.qualifications}</p>
                                <p className="text-gray-700"><strong className="font-medium">Experience:</strong> {job.experience}</p>
                                <div>
                                    <strong className="font-medium">Skills:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {job.skills.split(',').map((skill, index) => <Tag key={index}>{skill.trim()}</Tag>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card title="Job Overview">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <DollarCircleOutlined className="text-xl text-green-500 mt-1" />
                                        <div>
                                            <p className="font-semibold">Salary</p>
                                            <p className="text-gray-700">{job.salaryRange}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <EnvironmentOutlined className="text-xl text-blue-500 mt-1" />
                                        <div>
                                            <p className="font-semibold">Location</p>
                                            <p className="text-gray-700">{job.location}, {job.country}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CalendarOutlined className="text-xl text-purple-500 mt-1" />
                                        <div>
                                            <p className="font-semibold">Job Type</p>
                                            <p className="text-gray-700">{job.workType}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <Button type="primary" size="large" block>Apply Now</Button>
                            </Card>
                            <Card title="Benefits">
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {job.benefits.map((benefit, index) => <li key={index}>{benefit}</li>)}
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Related Jobs Section */}
                {relatedJobs.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Jobs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedJobs.map(relatedJob => (
                                <Link href={`/jobPage/${relatedJob._id}`} key={relatedJob._id}>
                                    <Card hoverable>
                                        <p className="font-semibold text-indigo-600">{relatedJob.title}</p>
                                        <p className="text-gray-600 text-sm mt-1">{relatedJob.role}</p>
                                        <p className="text-gray-500 text-xs mt-2">{relatedJob.location}</p>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 