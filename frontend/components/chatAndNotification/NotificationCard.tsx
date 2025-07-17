import React from "react";
import "@/styles/chatButton.css";

interface NotificationCardProps {
    notif: any;
    isUnread: boolean;
    isActive?: boolean;
    onClick: () => void;
    t: any;
    detailInfo?: any;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notif, isUnread, isActive, onClick, t, detailInfo }) => (
    <div
        className={[
            "group p-5 transition-all duration-200 cursor-pointer",
            isActive ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-gray-200",
            "hover:bg-gray-50 hover:shadow-sm",
            "rounded-xl bg-white shadow-sm flex items-stretch",
        ].join(" ") + " max-w-6xl mx-auto px-8 text-base min-h-[140px] h-[140px]"}
        style={{ display: 'flex', alignItems: 'stretch', height: '140px', minHeight: '150px' }}
        onClick={onClick}
    >
        <div className="flex items-start gap-6 w-full h-full">
            <div className="flex-shrink-0 mt-1 text-2xl">
                {/* {notif.type === "success" && <span className="text-green-500">✓</span>}
                {notif.type === "warning" && <span className="text-yellow-500">⚠</span>}
                {notif.type === "error" && <span className="text-red-500">✕</span>} */}
                {(!notif.type || notif.type === "info") && <span className="text-blue-500">ℹ</span>}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h4 className={["text-base font-bold text-gray-900", isUnread ? "font-extrabold" : ""].join(" ")}>{notif.title || t.applicationApproved}</h4>
                                <span className={["text-sm px-2 py-1 rounded",
                                    notif.type === "success" ? "bg-green-100 text-green-800" : "",
                                    notif.type === "warning" ? "bg-yellow-100 text-yellow-800" : "",
                                    notif.type === "error" ? "bg-red-100 text-red-800" : "",
                                    (!notif.type || notif.type === "info") ? "bg-blue-100 text-blue-800" : "",
                                ].join(" ")}>{notif.type === "success" ? t.statusSuccess : notif.type === "warning" ? t.statusWarning : notif.type === "error" ? t.statusError : t.statusInfo}</span>
                                {notif.category && (
                                    <span className="text-xs border border-gray-200 rounded px-2 py-1 flex items-center gap-1">
                                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {notif.category}
                                    </span>
                                )}
                                {isUnread && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
                            </div>
                            <p className="text-sm text-gray-700 mb-1 leading-relaxed line-clamp-2 min-h-[40px]">
                                {(notif.type === "success" || notif.title === t.applicationApproved || notif.title === "Application Approved" || notif.title === "Hồ sơ được duyệt")
                                    ? t.congratulation(
                                        notif.candidateName || (detailInfo && detailInfo.candidateName) || "Ứng viên",
                                        notif.jobTitle || (detailInfo && detailInfo.jobTitle) || "",
                                        notif.position || (detailInfo && detailInfo.position) || "",
                                        notif.location || (detailInfo && detailInfo.location) || ""
                                    )
                                    : t.noNotifications
                                }
                            </p>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 4h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
                                    {new Date(notif.createdAt).toLocaleString()}
                                </div>
                                <button className="Btn ml-2" title="Chat qua Whatsapp">
                                    <div className="sign">
                                        <svg className="socialSvg whatsappSvg" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                                        </svg>
                                    </div>
                                    <div className="text text-xs" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{t.chatButtonText}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default NotificationCard; 