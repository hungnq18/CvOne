"use client"

import { useState, useEffect } from "react"
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
import { getApplyJobByHR } from '@/api/apiApplyJob';
import CandidateDetailsDialog from '@/components/hr/CandidateDetailsDialog';
import { Modal } from 'antd';
import { templateComponentMap } from '@/components/cvTemplate/index';
import { getCVTemplates, CVTemplate } from '@/api/cvapi';
import { getCLTemplates, CLTemplate } from '@/api/clApi';
import { templates as clTemplateComponentMap, TemplateType } from '@/app/createCLTemplate/templates';
import { updateStatusByHr } from '@/api/apiApplyJob';
import React from 'react';
import '../../../styles/manageCandidate.css';

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
    if (!TemplateComponent) return <div>CV template not found</div>;
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
    if (!TemplateComponent) return <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>CV template not found.</div>;
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

const DeleteButton = ({ onClick }: { onClick?: () => void }) => (
    <button
        className="group relative flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-red-800 bg-red-400 hover:bg-red-600"
        onClick={onClick}
        type="button"
    >
        <svg
            viewBox="0 0 1.625 1.625"
            className="absolute -top-7 fill-white delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-1000"
            height="12"
            width="12"
        >
            <path d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"></path>
            <path d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"></path>
            <path d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"></path>
        </svg>
        <svg
            width="13"
            fill="none"
            viewBox="0 0 39 7"
            className="origin-right duration-500 group-hover:rotate-90"
        >
            <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line>
            <line
                strokeWidth="3"
                stroke="white"
                y2="1.5"
                x2="26.0357"
                y1="1.5"
                x1="12"
            ></line>
        </svg>
        <svg width="13" fill="none" viewBox="0 0 33 39">
            <mask fill="white" id="path-1-inside-1_8_19">
                <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
            </mask>
            <path
                mask="url(#path-1-inside-1_8_19)"
                fill="white"
                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
            ></path>
            <path strokeWidth="4" stroke="white" d="M12 6L12 29"></path>
            <path strokeWidth="4" stroke="white" d="M21 6V29"></path>
        </svg>
    </button>
);

const DownloadButton = ({ onClick }: { onClick?: () => void }) => (
    <button className="Btn" onClick={onClick} type="button">
        <svg className="svgIcon" viewBox="0 0 384 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path></svg>
        <span className="icon2"></span>
    </button>
);

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

    // Đếm số lượng ứng viên theo từng status
    const statusCounts = applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});

    const searchedApplications = applications;

    useEffect(() => {
        getApplyJobByHR().then((data: any) => {
            console.log('Dữ liệu apply-job/by-hr từ API:', data);
            let arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            setApplications(arr.filter((app: any) => app.status === 'approved'));
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
            {/* Bỏ StatusRadioTabs và input search */}
            <Card>
                <CardHeader>
                    <CardTitle>Candidate Manager</CardTitle>
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
                {/* <CardContent> */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Applied Jobs</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {searchedApplications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-400">No applications found for this status.</TableCell>
                            </TableRow>
                        ) : searchedApplications.map((app: any) => (
                            <TableRow key={app._id}>
                                {/* Candidate */}
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
                                {/* Location */}
                                <TableCell>
                                    {app.cvId?.content?.userData?.city || '-'}, {app.cvId?.content?.userData?.country || '-'}
                                </TableCell>
                                {/* Experience */}
                                <TableCell>
                                    {app.cvId?.content?.userData?.professional || '-'}
                                </TableCell>


                                {/* Applied Jobs */}
                                <TableCell>
                                    {app.jobId?.title || app.job_id || '-'}
                                </TableCell>
                                {/* Last Active */}
                                <TableCell>
                                    {app.updatedAt
                                        ? new Date(app.updatedAt).toLocaleDateString()
                                        : (app.createdAt
                                            ? new Date(app.createdAt).toLocaleDateString()
                                            : (app.submit_at ? new Date(app.submit_at).toLocaleDateString() : '-'))}
                                </TableCell>
                                {/* Actions */}
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewCV(app.cvId?._id || app.cv_id)}
                                            style={{
                                                background: '#f5f5f5',
                                                color: '#1e40af',
                                                border: '1px solid #d1d5db',
                                                fontWeight: 500
                                            }}
                                        >
                                            <FileText className="mr-1" style={{ color: '#1e40af' }} />
                                            View CV
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewCoverLetter(app.coverletterId?._id || app.coverletter_id)}
                                            style={{
                                                background: '#f5f5f5',
                                                color: '#047857',
                                                border: '1px solid #d1d5db',
                                                fontWeight: 500
                                            }}
                                        >
                                            <User className="mr-1" style={{ color: '#047857' }} />
                                            View CL
                                        </Button>
                                        <DownloadButton />
                                        <DeleteButton />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* </CardContent> */}
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

            <Modal
                open={previewModal.open && previewModal.type === 'cv'}
                onCancel={() => setPreviewModal({ open: false, type: null })}
                footer={null}
                width={650}
                centered
                title={'CV Preview'}
                styles={{ body: { background: '#f9f9f9' } }}
            >
                {(() => { console.log('CV Preview Data:', previewModal.cvData); return null; })()}
                {previewModal.cvData && previewModal.cvData.cvImage ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <img
                            src={previewModal.cvData.cvImage}
                            alt="CV preview"
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
                        CV data not found.
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
                    Cover Letter preview is under development.
                </div>
            </Modal>
        </div>
    )
}
