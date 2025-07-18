"use client";
import React, { useState, useEffect } from "react";
import { getApplyJobByHR, updateStatusByHr, deleteApplyJobByHR } from "@/api/apiApplyJob";
import ManageApplyJobTable from "@/components/hr/ManageApplyJobTable";
import PreviewCVCLModal from "@/components/hr/PreviewCVCLModal";
import { sendNotification } from '@/api/apiNotification';
import { getUserById } from '@/api/userApi';

export default function ManageApplyJobClient() {
    const [applications, setApplications] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
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
        newStatus: "approved" | "rejected" | "reviewed",
        candidateId: string
    ) => {
        try {
            const updateRes = await updateStatusByHr(applyJobId, newStatus);
            // Chỉ gửi notification nếu cập nhật trạng thái thành công
            if (newStatus === 'approved' && candidateId && updateRes) {
                // Lấy thông tin ứng viên và vị trí ứng tuyển
                const app = applications.find(a => a._id === applyJobId);
                const candidateName = app?.cvId?.content?.userData?.firstName && app?.cvId?.content?.userData?.lastName
                    ? `${app.cvId.content.userData.firstName} ${app.cvId.content.userData.lastName}`
                    : app?.userId?.first_name && app?.userId?.last_name
                        ? `${app.userId.first_name} ${app.userId.last_name}`
                        : 'Ứng viên';
                const jobTitle = app?.jobId?.title || app?.jobId?.["Job Title"] || 'N/A';
                const jobrole = app?.jobId?.role || app?.jobId?.Role || '';
                // --- Lấy thông tin HR ---
                let hrEmail = '';
                let hrPhone = '';
                let hrUserId = app?.jobId?.user_id;
                if (hrUserId && typeof hrUserId === 'object' && (hrUserId as any).$oid) hrUserId = (hrUserId as any).$oid;
                try {
                    if (hrUserId) {
                        const hrUser = await getUserById(hrUserId);
                        hrPhone = hrUser?.phone || '';
                        // Không lấy email nữa
                    }
                } catch (e) { /* fallback giữ trống */ }
                // --- End lấy thông tin HR ---
                const message = `Chúc mừng bạn, ${candidateName}, hồ sơ của bạn cho vị trí ${jobrole} của công việc ${jobTitle} đã được chấp nhận!`;
                const notifData = {
                    title: 'Application Approved',
                    message,
                    type: 'info',
                    link: '', // sẽ update sau khi tạo notification
                    recipient: candidateId,
                    candidateName,
                    jobTitle,
                    hrEmail,
                    hrPhone,
                    jobId: app?.jobId?._id || app?.jobId,
                };
                const notifRes = await sendNotification(notifData);
            }
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

    const handleDeleteApplyJob = async (applyJobId: string) => {
        try {
            await deleteApplyJobByHR(applyJobId);
            getApplyJobByHR().then((data: any) => {
                let arr = Array.isArray(data)
                    ? data
                    : data && data.data
                        ? data.data
                        : [];
                setApplications(arr);
            });
        } catch (error) {
            alert("Xóa ứng viên thất bại!");
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
                handleDeleteApplyJob={handleDeleteApplyJob}
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
