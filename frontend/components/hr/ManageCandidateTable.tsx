"use client";

import { useState, useEffect } from "react";
import { FileText, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApplyJobByHR } from '@/api/apiApplyJob';
import { templateComponentMap } from '@/components/cvTemplate/index';
import { getCVTemplates, CVTemplate } from '@/api/cvapi';
import { deleteApplyJobByHR } from '@/api/apiApplyJob';
import { Modal } from 'antd';
import React from 'react';
import '../../styles/manageCandidate.css';
import PreviewCVCLModal from '@/components/hr/PreviewCVCLModal';
import ChatButton from '@/components/ui/chatButton';
import "@/styles/chatButton.css";

const DownloadButton = ({ onClick }: { onClick?: () => void }) => (
    <button className="Btn" onClick={onClick} type="button">
        <svg className="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
        <span className="icon2"></span>
    </button>
);

const DeleteButton = ({ onClick }: { onClick?: () => void }) => (
    <button className="group relative flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-red-800 bg-red-400 hover:bg-red-600" onClick={onClick} type="button">
        <svg viewBox="0 0 1.625 1.625" className="absolute -top-7 fill-white delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-1000" height="12" width="12"><path d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"></path><path d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"></path><path d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"></path></svg>
        <svg width="13" fill="none" viewBox="0 0 39 7" className="origin-right duration-500 group-hover:rotate-90"><line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line><line strokeWidth="3" stroke="white" y2="1.5" x2="26.0357" y1="1.5" x1="12"></line></svg>
        <svg width="13" fill="none" viewBox="0 0 33 39"><mask fill="white" id="path-1-inside-1_8_19"><path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path></mask><path mask="url(#path-1-inside-1_8_19)" fill="white" d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"></path><path strokeWidth="4" stroke="white" d="M12 6L12 29"></path><path strokeWidth="4" stroke="white" d="M21 6V29"></path></svg>
    </button>
);

const ManageCandidateTable = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [previewModal, setPreviewModal] = useState<{ open: boolean, type: 'cv' | 'cl' | null, cvData?: any, clData?: any }>({ open: false, type: null });
    const [downloadModal, setDownloadModal] = useState<{ open: boolean, app?: any }>({ open: false });
    const [allTemplates, setAllTemplates] = useState<CVTemplate[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean, appId?: string }>({ open: false });
    const [workType, setWorkType] = useState('All');
    const [showWorkTypeDropdown, setShowWorkTypeDropdown] = useState(false);
    useEffect(() => {
        getApplyJobByHR().then((data: any) => {
            let arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            setApplications(arr.filter((app: any) => app.status === 'approved'));
        });
        getCVTemplates().then(setAllTemplates);
    }, []);

    const handleViewCV = (cvId: string) => {
        const app = applications.find((a: any) => (a.cvId?._id || a.cv_id) === cvId);
        if (app?.cvId) {
            setPreviewModal({ open: true, type: 'cv', cvData: app.cvId });
        }
    };
    const handleViewCoverLetter = (coverLetterId: string) => {
        setPreviewModal({ open: true, type: 'cl' });
    };

    const handleDownloadCV = async (cvData: any) => {
        if (!window.confirm("Bạn có chắc chắn muốn tải CV này về máy?")) {
            return;
        }
        if (!cvData || !cvData.content?.userData || !(cvData.cvTemplateId || cvData.templateId)) {
            alert("Không đủ dữ liệu để xuất PDF");
            return;
        }
        const templateId = cvData.cvTemplateId || cvData.templateId;
        const template = allTemplates.find((t) => t._id === templateId);
        if (!template) {
            alert("Không tìm thấy template phù hợp để xuất PDF");
            return;
        }
        const TemplateComponent = templateComponentMap[template.title];
        if (!TemplateComponent) {
            alert("Không tìm thấy component template để xuất PDF");
            return;
        }
        const templateData = { ...template.data, userData: cvData.content.userData };
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.width = '794px';
        iframe.style.height = '1123px';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) {
            alert("Không thể tạo môi trường để xuất PDF.");
            document.body.removeChild(iframe);
            return;
        }
        const head = iframeDoc.head;
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
            head.appendChild(node.cloneNode(true));
        });
        const mountNode = iframeDoc.createElement('div');
        iframeDoc.body.appendChild(mountNode);
        let root = null;
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const { createRoot } = await import('react-dom/client');
            root = createRoot(mountNode);
            root.render(
                <div>
                    <div style={{ fontFamily: 'sans-serif' }}>
                        <TemplateComponent data={templateData} isPdfMode={true} />
                    </div>
                </div>
            );
            await new Promise(resolve => setTimeout(resolve, 500));
            const html2pdf = (await import("html2pdf.js"))?.default || (await import("html2pdf.js"));
            await html2pdf()
                .from(iframe.contentWindow.document.body)
                .set({
                    margin: 0,
                    filename: `${cvData.title || "cv"}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
                })
                .save();
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            alert("Đã có lỗi xảy ra khi xuất file PDF.");
        } finally {
            if (root) root.unmount();
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }
    };
    const handleDownloadCL = (clData: any) => {
        alert('Chức năng tải Cover Letter đang phát triển!');
    };

    // Lọc ứng viên chỉ theo cột Candidate (tên ứng viên) và work type (lấy work type từ job)
    const filteredApplications = applications.filter(app => {
        const name = ((app.cvId?.content?.userData?.firstName || '') + ' ' + (app.cvId?.content?.userData?.lastName || '')).toLowerCase();
        const term = searchTerm.toLowerCase();
        const jobWorkType = (app.jobId?.workType || app.jobId?.["Work Type"] || '').trim().toLowerCase();
        const workTypeFilter = workType.trim().toLowerCase();
        const matchName = name.includes(term);
        const matchWorkType = workType === 'All' || jobWorkType === workTypeFilter;
        return matchName && matchWorkType;
    }).sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.submit_at || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.submit_at || 0).getTime();
        return dateB - dateA;
    });

    // Lấy danh sách work type duy nhất từ dữ liệu job
    const workTypes = Array.from(new Set(applications.map(app => app.jobId?.workType || app.jobId?.["Work Type"]).filter(Boolean)));

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Job Applications</h1>
            </div>
            <Card >
                <CardHeader style={{ marginTop: 50 }} >
                    <CardTitle>Candidate Manager</CardTitle>
                    <div className="flex items-center space-x-2" style={{ marginTop: 20 }}>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        {/* Dropdown Work Type custom */}
                        <div className="relative inline-block">
                            <button
                                id="dropdownDefaultButton"
                                type="button"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={() => setShowWorkTypeDropdown((v: boolean) => !v)}
                            >
                                {workType === 'All' ? 'All Work Types' : workType}
                                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                            {showWorkTypeDropdown && (
                                <div className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-2">
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <li>
                                            <button
                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                onClick={() => { setWorkType('All'); setShowWorkTypeDropdown(false); }}
                                            >
                                                All Work Types
                                            </button>
                                        </li>
                                        {workTypes.map(type => (
                                            <li key={type}>
                                                <button
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                    onClick={() => { setWorkType(type); setShowWorkTypeDropdown(false); }}
                                                >
                                                    {type}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Applied Jobs</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">No applications found for this status.</TableCell>
                            </TableRow>
                        ) : filteredApplications.map((app: any) => (
                            <TableRow key={app._id}>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={app.cvId?.content?.userData?.avatar || app.cvId?.avatar || '/placeholder-user.jpg'} />
                                            <AvatarFallback>
                                                {app.cvId?.content?.userData?.firstName?.[0] || ''}{app.cvId?.content?.userData?.lastName?.[0] || ''}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {app.cvId?.content?.userData?.firstName || app.userId?.first_name || '-'} {app.cvId?.content?.userData?.lastName || app.userId?.last_name || ''}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{app.cvId?.content?.userData?.email || app.userId?.email || '-'}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {app.userId?.city || '-'}, {app.userId?.country || '-'}
                                </TableCell>
                                <TableCell>
                                    {app.userId?.phone || '-'}
                                </TableCell>
                                <TableCell>
                                    {app.jobId?.title || app.job_id || '-'}
                                </TableCell>
                                <TableCell>
                                    {app.updatedAt
                                        ? new Date(app.updatedAt).toLocaleDateString()
                                        : (app.createdAt
                                            ? new Date(app.createdAt).toLocaleDateString()
                                            : (app.submit_at ? new Date(app.submit_at).toLocaleDateString() : '-'))}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (app.cvId?._id || app.cv_id) {
                                                    setPreviewModal({ open: true, type: 'cv', cvData: app.cvId });
                                                } else if (app.cvUrl) {
                                                    window.open(app.cvUrl, '_blank');
                                                }
                                            }}
                                            style={{ background: '#f5f5f5', color: '#1e40af', border: '1px solid #d1d5db', fontWeight: 500 }}
                                        >
                                            <FileText className="mr-1" style={{ color: '#1e40af' }} />
                                            View CV
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (app.coverletterId?._id || app.coverletter_id) {
                                                    setPreviewModal({ open: true, type: 'cl', clData: app.coverletterId });
                                                } else if (app.clUrl) {
                                                    window.open(app.clUrl, '_blank');
                                                }
                                            }}
                                            style={{ background: '#f5f5f5', color: '#047857', border: '1px solid #d1d5db', fontWeight: 500 }}
                                        >
                                            <User className="mr-1" style={{ color: '#047857' }} />
                                            View CL
                                        </Button>
                                        <DownloadButton onClick={() => setDownloadModal({ open: true, app })} />
                                        <ChatButton
                                            participantId={app.userId?._id || app.userId || app.cvId?.userId || ''}
                                            buttonText="Chat"
                                            compact={true}
                                        />
                                        <DeleteButton onClick={() => setDeleteModal({ open: true, appId: app._id })} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            <Modal
                open={downloadModal.open}
                onCancel={() => setDownloadModal({ open: false })}
                footer={null}
                width={400}
                centered
                title="Chọn loại file để tải"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', padding: 24 }}>
                    <Button
                        style={{ width: 200 }}
                        onClick={async () => {
                            setDownloadModal({ open: false });
                            if (downloadModal.app?.cvId?._id || downloadModal.app?.cv_id) {
                                await handleDownloadCV(downloadModal.app.cvId);
                            } else if (downloadModal.app?.cvUrl) {
                                const link = document.createElement('a');
                                link.href = downloadModal.app.cvUrl;
                                link.download = '';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }
                        }}
                    >
                        Tải CV
                    </Button>
                    <Button
                        style={{ width: 200 }}
                        onClick={() => {
                            setDownloadModal({ open: false });
                            if (downloadModal.app?.coverletterId?._id || downloadModal.app?.coverletter_id) {
                                handleDownloadCL(downloadModal.app.coverletterId);
                            } else if (downloadModal.app?.clUrl) {
                                const link = document.createElement('a');
                                link.href = downloadModal.app.clUrl;
                                link.download = '';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }
                        }}
                    >
                        Tải Cover Letter
                    </Button>
                </div>
            </Modal>
            <Modal
                open={deleteModal.open}
                onCancel={() => setDeleteModal({ open: false })}
                footer={null}
                centered
                title="Xác nhận xoá ứng viên"
            >
                <div style={{ textAlign: 'center', padding: 16 }}>
                    <p>Bạn có chắc chắn muốn xoá ứng viên này không?</p>
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
                        <Button onClick={() => setDeleteModal({ open: false })}>Huỷ</Button>
                        <Button
                            type="button"
                            style={{ background: '#e11d48', borderColor: '#e11d48', color: '#fff' }}
                            onClick={async () => {
                                if (deleteModal.appId) {
                                    await deleteApplyJobByHR(deleteModal.appId);
                                    setApplications(apps => apps.filter(a => a._id !== deleteModal.appId));
                                }
                                setDeleteModal({ open: false });
                            }}
                        >
                            Xoá
                        </Button>
                    </div>
                </div>
            </Modal>
            <PreviewCVCLModal
                open={previewModal.open}
                type={previewModal.type}
                cvData={previewModal.cvData}
                clData={previewModal.clData}
                onClose={() => setPreviewModal({ open: false, type: null })}
            />
        </div >
    );
};

export default ManageCandidateTable; 