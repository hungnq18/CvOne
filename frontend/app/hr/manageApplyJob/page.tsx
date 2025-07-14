"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Eye, Check, X, Search, Download, Mail, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getApplyJobByHR } from '@/api/apiApplyJob';
import CandidateDetailsDialog from '@/components/hr/CandidateDetailsDialog';
import JobInfoDialog from '@/components/hr/JobInfoDialog';
import StatusRadioTabs from '../../../components/hr/RadioTabsInManageApply';
import { Modal } from 'antd';
import { templateComponentMap } from '@/components/cvTemplate/index';
import { getCVTemplates, CVTemplate } from '@/api/cvapi';
import { getCLTemplates, CLTemplate } from '@/api/clApi';
import { templates as clTemplateComponentMap, TemplateType } from '@/app/createCLTemplate/templates';
import { updateStatusByHr } from '@/api/apiApplyJob';
import DeleteButton from '@/components/ui/DeleteButton';
import HrAction from '@/components/ui/hrActions';
import styles from '@/styles/hrActions.module.css';

// Định nghĩa interface cho Job (từ manageJob page)
interface Job {
    _id: string
    "Job Title": string
    Role: string
    Experience: string
    Qualifications: string
    "Salary Range": string
    location: string
    Country: string
    "Work Type": string
    "Job Posting Date": string
    "Job Description": string
    Benefits: string
    skills: string
    Responsibilities: string
    user_id: string
    status?: "Active" | "Inactive"
    applications?: number
}

// Định nghĩa interface cho CV từ db.json
interface CV {
    _id: string
    userId: string
    title: string
    content: {
        userData: {
            firstName: string
            lastName: string
            professional: string
            city: string
            country: string
            province: string
            phone: string
            email: string
            avatar: string
            summary: string
            skills: Array<{
                name: string
                rating: number
            }>
            workHistory: Array<{
                title: string
                company: string
                startDate: string
                endDate: string
                description: string
            }>
            education: Array<{
                startDate: string
                endDate: string
                major: string
                degree: string
                institution: string
            }>
        }
    }
    isPublic: boolean
    createdAt: string
    updatedAt: string
    templateId: string
    isSaved: boolean
    isFinalized: boolean
}

interface CoverLetter {
    _id: string
    userId: string
    templateId: string
    title: string
    data: {
        firstName: string
        lastName: string
        profession: string
        city: string
        state: string
        phone: string
        email: string
        date: string
        recipientFirstName: string
        recipientLastName: string
        companyName: string
        recipientCity: string
        recipientState: string
        recipientPhone: string
        recipientEmail: string
        subject: string
        greeting: string
        opening: string
        body: string
        callToAction: string
        closing: string
        signature: string
    }
    isSaved: boolean
    createdAt: string
    updatedAt: string
}

// Định nghĩa interface cho ApplyJob
interface ApplyJob {
    _id: string;
    job_id: string;
    user_id: string;
    cv_id: string;
    coverletter_id: string;
    status: "pending" | "reviewed" | "approved" | "rejected";
    submit_at: string;
}

// Định nghĩa interface cho Application (kết hợp CV và Cover Letter)
interface HydratedApplication {
    applyJob: ApplyJob,
    job: Job,
    cv: CV,
    coverLetter: CoverLetter
}

// Mini preview CV component
const CVPreviewMini = ({ templateId, userData }: { templateId: string, userData: any }) => {
    const [templates, setTemplates] = useState<CVTemplate[]>([]);
    useEffect(() => { getCVTemplates().then(setTemplates); }, []);
    if (!templateId || !userData) return null;
    const template = templates.find(t => t._id === templateId);
    const TemplateComponent = templateComponentMap?.[template?.title || ''];
    if (!TemplateComponent) return <div>Không tìm thấy template CV</div>;
    const containerWidth = 600;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    const componentData = { ...template?.data, userData };
    return (
        <div className="flex justify-center">
            <div
                className="relative"
                style={{
                    width: '600px',
                    height: '780px',
                    background: 'white',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${templateOriginalWidth}px`,
                        height: `${templateOriginalWidth * (297 / 210)}px`,
                        transform: `scale(${scaleFactor})`,
                        transformOrigin: 'top left',
                        background: 'white',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    <TemplateComponent data={componentData} />
                </div>
            </div>
        </div>
    );
};

// Component preview template CV giống CVProgress
const CVTemplatePreview = ({ templateId, userData }: { templateId: string, userData: any }) => {
    const [templates, setTemplates] = React.useState<CVTemplate[]>([]);
    React.useEffect(() => {
        getCVTemplates().then(setTemplates);
    }, []);
    const template = templates.find(t => t._id === templateId);
    const TemplateComponent = templateComponentMap?.[template?.title || ''];
    if (!TemplateComponent) return <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Không tìm thấy template CV.</div>;
    const containerWidth = 600;
    const templateOriginalWidth = 794;
    const scaleFactor = containerWidth / templateOriginalWidth;
    const componentData = { ...template?.data, userData };
    // Tĩnh hoàn toàn: không select, không thao tác, không context menu
    return (
        <div className="flex justify-center">
            <div
                className="relative"
                style={{
                    width: '600px',
                    height: '780px',
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #eee',
                    overflow: 'hidden',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}
                onContextMenu={e => e.preventDefault()}
                tabIndex={-1}
                draggable={false}
            >
                <div
                    style={{
                        width: `${templateOriginalWidth}px`,
                        height: `${templateOriginalWidth * (297 / 210)}px`,
                        transform: `scale(${scaleFactor})`,
                        transformOrigin: 'top left',
                        background: 'white',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                    tabIndex={-1}
                    draggable={false}
                >
                    <TemplateComponent data={componentData} />
                </div>
            </div>
        </div>
    );
};

// Thêm component ActionMenu nội bộ file
const ActionMenu = ({ app, statusFilter, handleUpdateStatus }: any) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
            <div className={styles.background}>
                <button className={styles.menu__icon} onClick={() => setOpen((v) => !v)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            {open && (
                <div style={{ position: 'absolute', top: 70, left: 0, zIndex: 10, minWidth: 120 }}>
                    <div className={styles.card}>
                        {statusFilter === 'all' ? null : (
                            <>
                                {app.status === 'pending' && (
                                    <ul className={styles.list}>
                                        <li className={styles.element} onClick={() => handleUpdateStatus(app._id, 'reviewed')}>
                                            <Check className="h-4 w-4 mr-1" /> Reviewed
                                        </li>
                                    </ul>
                                )}
                                {app.status === 'reviewed' && (
                                    <ul className={styles.list}>
                                        <li className={styles.element} onClick={() => handleUpdateStatus(app._id, 'approved')}>
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </li>
                                        <li className={styles.element} onClick={() => handleUpdateStatus(app._id, 'rejected')}>
                                            <X className="h-4 w-4 mr-1" /> Reject
                                        </li>
                                    </ul>
                                )}
                                {app.status === 'rejected' && statusFilter !== 'all' && (
                                    <ul className={styles.list}>
                                        <li className={styles.element} onClick={() => handleUpdateStatus(app._id, 'rejected')}>
                                            <DeleteButton />
                                        </li>
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ManageApplyJobPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<HydratedApplication | null>(null)
    const [previewModal, setPreviewModal] = useState<{ open: boolean, type: 'cv' | 'cl' | null, cvData?: any, clData?: any }>({ open: false, type: null });
    const [clTemplates, setClTemplates] = useState<CLTemplate[]>([]);
    const [clTemplatesLoading, setClTemplatesLoading] = useState(false);

    // Lọc lại filteredApplications theo statusFilter
    const filteredApplications = statusFilter === 'all'
        ? applications.filter((app: any) => ['pending', 'reviewed'].includes(app.status))
        : applications.filter((app: any) => app.status === statusFilter);

    // Thêm lọc theo searchTerm (tìm theo tên, email, job title)
    const searchedApplications = searchTerm.trim() === ''
        ? filteredApplications
        : filteredApplications.filter((app: any) => {
            const name = (app.cvId?.content?.userData?.firstName || app.userId?.first_name || '') + ' ' + (app.cvId?.content?.userData?.lastName || app.userId?.last_name || '');
            const email = app.cvId?.content?.userData?.email || app.userId?.email || '';
            const jobTitle = app.jobId?.title || app.job_id || '';
            const search = searchTerm.toLowerCase();
            return (
                name.toLowerCase().includes(search) ||
                email.toLowerCase().includes(search) ||
                jobTitle.toLowerCase().includes(search)
            );
        });

    useEffect(() => {
        getApplyJobByHR().then((data: any) => {
            console.log('Dữ liệu apply-job/by-hr từ API:', data);
            let arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            setApplications(arr);
        });
    }, []);

    useEffect(() => {
        setClTemplatesLoading(true);
        getCLTemplates().then((data) => {
            setClTemplates(data);
        }).finally(() => setClTemplatesLoading(false));
    }, []);

    // Thêm hàm cập nhật trạng thái ứng viên
    const handleUpdateStatus = async (applyJobId: string, newStatus: "approved" | "rejected" | "reviewed") => {
        try {
            await updateStatusByHr(applyJobId, newStatus);
            // Sau khi cập nhật, reload lại danh sách
            getApplyJobByHR().then((data: any) => {
                let arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
                setApplications(arr);
            });
        } catch (error) {
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    // Remove handleStatusChange, getStatusActions, and all status update dropdown/buttons
    // Only display status as a colored badge
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "reviewed":
                return "bg-blue-100 text-blue-800"
            case "interviewed":
                return "bg-purple-100 text-purple-800"
            case "hired":
                return "bg-green-100 text-green-800"
            case "rejected":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const handleViewCV = (cvId: string) => {
        const app = searchedApplications.find((a: any) => (a.cvId?._id || a.cv_id) === cvId);
        if (app?.cvId) {
            setPreviewModal({ open: true, type: 'cv', cvData: app.cvId });
        }
    };
    const handleViewCoverLetter = (coverLetterId: string) => {
        // Only open an empty modal for now
        setPreviewModal({ open: true, type: 'cl' });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Job Applications</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Job Applications with CV & Cover Letter</CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                {/* StatusRadioTabs UI đẹp */}
                <StatusRadioTabs
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead>{statusFilter === 'all' ? 'Status' : 'Action'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {searchedApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-400">No applications found for this status.</TableCell>
                                </TableRow>
                            ) : searchedApplications.map((app: any) => (
                                <TableRow key={app._id}>
                                    <TableCell>
                                        {/* Candidate info */}
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
                                    <TableCell className="font-medium">{app.jobId?.title || app.job_id || '-'}</TableCell>
                                    <TableCell>{app.jobId?.role || app.jobId?.Role || '-'}</TableCell>
                                    <TableCell>{app.createdAt
                                        ? new Date(app.createdAt).toLocaleDateString()
                                        : (app.submit_at ? new Date(app.submit_at).toLocaleDateString() : '-')}</TableCell>
                                    <TableCell>{app.cvId?.content?.userData?.professional || '-'}</TableCell>
                                    <TableCell>
                                        <HrAction
                                            onViewCV={() => handleViewCV(app.cvId?._id || app.cv_id)}
                                            onDownloadCV={() => { /* TODO: download CV */ }}
                                            onViewCL={() => handleViewCoverLetter(app.coverletterId?._id || app.coverletter_id)}
                                            onDownloadCL={() => { /* TODO: download CL */ }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {statusFilter === 'all' ? (
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(app.status)}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        ) : (
                                            <>
                                                {app.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleUpdateStatus(app._id, 'reviewed')}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" /> Reviewed
                                                        </Button>
                                                    </div>
                                                )}
                                                {app.status === 'reviewed' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                                            onClick={() => handleUpdateStatus(app._id, 'approved')}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                                            onClick={() => handleUpdateStatus(app._id, 'rejected')}
                                                        >
                                                            <X className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                                {app.status === 'rejected' && statusFilter !== 'all' && (
                                                    <div className="flex items-center gap-2">
                                                        <DeleteButton onClick={() => handleUpdateStatus(app._id, 'rejected')} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Candidate Details Dialog */}
            <CandidateDetailsDialog
                open={isViewDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsViewDialogOpen(isOpen);
                }}
                application={selectedApplication}
                getStatusColor={getStatusColor}
                handleViewCV={handleViewCV}
                handleViewCoverLetter={handleViewCoverLetter}
                getStatusActions={() => null} // No status actions
            />

            {/* Job Info Dialog */}
            <JobInfoDialog
                open={isJobDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsJobDialogOpen(isOpen);
                }}
                application={selectedApplication}
            />

            <Modal
                open={previewModal.open && previewModal.type === 'cv'}
                onCancel={() => setPreviewModal({ open: false, type: null })}
                footer={null}
                width={650}
                centered
                styles={{ body: { background: '#f9f9f9' } }}
            >
                {previewModal.cvData && previewModal.cvData.cvImage ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <img
                            src={previewModal.cvData.cvImage}
                            style={{
                                maxWidth: 600,
                                maxHeight: 800,
                                borderRadius: 12,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                background: '#fff',
                                border: '1px solid #eee',
                            }}
                        />
                    </div>
                ) : (previewModal.cvData && (previewModal.cvData.templateId || previewModal.cvData.cvTemplateId) && previewModal.cvData.content?.userData ? (
                    <CVTemplatePreview
                        templateId={previewModal.cvData.templateId || previewModal.cvData.cvTemplateId}
                        userData={previewModal.cvData.content.userData}
                    />
                ) : (
                    <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                        Không tìm thấy dữ liệu CV.
                    </div>
                ))}
            </Modal>

            <Modal
                open={previewModal.open && previewModal.type === 'cl'}
                onCancel={() => setPreviewModal({ open: false, type: null })}
                footer={null}
                width={600}
                centered
                title={'Cover Letter Preview'}
            >
                <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                    Chức năng xem Cover Letter đang phát triển.
                </div>
            </Modal>
        </div>
    )
}
