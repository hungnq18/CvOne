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
        <div className="flex justify-center mt-6 gap-2 items-center">
            <span className="text-xs text-blue-700">{t.contactInstruction}</span>
            <button className="Btn ml-2" title="Chat qua Whatsapp">
                <div className="sign">
                    <svg className="socialSvg whatsappSvg" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                    </svg>
                </div>
                <div className="text text-xs" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{t.chatButtonText}</div>
            </button>
        </div>
        <div className="mt-8 text-xs text-gray-400">
            {modalNotification && new Date(modalNotification.createdAt).toLocaleString()}
        </div>
    </Modal>
);

export default NotificationModal; 