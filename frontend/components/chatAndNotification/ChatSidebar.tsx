import { Conversation, Message } from '@/api/apiChat';
import { formatTime } from '@/utils/formatTime';
import { useState } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { useLanguage } from '@/providers/global-provider';

const sidebarTranslations = {
    en: {
        all: 'All',
        unread: 'Unread',
        search: 'Search conversations...',
        noConversations: 'No conversations',
        noUnread: 'No unread conversations',
    },
    vi: {
        all: 'Tất cả',
        unread: 'Chưa đọc',
        search: 'Tìm kiếm hội thoại...',
        noConversations: 'Không có hội thoại',
        noUnread: 'Không có hội thoại chưa đọc',
    },
};

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedConversationId: string | null;
    selectedConversationDetail?: {
        _id: string;
        participants: any[];
        lastMessage: Message | null;
    } | null;
    userId: string | null;
    onSelectConversation: (conversationId: string) => void;
}

export default function ChatSidebar({
    conversations,
    selectedConversationId,
    selectedConversationDetail,
    userId,
    onSelectConversation
}: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { markConversationAsRead } = useChat();
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
    const { language } = useLanguage();
    const t = sidebarTranslations[language] || sidebarTranslations.vi;

    // Lọc danh sách cuộc trò chuyện dựa trên tên người dùng
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const otherUser = conv.otherUser;
        if (!otherUser) return false;

        const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const handleSelectConversation = (conversationId: string) => {
        markConversationAsRead(conversationId);
        onSelectConversation(conversationId);
    };

    // Tách nhóm chưa đọc và đã đọc
    const unreadConversations = filteredConversations.filter(conv => {
        if (!Array.isArray(conv.unreadCount) || !userId) return false;
        const entry = conv.unreadCount.find(u => u.userId === userId);
        return entry && entry.count > 0;
    });
    const readConversations = filteredConversations.filter(conv => {
        if (!Array.isArray(conv.unreadCount) || !userId) return true;
        const entry = conv.unreadCount.find(u => u.userId === userId);
        return !entry || entry.count === 0;
    });

    return (
        <div className="w-[320px] min-w-[220px] max-w-xs bg-white border-r border-gray-200 flex flex-col h-full " style={{ marginTop: "140px" }}>
            {/* Search Bar */}
            <div className="px-4 py-2 bg-white sticky top-0 z-30 border-b border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search}
                        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <svg
                        className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
            {/* Sidebar Header - Tabs */}
            <div className="flex space-x-2 px-4 py-3 bg-white sticky top-[56px] z-20 border-b border-gray-100">
                <button
                    className={`px-4 py-1 rounded-full font-semibold transition-all ${activeTab === 'all'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    onClick={() => setActiveTab('all')}
                >
                    {t.all}
                </button>
                <button
                    className={`px-4 py-1 rounded-full font-semibold transition-all ${activeTab === 'unread'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    onClick={() => setActiveTab('unread')}
                >
                    {t.unread}
                </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'all' ? (
                    <div className="space-y-2">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const otherUser = conv.otherUser;
                                const isSelected = selectedConversationId === conv._id;
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => handleSelectConversation(conv._id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors rounded-lg ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start" style={{ marginTop: "10px" }}>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown User'}
                                                </h3>
                                                {conv.lastMessage && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">
                                                        {conv.lastMessage.senderId === userId ? (
                                                            <>
                                                                <span className="font-medium">You: </span>
                                                                <span>{conv.lastMessage.content}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="font-medium">
                                                                    {otherUser
                                                                        ? `${otherUser.first_name} ${otherUser.last_name}`
                                                                        : 'Unknown'}
                                                                    :
                                                                </span>
                                                                <span>{conv.lastMessage.content}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end ml-4">
                                                {conv.lastMessage && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatTime(conv.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                                {/* Hiển thị badge số chưa đọc */}
                                                {Array.isArray(conv.unreadCount) && (() => {
                                                    const entry = conv.unreadCount.find(u => u.userId === userId);
                                                    return entry && entry.count > 0 ? (
                                                        <span className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                                            {entry.count}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-2 text-xs text-gray-400 italic">{t.noConversations}</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {unreadConversations.length > 0 ? (
                            unreadConversations.map((conv) => {
                                const otherUser = conv.otherUser;
                                const isSelected = selectedConversationId === conv._id;
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => handleSelectConversation(conv._id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors rounded-lg ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Unknown User'}
                                                </h3>
                                                {conv.lastMessage && (
                                                    <p className="text-sm text-gray-500 truncate mt-1">
                                                        {conv.lastMessage.senderId === userId ? (
                                                            <>
                                                                <span className="font-medium">You: </span>
                                                                <span>{conv.lastMessage.content}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="font-medium">
                                                                    {otherUser
                                                                        ? `${otherUser.first_name} ${otherUser.last_name}`
                                                                        : 'Unknown'}
                                                                    :
                                                                </span>
                                                                <span>{conv.lastMessage.content}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end ml-4">
                                                {conv.lastMessage && (
                                                    <span className="text-xs text-gray-400">
                                                        {formatTime(conv.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                                {/* Hiển thị badge số chưa đọc */}
                                                {Array.isArray(conv.unreadCount) && (() => {
                                                    const entry = conv.unreadCount.find(u => u.userId === userId);
                                                    return entry && entry.count > 0 ? (
                                                        <span className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                                            {entry.count}
                                                        </span>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-2 text-xs text-gray-400 italic">{t.noUnread}</div>
                        )}
                    </div>
                )}
                {filteredConversations.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No conversations found
                    </div>
                )}
            </div>
        </div>
    );
} 