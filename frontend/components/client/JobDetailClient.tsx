'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalJobById, findRelatedLocalJobs, Job, saveJob } from '@/api/jobApi';
import { Card, Tag, message } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, DollarCircleOutlined, CalendarOutlined, ThunderboltOutlined, CheckCircleOutlined, ProfileOutlined } from '@ant-design/icons';

interface JobDetailClientProps {
    id: string;
}

export default function JobDetailClient({ id }: JobDetailClientProps) {
    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                setLoading(true);
                const jobData = await getLocalJobById(id);

                if (!jobData) {
                    setError('Job not found');
                    return;
                }

                setJob(jobData);

                // Fetch related jobs
                const related = await findRelatedLocalJobs(jobData, 3);
                setRelatedJobs(related);
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [id]);

    const handleSaveJob = async () => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
        if (!token) {
            alert('Bạn cần đăng nhập trước khi lưu công việc!');
            window.location.href = '/login';
            return;
        }
        if (!job) return;
        setSaving(true);
        try {
            await saveJob(job._id);
            message.success('Job saved successfully!');
        } catch (err) {
            message.error('Failed to save job. Please login or try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#e0f2fe]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0f2fe] mx-auto"></div>
                    <p className="mt-4 text-blue-500">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="container mx-auto p-8 text-center bg-[#e0f2fe] min-h-screen">
                <h1 className="text-2xl font-bold text-blue-500">Job Not Found</h1>
                <p className="text-blue-400 mt-2">The job you are looking for does not exist.</p>
                <Link href="/jobPage" className="text-blue-500 hover:underline mt-6 inline-block">
                    <ArrowLeftOutlined /> Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Link href="/jobPage" className="text-blue-500 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
                    <ArrowLeftOutlined /> Back to All Jobs
                </Link>

                <div className="bg-blue-500 rounded-t-xl p-6 sm:p-8 mb-4 shadow-md">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">{job.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-base text-white/90 font-medium flex items-center gap-1">
                            <ProfileOutlined className="text-white/80" /> {job.role}
                        </span>
                        <span className="inline-block bg-white text-blue-700 text-xs font-semibold px-3 py-1 rounded-full ml-2 shadow-sm border border-blue-200">
                            {job.workType}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main column */}
                    <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                        <div className="mt-0 border-l-4 border-blue-500 p-4 mb-6 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><ProfileOutlined /> Job Description</h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.description}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 mb-6 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-600 mb-2 flex items-center gap-2"><ThunderboltOutlined /> Responsibilities</h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.responsibilities}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><CheckCircleOutlined /> Qualifications & Skills</h2>
                            <div className="space-y-4">
                                <p className="text-gray-700 text-sm"><strong className="font-medium">Qualifications:</strong> {job.qualifications}</p>
                                <p className="text-gray-700 text-sm"><strong className="font-medium">Experience:</strong> {job.experience}</p>
                                <div>
                                    <strong className="font-medium">Skills:</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {job.skills.split(',').map((skill, index) => <Tag key={index} className="bg-blue-100 text-blue-700 border border-blue-200">{skill.trim()}</Tag>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card title={<span className="text-blue-700 font-semibold">Job Overview</span>} className="border-blue-200">
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
                                        <CalendarOutlined className="text-xl text-blue-300 mt-1" />
                                        <div>
                                            <p className="font-semibold">Job Type</p>
                                            <p className="text-gray-700">{job.workType}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <div className="flex flex-col w-full p-2 rounded-3xl gap-2">
                                <a
                                    className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 hover:brightness-110 hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2 rounded-2xl rounded-bl-lg rounded-br-lg text-center cursor-pointer w-full"
                                    href="#"
                                    onClick={e => {
                                        e.preventDefault();
                                        const token = document.cookie
                                            .split('; ')
                                            .find((row) => row.startsWith('token='))
                                            ?.split('=')[1];
                                        if (!token) {
                                            alert('Bạn cần đăng nhập trước khi ứng tuyển!');
                                            window.location.href = '/login';
                                            return;
                                        }

                                    }}
                                >
                                    Apply Now
                                </a>
                                <button
                                    className={`bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 hover:brightness-110 hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2 rounded-2xl rounded-tl-lg rounded-tr-lg text-center cursor-pointer w-full ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    onClick={handleSaveJob}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save job'}
                                </button>
                            </div>
                            <Card title={<span className="text-blue-600 font-semibold">Benefits</span>} className="border-blue-200">
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
                        <h2 className="text-2xl font-bold text-blue-700 mb-6">Related Jobs</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedJobs.map(relatedJob => (
                                <Link href={`/jobPage/${relatedJob._id}`} key={relatedJob._id}>
                                    <Card hoverable className="transition-all duration-200 border-blue-200 hover:shadow-xl hover:border-blue-400">
                                        <p className="font-semibold text-blue-700">{relatedJob.title}</p>
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
