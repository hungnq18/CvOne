"use client";
import React, { useState, useEffect } from "react";
import { getApplyJobByHR, updateStatusByHr } from "@/api/apiApplyJob";
import CandidateDetailsDialog from "@/components/hr/CandidateDetailsDialog";
import JobInfoDialog from "@/components/hr/JobInfoDialog";
import ManageApplyJobTable from "@/components/hr/ManageApplyJobTable";
import PreviewCVCLModal from "@/components/hr/PreviewCVCLModal";

export default function ManageApplyJobClient() {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);
    const [previewModal, setPreviewModal] = useState<{
        open: boolean;
        type: "cv" | "cl" | null;
        cvData?: any;
        clData?: any;
    }>({ open: false, type: null });

    useEffect(() => {
        getApplyJobByHR().then((data: any) => {
            let arr = Array.isArray(data) ? data : data && data.data ? data.data : [];
            setApplications(arr);
        });
    }, []);

    const handleUpdateStatus = async (
        applyJobId: string,
        newStatus: "approved" | "rejected" | "reviewed"
    ) => {
        try {
            await updateStatusByHr(applyJobId, newStatus);
            getApplyJobByHR().then((data: any) => {
                let arr = Array.isArray(data)
                    ? data
                    : data && data.data
                        ? data.data
                        : [];
                setApplications(arr);
            });
        } catch (error) {
            alert("Cập nhật trạng thái thất bại!");
        }
    };

    const handleViewCV = (cvId: string) => {
        const app = applications.find(
            (a: any) => (a.cvId?._id || a.cv_id) === cvId
        );
        if (app?.cvId) {
            setPreviewModal({ open: true, type: "cv", cvData: app.cvId });
        }
    };
    const handleViewCoverLetter = (coverLetterId: string) => {
        setPreviewModal({ open: true, type: "cl" });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Job Applications</h1>
            </div>
            <ManageApplyJobTable
                applications={applications}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleViewCV={handleViewCV}
                handleViewCoverLetter={handleViewCoverLetter}
                handleUpdateStatus={handleUpdateStatus}
            />
            <CandidateDetailsDialog
                open={isViewDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsViewDialogOpen(isOpen);
                }}
                application={selectedApplication}
                handleViewCV={handleViewCV}
                handleViewCoverLetter={handleViewCoverLetter}
                getStatusColor={() => ""}
                getStatusActions={() => null}
            />
            <JobInfoDialog
                open={isJobDialogOpen}
                onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) setSelectedApplication(null);
                    setIsJobDialogOpen(isOpen);
                }}
                application={selectedApplication}
            />
            <PreviewCVCLModal
                open={previewModal.open}
                type={previewModal.type}
                cvData={previewModal.cvData}
                clData={previewModal.clData}
                onClose={() => setPreviewModal({ open: false, type: null })}
            />
        </div>
    );
}
