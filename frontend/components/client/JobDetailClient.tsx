'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import {
    getLocalJobById,
    findRelatedLocalJobs,
    saveJob,
    Job,
} from '@/api/jobApi';
import { getAllCVs, CV } from '@/api/cvapi';
import { getCLs, CL } from '@/api/clApi';
import { createApplyJob } from '@/api/apiApplyJob';
import { uploadFileToCloudinary } from '@/utils/uploadCloudinary/upload';
import { useLanguage } from '@/providers/global-provider';
import { useCV } from '@/providers/cv-provider';

import { Card, Tag, message } from 'antd';
import {
    ArrowLeftOutlined,
    EnvironmentOutlined,
    DollarCircleOutlined,
    CalendarOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    ProfileOutlined,
} from '@ant-design/icons';

import '../../styles/job-detail-apply.css';

// Dynamic load modal to reduce initial bundle, modal is client-only UI
const FastApplyModal = dynamic(() => import('@/components/modals/FastApplyModal'), {
    ssr: false,
    loading: () => null,
});

interface JobDetailClientProps {
    id: string;
}

const translations = {
    vi: {
        backToJobs: 'Quay lại danh sách việc',
        backToAllJobs: 'Quay lại tất cả việc',
        jobNotFound: 'Không tìm thấy công việc',
        jobNotFoundDesc: 'Công việc bạn tìm kiếm không tồn tại.',
        loading: 'Đang tải chi tiết công việc...',
        apply: 'Ứng tuyển',
        applyFast: 'Ứng tuyển ngay',
        applyDetail: 'Tạo mới và Ứng tuyển',
        saveJob: 'Lưu việc',
        saveSuccess: 'Lưu công việc thành công!',
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
        selectCV: 'Chọn CV',
        chooseFromLibrary: 'Chọn từ thư viện',
        uploadFromComputer: 'Tải lên từ máy tính',
        selectCL: 'Chọn Cover Letter',
        chooseCLFromLibrary: 'Chọn Cover Letter từ thư viện',
        uploadCLFromComputer: 'Tải lên Cover Letter từ máy tính',
        youNeedToLogin: 'Bạn cần đăng nhập để ứng tuyển',
        submit: 'Nộp đơn',
        uploading: 'Đang tải lên...',
        cancel: 'Hủy',
        mustProvideCvIdOrCvUrl: 'Phải cung cấp ít nhất CV ID hoặc URL CV',
        mustProvideCoverletterIdOrCoverletterUrl: 'Phải cung cấp ít nhất Cover Letter ID hoặc URL Cover Letter',
        skipCoverLetter: 'Bỏ qua Cover Letter',
        fastApply: 'Ứng tuyển nhanh',
        submitSuccess: 'Nộp đơn thành công!',
        submitError: 'Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.',
        uploadError: 'Lỗi tải file lên Cloudinary. Vui lòng thử lại.',
    },
    en: {
        backToJobs: 'Back to Jobs',
        backToAllJobs: 'Back to All Jobs',
        jobNotFound: 'Job Not Found',
        jobNotFoundDesc: 'The job you are looking for does not exist.',
        loading: 'Loading job details...',
        apply: 'Apply',
        applyFast: 'Apply Now',
        applyDetail: 'Apply New',
        saveJob: 'Save job',
        saveSuccess: 'Saved job successfully!',
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
        selectCV: 'Select CV',
        chooseFromLibrary: 'Choose from library',
        uploadFromComputer: 'Upload from computer',
        selectCL: 'Select Cover Letter',
        chooseCLFromLibrary: 'Choose Cover Letter from library',
        uploadCLFromComputer: 'Upload Cover Letter from computer',
        youNeedToLogin: 'You need to login to apply',
        submit: 'Submit',
        uploading: 'Uploading...',
        cancel: 'Cancel',
        mustProvideCvIdOrCvUrl: 'Must provide at least CV ID or CV URL',
        mustProvideCoverletterIdOrCoverletterUrl: 'Must provide at least Cover Letter ID or Cover Letter URL',
        skipCoverLetter: 'Skip Cover Letter',
        fastApply: 'Fast Apply',
        submitSuccess: 'Application submitted successfully!',
        submitError: 'An error occurred while submitting the application. Please try again.',
        uploadError: 'Error uploading file to Cloudinary. Please try again.',
    },
};

export default function JobDetailClient({ id }: JobDetailClientProps) {
    const router = useRouter();
    const { setJobDescription } = useCV();
    // Always call hook (do not call conditionally)
    const { language } = useLanguage();
    const lang: 'vi' | 'en' = language === 'vi' ? 'vi' : 'en';
    const t = translations[lang];

    const [job, setJob] = useState<Job | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [isApplyHovered, setIsApplyHovered] = useState(false);
    const [showFastModal, setShowFastModal] = useState(false);
    const [split, setSplit] = useState(false);
    const splitTimeout = useRef<number | null>(null);

    // CV/CL state
    const [selectedCV, setSelectedCV] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [cvList, setCvList] = useState<CV[]>([]);
    const [clList, setClList] = useState<CL[]>([]);
    const [selectedCL, setSelectedCL] = useState<string | null>(null);
    const [cvUploadFile, setCvUploadFile] = useState<File | null>(null);
    const [cvListLoaded, setCvListLoaded] = useState(false);
    const [applyMode, setApplyMode] = useState<'library' | 'upload'>('library');
    const [formError, setFormError] = useState('');
    const [clMode, setClMode] = useState<'library' | 'upload'>('library');
    const [clUploadFile, setClUploadFile] = useState<File | null>(null);
    const [skipCoverLetter, setSkipCoverLetter] = useState(false);

    // Helper to extract token from cookie
    const getToken = () => {
        if (typeof document === 'undefined') return undefined;
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('token='))
            ?.split('=')[1];
    };

    // Fetch job + related jobs on mount / id change
    useEffect(() => {
        let mounted = true;
        const fetchJobData = async () => {
            try {
                setLoading(true);
                const jobData = await getLocalJobById(id);
                if (!jobData) {
                    if (mounted) setError('Job not found');
                    return;
                }
                if (mounted) {
                    setJob(jobData);
                    // set job description to CV provider (if used later)
                    try {
                        setJobDescription(jobData.description || '');
                    } catch (e) {
                        // ignore if provider not present
                    }
                }
                const related = await findRelatedLocalJobs(jobData, 3);
                if (mounted) setRelatedJobs(Array.isArray(related) ? related : []);
            } catch (err) {
                console.error(err);
                if (mounted) setError('Failed to load job details');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchJobData();

        return () => {
            mounted = false;
        };
    }, [id, setJobDescription]);

    // Load CVs & CLs when fast modal opens (lazy)
    useEffect(() => {
        if (!showFastModal) return;
        let mounted = true;
        (async () => {
            setApplyMode('library');
            setClMode('library');
            setSkipCoverLetter(false);
            try {
                const cvs = await getAllCVs();
                const cls = await getCLs();
                if (!mounted) return;
                setCvList(Array.isArray(cvs) ? cvs : []);
                setSelectedCV('');
                setClList(Array.isArray(cls) ? cls : []);
                setSelectedCL('');
            } catch (err) {
                console.error('Failed to load CVs/CLs', err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [showFastModal]);

    // Cleanup split timeout on unmount
    useEffect(() => {
        return () => {
            if (splitTimeout.current) {
                window.clearTimeout(splitTimeout.current);
            }
        };
    }, []);

    const handleLoadCVList = async () => {
        if (!cvListLoaded) {
            try {
                const cvs = await getAllCVs();
                setCvList(Array.isArray(cvs) ? cvs : []);
            } catch (err) {
                console.error(err);
            } finally {
                setCvListLoaded(true);
            }
        }
    };

    const handleSaveJob = async () => {
        const token = getToken();
        if (!token) {
            message.error(t.youNeedToLogin);
            router.push('/login');
            return;
        }
        if (!job) return;
        setSaving(true);
        try {
            await saveJob(job._id);
            message.success(t.saveSuccess);
        } catch (err) {
            console.error(err);
            message.error(t.submitError);
        } finally {
            setSaving(false);
        }
    };

    const handleApplyFast = () => {
        const token = getToken();
        if (!token) {
            message.error(t.youNeedToLogin);
            router.push(`/login?redirect=/jobPage/${id}`);
            return;
        }
        setShowFastModal(true);
    };

    const handleApply = () => {
        const token = getToken();
        if (!token) {
            message.error(t.youNeedToLogin);
            router.push(`/login?redirect=/jobPage/${id}`);
            return;
        }
        router.push(`/user/applyOption?jobId=${job?._id}`);
    };

    const handleApplyDetail = () => {
        const jdString =
            `description: ${job?.description || ''}\n` +
            `role: ${job?.role || ''}\n` +
            `workType: ${job?.workType || ''}\n` +
            `experience: ${job?.experience || ''}\n` +
            `qualifications: ${job?.qualifications || ''}\n` +
            `skills: ${job?.skills || ''}\n` +
            `responsibilities: ${job?.responsibilities || ''}`;
        try {
            setJobDescription(jdString);
        } catch (e) {
            // ignore if provider missing
        }
        if (typeof window !== 'undefined') {
            localStorage.setItem('jobDescription', jdString);
        }

        const token = getToken();
        if (!token) {
            message.error(t.youNeedToLogin);
            router.push(`/login?redirect=/jobPage/${id}`);
            return;
        }
        router.push(`/user/applyOption?jobId=${job?._id}`);
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
        <div className="min-h-screen">
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
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                <ProfileOutlined /> {t.jobDescription}
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.description}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 mb-6 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-600 mb-2 flex items-center gap-2">
                                <ThunderboltOutlined /> {t.responsibilities}
                            </h2>
                            <p className="text-gray-700 whitespace-pre-line text-sm">{job.responsibilities}</p>
                        </div>

                        <div className="border-l-4 border-blue-500 p-4 rounded-md bg-white">
                            <h2 className="text-xl font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                <CheckCircleOutlined /> {t.qualifications}
                            </h2>
                            <div className="space-y-4">
                                <p className="text-gray-700 text-sm">
                                    <strong className="font-medium">{t.qualificationsLabel}</strong> {job.qualifications}
                                </p>
                                <p className="text-gray-700 text-sm">
                                    <strong className="font-medium">{t.experience}</strong> {job.experience}
                                </p>
                                <div>
                                    <strong className="font-medium">{t.skills}</strong>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(job.skills || '')
                                            .split(',')
                                            .map(s => s.trim())
                                            .filter(Boolean)
                                            .map((skill, index) => (
                                                <Tag key={index} className="bg-blue-100 text-blue-700 border border-blue-200">
                                                    {skill}
                                                </Tag>
                                            ))}
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
                                            <p className="text-gray-700">{job.location}{job.country ? `, ${job.country}` : ''}</p>
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
                                        splitTimeout.current = window.setTimeout(() => setSplit(true), 80);
                                    }}
                                    onMouseLeave={() => {
                                        setIsApplyHovered(false);
                                        setSplit(false);
                                        if (splitTimeout.current) {
                                            window.clearTimeout(splitTimeout.current);
                                        }
                                    }}
                                >
                                    {!split && (
                                        <button
                                            className="apply-split-main bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 font-semibold px-6 py-2 rounded-2xl text-center cursor-pointer w-full h-[44px]"
                                            onClick={handleApply}
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
                                                onClick={handleApplyDetail}
                                            >
                                                {t.applyDetail}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    className={`bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 hover:brightness-110 hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2 rounded-2xl text-center cursor-pointer w-full ${saving ? 'opacity-60 cursor-not-allowed' : ''} h-[44px]`}
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
                                    jobId={job?._id}
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
                                    uploading={uploading}
                                    setUploading={setUploading}
                                    formError={formError}
                                    setFormError={setFormError}
                                    onSubmit={async () => {
                                        try {
                                            setUploading(true);
                                            setFormError('');
                                            // Validate CV
                                            if (applyMode === 'library' && (!selectedCV || selectedCV === '')) {
                                                const msg = t.selectCV + ' - ' + t.chooseFromLibrary;
                                                setFormError(msg);
                                                message.error(msg);
                                                return;
                                            }
                                            if (applyMode === 'upload' && !cvUploadFile) {
                                                const msg = t.selectCV + ' - ' + t.uploadFromComputer;
                                                setFormError(msg);
                                                message.error(msg);
                                                return;
                                            }
                                            // Validate Cover Letter (if not skipped)
                                            if (!skipCoverLetter) {
                                                if (clMode === 'library' && (!selectedCL || selectedCL === '')) {
                                                    const msg = t.selectCL + ' - ' + t.chooseCLFromLibrary;
                                                    setFormError(msg);
                                                    message.error(msg);
                                                    return;
                                                }
                                                if (clMode === 'upload' && !clUploadFile) {
                                                    const msg = t.selectCL + ' - ' + t.uploadCLFromComputer;
                                                    setFormError(msg);
                                                    message.error(msg);
                                                    return;
                                                }
                                            }

                                            let cvId: string | undefined = selectedCV || undefined;
                                            let clId: string | undefined = selectedCL || undefined;
                                            let cvUrl: string | undefined = undefined;
                                            let coverletterUrl: string | undefined = undefined;

                                            // Handle CV
                                            if (applyMode === 'upload' && cvUploadFile) {
                                                cvUrl = await uploadFileToCloudinary(cvUploadFile);
                                                cvId = undefined;
                                            } else if (applyMode === 'library' && selectedCV) {
                                                const cv = cvList.find(cv => cv._id === selectedCV);
                                                cvUrl = (cv && (cv as any).content && (cv as any).content.userData) ? (cv as any).content.userData.fileUrl : undefined;
                                                cvId = cv?._id || undefined;
                                            }

                                            // Handle Cover Letter (if not skipped)
                                            if (!skipCoverLetter) {
                                                if (clMode === 'upload' && clUploadFile) {
                                                    coverletterUrl = await uploadFileToCloudinary(clUploadFile);
                                                    clId = undefined;
                                                } else if (clMode === 'library' && selectedCL) {
                                                    const cl = clList.find(cl => cl._id === selectedCL);
                                                    coverletterUrl = (cl && (cl as any).content && (cl as any).content.userData) ? (cl as any).content.userData.fileUrl : undefined;
                                                    clId = cl?._id || undefined;
                                                }
                                            }

                                            // Submit application (KHÔNG truyền userId)
                                            await createApplyJob({
                                                jobId: job._id,
                                                cvId: cvId,
                                                cvUrl,
                                                coverletterId: clId,
                                                coverletterUrl,
                                            });

                                            setShowFastModal(false);
                                            message.success(t.submitSuccess);
                                        } catch (err) {
                                            const errorMsg = err instanceof Error ? err.message : t.submitError;
                                            setFormError(errorMsg);
                                            if (errorMsg.includes('Cloudinary')) {
                                                message.error(t.uploadError);
                                            } else if (errorMsg.includes('cvId hoặc cvUrl') || errorMsg.includes('cvId or cvUrl')) {
                                                message.error(t.mustProvideCvIdOrCvUrl);
                                            } else if (errorMsg.includes('coverletterId hoặc coverletterUrl') || errorMsg.includes('coverletterId or coverletterUrl')) {
                                                message.error(t.mustProvideCoverletterIdOrCoverletterUrl);
                                            } else {
                                                message.error(errorMsg);
                                            }
                                        } finally {
                                            setUploading(false);
                                        }
                                    }}
                                />
                            </div>

                            <Card title={<span className="text-blue-600 font-semibold">{t.benefits}</span>} className="border-blue-200">
                                <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {Array.isArray(job.benefits) && job.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Related Jobs Section */}
                {Array.isArray(relatedJobs) && relatedJobs.length > 0 && (
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
