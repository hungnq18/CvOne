import React from 'react';
import { Modal, Input } from 'antd';
import { UiverseFileUpload } from '@/components/ui/UiverseFileUpload';
import { CustomRadioGroup } from '@/components/ui/CustomRadioGroup';
import { FolderOpenOutlined } from '@ant-design/icons';
// import '@/styles/FastApplyModal.uiverse.css';

interface FastApplyModalProps {
    open: boolean;
    onClose: () => void;
    cvList: any[];
    clList: any[];
    selectedCV: string | null;
    setSelectedCV: (id: string) => void;
    selectedCL: string | null;
    setSelectedCL: (id: string) => void;
    applyMode: 'library' | 'upload';
    setApplyMode: (mode: 'library' | 'upload') => void;
    clMode: 'library' | 'upload';
    setClMode: (mode: 'library' | 'upload') => void;
    cvUploadFile: File | null;
    setCvUploadFile: (file: File | null) => void;
    clUploadFile: File | null;
    setClUploadFile: (file: File | null) => void;
    clUploadName: string;
    setClUploadName: (name: string) => void;
    uploading: boolean;
    formError: string;
    setFormError: (err: string) => void;
    onSubmit: () => void;
}

const MAX_DISPLAY = 3;

const FastApplyModal: React.FC<FastApplyModalProps> = ({
    open, onClose, cvList, clList, selectedCV, setSelectedCV, selectedCL, setSelectedCL,
    applyMode, setApplyMode, clMode, setClMode, cvUploadFile, setCvUploadFile, clUploadFile, setClUploadFile, clUploadName, setClUploadName, uploading, formError, setFormError, onSubmit
}) => {
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
                <h2 className="text-2xl font-bold text-black mb-2">Nộp CV ứng tuyển</h2>
                <p className="text-black mb-6">Hãy chắc chắn rằng CV và thư ngỏ của bạn đã được cập nhật đầy đủ thông tin.</p>
                <div className="mb-8 p-5 rounded-2xl border border-[#b3ecec] bg-white shadow-sm hover:border-[#217a8a] transition">
                    <div className="font-semibold text-lg mb-3 flex items-center gap-2 text-black">
                        <FolderOpenOutlined className="text-xl" style={{ color: '#217a8a' }} />
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
                                <span className="text-gray-400 text-sm">Bạn chưa có CV nào.</span>
                            ) : (
                                <>
                                    <div className="font-semibold text-black mb-2">Danh sách CV của bạn</div>
                                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#b3ecec] scrollbar-track-transparent">
                                        {cvList.map((cv, idx) => (
                                            <div key={cv._id || String(idx)} className={`flex items-center justify-between p-3 rounded-lg border ${selectedCV === cv._id ? 'border-[#217a8a] bg-[#b3ecec]' : 'border-[#b3ecec] bg-white'} transition-all`}>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-[#217a8a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-base font-semibold text-black">{cv.title || 'CV chưa đặt tên'}</span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-black">{cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString() : '-'}</span>
                                                    <button
                                                        className={`px-3 py-1 rounded ${selectedCV === cv._id ? 'bg-[#217a8a] text-white' : 'bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec]'} font-medium text-sm transition`}
                                                        onClick={() => setSelectedCV((cv._id || '') as string)}
                                                        disabled={selectedCV === cv._id}
                                                    >
                                                        {selectedCV === cv._id ? 'Đang chọn' : 'Chọn'}
                                                    </button>
                                                    <a
                                                        href="/myDocuments"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 rounded bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec] font-medium text-sm transition"
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
                                            setSelectedCV('upload');
                                        }}
                                    />
                                    {cvUploadFile?.name || 'Chọn CV từ máy tính'}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mb-8 p-5 rounded-2xl border border-[#b3ecec] bg-white shadow-sm hover:border-[#217a8a] transition">
                    <div className="font-semibold text-lg mb-3 flex items-center gap-2 text-black">
                        <FolderOpenOutlined className="text-xl" style={{ color: '#217a8a' }} />
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
                                <span className="text-gray-400 text-sm">Bạn chưa có thư ngỏ nào.</span>
                            ) : (
                                <>
                                    <div className="font-semibold text-black mb-2">Danh sách thư ngỏ của bạn</div>
                                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#b3ecec] scrollbar-track-transparent">
                                        {clList.map((cl, idx) => (
                                            <div key={cl._id || String(idx)} className={`flex items-center justify-between p-3 rounded-lg border ${selectedCL === cl._id ? 'border-[#217a8a] bg-[#b3ecec]' : 'border-[#b3ecec] bg-white'} transition-all`}>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-[#217a8a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0V5a2 2 0 00-2-2H10a2 2 0 00-2 2v2" /></svg>
                                                    <span className="text-base font-semibold text-black">{cl.title || 'Thư ngỏ chưa đặt tên'}</span>
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs text-black">{cl.updatedAt ? new Date(cl.updatedAt).toLocaleDateString() : '-'}</span>
                                                    <button
                                                        className={`px-3 py-1 rounded ${selectedCL === cl._id ? 'bg-[#217a8a] text-white' : 'bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec]'} font-medium text-sm transition`}
                                                        onClick={() => setSelectedCL((cl._id || '') as string)}
                                                        disabled={selectedCL === cl._id}
                                                    >
                                                        {selectedCL === cl._id ? 'Đang chọn' : 'Chọn'}
                                                    </button>
                                                    <a
                                                        href="/myDocuments"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 rounded bg-[#e3f6f5] text-[#217a8a] hover:bg-[#b3ecec] font-medium text-sm transition"
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
                                        onChange={e => setClUploadFile(e.target.files?.[0] || null)}
                                    />
                                    {clUploadFile?.name || 'Chọn thư ngỏ từ máy tính'}
                                </label>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">Hỗ trợ .doc, .docx, .pdf, dưới 5MB</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-row gap-3 mt-6">
                    <button
                        className="px-6 py-3 rounded-xl bg-white border border-[#2193b0] text-[#217a8a] font-semibold transition hover:bg-gray-100 hover:text-[#217a8a] hover:border-[#2193b0] focus:outline-none focus:ring-2 focus:ring-[#2193b0]"
                        style={{ boxShadow: '0 2px 8px rgba(33,147,176,0.08)' }}
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        className="flex-1 py-3 rounded-xl bg-[#217a8a] text-white font-bold text-lg transition hover:bg-[#17607e] hover:text-white hover:border-[#17607e] border border-[#217a8a] focus:outline-none focus:ring-2 focus:ring-[#217a8a]"
                        style={{ boxShadow: '0 2px 12px rgba(33,147,176,0.13)' }}
                        onClick={onSubmit}
                    >
                        Nộp CV
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default FastApplyModal; 