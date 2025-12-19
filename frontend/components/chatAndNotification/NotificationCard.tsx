import React from "react";
import ChatButton from "@/components/ui/chatButton";
import "@/styles/chatButton.css";
interface NotificationCardProps {
  notif: any;
  isUnread: boolean;
  isActive?: boolean;
  onClick: () => void;
  t: any;
  detailInfo?: any;
  onDelete?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notif,
  isUnread,
  isActive,
  onClick,
  t,
  detailInfo,
  onDelete,
}) => {
  return (
    <div
      className={[
        "group p-5 transition-all duration-200 cursor-pointer rounded-xl bg-white shadow-sm flex items-stretch max-w-6xl mx-auto px-8",
        isActive ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-gray-200",
        "hover:bg-gray-50 hover:shadow-sm"
      ].join(" ")}
      style={{ minHeight: "150px", position: "relative" }}
      onClick={onClick}
    >
      {onDelete && (
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10 bg-white rounded-full p-1 shadow"
          title={t.dismiss}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-6 w-full h-full">
        <div className="flex-shrink-0 mt-1 text-2xl">
          {(!notif.type || notif.type === "info") && <span className="text-blue-500">ℹ</span>}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className={`text-base text-gray-900 ${isUnread ? "font-extrabold" : "font-bold"}`}>
                    {notif.title || t.applicationApproved}
                  </h4>
                  {isUnread && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
                </div>

                <p className="text-sm text-gray-700 mb-1 leading-relaxed line-clamp-2 min-h-[40px]">
                  <span className="text-xs text-blue-700">{notif.message}</span>
                </p>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>

                  {notif.type === "info" && detailInfo?.hrUserId && (
                    <ChatButton participantId={detailInfo?.hrUserId || ""} buttonText={t.chatButtonText} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
