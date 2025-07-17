import React from "react";
import { Modal } from "antd";

interface NotificationModalProps {
    open: boolean;
    onCancel: () => void;
    modalNotification: any;
    detailInfo: any;
    t: any;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ open, onCancel, modalNotification, detailInfo, t }) => (
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
                    modalNotification?.candidateName || (detailInfo && detailInfo.candidateName) || "Ứng viên",
                    modalNotification?.jobTitle || (detailInfo && detailInfo.jobTitle) || "",
                    modalNotification?.position || (detailInfo && detailInfo.position) || "",
                    modalNotification?.location || (detailInfo && detailInfo.location) || ""
                )
                : t.noNotifications
            }
        </div>
        <div className="mt-2 text-base text-gray-700 space-y-2">
            <div><span className="font-semibold">{t.jobTitle}:</span> {detailInfo?.jobTitle || modalNotification?.jobTitle || modalNotification?.position || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.position}:</span> {detailInfo?.position || modalNotification?.position || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.location}:</span> {detailInfo?.location || modalNotification?.location || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.candidateName}:</span> {detailInfo?.candidateName || modalNotification?.candidateName || modalNotification?.applicantName || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.contact}:</span> {detailInfo?.hrEmail || modalNotification?.hrContact || modalNotification?.hrEmail || modalNotification?.hrPhone || t.na || 'N/A'}</div>
            <div><span className="font-semibold">{t.sentAt}:</span> {modalNotification && new Date(modalNotification.createdAt).toLocaleString()}</div>
        </div>
        <div className="mt-8 text-xs text-gray-400">
            {modalNotification && new Date(modalNotification.createdAt).toLocaleString()}
        </div>
    </Modal>
);

export default NotificationModal; 