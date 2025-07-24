import React from "react";
import "@/styles/chatButton.css";
import ChatButton from "@/components/ui/chatButton";

interface NotificationCardProps {
  notif: any;
  isUnread: boolean;
  isActive?: boolean;
  onClick: () => void;
  t: any;
  detailInfo?: any;
  onDelete?: () => void;
  jobId?: string;
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
  console.log(notif);

  return (
    <div
      className={
        [
          "group p-5 transition-all duration-200 cursor-pointer",
          isActive
            ? "border-l-4 border-l-blue-500"
            : "border-l-4 border-l-gray-200",
          "hover:bg-gray-50 hover:shadow-sm",
          "rounded-xl bg-white shadow-sm flex items-stretch",
        ].join(" ") +
        " max-w-6xl mx-auto px-8 text-base min-h-[140px] h-[140px]"
      }
      style={{
        display: "flex",
        alignItems: "stretch",
        height: "140px",
        minHeight: "150px",
        position: "relative",
      }}
      onClick={onClick}
    >
      {/* Nút xóa ở góc trên bên phải */}
      {onDelete && (
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10 bg-white rounded-full p-1 shadow"
          title={t.dismiss}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <div className="flex items-start gap-6 w-full h-full">
        <div className="flex-shrink-0 mt-1 text-2xl">
          {(!notif.type || notif.type === "info") && (
            <span className="text-blue-500">ℹ</span>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4
                    className={[
                      "text-base font-bold text-gray-900",
                      isUnread ? "font-extrabold" : "",
                    ].join(" ")}
                  >
                    {notif.title || t.applicationApproved}
                  </h4>
                  <span
                    className={[
                      "text-sm px-2 py-1 rounded",
                      notif.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "",
                      notif.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "",
                      notif.type === "error" ? "bg-red-100 text-red-800" : "",
                      !notif.type || notif.type === "info"
                        ? "bg-blue-100 text-blue-800"
                        : "",
                    ].join(" ")}
                  >
                    {notif.type}
                  </span>
                  {notif.category && (
                    <span className="text-xs border border-gray-200 rounded px-2 py-1 flex items-center gap-1">
                      <svg
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {notif.category}
                    </span>
                  )}
                  {isUnread && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1 leading-relaxed line-clamp-2 min-h-[40px]">
                  <span className="text-xs text-blue-700">{notif.message}</span>
                </p>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"
                      />
                    </svg>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                  {notif.type === "info" && (
                    <ChatButton
                      participantId={detailInfo?.hrUserId || ""}
                      buttonText={t.chatButtonText}
                    />
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
