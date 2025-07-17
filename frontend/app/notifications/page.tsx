"use client";

import { useEffect, useState } from "react";
import { getUserIdFromToken } from "@/api/userApi";
import { getNotifications, Notification, markAllNotificationsAsRead } from "@/api/apiNotification";
import socket from "@/utils/socket/client";

import { getApplyJobByUser } from "@/api/apiApplyJob";
import { getJobById } from "@/api/jobApi";
import { getCVById } from "@/api/cvapi";
import { useLanguage } from '@/providers/global-provider';
import NotificationHeader from "@/components/chatAndNotification/NotificationHeader";
import NotificationCard from "@/components/chatAndNotification/NotificationCard";
import NotificationModal from "@/components/chatAndNotification/NotificationModal";
import { Pagination } from 'antd';

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
    congratulation: (name: string, job: string, pos: string, loc: string) =>
      `Congratulations ${name}, your application for the job ${job} (position: ${pos}) in ${loc} has been approved!`,
    contactInstruction: "If you accept the interview, please contact HR using the email above or via chat (within 5 days).",
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
    congratulation: (name: string, job: string, pos: string, loc: string) =>
      `Chúc mừng ${name}, hồ sơ của bạn cho công việc ${job} vị trí ${pos} ở ${loc} đã được chấp nhận!`,
    contactInstruction: "Nếu bạn đồng ý phỏng vấn, vui lòng liên hệ HR qua email hoặc chat (trong vòng 5 ngày).",
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
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNotification, setModalNotification] = useState<Notification | null>(null);
  const [detailInfo, setDetailInfo] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<{ [id: string]: any }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [lastActiveId, setLastActiveId] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = notificationTranslations[language];

  // Tính toán số lượng
  const total = notifications.length;
  const unread = notifications.filter((n: any) => !n.isRead).length;

  // Handler cho các nút
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };
  const handleClearAll = () => {
    setNotifications([]);
  };

  async function handleOpenModal(notif: Notification) {
    setModalNotification(notif);
    setModalOpen(true);
    setLastActiveId(notif._id);
    if ((notif as any).jobTitle && (notif as any).candidateName && (notif as any).position && (notif as any).location && (notif as any).hrEmail) {
      setDetailInfo(null);
      return;
    }
    try {
      let applyList = await getApplyJobByUser();
      let applyArr = Array.isArray(applyList) ? applyList : (applyList?.data ? applyList.data : []);
      let apply = applyArr.find((a: any) => a.status === 'approved') || applyArr[0];
      if (!apply) { setDetailInfo(null); return; }
      let job = apply.jobId || apply.job_id;
      if (typeof job === 'string') {
        job = await getJobById(job);
      }
      let cv = apply.cvId || apply.cv_id;
      if (typeof cv === 'string') {
        cv = await getCVById(cv);
      }
      setDetailInfo({
        jobTitle: job?.title || job?.["Job Title"] || 'N/A',
        position: job?.role || job?.Role || 'N/A',
        location: job?.location || job?.Location || 'N/A',
        hrEmail: job?.hrEmail || job?.hr_contact || job?.email || '',
        candidateName: cv?.content?.userData?.firstName && cv?.content?.userData?.lastName
          ? `${cv.content.userData.firstName} ${cv.content.userData.lastName}`
          : 'Ứng viên',
      });
      setNotificationDetails(prev => ({
        ...prev,
        [notif._id]: {
          jobTitle: job?.title || job?.["Job Title"] || '',
          position: job?.role || job?.Role || '',
          location: job?.location || job?.Location || '',
          candidateName: cv?.content?.userData?.firstName && cv?.content?.userData?.lastName
            ? `${cv.content.userData.firstName} ${cv.content.userData.lastName}`
            : '',
        }
      }));
    } catch (e) {
      setDetailInfo(null);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setModalNotification(null);
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Gọi API đánh dấu tất cả là đã đọc
        await markAllNotificationsAsRead();
        // Sau đó lấy danh sách notification mới nhất
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
      if ((notif as any).jobTitle && (notif as any).candidateName && (notif as any).position && (notif as any).location) return;
      if (notificationDetails[notif._id]) return;
      try {
        let applyList = await getApplyJobByUser();
        let applyArr = Array.isArray(applyList) ? applyList : (applyList?.data ? applyList.data : []);
        let apply = applyArr.find((a: any) => a.status === 'approved') || applyArr[0];
        if (!apply) return;
        let job = apply.jobId || apply.job_id;
        if (typeof job === 'string') job = await getJobById(job);
        let cv = apply.cvId || apply.cv_id;
        if (typeof cv === 'string') cv = await getCVById(cv);
        setNotificationDetails(prev => ({
          ...prev,
          [notif._id]: {
            jobTitle: job?.title || job?.["Job Title"] || '',
            position: job?.role || job?.Role || '',
            location: job?.location || job?.Location || '',
            candidateName: cv?.content?.userData?.firstName && cv?.content?.userData?.lastName
              ? `${cv.content.userData.firstName} ${cv.content.userData.lastName}`
              : '',
          }
        }));
      } catch { }
    });
  }, [notifications]);

  return (
    <div className="container mx-auto max-w-6xl p-4 mt-14">
      {/* HEADER */}
      <NotificationHeader
        total={total}
        unread={unread}
        handleMarkAllAsRead={handleMarkAllAsRead}
        handleClearAll={handleClearAll}
        t={t}
      />
      {/* DANH SÁCH THÔNG BÁO */}
      {loading ? (
        <p className="text-gray-500">{t.loading}</p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noNotifications}</h3>
          <p className="text-gray-500 max-w-sm">
            {t.noNotifications}
          </p>
        </div>
      ) : (
        <div className="bg-white">
          <div className="divide-y ">
            {notifications.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((notif, idx) => {
              const isUnread = !(notif as any).isRead;
              const isActive = lastActiveId === notif._id;
              // Lấy detailInfo nếu có
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
                onChange={page => setCurrentPage(page)}
                showSizeChanger={false}
              />
            )}
          </div>
        </div>
      )}
      {/* Modal giữ nguyên */}
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