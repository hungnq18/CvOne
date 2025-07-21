import { Modal, message } from 'antd';
import React from 'react';
import { UiverseFileUpload } from '@/components/ui/UiverseFileUpload';
import { CustomRadioGroup } from '@/components/ui/CustomRadioGroup';
import { FolderOpenOutlined } from '@ant-design/icons';
import { useLanguage } from '@/providers/global-provider';

interface FastApplyModalProps {
    open: boolean;
    onClose: () => void;
    cvList: any[];
    clList: any[];
    selectedCV: string | null;
    setSelectedCV: (id: string | null) => void;
    selectedCL: string | null;
    setSelectedCL: (id: string | null) => void;
    applyMode: 'library' | 'upload';
    setApplyMode: (mode: 'library' | 'upload') => void;
    clMode: 'library' | 'upload';
    setClMode: (mode: 'library' | 'upload') => void;
    cvUploadFile: File | null;
    setCvUploadFile: (file: File | null) => void;
    clUploadFile: File | null;
    setClUploadFile: (file: File | null) => void;
    uploading: boolean;
    setUploading: (value: boolean) => void;
    formError: string;
    setFormError: (err: string) => void;
    jobId: string;
    onSubmit: () => void;
}

const MAX_DISPLAY = 3;

const FastApplyModal: React.FC<FastApplyModalProps> = ({
    open,
    onClose,
    cvList,
    clList,
    selectedCV,
    setSelectedCV,
    selectedCL,
    setSelectedCL,
    applyMode,
    setApplyMode,
    clMode,
    setClMode,
    cvUploadFile,
    setCvUploadFile,
    clUploadFile,
    setClUploadFile,
    uploading,
    setUploading,
    formError,
    setFormError,
    jobId,
    onSubmit,
}) => {
    const { language } = useLanguage ? useLanguage() : { language: 'en' };
    const translations = {
        vi: {
            submit: 'Nộp đơn',
            cancel: 'Hủy',
            applyTitle: 'Nộp CV ứng tuyển',
            applyDesc: 'Hãy chắc chắn rằng CV và thư ngỏ của bạn đã được cập nhật đầy đủ thông tin.',
            selectCV: 'Chọn CV để ứng tuyển',
            selectCL: 'Chọn thư ngỏ (Cover Letter)',
            chooseFromLibrary: 'Chọn CV trong thư viện của tôi',
            uploadFromComputer: 'Tải lên CV từ máy tính',
            chooseCLFromLibrary: 'Chọn thư ngỏ trong thư viện',
            uploadCLFromComputer: 'Tải lên thư ngỏ từ máy tính',
            noCV: 'Bạn chưa có CV nào.',
            noCL: 'Bạn chưa có thư ngỏ nào.',
            yourCVs: 'Danh sách CV của bạn',
            yourCLs: 'Danh sách thư ngỏ của bạn',
            viewDetail: 'Xem chi tiết',
            select: 'Chọn',
            selected: 'Đang chọn',
            chooseCVFromComputer: 'Chọn CV từ máy tính',
            chooseCLFromComputer: 'Chọn thư ngỏ từ máy tính',
            skipCoverLetter: 'Bỏ qua Cover Letter',
            submitSuccess: 'Nộp đơn thành công!',
            submitError: 'Có lỗi xảy ra khi nộp đơn. Vui lòng thử lại.',
            uploadError: 'Lỗi tải file lên Cloudinary. Vui lòng thử lại.',
            mustProvideCvIdOrCvUrl: 'Phải cung cấp ít nhất CV ID hoặc URL CV',
            mustProvideCoverletterIdOrCoverletterUrl: 'Phải cung cấp ít nhất Cover Letter ID hoặc URL Cover Letter',
        },
        en: {
            submit: 'Submit Application',
            cancel: 'Cancel',
            applyTitle: 'Apply for Job',
            applyDesc: 'Make sure your CV and cover letter are fully updated.',
            selectCV: 'Select CV to Apply',
            selectCL: 'Select Cover Letter',
            chooseFromLibrary: 'Choose CV from my library',
            uploadFromComputer: 'Upload CV from computer',
            chooseCLFromLibrary: 'Choose cover letter from library',
            uploadCLFromComputer: 'Upload cover letter from computer',
            noCV: 'You have no CVs.',
            noCL: 'You have no cover letters.',
            yourCVs: 'Your CVs',
            yourCLs: 'Your Cover Letters',
            viewDetail: 'View Detail',
            select: 'Select',
            selected: 'Selected',
            chooseCVFromComputer: 'Choose CV from computer',
            chooseCLFromComputer: 'Choose cover letter from computer',
            skipCoverLetter: 'Skip Cover Letter',
            submitSuccess: 'Application submitted successfully!',
            submitError: 'An error occurred while submitting the application. Please try again.',
            uploadError: 'Error uploading file to Cloudinary. Please try again.',
            mustProvideCvIdOrCvUrl: 'Must provide at least CV ID or CV URL',
            mustProvideCoverletterIdOrCoverletterUrl: 'Must provide at least Cover Letter ID or Cover Letter URL',
        },
    };
    const lang: 'vi' | 'en' = language === 'vi' ? 'vi' : 'en';
    const t = translations[lang];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title={null}
            width={750}
            styles={{ body: { padding: 0, borderRadius: 28, background: '#e3f6f5', boxShadow: 'none' } }}
        >
            <div className="bg-[#e3f6f5] rounded-3xl p-6 w-full max-w-2xl mx-auto" style={{ minWidth: 400, border: 'none', boxShadow: 'none' }}>
                <h2 className="text-2xl font-bold text-black mb-2">{t.applyTitle}</h2>
                <p className="text-black mb-6">{t.applyDesc}</p>
                <div className="mb-8 p-5 rounded-2xl border border-[#b3ecec] bg-white shadow-sm hover:border-[#217a8a] transition">
                    <div className="font-semibold text-lg mb-3 flex items-center gap-2 text-black">
                        <FolderOpenOutlined className="text-xl" style={{ color: '#217a8a' }} />
                        {t.selectCV}
                    </div>
                    <CustomRadioGroup
                        value={applyMode}
                        onChange={val => {
                            setApplyMode(val as 'library' | 'upload');
                            if (val === 'library') {
                                setSelectedCV('');
                                setCvUploadFile(null);
                            }
                            if (val === 'upload') {
                                setSelectedCV('');
                                setCvUploadFile(null);
                            }
                        }}
                        name="cv-mode"
                        options={[
                            { label: t.chooseFromLibrary, value: 'library' },
                            { label: t.uploadFromComputer, value: 'upload' },
                        ]}
                    />
                    {applyMode === 'library' && (
                        <div className="mt-3">
                            {cvList.length === 0 ? (
                                <span className="text-gray-400 text-sm">{t.noCV}</span>
                            ) : (
                                <>
                                    <div className="font-semibold text-black mb-2">{t.yourCVs}</div>
                                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#b3ecec] scrollbar-track-transparent">
                                        {cvList.slice(0, MAX_DISPLAY).map((cv, idx) => (
                                            <div
                                                key={cv._id || String(idx)}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${selectedCV === cv._id ? 'border-[#217a8a] bg-[#b3ecec]' : 'border-[#b3ecec] bg-white'
                                                    } transition-all`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="w-5 h-5 text-[#217a8a]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-base font-semibold text-black">{cv.title || 'CV chưa đặt tên'}</span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-black">
                                                        {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : '-'}
                                                    </span>
                                                    <button
                                                        className={`px-3 py-1 rounded ${selectedCV === cv._id
                                                            ? 'bg-[#217a8a] text-white'
                                                            : 'bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec]'
                                                            } font-medium text-sm transition`}
                                                        onClick={() => setSelectedCV(cv._id || '')}
                                                        disabled={selectedCV === cv._id}
                                                    >
                                                        {selectedCV === cv._id ? t.selected : t.select}
                                                    </button>
                                                    <a
                                                        href="/myDocuments"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 rounded bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec] font-medium text-sm transition"
                                                    >
                                                        {t.viewDetail}
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
                        <div className="mt-3 flex justify-center">
                            <div className="container">
                                <div className="folder">
                                    <div className="front-side">
                                        <div className="tip"></div>
                                        <div className="cover"></div>
                                    </div>
                                    <div className="back-side cover"></div>
                                </div>
                                <label className="custom-file-upload">
                                    <input
                                        className="title"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        disabled={uploading}
                                        onChange={e => {
                                            const file = e.target.files?.[0] || null;
                                            setCvUploadFile(file);
                                            setSelectedCV(file ? 'upload' : '');
                                        }}
                                    />
                                    {cvUploadFile?.name || t.chooseCVFromComputer}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mb-8 p-5 rounded-2xl border border-[#b3ecec] bg-white shadow-sm hover:border-[#217a8a] transition">
                    <div className="font-semibold text-lg mb-3 flex items-center gap-2 text-black">
                        <FolderOpenOutlined className="text-xl" style={{ color: '#217a8a' }} />
                        {t.selectCL}
                    </div>
                    <CustomRadioGroup
                        value={clMode}
                        onChange={val => {
                            setClMode(val as 'library' | 'upload');
                            if (val === 'library') {
                                setSelectedCL('');
                                setClUploadFile(null);
                            }
                            if (val === 'upload') {
                                setSelectedCL('');
                                setClUploadFile(null);
                            }
                        }}
                        name="cl-mode"
                        options={[
                            { label: t.chooseCLFromLibrary, value: 'library' },
                            { label: t.uploadCLFromComputer, value: 'upload' },
                        ]}
                    />
                    {clMode === 'library' && (
                        <div className="mt-3">
                            {clList.length === 0 ? (
                                <span className="text-gray-400 text-sm">{t.noCL}</span>
                            ) : (
                                <>
                                    <div className="font-semibold text-black mb-2">{t.yourCLs}</div>
                                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#b3ecec] scrollbar-track-transparent">
                                        {clList.slice(0, MAX_DISPLAY).map((cl, idx) => (
                                            <div
                                                key={cl._id || String(idx)}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${selectedCL === cl._id ? 'border-[#217a8a] bg-[#b3ecec]' : 'border-[#b3ecec] bg-white'
                                                    } transition-all`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="w-5 h-5 text-[#217a8a]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16 7a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2"
                                                        />
                                                    </svg>
                                                    <span className="text-base font-semibold text-black">
                                                        {cl.title || 'Thư ngỏ chưa đặt tên'}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-black">
                                                        {cl.updatedAt ? new Date(cl.updatedAt).toLocaleDateString() : '-'}
                                                    </span>
                                                    <button
                                                        className={`px-3 py-1 rounded ${selectedCL === cl._id
                                                            ? 'bg-[#217a8a] text-white'
                                                            : 'bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec]'
                                                            } font-medium text-sm transition`}
                                                        onClick={() => setSelectedCL(cl._id || '')}
                                                        disabled={selectedCL === cl._id}
                                                    >
                                                        {selectedCL === cl._id ? t.selected : t.select}
                                                    </button>
                                                    <a
                                                        href="/myDocuments"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 rounded bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec] font-medium text-sm transition"
                                                    >
                                                        {t.viewDetail}
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
                        <div className="mt-3 flex justify-center">
                            <div className="container">
                                <div className="folder">
                                    <div className="front-side">
                                        <div className="tip"></div>
                                        <div className="cover"></div>
                                    </div>
                                    <div className="back-side cover"></div>
                                </div>
                                <label className="custom-file-upload">
                                    <input
                                        className="title"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        disabled={uploading}
                                        onChange={e => {
                                            const file = e.target.files?.[0] || null;
                                            setClUploadFile(file);
                                            setSelectedCL(file ? 'upload' : '');
                                        }}
                                    />
                                    {clUploadFile?.name || t.chooseCLFromComputer}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                {formError && <p className="text-red-500 mb-4">{formError}</p>}
                <div className="flex gap-4 mt-6">
                    <button
                        className="py-3 px-6 rounded-xl font-semibold text-[#2563eb] bg-white border border-[#2563eb] text-lg transition focus:outline-none focus:ring-2 focus:ring-[#2563eb] cancel-btn"
                        style={{ minWidth: 120, boxShadow: '0 2px 12px rgba(33,99,235,0.13)', flex: 'none' }}
                        onClick={onClose}
                        disabled={uploading}
                    >
                        {t.cancel}
                    </button>
                    <button
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-[#2563eb] hover:bg-[#1e40af] text-lg transition shadow-md"
                        onClick={() => {
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
                            // Validate Cover Letter
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
                            onSubmit();
                        }}
                        disabled={uploading}
                    >
                        {uploading ? 'Đang tải lên...' : t.submit}
                    </button>
                </div>
            </div>
            <style jsx>{`
                .cancel-btn:hover {
                    background: #ffeaea;
                    border-color: #ff6b6b;
                    color: #d90429;
                }
                .container {
                    --transition: 350ms;
                    --folder-W: 120px;
                    --folder-H: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 10px;
                    background: linear-gradient(135deg, #60a5fa, #38bdf8);
                    border-radius: 15px;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
                    height: calc(var(--folder-H) * 1.7);
                    position: relative;
                    margin-top: 50px;
                }
                .folder {
                    position: absolute;
                    top: -20px;
                    left: calc(50% - 60px);
                    animation: float 2.5s infinite ease-in-out;
                    transition: transform var(--transition) ease;
                }
                .folder:hover {
                    transform: scale(1.05);
                }
                .folder .front-side,
                .folder .back-side {
                    position: absolute;
                    transition: transform var(--transition);
                    transform-origin: bottom center;
                }
                .folder .back-side::before,
                .folder .back-side::after {
                    content: "";
                    display: block;
                    background-color: white;
                    opacity: 0.5;
                    z-index: 0;
                    width: var(--folder-W);
                    height: var(--folder-H);
                    position: absolute;
                    transform-origin: bottom center;
                    border-radius: 15px;
                    transition: transform 350ms;
                    z-index: 0;
                }
                .container:hover .back-side::before {
                    transform: rotateX(-5deg) skewX(5deg);
                }
                .container:hover .back-side::after {
                    transform: rotateX(-15deg) skewX(12deg);
                }
                .folder .front-side {
                    z-index: 1;
                }
                .container:hover .front-side {
                    transform: rotateX(-40deg) skewX(15deg);
                }
                .folder .tip {
                    background: linear-gradient(135deg, #ff9a56, #ff6f56);
                    width: 80px;
                    height: 20px;
                    border-radius: 12px 12px 0 0;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                    position: absolute;
                    top: -10px;
                    z-index: 2;
                }
                .folder .cover {
                    background: linear-gradient(135deg, #ffe563, #ffc663);
                    width: var(--folder-W);
                    height: var(--folder-H);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                }
                .custom-file-upload {
                    font-size: 1.1em;
                    color: #ffffff;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 10px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: background var(--transition) ease;
                    display: inline-block;
                    width: 100%;
                    padding: 10px 35px;
                    position: relative;
                }
                .custom-file-upload:hover {
                    background: rgba(255, 255, 255, 0.4);
                }
                .custom-file-upload input[type="file"] {
                    display: none;
                }
                @keyframes float {
                    0% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }
            `}</style>
            <style jsx global>{`
                .ant-message .ant-message-notice-content {
                    font-size: 1.25rem;
                    padding: 16px 32px;
                    border-radius: 12px;
                }
            `}</style>
        </Modal>
    );
};

export default FastApplyModal;