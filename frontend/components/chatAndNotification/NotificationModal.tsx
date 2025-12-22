import React, { useEffect } from "react";
import { Modal } from "antd";
import ChatButton from "@/components/ui/chatButton";
import { Button } from "@/components/ui/button";
import "@/styles/chatButton.css";

interface NotificationModalProps {
  open: boolean;
  onCancel: () => void;
  modalNotification: any;
  detailInfo: any;
  t: any;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onCancel,
  modalNotification,
  detailInfo,
  t,
}) => {
  useEffect(() => {
    if (modalNotification) {
    }
  }, [modalNotification, detailInfo]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={modalNotification?.title || t.applicationApproved}
      width={700}
    >
      <div className="mb-6 text-gray-800 whitespace-pre-line text-lg font-medium leading-relaxed">
        {modalNotification?.message || t.na}
      </div>

      <div className="mt-2 text-base text-gray-700 space-y-2">
        <div>
          <span className="font-semibold">{t.jobTitle}:</span>{" "}
          {detailInfo?.title || t.na}
        </div>
        <div>
          <span className="font-semibold">{t.position}:</span>{" "}
          {detailInfo?.role || t.na}
        </div>
        <div>
          <span className="font-semibold">{t.location}:</span>{" "}
          {detailInfo?.location || t.na}
        </div>
        <div>
          <span className="font-semibold">{t.contact}:</span>{" "}
          {detailInfo?.hrPhone || t.na}
        </div>
        <div>
          <span className="font-semibold">{t.sentAt}:</span>{" "}
          {modalNotification &&
            new Date(modalNotification.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-2 items-center flex-wrap">
        {modalNotification?.type === "info" && detailInfo?.hrUserId && (
          <ChatButton
            participantId={detailInfo.hrUserId}
            buttonText={t.chatButtonText}
          />
        )}
        {detailInfo?._id && (
          <div className="bg-gradient-to-b from-cyan-400/60 to-cyan-500/40 p-[3px] rounded-[14px]">
            <button
              onClick={() => {
                window.open(`/jobPage/${detailInfo._id}`, "_blank");
              }}
              className="group p-[3px] rounded-[11px] bg-gradient-to-b from-cyan-500 to-cyan-600 shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:shadow-[0_0px_1px_rgba(0,0,0,0.5)] active:scale-[0.995] transition-transform"
            >
              <div className="bg-gradient-to-b from-cyan-500 to-cyan-600 rounded-[7px] px-3 py-1.5">
                <span className="font-semibold text-xs text-white">
                  {t.jobDetail}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 text-xs text-gray-400">
        {modalNotification &&
          new Date(modalNotification.createdAt).toLocaleString()}
      </div>
    </Modal>
  );
};

export default NotificationModal;
