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

export default function NotificationCenterClient() {
  const { user } = useAuth();
  const { notifications, setNotifications, socket, setIsViewingNotifications, unreadNotifications } = useSocket(); // Dùng từ SocketProvider
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
    },
    vi: {
      title: "Thông báo",
      noNotifications: "Chưa có thông báo nào.",
      markAllAsRead: "Đánh dấu tất cả đã đọc",
      clearAll: "Xóa tất cả",
      totalLabel: "Tổng cộng {total} thông báo",
      unreadLabel: "chưa đọc",
    },
  }[language];

  const total = notifications.length;
  const unread = notifications.filter((n: any) => !n.isRead).length;

  // 🔥 Set flag + emit when entering notification center
  // ✅ CHỈNH SỬA: SocketProvider sẽ handle emit, không emit ở đây
  useEffect(() => {
    if (!socket || !user) return;

    // 🧠 TELL PROVIDER: User is viewing notifications
    // SocketProvider sẽ tự động emit readConversation khi isViewingNotifications = true
    setIsViewingNotifications(true);

    console.log("📱 Entering notification center - flag set, SocketProvider will handle emit");

    // 🧠 CLEANUP: User left notification page
    return () => {
      setIsViewingNotifications(false);
    };
  }, [socket, user, setIsViewingNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      // 🔥 Emit socket event để broadcast cho tất cả tabs + devices
      // 📌 Event name PHẢI khớp: notification:read:all
      socket?.emit("notification:read:all", {
        userId: user?._id,
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleOpenModal = async (notif: any) => {
    setModalNotification(notif);
    setModalOpen(true);
    setLastActiveId(notif._id);

    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        // 🧠 Emit event name chuẩn: notification:read:one
        socket?.emit("notification:read:one", {
          notificationId: notif._id,
          userId: user?._id,
        });
      } catch { }
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
                    } catch { }
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
