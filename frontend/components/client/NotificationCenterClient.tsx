"use client";

import { getApplyJobByUser } from "@/api/apiApplyJob";
import {
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    Notification as NotificationBase,
} from "@/api/apiNotification";
import { getCVById } from "@/api/cvapi";
import { getJobById } from "@/api/jobApi";
import { getUserIdFromToken } from "@/api/userApi";
import NotificationCard from "@/components/chatAndNotification/NotificationCard";
import NotificationHeader from "@/components/chatAndNotification/NotificationHeader";
import NotificationModal from "@/components/chatAndNotification/NotificationModal";
import { useLanguage } from "@/providers/global_provider";
import socket from "@/utils/socket/client";
import { Pagination } from "antd";
import { useEffect, useState } from "react";

type Notification = NotificationBase & { isRead?: boolean };

const notificationTranslations = {
    en: {
        title: "Notifications",
        noNotifications: "No notifications yet.",
        loading: "Loading notifications...",
        view: "View",
        dismiss: "Dismiss",
        jobTitle: "Job Title",
        position: "Position",
        location: "Location",
        candidateName: "Candidate Name",
        contact: "Contact",
        sentAt: "Sent At",
        status: "Status",
        note: "Note",
        applicationApproved: "Application Approved",
        congratulation: (jobTitle: string, jobRole: string, jobLocation: string) =>
            `Your application for the position ${jobRole} at ${jobTitle} in ${jobLocation} has been approved!`,
        jobExpiredNotification: (jobTitle: string) =>
            `The job ${jobTitle} is about to expire.`,
        contactInstruction:
            "If you accept the interview, please contact HR using the email above or via chat (within 5 days).",
        statusSuccess: "Success",
        statusWarning: "Warning",
        statusError: "Error",
        statusInfo: "Info",
        chatButtonText: "Chat",
        na: "N/A",
        totalLabel: "Total {total} notifications",
        unreadLabel: "unread",
        notifications: "notifications",
        markAllAsRead: "Mark all as read",
        clearAll: "Clear all",
    },
    vi: {
        title: "Thông báo",
        noNotifications: "Chưa có thông báo nào.",
        loading: "Đang tải thông báo...",
        view: "Xem",
        dismiss: "Ẩn",
        jobTitle: "Tên công việc",
        position: "Vị trí",
        location: "Địa điểm",
        candidateName: "Tên ứng viên",
        contact: "Liên hệ phụ trách",
        sentAt: "Thời gian gửi",
        status: "Trạng thái",
        note: "Ghi chú",
        applicationApproved: "Hồ sơ được duyệt",
        congratulation: (jobTitle: string, jobRole: string, jobLocation: string) =>
            `Hồ sơ của bạn cho vị trí ${jobRole} của công việc ${jobTitle} tại ${jobLocation} đã được chấp nhận!`,
        jobExpiredNotification: (jobTitle: string) =>
            `Công việc ${jobTitle} sẽ sắp hết hạn.`,
        contactInstruction:
            "Nếu bạn đồng ý phỏng vấn, vui lòng liên hệ HR qua email hoặc chat (trong vòng 5 ngày).",
        statusSuccess: "Thành công",
        statusWarning: "Cảnh báo",
        statusError: "Lỗi",
        statusInfo: "Thông tin",
        chatButtonText: "Liên Hệ",
        na: "Không có",
        totalLabel: "Tổng {total} thông báo",
        unreadLabel: "chưa đọc",
        notifications: "thông báo",
        markAllAsRead: "Đánh dấu tất cả đã đọc",
        clearAll: "Xóa tất cả",
    },
};

export default function NotificationCenterClient() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalNotification, setModalNotification] =
        useState<Notification | null>(null);
    const [detailInfo, setDetailInfo] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [notificationDetails, setNotificationDetails] = useState<{
        [id: string]: any;
    }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8;
    const [lastActiveId, setLastActiveId] = useState<string | null>(null);
    const { language } = useLanguage();
    const t = notificationTranslations[language];

    const total = notifications.length;
    const unread = notifications.filter((n: any) => !n.isRead).length;

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            const res = await getNotifications();
            setNotifications(res);
        } catch (err) { }
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    async function handleOpenModal(notif: Notification) {
        setModalNotification(notif);
        setModalOpen(true);
        setLastActiveId(notif._id);

        if (!notif.isRead) {
            try {
                await markNotificationAsRead(notif._id);
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
                );
            } catch (err) { }
        }

        if ((notif as any).jobId) {
            try {
                const job = await getJobById((notif as any).jobId);
                if (!job) {
                    setDetailInfo(null);
                    return;
                }
                const jobAny = job as any;
                const hrUserId =
                    typeof jobAny.user_id === "object" && jobAny.user_id?.$oid
                        ? jobAny.user_id.$oid
                        : jobAny.user_id || "";
                let hrPhone = "";
                if (hrUserId) {
                    try {
                        const hrUser = await import("@/api/userApi").then((mod) =>
                            mod.getUserById(hrUserId)
                        );
                        hrPhone = hrUser?.phone ? String(hrUser.phone) : "";
                    } catch { }
                }
                setDetailInfo({
                    jobTitle: job.title || jobAny["Job Title"] || "N/A",
                    position: job.role || jobAny["Role"] || "N/A",
                    location: job.location || jobAny["Location"] || "N/A",
                    hrEmail: jobAny.hrEmail || jobAny.hr_contact || jobAny.email || "",
                    hrUserId,
                    hrPhone,
                    candidateName: (notif as any).candidateName || "Ứng viên",
                    jobId: (notif as any).jobId,
                });
                return;
            } catch (e) {
                setDetailInfo(null);
                return;
            }
        }

        try {
            let applyList = await getApplyJobByUser();
            let applyArr = Array.isArray(applyList)
                ? applyList
                : applyList?.data
                    ? applyList.data
                    : [];
            let apply =
                applyArr.find((a: any) => a.status === "approved") || applyArr[0];
            if (!apply) {
                setDetailInfo(null);
                return;
            }
            let job = apply.jobId || apply.job_id;
            if (typeof job === "string") {
                job = await getJobById(job);
            }
            let cv = apply.cvId || apply.cv_id;
            if (typeof cv === "string") {
                cv = await getCVById(cv);
            }
            const hrUserId =
                typeof job?.user_id === "object" && job?.user_id?.$oid
                    ? job.user_id.$oid
                    : job?.user_id || "";
            const newDetailInfo = {
                jobTitle: job?.title || job?.["Job Title"] || "N/A",
                position: job?.role || job?.Role || "N/A",
                location: job?.location || job?.Location || "N/A",
                hrEmail: job?.hrEmail || job?.hr_contact || job?.email || "",
                hrUserId,
                candidateName:
                    cv?.content?.userData?.firstName && cv?.content?.userData?.lastName
                        ? `${cv.content.userData.firstName} ${cv.content.userData.lastName}`
                        : "Ứng viên",
            };
            setDetailInfo(newDetailInfo);
            setNotificationDetails((prev) => ({
                ...prev,
                [notif._id]: {
                    jobTitle: newDetailInfo.jobTitle,
                    position: newDetailInfo.position,
                    location: newDetailInfo.location,
                    candidateName: newDetailInfo.candidateName,
                    hrUserId: newDetailInfo.hrUserId,
                },
            }));
        } catch (e) {
            setDetailInfo(null);
        }
    }

    function handleCloseModal() {
        setModalOpen(false);
        setModalNotification(null);
        setDetailInfo(null);
    }

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await getNotifications();
                setNotifications(res);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        const userId = getUserIdFromToken();
        if (userId) {
            socket.emit("joinNotificationRoom", userId);

            const handleNewNotification = (newNotif: Notification) => {
                setNotifications((prev) => [newNotif, ...prev]);
            };

            socket.on("newNotification", handleNewNotification);

            return () => {
                socket.emit("leaveNotificationRoom", userId);
                socket.off("newNotification", handleNewNotification);
            };
        }
    }, []);

    useEffect(() => {
        if (!notifications.length) return;
        notifications.forEach(async (notif) => {
            if (notificationDetails[notif._id]) return;
            if ((notif as any).jobId) {
                try {
                    const job = await getJobById((notif as any).jobId);
                    if (!job) return;
                    const jobAny = job as any;
                    const hrUserId =
                        typeof jobAny.user_id === "object" && jobAny.user_id?.$oid
                            ? jobAny.user_id.$oid
                            : jobAny.user_id || "";
                    let hrPhone = "";
                    if (hrUserId) {
                        try {
                            const hrUser = await import("@/api/userApi").then((mod) =>
                                mod.getUserById(hrUserId)
                            );
                            hrPhone = hrUser?.phone ? String(hrUser.phone) : "";
                        } catch { }
                    }
                    setNotificationDetails((prev) => ({
                        ...prev,
                        [notif._id]: {
                            jobTitle: job.title || jobAny["Job Title"] || "",
                            position: job.role || jobAny["Role"] || "",
                            location: job.location || jobAny["Location"] || "",
                            hrEmail:
                                jobAny.hrEmail || jobAny.hr_contact || jobAny.email || "",
                            hrUserId,
                            hrPhone,
                        },
                    }));
                } catch { }
                return;
            }
            try {
                let applyList = await getApplyJobByUser();
                let applyArr = Array.isArray(applyList)
                    ? applyList
                    : applyList?.data
                        ? applyList.data
                        : [];
                let apply =
                    applyArr.find((a: any) => a.status === "approved") || applyArr[0];
                if (!apply) return;
                let job = apply.jobId || apply.job_id;
                if (typeof job === "string") job = await getJobById(job);
                let cv = apply.cvId || apply.cv_id;
                if (typeof cv === "string") cv = await getCVById(cv);
                setNotificationDetails((prev) => ({
                    ...prev,
                    [notif._id]: {
                        jobTitle: job?.title || job?.["Job Title"] || "",
                        position: job?.role || job?.Role || "",
                        location: job?.location || job?.Location || "",
                        candidateName:
                            cv?.content?.userData?.firstName &&
                                cv?.content?.userData?.lastName
                                ? `${cv.content.userData.firstName} ${cv.content.userData.lastName}`
                                : "",
                        hrUserId:
                            typeof job?.user_id === "object" && job?.user_id?.$oid
                                ? job.user_id.$oid
                                : job?.user_id || "",
                    },
                }));
            } catch { }
        });
    }, [notifications]);

    return (
        <div className="container mx-auto max-w-6xl p-4 mt-14">
            <NotificationHeader
                total={total}
                unread={unread}
                handleMarkAllAsRead={handleMarkAllAsRead}
                handleClearAll={handleClearAll}
                t={t}
            />
            {loading ? (
                <p className="text-gray-500">{t.loading}</p>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                        <svg
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t.noNotifications}
                    </h3>
                    <p className="text-gray-500 max-w-sm">{t.noNotifications}</p>
                </div>
            ) : (
                <div className="bg-white">
                    <div className="divide-y">
                        {notifications
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((notif) => {
                                const isUnread = !(notif as any).isRead;
                                const isActive = lastActiveId === notif._id;
                                const detail = notificationDetails[notif._id] || null;
                                return (
                                    <NotificationCard
                                        key={notif._id}
                                        notif={notif}
                                        isUnread={isUnread}
                                        isActive={isActive}
                                        onClick={() => handleOpenModal(notif)}
                                        t={t}
                                        detailInfo={detail}
                                        onDelete={async () => {
                                            try {
                                                await deleteNotification(notif._id);
                                                setNotifications((prev) =>
                                                    prev.filter((n) => n._id !== notif._id)
                                                );
                                            } catch (err) { }
                                        }}
                                    />
                                );
                            })}
                    </div>
                    <div className="flex justify-center mt-8">
                        {notifications.length > pageSize && (
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={notifications.length}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                            />
                        )}
                    </div>
                </div>
            )}
            <NotificationModal
                open={modalOpen}
                onCancel={handleCloseModal}
                modalNotification={modalNotification}
                detailInfo={detailInfo}
                t={t}
            />
        </div>
    );
}
