"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import { useAuth } from "@/hooks/use-auth";
import NotificationCard from "@/components/chatAndNotification/NotificationCard";
import NotificationHeader from "@/components/chatAndNotification/NotificationHeader";
import NotificationModal from "@/components/chatAndNotification/NotificationModal";
import { Pagination } from "antd";
import { useLanguage } from "@/providers/global_provider";
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/api/apiNotification";
import { getJobById } from "@/api/jobApi";
import { getUserById } from "@/api/userApi";

export default function NotificationCenterClient() {
  const { user } = useAuth();
  const {
    notifications,
    setNotifications,
    socket,
    setIsViewingNotifications,
    unreadNotifications,
  } = useSocket();
  const [modalNotification, setModalNotification] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [lastActiveId, setLastActiveId] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = {
    en: {
      title: "Notifications",
      noNotifications: "No notifications yet.",
      markAllAsRead: "Mark all as read",
      clearAll: "Clear all",
      totalLabel: "Total {total} notifications",
      unreadLabel: "unread",
      applicationApproved: "Application Approved",
      chatButtonText: "Chat",
      jobTitle: "Job Title",
      position: "Position",
      location: "Location",
      contact: "Contact",
      sentAt: "Sent At",
      contactInstruction: "Click to chat with HR",
      jobDetail: "Job Detail",
      na: "N/A",
      dismiss: "Dismiss",
    },
    vi: {
      title: "Thông báo",
      noNotifications: "Chưa có thông báo nào.",
      markAllAsRead: "Đánh dấu tất cả đã đọc",
      clearAll: "Xóa tất cả",
      totalLabel: "Tổng cộng {total} thông báo",
      unreadLabel: "chưa đọc",
      applicationApproved: "Hồ sơ được duyệt",
      chatButtonText: "Nhắn HR",
      jobTitle: "Tên công việc",
      position: "Vị trí",
      location: "Địa điểm",
      contact: "Liên hệ",
      sentAt: "Gửi lúc",
      contactInstruction: "Nhấn để chat với HR",
      jobDetail: "Chi tiết công việc",
      na: "N/A",
      dismiss: "Đóng",
    },
  }[language];

  const total = notifications.length;
  // Use derived unreadNotifications từ SocketProvider thay vì tính toán lại
  const unread = unreadNotifications;

  useEffect(() => {
    if (!socket || !user) return;
    setIsViewingNotifications(true);

    // ✅ Mark all notifications as read khi user vào trang
    const markAllRead = async () => {
      try {
        await markAllNotificationsAsRead();
        socket?.emit("notification:read:all", { userId: user?._id });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {}
    };

    markAllRead();

    // ✅ Fetch HR info cho tất cả notifications có jobId
    const fetchHRInfo = async () => {
      const currentNotifications = notifications;
      const updated = await Promise.all(
        currentNotifications.map(async (notif) => {
          if (notif.detailInfo?.hrUserId) {
            return notif; // đã có hrUserId rồi
          }

          if (notif.jobId && !notif.detailInfo) {
            try {
              const job = await getJobById(
                typeof notif.jobId === "object" ? notif.jobId._id : notif.jobId
              );
              const hrUserId =
                typeof job?.user_id === "object"
                  ? job.user_id.$oid
                  : job?.user_id;
              if (hrUserId) {
                const hrUser = await getUserById(hrUserId);
                return {
                  ...notif,
                  detailInfo: {
                    ...job,
                    hrUserId,
                    hrPhone: hrUser?.phone || t.na,
                  },
                };
              }
            } catch (err) {}
          }
          return notif;
        })
      );
      setNotifications(updated);
    };

    fetchHRInfo();

    return () => setIsViewingNotifications(false);
  }, [socket, user, setIsViewingNotifications, setNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      socket?.emit("notification:read:all", { userId: user?._id });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleClearAll = () => setNotifications([]);

  const handleOpenModal = async (notif: any) => {
    let detail = notif.detailInfo;

    if (!detail && notif.jobId) {
      try {
        const job = await getJobById(notif.jobId);
        const hrUserId =
          typeof job?.user_id === "object" ? job.user_id.$oid : job?.user_id;
        detail = { ...job, hrUserId };

        // ✅ Fetch HR user info để lấy phone
        if (hrUserId) {
          try {
            const hrUser = await getUserById(hrUserId);
            detail = { ...detail, hrPhone: hrUser?.phone || t.na };
          } catch (err) {
            detail = { ...detail, hrPhone: t.na };
          }
        }
      } catch (err) {}
    }

    setModalNotification({ ...notif, detailInfo: detail });
    setModalOpen(true);
    setLastActiveId(notif._id);

    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalNotification(null);
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 mt-14">
      <NotificationHeader
        total={total}
        unread={unread}
        handleMarkAllAsRead={handleMarkAllAsRead}
        handleClearAll={handleClearAll}
        t={t}
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t.noNotifications}
          </h3>
        </div>
      ) : (
        <div className="bg-white">
          <div className="divide-y">
            {notifications
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((notif) => (
                <NotificationCard
                  key={notif._id}
                  notif={notif}
                  isUnread={!notif.isRead}
                  isActive={lastActiveId === notif._id}
                  onClick={() => handleOpenModal(notif)}
                  t={t}
                  detailInfo={notif.detailInfo}
                  onDelete={async () => {
                    try {
                      await deleteNotification(notif._id);
                      setNotifications((prev) =>
                        prev.filter((n) => n._id !== notif._id)
                      );
                    } catch {}
                  }}
                />
              ))}
          </div>

          {notifications.length > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={notifications.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}

      <NotificationModal
        open={modalOpen}
        onCancel={handleCloseModal}
        modalNotification={modalNotification}
        detailInfo={modalNotification?.detailInfo}
        t={t}
      />
    </div>
  );
}
