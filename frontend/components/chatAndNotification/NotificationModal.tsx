import React from "react";
import { Modal } from "antd";
import ChatButton from "@/components/ui/chatButton";
import { getUserById } from "@/api/userApi";

interface NotificationModalProps {
    open: boolean;
    onCancel: () => void;
    modalNotification: any;
    detailInfo: any;
    t: any;
    jobId?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ open, onCancel, modalNotification, detailInfo, t, jobId }) => (
    <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        title={
            (modalNotification?.title === t.applicationApproved || modalNotification?.title === 'Hồ sơ được duyệt')
                ? t.applicationApproved
                : modalNotification?.title || t.applicationApproved
        }
        width={700}
    >
        <div className="mb-6 text-gray-800 whitespace-pre-line text-lg font-medium leading-relaxed">
            {(modalNotification?.type === "success" || modalNotification?.title === t.applicationApproved || modalNotification?.title === "Application Approved" || modalNotification?.title === "Hồ sơ được duyệt")
                ? t.congratulation(
                    detailInfo?.candidateName || modalNotification?.candidateName || "Ứng viên",
                    detailInfo?.jobTitle || modalNotification?.jobTitle || "",
                    detailInfo?.position || modalNotification?.position || "",
                    detailInfo?.location || modalNotification?.location || ""
                )
                : t.noNotifications
            }
        </div>
        <div className="mt-2 text-base text-gray-700 space-y-2">
            <div><span className="font-semibold">{t.jobTitle}:</span> {detailInfo?.jobTitle || modalNotification?.jobTitle || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.position}:</span> {detailInfo?.position || modalNotification?.position || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.location}:</span> {detailInfo?.location || modalNotification?.location || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.contact}</span> {detailInfo?.hrPhone || t.na}</div>
            <div><span className="font-semibold">{t.sentAt}:</span> {modalNotification && new Date(modalNotification.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex justify-center mt-6 gap-2 items-center">
            <span className="text-xs text-blue-700">{t.contactInstruction}</span>
            <ChatButton
                participantId={detailInfo?.hrUserId || ""}
                buttonText={t.chatButtonText}
            />
        </div>
        <div className="mt-8 text-xs text-gray-400">
            {modalNotification && new Date(modalNotification.createdAt).toLocaleString()}
        </div>
    </Modal>
);

export default NotificationModal;