'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLocalJobById, findRelatedLocalJobs, Job, saveJob } from '@/api/jobApi';
import { Card, Tag, message, Popover, Modal, Select, Radio, Upload, Input, UploadFile } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, DollarCircleOutlined, CalendarOutlined, ThunderboltOutlined, CheckCircleOutlined, ProfileOutlined, UserOutlined, MailOutlined, PhoneOutlined, FileAddOutlined, FolderOpenOutlined } from '@ant-design/icons';
import '../../styles/job-detail-apply.css';
import { getAllCVs, CV } from '@/api/cvapi';
import { getCLs, CL } from '@/api/clApi';
import FastApplyModal from '@/components/modals/FastApplyModal';
import { useLanguage } from '@/providers/global-provider';

interface JobDetailClientProps {
    id: string;
}

export default function JobDetailClient({ id }: JobDetailClientProps) {
    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isApplyHovered, setIsApplyHovered] = useState(false);
    const [showFastModal, setShowFastModal] = useState(false);
    const [split, setSplit] = useState(false);
    const splitTimeout = useRef<NodeJS.Timeout | null>(null);
    const [selectedCV, setSelectedCV] = useState<string | null>(null);
    const [intro, setIntro] = useState('');
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
    const [cvList, setCvList] = useState<CV[]>([]);
    const [clList, setClList] = useState<CL[]>([]);
    const [selectedCL, setSelectedCL] = useState<string | null>(null);
    const [cvUploadFile, setCvUploadFile] = useState<File | null>(null);
    const [cvListLoaded, setCvListLoaded] = useState(false);
    const [applyMode, setApplyMode] = useState<'library' | 'upload'>('library');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [formError, setFormError] = useState('');
    const [clMode, setClMode] = useState<'library' | 'upload'>('library');
    const [clUploadFile, setClUploadFile] = useState<File | null>(null);
    const [clUploadName, setClUploadName] = useState('');
    const [showCVSelect, setShowCVSelect] = useState(false);
    const [showCLSelect, setShowCLSelect] = useState(false);
    // Dummy CVs for demo, replace with real data
    const userCVs = [
        { id: 'cv1', name: '[FU] CV Intern Java - Vuong Dai Duong' },
        { id: 'cv2', name: 'testsssss' },
    ];

    const translations = {
        vi: {
            backToJobs: 'Quay lại danh sách việc',
            backToAllJobs: 'Quay lại tất cả việc',
            jobNotFound: 'Không tìm thấy công việc',
            jobNotFoundDesc: 'Công việc bạn tìm kiếm không tồn tại.',
            loading: 'Đang tải chi tiết công việc...',
            apply: 'Ứng tuyển',
            applyFast: 'Nộp nhanh',
            applyDetail: 'Nộp chi tiết',
            saveJob: 'Lưu việc',
            saving: 'Đang lưu...',
            jobOverview: 'Tổng quan công việc',
            salary: 'Lương',
            location: 'Địa điểm',
            jobType: 'Loại việc',
            jobDescription: 'Mô tả công việc',
            responsibilities: 'Trách nhiệm',
            qualifications: 'Yêu cầu & Kỹ năng',
            qualificationsLabel: 'Yêu cầu:',
            experience: 'Kinh nghiệm:',
            skills: 'Kỹ năng:',
            benefits: 'Phúc lợi',
            relatedJobs: 'Việc liên quan',
            status: 'Trạng thái:',
            submittedOn: 'Ngày nộp:',
        },
        en: {
            backToJobs: 'Back to Jobs',
            backToAllJobs: 'Back to All Jobs',
            jobNotFound: 'Job Not Found',
            jobNotFoundDesc: 'The job you are looking for does not exist.',
            loading: 'Loading job details...',
            apply: 'Apply',
            applyFast: 'Apply Fast',
            applyDetail: 'Apply Detail',
            saveJob: 'Save job',
            saving: 'Saving...',
            jobOverview: 'Job Overview',
            salary: 'Salary',
            location: 'Location',
            jobType: 'Job Type',
            jobDescription: 'Job Description',
            responsibilities: 'Responsibilities',
            qualifications: 'Qualifications & Skills',
            qualificationsLabel: 'Qualifications:',
            experience: 'Experience:',
            skills: 'Skills:',
            benefits: 'Benefits',
            relatedJobs: 'Related Jobs',
            status: 'Status:',
            submittedOn: 'Submitted on:',
        }
    };
    const { language } = useLanguage ? useLanguage() : { language: 'en' };
    const lang: 'vi' | 'en' = language === 'vi' ? 'vi' : 'en';
    const t = translations[lang];

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
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [id]);

    useEffect(() => {
        if (showFastModal) {
            setApplyMode('library');
            setClMode('library');
            getAllCVs().then(res => {
                const cvs = Array.isArray(res) ? res : [];
                setCvList(cvs);
                if (cvs.length > 0) {
                    const latestCV = [...cvs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
                    setSelectedCV(latestCV._id || null);
                }
            });
            getCLs().then(res => {
                const cls = Array.isArray(res) ? res : [];
                setClList(cls);
                if (cls.length > 0) {
                    const latestCL = [...cls].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
                    setSelectedCL(latestCL._id || null);
                }
            });
        }
    }, [showFastModal]);

    const handleLoadCVList = () => {
        if (!cvListLoaded) {
            getAllCVs().then(res => setCvList(Array.isArray(res) ? res : []));
            setCvListLoaded(true);
        }
    };

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

    const handleApplyFast = () => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
        if (!token) {
            window.location.href = `/login?redirect=/jobPage/${id}`;
            return;
        }
        setShowFastModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#e0f2fe]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e0f2fe] mx-auto"></div>
                    <p className="mt-4 text-blue-500">{t.loading}</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="container mx-auto p-8 text-center bg-[#e0f2fe] min-h-screen">
                <h1 className="text-2xl font-bold text-blue-500">{t.jobNotFound}</h1>
                <p className="text-blue-400 mt-2">{t.jobNotFoundDesc}</p>
                <Link href="/jobPage" className="text-blue-500 hover:underline mt-6 inline-block">
                    <ArrowLeftOutlined /> {t.backToJobs}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Link href="/jobPage" className="text-blue-500 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
                    <ArrowLeftOutlined /> {t.backToAllJobs}
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
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><ProfileOutlined /> {t.jobDescription}</h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.description}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 mb-6 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-600 mb-2 flex items-center gap-2"><ThunderboltOutlined /> {t.responsibilities}</h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.responsibilities}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2"><CheckCircleOutlined /> {t.qualifications}</h2>
                            <div className="space-y-4">
                                <p className="text-gray-700 text-sm"><strong className="font-medium">{t.qualificationsLabel}</strong> {job.qualifications}</p>
                                <p className="text-gray-700 text-sm"><strong className="font-medium">{t.experience}</strong> {job.experience}</p>
                                <div>
                                    <strong className="font-medium">{t.skills}</strong>
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
                            <Card title={<span className="text-blue-700 font-semibold">{t.jobOverview}</span>} className="border-blue-200">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <DollarCircleOutlined className="text-xl text-green-500 mt-1" />
                                        <div>
                                            <p className="font-semibold">{t.salary}</p>
                                            <p className="text-gray-700">{job.salaryRange}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <EnvironmentOutlined className="text-xl text-blue-500 mt-1" />
                                        <div>
                                            <p className="font-semibold">{t.location}</p>
                                            <p className="text-gray-700">{job.location}, {job.country}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CalendarOutlined className="text-xl text-blue-300 mt-1" />
                                        <div>
                                            <p className="font-semibold">{t.jobType}</p>
                                            <p className="text-gray-700">{job.workType}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <div className="flex flex-col w-full p-2 rounded-3xl gap-2">
                                <div
                                    className={`apply-split-group group ${split ? 'apply-split-split' : ''}`}
                                    onMouseEnter={() => {
                                        setIsApplyHovered(true);
                                        splitTimeout.current = setTimeout(() => setSplit(true), 80);
                                    }}
                                    onMouseLeave={() => {
                                        setIsApplyHovered(false);
                                        setSplit(false);
                                        if (splitTimeout.current) clearTimeout(splitTimeout.current);
                                    }}
                                >
                                    {!split && (
                                        <button
                                            className="apply-split-main bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 font-semibold px-6 py-2 rounded-2xl text-center cursor-pointer w-full h-[44px]"
                                            onClick={() => {
                                                const token = document.cookie
                                                    .split('; ')
                                                    .find((row) => row.startsWith('token='))
                                                    ?.split('=')[1];
                                                if (!token) {
                                                    window.location.href = `/login?redirect=/jobPage/${id}`;
                                                    return;
                                                }
                                                window.location.href = `/user/applyOption?jobId=${job._id}`;
                                            }}
                                        >
                                            {t.apply}
                                        </button>
                                    )}
                                    {split && (
                                        <>
                                            <button
                                                className="apply-split-btn bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 font-semibold px-6 py-2 rounded-l-2xl text-center cursor-pointer w-full h-[44px]"
                                                onClick={handleApplyFast}
                                            >
                                                {t.applyFast}
                                            </button>
                                            <button
                                                className="apply-split-btn bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 font-semibold px-6 py-2 rounded-r-2xl text-center cursor-pointer w-full h-[44px]"
                                                onClick={() => {
                                                    const token = document.cookie
                                                        .split('; ')
                                                        .find((row) => row.startsWith('token='))
                                                        ?.split('=')[1];
                                                    if (!token) {
                                                        window.location.href = `/login?redirect=/jobPage/${id}`;
                                                        return;
                                                    }
                                                    window.location.href = `/user/applyOption?jobId=${job._id}`;
                                                }}
                                            >
                                                {t.applyDetail}
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button
                                    className={`bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 hover:brightness-110 hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2 rounded-2xl rounded-tl-lg rounded-tr-lg text-center cursor-pointer w-full ${saving ? 'opacity-60 cursor-not-allowed' : ''} w-full h-[44px]`}
                                    onClick={handleSaveJob}
                                    disabled={saving}
                                >
                                    {saving ? t.saving : t.saveJob}
                                </button>
                                <FastApplyModal
                                    open={showFastModal}
                                    onClose={() => setShowFastModal(false)}
                                    cvList={cvList}
                                    clList={clList}
                                    selectedCV={selectedCV}
                                    setSelectedCV={setSelectedCV}
                                    selectedCL={selectedCL}
                                    setSelectedCL={setSelectedCL}
                                    applyMode={applyMode}
                                    setApplyMode={setApplyMode}
                                    clMode={clMode}
                                    setClMode={setClMode}
                                    cvUploadFile={cvUploadFile}
                                    setCvUploadFile={setCvUploadFile}
                                    clUploadFile={clUploadFile}
                                    setClUploadFile={setClUploadFile}
                                    clUploadName={clUploadName}
                                    setClUploadName={setClUploadName}
                                    uploading={uploading}
                                    formError={formError}
                                    setFormError={setFormError}
                                    onSubmit={async () => {
                                        if (applyMode === 'library') {
                                            if (!selectedCV) {
                                                setFormError('Vui lòng chọn một CV.');
                                                return;
                                            }
                                            // Có thể cho phép không có cover letter
                                            setFormError('');
                                            try {
                                                // Gọi API tạo apply job
                                                const { createApplyJob } = await import('@/api/apiApplyJob');
                                                await createApplyJob({
                                                    jobId: job?._id,
                                                    cvId: selectedCV,
                                                    coverletterId: selectedCL || undefined,
                                                });
                                                setShowFastModal(false);
                                                message.success('Nộp đơn thành công!');
                                            } catch (err: any) {
                                                setFormError('Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.');
                                            }
                                        } else {
                                            // Xử lý upload nếu cần
                                            setFormError('Chức năng tải lên chưa được hỗ trợ.');
                                        }
                                    }}
                                />
                            </div>
                            <Card title={<span className="text-blue-600 font-semibold">{t.benefits}</span>} className="border-blue-200">
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
                        <h2 className="text-2xl font-bold text-blue-700 mb-6">{t.relatedJobs}</h2>
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
