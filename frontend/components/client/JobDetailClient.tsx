'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getLocalJobById, findRelatedLocalJobs, Job, saveJob } from '@/api/jobApi';
import { Card, Tag, message, Popover, Modal, Select, Radio, Upload, Input, UploadFile } from 'antd';
import { ArrowLeftOutlined, EnvironmentOutlined, DollarCircleOutlined, CalendarOutlined, ThunderboltOutlined, CheckCircleOutlined, ProfileOutlined, UserOutlined, MailOutlined, PhoneOutlined, FileAddOutlined, FolderOpenOutlined } from '@ant-design/icons';
import '../../styles/job-detail-apply.css';
import { getAllCVs, CV } from '@/api/cvapi';
import { getCLs, CL } from '@/api/clApi';
import { UploadPDFInput } from '@/components/sections/pageUploadCV-section';
import { UiverseFileUpload } from '@/components/ui/UiverseFileUpload';
import { CustomRadioGroup } from '@/components/ui/CustomRadioGroup';

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
                                            Apply
                                        </button>
                                    )}
                                    {split && (
                                        <>
                                            <button
                                                className="apply-split-btn bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 font-semibold px-6 py-2 rounded-l-2xl text-center cursor-pointer w-full h-[44px]"
                                                onClick={handleApplyFast}
                                            >
                                                Apply Fast
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
                                                Apply Detail
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button
                                    className={`bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 hover:brightness-110 hover:shadow-xl transition-all duration-200 font-semibold px-6 py-2 rounded-2xl rounded-tl-lg rounded-tr-lg text-center cursor-pointer w-full ${saving ? 'opacity-60 cursor-not-allowed' : ''} w-full h-[44px]`}
                                    onClick={handleSaveJob}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save job'}
                                </button>
                                <Modal
                                    open={showFastModal}
                                    onCancel={() => setShowFastModal(false)}
                                    footer={null}
                                    title={null}
                                    width={700}
                                    bodyStyle={{ padding: 0, borderRadius: 16, background: '#fff' }}
                                >
                                    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                                        <div className="p-6 pt-4">
                                            <div className="font-bold text-lg mb-4 flex items-center text-green-700">
                                                <FolderOpenOutlined className="mr-2 text-xl" />
                                                Chọn CV để ứng tuyển
                                            </div>
                                            <div className="mb-8 p-5 rounded-2xl border border-blue-200 bg-white shadow-md hover:border-blue-400 transition">
                                                <div className="font-bold text-blue-700 text-xl mb-3 flex items-center gap-2">
                                                    <FolderOpenOutlined className="text-2xl" />
                                                    Chọn CV để ứng tuyển
                                                </div>
                                                <CustomRadioGroup
                                                    value={applyMode}
                                                    onChange={val => setApplyMode(val as 'library' | 'upload')}
                                                    name="cv-mode"
                                                    options={[
                                                        { label: 'Chọn CV trong thư viện của tôi', value: 'library' },
                                                        { label: 'Tải lên CV từ máy tính', value: 'upload' },
                                                    ]}
                                                />
                                                {applyMode === 'library' && (
                                                    <div className="mt-3">
                                                        {cvList.length === 0 ? (
                                                            <span className="text-gray-500 text-sm">Bạn chưa có CV nào.</span>
                                                        ) : (
                                                            <>
                                                                <div className="font-bold text-blue-700 mb-2">Danh sách CV của bạn</div>
                                                                <div className={cvList.length > 5 ? 'max-h-80 overflow-y-auto pr-1 space-y-2' : 'space-y-2'}>
                                                                    {cvList.map((cv, idx) => (
                                                                        <div key={cv._id || String(idx)} className={`flex items-center justify-between p-3 rounded-lg border ${selectedCV === cv._id ? 'border-blue-700 bg-blue-100' : 'border-gray-200 bg-white'} transition-all`}>
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                                <span className="text-base font-bold text-gray-900">{cv.title || 'CV chưa đặt tên'}</span>
                                                                            </div>
                                                                            <div className="flex gap-2 items-center">
                                                                                <span className="text-xs text-gray-500">{cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : '-'}</span>
                                                                                <button
                                                                                    className={`px-3 py-1 rounded ${selectedCV === cv._id ? 'bg-blue-700 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-200'} font-medium text-sm transition`}
                                                                                    onClick={() => setSelectedCV((cv._id || '') as string)}
                                                                                    disabled={selectedCV === cv._id}
                                                                                >
                                                                                    {selectedCV === cv._id ? 'Đang chọn' : 'Chọn'}
                                                                                </button>
                                                                                <a
                                                                                    href="/myDocuments"
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm transition"
                                                                                >
                                                                                    Xem chi tiết
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {applyMode === 'upload' && (
                                                    <div className="mt-3">
                                                        <UiverseFileUpload
                                                            onFileChange={file => {
                                                                setCvUploadFile(file);
                                                                setSelectedCV('upload');
                                                            }}
                                                            accept=".pdf,.doc,.docx"
                                                            disabled={uploading}
                                                            fileName={cvUploadFile?.name}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mb-8 p-5 rounded-2xl border border-blue-200 bg-white shadow-md hover:border-blue-400 transition">
                                                <div className="font-bold text-blue-700 text-xl mb-3 flex items-center gap-2">
                                                    <FolderOpenOutlined className="text-2xl" />
                                                    Chọn thư ngỏ (Cover Letter)
                                                </div>
                                                <CustomRadioGroup
                                                    value={clMode}
                                                    onChange={val => setClMode(val as 'library' | 'upload')}
                                                    name="cl-mode"
                                                    options={[
                                                        { label: 'Chọn thư ngỏ trong thư viện', value: 'library' },
                                                        { label: 'Tải lên thư ngỏ từ máy tính', value: 'upload' },
                                                    ]}
                                                />
                                                {clMode === 'library' && (
                                                    <div className="mt-3">
                                                        {clList.length === 0 ? (
                                                            <span className="text-gray-500 text-sm">Bạn chưa có thư ngỏ nào.</span>
                                                        ) : (
                                                            <>
                                                                <div className="font-bold text-blue-700 mb-2">Danh sách thư ngỏ của bạn</div>
                                                                <div className={clList.length > 5 ? 'max-h-80 overflow-y-auto pr-1 space-y-2' : 'space-y-2'}>
                                                                    {clList.map((cl, idx) => (
                                                                        <div key={cl._id || String(idx)} className={`flex items-center justify-between p-3 rounded-lg border ${selectedCL === cl._id ? 'border-blue-700 bg-blue-100' : 'border-gray-200 bg-white'} transition-all`}>
                                                                            <div className="flex items-center gap-2">
                                                                                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" /></svg>
                                                                                <span className="text-base font-bold text-gray-900">{cl.title || 'Thư ngỏ chưa đặt tên'}</span>
                                                                            </div>
                                                                            <div className="flex gap-2 items-center">
                                                                                <span className="text-xs text-gray-500">{cl.updatedAt ? new Date(cl.updatedAt).toLocaleDateString() : '-'}</span>
                                                                                <button
                                                                                    className={`px-3 py-1 rounded ${selectedCL === cl._id ? 'bg-blue-700 text-white' : 'bg-gray-100 text-blue-700 hover:bg-blue-200'} font-medium text-sm transition`}
                                                                                    onClick={() => setSelectedCL((cl._id || '') as string)}
                                                                                    disabled={selectedCL === cl._id}
                                                                                >
                                                                                    {selectedCL === cl._id ? 'Đang chọn' : 'Chọn'}
                                                                                </button>
                                                                                <a
                                                                                    href="/myDocuments"
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium text-sm transition"
                                                                                >
                                                                                    Xem chi tiết
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {clMode === 'upload' && (
                                                    <div className="mt-3">
                                                        <UiverseFileUpload
                                                            onFileChange={file => setClUploadFile(file)}
                                                            accept=".pdf,.doc,.docx"
                                                            disabled={uploading}
                                                            fileName={clUploadFile?.name}
                                                        />
                                                        <Input
                                                            className="mt-2"
                                                            placeholder="Nhập tên thư ngỏ"
                                                            value={clUploadName}
                                                            onChange={e => setClUploadName(e.target.value)}
                                                        />
                                                        <span className="text-xs text-gray-500 mt-1 block">Hỗ trợ .doc, .docx, .pdf, dưới 5MB</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button
                                                    className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-black font-semibold hover:bg-gray-50"
                                                    onClick={() => setShowFastModal(false)}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    className="px-5 py-2 rounded-lg bg-green-400 text-white font-semibold hover:bg-green-500 shadow"
                                                    onClick={() => {
                                                        if (clMode === 'library') {
                                                            if (!selectedCL) {
                                                                setFormError('cl');
                                                                return;
                                                            }
                                                        } else {
                                                            if (!clUploadFile || !clUploadName) {
                                                                setFormError('cl');
                                                                return;
                                                            }
                                                        }
                                                        if (applyMode === 'upload') {
                                                            if (!fullName || !email || !phone) {
                                                                setFormError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
                                                                return;
                                                            }
                                                            setFormError('');
                                                            // handle submit upload
                                                        } else {
                                                            if (!selectedCV) {
                                                                setFormError('Vui lòng chọn một CV.');
                                                                return;
                                                            }
                                                            setFormError('');
                                                            // handle submit library
                                                        }
                                                    }}
                                                >
                                                    Nộp hồ sơ ứng tuyển
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Modal>
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
