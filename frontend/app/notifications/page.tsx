"use client";

import { useEffect, useState } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import { getNotifications, Notification } from "@/api/apiNotification";
import socket from "@/utils/socket/client";


export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.log("📡 Received new notification:", newNotif);
        setNotifications((prev) => [newNotif, ...prev]);
      };

      socket.on("newNotification", handleNewNotification);

      return () => {
        socket.emit("leaveNotificationRoom", userId);
        socket.off("newNotification", handleNewNotification);
      };
    }
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔔 Danh sách thông báo</h2>

      {loading ? (
        <p className="text-gray-500">Đang tải thông báo...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">Chưa có thông báo nào.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className="p-4 border border-gray-200 rounded shadow-sm bg-white hover:bg-gray-50 transition"
            >
              <h3 className="font-semibold text-lg">{notif.title}</h3>
              <p className="text-sm text-gray-600">{notif.message}</p>
              {notif.link && (
                <a
                  href={notif.link}
                  className="text-blue-600 text-sm mt-1 inline-block"
                >
                  → Xem chi tiết
                </a>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
