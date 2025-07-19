import { Bell, CheckCheck, Trash2 } from "lucide-react";

interface NotificationHeaderProps {
    total: number;
    unread: number;
    handleMarkAllAsRead: () => void;
    handleClearAll: () => void;
    t: any;
}

const NotificationHeader: React.FC<NotificationHeaderProps> = ({ total, unread, handleMarkAllAsRead, handleClearAll, t }) => (
    <div className="bg-white border-b border-gray-200 p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Bell className="h-8 w-8 text-blue-600" />
                    {unread > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                            {unread > 99 ? "99+" : unread}
                        </span>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {total > 0 ? (
                            <>
                                {t.totalLabel.replace('{total}', total)}
                                {unread > 0 && (
                                    <>
                                        , <span className="font-medium text-blue-600">{unread}</span> {t.unreadLabel}
                                    </>
                                )}
                            </>
                        ) : (
                            t.noNotifications
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {unread > 0 && (
                    <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium">
                        <CheckCheck className="h-4 w-4" /> {t.markAllAsRead}
                    </button>
                )}
                {total > 0 && (
                    <button onClick={handleClearAll} className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-red-50 text-red-600 text-sm font-medium">
                        <Trash2 className="h-4 w-4" /> {t.clearAll}
                    </button>
                )}
            </div>
        </div>
    </div>
);

export default NotificationHeader; 