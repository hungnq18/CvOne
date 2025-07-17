import { fetchWithAuth } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    try {
        const res = await fetchWithAuth(API_ENDPOINTS.NOTIFICATION.GET_NOTIFICATIONS);
        // Nếu backend trả về { data: [...] }
        if (res && Array.isArray(res.data)) return res.data;
        // Nếu trả về mảng trực tiếp
        if (Array.isArray(res)) return res;
        return [];
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return [];
    }
};

export const sendNotification = async (data: { title: string; message: string; type: string; link?: string }) => {
    try {
        return await fetchWithAuth(API_ENDPOINTS.NOTIFICATION.GET_NOTIFICATIONS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    } catch (err) {
        console.error('Failed to send notification:', err);
        throw err;
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const res = await fetchWithAuth('/notifications/read-all', {
            method: 'PATCH',
        });
        return res;
    } catch (err) {
        console.error('Failed to mark all notifications as read:', err);
        throw err;
    }
};

