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
        <p className="text-gray-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif, idx) => (
            <li key={notif._id}>
              <div
                role="alert"
                className="mx-auto max-w-lg rounded-lg border border-stone bg-stone-100 p-4 shadow-lg sm:p-6 lg:p-8 mb-4"
              >
                <div className="flex items-center gap-4">
                  <span className="shrink-0 rounded-full bg-emerald-400 p-2 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <p className="font-medium sm:text-lg text-emerald-600">{notif.title || 'New notification!'}</p>
                </div>
                <p className="mt-4 text-gray-600">{notif.message}</p>
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  <div><span className="font-semibold">Vị trí ứng tuyển:</span> {(notif as any).jobTitle || (notif as any).position || 'N/A'}</div>
                  <div><span className="font-semibold">Tên ứng viên:</span> {(notif as any).candidateName || (notif as any).applicantName || 'N/A'}</div>
                  <div><span className="font-semibold">Liên hệ phụ trách:</span> {(notif as any).hrContact || (notif as any).hrEmail || (notif as any).hrPhone || 'N/A'}</div>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  If you accept the interview, please contact HR using the button below.
                </div>
                {((notif as any).hrEmail || (notif as any).hrPhone) && (
                  <div className="mt-2">
                    {(notif as any).hrEmail && (
                      <a
                        href={`mailto:${(notif as any).hrEmail}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Contact HR via Email
                      </a>
                    )}
                    {(notif as any).hrPhone && (
                      <a
                        href={`tel:${(notif as any).hrPhone}`}
                        className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition ml-2"
                      >
                        Call HR
                      </a>
                    )}
                  </div>
                )}
                <div className="mt-6 sm:flex sm:gap-4">
                  {notif.link && (
                    <a
                      href={notif.link}
                      className="inline-block w-full rounded-lg bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
                    >
                      View
                    </a>
                  )}
                  <button
                    className="mt-2 inline-block w-full rounded-lg bg-stone-300 px-5 py-3 text-center text-sm font-semibold text-gray-800 sm:mt-0 sm:w-auto"
                    onClick={() => {
                      // Ẩn notification ở FE (không xóa DB)
                      setNotifications((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
