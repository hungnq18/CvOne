"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/providers/SocketProvider";

const IconChatAndNotification: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  // 🔥 Lấy realtime từ SocketProvider
  const { unreadCount, unreadNotifications } = useSocket();

  if (!user || pathname === "/chat" || pathname === "/notifications")
    return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* NOTIFICATIONS */}
      <Link
        href="/notifications"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
      >
        <svg
          className="w-6 h-6 text-white transition-transform group-hover:scale-110"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadNotifications > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[1.2em] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </div>
        )}
      </Link>

      {/* CHAT ICON */}
      <Link
        href="/chat"
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
      >
        <svg
          className="w-6 h-6 text-white transition-transform group-hover:scale-110"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[1.2em] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </Link>
    </div>
  );
};

export default IconChatAndNotification;
